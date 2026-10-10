import * as THREE from 'three'
import { laneLength, type Lane } from '../motion/lanes'

/**
 * The kernel, as containment.
 *
 * Every scene before this one had something to look at: a package, a die, a
 * board, a wafer. A kernel has none of that — it is a set of *relationships*,
 * and the temptation is to draw it as more glowing boxes on a die, which would
 * teach nothing.
 *
 * So the geometry here is an argument rather than an object. There is an inside
 * and an outside, and a wall between them that is enforced by hardware rather
 * than by agreement. Programs live outside. The machine lives inside. Nothing
 * crosses without being inspected, and one thing at the centre can only be held
 * by one program at a time.
 *
 * Those three facts — a boundary, a checkpoint, and a contended resource — are
 * the whole of this lecture, and between them they are most of what an
 * operating system is.
 */

/** Where user programs sit. */
export const OUTER_R = 3.15
/** The privilege boundary. */
export const WALL_R = 1.95
/** The one CPU everything is competing for. */
export const CORE_R = 0.42

export const PROCESSES = 6

export const P_COLOR = [
  new THREE.Color('#4fd8ff'),
  new THREE.Color('#a06bff'),
  new THREE.Color('#6ee7a8'),
  new THREE.Color('#ffab40'),
  new THREE.Color('#ff7ad9'),
  new THREE.Color('#7fe9ff'),
]

export const angleOf = (i: number) => (i / PROCESSES) * Math.PI * 2 - Math.PI / 2

export function processPos(i: number): [number, number] {
  const a = angleOf(i)
  return [Math.cos(a) * OUTER_R, Math.sin(a) * OUTER_R]
}

export function gatePos(i: number): [number, number] {
  const a = angleOf(i)
  return [Math.cos(a) * WALL_R, Math.sin(a) * WALL_R]
}

/**
 * The route a request takes: out in user space, through the gate in the wall,
 * then in to the core.
 *
 * Three points rather than two, because the middle one is the whole subject —
 * the gate is where a request stops being the program's business and starts
 * being the kernel's.
 */
export const REQUEST_LANES: Lane[] = Array.from({ length: PROCESSES }, (_, i) => {
  const [px, pz] = processPos(i)
  const [gx, gz] = gatePos(i)
  return [
    [px, pz],
    [gx, gz],
    [0, 0],
  ] as Lane
})

/**
 * Fraction of the trip spent reaching the gate.
 *
 * By arc length the gate sits at (3.15 - 1.95) / 3.15 = 0.381 along the lane,
 * not 0.42 — so requests used to stop about a tenth of a unit *inside* the
 * wall, which is the one place a checkpoint cannot be.
 */
export const GATE_AT = 0.381
/** How long a request is held at the gate while it is checked. */
export const CHECK_FOR = 0.18

/**
 * Where a request is at 0..1 through its cycle, with a deliberate hold at the
 * checkpoint.
 *
 * The hold is not decoration. A syscall is not a function call that happens to
 * cross a line — the crossing *is* the expensive part, because the machine has
 * to change privilege level, and that pause is the only way to show it costs
 * something.
 */
export function requestU(phase: number): { u: number; checking: boolean } {
  if (phase < GATE_AT) return { u: (phase / GATE_AT) * GATE_AT, checking: false }
  if (phase < GATE_AT + CHECK_FOR) return { u: GATE_AT, checking: true }
  const after = (phase - GATE_AT - CHECK_FOR) / (1 - GATE_AT - CHECK_FOR)
  return { u: GATE_AT + after * (1 - GATE_AT), checking: false }
}

/* ---------------- travel at a constant speed ---------------- */

/**
 * World units a request covers per second, and how long each check holds it.
 *
 * Both beats used to run on a fixed *period* — every request completed its
 * cycle in 3.33 s whichever path it took. The microkernel lane is about 2.4
 * times longer, so instead of taking longer it simply travelled faster, and a
 * lecture whose central claim is "that safety is bought with crossings, and
 * crossings are the expensive thing" animated as: crossings are free.
 *
 * Constant speed is the grammar `LadderScene` already uses for exactly this
 * reason — there, distance on screen *is* latency. Here, path length is cost.
 */
export const REQ_SPEED = 2.4
export const REQ_HOLD = 0.5

/** Seconds for one whole request along `lane`, including every check. */
export function requestPeriod(lane: Lane, stops: number[]) {
  return laneLength(lane) / REQ_SPEED + stops.length * REQ_HOLD
}

/**
 * Where a request is after `elapsed` seconds, walking `lane` and pausing at
 * each of `stops` (given as fractions along the lane).
 *
 * Works in seconds rather than in normalised phase so that the pauses cost real
 * time on top of real travel — which is what makes four crossings visibly
 * dearer than one rather than merely differently spaced.
 */
export function walkRequest(
  lane: Lane,
  stops: number[],
  elapsed: number,
): { u: number; checking: boolean; done: boolean } {
  const travel = laneLength(lane) / REQ_SPEED
  let acc = 0
  let prev = 0
  for (const stop of stops) {
    const seg = (stop - prev) * travel
    if (elapsed < acc + seg) {
      return { u: prev + ((elapsed - acc) / seg) * (stop - prev), checking: false, done: false }
    }
    acc += seg
    if (elapsed < acc + REQ_HOLD) return { u: stop, checking: true, done: false }
    acc += REQ_HOLD
    prev = stop
  }
  const seg = (1 - prev) * travel
  const f = seg > 0 ? (elapsed - acc) / seg : 1
  return { u: prev + Math.min(1, Math.max(0, f)) * (1 - prev), checking: false, done: f >= 1 }
}

/** Which process is refused, on the refusal beat. */
export const REFUSED = 3

/**
 * Which process holds the core at time `t`.
 *
 * A fixed rotation rather than anything clever: the point of the scheduling
 * beats is that turns are *taken*, not that any particular policy is right.
 */
export const SLICE = 1.6
export const holderAt = (t: number) => Math.floor(t / SLICE) % PROCESSES

/* ------------------------------------------------------------------ */
/* Lecture 9: moving the wall                                          */
/* ------------------------------------------------------------------ */

/**
 * The services an operating system provides — a filesystem, a driver, a network
 * stack — which may sit inside the wall or outside it.
 *
 * This is the entire monolithic-versus-microkernel argument, and it is a
 * question of *where*, not of what. The same three services exist either way.
 * What changes is how many times a request has to cross a boundary to reach
 * them, and each crossing costs.
 */
export const SERVICES = 3

export const SERVICE_COLOR = [
  new THREE.Color('#6ee7a8'),
  new THREE.Color('#ffab40'),
  new THREE.Color('#ff7ad9'),
]

export const serviceAngle = (i: number) => (i / SERVICES) * Math.PI * 2 + Math.PI / 6

/** Inside the wall (monolithic) and outside it (microkernel). */
export const INSIDE_R = 1.05
/* Outside, a service sits just beyond the gate it is reached through, on the
   same angle as a program, so the way out to it passes a checkpoint. At 2.62
   the service and its boundary stood inside that program's block. The band
   between the gates (out to 2.0) and the programs (from 2.89) fits a boundary
   of 0.34. */
export const OUTSIDE_R = 2.45
export const SERVICE_BOUNDARY_R = 0.34

/* The real-time task orbits outside the programs. At OUTSIDE_R + 0.42 it ran
   straight through the program blocks, starting inside the first one. */
export const DEADLINE_R = OUTER_R + 0.55

export function servicePos(i: number, outside: boolean): [number, number] {
  const a = serviceAngle(i)
  const r = outside ? OUTSIDE_R : INSIDE_R
  return [Math.cos(a) * r, Math.sin(a) * r]
}

/**
 * A request that has to leave the kernel again to reach a service.
 *
 * Five points rather than three: out from the program, in through the wall, to
 * the core, back *out* through the wall to the service, and the return is the
 * same road travelled backwards. A microkernel is not slower because its code
 * is worse — it is slower because this path exists at all.
 */
export const MICRO_LANES: Lane[] = Array.from({ length: PROCESSES }, (_, i) => {
  const [px, pz] = processPos(i)
  const [gx, gz] = gatePos(i)
  const [sx, sz] = servicePos(i % SERVICES, true)
  const [mx, mz] = [sx * 0.72, sz * 0.72]
  return [
    [px, pz],
    [gx, gz],
    [0, 0],
    [mx, mz],
    [sx, sz],
  ] as Lane
})

/**
 * Where along a microkernel request the boundary checks fall: where the lane
 * crosses the wall on the way in, at the gate, and again on the way out to the
 * service. Derived from the lane rather than typed in — the fixed 0.34 and 0.72
 * this replaced held requests at points well inside the wall, the same mistake
 * `GATE_AT` records for the direct path.
 */
export const MICRO_CHECKS = (() => {
  const lane = MICRO_LANES[0]
  const total = laneLength(lane)
  const seg = (a: number) => Math.hypot(lane[a + 1][0] - lane[a][0], lane[a + 1][1] - lane[a][1])
  const inbound = seg(0)
  // Out from the core the route is radial, so it meets the wall at WALL_R.
  const outbound = seg(0) + seg(1) + WALL_R
  return [inbound / total, outbound / total]
})()

/**
 * Deadline, for the real-time beats.
 *
 * A general-purpose scheduler is judged on averages; a real-time one is judged
 * on the worst case, and the difference is a line that must not be crossed
 * rather than a number to be minimised.
 */
export const DEADLINE = 0.72
export const RT_PERIOD = 3.2
