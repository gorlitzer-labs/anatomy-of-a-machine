import { create } from 'zustand'
import { glossary, roleGlossary, type GlossaryEntry } from '../content/glossary'

/**
 * What the pointer is currently over.
 *
 * Split deliberately in two. *Which* thing is hovered changes rarely and needs
 * to reach React, so it is a store. *Where the pointer is* changes on every
 * mouse move, so it is a plain mutable object that the tooltip reads on its own
 * animation frame — routing that through state would re-render the tree
 * continuously while someone merely moves the mouse across the model.
 */
export const pointer = { x: 0, y: 0 }

type HoverStore = {
  entry: GlossaryEntry | null
  /** Id of the hovered part, so the 3D layer can highlight it. */
  id: string | null
  /**
   * Touch has no hover, so a tap *pins* the card until it is dismissed.
   * Without this the whole glossary is unreachable on a phone.
   */
  pinned: boolean
  /**
   * `undefined` derives the card from the glossary; an explicit `null` means
   * highlight this part and show no card at all.
   */
  set: (id: string | null, entry?: GlossaryEntry | null, pinned?: boolean) => void
}

export const useHover = create<HoverStore>((set) => ({
  entry: null,
  id: null,
  pinned: false,
  set: (id, entry, pinned = false) =>
    set((s) => {
      // `??` would collapse null into the glossary lookup, and null is how a
      // caller asks for a highlight with no card.
      const next = entry === undefined ? ((id ? glossary[id] : null) ?? null) : entry
      if (s.id === id && s.entry === next && s.pinned === pinned) return s
      return { ...s, id, entry: next, pinned }
    }),
}))

/** Mutable mirror of the hovered id, for `useFrame` code that must not subscribe. */
export const hovered = { id: null as string | null }

useHover.subscribe((s) => {
  hovered.id = s.id
})

export function hoverPart(id: string, pinned = false) {
  if (!glossary[id]) return false
  useHover.getState().set(id, undefined, pinned)
  return true
}

/**
 * What the *narrator* is pointing at. Deliberately not the same slot as
 * `hovered`.
 *
 * These are two acts by two different parties, and they were sharing one
 * variable, so whichever wrote last won. Point at a transistor while she is
 * naming a different one and her highlight vanished mid-sentence; look away and
 * yours did. Rationing the slot only chooses which of the two gets broken.
 *
 * So they no longer share it. The reader's pointer keeps `hovered` and the card
 * that follows the cursor. The narrator gets this, which lifts the part and
 * puts its name in the caption. Both can be lit at once, labelled separately,
 * because both are true: you are looking at one thing and she is showing you
 * another.
 */
export const cued = { id: null as string | null }

export function cuePart(id: string) {
  cued.id = id
  return true
}

export function clearCue() {
  cued.id = null
}

/**
 * Names something with an entry the scene built rather than one the glossary
 * holds.
 *
 * For anything whose name carries a number the scene also animates — the memory
 * ladder's tiers, whose latency *is* the length of the trip on screen — a
 * hand-written glossary line is a second copy of that number, free to drift
 * from the one the animation is using. This lets the tooltip read the same
 * table the geometry is laid out from.
 */
export function hoverWith(id: string, entry: GlossaryEntry, pinned = false) {
  useHover.getState().set(id, entry, pinned)
  return true
}

export function hoverRole(id: string, role: string, pinned = false) {
  const entry = roleGlossary[role]
  if (!entry) return false
  useHover.getState().set(id, entry, pinned)
  return true
}

/** Ignores the request when a tap has pinned a card, unless forced. */
export function clearHover(force = false) {
  if (!force && useHover.getState().pinned) return
  useHover.getState().set(null)
}

/**
 * Set by a part when it answers a tap, and read by the canvas-level listener
 * that runs afterwards — a tap that reached no part means "dismiss".
 */
export const tapped = { at: 0 }

export function markTapped() {
  tapped.at = performance.now()
}
