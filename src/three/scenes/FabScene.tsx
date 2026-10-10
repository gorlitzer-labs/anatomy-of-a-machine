import { useLayoutEffect, useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { instanceNameHandlers, useNamer } from '../naming'
import { driver, updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { publishReadout } from '../readout'
import { damp } from '../../lib/math'
import { beamFade, chuckMap, dieFace, layerTop, reticleMap, roundedBox, topFaced } from '../surfaces'

/**
 * A wafer being printed.
 *
 * The motion here is one specific thing: a pattern is *copied* rather than
 * drawn. Nothing traces the lines one at a time — the mask carries every
 * feature in the field, and the light copies them all in one pass. On a modern
 * step-and-scan machine that pass is a narrow slit of light swept across the
 * field in a fraction of a second (ASML: "the reticle moves smoothly through a
 * narrow slit of light ... the wafer moves smoothly in the opposite
 * direction"), so the beam here sweeps rather than flashing the whole field,
 * and then steps to the next field. Getting that across is the entire reason
 * this scene animates rather than being a diagram.
 */

const WAFER_R = 2.55
const GRID = 11
const DIE = 0.4
/* The scribe line — the lane a saw runs down to separate the dies. Widened from
   0.03, where neighbouring dies of the same colour merged into columns and the
   grid stopped reading as individual chips. */
const GAP = 0.09
const PITCH = DIE + GAP
/* Thin, so a die is a printed patch on the wafer rather than a tile laid on it. */
const DIE_H = 0.03
/* The wafer's top face, which the dies stand on. */
const TOP = -0.005

/**
 * Lit, but still glowing per instance.
 *
 * The dies and the edge dies were unlit, which made the wafer a flat mosaic.
 * A standard material gives them a surface that catches the studio, and one
 * line of shader routes the per-die colour into the emissive as well as the
 * diffuse — the same trick as the fabric's blocks — so the colour each beat
 * gives a die still decides how it glows, and a bare die, whose colour is near
 * black, shows no pattern at all.
 */
function glowByColor(m: THREE.MeshStandardMaterial) {
  /* One addition, for the dies nothing has printed yet. Their colour is near
     black but not black: times a bright floorplan that printed a faint pattern
     on a wafer the copy says is blank, and as diffuse it made them a grid of
     dark tiles. Below a threshold they are bare silicon instead — no glow, and
     the wafer's own tone. Everything a beat lights is several times brighter
     than the threshold. */
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        #if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
          float printed = smoothstep( 0.03, 0.06, max( vColor.r, max( vColor.g, vColor.b ) ) );
          diffuseColor.rgb = mix( BARE_SILICON, diffuseColor.rgb, printed );
        #endif`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        #if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
          totalEmissiveRadiance *= vColor.rgb * printed;
        #endif`,
      )
    shader.fragmentShader = `#define BARE_SILICON vec3(0.028, 0.034, 0.048)\n${shader.fragmentShader}`
  }
  return m
}

function dieMaterial(vertexColors: boolean) {
  return glowByColor(
    new THREE.MeshStandardMaterial({
      color: '#8e98a8',
      roughness: 0.3,
      metalness: 0.55,
      emissive: '#ffffff',
      emissiveMap: dieFace(),
      emissiveIntensity: 1.6,
      vertexColors,
      side: vertexColors ? THREE.DoubleSide : THREE.FrontSide,
    }),
  )
}

/** Dies that fall inside the wafer, laid out once. */
type Die = { x: number; z: number; i: number }

function buildDies(): Die[] {
  const out: Die[] = []
  const span = ((GRID - 1) * PITCH) / 2
  let i = 0
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const x = c * PITCH - span
      const z = r * PITCH - span
      // Only dies wholly on the wafer can become chips. The partial ones at the
      // rim are drawn separately by `EdgeDies`: they are printed too, and are
      // the real reason a round wafer wastes area.
      if (Math.hypot(x, z) + DIE * 0.75 > WAFER_R) continue
      out.push({ x, z, i: i++ })
    }
  }
  return out
}

/**
 * Deterministic defect placement.
 *
 * Fixed rather than random so the yield beat shows the same wafer every time —
 * a reader who steps back and forward should not see a different chip fail.
 */
function isDefective(n: number) {
  return (n * 2654435761) % 97 < 13
}

export function FabScene() {
  const dies = useMemo(buildDies, [])

  return (
    <Part
      id="fab"
      tags={['wafer', 'expose', 'stepper', 'euv', 'layers', 'yield', 'bins', 'node']}
      position={[0, 0, 0]}
    >
      <Chuck />
      <Wafer />
      <Dies dies={dies} />
      <EdgeDies dies={dies} />
      <Mask dies={dies} />
      <Stack />
    </Part>
  )
}

/* The notch. Every 300 mm wafer carries one — a small V cut into the rim at
   the crystal's reference direction — and it is what the first beat's copy
   points at. This used to be a flat ground along the front, which is what
   older, smaller wafers had instead, so the model showed the thing the copy
   says has been replaced. Cut into the profile, so the rim runs into it. */
const NOTCH_W = 0.1
const NOTCH_D = 0.13
const WAFER_T = 0.09
/* Wafers are edge-ground to a rounded profile so the rim does not chip. */
const BEVEL = 0.018

function waferShape() {
  // Profile in XY; the mesh is laid flat so profile y becomes world -z, which
  // puts the notch at the front (+z), facing the camera.
  const r = WAFER_R - BEVEL
  const s = new THREE.Shape()
  const half = Math.asin(NOTCH_W / r)
  const a0 = -Math.PI / 2 + half
  const a1 = -Math.PI / 2 - half + Math.PI * 2
  // No closing lineTo: the shape closes itself, and a repeated point would be
  // a zero-length edge for the bevel to offset.
  s.absarc(0, 0, r, a0, a1, false)
  s.lineTo(0, -(r - NOTCH_D))
  return s
}

/**
 * The stage the wafer is held on: a vacuum chuck, black anodised and grooved.
 * Every step of this lecture happens with a wafer clamped to one, and it gives
 * the disc something to rest on instead of floating in the void.
 */
const CHUCK_R = WAFER_R + 0.2
const CHUCK_H = 0.1

function Chuck() {
  return (
    <mesh position={[0, TOP - WAFER_T - CHUCK_H / 2, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[CHUCK_R, CHUCK_R - 0.02, CHUCK_H, 128]} />
      <meshStandardMaterial attach="material-0" color="#1a212b" roughness={0.3} metalness={0.9} />
      <meshStandardMaterial attach="material-1" color="#ffffff" map={chuckMap()} roughness={0.55} metalness={0.4} />
      <meshStandardMaterial attach="material-2" color="#0b0f15" roughness={0.6} metalness={0.4} />
    </mesh>
  )
}

function Wafer() {
  const named = useNamer('fab')
  const geo = useMemo(
    () =>
      new THREE.ExtrudeGeometry(waferShape(), {
        depth: WAFER_T - BEVEL * 2,
        bevelEnabled: true,
        bevelThickness: BEVEL,
        bevelSize: BEVEL,
        bevelSegments: 3,
        curveSegments: 160,
      }),
    [],
  )
  return (
    <group>
      {/* Polished silicon is a mirror, and the thin oxide on it throws the
          faint rainbow every wafer photograph has. */}
      <mesh
        geometry={geo}
        position={[0, TOP - WAFER_T + BEVEL, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
        {...named('fab:wafer')}
      >
        <meshPhysicalMaterial
          attach="material-0"
          color="#6a7486"
          roughness={0.14}
          metalness={0.92}
          iridescence={0.45}
          iridescenceIOR={1.46}
          iridescenceThicknessRange={[180, 520]}
          clearcoat={0.4}
          clearcoatRoughness={0.1}
        />
        <meshPhysicalMaterial attach="material-1" color="#7c8698" roughness={0.2} metalness={0.95} />
      </mesh>
      {/* What the pointer finds at the notch. Draws nothing: the notch is an
          absence, and the cut in the rim is what shows it. */}
      <mesh position={[0, TOP - WAFER_T / 2, WAFER_R - NOTCH_D / 2]} {...named('fab:flat')}>
        <boxGeometry args={[NOTCH_W * 2, WAFER_T, NOTCH_D]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
    </group>
  )
}

/**
 * Every die on the wafer.
 *
 * Instanced because there are around ninety of them and they all change state
 * together — printed, defective, binned. Which state they are in is entirely a
 * function of the beat and the clock, so nothing is stored per die.
 */
function Dies({ dies }: { dies: Die[] }) {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  /* Which die the pointer is on decides what it is called. On the yield and
     binning beats a third of these are scrap and another third are a slower
     grade of the identical design, and being told "a die" over a red one would
     name the thing while missing the entire point of the beat. */
  const named = useMemo(
    () =>
      instanceNameHandlers('fab', (n) => {
        const focus = driver.motion ?? ''
        if (focus === 'yield' || focus === 'bins' || focus === 'node') {
          if (isDefective(n)) return 'fab:dead'
          return focus === 'bins' ? 'fab:bin' : 'fab:good'
        }
        return 'fab:die'
      }),
    [],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tint = useMemo(() => new THREE.Color(), [])
  const material = useMemo(() => dieMaterial(false), [])

  const BARE = useMemo(() => new THREE.Color('#171d26'), [])
  const PRINTED = useMemo(() => new THREE.Color('#2f6f8a'), [])
  const DEAD = useMemo(() => new THREE.Color('#5a1b2a'), [])
  const BINS = useMemo(
    () => [new THREE.Color('#4fd8ff'), new THREE.Color('#a06bff'), new THREE.Color('#6ee7a8')],
    [],
  )

  useLayoutEffect(() => {
    for (const d of dies) {
      dummy.position.set(d.x, TOP + DIE_H / 2, d.z)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(d.i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.computeBoundingSphere()
  }, [dies, dummy])

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.motion ?? ''
    const t = state.clock.elapsedTime

    /* The stepper walks field by field, and the field that prints is the field
       the optics are over — read from the same `exposureAt` the mask uses, so
       the flash and its effect are in the same place. They used to be computed
       separately, so a field lit up while the beam was somewhere else. */
    const stepping = focus === 'expose' || focus === 'stepper' || focus === 'euv'
    const e = exposureAt(focus, t, dies.length)
    /* `expose` is one field being copied in a single pass and staying: nothing
       else on the wafer changes, because that beat is about one exposure
       rather than about covering a disc. */
    const single = focus === 'expose'

    for (const die of dies) {
      const n = die.i
      const printed = stepping
        ? single
          ? n === e.field && !e.flashing
          : n < e.field
        : focus !== 'wafer'
      const justPrinted = stepping && n === e.field && e.flashing

      if (focus === 'yield' || focus === 'bins' || focus === 'node') {
        const dead = isDefective(n)
        if (dead) tint.copy(DEAD)
        else if (focus === 'bins') tint.copy(BINS[n % BINS.length])
        else tint.copy(PRINTED)
      } else if (justPrinted) {
        // The flash itself.
        tint.copy(PRINTED).multiplyScalar(3.4)
      } else {
        tint.copy(printed ? PRINTED : BARE)
      }
      mesh.current.setColorAt(n, tint)
    }
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[topFaced(DIE, DIE_H, DIE, 0.012), material, dies.length]}
      castShadow
      receiveShadow
      {...named}
    />
  )
}

/**
 * The partial dies around the rim.
 *
 * A round wafer and a square grid leave a ring of cells only partly on the
 * silicon. They are not skipped: the scanner exposes these edge fields too, so
 * polishing and etching see an even pattern right to the rim (US 8,685,633).
 * They are printed with everything else and can never become a working chip,
 * so they print when their neighbours do and read as scrap from then on.
 *
 * Each one is the wafer's circle clipped to the die's square. Both are convex,
 * so the result is too, and a triangle fan is enough to fill it.
 */
type Edge = { poly: [number, number][]; near: number; x: number; z: number }

function clipTo(poly: [number, number][], axis: 0 | 1, bound: number, keepBelow: boolean) {
  const out: [number, number][] = []
  const inside = (p: [number, number]) => (keepBelow ? p[axis] <= bound : p[axis] >= bound)
  for (let k = 0; k < poly.length; k++) {
    const a = poly[k]
    const b = poly[(k + 1) % poly.length]
    const ia = inside(a)
    const ib = inside(b)
    if (ia) out.push(a)
    if (ia !== ib) {
      const u = (bound - a[axis]) / (b[axis] - a[axis])
      out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u])
    }
  }
  return out
}

function buildEdges(dies: Die[]): Edge[] {
  const span = ((GRID - 1) * PITCH) / 2
  const rim = WAFER_R - 0.02
  const circle: [number, number][] = Array.from({ length: 128 }, (_, k) => {
    const a = (k / 128) * Math.PI * 2
    return [Math.cos(a) * rim, Math.sin(a) * rim]
  })
  const out: Edge[] = []
  for (let r = -1; r <= GRID; r++) {
    for (let c = -1; c <= GRID; c++) {
      const x = c * PITCH - span
      const z = r * PITCH - span
      // The same test `buildDies` uses, inverted: these are the ones it left out.
      if (Math.hypot(x, z) + DIE * 0.75 <= WAFER_R) continue
      let poly = clipTo(circle, 0, x - DIE / 2, false)
      poly = clipTo(poly, 0, x + DIE / 2, true)
      poly = clipTo(poly, 1, z - DIE / 2, false)
      poly = clipTo(poly, 1, z + DIE / 2, true)
      // Nothing is printed into the notch: there is no silicon there.
      if (Math.abs(x) < DIE / 2 + NOTCH_W) poly = clipTo(poly, 1, WAFER_R - NOTCH_D - 0.03, true)
      if (poly.length < 3) continue
      let area = 0
      for (let k = 0; k < poly.length; k++) {
        const a = poly[k]
        const b = poly[(k + 1) % poly.length]
        area += a[0] * b[1] - b[0] * a[1]
      }
      // A sliver is not worth drawing as a die.
      if (Math.abs(area) / 2 < DIE * DIE * 0.06) continue
      let near = 0
      let best = Infinity
      for (const d of dies) {
        const dd = Math.hypot(d.x - x, d.z - z)
        if (dd < best) {
          best = dd
          near = d.i
        }
      }
      out.push({ poly, near, x, z })
    }
  }
  return out
}

function EdgeDies({ dies }: { dies: Die[] }) {
  const named = useNamer('fab')
  const edges = useMemo(() => buildEdges(dies), [dies])

  /* One mesh for the whole ring, with a vertex range per edge die so each can
     be recoloured on its own. */
  const { geometry, ranges } = useMemo(() => {
    const pos: number[] = []
    const uv: number[] = []
    const ranges: { from: number; to: number; near: number }[] = []
    const y = TOP + DIE_H
    for (const { poly, near, x, z } of edges) {
      const from = pos.length / 3
      // Mapped as if the whole die were there, so what is left is the part of
      // a floorplan the rim did not cut away.
      const at = (p: [number, number]) => {
        pos.push(p[0], y, p[1])
        uv.push((p[0] - x) / DIE + 0.5, 0.5 - (p[1] - z) / DIE)
      }
      for (let k = 1; k < poly.length - 1; k++) {
        at(poly[0])
        at(poly[k + 1])
        at(poly[k])
      }
      ranges.push({ from, to: pos.length / 3, near })
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    g.setAttribute('color', new THREE.Float32BufferAttribute(new Array(pos.length).fill(0), 3))
    g.computeVertexNormals()
    g.computeBoundingSphere()
    return { geometry: g, ranges }
  }, [edges])

  const BARE = useMemo(() => new THREE.Color('#171d26'), [])
  // Printed, but visibly never going to be a product.
  const SCRAP = useMemo(() => new THREE.Color('#2f6f8a').multiplyScalar(0.42), [])
  const tint = useMemo(() => new THREE.Color(), [])
  const material = useMemo(() => dieMaterial(true), [])

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.motion ?? ''
    const t = state.clock.elapsedTime
    const stepping = focus === 'stepper' || focus === 'euv'
    const e = exposureAt(focus, t, dies.length)
    const attr = geometry.getAttribute('color') as THREE.BufferAttribute
    for (const r of ranges) {
      const printed = stepping ? r.near < e.field : focus !== 'wafer' && focus !== 'expose'
      tint.copy(printed ? SCRAP : BARE)
      for (let v = r.from; v < r.to; v++) attr.setXYZ(v, tint.r, tint.g, tint.b)
    }
    attr.needsUpdate = true
  })

  return (
    <mesh geometry={geometry} material={material} receiveShadow {...named('fab:edge')} />
  )
}

/* ---------------- exposure ---------------- */

/**
 * Wavelengths, and the pitch they are trying to print.
 *
 * 193 nm is the ArF excimer laser that carried the industry for two decades;
 * 13.5 nm is EUV, about a fourteenth of it. The feature pitch is deliberately
 * between the two, which is the whole difficulty: for years the industry
 * printed features far smaller than its own wavelength using tricks (immersion,
 * multiple patterning, optical proximity correction) rather than better light.
 */
const DUV_NM = 193
const EUV_NM = 13.5
const FEATURE_NM = 30

/** Seconds a field is exposed and held, per step. */
const STEP_EVERY = 2.5

/** Share of each step during which the light is on and the slit is sweeping. */
const SCAN = 0.3

/**
 * Which field the optics are over, and whether the light is firing.
 *
 * `expose` holds on one field and scans it, over and over: the beat is about
 * one field being copied in a single pass. `stepper` and `euv` walk the disc
 * field by field. `sweep` is how far across the field the slit has got, 0..1.
 */
function exposureAt(focus: string, t: number, fields: number) {
  const phase = (t % STEP_EVERY) / STEP_EVERY
  const sweep = Math.min(1, phase / SCAN)
  if (focus === 'expose') {
    return { field: Math.floor(fields / 2), flashing: phase < SCAN, phase, sweep }
  }
  const step = Math.floor(t / STEP_EVERY)
  return { field: step % fields, flashing: phase < SCAN, phase, sweep }
}

/**
 * The mask and the light.
 *
 * Drops into place and scans on the exposure beats. The mask carries the
 * pattern for the entire field at once — it is a stencil, not a pen — and a
 * slit of light sweeps across it to copy the whole field in one pass.
 */
function Mask({ dies }: { dies: Die[] }) {
  const named = useNamer('fab')
  const group = useRef<THREE.Group>(null!)
  const beam = useRef<THREE.Mesh>(null!)
  const spot = useRef<THREE.Mesh>(null!)
  const shown = useRef(0)

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.motion ?? ''
    const active = focus === 'expose' || focus === 'stepper' || focus === 'euv'
    shown.current = damp(shown.current, active ? 1 : 0, 4, dt)
    group.current.scale.setScalar(Math.max(shown.current, 0.0001))
    group.current.visible = shown.current > 0.02

    const t = state.clock.elapsedTime
    const e = exposureAt(focus, t, dies.length)
    const flash = e.flashing ? 1 : 0

    /* Where the optics are.
       On `stepper` they walk the disc, because "the machine steps: expose,
       move, expose, move" is a claim about the machine moving and it never
       did — the beam flashed in the centre while a field printed somewhere
       else entirely, putting cause and effect in different places. On `expose`
       they hold over one field, because that beat is about one field being
       copied in a single pass — every feature at once, never drawn line by
       line. */
    const over = dies[Math.min(e.field, dies.length - 1)]
    const walk = focus === 'stepper' && over
    group.current.position.x = damp(group.current.position.x, walk ? over.x : 0, 9, dt)
    group.current.position.z = damp(group.current.position.z, walk ? over.z : 0, 9, dt)
    group.current.position.y = 1.35 + (1 - shown.current) * 1.2

    const mat = beam.current.material as THREE.MeshStandardMaterial
    setEmissive(mat, (0.08 + flash * 2.6) * shown.current)
    /* Step and scan. While the light is on it is a narrow slit travelling
       across the field, not a whole-field flash — that is how every
       leading-edge scanner exposes. The euv beat is about wavelength, not
       motion, so it keeps the plain beam under its spot. */
    const scanning = flash > 0 && focus !== 'euv'
    beam.current.scale.x = 0.4 + flash * 0.6
    beam.current.scale.z = scanning ? 0.16 : 0.4 + flash * 0.6
    beam.current.position.z = scanning ? (e.sweep - 0.5) * 0.6 : 0

    /* The wavelength, as the thing that decides what can be resolved.
       `euv` is entirely about 193 nm against 13.5 nm and had no motion arguing
       it at all — it inherited the raster and showed a defect map's worth of
       nothing. The spot is drawn to scale against a fixed feature pitch: at
       193 nm it swallows several features at once and cannot tell them apart,
       and at 13.5 nm it sits inside one. */
    const euv = focus === 'euv'
    spot.current.visible = euv && shown.current > 0.02
    if (euv) {
      const nm = d.variant === 'b' ? EUV_NM : DUV_NM
      const r = (nm / DUV_NM) * 0.52
      spot.current.scale.set(r / 0.52, 1, r / 0.52)
      const sm = spot.current.material as THREE.MeshStandardMaterial
      sm.emissive.setHex(nm > 100 ? 0xff7a92 : 0x6ee7a8)
      setEmissive(sm, 1.4 + flash * 1.2)

      publishReadout('fab', d.scene, [
        { label: 'Light', value: nm > 100 ? 'ArF excimer, 193 nm' : 'EUV, 13.5 nm' },
        { label: 'Wavelength', value: `${nm} nm`, key: true },
        { label: 'Feature pitch', value: `${FEATURE_NM} nm` },
        {
          label: 'Can it resolve them',
          /* The ratio is wavelength to pitch, not a resolution limit: optics
             and tricks let 193 nm print well below its own wavelength, just
             not a 30 nm pitch in one exposure. */
          value: nm <= FEATURE_NM ? 'yes' : `no — the light is ${(nm / FEATURE_NM).toFixed(0)}× the pitch`,
        },
      ])
    }
  })

  return (
    <group ref={group} position={[0, 1.35, 0]}>
      {/* The reticle: the die's floorplan in chrome on quartz, four times its
          size, which is the reduction a scanner's lens applies. */}
      <mesh castShadow {...named('fab:mask')} geometry={topFaced(1.6, 0.06, 1.6, 0.014)}>
        <meshPhysicalMaterial
          color="#ffffff"
          map={reticleMap()}
          roughness={0.1}
          metalness={0.35}
          clearcoat={1}
          clearcoatRoughness={0.04}
        />
      </mesh>
      {/* The pellicle frame under it: a membrane on a metal frame, held clear
          of the pattern so a speck of dust lands out of focus. */}
      {[
        [0, 0.74, 1.52, 0.06],
        [0, -0.74, 1.52, 0.06],
        [0.74, 0, 0.06, 1.46],
        [-0.74, 0, 0.06, 1.46],
      ].map(([x, z, w, d]) => (
        <mesh key={`${x}|${z}`} position={[x, -0.07, z]} castShadow geometry={roundedBox(w, 0.08, d, 0.015)}>
          <meshStandardMaterial color="#8d97a6" roughness={0.3} metalness={0.9} />
        </mesh>
      ))}
      {/* The light's spot, to scale against the pattern below it. */}
      <mesh ref={spot} position={[0, 0.12, 0]} visible={false} {...named('fab:spot')}>
        <cylinderGeometry args={[0.52, 0.52, 0.02, 32]} />
        <meshStandardMaterial color="#2a1620" emissive="#ff7a92" emissiveIntensity={1.4} transparent opacity={0.55} />
      </mesh>
      <mesh ref={beam} position={[0, -0.7, 0]} {...named('fab:beam')}>
        <cylinderGeometry args={[0.9, 0.55, 1.3, 24, 1, true]} />
        <meshStandardMaterial
          color="#123044"
          emissive="#8fe8ff"
          emissiveIntensity={0.1}
          alphaMap={beamFade()}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

/**
 * The metal stack, as a cross-section that rises beside the wafer.
 *
 * A chip is not one print. It is dozens — around eighty at the leading edge;
 * twelve are drawn — stacked, each one aligned to the last within a nanometre
 * or two, and the wiring above the transistors is most of them.
 */
function Stack() {
  const named = useNamer('fab')
  const group = useRef<THREE.Group>(null!)
  const shown = useRef(0)
  const LAYERS = 12

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const active = d.focus === 'layers'
    shown.current = damp(shown.current, active ? 1 : 0, 3.5, dt)
    group.current.visible = shown.current > 0.02
    const t = state.clock.elapsedTime

    group.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      // Layers build upward in sequence, then hold — the same "one at a time,
      // in order" the exposure beats establish, at a different scale.
      const arrive = Math.min(1, Math.max(0, ((t * 0.9) % (LAYERS + 4)) - i))
      const up = shown.current * arrive
      mesh.scale.y = Math.max(up, 0.0001)
      mesh.position.y = 0.12 + i * 0.115 + (1 - up) * 0.4
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (mat) mat.opacity = up * 0.95
    })
  })

  return (
    <group ref={group} position={[0, 0.05, 0]}>
      {Array.from({ length: LAYERS }, (_, i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          geometry={topFaced(2.4, 0.09, 2.4, 0.025)}
          {...named(i < 2 ? 'fab:device' : 'fab:metal')}
        >
          <meshPhysicalMaterial
            // Lower layers are the transistors; everything above is wiring, and
            // there is a lot more wiring than there is transistor. Each face
            // carries what that layer is: fins and gates, contacts, then metal
            // routed at right angles to the layer below and coarsening upward.
            color={i < 2 ? '#1d3a4a' : '#6a5230'}
            emissive={i < 2 ? '#4fd8ff' : '#c08a3e'}
            emissiveMap={layerTop(i)}
            emissiveIntensity={i < 2 ? 0.5 : 0.22}
            roughness={i < 2 ? 0.35 : 0.3}
            metalness={i < 2 ? 0.5 : 0.85}
            clearcoat={0.3}
            clearcoatRoughness={0.2}
            transparent
          />
        </mesh>
      ))}
    </group>
  )
}
