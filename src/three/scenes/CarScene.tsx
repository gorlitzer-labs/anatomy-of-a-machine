import { useCallback, useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Part } from '../Part'
import { useNamer } from '../naming'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { publishReadout } from '../readout'
import { Flow, type Packet } from '../motion/Flow'
import { sampleLane } from '../motion/lanes'
import { coreFloorplan, roundedBox, topFaced } from '../surfaces'
import { damp } from '../../lib/math'
import {
  C,
  SCATTERED,
  SPINE,
  TRUNKS,
  UNITS,
  arbitrationAt,
  ID_BITS,
  idBits,
  PRIORITY,
  harnessLength,
  lockstepAt,
  stub,
  zonePos,
} from './carLayout'

/**
 * Dozens of small computers sharing one wire.
 *
 * The contention beats are the reason this scene exists. A message that loses
 * arbitration backs away; the one that wins carries on without restarting, and
 * seeing those two things happen at once is the difference between understanding
 * the bus and being told a fact about it.
 */
export function CarScene() {
  return (
    <Part
      id="car"
      tags={['units', 'harness', 'bus', 'arbitrate', 'nondestructive', 'zonal', 'software', 'lockstep', 'asil', 'lifetime']}
      position={[0, 0, 0]}
    >
      <Shade />
      <Body />
      <Bus />
      <Units />
      <Lockstep />
      <Traffic />
    </Part>
  )
}

/* ------------------------------------------------------------------ */
/* Surfaces, painted here rather than in surfaces.ts                    */
/* ------------------------------------------------------------------ */

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const painted = new Map<string, THREE.CanvasTexture>()

/** The same lazy, cached, deterministic canvas painting the shared surfaces use. */
function paint(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const hit = painted.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  painted.set(key, tex)
  return tex
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** The floor pan, in plan. One size for the whole scene, so it is set once here. */
const CHASSIS = { l: 7.2, w: 3.6, r: 0.62, t: 0.12, bevel: 0.022 }

/**
 * The floor pan from above: the same black anodised finish and registration
 * grid as every bench in the course, with the structure of a skateboard
 * platform engraved into it — the sills, the two axle crossmembers, and the
 * battery modules laid out between them.
 *
 * Painted over the whole plan rather than tiled, so the engraving can know
 * where the axles are. Deliberately faint: the harness is what this chapter is
 * about, and nothing in the floor may read as wiring.
 */
const chassisTop = () =>
  paint('car-chassis', 2048, 1024, (ctx, w, h) => {
    const r = rng(1313)
    const px = w / CHASSIS.l
    const X = (x: number) => (x + CHASSIS.l / 2) * px
    const Z = (z: number) => (z + CHASSIS.w / 2) * px
    ctx.fillStyle = '#0c1119'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 26000; i++) {
      const v = 12 + r() * 10
      ctx.fillStyle = `rgba(${v},${v + 4},${v + 10},0.6)`
      ctx.fillRect(r() * w, r() * h, 2, 2)
    }
    // The battery modules: two rows of six between the axles.
    ctx.strokeStyle = 'rgba(70,110,150,0.13)'
    ctx.lineWidth = 2
    for (let k = 0; k < 6; k++)
      for (const [z0, z1] of [[-1.3, -0.12], [0.12, 1.3]]) {
        const x0 = -2.2 + k * 0.74
        roundRect(ctx, X(x0) + 3, Z(z0), 0.74 * px - 6, (z1 - z0) * px, 10)
        ctx.stroke()
      }
    // The sills, a scribed line just inside the edge.
    ctx.strokeStyle = 'rgba(70,110,150,0.22)'
    ctx.lineWidth = 3
    roundRect(ctx, 0.14 * px, 0.14 * px, w - 0.28 * px, h - 0.28 * px, (CHASSIS.r - 0.14) * px)
    ctx.stroke()
    // The axle crossmembers, where the wheels hang.
    ctx.fillStyle = 'rgba(70,110,150,0.1)'
    for (const x of [-WHEEL.x, WHEEL.x]) ctx.fillRect(X(x) - 0.09 * px, 0.14 * px, 0.18 * px, h - 0.28 * px)
    // The registration grid, at the bench pitch.
    ctx.fillStyle = 'rgba(110,160,210,0.34)'
    const pitch = 0.125 * px
    for (let y = pitch / 2; y < h; y += pitch)
      for (let x = pitch / 2; x < w; x += pitch) {
        ctx.beginPath()
        ctx.arc(x, y, 1.8, 0, Math.PI * 2)
        ctx.fill()
      }
  })

/**
 * A control unit's lid, for its emissive map: a cast housing with a finned
 * half, a label plate, and the connector end toward the top of the canvas —
 * which is the end that faces the bus. The frame is the uniform value the
 * housing's sides sample, as on every lacquered block in the course.
 */
const unitTop = () =>
  paint('car-unit', 256, 224, (ctx, w, h) => {
    const f = { x: w * 0.1, y: h * 0.1, w: w * 0.8, h: h * 0.8 }
    ctx.fillStyle = 'rgb(222,222,222)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgb(200,200,200)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    ctx.strokeStyle = 'rgb(104,104,104)'
    ctx.lineWidth = 2
    ctx.strokeRect(f.x + 4, f.y + 4, f.w - 8, f.h - 8)
    // The connector end: a recessed shroud across the bus side.
    ctx.fillStyle = 'rgb(60,60,60)'
    ctx.fillRect(f.x + f.w * 0.2, f.y + 10, f.w * 0.6, 16)
    ctx.fillStyle = 'rgb(150,150,150)'
    for (let k = 0; k < 8; k++) ctx.fillRect(f.x + f.w * 0.23 + k * f.w * 0.069, f.y + 15, 5, 6)
    // Fins, down the far half.
    for (let k = 0; k < 9; k++) {
      ctx.fillStyle = k % 2 ? 'rgb(120,120,120)' : 'rgb(236,236,236)'
      ctx.fillRect(f.x + 12 + k * ((f.w - 24) / 9), f.y + f.h * 0.52, (f.w - 24) / 9 - 2, f.h * 0.42)
    }
    // The label plate: part number, three lines of it.
    ctx.fillStyle = 'rgb(88,88,88)'
    ctx.fillRect(f.x + 14, f.y + 38, f.w * 0.55, 42)
    ctx.fillStyle = 'rgb(210,210,210)'
    for (let k = 0; k < 3; k++) ctx.fillRect(f.x + 20, f.y + 45 + k * 11, f.w * (0.44 - k * 0.1), 4)
    // Two mounting bosses.
    ctx.fillStyle = 'rgb(140,140,140)'
    for (const x of [f.x + f.w - 24, f.x + f.w - 50]) {
      ctx.beginPath()
      ctx.arc(x, f.y + 58, 7, 0, Math.PI * 2)
      ctx.fill()
    }
  })

/**
 * The comparator's face: two inputs coming in from either end and meeting at
 * an equals sign. It says what the bar does without a word on it.
 */
const comparatorTop = () =>
  paint('car-comparator', 512, 76, (ctx, w, h) => {
    const fy = h * 0.14
    ctx.fillStyle = 'rgb(222,222,222)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgb(186,186,186)'
    ctx.fillRect(w * 0.03, fy, w * 0.94, h - fy * 2)
    ctx.fillStyle = 'rgb(96,96,96)'
    ctx.fillRect(w * 0.06, h / 2 - 3, w * 0.36, 6)
    ctx.fillRect(w * 0.58, h / 2 - 3, w * 0.36, 6)
    ctx.fillStyle = 'rgb(255,255,255)'
    ctx.fillRect(w / 2 - 20, h / 2 - 12, 40, 7)
    ctx.fillRect(w / 2 - 20, h / 2 + 5, 40, 7)
  })

/**
 * The module the lockstep pair sits on: dark solder mask, the two cores'
 * footprints, and the traces from each core to the comparator — the only
 * path either result has, so the pair visibly share nothing but the check.
 */
const carrierTop = () =>
  paint('car-carrier', 512, 400, (ctx, w, h) => {
    const r = rng(907)
    ctx.fillStyle = '#0e1a1a'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 3000; i++) {
      const v = 16 + r() * 12
      ctx.fillStyle = `rgba(${v},${v + 12},${v + 10},0.6)`
      ctx.fillRect(r() * w, r() * h, 2, 2)
    }
    // Carrier space: x over 2.0, z over 1.55, centred at z = 0.3.
    const X = (x: number) => (x / CARRIER.w + 0.5) * w
    const Z = (z: number) => ((z - CARRIER.z) / CARRIER.d + 0.5) * h
    ctx.strokeStyle = 'rgba(176,138,82,0.55)'
    ctx.lineWidth = 3
    for (const side of [-1, 1])
      for (let k = 0; k < 4; k++) {
        // Out of the core's near edge, across, and into its end of the bar.
        const x = side * (0.37 + k * 0.12)
        const z = 0.45 + k * 0.05
        const into = side * (0.4 + k * 0.08)
        ctx.beginPath()
        ctx.moveTo(X(x), Z(CORE.d / 2))
        ctx.lineTo(X(x), Z(z))
        ctx.lineTo(X(into), Z(z))
        ctx.lineTo(X(into), Z(0.85 - COMPARATOR.d / 2))
        ctx.stroke()
      }
    // The cores' footprints: a silkscreen outline and a ring of pads.
    ctx.strokeStyle = 'rgba(200,210,210,0.35)'
    ctx.lineWidth = 2
    for (const x of [-0.55, 0.55]) ctx.strokeRect(X(x - 0.35), Z(-0.35), 0.7 * (w / CARRIER.w), 0.7 * (h / CARRIER.d))
    ctx.strokeRect(X(-0.8), Z(0.72), 1.6 * (w / CARRIER.w), 0.26 * (h / CARRIER.d))
    // Fixing holes at the corners, over the standoffs.
    ctx.fillStyle = 'rgba(190,190,180,0.8)'
    for (const [sx, sz] of STANDOFFS) {
      ctx.beginPath()
      ctx.arc(X(sx), Z(sz), 8, 0, Math.PI * 2)
      ctx.fill()
    }
  })

/**
 * A contact shadow under the whole car, baked.
 *
 * The shared one is keyed to a table in Scene.tsx that this chapter is not
 * allowed to join this round, so this is the cheap equivalent: a soft dark
 * pad on the floor the tyres stand on, which is all a car floating in a void
 * needs to be standing somewhere.
 */
const shadeMap = () =>
  paint('car-shade', 512, 320, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.filter = 'blur(26px)'
    ctx.fillStyle = 'rgba(0,2,8,1)'
    roundRect(ctx, w * 0.12, h * 0.16, w * 0.76, h * 0.68, h * 0.2)
    ctx.fill()
    ctx.filter = 'none'
  })

/* ------------------------------------------------------------------ */
/* The car                                                              */
/* ------------------------------------------------------------------ */

/** The wheels: at the corners of the floor pan, outboard of every unit. */
const WHEEL = { x: 2.7, z: CHASSIS.w / 2 + 0.02 + 0.12, y: -0.1, r: 0.32, w: 0.24 }

/**
 * The floor pan: a rounded plan extruded with a bevel, top at y = 0 so every
 * unit stands on it, and a UV per top vertex in plan so the engraving lands
 * where the axles are. Sides sample a plain corner of the same map.
 */
function chassisGeometry() {
  const { l, w, r, t, bevel } = CHASSIS
  const x0 = -l / 2
  const x1 = l / 2
  const y0 = -w / 2
  const y1 = w / 2
  const s = new THREE.Shape()
  s.moveTo(x0 + r, y0)
  s.lineTo(x1 - r, y0)
  s.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false)
  s.lineTo(x1, y1 - r)
  s.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false)
  s.lineTo(x0 + r, y1)
  s.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false)
  s.lineTo(x0, y0 + r)
  s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false)
  const depth = t - bevel * 2
  const g = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: 3,
    curveSegments: 20,
  })
  g.rotateX(-Math.PI / 2)
  g.translate(0, -(depth + bevel), 0)
  const pos = g.attributes.position
  const nor = g.attributes.normal
  const uv = g.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    if (nor.getY(i) > 0.5) uv.setXY(i, pos.getX(i) / l + 0.5, 0.5 - pos.getZ(i) / w)
    else uv.setXY(i, 0.004, 0.5)
  }
  uv.needsUpdate = true
  return g
}

/**
 * A tyre, turned: a rounded tread-and-sidewall profile spun about its axle,
 * which is then laid along z so the wheel stands across the car.
 */
function tyreGeometry() {
  const { r, w } = WHEEL
  const inner = r * 0.64
  const c = 0.06
  const pts: THREE.Vector2[] = [new THREE.Vector2(inner, -w / 2)]
  for (let k = 0; k <= 6; k++) {
    const a = -Math.PI / 2 + (k / 6) * (Math.PI / 2)
    pts.push(new THREE.Vector2(r - c + Math.cos(a) * c, -w / 2 + c + Math.sin(a) * c))
  }
  for (let k = 0; k <= 6; k++) {
    const a = (k / 6) * (Math.PI / 2)
    pts.push(new THREE.Vector2(r - c + Math.cos(a) * c, w / 2 - c + Math.sin(a) * c))
  }
  pts.push(new THREE.Vector2(inner, w / 2))
  return new THREE.LatheGeometry(pts, 40).rotateX(Math.PI / 2)
}

/** The shadow pad, on the floor under the tyres. */
function Shade() {
  return (
    <mesh position={[0, WHEEL.y - WHEEL.r - 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[CHASSIS.l * 1.32, (WHEEL.z + WHEEL.w) * 2 * 1.5]} />
      <meshBasicMaterial map={shadeMap()} transparent opacity={0.8} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/**
 * The vehicle: a skateboard floor pan on four wheels, which is the shape of
 * most electric cars under the body and reads as a car from any angle this
 * chapter uses. Named as one thing, the vehicle — the pan, the tyres and the
 * hubs are all the same answer, and the units standing on it answer for
 * themselves.
 */
function Body() {
  const named = useNamer('car')
  const pan = useMemo(chassisGeometry, [])
  const tyre = useMemo(tyreGeometry, [])
  return (
    <group>
      <mesh geometry={pan} receiveShadow {...named('car:body')}>
        <meshStandardMaterial color="#ffffff" map={chassisTop()} roughness={0.62} metalness={0.35} />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <group key={`${sx}${sz}`} position={[sx * WHEEL.x, WHEEL.y, sz * WHEEL.z]}>
            <mesh geometry={tyre} castShadow {...named('car:body')}>
              <meshStandardMaterial color="#1c1f24" roughness={0.85} metalness={0.05} side={THREE.DoubleSide} />
            </mesh>
            {/* The wheel: a machined disc with a hub, facing out. */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[WHEEL.r * 0.66, WHEEL.r * 0.66, WHEEL.w * 0.8, 32]} />
              <meshStandardMaterial color="#3a4654" roughness={0.3} metalness={0.9} />
            </mesh>
            <mesh position={[0, 0, sz * WHEEL.w * 0.42]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[WHEEL.r * 0.22, WHEEL.r * 0.26, 0.03, 20]} />
              <meshStandardMaterial color="#232a33" roughness={0.26} metalness={0.95} />
            </mesh>
            {/* The axle stub, from the pan's edge to the hub. */}
            <mesh position={[0, 0, -sz * 0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.24, 12]} />
              <meshStandardMaterial color="#232a33" roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        )),
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* The harness                                                          */
/* ------------------------------------------------------------------ */

/** Height of a stub's centreline: resting on the pan. */
const WIRE_Y = 0.016

/** One straight sheathed run, from a to b in plan. */
function run(a: [number, number], b: [number, number], radius: number, y = WIRE_Y) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1])
  const g = new THREE.CylinderGeometry(radius, radius, Math.max(len, 0.001), 8, 1)
  g.rotateZ(Math.PI / 2)
  g.rotateY(-Math.atan2(b[1] - a[1], b[0] - a[0]))
  g.translate((a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2)
  return g.toNonIndexed()
}

/** A splice where a stub joins the pair: a short crimped sleeve round the spine. */
function splice(x: number) {
  const g = new THREE.CylinderGeometry(0.03, 0.03, 0.1, 12)
  g.rotateZ(Math.PI / 2)
  g.translate(x, SPINE_Y, 0)
  return g.toNonIndexed()
}

const SPINE_Y = 0.03

/**
 * One conductor of the bus: a helix round the spine's centreline, so the two
 * of them together are what CAN actually is — a twisted pair.
 */
class Twist extends THREE.Curve<THREE.Vector3> {
  from: number
  to: number
  turn: number
  constructor(from: number, to: number, turn: number) {
    super()
    this.from = from
    this.to = to
    this.turn = turn
  }
  getPoint(u: number, out = new THREE.Vector3()) {
    const x = this.from + (this.to - this.from) * u
    const a = (x / 0.09) * Math.PI * 2 + this.turn
    return out.set(x, SPINE_Y + Math.cos(a) * 0.009, Math.sin(a) * 0.009)
  }
}

/**
 * The spine, and the stub from every unit. Shortens when the layout goes zonal.
 *
 * Each harness is drawn from the same `stub` and `TRUNKS` lanes that
 * `harnessLength` measures, so the copper on screen and the figure in the
 * readout are one number, not two.
 */
function Bus() {
  const scattered = useRef<THREE.Mesh>(null!)
  const zoned = useRef<THREE.Mesh>(null!)
  const pair = useMemo(
    () =>
      [0, Math.PI].map(
        (turn) => new THREE.TubeGeometry(new Twist(SPINE[0][0], SPINE[1][0], turn), 1100, 0.009, 6, false),
      ),
    [],
  )
  const wiredByFunction = useMemo(
    () =>
      mergeGeometries([
        ...Array.from({ length: UNITS }, (_, i) => {
          const [a, b] = stub(i, false)
          return run(a, b, 0.012)
        }),
        ...SCATTERED.map(([x]) => splice(x)),
      ]),
    [],
  )
  const wiredByZone = useMemo(
    () =>
      mergeGeometries([
        ...Array.from({ length: UNITS }, (_, i) => {
          const [a, b] = stub(i, true)
          return run(a, b, 0.012)
        }),
        // The trunks are the heavy runs: everything in a corner, in one loom.
        ...TRUNKS.map(([a, b]) => run(a, b, 0.02, 0.022)),
        ...TRUNKS.map(([, b]) => splice(b[0])),
      ]),
    [],
  )

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const m = d.motion ?? ''
    const zonal = m === 'zonal' || m === 'software'
    // Swapped rather than morphed: rewiring a car is not a smooth deformation
    // of a harness, it is a different harness.
    scattered.current.visible = !zonal
    zoned.current.visible = zonal

    if (m === 'harness' || m === 'zonal' || m === 'software') {
      /* The measurement the copy is making.
         `harnessLength` was written to check that the collapse is real, and was
         then called from nowhere — so "the wiring on screen halves, and that is
         the whole argument" was an argument the reader had to take on trust
         while looking at two pictures thirty seconds apart. */
      const before = harnessLength(false)
      const now = harnessLength(zonal)
      publishReadout('car', d.scene, [
        { label: 'Layout', value: zonal ? 'Zonal' : 'One unit per function' },
        { label: 'Wire on screen', value: `${now.toFixed(1)} units`, key: true },
        {
          label: 'Against scattered',
          value: zonal ? `−${Math.round((1 - now / before) * 100)}%` : 'baseline',
        },
      ])
    }
  })

  return (
    <group>
      {/* The bus: CAN-high and CAN-low, twisted round each other. */}
      <mesh geometry={pair[0]} castShadow>
        <meshStandardMaterial color="#7fa8c4" roughness={0.45} metalness={0.1} />
      </mesh>
      <mesh geometry={pair[1]} castShadow>
        <meshStandardMaterial color="#6890aa" roughness={0.45} metalness={0.1} />
      </mesh>
      {/* The stubs, sheathed, and the splices where they join the pair. */}
      <mesh ref={scattered} geometry={wiredByFunction} castShadow>
        <meshStandardMaterial color="#3f5a72" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh ref={zoned} geometry={wiredByZone} castShadow visible={false}>
        <meshStandardMaterial color="#3f5a72" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  )
}

/**
 * What each unit says, built from the priority table the arbitration runs on.
 *
 * The identifier *is* the priority on this bus — there is no separate field —
 * so a tooltip that named the unit without it would be describing a different
 * machine from the one arbitrating on screen.
 */
const UNIT_ENTRIES = PRIORITY.map((id, i) => ({
  term: `Electronic control unit ${i + 1}`,
  line:
    'A small computer with one job — a door, a pedal, a light. A car has dozens, and they all share this one pair of wires.',
  fact: `CAN identifier ${id}${id === Math.min(...PRIORITY) ? ' — the highest priority on this bus' : `, so ${PRIORITY.filter((p) => p < id).length} units win against it`}`,
  tone: 'plain' as const,
}))

/** A unit's housing. Its footprint is what the zone rows were spaced for. */
const UNIT = { w: 0.44, h: 0.26, d: 0.38 }

function Units() {
  const group = useRef<THREE.Group>(null!)
  const named = useNamer('car')
  const pos = useRef(SCATTERED.map(([x, z]) => ({ x, z })))
  const tint = useMemo(() => new THREE.Color(), [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.focus ?? ''
    const t = state.clock.elapsedTime
    const zonal = focus === 'zonal' || focus === 'software'
    const arb = arbitrationAt(t)

    group.current.children.forEach((child, i) => {
      const target = zonal ? zonePos(i) : SCATTERED[i]
      pos.current[i].x = damp(pos.current[i].x, target[0], 3, dt)
      pos.current[i].z = damp(pos.current[i].z, target[1], 3, dt)
      child.position.set(pos.current[i].x, 0, pos.current[i].z)

      const mesh = child.children[0] as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial
      const contending = arb.contenders.includes(i)
      const stillIn = arb.live.includes(i)

      if ((focus === 'arbitrate' || focus === 'nondestructive') && contending) {
        /* Identical until a unit actually loses a bit.
           The winner used to be green from phase 0 — the outcome printed before
           the mechanism that produces it, which teaches "one of these is
           special" instead of "the lower number wins". A contender is now
           simply a contender until the wire tells it otherwise. */
        const decided = arb.resolved >= ID_BITS
        const won = decided && stillIn
        tint.copy(won ? C.winner : stillIn ? C.unit : C.backoff)
        setEmissive(mat, won ? 1.6 : stillIn ? 1.1 : 0.5)
      } else {
        tint.copy(C.unit)
        setEmissive(mat, focus === 'units' || focus === 'harness' ? 0.7 : 0.3)
      }
      mat.color.copy(tint).multiplyScalar(0.22)
      mat.emissive.copy(tint)
    })

    if (focus === 'arbitrate' || focus === 'nondestructive') {
      /* The identifiers, and what the wire is carrying.
         `PRIORITY` decided every round and never reached the screen, under a
         callout reading "lower number wins" — so the reader was told the rule
         and shown none of it. Each row is a contender's identifier with the
         bits decided so far; a 0 always takes the wire, and a unit that sent a
         1 and heard a 0 has already stopped. */
      publishReadout('car', d.scene, [
        ...arb.contenders.map((u) => ({
          label: `Unit ${u + 1} · id ${PRIORITY[u]}`,
          value: idBits(u)
            .map((b, k) => (k < arb.resolved ? String(b) : '·'))
            .join(' '),
          key: arb.resolved >= ID_BITS && arb.live.includes(u),
        })),
        {
          label: 'On the wire',
          value: arb.busBits.concat(Array(ID_BITS - arb.busBits.length).fill('·')).join(' '),
        },
      ])
    }
  })

  return (
    <group ref={group}>
      {SCATTERED.map(([x, z], i) => (
        /* Turned so the connector end faces the bus. A unit keeps its side of
           the car when it moves to its zone, so it never needs turning again. */
        <group key={i} position={[x, 0, z]} rotation={[0, z < 0 ? Math.PI : 0, 0]}>
          {/* First child on purpose: the frame loop above lights this one. A
              cast, lacquered housing with its lid on its face — the connector
              end, a label plate, and fins. */}
          <mesh
            position={[0, UNIT.h / 2, 0]}
            castShadow
            receiveShadow
            geometry={topFaced(UNIT.w, UNIT.h, UNIT.d, 0.04)}
            {...named(`car:unit${i}`, UNIT_ENTRIES[i])}
          >
            <meshPhysicalMaterial
              color="#12202c"
              emissive={C.unit}
              emissiveMap={unitTop()}
              emissiveIntensity={0.4}
              roughness={0.34}
              metalness={0.3}
              clearcoat={0.55}
              clearcoatRoughness={0.18}
            />
          </mesh>
          {/* The connector, on the end facing the bus, where the stub leaves. */}
          <mesh position={[0, 0.07, -UNIT.d / 2 - 0.03]} castShadow geometry={roundedBox(0.22, 0.1, 0.07, 0.015)}>
            <meshStandardMaterial color="#16181c" roughness={0.7} metalness={0.05} />
          </mesh>
          {/* Two mounting ears, bolted to the pan. */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * (UNIT.w / 2 + 0.03), 0.008, 0.06]} receiveShadow geometry={roundedBox(0.08, 0.016, 0.12, 0.006)}>
              <meshStandardMaterial color="#3a4654" roughness={0.3} metalness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Lockstep                                                             */
/* ------------------------------------------------------------------ */

/** The module the pair sits on, raised clear of the bus it straddles. */
const CARRIER = { w: 2.0, d: 1.55, z: 0.3, y: 0.075, t: 0.03 }
const CARRIER_TOP = CARRIER.y + CARRIER.t
const STANDOFFS: Array<[number, number]> = [
  [-0.9, CARRIER.z - 0.68],
  [0.9, CARRIER.z - 0.68],
  [-0.9, CARRIER.z + 0.68],
  [0.9, CARRIER.z + 0.68],
]
const CORE = { w: 0.62, h: 0.3, d: 0.62 }
const COMPARATOR = { w: 1.5, h: 0.14, d: 0.22 }

/**
 * Two cores doing identical work, and a comparator watching them.
 *
 * The redundancy is not for speed — the second core computes nothing new. It
 * exists so that a fault has to happen twice, identically, to go unnoticed, and
 * the moment the two disagree the machine knows something is wrong without
 * knowing which one is right.
 */
function Lockstep() {
  const group = useRef<THREE.Group>(null!)
  const shown = useRef(0)
  const named = useNamer('car')

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.focus ?? ''
    const on = ['lockstep', 'asil', 'lifetime'].includes(focus)
    shown.current = damp(shown.current, on ? 1 : 0, 4, dt)
    group.current.visible = shown.current > 0.02
    group.current.scale.setScalar(Math.max(shown.current, 0.0001))

    const t = state.clock.elapsedTime
    const ls = lockstepAt(t)
    const [a, b, cmp] = group.current.children as unknown as THREE.Mesh[]
    const beat = 0.5 + 0.5 * Math.sin(t * 9)

    const ma = a.material as THREE.MeshStandardMaterial
    const mb = b.material as THREE.MeshStandardMaterial
    const mc = cmp.material as THREE.MeshStandardMaterial

    setEmissive(ma, 0.4 + beat * 1.1)
    // On divergence the second core is doing something *different*, which is the
    // only visual that matters here.
    setEmissive(mb, 0.4 + (ls.diverged ? (1 - beat) : beat) * 1.1)
    mc.emissive.copy(ls.diverged ? C.fault : C.winner)
    setEmissive(mc, ls.diverged ? 2.2 : 0.5)
  })

  const core = (
    <meshPhysicalMaterial
      color="#12202c"
      emissive={C.unit}
      emissiveMap={coreFloorplan()}
      emissiveIntensity={0.5}
      roughness={0.34}
      metalness={0.3}
      clearcoat={0.55}
      clearcoatRoughness={0.18}
    />
  )

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* The first three children are the ones the frame loop lights, in this
          order. Each core wears the same floorplan as the cores of Lecture 1:
          they are ordinary cores, and there are two of them. */}
      <mesh position={[-0.55, CARRIER_TOP + CORE.h / 2, 0]} castShadow geometry={topFaced(CORE.w, CORE.h, CORE.d, 0.04)} {...named('car:lead')}>
        {core}
      </mesh>
      <mesh position={[0.55, CARRIER_TOP + CORE.h / 2, 0]} castShadow geometry={topFaced(CORE.w, CORE.h, CORE.d, 0.04)} {...named('car:shadow')}>
        {core}
      </mesh>
      {/* The comparator. Green while they agree, red the instant they do not. */}
      <mesh
        position={[0, CARRIER_TOP + COMPARATOR.h / 2, 0.85]}
        castShadow
        geometry={topFaced(COMPARATOR.w, COMPARATOR.h, COMPARATOR.d, 0.03)}
        {...named('car:comparator')}
      >
        <meshPhysicalMaterial
          color="#12202c"
          emissive={C.winner}
          emissiveMap={comparatorTop()}
          emissiveIntensity={0.5}
          roughness={0.34}
          metalness={0.3}
          clearcoat={0.55}
          clearcoatRoughness={0.18}
        />
      </mesh>

      {/* The carrier, on four standoffs over the bus. Never lit. */}
      <mesh position={[0, CARRIER.y + CARRIER.t / 2, CARRIER.z]} castShadow receiveShadow geometry={roundedBox(CARRIER.w, CARRIER.t, CARRIER.d, 0.012)}>
        <meshStandardMaterial color="#ffffff" map={carrierTop()} roughness={0.55} metalness={0.2} />
      </mesh>
      {STANDOFFS.map(([x, z], k) => (
        <mesh key={k} position={[x, CARRIER.y / 2, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, CARRIER.y, 12]} />
          <meshStandardMaterial color="#3a4654" roughness={0.3} metalness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

const HUES = [
  new THREE.Color('#7fe9ff'),
  new THREE.Color('#6ee7a8'), // the frame that won
  new THREE.Color('#ffab40'), // the frames that backed off
]

/** Where a winning frame rides: just over the pair. */
const FRAME_Y = 0.1

/**
 * Frames on the wire.
 *
 * The whole point is in the shape of the retreat. Losing frames stop and pull
 * back to where they came from; the winning frame carries on at the same speed
 * it started at, uninterrupted. Nothing restarts, which is exactly the property
 * a brake message needs.
 */
function Traffic() {
  const at = useCallback((i: number, t: number, out: Packet): Packet => {
    const d = updateDriver(t)
    const focus = d.focus ?? ''
    if (focus !== 'arbitrate' && focus !== 'nondestructive' && focus !== 'bus') {
      out.on = false
      return out
    }

    const arb = arbitrationAt(t)
    const which = i % 3
    const unit = arb.contenders[which]
    if (i >= 9) {
      out.on = false
      return out
    }

    const won = unit === arb.winner
    const lane = stub(unit, false)
    const [ux] = lane[0]

    /* Everyone starts together. Losers travel a little way, stop, and slide
       back. The winner keeps going down the spine at a constant speed — it
       never noticed the contention. */
    const p = arb.phase
    if (p < 0.32) {
      const rise = p / 0.32
      const z = lane[0][1] * (1 - rise)
      out.on = true
      out.x = ux
      out.y = FRAME_Y
      out.z = z
      /* Indistinguishable while the outcome is still being decided. Colouring
         the winner here announced the result before the arbitration that
         produces it. */
      const stillIn = arb.live.includes(unit)
      out.hue = 0
      out.scale = 0.075
      out.bright = stillIn ? 1.9 : 0.9
      return out
    }

    if (!won) {
      // Backing off: the same road, travelled the other way.
      const back = Math.min(1, (p - 0.32) / 0.2)
      if (back >= 1) {
        out.on = false
        return out
      }
      out.on = true
      out.x = ux
      out.y = FRAME_Y
      out.z = lane[0][1] * back
      out.hue = 2
      out.scale = 0.065
      out.bright = 1.4
      return out
    }

    /* The winner, continuing along the spine without pause — from its own tap,
       where the stub left it. It used to restart from the middle of the car,
       a jump of up to two and a half units at the one instant the copy says
       nothing happened to it. */
    const along = Math.min(1, (p - 0.32) / 0.55)
    const tap = (ux - SPINE[0][0]) / (SPINE[1][0] - SPINE[0][0])
    const [sx, sz] = sampleLane(SPINE, ux < 0 ? tap + along * (1 - tap) : tap - along * tap)
    out.on = true
    out.x = sx
    out.y = FRAME_Y
    out.z = sz
    out.hue = 1
    out.scale = 0.075
    out.bright = 2.6
    return out
  }, [])

  return <Flow count={9} at={at} hues={HUES} probe="car" />
}
