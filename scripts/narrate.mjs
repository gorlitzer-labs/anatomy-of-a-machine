#!/usr/bin/env node
/**
 * Renders every `say` line to its own audio file, ahead of time.
 *
 * The site is a `dist/` directory served as static assets from the edge. There
 * is no server to hold an API key, so synthesising in the browser would mean shipping one in the
 * bundle. Rendering here instead keeps the key on this machine, costs nothing
 * at runtime, and makes the audio a static asset like any other.
 *
 * One file per *line*, not per beat, because a line can carry a cue — look at
 * the drain, turn the package, pull in on the tensor cores — and the cue has to
 * fire exactly when that line starts. Separate files make that exact rather
 * than estimated. It also means re-recording a sentence costs a sentence.
 *
 *   node scripts/narrate.mjs --voices            # female voices on the account
 *   node scripts/narrate.mjs --audition a,b,c    # the same lines in each voice
 *   node scripts/narrate.mjs --dry               # work and cost, nothing sent
 *   node scripts/narrate.mjs --prune             # forget recordings the script has outgrown
 *   ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=... npm run narrate
 *
 * A different narrator reads each lecture, rotating through `CAST`. One voice
 * per lecture, asides included — the hand-over between lectures is the only
 * place a voice ever changes. `ELEVENLABS_VOICE_ID` overrides the rotation for
 * a different account; `ELEVENLABS_ASIDE_VOICE_ID` re-enables a second reader
 * for the aside lines.
 *
 * Re-runs are hashed per line against the exact text, voice, model and
 * settings, so changing one sentence re-renders one file rather than re-billing
 * the lecture.
 */

import { registerHooks } from 'node:module'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/* The content tree is TypeScript importing its siblings without extensions.
   Node strips the types by itself; this only teaches it to find the files. */
registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith('.') && !/\.[a-z]+$/i.test(spec)) {
      if (existsSync(new URL(spec + '.ts', ctx.parentURL))) return next(spec + '.ts', ctx)
    }
    return next(spec, ctx)
  },
})

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'narration')
const MANIFEST = join(OUT, 'manifest.json')
const API = 'https://api.elevenlabs.io'

const args = process.argv.slice(2)
const has = (flag) => args.includes(flag)
const opt = (flag, fallback) => {
  const i = args.indexOf(flag)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback
}

const DRY = has('--dry')
const FORCE = has('--force')
/* Drop out-of-date recordings from the manifest without rendering — needs no key. */
const PRUNE = has('--prune')
const ONLY = opt('--lecture', null)
const KEY = process.env.ELEVENLABS_API_KEY

/**
 * `eleven_v3` is the model meant for documentary narration — the one that reads
 * sentence structure and audio tags rather than reading evenly. Switch to
 * `--model eleven_multilingual_v2` if a run comes back inconsistent between
 * lines: v2 is duller and more predictable, and across 130-odd separate files
 * that can be the right trade.
 */
const MODEL = opt('--model', 'eleven_v3')
/* 64 kbit/s is where speech stops improving audibly and files stay committable. */
const FORMAT = opt('--format', 'mp3_44100_64')
const SPEED = Number(opt('--speed', '1'))
/* v3's "Natural" stability — closest to the voice as recorded. Lower is more
   expressive and less repeatable; higher is flatter and safer. */
const STABILITY = Number(opt('--stability', '0.5'))

/**
 * No default voice, on purpose.
 *
 * The first version of this script hardcoded one from memory, which is exactly
 * the wrong way to pick something whose only real test is listening to it. Run
 * `--voices` to see what the account has, `--audition` to hear a few of them
 * reading this course's own words, then set `ELEVENLABS_VOICE_ID`.
 */
const VOICE = opt('--voice', process.env.ELEVENLABS_VOICE_ID || null)

/**
 * The second voice, for lines the course files under `aside`.
 *
 * Optional. With none set, every line is spoken by the host and the lecture is
 * simply single-narrator — which matters because the *role* lives in the
 * content while the *casting* lives here, so somebody rendering this repo with
 * one voice id should get a complete lecture rather than a broken one.
 */
const ASIDE_VOICE = opt('--aside-voice', process.env.ELEVENLABS_ASIDE_VOICE_ID || null)

/**
 * The narrators, in rotation order.
 *
 * A different voice fronts each lecture. Within a lecture the narrator never
 * changes — a lecture is one continuous argument that calls back to itself —
 * but a lecture boundary is a genuine break, so it is a fair place to hand over.
 *
 * Rotating rather than drawing at random, which matters more than it sounds:
 * every line's hash includes the voice that spoke it, so a random draw would
 * produce different voices on every run and re-bill the entire course each time.
 * The rotation looks varied and costs nothing to re-run.
 *
 * Ordered so the accents alternate, which makes consecutive lectures open in a
 * different one — the hand-over reads as deliberate rather than as something
 * having gone wrong.
 *
 * Only voices ElevenLabs classes as `informative_educational` are in here. The
 * account carries fifteen others that are excellent and wrong for this: a sassy
 * social-media read does not survive a chapter on brake controllers.
 */
const CAST = [
  { name: 'Lily', id: 'pFZP5JQG7iQjIQuC4Bku', accent: 'british' },
  { name: 'Bella', id: 'hpp4J3VqNfWAUOO0d1Us', accent: 'american' },
  { name: 'Alice', id: 'Xb7hH8MSUJpSbSDYk0k2', accent: 'british' },
  { name: 'Matilda', id: 'XrExE9yKIg1WjnnlVkGX', accent: 'american' },
]

/**
 * Who narrates a given lecture. Keyed on its number, so the answer never moves.
 *
 * One voice reads the whole lecture, asides included. An earlier version gave
 * the `aside` lines a second voice, and that was right when every lecture
 * shared one narrator — the change of voice was the only thing marking the
 * change of register. Once each lecture has its own narrator that no longer
 * holds: a second voice inside a lecture competes with the hand-over between
 * lectures, and the listener cannot tell which boundary they just heard. So the
 * rotation is now the only place a voice ever changes, and it means something.
 *
 * The `aside` role stays in the content because it still marks a register, and
 * `--aside-voice` re-enables a second reader for anyone who wants one.
 */
function castFor(lectureNumber) {
  return CAST[(lectureNumber - 1) % CAST.length]
}

/** Role to voice id, for one lecture. Explicit flags win over the rotation. */
function voiceFor(role, lectureNumber) {
  if (role === 'aside' && ASIDE_VOICE) return ASIDE_VOICE
  return VOICE || castFor(lectureNumber).id
}

const settings = { stability: STABILITY, use_speaker_boost: true, speed: SPEED }

async function api(path, init = {}) {
  const res = await fetch(API + path, {
    ...init,
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', ...(init.headers || {}) },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 300)}`)
  return res
}

function requireKey() {
  if (KEY) return
  console.error('ELEVENLABS_API_KEY is not set. `--dry` works without it.')
  process.exit(1)
}

/* ---------------- --voices ---------------- */

if (has('--voices')) {
  requireKey()
  /* The course is narrated by a woman, so this filters to female voices by
     default. `--all-genders` lifts it. */
  const gender = has('--all-genders') ? '' : '&gender=female'
  const { voices } = await (await api(`/v2/voices?page_size=100${gender}`)).json()
  console.log(`${voices.length} voices${gender ? ' (female)' : ''} on this account:\n`)
  for (const v of voices) {
    const labels = Object.entries(v.labels || {})
      .map(([k, val]) => `${k}=${val}`)
      .join(' ')
    console.log(`  ${v.voice_id}  ${(v.name || '').padEnd(22)} ${(v.category || '').padEnd(14)} ${labels}`)
  }
  console.log('\nPick a few, hear them with --audition <id>,<id>, then set ELEVENLABS_VOICE_ID.')
  process.exit(0)
}

/* ---------------- --audition ---------------- */

/**
 * The same three lines in each candidate voice.
 *
 * Lines from the actual course rather than a generic sample, because what
 * matters is how a voice handles *this* register: a short declarative opener, a
 * number read aloud, and a turn into a payoff. The third is the one that
 * separates them — most voices flatten the beat before "It's really a cooling
 * number in disguise", and that pause is the whole joke.
 */
const AUDITION = [
  'Lift that off, and here it is. The die.',
  'A modern chip can push two hundred and fifty watts through an area smaller than a stamp.',
  "And silicon starts misbehaving at around a hundred degrees. So every performance number you've ever seen? It's really a cooling number in disguise.",
]

if (has('--audition')) {
  requireKey()
  const ids = (opt('--audition', '') || '').split(',').filter(Boolean)
  if (!ids.length) {
    console.error('Usage: --audition <voice_id>[,<voice_id>...]   (ids come from --voices)')
    process.exit(1)
  }
  const dir = join(ROOT, 'audition')
  mkdirSync(dir, { recursive: true })
  for (const id of ids) {
    for (const [i, text] of AUDITION.entries()) {
      const res = await api(`/v1/text-to-speech/${id}?output_format=${FORMAT}`, {
        method: 'POST',
        body: JSON.stringify({ text, model_id: MODEL, voice_settings: settings }),
      })
      const file = join(dir, `${id}-${i + 1}.mp3`)
      writeFileSync(file, Buffer.from(await res.arrayBuffer()))
      console.log(`wrote ${file}`)
    }
  }
  console.log(`\n${ids.length} voice(s) in ./audition — listen, then set ELEVENLABS_VOICE_ID.`)
  process.exit(0)
}

/* ---------------- work list ---------------- */

const { lectures } = await import(join(ROOT, 'src/content/lectures.ts'))

const jobs = []
for (const lecture of lectures) {
  /* Accepts the id or the number. The file a lecture lives in does not always
     match its id — lecture 10 is `code.ts` but `compile` — and a mistyped
     filter silently renders nothing, which reads exactly like "already up to
     date". */
  if (ONLY && lecture.id !== ONLY && String(lecture.number) !== ONLY) continue
  for (const chapter of lecture.chapters) {
    for (const beat of chapter.beats) {
      for (const [i, say] of (beat.say ?? []).entries()) {
        const text = (typeof say === 'string' ? say : say.text).trim()
        if (!text) continue
        const role = (typeof say === 'string' ? undefined : say.voice) ?? 'host'
        const voice = voiceFor(role, lecture.number)
        jobs.push({
          key: `${lecture.id}/${chapter.id}/${beat.id}/${i}`,
          file: `${lecture.id}/${chapter.id}-${beat.id}-${i}.mp3`,
          text,
          role,
          voice,
          lecture: lecture.number,
          // The voice is in the hash, so re-casting one role re-renders only
          // that role's lines instead of the whole lecture.
          hash: createHash('sha256')
            .update(`${voice}|${MODEL}|${FORMAT}|${JSON.stringify(settings)}|${text}`)
            .digest('hex')
            .slice(0, 16),
        })
      }
    }
  }
}

if (ONLY && !jobs.length) {
  console.error(`No lecture matches --lecture ${ONLY}. Ids: ${lectures.map((l) => `${l.number}=${l.id}`).join(', ')}`)
  process.exit(1)
}

const manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
  : { voice: VOICE, model: MODEL, beats: {} }

const stale = jobs.filter((j) => {
  if (FORCE) return true
  const prev = manifest.beats[j.key]
  return !prev || prev.hash !== j.hash || !existsSync(join(OUT, prev.file))
})

/* A recording is only kept while it still says what the script says. The
   player looks lines up by key, not by text, so an entry left behind for an
   edited line keeps playing the old words — and when a beat gains or loses a
   line, the keys shift and a recording plays under a different sentence
   altogether. So before anything is rendered, every entry that no longer
   matches is dropped: a run that then stops on a quota leaves those lines
   silent, paced by reading speed with the caption on screen, which is the
   player's designed fallback, rather than voicing a claim the copy has since
   corrected. Scoped to the lectures in this run, so `--lecture` never prunes
   another lecture's record. */
function prune() {
  const live = new Set(jobs.map((j) => j.key))
  const scope = new Set(jobs.map((j) => j.key.split('/')[0]))
  const staleKeys = new Set(stale.map((j) => j.key))
  let dropped = 0
  for (const key of Object.keys(manifest.beats)) {
    if (!scope.has(key.split('/')[0])) continue
    if (staleKeys.has(key) || !live.has(key)) {
      delete manifest.beats[key]
      dropped++
    }
  }
  return dropped
}

const chars = stale.reduce((n, j) => n + j.text.length, 0)
if (!VOICE) {
  const used = [...new Set(jobs.map((j) => j.lecture))].sort((a, b) => a - b)
  console.log('Cast:')
  for (const n of used) {
    const extra = ASIDE_VOICE ? `, separate aside voice ${ASIDE_VOICE}` : ''
    console.log(`  Lecture ${String(n).padStart(2)}  ${castFor(n).name}${extra}`)
  }
  console.log()
}

const asides = jobs.filter((j) => j.role === 'aside').length
console.log(
  `${jobs.length} lines (${asides} of them asides), ` +
    `${stale.length} to render, ${chars.toLocaleString()} characters`,
)


if (!stale.length) {
  console.log('Everything is up to date.')
  // Still rewrite the manifest: the audio is current but the record around it
  // may not be, and repairing that should not require re-rendering anything.
  if (!DRY && existsSync(MANIFEST)) {
    prune()
    saveManifest()
  }
  process.exit(0)
}

if (PRUNE) {
  const dropped = prune()
  saveManifest()
  console.log(`Dropped ${dropped} out-of-date recording(s) from the manifest; ${stale.length} line(s) still to render.`)
  process.exit(0)
}

if (DRY) {
  for (const j of stale) {
    console.log(`  ${j.key.padEnd(34)} ${j.role.padEnd(5)} ${String(j.text.length).padStart(4)}  ${j.text.slice(0, 46)}`)
  }
  console.log('\nDry run — nothing sent, nothing billed.')
  process.exit(0)
}

requireKey()

/* ---------------- render ---------------- */

mkdirSync(OUT, { recursive: true })

/* Saved after every line rather than at the end, so a run that dies halfway
   keeps what it already paid for. */
function saveManifest() {
  /* Merged, not replaced. `--lecture` narrows `jobs` to one lecture, and an
     assignment here would drop every other lecture's narrator from the record
     — which is how lectures 1 and 2 briefly vanished from the cast after a
     single-lecture render. The `beats` map is merged key by key and never had
     this problem; this now matches it. */
  manifest.cast = {
    ...manifest.cast,
    ...Object.fromEntries(
      [...new Set(jobs.map((j) => j.lecture))]
        .sort((a, b) => a - b)
        .map((n) => [n, { narrator: castFor(n).name, id: castFor(n).id }]),
    ),
  }
  manifest.voice = VOICE || undefined
  manifest.asideVoice = ASIDE_VOICE || undefined
  manifest.model = MODEL
  manifest.generated = new Date().toISOString()
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
}

prune()
saveManifest()

let failed = 0
for (const [i, job] of stale.entries()) {
  const label = `[${i + 1}/${stale.length}] ${job.key}`
  try {
    /* The timestamps endpoint costs the same as the plain one and returns the
       exact duration, which saves the player a `loadedmetadata` round trip on
       every line. The per-character alignment it also returns is what a
       word-level highlight would be built from; nothing reads it yet, so it is
       reduced to one number here rather than bloating a manifest the browser
       has to fetch before the first word. */
    const res = await api(`/v1/text-to-speech/${job.voice}/with-timestamps?output_format=${FORMAT}`, {
      method: 'POST',
      body: JSON.stringify({ text: job.text, model_id: MODEL, voice_settings: settings }),
    })
    const json = await res.json()
    const dest = join(OUT, job.file)
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, Buffer.from(json.audio_base64, 'base64'))

    const ends = json.alignment?.character_end_times_seconds ?? []
    manifest.beats[job.key] = {
      file: job.file,
      hash: job.hash,
      duration: ends.length ? Number(ends[ends.length - 1].toFixed(2)) : 0,
      characters: job.text.length,
      role: job.role,
    }
    saveManifest()
    console.log(`${label} — ${manifest.beats[job.key].duration}s`)
  } catch (err) {
    console.error(`${label} — ${err.message}`)
    failed++
  }
}

saveManifest()

const total = Object.values(manifest.beats).reduce((n, b) => n + (b.duration || 0), 0)
console.log(`\nManifest: ${Object.keys(manifest.beats).length} lines, ${(total / 60).toFixed(1)} minutes.`)
if (failed) {
  console.error(`${failed} line(s) failed — re-run to retry only those.`)
  process.exit(1)
}
