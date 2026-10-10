import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { useNamer } from '../naming'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { Flow, type Packet } from '../motion/Flow'
import { roundedBox } from '../surfaces'
import { damp } from '../../lib/math'
import {
  C,
  CAP_MW,
  SITES_PER_THREAD,
  SITE_REACH,
  SKULL,
  SKULL_U,
  SKULL_Y,
  SOC,
  SOC_Y,
  THREADS,
  TIP_Y,
  TISSUE,
  modeFor,
  outPoint,
  threadEnds,
  threadPoint,
} from './implantLayout'

/**
 * A computer inside a skull.
 *
 * Two ceilings, and the scene is built so both are visible at once wherever
 * that is honest: a bar that activity pushes toward a line it must not cross,
 * and a constriction that far more signal arrives at than can leave.
 *
 * The traffic runs on the page clock, deliberately — it is a steady state, and
 * a steady state has no beginning for a reader to miss. The thermal demand runs
 * on beat time, because a budget being pushed until it refuses is a one-shot
 * event and is exactly the kind of thing a free-running loop hides.
 *
 * THE LOOK is Lecture 1's, carried to the one subject in the course that is
 * partly alive: the hardware is machined and lacquered like every other part,
 * and what it is inside is drawn as a specimen — a wet, translucent block of
 * tissue under a section of bone with its three layers showing. Nothing here
 * moves that did not move before, and nothing lights that did not light.
 */

const IN_COUNT = 96
const OUT_COUNT = 26

export function ImplantScene() {
  return (
    <Part
      id="implant"
      tags={['sealed', 'array', 'warm', 'budget', 'nofan', 'raw', 'pipe', 'spikes', 'inside', 'everything']}
      position={[0, 0, 0]}
    >
      <Tissue />
      <Threads />
      <Soc />
      <Skull />
      <Traffic />
      <Thermal />
    </Part>
  )
}

/* ------------------------------------------------------------------ */
/* Surfaces, painted for this scene alone                               */
/* ------------------------------------------------------------------ */

/*
 * The shared painter in `surfaces.ts` is private to that module, and this
 * lecture's surfaces are its own — bone, a sealed can's floorplan, a gauge's
 * scale — so they are painted here the same way: once, lazily, deterministic.
 */
const textures = new Map<string, THREE.CanvasTexture>()

function painted(key: string, w: number, h: number, paint: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
  const hit = textures.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  paint(canvas.getContext('2d')!, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  textures.set(key, tex)
  return tex
}

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

/**
 * Bone, in plan. Compact bone is a pale, fine-grained surface with pores in
 * it; the spongy layer between the two tables is the same material full of
 * holes. One painter, two densities.
 */
function boneMap(kind: 'table' | 'diploe') {
  return painted(`implant-bone-${kind}`, 1024, 1024, (c, w, h) => {
    const r = rng(kind === 'table' ? 1707 : 1717)
    c.fillStyle = kind === 'table' ? '#b9ab95' : '#8a7058'
    c.fillRect(0, 0, w, h)
    // Growth rings round the hole the plate was cut around, faint.
    for (let k = 0; k < 40; k++) {
      c.strokeStyle = `rgba(${kind === 'table' ? '90,76,60' : '60,40,28'},${0.05 + r() * 0.06})`
      c.lineWidth = 2 + r() * 5
      c.beginPath()
      c.arc(w / 2, h / 2, (k / 40) * w * 0.5 + r() * 6, 0, Math.PI * 2)
      c.stroke()
    }
    const pores = kind === 'table' ? 2600 : 5200
    for (let i = 0; i < pores; i++) {
      const x = r() * w
      const y = r() * h
      const s = kind === 'table' ? 0.6 + r() * 1.6 : 1.5 + r() * 5
      c.fillStyle = kind === 'table' ? `rgba(70,56,42,${0.25 + r() * 0.35})` : `rgba(38,22,14,${0.4 + r() * 0.4})`
      c.beginPath()
      c.ellipse(x, y, s, s * (0.6 + r() * 0.4), r() * Math.PI, 0, Math.PI * 2)
      c.fill()
    }
    // A few lighter flecks, so it reads as mineral rather than as paint.
    for (let i = 0; i < 900; i++) {
      c.fillStyle = `rgba(236,226,206,${0.1 + r() * 0.2})`
      c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2)
    }
  })
}

/**
 * Where the skull glows when it is the subject: at the hole, fading outward.
 * The boundary is what stops the signal, and the hole is where it is stopped,
 * so that is where the light gathers. A floor keeps the whole plate readable
 * as one lit thing, as it was.
 */
function skullGlow() {
  return painted('implant-skull-glow', 512, 512, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    const hole = SKULL.hole / SKULL.r
    g.addColorStop(0, '#ffffff')
    g.addColorStop(hole, '#ffffff')
    g.addColorStop(hole + 0.12, '#c4c4c4')
    g.addColorStop(hole + 0.5, '#6e6e6e')
    g.addColorStop(1, '#484848')
    c.fillStyle = g
    c.fillRect(0, 0, w, h)
  })
}

/**
 * The chip's face, in plan, as an emissive map: sixty-four amplifiers round the
 * rim — one per thread, the count at full scale again — a ring of digitisers
 * inside them, and the processing at the centre with the radio beside it.
 *
 * Still not a real die photograph and not pretending to be: it is the order in
 * which the signal is handled, laid out from the edge inward, which is the
 * order the next chapter argues about.
 */
function socFace() {
  return painted('implant-soc-face', 1024, 1024, (c, w, h) => {
    const cx = w / 2
    const cy = h / 2
    const R = w / 2
    const r = rng(2417)
    c.fillStyle = '#0c0c0c'
    c.fillRect(0, 0, w, h)

    // The weld seam round the lid.
    c.strokeStyle = '#8c8c8c'
    c.lineWidth = 10
    c.beginPath()
    c.arc(cx, cy, R * 0.965, 0, Math.PI * 2)
    c.stroke()
    c.strokeStyle = '#2e2e2e'
    c.lineWidth = 3
    c.beginPath()
    c.arc(cx, cy, R * 0.93, 0, Math.PI * 2)
    c.stroke()

    // Routing from each amplifier in toward the digitisers.
    c.strokeStyle = '#343434'
    c.lineWidth = 2
    for (let i = 0; i < THREADS; i++) {
      const a = (i / THREADS) * Math.PI * 2
      c.beginPath()
      c.moveTo(cx + Math.cos(a) * R * 0.7, cy + Math.sin(a) * R * 0.7)
      c.lineTo(cx + Math.cos(a) * R * 0.6, cy + Math.sin(a) * R * 0.6)
      c.stroke()
    }

    // Sixty-four amplifiers.
    for (let i = 0; i < THREADS; i++) {
      const a = (i / THREADS) * Math.PI * 2
      c.save()
      c.translate(cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8)
      c.rotate(a)
      c.fillStyle = '#b4b4b4'
      c.fillRect(-R * 0.085, -R * 0.022, R * 0.17, R * 0.044)
      c.fillStyle = '#5a5a5a'
      c.fillRect(-R * 0.07, -R * 0.008, R * 0.06, R * 0.016)
      c.fillRect(R * 0.01, -R * 0.008, R * 0.06, R * 0.016)
      c.restore()
    }

    // Sixteen digitisers, each serving four channels.
    for (let i = 0; i < 16; i++) {
      const a0 = (i / 16) * Math.PI * 2 + 0.035
      const a1 = ((i + 1) / 16) * Math.PI * 2 - 0.035
      c.fillStyle = '#7a7a7a'
      c.beginPath()
      c.arc(cx, cy, R * 0.6, a0, a1)
      c.arc(cx, cy, R * 0.49, a1, a0, true)
      c.closePath()
      c.fill()
      c.strokeStyle = '#3a3a3a'
      c.lineWidth = 2
      for (let k = 1; k < 4; k++) {
        const a = a0 + ((a1 - a0) * k) / 4
        c.beginPath()
        c.moveTo(cx + Math.cos(a) * R * 0.49, cy + Math.sin(a) * R * 0.49)
        c.lineTo(cx + Math.cos(a) * R * 0.6, cy + Math.sin(a) * R * 0.6)
        c.stroke()
      }
    }

    // The processing: a grid of identical detectors, the brightest thing here.
    const core = R * 0.5
    c.fillStyle = '#1a1a1a'
    c.fillRect(cx - core * 0.62, cy - core * 0.62, core * 1.1, core * 1.24)
    const n = 12
    const cell = (core * 1.02) / n
    for (let gx = 0; gx < n; gx++) {
      for (let gy = 0; gy < n; gy++) {
        const v = 170 + Math.floor(r() * 70)
        c.fillStyle = `rgb(${v},${v},${v})`
        c.fillRect(cx - core * 0.58 + gx * cell, cy - core * 0.58 + gy * (cell * 1.12), cell * 0.78, cell * 0.9)
      }
    }
    // The radio, and the power supply, beside it.
    c.fillStyle = '#e6e6e6'
    c.fillRect(cx + core * 0.56, cy - core * 0.6, core * 0.3, core * 0.6)
    c.fillStyle = '#9a9a9a'
    c.fillRect(cx + core * 0.56, cy + core * 0.08, core * 0.3, core * 0.52)
    c.strokeStyle = '#444'
    c.lineWidth = 3
    for (let k = 0; k < 5; k++) {
      c.beginPath()
      c.moveTo(cx + core * 0.6, cy + core * (0.16 + k * 0.1))
      c.lineTo(cx + core * 0.82, cy + core * (0.16 + k * 0.1))
      c.stroke()
    }
  })
}

/**
 * The gauge's scale: a tick every 5 mW, a long one every 10, drawn from the
 * same cap the bar is scaled against — so the ticks are the bar's own units
 * rather than a pattern that happens to look like a ruler.
 */
function gaugeScale() {
  return painted('implant-gauge', 128, 1024, (c, w, h) => {
    c.fillStyle = '#101010'
    c.fillRect(0, 0, w, h)
    for (let mW = 0; mW <= CAP_MW; mW += 5) {
      const y = h - (mW / CAP_MW) * h
      const major = mW % 10 === 0
      c.fillStyle = major ? '#c8c8c8' : '#6a6a6a'
      const len = major ? w * 0.42 : w * 0.24
      c.fillRect(0, Math.min(h - 6, Math.max(0, y - 3)), len, 6)
      c.fillRect(w - len, Math.min(h - 6, Math.max(0, y - 3)), len, 6)
    }
  })
}

/** A soft dark pool, for the shadow the specimen would cast on whatever it stands on. */
function pool() {
  return painted('implant-pool', 256, 256, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(0,0,0,0.85)')
    g.addColorStop(0.55, 'rgba(0,0,0,0.5)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    c.fillStyle = g
    c.fillRect(0, 0, w, h)
  })
}

/* ------------------------------------------------------------------ */
/* Geometry                                                             */
/* ------------------------------------------------------------------ */

const plates = new Map<string, THREE.BufferGeometry>()

/**
 * A disc — or a ring, with `hole` > 0 — with rounded edges, `h` thick and
 * centred on y = 0. Its UVs are its plan position across the full diameter, so
 * one texture paints the top, and the rim and the hole wall sample the edge of
 * that same painting: a radial pattern stays radial all the way round.
 */
function plate(r: number, hole: number, h: number, bevel = 0.02) {
  const key = `${r}|${hole}|${h}|${bevel}`
  let g = plates.get(key)
  if (!g) {
    const s = new THREE.Shape()
    s.absarc(0, 0, r - bevel, 0, Math.PI * 2, false)
    if (hole > 0) {
      const p = new THREE.Path()
      p.absarc(0, 0, hole + bevel, 0, Math.PI * 2, true)
      s.holes.push(p)
    }
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: h - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 72,
    })
    geo.translate(0, 0, bevel)
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, -h / 2, 0)
    const pos = geo.attributes.position
    const uv = geo.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, pos.getX(i) / (2 * r) + 0.5, 0.5 - pos.getZ(i) / (2 * r))
    }
    uv.needsUpdate = true
    geo.computeVertexNormals()
    g = geo
    plates.set(key, g)
  }
  return g
}

/* ------------------------------------------------------------------ */
/* The specimen                                                         */
/* ------------------------------------------------------------------ */

/** The thing the machine is inside. */
/* Deliberately not nameable.
   It is a transparent volume that *encloses* the threads and the chip, so the
   pointer hits its front face before anything inside it and the nearest hit
   wins — naming it made every part of the implant unreachable, which is the
   opposite of the intent. The tissue is described by the copy; what the reader
   can point at is the hardware in it. */
function Tissue() {
  const shadow = useMemo(pool, [])
  const height = SKULL_Y - TIP_Y
  return (
    <group>
      {/* Wet and translucent, with rounded edges that catch a line of light:
          a specimen block, rather than a tinted box. It writes no depth, so
          everything inside it draws as though it were not there. */}
      <mesh position={[0, TISSUE.y, 0]} geometry={roundedBox(TISSUE.w, height, TISSUE.w, 0.14, 4)} renderOrder={1}>
        <meshPhysicalMaterial
          color={C.tissue}
          roughness={0.55}
          clearcoat={1}
          clearcoatRoughness={0.18}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
      {/* The pool it would leave on a bench. Not a floor: nothing is drawn
          outside the block's own footprint. */}
      <mesh position={[0, TISSUE.y - height / 2 - 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TISSUE.w * 1.08, TISSUE.w * 1.08]} />
        <meshBasicMaterial map={shadow} transparent opacity={0.8} depthWrite={false} />
      </mesh>
    </group>
  )
}

/**
 * Sixty-four threads, and all sixty-four are drawn.
 *
 * The count is one of the few things about this device that can be shown at
 * full scale, so it is — unlike the bandwidth, which is compressed by a factor
 * the copy states. So are the recording sites: sixteen down the far end of
 * each thread, 1,024 in all, as small bright platinum beads. They are never
 * lit; what the thread hears is still the thread's own glow.
 */
function Threads() {
  const named = useNamer('implant')
  const group = useRef<THREE.Group>(null!)
  const sites = useRef<THREE.InstancedMesh>(null!)

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    let k = 0
    for (let i = 0; i < THREADS; i++) {
      for (let s = 0; s < SITES_PER_THREAD; s++) {
        // From just above the tip, evenly up the reach of the recording end.
        const u = 0.02 + (s / (SITES_PER_THREAD - 1)) * SITE_REACH
        m.makeTranslation(...threadPoint(i, u))
        sites.current.setMatrixAt(k++, m)
      }
    }
    sites.current.instanceMatrix.needsUpdate = true
    sites.current.computeBoundingSphere()
  }, [])

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const m = modeFor(d.motion, d.beatTime)
    const t = state.clock.elapsedTime

    group.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
      /* Each thread's brightness is its own activity, staggered so the array
         reads as sixty-four independent listeners rather than one object that
         pulses. On the spike beats most of them are dark, because most neurons
         are not firing at any given instant and that sparsity is what makes the
         reduction possible at all. */
      const own = Math.sin(t * 1.7 + i * 2.399) * 0.5 + 0.5
      const live = m.detected ? own > 0.86 : own > 1 - m.inbound
      setEmissive(mat, live ? 1.5 : 0.14)
    })

    if (import.meta.env.DEV) {
      /* Counts packets actually on screen on each side of the constriction.
         The funnel is the whole lecture and its ratio is stated in the copy, so
         the ratio has to be something measured rather than something asserted —
         and `Flow`'s own probe caps at eight samples, which is below the
         inbound count here. Lives on the threads because they are the one part
         of this scene visible on every beat. */
      ;(window as unknown as Record<string, unknown>).__funnel = () => {
        let inCount = 0
        for (let i = 0; i < IN_COUNT; i++) {
          const own = Math.sin(t * 1.7 + (i % THREADS) * 2.399) * 0.5 + 0.5
          if (m.detected ? own > 0.86 : own > 1 - m.inbound) inCount++
        }
        let outCount = 0
        for (let i = 0; i < OUT_COUNT; i++) if (i / OUT_COUNT < m.admitted) outCount++
        return {
          motion: d.motion,
          in: inCount,
          out: outCount,
          ratio: outCount > 0 ? +(inCount / outCount).toFixed(1) : Infinity,
          threadsLit: group.current.children.filter(
            (c) =>
              ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).emissiveIntensity > 1,
          ).length,
          sites: sites.current.count,
        }
      }
    }
  })

  return (
    <>
      {/* Only threads go in here: the frame loop above walks these children. */}
      <group ref={group}>
        {Array.from({ length: THREADS }, (_, i) => {
          const { from, to } = threadEnds(i)
          const mid = new THREE.Vector3(...from).lerp(new THREE.Vector3(...to), 0.5)
          const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from))
          const len = dir.length()
          /* Oriented along the thread's own two ends rather than drawn straight
             up, so a packet computed from the same two ends travels along the
             wire instead of beside it. */
          const q = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            dir.normalize(),
          )
          return (
            <mesh key={i} position={mid.toArray()} quaternion={q} {...named('implant:thread')}>
              {/* Finer at the tip than where it meets the chip, as a thread
                  that has to slip between blood vessels is. */}
              <cylinderGeometry args={[0.014, 0.009, len, 8]} />
              <meshPhysicalMaterial
                color="#12313d"
                emissive={C.thread}
                emissiveIntensity={0.4}
                roughness={0.35}
                clearcoat={0.8}
                clearcoatRoughness={0.2}
              />
            </mesh>
          )
        })}
      </group>
      <instancedMesh
        ref={sites}
        args={[undefined, undefined, THREADS * SITES_PER_THREAD]}
        {...named('implant:thread')}
      >
        <sphereGeometry args={[0.011, 8, 6]} />
        <meshStandardMaterial color="#a9b3bd" metalness={1} roughness={0.3} />
      </instancedMesh>
    </>
  )
}

/**
 * The processor. Small, and doing the work that cannot be done anywhere else.
 *
 * A sealed can: a titanium wall round a lid that carries the chip's face, with
 * a connector ring underneath where the sixty-four threads come in. The glow is
 * the face's — amplifiers, digitisers, processing — and it follows the same two
 * levels it always has.
 */
function Soc() {
  const named = useNamer('implant')
  const disc = useRef<THREE.Mesh>(null!)
  const face = useMemo(socFace, [])

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const m = modeFor(d.motion, d.beatTime)
    const mat = disc.current.material as THREE.MeshStandardMaterial
    /* Brightest when it is detecting spikes, because that is the beat where the
       processor is the answer rather than a component. It is otherwise steady:
       a chip that pulses for decoration was removed everywhere else in this
       course and is not reintroduced here. */
    setEmissive(mat, m.detected ? 1.5 : 0.55)
  })

  return (
    <group position={[0, SOC_Y, 0]}>
      <mesh ref={disc} castShadow geometry={plate(SOC.r, 0, SOC.h, 0.03)} {...named('implant:soc')}>
        <meshPhysicalMaterial
          color="#1b1630"
          emissive={C.soc}
          emissiveMap={face}
          emissiveIntensity={0.55}
          roughness={0.34}
          metalness={0.3}
          clearcoat={0.7}
          clearcoatRoughness={0.14}
        />
      </mesh>
      {/* The can's wall, standing a little proud of the lid. */}
      <mesh castShadow receiveShadow geometry={plate(SOC.wall, SOC.r - 0.012, SOC.h + 0.04, 0.02)}>
        <meshStandardMaterial color="#8e959d" metalness={1} roughness={0.3} />
      </mesh>
      {/* Where the threads land: a machined ring under the can. */}
      <mesh position={[0, -SOC.h / 2 - 0.025, 0]} receiveShadow geometry={plate(SOC.r * 0.9, SOC.r * 0.18, 0.05, 0.015)}>
        <meshStandardMaterial color="#3c434c" metalness={0.9} roughness={0.36} />
      </mesh>
    </group>
  )
}

/**
 * The boundary, and the small hole in it that everything has to leave through.
 *
 * A section of skull, and a skull is three layers: two dense tables of compact
 * bone with a spongy one between them, set back a little so the layering shows
 * at the cut edge. All three are the skull, all three are named as it and all
 * three light together; the light gathers at the hole, round a titanium
 * grommet, because that is where the signal is stopped.
 */
function Skull() {
  const named = useNamer('implant')
  const plates = useRef<THREE.Group>(null!)
  const table = useMemo(() => boneMap('table'), [])
  const diploe = useMemo(() => boneMap('diploe'), [])
  const glow = useMemo(skullGlow, [])

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const m = modeFor(d.motion, d.beatTime)
    // Lit while the constriction is the subject.
    const v = m.showDrops ? 1.4 : 0.3
    for (const child of plates.current.children) {
      setEmissive((child as THREE.Mesh).material as THREE.MeshStandardMaterial, v)
    }
  })

  const t = SKULL.table
  const s = SKULL.spongy
  const layers = [
    /* Toned well down from the painting's own bone colour: at full value the
       plate was the brightest thing in the frame and read as a wooden board,
       and the hole's glow — the one light this part is allowed — was lost on
       it. */
    { y: s / 2 + t / 2, r: SKULL.r, h: t, map: table, rough: 0.7, tone: '#67635c' },
    { y: 0, r: SKULL.r - 0.035, h: s + 0.004, map: diploe, rough: 0.92, tone: '#6e6258' },
    { y: -s / 2 - t / 2, r: SKULL.r, h: t, map: table, rough: 0.72, tone: '#524e48' },
  ]

  return (
    <group position={[0, SKULL_Y, 0]}>
      {/* Narrow enough that the boundary reads as a boundary without setting
          the scene's bounding box and shrinking the array in the camera fit,
          which is what the full-width version did. */}
      <group ref={plates}>
        {layers.map((l, i) => (
          <mesh
            key={i}
            position={[0, l.y, 0]}
            castShadow
            receiveShadow
            geometry={plate(l.r, SKULL.hole, l.h, i === 1 ? 0.004 : 0.016)}
            {...named('implant:skull')}
          >
            <meshPhysicalMaterial
              color={l.tone}
              map={l.map}
              emissive={C.dropped}
              emissiveMap={glow}
              emissiveIntensity={0.3}
              roughness={l.rough}
              clearcoat={i === 1 ? 0 : 0.25}
              clearcoatRoughness={0.5}
            />
          </mesh>
        ))}
      </group>
      {/* The feedthrough: the one way through the bone, lined in titanium. */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[SKULL.hole + 0.004, 0.024, 12, 48]} />
        <meshStandardMaterial color="#9aa1a8" metalness={1} roughness={0.26} />
      </mesh>
    </group>
  )
}

/**
 * The funnel.
 *
 * Inbound packets climb the threads; outbound packets leave through the skull.
 * The whole lecture is the ratio between those two counts, so both are driven
 * from the same mode and the difference is never cosmetic.
 */
function Traffic() {
  const hues = useMemo(() => [C.raw, C.spike, C.dropped], [])

  const inbound = useCallback((i: number, t: number, out: Packet) => {
    const d = updateDriver(t)
    const m = modeFor(d.motion, d.beatTime)
    const thread = i % THREADS
    const own = Math.sin(t * 1.7 + thread * 2.399) * 0.5 + 0.5
    const live = m.detected ? own > 0.86 : own > 1 - m.inbound
    if (!live) return out

    const u = (t * 0.42 + i * 0.137) % 1
    const [x, y, z] = threadPoint(thread, u)
    out.x = x
    out.y = y
    out.z = z
    out.hue = m.detected ? 1 : 0
    out.on = true
    out.scale = m.detected ? 0.05 : 0.036
    return out
  }, [])

  const outbound = useCallback((i: number, t: number, out: Packet) => {
    const d = updateDriver(t)
    const m = modeFor(d.motion, d.beatTime)
    /* Which packets get through is a fixed property of the index, not a random
       draw, so the ratio on screen is exactly the ratio in the mode and a
       reader who counts gets the same answer twice. */
    const passes = i / OUT_COUNT < m.admitted
    if (m.admitted <= 0 && !m.showDrops) return out

    const u = (t * 0.33 + i * 0.0385) % 1

    if (!passes) {
      // Stopped at the boundary. Only drawn where the beat is about the loss —
      // otherwise the reader would see a permanent pile of red at the skull and
      // read it as damage rather than as bandwidth.
      if (!m.showDrops) return out
      if (u > SKULL_U) return out
      const [x, y, z] = outPoint(u)
      out.x = x
      out.y = y
      out.z = z
      out.hue = 2
      out.on = true
      out.scale = 0.036
      out.bright = 1.4
      return out
    }

    const [x, y, z] = outPoint(u)
    out.x = x
    out.y = y
    out.z = z
    out.hue = m.detected ? 1 : 0
    out.on = true
    out.scale = 0.055
    return out
  }, [])

  return (
    <>
      <Flow count={IN_COUNT} at={inbound} hues={hues} probe="implantIn" />
      <Flow count={OUT_COUNT} at={outbound} hues={hues} probe="implantOut" />
    </>
  )
}

/**
 * The heat ceiling.
 *
 * A bar and a line. Everything the processor does pushes the bar up, and the
 * line is not a performance target — it stands for the point past which the
 * tissue around the device warms by a degree or two.
 *
 * Drawn as an instrument: a column in a glass tube on a steel foot, a scale in
 * the bar's own milliwatts behind it, and the ceiling as the tube's cap — a
 * hard stop the column runs into, not a mark it is aiming for.
 */
const BAR_X = 2.35
const BAR_H = 1.9
const CEILING = 1
const TUBE = 0.42

function Thermal() {
  const named = useNamer('implant')
  const group = useRef<THREE.Group>(null!)
  const bar = useRef<THREE.Mesh>(null!)
  const line = useRef<THREE.Mesh>(null!)
  const shown = useRef(0)
  const level = useRef(0)
  const tint = useMemo(() => new THREE.Color(), [])
  const scale = useMemo(gaugeScale, [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const m = modeFor(d.motion, d.beatTime)

    shown.current = damp(shown.current, m.power >= 0 ? 1 : 0, 5, dt)
    group.current.visible = shown.current > 0.02
    group.current.scale.setScalar(Math.max(shown.current, 0.0001))
    if (!group.current.visible) return

    level.current = damp(level.current, Math.max(m.power, 0), 4, dt)
    const v = level.current
    bar.current.scale.y = Math.max(v, 0.0001)
    bar.current.position.y = (v * BAR_H) / 2

    const mat = bar.current.material as THREE.MeshStandardMaterial
    /* Amber while it is being held at the limit, green below it. Never red:
       crossing is not a thing this device is allowed to do, so there is no
       state on the far side of the line to colour. */
    tint.copy(m.clamped ? C.spike : C.safe)
    mat.color.copy(tint).multiplyScalar(0.22)
    mat.emissive.copy(tint)
    setEmissive(mat, m.clamped ? 1.9 : 1.1)

    const lineMat = line.current.material as THREE.MeshStandardMaterial
    setEmissive(lineMat, m.clamped ? 2.2 : 0.9)

    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__implant = () => ({
        motion: d.motion,
        beatTime: Number(d.beatTime.toFixed(2)),
        // Milliwatts, so the probe reports the same unit the copy states.
        mW: Number((level.current * CAP_MW).toFixed(1)),
        capMW: CAP_MW,
        clamped: m.clamped,
        crossed: level.current > CEILING + 0.001,
        inbound: m.inbound,
        admitted: m.admitted,
      })
    }
  })

  return (
    <group ref={group} position={[BAR_X, 0, 0]}>
      {/* The foot. */}
      <mesh position={[0, -0.05, 0]} castShadow receiveShadow geometry={roundedBox(0.66, 0.1, 0.66, 0.03)}>
        <meshStandardMaterial color="#1b222b" metalness={0.75} roughness={0.36} />
      </mesh>
      <mesh position={[0, -0.001, 0]} geometry={roundedBox(TUBE + 0.06, 0.012, TUBE + 0.06, 0.005)}>
        <meshStandardMaterial color="#3a4654" metalness={0.95} roughness={0.26} />
      </mesh>

      {/* The scale, in the bar's own milliwatts, on a plate behind the tube. */}
      <mesh position={[0, BAR_H / 2, -TUBE / 2 - 0.05]} receiveShadow geometry={roundedBox(0.36, BAR_H, 0.03, 0.012)}>
        <meshStandardMaterial color="#0e131a" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, BAR_H / 2, -TUBE / 2 - 0.034]}>
        <planeGeometry args={[0.32, BAR_H]} />
        <meshStandardMaterial color="#0e131a" emissive="#9fb4c8" emissiveMap={scale} emissiveIntensity={0.55} roughness={0.6} />
      </mesh>

      {/* The tube, stopping just under the cap so the cap is its lid. */}
      <mesh position={[0, (BAR_H - 0.02) / 2, 0]} geometry={roundedBox(TUBE, BAR_H - 0.02, TUBE, 0.07, 4)} renderOrder={2}>
        <meshPhysicalMaterial
          color="#9fb8cc"
          roughness={0.06}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={bar} scale={[1, 0.0001, 1]} geometry={roundedBox(0.3, BAR_H, 0.3, 0.05)} {...named('implant:draw')}>
        <meshPhysicalMaterial
          color="#123024"
          emissive={C.safe}
          emissiveIntensity={1.1}
          roughness={0.3}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
        />
      </mesh>
      <mesh ref={line} position={[0, CEILING * BAR_H, 0]} castShadow geometry={roundedBox(0.62, 0.05, 0.62, 0.018)} {...named('implant:cap')}>
        <meshPhysicalMaterial
          color="#3a1c22"
          emissive={C.over}
          emissiveIntensity={0.9}
          roughness={0.3}
          metalness={0.4}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
        />
      </mesh>
    </group>
  )
}
