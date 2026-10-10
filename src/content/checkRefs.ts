import { lectures } from './lectures'
import { citations, credits, sources } from './sources'
import { jargon } from './jargon'

/**
 * Everything that can go stale between the copy and its references.
 *
 * A citation is anchored to a phrase of the copy, so editing a sentence can
 * orphan its source without anything failing: `useRich` just finds no place
 * for the marker and drops it. That is the right runtime behaviour and the
 * wrong authoring one, so this names every orphan instead.
 *
 * Returns problems rather than throwing, so the dev build can log them and
 * `npm run check:refs` can fail on them.
 */
export function checkRefs(): string[] {
  const problems: string[] = []
  const cited = new Set<string>()

  for (const [lectureId, beats] of Object.entries(citations)) {
    const lecture = lectures.find((l) => l.id === lectureId)
    if (!lecture) {
      problems.push(`citations: unknown lecture "${lectureId}"`)
      continue
    }
    const text = new Map<string, string>()
    for (const c of lecture.chapters)
      for (const b of c.beats) text.set(b.id, [...b.body, b.aside?.text ?? ''].join('\n'))

    for (const [beatId, list] of Object.entries(beats)) {
      const copy = text.get(beatId)
      if (copy === undefined) {
        problems.push(`${lectureId}/${beatId}: no such beat`)
        continue
      }
      for (const c of list) {
        if (c.at !== undefined && !copy.includes(c.at))
          problems.push(`${lectureId}/${beatId}: anchor not in copy: "${c.at.slice(0, 70)}"`)
        for (const id of c.refs) {
          cited.add(id)
          if (!sources[id]) problems.push(`${lectureId}/${beatId}: unknown source "${id}"`)
        }
      }
    }
  }

  for (const [lectureId, people] of Object.entries(credits))
    for (const p of people) {
      if (p.source) cited.add(p.source)
      if (p.source && !sources[p.source]) problems.push(`${lectureId}: credit "${p.name}" cites unknown "${p.source}"`)
    }

  for (const [id, s] of Object.entries(sources)) {
    // http is allowed: a few archives (bitsavers, old faculty pages) serve
    // nothing else, and a working plain link beats a dead secure one.
    if (!/^https?:\/\//.test(s.url)) problems.push(`source ${id}: not a web url: ${s.url}`)
    if (!cited.has(id)) problems.push(`source ${id}: never cited`)
  }

  const all = lectures
    .flatMap((l) => l.chapters.flatMap((c) => c.beats.flatMap((b) => [...b.body, b.aside?.text ?? ''])))
    .join('\n')
  for (const [key, entry] of Object.entries(jargon))
    for (const form of entry.forms)
      if (!all.includes(form)) problems.push(`jargon ${key}: form "${form}" never appears in the copy`)

  return problems
}
