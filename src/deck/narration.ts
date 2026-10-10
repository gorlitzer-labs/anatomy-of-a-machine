import { create } from 'zustand'
import { isNarrated, lectures } from '../content/lectures'
import { beatAt, stepsFor, useDeck } from './deck'
import { STEP_PERIOD } from '../three/signal'
import { clearCue, cuePart } from '../three/hover'
import { glossary, roleGlossary, type GlossaryEntry } from '../content/glossary'
import { aimOrbit, aimZoom } from '../three/orbit'
import { useLayout } from '../ui/layout'
import type { Beat, Say, SayLine } from '../content/types'

/**
 * The narrator, and the play button that starts her.
 *
 * Two things here, and the second is the one that matters.
 *
 * **Play inverts the control model.** `useDeckInput` is built on the rule that
 * nothing continuous advances a beat — wheel-to-step was tried and deliberately
 * removed. Autoplay breaks that rule, so it is a mode: entered deliberately,
 * left by pause, Escape or the end of the lecture, and never taking a step the
 * reader did not switch it on for. Any manual navigation while playing
 * re-targets the narration instead of fighting it.
 *
 * **She points, she does not just read.** A voice reading the copy aloud is
 * worse than the copy, which can at least be re-read. What a narrator can do
 * that a page cannot is direct attention: name the drain while the drain lights
 * up, turn the package while describing its underside, hold on the bottom row
 * of the truth table while saying what it means. So a `say` line carries cues
 * (`look`, `orbit`, `zoom`) and the player fires them at the moment that line
 * starts speaking — which is why narration is sequenced line by line rather
 * than played as one clip per beat.
 *
 * Cues fire even when muted. Someone who wants the guided tour without a voice
 * in an open-plan office still gets the tour.
 */

/* ---------------- sources ---------------- */

/**
 * Where the voice comes from.
 *
 * `audio` is files rendered ahead of time by `scripts/narrate.mjs` and served
 * as static assets, which is the only shape that fits this deployment: the site
 * is a `dist/` directory served as static assets from the edge, so there is no server to hold an API key
 * and no request a browser could make without shipping one in the bundle.
 *
 * `speech` is the browser's own synthesiser — markedly worse, and a different
 * voice on every platform, but free, dependency-free and available the moment
 * the code lands. It is what runs until somebody renders the audio.
 */
export type NarrationSource = 'audio' | 'speech' | 'none'

/** `hash` is the render script's fingerprint of the line: its text, voice and settings. */
type ManifestEntry = { file: string; duration: number; hash: string }
type Manifest = { voice?: string; beats: Record<string, ManifestEntry> }

/** Key for one spoken line, matching what the render script writes. */
export const lineKey = (lectureId: string, chapterId: string, beatId: string, i: number) =>
  `${lectureId}/${chapterId}/${beatId}/${i}`

let manifest: Manifest | null = null

/**
 * Looks for pre-rendered audio once, on first play.
 *
 * A missing manifest is the normal case rather than an error — it means nobody
 * has run the render script — so a 404 drops the player to speech synthesis
 * without complaint.
 */
async function loadManifest(): Promise<Manifest | null> {
  if (manifest) return manifest
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}narration/manifest.json`, { cache: 'no-cache' })
    if (!res.ok) return null
    manifest = (await res.json()) as Manifest
    return manifest
  } catch {
    return null
  }
}

/* ---------------- lines and cues ---------------- */

const asLine = (say: Say): SayLine => (typeof say === 'string' ? { text: say } : say)

const linesOf = (beat: Beat): SayLine[] => (beat.say ?? []).map(asLine)

/**
 * Audio tags — `[curious]`, `[pause]` — are direction for the v3 model, not
 * words. Left in, a synthesiser reads them out as "bracket curious", so they
 * are stripped on the way to `speechSynthesis` and passed through to the
 * renderer untouched.
 */
const spoken = (text: string) => text.replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Point the scene at whatever this line is about.
 *
 * `cuePart` goes through the same hover store the reader's own pointer uses, so
 * the highlight and the card are the ones they already know rather than a
 * second mechanism that merely looks similar. It refuses ids with no glossary
 * entry, which is why chapter 06 uses only camera cues — its blocks are
 * instanced and have nothing to name.
 */
function applyCue(line: SayLine) {
  if (line.look) cuePart(line.look)
  if (line.orbit) aimOrbit(line.orbit[0], line.orbit[1])
  if (line.zoom != null) aimZoom(line.zoom)
  if (line.variant) useDeck.getState().setVariant(line.variant)
}

/**
 * Dev-only: shout about cues that will silently do nothing.
 *
 * `hoverPart` returns false for an id with no glossary entry and carries on, so
 * a typo'd or unglossed `look` is invisible — the narrator just says "look at
 * the drain" and nothing lights up. That is the exact failure this course keeps
 * having (see `docs/CHECKS.md`), so it is checked once at startup rather than
 * discovered by a reader.
 */
function checkCues() {
  const bad: string[] = []
  for (const lecture of lectures) {
    for (const chapter of lecture.chapters) {
      for (const beat of chapter.beats) {
        for (const line of linesOf(beat)) {
          if (line.look && !glossary[line.look] && !roleGlossary[line.look]) {
            bad.push(`${lecture.id}/${chapter.id}/${beat.id}: look='${line.look}'`)
          }
        }
      }
    }
  }
  if (bad.length) {
    console.warn(`[narration] ${bad.length} cue(s) point at ids with no glossary entry:\n  ` + bad.join('\n  '))
  }
}

if (import.meta.env.DEV) checkCues()

/* ---------------- how long things last ---------------- */

/**
 * Seconds the scene needs before its own claim is true.
 *
 * The truth-table beats are why this exists. `signal.ts` cycles rows at
 * `STEP_PERIOD`, and several beats in chapters 04 and 05 say some version of
 * "watch the table", so the floor is one full cycle. It lands correctly because
 * `driver.beatTime` restarts on beat entry, putting row 0 at the moment the
 * copy appears.
 *
 * It does not bind for lecture 1 — every script there is longer than its cycle
 * — so this is a guard for shorter beats, not an active constraint today.
 */
function sceneDwell(beat: Beat): number {
  if (!beat.truth) return 0
  return (beat.truth === 'not' ? 2 : 4) * STEP_PERIOD
}

const wordCount = (text: string) => text.trim().split(/\s+/).length

/** Reading pace, for a beat with no script and for muted playback. */
const readingDwell = (beat: Beat) => Math.min(Math.max(wordCount(beat.body.join(' ')) / 2.8, 6), 22)

/** How long a single line stays up when there is no voice to time it. */
const lineDwell = (line: SayLine) => Math.min(Math.max(wordCount(line.text) / 2.9, 1.7), 12)

/** Quiet gap between the last word of a beat and the camera leaving for the next. */
const TAIL = 1.1

/**
 * Delay between arriving at a beat and the first word.
 *
 * `shown` flips at the midpoint of the camera move, so this covers the second
 * half of the glide. Talking over a moving camera reads as rushed, and the
 * first line is usually about what has just come into frame.
 */
const LEAD_IN = 0.5

/* ---------------- voices ---------------- */

type Voice = {
  play: (line: SayLine, url: string | null, onEnd: () => void) => void
  stop: () => void
}

function audioVoice(el: HTMLAudioElement, prefetch: HTMLAudioElement): Voice {
  return {
    play: (_line, url, onEnd) => {
      if (!url) return onEnd()
      el.src = url
      el.currentTime = 0
      el.onended = onEnd
      // A file that fails to load should not strand the lecture; treat it as a
      // line that finished instantly and let the beat's dwell carry it.
      el.onerror = onEnd
      void el.play().catch(onEnd)
    },
    stop: () => {
      el.onended = null
      el.onerror = null
      el.pause()
      prefetch.removeAttribute('src')
    },
  }
}

/**
 * The browser's synthesiser, with the two workarounds it has always needed.
 *
 * Chrome stops speaking after about fifteen seconds unless something pokes it,
 * and the voice list populates asynchronously, so the first line of a session
 * can be spoken in the platform default before the preferred voice arrives.
 */
function speechVoice(): Voice {
  let pump: number | undefined
  let cancelled = false

  /* The course is narrated by a woman, so the fallback has to try to be one
     too — a lecture that changes narrator depending on which browser opened it
     is worse than a plain one.

     The Web Speech API exposes no gender field, so name matching is the only
     handle there is. These are the female English voices the three platforms
     actually ship (macOS, Windows, Chrome/Android); the male list is there to
     push Daniel and David down rather than to rule them out, because on a
     stripped-down system the wrong voice still beats silence. */
  const FEMALE =
    /(samantha|karen|moira|fiona|tessa|serena|allison|ava|susan|victoria|kate|zira|hazel|aria|jenny|michelle|libby|sonia|female)/i
  const MALE = /(daniel|david|alex|fred|george|guy|ryan|oliver|thomas|rishi|aaron|male)/i
  /* The neural families. Everything outside them is the decades-old formant
     synthesiser, which is the sound this whole fallback is apologising for. */
  const GOOD = /(natural|neural|premium|enhanced|siri|google\s(uk|us))/i

  const preferred = () => {
    const all = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'))
    if (!all.length) return null
    const score = (v: SpeechSynthesisVoice) =>
      (FEMALE.test(v.name) ? 10 : 0) -
      (MALE.test(v.name) ? 6 : 0) +
      (GOOD.test(v.name) ? 6 : 0) +
      (v.lang === 'en-GB' ? 2 : 0) +
      (v.localService ? 1 : 0)
    return all.sort((a, b) => score(b) - score(a))[0]
  }

  return {
    play: (line, _url, onEnd) => {
      cancelled = false
      speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(spoken(line.text))
      const voice = preferred()
      if (voice) u.voice = voice
      u.rate = 0.96
      u.onend = () => {
        if (!cancelled) onEnd()
      }
      u.onerror = () => {
        if (!cancelled) onEnd()
      }
      speechSynthesis.speak(u)
      clearInterval(pump)
      pump = setInterval(() => {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
          speechSynthesis.pause()
          speechSynthesis.resume()
        }
      }, 10_000) as unknown as number
    },
    stop: () => {
      cancelled = true
      clearInterval(pump)
      speechSynthesis.cancel()
    },
  }
}

/* ---------------- store ---------------- */

type NarrationStore = {
  /** True once the reader has pressed play; survives across beats. */
  playing: boolean
  source: NarrationSource
  /** Set while a voice is producing sound, for the button's state. */
  speaking: boolean
  /** Reader's mute. Independent of play: the guided tour still runs silent. */
  muted: boolean
  /** Show the spoken line as text while it is being said. */
  captions: boolean
  /**
   * Whether this reader has ever pressed play.
   *
   * Only the attract pulse depends on it. A control that advertises itself
   * forever is a nag, and one that advertises itself to someone who already
   * knows what it does is just noise — so the pulse runs a few times for a
   * reader who has never used it, and never again after that.
   */
  everPlayed: boolean
  /**
   * What she is pointing at as she says this line, or null when she is not.
   *
   * The glossary entry, not a separate copy of the name — the same record the
   * reader's own pointer would open. Only the term and its tone are shown; the
   * definition would repeat what she is at that moment saying out loud.
   */
  looking: GlossaryEntry | null
  /**
   * The line on screen right now, or null between lines.
   *
   * Held here rather than derived from the beat and a line index, because the
   * caption has to survive the gap between two audio files without flickering,
   * and because muted playback still walks the lines — so the caption is the
   * one part of narration that works with no voice at all.
   */
  line: string | null
  start: () => void
  stop: () => void
  toggle: () => void
  setMuted: (muted: boolean) => void
  setCaptions: (captions: boolean) => void
}

/**
 * Reader preferences that should outlive a page load.
 *
 * Captions and mute are settings, not momentary state: someone who turns
 * captions on has told you how they want to consume the whole course, and
 * asking again on every lecture would be rude. Wrapped because Safari in
 * private browsing throws on `localStorage` access rather than returning null.
 */
const PREFS = 'anatomy:narration'
type Prefs = { muted?: boolean; captions?: boolean; everPlayed?: boolean }

function loadPrefs(): Prefs {
  try {
    return JSON.parse(localStorage.getItem(PREFS) || '{}') as Prefs
  } catch {
    return {}
  }
}

function savePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(PREFS, JSON.stringify(prefs))
  } catch {
    /* private browsing, or storage disabled — the session still works */
  }
}

let voice: Voice | null = null
let audioEl: HTMLAudioElement | null = null
let prefetchEl: HTMLAudioElement | null = null
let timer: number | undefined
let generation = 0

/** Cancels what is in flight, invalidates pending callbacks, drops any cue. */
function halt() {
  generation++
  clearTimeout(timer)
  timer = undefined
  voice?.stop()
  clearCue()
  useNarration.setState({ speaking: false, line: null, looking: null })
}

const prefs = loadPrefs()

export const useNarration = create<NarrationStore>((set, get) => ({
  playing: false,
  source: 'none',
  speaking: false,
  muted: prefs.muted ?? false,
  captions: prefs.captions ?? true,
  everPlayed: prefs.everPlayed ?? false,
  line: null,
  looking: null,

  /**
   * Must be called from a real click.
   *
   * Both backends are gated on a user gesture — every current browser requires
   * one before audio plays, and iOS applies the same rule to speech synthesis —
   * so the elements are created and the manifest fetched inside the handler
   * rather than on mount.
   */
  start: () => {
    if (get().playing) return
    if (!audioEl) {
      audioEl = new Audio()
      audioEl.preload = 'auto'
      prefetchEl = new Audio()
      prefetchEl.preload = 'auto'
    }
    set({ playing: true })
    /* On a phone, get the copy out of the way. The sheet takes more than half
       the screen and, while she is speaking, everything in it is being said
       aloud and shown a line at a time in the caption — a third copy of the
       same words, crowding the one thing that cannot be read aloud. Collapsing
       it hands that height to the model. The reader can pull it straight back
       up, and stopping restores it. */
    if (useLayout.getState().compact) useLayout.getState().setSheetOpen(false)
    if (!get().everPlayed) {
      set({ everPlayed: true })
      savePrefs({ muted: get().muted, captions: get().captions, everPlayed: true })
    }
    void loadManifest().then((m) => {
      if (!useNarration.getState().playing) return // stopped while in flight
      const hasAudio = !!m && Object.keys(m.beats).length > 0
      voice = hasAudio && audioEl && prefetchEl ? audioVoice(audioEl, prefetchEl) : speechVoice()
      set({ source: hasAudio ? 'audio' : 'speech' })
      speakCurrent()
    })
  },

  stop: () => {
    halt()
    set({ playing: false })
    // The copy was collapsed because a voice was covering it. It is not now.
    if (useLayout.getState().compact) useLayout.getState().setSheetOpen(true)
  },

  toggle: () => (get().playing ? get().stop() : get().start()),

  setMuted: (muted) => {
    set({ muted })
    savePrefs({ muted, captions: get().captions, everPlayed: get().everPlayed })
    // Re-enter the beat so the change takes hold now rather than at the next
    // boundary. Cues replay with it, which is the point of muting rather than
    // stopping.
    if (get().playing) speakCurrent()
  },

  /* Purely presentational, so unlike mute this does not restart the beat —
     turning captions on mid-sentence shows the sentence you are hearing. */
  setCaptions: (captions) => {
    set({ captions })
    savePrefs({ muted: get().muted, captions, everPlayed: get().everPlayed })
  },
}))

/* ---------------- the sequencer ---------------- */

function currentIds() {
  const { lecture, shown } = useDeck.getState()
  return {
    lectureId: lectures[lecture]?.id ?? String(lecture),
    chapterId: stepsFor(lecture)[shown]?.chapterId ?? '',
  }
}

/**
 * Speak the beat on screen line by line, firing each line's cues as it starts,
 * then queue the advance.
 *
 * Re-entrant on purpose: everything that changes what the reader is looking at
 * calls this, and the generation counter turns the previous run's pending
 * callbacks into no-ops rather than requiring each to be tracked and cancelled.
 */
function speakCurrent() {
  if (!useNarration.getState().playing) return

  halt()
  const gen = generation

  const { lecture, shown } = useDeck.getState()
  const beat = beatAt(lecture, shown)
  if (!beat) return

  const lines = linesOf(beat)
  const source = useNarration.getState().source
  const { lectureId, chapterId } = currentIds()
  const arrivedAt = performance.now()

  const urlFor = (i: number) => {
    const entry = manifest?.beats[lineKey(lectureId, chapterId, beat.id, i)]
    // Versioned by the line's hash. A re-recorded line keeps its file name, and
    // mp3s are cached for a day, so without this a reader who listened before
    // a correction kept hearing the old claim until their cache expired. The
    // manifest itself is fetched uncached, so a new hash is a new URL at once.
    return entry ? `${import.meta.env.BASE_URL}narration/${entry.file}?v=${entry.hash}` : null
  }

  /** Warms the next line while the current one plays, so the join is tight. */
  const prefetch = (i: number) => {
    const url = urlFor(i)
    if (url && prefetchEl) prefetchEl.src = url
  }

  const finishBeat = () => {
    if (gen !== generation) return
    useNarration.setState({ speaking: false, line: null, looking: null })
    const elapsed = (performance.now() - arrivedAt) / 1000
    // The floor is measured from arrival rather than added to the narration, so
    // a beat whose scene needs longer than its script does not wait twice.
    const hold = Math.max(elapsed, sceneDwell(beat), lines.length ? 0 : readingDwell(beat))
    timer = setTimeout(
      () => {
        if (gen === generation) advance()
      },
      (Math.max(hold - elapsed, 0) + TAIL) * 1000,
    ) as unknown as number
  }

  const speakLine = (i: number) => {
    if (gen !== generation) return
    if (i >= lines.length) return finishBeat()

    const line = lines[i]
    applyCue(line)
    // Audio tags are direction, not words, so the caption shows what is
    // actually said rather than what is sent to the renderer.
    /* The name goes in the caption only when the scene is not already showing
       it. Several beats anchor their own callout to the very part being cued,
       and printing "DRAIN" in the caption while a DRAIN label floats over the
       drain is the same word three times over — label, caption, highlight. The
       highlight is what ties them together; the word only needs saying once. */
    const labelled = beat.labels?.some((l) => l.part === line.look)
    useNarration.setState({
      line: spoken(line.text),
      looking:
        line.look && !labelled ? (glossary[line.look] ?? roleGlossary[line.look] ?? null) : null,
    })
    prefetch(i + 1)

    /* Three ways a line ends up silent, and all of them hold rather than skip.
       Muted is the reader's choice. No backend means the manifest fetch has not
       landed. And a missing file is the ordinary state of a partly-rendered
       lecture — a run that stopped on a quota, or a script edited since the last
       render. Handing a null url to the audio backend would fire `onEnd`
       immediately and flick the caption past before it could be read, so the
       line is paced by reading speed instead and the caption still shows. */
    const url = voice ? urlFor(i) : null
    if (useNarration.getState().muted || !voice || (source === 'audio' && !url)) {
      timer = setTimeout(() => speakLine(i + 1), lineDwell(line) * 1000) as unknown as number
      return
    }

    useNarration.setState({ speaking: true })
    voice.play(line, url, () => speakLine(i + 1))
  }

  timer = setTimeout(() => speakLine(0), LEAD_IN * 1000) as unknown as number
}

/**
 * Quiet at a lecture boundary.
 *
 * Longer than `TAIL`, which is the gap between beats. This is a bigger seam —
 * a different narrator is about to start — and it should read as a chapter
 * ending rather than as a stutter.
 */
const HANDOVER = 3

/** One step forward; at the end of a lecture, into the next one. */
function advance() {
  const { lecture, index, go, enter } = useDeck.getState()
  if (index < stepsFor(lecture).length - 1) {
    go(1)
    return
  }

  /* Roll into the next lecture rather than stopping dead.
   *
   * Every lecture's last line hands off to the one after it by name — "in the
   * next one it becomes the whole story", "what is left is how the pattern gets
   * onto the crystal". Stopping there leaves the writing making a promise the
   * player does not keep, and leaves the reader on a final beat with nothing
   * saying the course continues.
   *
   * Only into a lecture that can actually speak. An unnarrated one would arrive
   * silent and look like the audio had broken. */
  const next = lectures[lecture + 1]
  if (next && isNarrated(next)) {
    const gen = generation
    timer = setTimeout(() => {
      // A manual step in the gap wins: it bumps the generation and this drops.
      if (gen !== generation || !useNarration.getState().playing) return
      enter(lecture + 1, 0)
    }, HANDOVER * 1000) as unknown as number
    return
  }

  // The end of the course, or the end of what has a voice.
  useNarration.getState().stop()
}

/**
 * Re-target on every change of beat, however it was caused.
 *
 * Subscribing to `shown` rather than `index` starts the voice when the copy
 * appears, at the midpoint of the camera move — the same instant the reader
 * starts seeing what is about to be described.
 */
useDeck.subscribe((state, prev) => {
  if (!useNarration.getState().playing) return
  if (state.view !== 'lecture') {
    useNarration.getState().stop()
    return
  }
  if (state.shown !== prev.shown || state.lecture !== prev.lecture) speakCurrent()
})
