import type { TruthKind } from '../three/signal'

export type Vec3 = [number, number, number]

export type CameraState = {
  position: Vec3
  target: Vec3
  fov?: number
}

export type Label = {
  text: string
  /** Part id this label tracks, so it follows the geometry as it explodes. */
  part: string
  /** Offset from the part's origin, in world units. */
  offset?: Vec3
  tone?: 'cyan' | 'amber' | 'violet' | 'plain'
}

/**
 * One spoken line, and what the scene does while it is being said.
 *
 * A narrator who only reads is worse than the text, because the text can be
 * re-read and she cannot. What she can do that the page cannot is *point* —
 * say "look at the bottom row" while the bottom row lights up, or name the
 * gate while the gate is the only thing on screen. That is the whole reason
 * this is a structure and not a string.
 *
 * Cues fire when the line starts, not on a timer, so they stay aligned however
 * long the voice takes and whichever backend is speaking.
 */
export type SayLine = {
  text: string
  /**
   * Part id to point at for the duration of this line: it highlights and its
   * glossary card comes up, exactly as if the reader had hovered it.
   *
   * Must be a key of `glossary` — `hoverPart` refuses anything else, and a
   * silently ignored cue is worse than a loud one, so `checkCues` in the dev
   * build reports unknown ids rather than letting them pass.
   */
  look?: string
  /**
   * Camera nudge while this line is spoken, as a fraction of the reader's own
   * drag limits: `[yaw, pitch]`, each -1..1. Springs back at the end of the
   * beat like any other reader movement.
   *
   * Small values. This is meant to read as someone turning the object slightly
   * to show you a face, not as a camera move — the beat's authored framing is
   * still the composition, and this borrows from it briefly.
   */
  orbit?: [number, number]
  /** Push out (>1) or pull in (<1) while this line is spoken. */
  zoom?: number
  /**
   * Flip a comparison beat to one side of its toggle as this line starts.
   *
   * Only for beats that declare `toggle`. The toggle exists because a beat
   * stating a comparison is incomplete until somebody operates it — and under
   * autoplay nobody is operating anything, so a narrator who says "now watch it
   * at real speed" over the slowed version is describing something not on
   * screen. This lets her press it herself.
   *
   * Stepping to another beat resets the toggle, so a cue only ever affects the
   * beat it is written on.
   */
  variant?: 'a' | 'b'
  /**
   * Which register this line is in. Defaults to `host`.
   *
   * `aside` marks the lines that step outside the walkthrough to comment on it
   * — the ones the copy already files as `aside` blocks.
   *
   * It no longer changes the voice by default. A second reader for these lines
   * was right while one narrator carried the whole course, because the change
   * of voice was the only thing marking the change of register; once each
   * lecture has its own narrator it competes with the hand-over between
   * lectures and the listener cannot tell which boundary they just heard. The
   * role stays because it still describes the writing, and because
   * `--aside-voice` re-enables a second reader for anyone who wants one.
   *
   * A *role*, not a voice id, so the course data never carries anything
   * account-specific.
   */
  voice?: 'host' | 'aside'
}

/** A spoken line: bare text, or text with cues. */
export type Say = string | SayLine

export type Beat = {
  id: string
  /** Small mono label above the heading. */
  kicker: string
  heading: string
  /** One or two short paragraphs. Plain language, no jargon without a gloss. */
  body: string[]
  camera: CameraState
  /** 0 = fully assembled, 1 = fully exploded. */
  explode: number
  /** Part id to spotlight; everything else dims. */
  focus?: string | null
  /**
   * Which animation runs, when that is not simply "the one for the focused part".
   *
   * `focus` answers "where do I look"; this answers "what am I being shown".
   * They coincide often enough that it defaults to `focus`, but not always: two
   * beats can spotlight the same object and argue opposite things about it —
   * the processor is dark during a DMA transfer and busy during the one that
   * follows it. Without this the second beat inherits the first beat's motion
   * and silently contradicts its own copy.
   */
  motion?: string
  /**
   * Hide every part that is not the focused one, instead of merely dimming it.
   *
   * Needed whenever the subject is enclosed by other geometry: the die sits
   * under the heat spreader, so a close-up of it at explode 0 would otherwise
   * frame the inside of the lid.
   */
  isolate?: boolean
  /** Callout labels anchored to named parts. */
  labels?: Label[]
  /** Renders a live truth table in the copy card, synced to the 3D signals. */
  truth?: TruthKind
  /**
   * A two-state control the reader operates, for beats that state a comparison.
   *
   * `a` and `b` label the two sides. The scene reads `driver.variant` and shows
   * one or the other in the *same frame from the same camera*, which is the
   * only arrangement in which a reader can actually judge a difference — the
   * course's usual "show A, step, show B" puts thirty seconds and a camera move
   * between the two halves of a comparison.
   */
  toggle?: { a: string; b: string; label?: string }
  /**
   * Show the scene's live readout in the copy card.
   *
   * Several scenes compute the exact number their copy asserts and then never
   * display it. Setting this renders whatever the current scene publishes, so a
   * claim like "the wiring halves" is a figure the reader watches change rather
   * than a sentence they are asked to believe.
   */
  readout?: boolean
  /** Optional aside rendered as a bordered note. */
  aside?: { label: string; text: string }
  /**
   * What the narrator says on this beat. Deliberately *not* `body`.
   *
   * `body` is written to be read: it uses symbols (`250 W`, `~1 ns`, `100°C`),
   * parenthetical clauses and sentence lengths that work on a page and fall
   * apart in the ear. Reading it aloud produces something that is recognisably
   * a machine reading a document.
   *
   * So this is a second register of the same argument — same claims, same
   * order, spoken. Numbers are spelled the way a person would say them, because
   * every TTS engine guesses differently at `4 GHz` and some of them guess
   * "four gee-hertz".
   *
   * One entry per spoken line, and each line renders to its own audio file.
   * That split is not only for authoring: a cue attached to a line has to fire
   * exactly when that line starts, and the cheapest way to be exact is for the
   * line to be its own piece of audio. It also means re-recording a sentence
   * costs one sentence.
   *
   * A beat with no `say` is silent, and the player holds it for a dwell
   * proportional to its written length rather than skipping past it.
   */
  say?: Say[]
}

export type Chapter = {
  id: string
  /** Which 3D scene component renders for this chapter. */
  scene: SceneId
  title: string
  /** Roman-numeral-ish section marker. */
  marker: string
  /** Shown in the chapter rail. */
  short: string
  beats: Beat[]
}

/**
 * A lecture is the unit the reader chooses from the syllabus.
 *
 * Above chapters, because the course is long enough that a single linear run
 * of every beat stopped being navigable. Lectures that are planned but not
 * written still appear here with `state: 'soon'` and no chapters — the syllabus
 * is the curriculum map, so it has to show what is coming as well as what is
 * readable.
 */
export type Lecture = {
  id: string
  /** 1-based, and shown to the reader. Also the sort order. */
  number: number
  title: string
  /** One line under the title on the syllabus. */
  subtitle: string
  /**
   * The trade this lecture is about — the course's organising principle.
   * Every lecture names what dominated and what was given up for it.
   */
  constraint?: string
  state: 'live' | 'soon'
  chapters: Chapter[]
}

export type SceneId =
  | 'cpu'
  | 'mosfet'
  | 'gates'
  | 'adder'
  | 'fabric'
  | 'board'
  | 'cell'
  | 'ladder'
  | 'pipeline'
  | 'fab'
  | 'kernel'
  | 'boot'
  | 'code'
  | 'phone'
  | 'edge'
  | 'car'
  | 'robot'
  | 'datacenter'
  | 'extremes'
  | 'implant'
