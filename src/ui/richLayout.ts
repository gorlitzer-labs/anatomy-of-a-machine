import { create } from 'zustand'
import { findJargon, planJargon } from '../content/jargon'
import { lectures } from '../content/lectures'
import type { Citation } from '../content/sources'

/**
 * The layout half of the in-text notes: where each underline and each marker
 * goes, and which note is open. No React in here, so `Rich.tsx` stays a file
 * of components and fast refresh keeps working on it.
 */

export type Note =
  | { kind: 'term'; key: string; rect: DOMRect; pinned: boolean }
  | { kind: 'cite'; n: number; label: string; refs: string[]; rect: DOMRect; pinned: boolean }

type NoteState = {
  note: Note | null
  show: (note: Note) => void
  hide: (force?: boolean) => void
}

let closing = 0

export const useNote = create<NoteState>((set, get) => ({
  note: null,
  show: (note) => {
    clearTimeout(closing)
    set({ note })
  },
  // Hover-out waits a moment, so the pointer can cross the gap into the card
  // and reach its link; a pinned card only closes on purpose.
  hide: (force) => {
    clearTimeout(closing)
    if (force) return set({ note: null })
    if (get().note?.pinned) return
    closing = window.setTimeout(() => set({ note: null }), 180)
  },
}))

export const keep = () => clearTimeout(closing)

/** Where a citation's marker lands in one paragraph, if it lands there at all. */
function markerAt(text: string, at: string | undefined, last: boolean): number {
  if (at === undefined) return last ? text.length : -1
  const i = text.indexOf(at)
  if (i < 0) return -1
  let end = i + at.length
  // Superscripts sit after the punctuation that closes the clause, the way
  // print does it, not between a word and its comma.
  while (end < text.length && /[.,;:)’"”]/.test(text[end])) end++
  return end
}

/** A run of plain copy, an underlined term, or a citation marker. */
export type Segment =
  | string
  | { term: string; text: string }
  /** `lead` is the word the marker follows, kept with it so they never wrap apart. */
  | { cite: number; label: string; refs: string[]; lead: string }

type Insert =
  | { at: number; end: number; type: 'term'; key: string }
  | { at: number; end: number; type: 'cite'; n: number; refs: string[] }

const plans = new Map<string, Map<string, Set<string>>>()
const termsFor = (lecture: string, beat: string) => {
  let plan = plans.get(lecture)
  if (!plan) {
    plan = planJargon(lecture, lectures.find((l) => l.id === lecture)?.chapters ?? [])
    plans.set(lecture, plan)
  }
  return plan.get(beat) ?? new Set<string>()
}

/**
 * Lays out every paragraph of a card. Takes all of them at once because
 * numbering and "first occurrence only" are properties of the card, not of a
 * paragraph.
 */
export function layoutRich(
  paragraphs: string[],
  cites: Citation[],
  lecture: string,
  beat: string,
  /** Lecture-wide number of a source, so a card's ³ is item 3 in the list. */
  number: (id: string) => number | undefined,
): Segment[][] {
  const seen = new Set<string>()
  const placed = new Set<Citation>()
  let n = 0

  return paragraphs.map((text, pi) => {
    const inserts: Insert[] = findJargon(text, seen, lecture, termsFor(lecture, beat)).map((h) => ({
      at: h.start,
      end: h.end,
      type: 'term',
      key: h.key,
    }))
    const marks: Insert[] = []
    for (const c of cites) {
      if (placed.has(c)) continue
      let at = markerAt(text, c.at, pi === paragraphs.length - 1)
      if (at < 0) continue
      // Never split an underlined term; the number goes after it.
      for (const t of inserts) if (at > t.at && at < t.end) at = t.end
      placed.add(c)
      marks.push({ at, end: at, type: 'cite', n: 0, refs: c.refs })
    }
    const all = [...inserts, ...marks].sort((a, b) => a.at - b.at || a.end - b.end)
    for (const m of all) if (m.type === 'cite') m.n = ++n

    const out: Segment[] = []
    let pos = 0
    for (const m of all) {
      if (m.at > pos) out.push(text.slice(pos, m.at))
      if (m.type === 'term') {
        out.push({ term: m.key, text: text.slice(m.at, m.end) })
        pos = m.end
      } else {
        const label = m.refs.map(number).filter(Boolean).join(',')
        if (label) {
          let lead = ''
          const prev = out[out.length - 1]
          if (typeof prev === 'string') {
            lead = /\S*$/.exec(prev)?.[0] ?? ''
            if (lead) out[out.length - 1] = prev.slice(0, prev.length - lead.length)
          }
          out.push({ cite: m.n, label, refs: m.refs, lead })
        }
        pos = Math.max(pos, m.at)
      }
    }
    if (pos < text.length) out.push(text.slice(pos))
    return out
  })
}

