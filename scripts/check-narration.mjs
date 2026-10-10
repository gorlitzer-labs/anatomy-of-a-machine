#!/usr/bin/env node
/**
 * Static review of narration scripts, for the problems that are invisible when
 * you read the words but obvious when you compare them to the scene.
 *
 * Every check here exists because the mistake was made and shipped:
 *
 *   - a `look` at an id with no glossary entry silently does nothing
 *   - a `look` at the part the beat already focuses cannot show anything, since
 *     the scene has dimmed everything else to nothing, and lifting it on top of
 *     that only washes the material out
 *   - a term printed in the caption while the scene anchors its own callout to
 *     the same part is the same word twice within a couple of hundred pixels
 *
 * Tag distribution is printed rather than judged: whether one delivery tag is
 * being leaned on is a reading decision, and a threshold guessed at here would
 * only be noise pretending to be a rule.
 *
 * Run it before rendering. It costs nothing and the render does not.
 */
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith('.') && !/\.[a-z]+$/i.test(spec)) {
      if (existsSync(new URL(spec + '.ts', ctx.parentURL))) return next(spec + '.ts', ctx)
    }
    return next(spec, ctx)
  },
})

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { lectures } = await import(join(ROOT, 'src/content/lectures.ts'))
const { glossary, roleGlossary } = await import(join(ROOT, 'src/content/glossary.ts'))
const named = (id) => !!(glossary[id] || roleGlossary[id])

const only = process.argv[2]
let problems = 0

for (const L of lectures) {
  if (only && L.id !== only) continue
  const beats = L.chapters.flatMap((c) => c.beats)
  const scripted = beats.filter((b) => b.say?.length)
  if (!scripted.length) continue

  const notes = []
  const tags = {}
  let lines = 0, chars = 0

  for (const c of L.chapters) {
    for (const b of c.beats) {
      for (const say of b.say ?? []) {
        const text = typeof say === 'string' ? say : say.text
        lines++
        chars += text.length
        const tag = text.match(/^\[([\w-]+)\]/)
        if (tag) tags[tag[1]] = (tags[tag[1]] || 0) + 1
        if (typeof say === 'string' || !say.look) continue
        if (!named(say.look)) notes.push(`${b.id}: look='${say.look}' names nothing in either glossary`)
        if (b.focus && say.look === b.focus) notes.push(`${b.id}: look='${say.look}' is the beat's own focus — no lift, scene already isolated it`)

        if (say.variant && !b.toggle) notes.push(`${b.id}: variant cue on a beat with no toggle`)
      }
    }
  }

  if (scripted.length !== beats.length) {
    notes.push(`only ${scripted.length} of ${beats.length} beats scripted — the syllabus will not call this narrated`)
  }

  console.log(`\n${L.number}. ${L.title} — ${lines} lines, ${chars.toLocaleString()} characters`)
  console.log(`   tags: ${Object.entries(tags).map(([k, v]) => `${k}×${v}`).join(' ') || 'none'}`)
  if (!notes.length) console.log('   \x1b[32mnothing to flag\x1b[0m')
  for (const n of notes) {
    console.log(`   \x1b[33m!\x1b[0m ${n}`)
    problems++
  }
}

console.log(problems ? `\n${problems} thing(s) to look at.` : '\nClean.')
