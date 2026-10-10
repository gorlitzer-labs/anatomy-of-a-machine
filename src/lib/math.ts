import * as THREE from 'three'

/**
 * Framerate-independent damping. `lambda` is roughly "how fast", and the result
 * is identical at 60fps and 144fps — unlike a naive `lerp(a, b, 0.1)`, which
 * converges twice as fast on a 120Hz display.
 */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(current, target, lambda, dt)
}

export function damp3(
  current: THREE.Vector3,
  target: THREE.Vector3 | [number, number, number],
  lambda: number,
  dt: number,
) {
  const [tx, ty, tz] = Array.isArray(target) ? target : [target.x, target.y, target.z]
  current.set(
    THREE.MathUtils.damp(current.x, tx, lambda, dt),
    THREE.MathUtils.damp(current.y, ty, lambda, dt),
    THREE.MathUtils.damp(current.z, tz, lambda, dt),
  )
  return current
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

export const smoothstep = (v: number) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

export const lerp = THREE.MathUtils.lerp

export const clamp = THREE.MathUtils.clamp

/**
 * Smoothstep's better-behaved sibling: zero first *and* second derivative at
 * both ends.
 *
 * Used for the step-to-step camera move. Plain smoothstep still has a jerk in
 * acceleration at the endpoints, and with the camera holding perfectly still on
 * either side of the move that jerk is the one moment where the motion reads as
 * mechanical rather than as a settle.
 */
export const smootherstep = (v: number) => {
  const t = clamp01(v)
  return t * t * t * (t * (t * 6 - 15) + 10)
}
