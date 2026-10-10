import * as THREE from 'three'

/**
 * A robot, which is two machines running at different speeds.
 *
 * The motion signature is rate contrast, and it only works if both loops are on
 * screen together: a control loop spinning many times while a perception loop
 * comes round once. Shown separately they are just two circles.
 *
 * Checked: the joint loop typically runs somewhere between 100 Hz and 1 kHz
 * (the servo drive's current loop far faster, ~16 kHz) on a microcontroller,
 * usually under a small RTOS, with microsecond determinism, while perception runs
 * Linux-class on an application processor at video rates. Whether a single SoC
 * with hardware-enforced separation can collapse that split is a live industry
 * argument rather than a settled fact, and the lecture says so.
 *
 * HONEST COMPRESSION: the real ratio is nearer thirty to one and would make the
 * fast loop a blur. On screen it runs at eight to one, and the copy gives the
 * real figures.
 */

export const FAST_HZ = 1000
export const SLOW_HZ = 30

/** On-screen periods, in seconds. */
export const FAST_PERIOD = 0.9
export const SLOW_PERIOD = 7.2

/** How many times the control loop laps while perception comes round once. */
export const LAPS = Math.round(SLOW_PERIOD / FAST_PERIOD)

export const FAST_R = 1.05
export const SLOW_R = 2.35

export const C = {
  fast: new THREE.Color('#4fd8ff'),
  slow: new THREE.Color('#a06bff'),
  deadline: new THREE.Color('#6ee7a8'),
  miss: new THREE.Color('#ff7a92'),
  arm: new THREE.Color('#7fa8c4'),
}

/** Where in its period each loop is. */
export const fastPhase = (t: number) => (t % FAST_PERIOD) / FAST_PERIOD
export const slowPhase = (t: number) => (t % SLOW_PERIOD) / SLOW_PERIOD

/** The fraction of its period by which the control loop must be finished. */
export const DEADLINE = 0.68

export const MISS_EVERY = 5

/**
 * Whether this pass of the control loop overruns.
 *
 * Deterministic rather than random, so the beat shows the same miss in the same
 * place every time — a reader stepping back should not have to wait for one.
 */
export function missedAt(t: number, enabled: boolean) {
  if (!enabled) return false
  const pass = Math.floor(t / FAST_PERIOD)
  return pass % MISS_EVERY === MISS_EVERY - 1
}

/**
 * How far the work got this pass, 0..1.
 *
 * A normal pass finishes comfortably inside the deadline and then waits. A
 * missed pass is still going when the deadline arrives, which is the entire
 * failure: not slowness, lateness.
 */
export function workAt(t: number, enabled: boolean) {
  const p = fastPhase(t)
  const missed = missedAt(t, enabled)
  const finishAt = missed ? 0.95 : 0.5
  return { progress: Math.min(1, p / finishAt), late: missed && p > DEADLINE, missed, phase: p }
}

/**
 * The joint angle the controller is trying to hold.
 *
 * On a good pass the arm tracks its target. On a late pass the correction
 * arrives after the world has already moved, so it overshoots — and that is
 * what a missed deadline looks like from outside: not a dropped frame, a thing
 * in the wrong place.
 */
export function armAngle(t: number, enabled: boolean) {
  const base = Math.sin(t * 0.8) * 0.5
  const w = workAt(t, enabled)
  if (!w.missed) return base
  const over = w.phase > DEADLINE ? (w.phase - DEADLINE) / (1 - DEADLINE) : 0
  return base + over * 0.42 * Math.sign(Math.cos(t * 0.8))
}
