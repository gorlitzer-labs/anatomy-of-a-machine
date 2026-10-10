import * as THREE from 'three'
import type { Lane } from '../motion/lanes'

/**
 * A car, which is not one computer.
 *
 * Three motions carry this lecture and each is a different kind of argument.
 * Contention: many units want one wire and priority decides, without the
 * winner's message being damaged. Consolidation: the wiring collapses when the
 * units are grouped by where they are rather than by what they do. Redundancy:
 * two cores doing identical work, compared continuously, so that disagreement
 * is itself the alarm.
 *
 * Checked: CAN arbitration is bitwise and non-destructive, and the lower
 * identifier wins — the winning frame is not corrupted by the contention and
 * does not need resending, which is the property the whole scheme is built on.
 * Dual-core lockstep is a standard route to ISO 26262 ASIL D. Automotive parts
 * are typically qualified to AEC-Q100 Grade 1, which is −40 °C to 125 °C;
 * parts near the engine often to Grade 0, up to 150 °C.
 */

export const UNITS = 10

/** Where each unit sits when wired the old way: by function, spread everywhere. */
export const SCATTERED: Array<[number, number]> = [
  [-2.5, -1.2], [-1.5, -1.55], [-0.2, -1.35], [1.2, -1.5], [2.4, -1.15],
  [-2.4, 1.15], [-1.2, 1.5], [0.3, 1.35], [1.6, 1.5], [2.5, 1.1],
]

/**
 * Four zone controllers, and the units clustered around them.
 *
 * The saving is not shorter wires to the same central point — it is that a unit
 * now reaches only as far as the corner it is in, and just four trunk links
 * carry everything to the middle. Modelling it the other way understates the
 * change badly: with every unit still running to the spine the harness barely
 * shrinks, which is not what happens and not what the beat claims.
 */
export const ZONES: Array<[number, number]> = [
  [-1.85, -0.85], [1.85, -0.85], [-1.85, 0.85], [1.85, 0.85],
]

/**
 * Which corner each unit belongs to: the zone nearest where it already sits.
 *
 * It used to be `i % 4`, which sent units right across the car — the front-
 * right unit to the rear-left corner — so the "wire everything nearby" beat
 * showed units flying past, and through, one another, and then settling edge
 * to edge with no gap. Nearest-zone keeps every move short and inside its own
 * corner, and the order along each row matches the order they started in, so
 * no two paths cross.
 */
const ZONE_OF = SCATTERED.map(([x, z]) => {
  let best = 0
  for (let k = 1; k < ZONES.length; k++) {
    const d = Math.hypot(ZONES[k][0] - x, ZONES[k][1] - z)
    if (d < Math.hypot(ZONES[best][0] - x, ZONES[best][1] - z)) best = k
  }
  return best
})

/* A zone's units stand in a row at the controller, a little outboard of it.
   Units are 0.44 wide, so the pitch leaves a clear gap between them. The two
   numbers also set the harness total: with these it is half the scattered
   one, which is what the copy says. */
const SLOT_PITCH = 0.52
const SLOT_OUT = 0.05

export function zonePos(i: number): [number, number] {
  const zone = ZONE_OF[i]
  const [zx, zz] = ZONES[zone]
  const mates = ZONE_OF.map((z, j) => (z === zone ? j : -1))
    .filter((j) => j >= 0)
    .sort((a, b) => SCATTERED[a][0] - SCATTERED[b][0])
  const k = mates.indexOf(i)
  return [zx + (k - (mates.length - 1) / 2) * SLOT_PITCH, zz + Math.sign(zz) * SLOT_OUT]
}

/** Which controller a unit reports to. */
export const hubOf = (i: number): [number, number] => ZONES[ZONE_OF[i]]

/** Message priority. Lower wins, exactly as on a real bus. */
export const PRIORITY = [3, 7, 1, 9, 5, 2, 8, 4, 6, 10]

export const C = {
  unit: new THREE.Color('#4fd8ff'),
  winner: new THREE.Color('#6ee7a8'),
  backoff: new THREE.Color('#ffab40'),
  central: new THREE.Color('#a06bff'),
  fault: new THREE.Color('#ff7a92'),
}

/** The bus spine, and a stub from each unit down to it. */
export const SPINE: Lane = [
  [-3.2, 0],
  [3.2, 0],
]

/**
 * The wire from a unit to whatever it reports to.
 *
 * Function-wired, that is the spine itself, wherever the unit happens to be.
 * Zone-wired, it is the controller in the same corner — and the controllers
 * carry the rest on four trunks.
 */
export function stub(i: number, zonal: boolean): Lane {
  if (!zonal) {
    const [x, z] = SCATTERED[i]
    return [[x, z], [x, 0]]
  }
  const [x, z] = zonePos(i)
  const [hx, hz] = hubOf(i)
  return [[x, z], [hx, hz]]
}

/** The four trunks from the zone controllers to the central computer. */
export const TRUNKS: Lane[] = ZONES.map(([x, z]) => [[x, z], [x, 0]] as Lane)

/** Total wire on screen, for checking that the collapse is real. */
export function harnessLength(zonal: boolean) {
  const seg = (l: Lane) => Math.hypot(l[1][0] - l[0][0], l[1][1] - l[0][1])
  let total = 0
  for (let i = 0; i < UNITS; i++) total += seg(stub(i, zonal))
  if (zonal) for (const t of TRUNKS) total += seg(t)
  return total
}

export const ROUND = 4.6

/** Bits in a message identifier, as drawn. Real CAN uses 11 or 29. */
export const ID_BITS = 4

/** A unit's identifier, MSB first. Lower number = higher priority. */
export function idBits(unit: number): number[] {
  const v = PRIORITY[unit]
  return Array.from({ length: ID_BITS }, (_, k) => (v >> (ID_BITS - 1 - k)) & 1)
}

export type Arbitration = {
  /** 0..1 through one arbitration round. */
  phase: number
  /** Index of the unit that won this round. */
  winner: number
  /** Units that tried and lost. */
  contenders: number[]
  /** True while units are still dropping out. */
  arbitrating: boolean
  /** How many identifier bits have been decided, 0..ID_BITS. */
  resolved: number
  /** Units still in contention after `resolved` bits. */
  live: number[]
  /** What the wire actually carried, for each decided bit. */
  busBits: number[]
}

/**
 * One round of arbitration, resolved a bit at a time.
 *
 * Three units start talking at once; the lowest identifier survives. The others
 * stop — and, crucially, the winner never restarts. On a bus that merely
 * detected collisions, everyone would back off and try again, and the wire
 * would get slower exactly when it was busiest. Here the highest-priority
 * message always gets through within a bounded time — at worst one frame
 * already on the wire, since CAN does not pre-empt a frame in flight — which
 * is what makes it usable for brakes.
 *
 * The mechanism used to be invisible. `winner` was computed up front and
 * applied from phase 0, so the scene showed the *result* before the process
 * that produces it — teaching "one of them is special" rather than "the lower
 * number wins" — and `PRIORITY`, which decides every round, never reached the
 * screen at all.
 *
 * Now it resolves the way the real thing does: every unit puts its identifier
 * on the wire one bit at a time, a 0 always beats a 1 because 0 is the dominant
 * level, and any unit that sends a 1 while hearing a 0 knows it has lost and
 * stops. Nothing needs to be told who won; each loser works it out for itself,
 * which is why this needs no arbiter and no retry.
 */
export function arbitrationAt(t: number): Arbitration {
  const round = Math.floor(t / ROUND)
  const phase = (t % ROUND) / ROUND
  // A different trio contends each round, deterministically.
  const contenders = [0, 1, 2].map((k) => (round * 3 + k * 4) % UNITS)

  const ARB_ENDS = 0.32
  const resolved =
    phase >= ARB_ENDS ? ID_BITS : Math.floor((phase / ARB_ENDS) * ID_BITS)

  // Walk the decided bits, dropping units as they lose.
  let live = [...contenders]
  const busBits: number[] = []
  for (let k = 0; k < resolved; k++) {
    const bus = Math.min(...live.map((u) => idBits(u)[k]))
    busBits.push(bus)
    live = live.filter((u) => idBits(u)[k] === bus)
  }

  let winner = contenders[0]
  for (const c of contenders) if (PRIORITY[c] < PRIORITY[winner]) winner = c

  return {
    phase,
    winner,
    contenders,
    arbitrating: phase < ARB_ENDS,
    resolved,
    live,
    busBits,
  }
}

/** The lockstep pair, and the rare moment they disagree. */
export const LOCKSTEP_PERIOD = 7.5
export function lockstepAt(t: number) {
  const c = t % LOCKSTEP_PERIOD
  const diverged = c > 5.6 && c < 6.3
  return { diverged, beat: (t * 2.2) % 1 }
}
