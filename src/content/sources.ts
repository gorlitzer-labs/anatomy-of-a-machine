/**
 * Where the course's claims come from, and who the ideas belong to.
 *
 * Kept out of the beat files on purpose. A beat is written to be read and
 * spoken; a reference list is bookkeeping, and threading it through every
 * `body` would make the copy harder to edit for the sake of a footer. So the
 * registry lives here, and beats are joined to it by `lecture → beat id`.
 * Beat ids are only unique inside a lecture (`die`, `pipe` and `budget` each
 * appear in more than one), which is why the key has two levels.
 *
 * Every entry here was opened and read against the claim it supports. A
 * source nobody checked is worse than none: it lends the sentence an
 * authority it has not earned. Anything that could not be confirmed stays out.
 */

export type SourceKind =
  | 'paper'
  | 'book'
  | 'standard'
  | 'datasheet'
  | 'docs'
  | 'patent'
  | 'article'
  | 'museum'
  | 'course'

export type Source = {
  title: string
  /** As they should be printed: "Hennessy & Patterson", "Intel". */
  authors?: string
  year?: number
  /** Journal, publisher, conference or site. */
  venue?: string
  url: string
  kind: SourceKind
}

/** A person the course owes an idea to. */
export type Credit = {
  name: string
  /** One line: what they did that this lecture stands on. */
  for: string
  source?: string
}


/**
 * One claim in a beat, and what backs it.
 *
 * `at` is a phrase copied verbatim from the beat's `body` or `aside` text; the
 * marker goes straight after it, so the number sits on the claim rather than
 * trailing the paragraph. Left out, the marker closes the last paragraph. A
 * phrase that no longer appears — the copy was edited under it — is reported
 * in the dev build by `checkCitations` rather than silently dropped.
 */
export type Citation = { at?: string; refs: string[] }

/*
 * The data itself lives in `references.ts`: `sources` (id → source),
 * `citations` (lecture id → beat id → claims, in reading order) and `credits`
 * (lecture id → the people behind it).
 */
import { citations, credits, sources } from './references'
export { citations, credits, sources }

export const citationsFor = (lecture: string, beat: string): Citation[] =>
  citations[lecture]?.[beat] ?? []

/** Every source a lecture cites, once each, in first-cited order. */
export function lectureSources(lecture: string): [string, Source][] {
  const seen = new Set<string>()
  const out: [string, Source][] = []
  const push = (id: string) => {
    const s = sources[id]
    if (s && !seen.has(id)) {
      seen.add(id)
      out.push([id, s])
    }
  }
  for (const beat of Object.values(citations[lecture] ?? {}))
    for (const c of beat) c.refs.forEach(push)
  for (const c of credits[lecture] ?? []) if (c.source) push(c.source)
  return out
}

/** "Hennessy & Patterson, 2017" — the short form a card has room for. */
export const shortCite = (s: Source) =>
  [s.authors ?? s.venue, s.year].filter(Boolean).join(', ')
