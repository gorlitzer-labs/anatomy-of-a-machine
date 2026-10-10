import * as THREE from 'three'
import type { GlossaryEntry } from '../../content/glossary'
import type { Lane } from '../motion/lanes'

/**
 * The memory hierarchy, laid out so that position *is* latency.
 *
 * Every figure here was checked rather than remembered, and they are ranges
 * because they genuinely are: cache latencies are usually quoted in cycles, so
 * the nanosecond figure moves with clock speed.
 *
 *   registers  under a nanosecond          a few hundred bytes
 *   L1         ~1 ns      (3–5 cycles)     32–128 KB (128 KB on Apple M1)
 *   L2         ~4 ns      (10–14 cycles)   0.5–2 MB
 *   L3         ~15 ns     (40–60 cycles)   8–64 MB
 *   DRAM       70–100 ns  (~73 ns Zen 4)   8–64 GB
 *   SSD        tens of µs (random 4K read) ~1 TB
 *
 * THE AXIS IS LOGARITHMIC, and the chapter says so on screen. At true scale, if
 * an L1 hit took a tenth of a second then DRAM would take eight seconds and an
 * SSD read (at the 40 µs drawn here) around an hour — nobody would watch that. Compressing is the only
 * workable choice, so the compression is disclosed and the real numbers are
 * printed. A visualisation that silently squashes the ratio it exists to teach
 * has argued against itself.
 */

export type Tier = {
  id: string
  label: string
  /** Representative latency in nanoseconds — drives x position. */
  ns: number
  /** log10 of representative capacity in bytes — drives block size. */
  cap: number
  /** Shown in the callout. */
  latencyText: string
  sizeText: string
  color: THREE.Color
}

const C = {
  reg: new THREE.Color('#4fd8ff'),
  cache: new THREE.Color('#a06bff'),
  dram: new THREE.Color('#c08bff'),
  disk: new THREE.Color('#6ee7a8'),
}

export const TIERS: Tier[] = [
  { id: 'registers', label: 'Registers', ns: 0.3, cap: 2.5, latencyText: 'under 1 ns', sizeText: 'a few hundred bytes', color: C.reg },
  { id: 'l1', label: 'L1', ns: 1, cap: 4.7, latencyText: '~1 ns · 3–5 cycles', sizeText: '32–128 KB', color: C.cache },
  { id: 'l2', label: 'L2', ns: 4, cap: 6.0, latencyText: '~4 ns · 10–14 cycles', sizeText: '0.5–2 MB', color: C.cache },
  { id: 'l3', label: 'L3', ns: 15, cap: 7.5, latencyText: '~15 ns · 40–60 cycles', sizeText: '8–64 MB', color: C.cache },
  { id: 'ram', label: 'Main memory', ns: 90, cap: 10.2, latencyText: '70–100 ns', sizeText: '8–64 GB', color: C.dram },
  { id: 'ssd', label: 'Storage', ns: 40000, cap: 12.0, latencyText: 'tens of µs', sizeText: '~1 TB', color: C.disk },
]


/** One sentence each, about what the tier *is* rather than what it costs. */
const TIER_LINES: Record<string, string> = {
  registers: 'A few dozen words of storage inside the core itself. Instructions can only work on what is here, so everything else in this chapter exists to keep them fed.',
  l1: 'The first cache, split between instructions and data, and small on purpose — every doubling of its size costs it speed. Its whole job is to answer before the core notices it asked.',
  l2: 'Bigger, further, slower. A second chance to answer without leaving the core, and the level where a miss starts to be worth avoiding.',
  l3: 'Shared by every core on the die, which is what makes it useful and what makes it slow: it is far away from all of them, and they queue for it.',
  ram: 'Off the chip entirely, across a bus, in a different package. This is the wall the rest of the chapter is about — one trip here is hundreds of instructions the core could have run instead.',
  ssd: 'Not memory at all: a device you ask, over a protocol, and wait. Far enough away that the operating system will run something else entirely while the answer comes back.',
}

/**
 * What each tier says when the pointer is on it.
 *
 * Built from the table above rather than written out in the glossary, because
 * every number in it is a number this scene is *already* using: `ns` is where
 * the block sits on the axis and therefore how long the trip takes, `cap` is
 * how big the block is drawn. A hand-written tooltip would be a second copy of
 * both, free to drift from the geometry the reader is looking at while they
 * read it.
 */
export const TIER_ENTRIES: Record<string, GlossaryEntry> = Object.fromEntries(
  TIERS.map((tier) => [
    tier.id,
    {
      term: tier.label,
      line: TIER_LINES[tier.id],
      fact: `${tier.latencyText} · ${tier.sizeText}`,
      tone: tier.id === 'ssd' ? 'plain' : tier.id === 'registers' || tier.id === 'l1' ? 'cyan' : 'violet',
    } satisfies GlossaryEntry,
  ]),
)

/**
 * Where the core sits — everything is measured as a walk from here.
 *
 * The span is deliberately tight. The copy card owns the left third of the
 * screen and the camera rig shifts the model right to clear it, so a ladder
 * authored to fill the frame puts its near tiers, and the core they are near
 * *to*, underneath the text.
 */
export const CORE_X = -2.4

const LOG_MIN = Math.log10(TIERS[0].ns)
const LOG_MAX = Math.log10(TIERS[TIERS.length - 1].ns)
const X_MIN = -1.7
const X_MAX = 1.95

export function tierX(ns: number) {
  const t = (Math.log10(ns) - LOG_MIN) / (LOG_MAX - LOG_MIN)
  return X_MIN + t * (X_MAX - X_MIN)
}

/** Block footprint, scaled by capacity so the cheap tiers are visibly vast. */
/* Sized to the room the log axis leaves. At 0.2 + 0.125 per step, L1, L2, L3
   and main memory ran into each other and read as one tapering block rather
   than four separate places; the tightest pair, L2 and L3, now keeps a gap. */
export function tierSize(cap: number) {
  return 0.12 + (cap - 2.5) * 0.058
}

/**
 * Block depth, along z. Nothing else sits along the axis's cross direction,
 * so capacity can keep its full spread there: with width alone carrying it the
 * narrowed blocks all read as small, and storage no longer looked vast.
 */
export function tierDepth(cap: number) {
  return 0.2 + (cap - 2.5) * 0.125
}

export function tierHeight(cap: number) {
  return 0.09 + (cap - 2.5) * 0.035
}

/** One route from the core out to each tier. The length is the lesson. */
export const TIER_LANES: Record<string, Lane> = Object.fromEntries(
  TIERS.map((t) => [t.id, [[CORE_X, 0], [tierX(t.ns), 0]] as Lane]),
)

export const LADDER_PACKETS = 40

/**
 * How long a round trip to a tier takes on screen, in seconds.
 *
 * Constant speed along a log-spaced axis: the walk to storage is about six
 * times the walk to L1, standing in for a real ratio nearer forty thousand.
 */
export const TRIP_SPEED = 1.6

export function tripSeconds(tier: Tier) {
  return (2 * Math.abs(tierX(tier.ns) - CORE_X)) / TRIP_SPEED
}

/**
 * How long the overview beat spends on each tier: exactly one whole round trip.
 *
 * It used to be a flat five seconds per tier. Storage's round trip takes 5.44 s,
 * so on the flagship beat of the flagship scene — the one whose copy reads
 * "watch a single request travel out and come back" — the request to storage
 * was cut off before it returned, every single time, and the packet teleported
 * at the tier change. The one trip the lecture most wants you to feel the
 * length of was the only one you never saw finish.
 */
const DWELL = TIERS.map(tripSeconds)
const TOUR = DWELL.reduce((a, b) => a + b, 0)

/**
 * Which tier a beat is asking about, and how long it has been on it.
 *
 * Shared rather than recomputed per component, because three separate things
 * need to agree on it: the packets, the tier that lights up when they arrive,
 * and — the point of the lecture — the core, which must be *dark for exactly as
 * long as the trip takes*.
 *
 * `local` restarts at zero on every tier change, so each trip begins at the
 * core rather than wherever the previous tier's phase happened to leave it.
 */
export function targetFor(focus: string, t: number): { tier: Tier; local: number } {
  if (focus === 'ladder') {
    let x = t % TOUR
    for (let i = 0; i < TIERS.length; i++) {
      if (x < DWELL[i]) return { tier: TIERS[i], local: x }
      x -= DWELL[i]
    }
  }
  const tier =
    TIERS.find((tier) => tier.id === focus) ?? (focus === 'wear' ? TIERS[5] : TIERS[4])
  return { tier, local: t }
}

export type Trip = {
  /** 0..1 through the round trip. */
  phase: number
  /** 0..1 along the outward road; runs back down on the return. */
  u: number
  outbound: boolean
  /** True only in the brief window where the answer has arrived. */
  arrived: boolean
}

export function tripAt(target: Tier, t: number): Trip {
  const span = Math.abs(tierX(target.ns) - CORE_X)
  const trip = (2 * span) / TRIP_SPEED
  const phase = (t % trip) / trip
  const outbound = phase < 0.5
  const u = outbound ? phase * 2 : 1 - (phase - 0.5) * 2
  /* The core gets a fixed slice of real time to do its work, not a fixed
     fraction of the trip — so the *proportion* of time it spends working
     collapses as the tier gets further away, which is the whole argument. */
  const workWindow = Math.min(0.42, 0.35 / trip)
  return { phase, u, outbound, arrived: phase > 1 - workWindow || phase < workWindow * 0.4 }
}
