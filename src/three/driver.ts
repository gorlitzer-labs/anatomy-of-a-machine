import * as THREE from 'three'
import { advanceDeck, beatAt, chapterAt, deck, moveProgress, stepsFor, useDeck } from '../deck/deck'
import { clamp, clamp01, lerp } from '../lib/math'
import { clearHover } from './hover'
import type { SceneId } from '../content/types'

/**
 * Per-frame interpolated scene state, derived from the deck position.
 *
 * Computed lazily and memoised on a frame stamp, so it does not matter which
 * component asks for it first or how many ask — the interpolation runs exactly
 * once per rendered frame. This sidesteps having to reason about R3F's
 * `useFrame` priority ordering (where a priority > 0 silently takes over the
 * render loop).
 */
export type DriverState = {
  stamp: number
  scene: SceneId
  chapterIndex: number
  /** 0..1 explosion amount, interpolated across steps. */
  explode: number
  /** Currently spotlit part id, or null. */
  focus: string | null
  /**
   * Which animation to run. Defaults to `focus`, but a beat can override it to
   * make a different argument about the same object.
   */
  motion: string | null
  /**
   * Seconds since the beat currently on screen arrived.
   *
   * Anything that happens *once* — a boot, a pipeline flush, a wafer exposure,
   * a deadline being missed, a cell wearing out — must be scheduled on this and
   * not on the page clock. A one-shot event on a free-running modulo is only
   * visible to a reader who happens to arrive at the right moment in its cycle,
   * so copy that says "watch X" is, in the worst cases here, telling most
   * readers to watch something that already happened.
   *
   * Steady states are the exception and should stay on the page clock: a clock
   * tick, orbiting traffic, a fan. Those have no beginning to miss.
   */
  beatTime: number
  /**
   * Which side of a two-state beat the reader has selected.
   *
   * Always 'a' unless the beat declares a toggle and the reader pressed the
   * other button, so scenes can read it unconditionally.
   */
  variant: 'a' | 'b'
  /** How strongly focus is applied (fades across the transition). */
  focusStrength: number
  /** Hide non-focused parts rather than dimming them. */
  isolate: boolean
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
}

const posA = new THREE.Vector3()
const posB = new THREE.Vector3()
const dirB = new THREE.Vector3()
const tgtA = new THREE.Vector3()
const tgtB = new THREE.Vector3()

/** Which beat `beatStart` refers to, as `lecture:index`. */
let beatKey = ''
let beatStart = 0

export const driver: DriverState = {
  stamp: -1,
  scene: 'cpu',
  chapterIndex: 0,
  explode: 0,
  focus: null,
  motion: null,
  beatTime: 0,
  variant: 'a',
  focusStrength: 0,
  isolate: false,
  position: new THREE.Vector3(0, 3.4, 8.2),
  target: new THREE.Vector3(0, 0.2, 0),
  fov: 38,
}

export function updateDriver(stamp: number): DriverState {
  if (driver.stamp === stamp) return driver
  driver.stamp = stamp

  advanceDeck(stamp)

  const lecture = deck.lecture
  const steps = stepsFor(lecture)
  if (!steps.length) return driver

  const last = steps.length - 1
  const index = Math.min(Math.floor(deck.current), last)
  const blend = clamp01(deck.current - index)
  const a = beatAt(lecture, index)
  const b = beatAt(lecture, Math.min(index + 1, last)) ?? a
  if (!a || !b) return driver

  /* ---- the move, as opposed to the path ----

     Two different clocks run here and conflating them was a real bug.

     The *path* is `deck.current` sweeping continuously from one beat index to
     another; the camera rides it, which is what makes a jump across four
     chapters read as a flight rather than a cut.

     The *move* is the single gesture the reader made: from one beat, to one
     other beat, however far apart. Everything discrete belongs to the move —
     which scene renders, what is spotlit, which copy is on screen.

     Keying the discrete state to the path instead meant that jumping to a
     chapter six beats away stepped through every beat in between at roughly
     twenty per second: five scene layers on screen at once, each still
     animating, and the copy card remounting for every beat it passed. That is
     the "all the animations come through at once" bug, and it was invisible
     when stepping one beat at a time because for a single step the two clocks
     agree exactly. */
  const move = moveProgress(stamp)
  const fromIndex = clamp(Math.round(deck.from), 0, last)
  const toIndex = clamp(deck.to, 0, last)
  const nearIndex = move < 0.5 ? fromIndex : toIndex
  const near = beatAt(lecture, nearIndex) ?? a

  const chapter = chapterAt(lecture, nearIndex)
  const scene = chapter?.scene ?? driver.scene
  /* Leaving a chapter takes its tooltip with it. The card names a piece of
     geometry, and that geometry is about to shrink away — a pinned one would
     otherwise sit there labelling something that is no longer on screen, and on
     touch, where the card has to be dismissed by hand, it would be labelling
     the wrong chapter until the reader thought to close it. */
  if (scene !== driver.scene) clearHover(true)
  driver.scene = scene
  driver.chapterIndex = steps[nearIndex]?.chapter ?? 0
  driver.explode = lerp(a.explode, b.explode, blend)

  posA.fromArray(a.camera.position)
  posB.fromArray(b.camera.position)
  tgtA.fromArray(a.camera.target)
  tgtB.fromArray(b.camera.target)

  // Slerp-ish orbit: interpolate on a sphere around the origin rather than
  // straight-lining through the model, which would clip the camera through the
  // geometry on wide swings.
  const ra = posA.length()
  const rb = posB.length()
  dirB.copy(posB).normalize()
  driver.position.copy(posA).normalize().lerp(dirB, blend).normalize()
  driver.position.multiplyScalar(lerp(ra, rb, blend))

  driver.target.copy(tgtA).lerp(tgtB, blend)
  driver.fov = lerp(a.camera.fov ?? 38, b.camera.fov ?? 38, blend)

  driver.focus = near.focus ?? null
  driver.motion = near.motion ?? near.focus ?? null
  // Focus fades out through the middle of the transition so nothing pops. On
  // the move, not the path: on the path a multi-beat jump strobed every part in
  // the scene once per beat it swept past.
  driver.focusStrength = Math.abs(move - 0.5) * 2
  driver.isolate = near.isolate ?? false

  /* Beat-local time. Keyed on the beat that is *shown*, so it resets at the
     midpoint of the transition — the same moment the copy swaps — rather than
     when the reader pressed the key. A one-shot animation therefore starts as
     its own text appears, which is the only arrangement in which "watch this"
     is a reliable instruction. Re-entering a beat restarts it, deliberately:
     stepping back to see something again has to actually show it again. */
  const key = `${lecture}:${nearIndex}`
  if (key !== beatKey) {
    beatKey = key
    beatStart = stamp
  }
  driver.beatTime = stamp - beatStart

  const store = useDeck.getState()
  if (store.shown !== nearIndex) store.setShown(nearIndex)
  /* Re-read rather than using `store`: `setShown` resets the variant, and the
     snapshot above was taken before that happened — so on the frame a reader
     steps to a new beat the driver would hand the scene the *previous* beat's
     toggle state for exactly one frame. */
  driver.variant = useDeck.getState().variant

  return driver
}
