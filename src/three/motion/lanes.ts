import * as THREE from 'three'

/**
 * Routes on a flat plane, and how to walk them.
 *
 * Every chapter that shows data moving describes the route the same way — a
 * polyline in xz — and then needs the same two things from it: geometry to draw
 * the wire, and a position at 0..1 along it to put a packet. That had been
 * written three times (fabric interconnect, board traces, cell wiring), with
 * the sampler duplicated byte-for-byte between `boardLayout` and `cellLayouts`
 * and a third copy about to be written for the memory ladder.
 */

/** A route, as points in the xz plane. */
export type Lane = Array<[number, number]>

export function laneLength(lane: Lane) {
  let total = 0
  for (let i = 0; i < lane.length - 1; i++) {
    total += Math.hypot(lane[i + 1][0] - lane[i][0], lane[i + 1][1] - lane[i][1])
  }
  return total
}

/**
 * Position at `u` (0..1) along a lane, measured by arc length.
 *
 * By arc length rather than by segment index on purpose: stepping per segment
 * makes packets bunch on short segments and stretch on long ones, which on the
 * board's length-matched memory lanes reads as the bus stuttering.
 */
export function sampleLane(lane: Lane, u: number): [number, number] {
  const total = laneLength(lane)
  let want = (u < 0 ? 0 : u > 1 ? 1 : u) * total
  for (let i = 0; i < lane.length - 1; i++) {
    const len = Math.hypot(lane[i + 1][0] - lane[i][0], lane[i + 1][1] - lane[i][1])
    if (want <= len || i === lane.length - 2) {
      const f = len > 0 ? want / len : 0
      return [
        lane[i][0] + (lane[i + 1][0] - lane[i][0]) * f,
        lane[i][1] + (lane[i + 1][1] - lane[i][1]) * f,
      ]
    }
    want -= len
  }
  return lane[lane.length - 1]
}

/** Total segment count across a set of lanes, for sizing a buffer up front. */
export const segmentCount = (lanes: Lane[]) =>
  lanes.reduce((n, lane) => n + Math.max(lane.length - 1, 0), 0)

/**
 * `lineSegments` geometry for a set of lanes, laid flat at height `y`.
 *
 * Lines rather than extruded geometry because what these teach is topological —
 * what connects to what, and how far it has to go. Etched copper at the camera
 * distances this course uses is a texture nobody can read.
 */
export function laneGeometry(lanes: Lane[], y: number): THREE.BufferGeometry {
  const positions = new Float32Array(segmentCount(lanes) * 6)
  let o = 0
  for (const lane of lanes) {
    for (let i = 0; i < lane.length - 1; i++) {
      positions[o++] = lane[i][0]
      positions[o++] = y
      positions[o++] = lane[i][1]
      positions[o++] = lane[i + 1][0]
      positions[o++] = y
      positions[o++] = lane[i + 1][1]
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

/**
 * A buffer of line segments that can be re-pointed each frame.
 *
 * Only the architectures chapter needs this — its interconnect damps toward a
 * new topology so the wiring reads as physically re-routing rather than cutting
 * — but the allocation and the write-back are the same shape as the static
 * case, so they live together.
 */
export function mutableLaneGeometry(capacity: number): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(capacity * 6), 3))
  return geometry
}
