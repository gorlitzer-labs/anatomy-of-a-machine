import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { updateDriver } from '../driver'
import { instanceNameHandlers } from '../naming'
import { Flow, type Packet } from '../motion/Flow'
import { mutableLaneGeometry } from '../motion/lanes'
import { damp } from '../../lib/math'
import {
  activity,
  blankCells,
  FPGA_REROUTE,
  linksFor,
  packetAt,
  C,
  CELL_COUNT,
  DIE,
  KINDS,
  LAYOUTS,
  LINK_COUNT,
  PACKET_COUNT,
  SPECTRUM,
  type FabricKind,
} from './fabricLayouts'
import { cellFace, roundedBox, siliconMap } from '../surfaces'

/**
 * One piece of silicon, re-tiled six ways.
 *
 * Three layers, all morphing between architectures rather than being swapped:
 *
 *   1. blocks       — the floorplan
 *   2. interconnect — what wires the blocks together
 *   3. packets      — how work actually moves
 *
 * The third layer is the one that earns its keep. Tiling alone made every
 * architecture read as "squares, but a different size", because what separates
 * a CPU from a GPU from a systolic array is not block shape — it is the
 * movement: erratic and stalling, versus each group of lanes stepping at once, versus
 * two streams marching through a fixed grid.
 */
/** Routing layer height — above the tallest block so the wiring is visible. */
const LINK_Y = 0.4

/**
 * Every focus value that means "this die is the subject".
 *
 * `cycle` rides along with the architecture names so the closing beat does not
 * dim the very die it is asking the reader to watch — an unmatched focus is
 * treated as "something else is spotlit".
 */
const FOCUSES = [...KINDS, 'cycle']

const HUES = [
  new THREE.Color('#7fe9ff'), // signals / activations
  new THREE.Color('#ff9ade'), // weights, memory traffic
  new THREE.Color('#8dffc4'), // reconfigurable routing
]

export function FabricScene() {
  const blocks = useRef<THREE.InstancedMesh>(null!)

  /* Lit blocks that still glow per instance.
     They were unlit (`meshBasicMaterial`), which made the whole floorplan a
     flat mosaic: no top, no side, no sense that these are blocks standing on a
     die. A standard material gives them form, and one line of shader routes the
     per-instance colour into the emissive as well as the diffuse, so the
     activity function that decides how bright each block is still decides it —
     the motion is untouched, the blocks just have a shape now. */
  const blockMaterial = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: '#9aa0a8',
      roughness: 0.34,
      metalness: 0.3,
      emissive: '#ffffff',
      emissiveIntensity: 0.8,
      emissiveMap: cellFace(),
    })
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        #if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
          totalEmissiveRadiance *= vColor.rgb;
        #endif`,
      )
    }
    return m
  }, [])

  const current = useMemo(() => blankCells(), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tint = useMemo(() => new THREE.Color(), [])
  const target = useRef<FabricKind>('cpu')

  /* Which block the pointer is on decides what it is called, because the same
     instance is a CPU core in one beat and a multiply–accumulate cell in the
     next. Unused instances are parked at zero scale and return null, so the
     empty half of a sparse floorplan stays silent instead of putting a card
     over blank space. */
  const named = useMemo(
    () =>
      instanceNameHandlers('fabric', (i) => {
        const cell = LAYOUTS[target.current]?.[i]
        return !cell || cell.sx < 0.01 ? null : cell.role
      }),
    [],
  )

  // Interconnect vertices are damped toward their target, so changing
  // architecture reads as the wiring physically re-routing rather than cutting.
  const linkGeo = useMemo(() => mutableLaneGeometry(LINK_COUNT), [])
  const linkTarget = useMemo(() => new Float32Array(LINK_COUNT * 6), [])

  useLayoutEffect(() => {
    for (let i = 0; i < CELL_COUNT; i++) blocks.current.setColorAt(i, C.core)
    if (blocks.current.instanceColor) blocks.current.instanceColor.needsUpdate = true
  }, [])

  /* Reads the architecture through the ref the main loop maintains. Flow's
     frame callback is registered by a child, so it runs after this component's
     and always sees the current value. */
  const flow = useCallback((i: number, t: number, out: Packet): Packet => {
    const p = packetAt(target.current, i, t)
    out.x = p.x
    out.y = p.y
    out.z = p.z
    out.on = p.on > 0
    out.hue = p.hue
    out.scale = 0.075
    out.bright = 2.4
    return out
  }, [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    if (d.focus === 'cycle') {
      /* The closing beat has no single subject: it is the argument of the whole
         chapter, so the die walks the five machines on a loop. Showing them
         side by side would need five dies and lose the one thing that makes the
         point — that this is the *same* silicon, re-tiled. */
      target.current = SPECTRUM[Math.floor(state.clock.elapsedTime / 4.5) % SPECTRUM.length]
    } else if (KINDS.includes(d.focus as FabricKind)) {
      target.current = d.focus as FabricKind
    }
    const kind = target.current
    if (import.meta.env.DEV) {
      // Which architecture the die is currently wearing. The scene bounding box
      // cannot answer this — it is dominated by the fixed base plate, so it
      // barely moves while the blocks re-tile underneath.
      ;(window as unknown as Record<string, unknown>).__fabric = () => target.current
    }
    const want = LAYOUTS[kind]
    const t = state.clock.elapsedTime

    /* ---- blocks ---- */
    for (let i = 0; i < CELL_COUNT; i++) {
      const cur = current[i]
      const to = want[i]

      cur.x = damp(cur.x, to.x, 6, dt)
      cur.z = damp(cur.z, to.z, 6, dt)
      cur.sx = damp(cur.sx, to.sx, 6, dt)
      cur.sz = damp(cur.sz, to.sz, 6, dt)
      cur.sy = damp(cur.sy, to.sy, 6, dt)
      cur.color.lerp(to.color, 1 - Math.exp(-6 * dt))

      dummy.position.set(cur.x, cur.sy / 2, cur.z)
      dummy.scale.set(Math.max(cur.sx, 0.0001), Math.max(cur.sy, 0.0001), Math.max(cur.sz, 0.0001))
      dummy.updateMatrix()
      blocks.current.setMatrixAt(i, dummy.matrix)

      // Pushed above 1 so lit blocks clear the bloom threshold.
      tint.copy(cur.color).multiplyScalar(0.5 + activity(to.role, i, t, kind) * 1.5)
      blocks.current.setColorAt(i, tint)
    }
    blocks.current.instanceMatrix.needsUpdate = true
    if (blocks.current.instanceColor) blocks.current.instanceColor.needsUpdate = true

    /* ---- interconnect ---- */
    // The FPGA rewires itself on a slow beat; every other topology is fixed and
    // only moves when the architecture changes.
    const phase = kind === 'fpga' ? Math.floor(t / FPGA_REROUTE) : 0
    const spec = linksFor(kind, phase)
    for (let i = 0; i < LINK_COUNT; i++) {
      const o = i * 6
      const s = spec[i]
      if (!s) {
        // Unused segments park below the die instead of collapsing to origin,
        // where they would draw a bright knot in the middle of the floorplan.
        linkTarget[o] = linkTarget[o + 3] = 0
        linkTarget[o + 1] = linkTarget[o + 4] = -4
        linkTarget[o + 2] = linkTarget[o + 5] = 0
      } else {
        linkTarget[o] = s[0]
        linkTarget[o + 1] = LINK_Y
        linkTarget[o + 2] = s[1]
        linkTarget[o + 3] = s[2]
        linkTarget[o + 4] = LINK_Y
        linkTarget[o + 5] = s[3]
      }
    }
    const pos = linkGeo.getAttribute('position') as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    const k = 1 - Math.exp(-7 * dt)
    for (let i = 0; i < arr.length; i++) arr[i] += (linkTarget[i] - arr[i]) * k
    pos.needsUpdate = true
  })

  return (
    <Part id="fabric" tags={FOCUSES} position={[0, 0, 0]}>
      {/* The die itself: the same polished, faintly iridescent silicon as the
          die in the package chapter, because it is meant to be the same stuff. */}
      <mesh position={[0, -0.06, 0]} receiveShadow castShadow geometry={roundedBox(DIE + 0.5, 0.12, DIE + 0.5, 0.04)}>
        <meshPhysicalMaterial attach="material-0" color="#141a26" roughness={0.3} metalness={0.6} />
        <meshPhysicalMaterial attach="material-1" color="#141a26" roughness={0.3} metalness={0.6} />
        <meshPhysicalMaterial
          attach="material-2"
          color="#9aa4b8"
          map={siliconMap()}
          roughness={0.24}
          metalness={0.7}
          iridescence={0.3}
          iridescenceIOR={1.7}
          iridescenceThicknessRange={[240, 620]}
        />
        <meshPhysicalMaterial attach="material-3" color="#141a26" roughness={0.3} metalness={0.6} />
        <meshPhysicalMaterial attach="material-4" color="#141a26" roughness={0.3} metalness={0.6} />
        <meshPhysicalMaterial attach="material-5" color="#141a26" roughness={0.3} metalness={0.6} />
      </mesh>

      <lineSegments geometry={linkGeo}>
        <lineBasicMaterial color="#68b6da" transparent opacity={0.85} />
      </lineSegments>

      {/* Hover resolves through the instance id to what that block is *doing*
          in the current layout, rather than to a fixed name. It has to work
          this way round: there are 256 blocks and they change role every time
          the architecture does, so the same instance is a CPU core in one beat
          and a multiply-accumulate cell in the next. */}
      <instancedMesh
        ref={blocks}
        args={[roundedBox(1, 1, 1, 0.12, 2), blockMaterial, CELL_COUNT]}
        castShadow
        receiveShadow
        {...named}
      />

      <Flow count={PACKET_COUNT} at={flow} hues={HUES} />
    </Part>
  )
}
