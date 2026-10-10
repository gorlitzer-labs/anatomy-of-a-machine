import { useLayoutEffect, useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'

/**
 * Packets moving through a scene.
 *
 * The boilerplate — an instanced mesh, a scratch Object3D, composing a matrix
 * per packet, remembering `needsUpdate` on two buffers — was written out in
 * four scenes. What actually differs between them is one function: where packet
 * `i` is at time `t`. That function is the *content*, because how a machine
 * moves data is the thing each chapter is arguing about, so it stays in the
 * scene and everything around it lives here.
 *
 * Deliberately not a "particle system". There is no emission, no lifetime and
 * no randomness; a packet is a deterministic function of index and time, which
 * is what makes the motion reproducible and therefore teachable.
 */

export type Packet = {
  x: number
  y: number
  z: number
  /** Index into `hues`. */
  hue: number
  /** Hidden when false — scaled away rather than moved off-screen. */
  on: boolean
  /** Radius. Falls back to the component's `size`. */
  scale?: number
  /** Colour multiplier. Above 1 crosses the bloom threshold and glows. */
  bright?: number
}

type FlowProps = {
  count: number
  /**
   * Where packet `i` is at time `t`.
   *
   * Mutates and returns `out` rather than allocating: this runs `count` times
   * per frame, and a fresh object per packet per frame is exactly the kind of
   * garbage that shows up as periodic stutter in a WebGL loop.
   */
  at: (i: number, t: number, out: Packet) => Packet
  hues: THREE.Color[]
  /** Default radius when a packet does not specify one. */
  size?: number
  /** Default colour multiplier. */
  brightness?: number
  /**
   * Names this flow for the dev probe.
   *
   * Packet motion is otherwise unmeasurable from outside: the instances sit in
   * a mesh with no scene-graph position of their own, and the surrounding
   * scenes animate continuously, so neither bounding boxes nor frame diffs can
   * tell whether the traffic itself is doing what a beat claims.
   */
  probe?: string
}

export function Flow({ count, at, hues, size = 0.05, brightness = 2, probe }: FlowProps) {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tint = useMemo(() => new THREE.Color(), [])
  const out = useMemo<Packet>(() => ({ x: 0, y: 0, z: 0, hue: 0, on: false }), [])

  useLayoutEffect(() => {
    for (let i = 0; i < count; i++) mesh.current.setColorAt(i, hues[0] ?? new THREE.Color('#ffffff'))
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [count, hues])

  useSceneFrame((state) => {
    const t = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      out.on = false
      out.scale = undefined
      out.bright = undefined
      const p = at(i, t, out)

      if (p.on) {
        dummy.position.set(p.x, p.y, p.z)
        dummy.scale.setScalar(p.scale ?? size)
      } else {
        /* Parked at the group's own origin, not wherever the caller last put
           it. A zero-scale instance is invisible but its *position* still
           counts toward the mesh's bounding volume, so callers parking spare
           packets below the floor were quietly stretching the scene's bounds
           downward — which inflates the shadow camera, defeats frustum culling,
           and skews every framing measurement taken against the scene. */
        dummy.position.set(0, 0, 0)
        dummy.scale.setScalar(0.0001)
      }
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)

      tint
        .copy(hues[p.hue] ?? hues[0] ?? new THREE.Color('#ffffff'))
        .multiplyScalar(p.on ? (p.bright ?? brightness) : 0)
      mesh.current.setColorAt(i, tint)
    }

    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true

    if (import.meta.env.DEV && probe) {
      const w = window as unknown as Record<string, unknown>
      const store = (w.__flow ??= {}) as Record<string, unknown>
      const live: Array<[number, number, number]> = []
      for (let i = 0; i < count && live.length < 8; i++) {
        out.on = false
        const p = at(i, t, out)
        if (p.on) live.push([+p.x.toFixed(3), +p.y.toFixed(3), +p.z.toFixed(3)])
      }
      store[probe] = live
    }
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial />
    </instancedMesh>
  )
}
