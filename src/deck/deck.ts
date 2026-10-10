import { create } from 'zustand'
import { lectures } from '../content/lectures'
import { clamp, clamp01, lerp, smootherstep } from '../lib/math'
import type { Beat, Chapter } from '../content/types'

/**
 * Discrete step navigation.
 *
 * This replaces the scroll layer. Everything used to be derived from the
 * document scroll position, which meant the geometry of the page (tall spacer
 * sections, `offsetTop`, viewport height) *was* the timeline — it had to be
 * measured, re-measured on resize and after fonts loaded, and mirrored by hand
 * in two places that could drift apart.
 *
 * Here the timeline is an integer. `to` is where the reader asked to be, and
 * `current` eases toward it. Nothing reads layout, nothing needs refreshing,
 * and a lecture boundary is just a different array.
 */

export type Step = {
  chapter: number
  beat: number
  chapterId: string
  beatId: string
}

/**
 * Flat, ordered list of every beat in every lecture, built once at module load.
 *
 * A step crossing a chapter boundary is not special here, which is the point:
 * the camera glides from the last beat of one chapter into the first beat of
 * the next exactly as it does between two beats of the same chapter. Under the
 * scroll model that boundary was a discontinuity that had to be damped away.
 */
const decks: Step[][] = lectures.map((lecture) =>
  lecture.chapters.flatMap((chapter, ci) =>
    chapter.beats.map((beat, bi) => ({
      chapter: ci,
      beat: bi,
      chapterId: chapter.id,
      beatId: beat.id,
    })),
  ),
)

export const stepsFor = (lecture: number): Step[] => decks[lecture] ?? []

export function beatAt(lecture: number, index: number): Beat | null {
  const steps = stepsFor(lecture)
  const step = steps[clamp(index, 0, steps.length - 1)]
  if (!step) return null
  return lectures[lecture]?.chapters[step.chapter]?.beats[step.beat] ?? null
}

export function chapterAt(lecture: number, index: number): Chapter | null {
  const steps = stepsFor(lecture)
  const step = steps[clamp(index, 0, steps.length - 1)]
  if (!step) return null
  return lectures[lecture]?.chapters[step.chapter] ?? null
}

/* ---------------- tween ---------------- */

/**
 * Mutable position, read every frame by the 3D driver.
 *
 * Deliberately not React state, for the same reason the scroll store wasn't:
 * this changes every frame during a move and the WebGL loop is the only thing
 * that needs it that often.
 */
export const deck = {
  lecture: 0,
  /** Eased position in the current lecture's step list. */
  current: 0,
  from: 0,
  to: 0,
  startedAt: 0,
  /**
   * Set when a move is requested. The driver stamps `startedAt` on the next
   * frame, because `go()` is called from DOM event handlers which have no
   * access to the render clock — and using `performance.now()` here would put
   * the tween on a different time base than the scene it drives.
   */
  pending: false,
}

/** Long enough to read as a camera move, short enough not to feel like waiting. */
const DURATION = 0.85

/** Advances the tween. Called once per frame from the driver. */
export function advanceDeck(stamp: number) {
  if (deck.pending) {
    deck.startedAt = stamp
    deck.pending = false
  }
  if (deck.from === deck.to) {
    deck.current = deck.to
    return
  }
  const t = clamp01((stamp - deck.startedAt) / DURATION)
  deck.current = lerp(deck.from, deck.to, smootherstep(t))
  if (t >= 1) {
    deck.from = deck.to
    deck.current = deck.to
  }
}

/** 0..1 progress through the current move — 1 while settled. */
export function moveProgress(stamp: number) {
  if (deck.from === deck.to) return 1
  return clamp01((stamp - deck.startedAt) / DURATION)
}

function seek(to: number) {
  const count = stepsFor(deck.lecture).length
  const next = clamp(to, 0, Math.max(count - 1, 0))
  if (next === deck.to) return next
  deck.from = deck.current
  deck.to = next
  deck.pending = true
  return next
}

/* ---------------- react-visible state ---------------- */

type DeckStore = {
  view: 'syllabus' | 'lecture'
  lecture: number
  /** Where the reader asked to be. Drives the counter and rail immediately. */
  index: number
  /**
   * Which beat's copy is on screen. Flips at the midpoint of a move so the text
   * swaps while the camera is travelling rather than after it has arrived.
   */
  shown: number
  /**
   * Which side of a two-state beat the reader is looking at.
   *
   * The course is built on trades, and a dozen beats state a comparison — DDR
   * against PCIe, polling against interrupts, one big core against two small —
   * that the reader could previously only see as "show A, step, show B, from a
   * different camera angle". That is the one arrangement in which a ratio
   * cannot be judged. A beat that declares `toggle` gets a control, and the
   * scene reads `driver.variant`.
   */
  variant: 'a' | 'b'
  enter: (lecture: number, index?: number) => void
  exit: () => void
  go: (delta: number) => void
  jump: (index: number) => void
  jumpChapter: (chapter: number) => void
  setShown: (shown: number) => void
  setVariant: (variant: 'a' | 'b') => void
}

export const useDeck = create<DeckStore>((set, get) => ({
  view: 'syllabus',
  lecture: 0,
  index: 0,
  shown: 0,
  variant: 'a',

  enter: (lecture, index = 0) => {
    if (!stepsFor(lecture).length) return
    deck.lecture = lecture
    // Entering is a cut, not a move: the previous lecture's framing has nothing
    // to do with this one, so easing between them would read as drift.
    deck.current = deck.from = deck.to = clamp(index, 0, stepsFor(lecture).length - 1)
    deck.pending = false
    set({ view: 'lecture', lecture, index: deck.to, shown: deck.to, variant: 'a' })
  },

  exit: () => set({ view: 'syllabus' }),

  go: (delta) => {
    const index = seek(get().index + delta)
    set({ index })
  },

  jump: (index) => set({ index: seek(index) }),

  jumpChapter: (chapter) => {
    const at = stepsFor(deck.lecture).findIndex((s) => s.chapter === chapter)
    if (at >= 0) set({ index: seek(at) })
  },

  /* Stepping resets the toggle. A reader who left a beat on its second state
     and came back to a different beat would otherwise see that beat's B side
     first, with the copy describing A. */
  setShown: (shown) => set((s) => (s.shown === shown ? s : { ...s, shown, variant: 'a' })),

  setVariant: (variant) => set((s) => (s.variant === variant ? s : { ...s, variant })),
}))
