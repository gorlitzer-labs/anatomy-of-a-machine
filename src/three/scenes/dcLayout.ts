import * as THREE from 'three'
import type { Lane } from '../motion/lanes'

/**
 * A machine room, and the two things that actually limit it.
 *
 * The motion signature is scale-out: the same picture, repeated, then repeated
 * again. Nothing here is cleverer than a laptop — there is simply an enormous
 * amount of it, and the interesting problems are the ones that only appear at
 * that quantity.
 *
 * Checked (Uptime Institute Global Data Center Survey 2026): the average of
 * facilities' typical rack density is 7.8 kW excluding the few sites whose
 * typical rack is 30 kW or more, just over 11 kW including them; some racks
 * now exceed 100 kW. AI clusters run 30-100 kW a rack and air cooling runs out
 * around 20 kW a rack (Schneider WP110), so dense racks are liquid-cooled.
 * PUE, the ratio of total facility power to IT-equipment power (servers,
 * storage, network — not only processors): industry average 1.52 in 2026
 * (Uptime), Google's fleet 1.09. The drawn 1.6 and 1.1 sit on those.
 */

export const NODES_PER_RACK = 6
export const RACKS = 9

export const C = {
  node: new THREE.Color('#4fd8ff'),
  busy: new THREE.Color('#6ee7a8'),
  gather: new THREE.Color('#ffab40'),
  idle: new THREE.Color('#243040'),
  overhead: new THREE.Color('#ff7a92'),
}

export const RACK_W = 0.72
export const RACK_GAP = 0.34
export const NODE_H = 0.17

/** Where each rack stands on the floor. */
export function rackPos(i: number): [number, number] {
  const cols = 3
  const c = i % cols
  const r = Math.floor(i / cols)
  return [(c - (cols - 1) / 2) * (RACK_W + RACK_GAP + 0.5), (r - 1) * 1.35]
}

/** How many racks are present on a given beat. */
export function racksShown(focus: string) {
  if (focus === 'node' || focus === 'ecc') return 1
  if (focus === 'rack') return 1
  return RACKS
}

export const JOB_PERIOD = 7.0

export type Job = {
  phase: number
  /** Work has been handed out and is running. */
  computing: boolean
  /** Results are converging on one place. */
  gathering: boolean
  /** 0..1 through whichever stage is current. */
  progress: number
}

/**
 * One distributed job.
 *
 * Scatter is cheap and parallel; compute is cheap and parallel; the gather is
 * neither, because every node's answer has to reach the same place. That final
 * step is what stops a hundred thousand machines behaving like one very large
 * machine, and it is the reason the interconnect matters more than the
 * processors in most of these buildings.
 */
export function jobAt(t: number): Job {
  const phase = (t % JOB_PERIOD) / JOB_PERIOD
  if (phase < 0.2) return { phase, computing: false, gathering: false, progress: phase / 0.2 }
  if (phase < 0.55) return { phase, computing: true, gathering: false, progress: (phase - 0.2) / 0.35 }
  if (phase < 0.92) return { phase, computing: false, gathering: true, progress: (phase - 0.55) / 0.37 }
  return { phase, computing: false, gathering: false, progress: 1 }
}

/** Routes from every rack to the one that collects the answer. */
export const GATHER_LANES: Lane[] = Array.from({ length: RACKS }, (_, i) => {
  const [x, z] = rackPos(i)
  return [[x, z], [0, 0]] as Lane
})

/**
 * Power split, as a fraction that is overhead rather than computing.
 *
 * PUE is quoted as a multiplier on IT power; here it is turned into the share
 * of the total that never reaches the computers, which is the thing worth
 * feeling. At 1.5 that is a third of the building's electricity spent on not
 * computing.
 */
export const PUE = { hyperscale: 1.1, enterprise: 1.6 }
export const overheadShare = (pue: number) => (pue - 1) / pue

/* ------------------------------------------------------------------ */
/* The room's furniture (new look)                                      */
/* ------------------------------------------------------------------ */

/** A node's depth, front to back. Its width is RACK_W and its height NODE_H. */
export const NODE_D = 0.52
/** Where node `n` sits in its rack, as the height of its centre. */
export const nodeY = (n: number) => 0.08 + n * (NODE_H + 0.03)

/**
 * The open frame each rack stands in: four posts and a ring of rails at the
 * top. Open on purpose — from where the hall is seen, the lids of the top
 * nodes are what carries the job's colour, and a cabinet would hide them.
 */
export const FRAME = {
  post: 0.045,
  /** Post centres, just outside the nodes. */
  x: RACK_W / 2 + 0.03,
  z: NODE_D / 2 + 0.03,
  top: nodeY(NODES_PER_RACK - 1) + NODE_H / 2 + 0.05,
  rail: 0.03,
}

/**
 * The machine-room floor. Reaches 0.4 further forward than it did, so the
 * power meter at its front edge lies on the floor rather than off the end of it.
 */
export const FLOOR = { w: 7.4, d: 5.6, h: 0.1, y: -0.06, z: 0.2 }

/**
 * Liquid cooling, drawn on the cooling beat only: a supply and a return header
 * above each row of racks, and a drop from each into every rack. The copy says
 * the coolant is brought to the chip; this is the plumbing that does it.
 */
export const COOLANT = {
  supply: new THREE.Color('#3f8fc4'),
  back: new THREE.Color('#c07a4a'),
  /** Height of the headers' centre line, just above the frames. */
  y: FRAME.top + 0.14,
  r: 0.022,
  /** How far behind a rack's centre the supply and return headers run. */
  behind: [NODE_D / 2 + 0.1, NODE_D / 2 + 0.2] as const,
  /** Where each rack's two drops come down, either side of its centre. */
  dropX: 0.2,
}

/** The row each rack is in, by its z. */
export const ROWS = Array.from(new Set(Array.from({ length: RACKS }, (_, i) => rackPos(i)[1])))
