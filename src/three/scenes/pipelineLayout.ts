import * as THREE from 'three'

/**
 * The instruction pipeline, as a schedule.
 *
 * Everything in this chapter is about *when*, so the layout is mostly a
 * function of tick rather than of position. A stage is a place; an instruction
 * is a thing that occupies one stage per tick; and the interesting states —
 * a bubble, a flush — are things that happen to that schedule rather than to
 * the geometry.
 */

export const STAGES = [
  { id: 'fetch', label: 'Fetch', short: 'F' },
  { id: 'decode', label: 'Decode', short: 'D' },
  { id: 'execute', label: 'Execute', short: 'E' },
  { id: 'memory', label: 'Memory', short: 'M' },
  { id: 'writeback', label: 'Write', short: 'W' },
]

export const STAGE_GAP = 1.2
export const stageX = (i: number) => (i - (STAGES.length - 1) / 2) * STAGE_GAP

/** Ticks per second. Slow enough to read a single instruction moving. */
export const CLOCK_RATE = 0.85

/** How many instructions are tracked at once. */
export const SLOTS = 14

export type SlotKind = 'normal' | 'bubble' | 'speculative' | 'flushed'

export const KIND_COLOR: Record<SlotKind, THREE.Color> = {
  normal: new THREE.Color('#4fd8ff'),
  bubble: new THREE.Color('#2a3340'),
  speculative: new THREE.Color('#a06bff'),
  flushed: new THREE.Color('#ff7a92'),
}

/**
 * What instruction `n` is, for the beat currently on screen.
 *
 * `hazard` inserts a bubble every fourth slot: the case where an instruction
 * needs a result the one ahead of it has not produced yet *and forwarding
 * cannot cover it* — typically a value still coming back from memory (a
 * load-use stall) — so the pipeline has to hold everything behind it and let a
 * gap through. Most dependencies are forwarded and cost nothing; the copy says
 * so, and these bubbles stand for the ones that are not.
 *
 * `speculation` branches at a fixed instruction, runs the guess, and then
 * throws it away — which is the whole point. The work was done and discarded,
 * and the discarding is what a misprediction costs.
 */
export function slotKind(focus: string, n: number): SlotKind {
  if (n < 0) return 'bubble'
  /* Unpipelined: one instruction in the machine at a time, so four of the five
     stages are empty on every tick. This is the picture the copy describes and
     it used to render as a completely full pipeline — which is the *next*
     beat's picture, making the chapter's opening contrast invisible. The
     reader now presses once and watches the pipeline fill; that step is the
     lesson. */
  if (focus === 'stages') return n % 5 === 0 ? 'normal' : 'bubble'
  if (focus === 'hazard') return n % 4 === 3 ? 'bubble' : 'normal'
  if (focus === 'speculation' || focus === 'branch') {
    const cycle = n % 12
    if (cycle >= 5 && cycle <= 8) return 'speculative'
    return 'normal'
  }
  return 'normal'
}

/**
 * Whether a speculative instruction has been proven wrong by tick `tick`.
 *
 * The branch resolves four ticks after it issued, which is roughly the shape of
 * a short pipeline. Modern cores are far deeper, so they throw away far more.
 */
export function flushed(focus: string, n: number, tick: number) {
  if (focus !== 'speculation') return false
  if (slotKind(focus, n) !== 'speculative') return false
  const cycle = n % 12
  const issuedAt = n
  return tick >= issuedAt + (9 - cycle)
}

/**
 * The clock wall, as measured points rather than a smooth curve.
 *
 * Dynamic power goes as capacitance times voltage squared times frequency, and
 * the reason the line bends so hard is that pushing frequency historically
 * meant pushing voltage too — so power grew far faster than speed did. Dennard
 * scaling broke down in the mid-2000s, when voltage stopped falling with
 * feature size and the whole bargain collapsed.
 *
 * The numbers are a model, not a measurement of any one chip: they assume the
 * voltage a clock needs rises with it. That assumption is what makes "two
 * cores at 3 GHz against one at 6" come out so lopsided.
 */
export const WALL = [
  { ghz: 0.5, power: 0.06 },
  { ghz: 1.0, power: 0.14 },
  { ghz: 2.0, power: 0.34 },
  { ghz: 3.0, power: 0.6 },
  { ghz: 4.0, power: 1.0 },
  { ghz: 5.0, power: 1.62 },
  { ghz: 6.0, power: 2.5 },
]

/** Where the practical cooling budget sits on that scale. */
export const WALL_LIMIT = 1.0
