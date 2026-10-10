import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { publishReadout } from '../readout'
import { Flow, type Packet } from '../motion/Flow'
import { laneGeometry, sampleLane } from '../motion/lanes'
import { damp } from '../../lib/math'
import {
  dieFace,
  edgeFingers,
  ioPads,
  lappedRoughness,
  moldTop,
  pcbBump,
  pcbMap,
  pouchLabel,
  roundedBox,
  siliconMap,
  substrateBump,
  substrateMap,
  topFaced,
  type PcbArt,
} from '../surfaces'
import {
  ALL_LANES,
  BOARD,
  BUSES,
  BUS_MOTION,
  busTurn,
  FLOW_COUNT,
  PARTS,
  TRACE_Y,
} from './boardLayout'

/**
 * A laptop mainboard, built from primitives like the CPU package before it.
 *
 * Same rule on materials: every mesh declares its own, because Part's dimming
 * pass mutates material colour in place and a shared instance would dim every
 * part referencing it.
 *
 * The board is deliberately *sparse* compared to a real one. A real mainboard
 * is a solid field of passives, and rendering that faithfully produces a grey
 * rectangle where nothing can be pointed at. Everything here is a component the
 * chapter actually names.
 */
export function BoardScene() {
  return (
    <group>
      <Pcb />
      <Vrm />
      <Soc />
      <Ram />
      <Ssd />
      <Wifi />
      <Ports />
      <Connectors />
      <Battery />
      <CoolingStow>
        <HeatPipe />
        <Fins />
        <Fan />
      </CoolingStow>
      <Flows />
    </group>
  )
}

/**
 * The I/O beats whose argument is read off the processor's die.
 *
 * "Look at the processor while this happens — it is dark", and the interrupt
 * beats' flare while the program stalls, are both carried by the SoC's die
 * glow, and the cooler's cold plate sits squarely on that die. From these
 * beats' top-down cameras the processor was a copper square. The cooler is set
 * aside here and only here; the Board lecture, where it is a subject, never
 * uses these motions.
 */
const DIE_BEATS = ['polling', 'interrupt', 'cost', 'dma', 'together']

/** Where the cooling assembly shrinks to, so it folds away in place. */
const COOLING_PIVOT = new THREE.Vector3(1.3, PARTS.pipe.y, 0)

function CoolingStow({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!)
  const present = useRef(1)

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const stowed = DIE_BEATS.includes(d.motion ?? '')
    present.current = damp(present.current, stowed ? 0 : 1, 5, dt)
    const s = Math.max(present.current, 0.0001)
    group.current.visible = present.current > 0.02
    group.current.scale.setScalar(s)
    group.current.position.copy(COOLING_PIVOT).multiplyScalar(1 - s)
  })

  return <group ref={group}>{children}</group>
}

/** Focus ids that mean "a bus", rather than a component. */
const BUS_IDS = Object.keys(BUSES)

/** Tags letting a component light up when a bus it belongs to is the subject. */
const SOC_BUSES = ['ddr', 'pcie', 'usb', 'display', 'power', 'board', 'interrupt']

/* ------------------------------------------------------------------ */
/* Board                                                               */
/* ------------------------------------------------------------------ */

/** Where the bracket's four screws land: plated holes either side of the processor. */
const BRACKET = [
  [-1.95, -1.05],
  [0.15, -1.05],
  [-1.95, 1.05],
  [0.15, 1.05],
] as const

/** What the board's face is painted from — the same numbers the parts and packets use. */
const ART: PcbArt = {
  w: BOARD.w,
  d: BOARD.d,
  lanes: ALL_LANES,
  outlines: [
    { ...PARTS.soc, ref: 'U1' },
    { ...PARTS.ram[0], ref: 'U2' },
    { ...PARTS.ram[1], ref: 'U3' },
    { x: PARTS.vrm.x + 0.3, z: PARTS.vrm.z, w: 1.2, d: PARTS.vrm.d, ref: 'PL1-5' },
    { ...PARTS.ssd, ref: 'J4 M.2 SSD' },
    { ...PARTS.wifi, ref: 'J5 WLAN' },
    { ...PARTS.displayConnector, ref: 'J3 eDP' },
    { ...PARTS.batteryConnector, ref: 'J2' },
    ...PARTS.ports.map((p, i) => ({ ...p, ref: p.kind === 'jack' ? 'J8' : `J${6 + i}` })),
  ],
  holes: [...BRACKET, [-3.8, -1.9], [3.85, -2.15], [-3.85, 1.55], [2.35, 2.2]].map(([x, z]) => [x, z] as [number, number]),
}

/** Bare laminate, which is what a board's cut edge is. */
const EDGE = '#1a261f'

function Pcb() {
  return (
    <Part id="pcb" tags={[...BUS_IDS, 'board', 'interrupt']} position={[0, 0, 0]}>
      {/* Solder mask over routed copper. Darker and less saturated than
          solder-mask green really is — at the real colour the board
          out-shouted every component sitting on it — with the routing standing
          proud of it under a grazing light, and the wet gloss mask has. */}
      <mesh castShadow receiveShadow geometry={roundedBox(BOARD.w, BOARD.t, BOARD.d, 0.03)}>
        <meshStandardMaterial attach="material-0" color={EDGE} roughness={0.75} metalness={0.05} />
        <meshStandardMaterial attach="material-1" color={EDGE} roughness={0.75} metalness={0.05} />
        <meshPhysicalMaterial
          attach="material-2"
          map={pcbMap(ART)}
          bumpMap={pcbBump(ART)}
          bumpScale={1.4}
          roughness={0.5}
          metalness={0.1}
          clearcoat={0.45}
          clearcoatRoughness={0.4}
        />
        <meshStandardMaterial attach="material-3" color={EDGE} roughness={0.75} metalness={0.05} />
        <meshStandardMaterial attach="material-4" color={EDGE} roughness={0.75} metalness={0.05} />
        <meshStandardMaterial attach="material-5" color={EDGE} roughness={0.75} metalness={0.05} />
      </mesh>
      <Passives />
      <Traces />
    </Part>
  )
}

/**
 * The routing layer.
 *
 * Drawn as lines rather than as geometry on the board face because the lesson
 * is topological — what connects to what, and how far it has to go. Etched
 * copper at this scale would be a texture nobody can read.
 */
function Traces() {
  const geometry = useMemo(() => laneGeometry(ALL_LANES, TRACE_Y), [])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#c08a3e" transparent opacity={0.5} />
    </lineSegments>
  )
}

/**
 * Decoupling capacitors, in the few places a real board packs them densest:
 * round the processor and the memory, and beside the regulators.
 *
 * A few dozen, instanced, and kept off every route — enough that the board
 * reads as populated, few enough that nothing unnamed competes with a part the
 * copy names.
 */
function Passives() {
  const body = useRef<THREE.InstancedMesh>(null!)
  const ends = useRef<THREE.InstancedMesh>(null!)
  const spots = useMemo(() => {
    const out: Array<[number, number, number]> = []
    const r = (seed: number) => {
      const s = Math.sin(seed * 12.9898) * 43758.5453
      return s - Math.floor(s)
    }
    // Clusters, as [x, z, spread x, spread z, count].
    const clusters: Array<[number, number, number, number, number]> = [
      [-2.05, -1.55, 0.35, 0.18, 7],
      [-2.05, 1.62, 0.3, 0.14, 6],
      [1.95, -0.62, 0.14, 0.22, 5],
      [1.95, 0.62, 0.14, 0.22, 5],
      [-3.55, -1.6, 0.18, 0.3, 5],
      [2.15, 1.12, 0.12, 0.1, 4],
      [3.0, -0.95, 0.35, 0.05, 5],
    ]
    let k = 1
    for (const [cx, cz, sx, sz, n] of clusters)
      for (let i = 0; i < n; i++, k++)
        out.push([cx + (r(k) - 0.5) * 2 * sx, cz + (r(k + 71) - 0.5) * 2 * sz, r(k + 131) < 0.5 ? 0 : Math.PI / 2])
    return out
  }, [])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const one = new THREE.Vector3(1, 1, 1)
    const up = new THREE.Vector3(0, 1, 0)
    spots.forEach(([x, z, a], i) => {
      q.setFromAxisAngle(up, a)
      m.compose(new THREE.Vector3(x, BOARD.t / 2 + 0.022, z), q, one)
      body.current.setMatrixAt(i, m)
      ends.current.setMatrixAt(i, m)
    })
    body.current.instanceMatrix.needsUpdate = true
    ends.current.instanceMatrix.needsUpdate = true
    body.current.computeBoundingSphere()
    ends.current.computeBoundingSphere()
  }, [spots])

  return (
    <group>
      {/* Tan ceramic between two plated ends, as on the package in Lecture 1. */}
      <instancedMesh ref={body} args={[roundedBox(0.075, 0.044, 0.05, 0.008, 2), undefined, spots.length]} castShadow>
        <meshStandardMaterial color="#8c6c4a" roughness={0.6} metalness={0.05} />
      </instancedMesh>
      <instancedMesh ref={ends} args={[roundedBox(0.1, 0.046, 0.052, 0.008, 2), undefined, spots.length]}>
        <meshStandardMaterial color="#9ea4ad" roughness={0.45} metalness={1} />
      </instancedMesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

/** The package's substrate, and the die on it, as heights inside the SoC's footprint. */
const SOC_SUB = 0.13
const SOC_DIE = 0.62

function Soc() {
  const die = useRef<THREE.Mesh>(null!)
  const p = PARTS.soc

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const t = state.clock.elapsedTime
    const focus = d.motion ?? ''

    /* Brightness follows what the processor is actually doing on this beat,
       rather than a heartbeat.

       Near-dark on the DMA beat because the transfer happens without it — that
       beat exists to say the processor is not involved. The sine that used to
       be here said "working hard" on every beat, including the one whose entire
       argument is that it is idle.

       An interrupt is the opposite case, and it used to be drawn the same way:
       dark through the stall, as if the processor had stopped. It has not. The
       *interrupted program* stops; the processor is busy running the handler.
       So it flares while the program's traffic is frozen — on both interrupt
       beats, and on `cost` more and more often, which is the lost time the
       readout counts. */
    const period = focus === 'cost' ? Math.max(1.9, 7 - d.beatTime * 0.42) : 7
    const fires = Math.max(0.6, period - 3.6)
    const stalled =
      (focus === 'interrupt' || focus === 'cost') &&
      t % period >= fires &&
      t % period < fires + 1.5

    if (focus === 'polling') {
      publishReadout('board', d.scene, [
        { label: 'Checks per second', value: '1.2' },
        { label: 'Found something', value: '1 in 8' },
        { label: 'Effort wasted', value: '88%', key: true },
        { label: 'Processor', value: 'busy asking' },
      ])
    }

    if (focus === 'cost') {
      /* The number the beat is actually about. Every interrupt costs a fixed
         1.5 s of saving, handling and restoring here; as they arrive more
         often, that fixed cost eats a larger share until the processor spends
         more time servicing interrupts than doing work — which is exactly when
         real systems switch back to polling. */
      const share = Math.min(1, 1.5 / period)
      publishReadout('board', d.scene, [
        { label: 'Interrupt every', value: `${period.toFixed(1)} s` },
        { label: 'Servicing each', value: '1.5 s' },
        { label: 'Processor time lost', value: `${Math.round(share * 100)}%`, key: true },
        { label: 'Verdict', value: share > 0.5 ? 'poll instead' : 'interrupts win' },
      ])
    }
    /* `together` is the pairing beat, and it is the opposite of `dma`: the
       engine moves the data *while the processor works on something else*.
       It used to share `dma`'s motion, so the copy said the processor is busy
       over a picture of it sitting dark — the previous beat's claim, inverted
       and left in place. */
    const level =
      focus === 'dma' ? 0.1 :
      stalled ? 1.6 :
      focus === 'polling' ? 1.15 :
      focus === 'together' ? 1.15 :
      focus === 'soc' || SOC_BUSES.includes(focus) ? 1.15 : 0.45
    setEmissive(die.current.material as THREE.MeshStandardMaterial, level)
  })

  const dieH = p.h + 0.024 - SOC_SUB
  const caps = useMemo(() => {
    const out: Array<[number, number, boolean]> = []
    const edge = (p.w * SOC_DIE) / 2 + 0.13
    for (let i = 0; i < 7; i++) {
      const u = (i / 6 - 0.5) * p.w * 0.6
      out.push([u, -edge, false], [u, edge, false], [-edge, u, true], [edge, u, true])
    }
    return out
  }, [p.w])

  return (
    <Part id="soc" tags={SOC_BUSES} position={[p.x, BOARD.t / 2 + p.h / 2, p.z]} offset={[0, 1.35, 0]}>
      {/* The package substrate: routing fanning out from the die under a
          glossy mask, as on the package in Lecture 1 — this is the same kind
          of object, soldered down rather than socketed. */}
      <mesh position={[0, -p.h / 2 + SOC_SUB / 2, 0]} castShadow receiveShadow geometry={roundedBox(p.w, SOC_SUB, p.d, 0.02)}>
        <meshStandardMaterial attach="material-0" color="#172419" roughness={0.7} metalness={0.05} />
        <meshStandardMaterial attach="material-1" color="#172419" roughness={0.7} metalness={0.05} />
        <meshPhysicalMaterial
          attach="material-2"
          map={substrateMap()}
          bumpMap={substrateBump()}
          bumpScale={1}
          roughness={0.42}
          metalness={0.1}
          clearcoat={0.5}
          clearcoatRoughness={0.4}
        />
        <meshStandardMaterial attach="material-3" color="#172419" roughness={0.7} metalness={0.05} />
        <meshStandardMaterial attach="material-4" color="#172419" roughness={0.7} metalness={0.05} />
        <meshStandardMaterial attach="material-5" color="#172419" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Land-side capacitors in a ring round the die. */}
      {caps.map(([x, z, turn], i) => (
        <group key={i} position={[x, -p.h / 2 + SOC_SUB + 0.017, z]} rotation={[0, turn ? Math.PI / 2 : 0, 0]}>
          <mesh castShadow geometry={roundedBox(0.06, 0.032, 0.045, 0.008, 2)}>
            <meshStandardMaterial color="#9b7650" roughness={0.55} metalness={0.05} />
          </mesh>
          <mesh geometry={roundedBox(0.09, 0.034, 0.047, 0.008, 2)}>
            <meshStandardMaterial color="#d6d9de" roughness={0.28} metalness={1} />
          </mesh>
        </group>
      ))}
      {/* The die, exposed — laptop SoCs are usually bare, with the cooler
          pressing straight onto the silicon. Its own floorplan is what lights,
          so "the processor is dark" and "it flares" are read off a circuit
          rather than off a lit panel. */}
      <mesh
        ref={die}
        position={[0, -p.h / 2 + SOC_SUB + dieH / 2, 0]}
        castShadow
        geometry={topFaced(p.w * SOC_DIE, dieH, p.d * SOC_DIE, 0.012)}
      >
        <meshPhysicalMaterial
          color="#0d2b3a"
          map={siliconMap()}
          emissive="#3ad8ff"
          emissiveMap={dieFace()}
          emissiveIntensity={0.6}
          roughness={0.22}
          metalness={0.55}
          iridescence={0.6}
          iridescenceIOR={1.7}
          iridescenceThicknessRange={[240, 620]}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
        />
      </mesh>
    </Part>
  )
}

/**
 * A packaged chip: a thin substrate edge under a laser-marked mould cap.
 *
 * Every chip on the board is this shape, and the marking is the only thing that
 * tells them apart — which is also true of a real board.
 */
function Chip({
  w,
  h,
  d,
  mark,
  lines,
  position,
}: {
  w: number
  h: number
  d: number
  mark: string
  lines: string[]
  position?: [number, number, number]
}) {
  const sub = Math.min(0.03, h * 0.35)
  const top = moldTop(mark, lines, w / d)
  return (
    <group position={position}>
      <mesh position={[0, -h / 2 + sub / 2, 0]} castShadow receiveShadow geometry={roundedBox(w, sub, d, 0.008, 2)}>
        <meshStandardMaterial color="#1b2e22" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, sub / 2, 0]} castShadow receiveShadow geometry={roundedBox(w - 0.05, h - sub, d - 0.05, 0.014, 2)}>
        <meshStandardMaterial attach="material-0" color="#16181c" roughness={0.7} metalness={0.1} />
        <meshStandardMaterial attach="material-1" color="#16181c" roughness={0.7} metalness={0.1} />
        <meshStandardMaterial attach="material-2" map={top} roughness={0.62} metalness={0.12} />
        <meshStandardMaterial attach="material-3" color="#16181c" roughness={0.7} metalness={0.1} />
        <meshStandardMaterial attach="material-4" color="#16181c" roughness={0.7} metalness={0.1} />
        <meshStandardMaterial attach="material-5" color="#16181c" roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  )
}

function Ram() {
  return (
    <Part
      id="ram"
      tags={['ddr', 'board', 'dma']}
      position={[0, BOARD.t / 2, 0]}
      offset={[0, 0.95, 0]}
    >
      {/* Soldered LPDDR packages, one each side of the bus, as thin laptops
          carry it — there is no slot, which is part of why the run is short. */}
      {PARTS.ram.map((p, i) => (
        <Chip
          key={i}
          position={[p.x, p.h / 2, p.z]}
          w={p.w}
          h={p.h}
          d={p.d}
          mark="lpddr"
          lines={['A5X-16G', 'LPDDR5X  x64', '2609 · 7K']}
        />
      ))}
    </Part>
  )
}

/**
 * Voltage regulators.
 *
 * The inductors are the tallest, chunkiest things on the board that are not the
 * cooler, which is the whole point of the power beat: converting a battery's
 * volts down to the core's volts at very high current takes real, bulky,
 * physical parts, and they have to sit close to what they feed.
 */
function Vrm() {
  const v = PARTS.vrm
  const chokes = useMemo(
    () => Array.from({ length: 5 }, (_, i) => (i / 4 - 0.5) * v.d * 0.86),
    [v.d],
  )
  const marking = moldTop('choke', ['R22', '1F'], 0.44 / 0.4)

  return (
    <Part
      id="vrm"
      tags={['power', 'board']}
      position={[0, BOARD.t / 2, 0]}
      offset={[0, 0.7, 0]}
    >
      {/* Moulded power inductors: sintered ferrite, dark grey and matte, with
          their inductance printed on top and two broad terminals at the foot. */}
      {chokes.map((z, i) => (
        <group key={i} position={[v.x, 0.14, z]}>
          <mesh castShadow receiveShadow geometry={roundedBox(0.44, 0.28, 0.4, 0.035)}>
            <meshStandardMaterial attach="material-0" color="#2d2f35" roughness={0.82} metalness={0.1} />
            <meshStandardMaterial attach="material-1" color="#2d2f35" roughness={0.82} metalness={0.1} />
            <meshStandardMaterial attach="material-2" color="#c4c8d0" map={marking} roughness={0.78} metalness={0.1} />
            <meshStandardMaterial attach="material-3" color="#2d2f35" roughness={0.82} metalness={0.1} />
            <meshStandardMaterial attach="material-4" color="#2d2f35" roughness={0.82} metalness={0.1} />
            <meshStandardMaterial attach="material-5" color="#2d2f35" roughness={0.82} metalness={0.1} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.205, -0.115, 0]} geometry={roundedBox(0.05, 0.05, 0.3, 0.01, 2)}>
              <meshStandardMaterial color="#b9bcc2" roughness={0.35} metalness={1} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Bulk capacitors alongside, holding the rail up between switching
          cycles: aluminium cans on a black seat, scored on top to vent. */}
      {chokes.map((z, i) => (
        <group key={`c${i}`} position={[v.x + 0.62, 0.11, z]}>
          <mesh position={[0, -0.095, 0]} geometry={roundedBox(0.3, 0.03, 0.3, 0.01, 2)}>
            <meshStandardMaterial color="#121418" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.015, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.19, 24]} />
            <meshStandardMaterial color="#c3c8cf" roughness={0.32} metalness={1} />
          </mesh>
          {/* Polarity band and vent cross. */}
          <mesh position={[0, 0.111, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.13, 24, Math.PI * 0.6, Math.PI * 0.8]} />
            <meshStandardMaterial color="#1b1e24" roughness={0.6} />
          </mesh>
          {[0, Math.PI / 2].map((a) => (
            <mesh key={a} position={[0, 0.112, 0]} rotation={[0, a, 0]}>
              <boxGeometry args={[0.2, 0.004, 0.012]} />
              <meshStandardMaterial color="#6d737c" roughness={0.5} metalness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </Part>
  )
}

/**
 * An M.2 card: a narrow board of its own, held at one end by its socket and at
 * the other by a screw, with its gold fingers in the socket.
 */
function M2Card({ w, d, h, children }: { w: number; d: number; h: number; children?: React.ReactNode }) {
  const card = 0.032
  const lift = 0.035
  return (
    <group>
      {/* The socket, at the processor's end. */}
      <mesh position={[-w / 2 + 0.07, 0, 0]} castShadow receiveShadow geometry={roundedBox(0.14, h, d + 0.08, 0.015, 2)}>
        <meshStandardMaterial color="#111317" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* The card itself. */}
      <mesh position={[0.02, -h / 2 + lift + card / 2, 0]} castShadow receiveShadow geometry={roundedBox(w - 0.1, card, d, 0.012, 2)}>
        <meshStandardMaterial color="#10231c" roughness={0.55} metalness={0.1} />
      </mesh>
      {/* Gold fingers where the card enters the socket. */}
      <mesh position={[-w / 2 + 0.17, -h / 2 + lift + card + 0.001, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[d * 0.96, 0.07]} />
        <meshStandardMaterial map={edgeFingers()} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* The standoff and screw at the far end, through a half-moon notch. */}
      <mesh position={[w / 2 - 0.08, -h / 2 + lift / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, lift, 16]} />
        <meshStandardMaterial color="#b89a5a" roughness={0.35} metalness={1} />
      </mesh>
      <mesh position={[w / 2 - 0.08, -h / 2 + lift + card + 0.012, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.024, 20]} />
        <meshStandardMaterial color="#9aa2ad" roughness={0.3} metalness={1} />
      </mesh>
      <group position={[0, -h / 2 + lift + card, 0]}>{children}</group>
    </group>
  )
}

function Ssd() {
  const p = PARTS.ssd
  return (
    <Part
      id="ssd"
      tags={['pcie', 'board', 'dma']}
      position={[p.x, BOARD.t / 2 + p.h / 2, p.z]}
      offset={[0, 0.85, 0]}
    >
      {/* Two NAND packages and a controller — the whole drive, physically. */}
      <M2Card w={p.w} d={p.d} h={p.h}>
        {[-0.52, 0.18].map((x) => (
          <Chip key={x} position={[x, 0.03, 0]} w={0.6} h={0.06} d={0.4} mark="nand" lines={['N1T-TLC', '512 GB', '2609']} />
        ))}
        <Chip position={[0.74, 0.025, 0]} w={0.32} h={0.05} d={0.32} mark="nvme" lines={['NV4', 'x4']} />
      </M2Card>
    </Part>
  )
}

function Wifi() {
  const p = PARTS.wifi
  return (
    <Part
      id="wifi"
      tags={['usb', 'board']}
      position={[p.x, BOARD.t / 2 + p.h / 2, p.z]}
      offset={[0, 0.8, 0]}
    >
      <M2Card w={p.w} d={p.d} h={p.h}>
        {/* A shield can, because a radio has to be kept away from everything
            else on the board — and everything else kept away from it. */}
        <mesh position={[0.04, 0.028, 0]} castShadow geometry={roundedBox(p.w * 0.56, 0.05, p.d * 0.78, 0.012, 2)}>
          <meshStandardMaterial color="#a4abb5" metalness={1} roughness={0.38} roughnessMap={lappedRoughness()} />
        </mesh>
        {/* The two antenna sockets, where the cables to the lid clip on. */}
        {[-0.12, 0.12].map((z) => (
          <mesh key={z} position={[p.w / 2 - 0.2, 0.02, z]}>
            <cylinderGeometry args={[0.04, 0.04, 0.04, 14]} />
            <meshStandardMaterial color="#d8b25a" roughness={0.3} metalness={1} />
          </mesh>
        ))}
      </M2Card>
    </Part>
  )
}

function Ports() {
  return (
    <Part
      id="ports"
      tags={['usb', 'board', 'interrupt']}
      position={[0, BOARD.t / 2, 0]}
      offset={[0, 0.55, 0]}
    >
      {PARTS.ports.map((p, i) =>
        p.kind === 'jack' ? (
          <group key={i} position={[p.x, 0.11, p.z]}>
            {/* Headphone jack: a moulded body with the socket facing out. */}
            <mesh castShadow receiveShadow geometry={roundedBox(p.w, 0.22, p.d, 0.03)}>
              <meshStandardMaterial color="#101217" metalness={0.3} roughness={0.7} />
            </mesh>
            <mesh position={[0, 0, p.d / 2 + 0.005]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.02, 20]} />
              <meshStandardMaterial color="#9aa1ab" metalness={1} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0, p.d / 2 + 0.016]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.004, 20]} />
              <meshStandardMaterial color="#040506" roughness={0.9} />
            </mesh>
          </group>
        ) : (
          <group key={i} position={[p.x, 0.11, p.z]}>
            {/* USB-C: a drawn steel shell, a stadium in section, with the
                contact tongue inside the opening at the board's edge. */}
            <mesh castShadow receiveShadow geometry={roundedBox(p.w, 0.22, p.d, 0.1, 4)}>
              <meshStandardMaterial color="#aab1bb" metalness={1} roughness={0.32} roughnessMap={lappedRoughness()} />
            </mesh>
            <mesh position={[0, 0, p.d / 2 - 0.006]} geometry={roundedBox(p.w * 0.84, 0.15, 0.02, 0.07, 4)}>
              <meshStandardMaterial color="#050608" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0, p.d / 2 - 0.003]} geometry={roundedBox(p.w * 0.56, 0.04, 0.02, 0.012, 2)}>
              <meshStandardMaterial color="#2a2f38" roughness={0.6} />
            </mesh>
          </group>
        ),
      )}
    </Part>
  )
}

/** A board-to-board connector: a moulded body carrying a row of gold contacts. */
function Header({ x, z, w, d, h }: { x: number; z: number; w: number; d: number; h: number }) {
  const along = w >= d
  return (
    <group position={[x, h / 2, z]}>
      <mesh castShadow receiveShadow geometry={roundedBox(w, h, d, 0.015, 2)}>
        <meshStandardMaterial color="#1a1c21" roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh position={[0, h / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, along ? 0 : Math.PI / 2]}>
        <planeGeometry args={[(along ? w : d) * 0.9, (along ? d : w) * 0.45]} />
        <meshStandardMaterial color="#e2b552" map={ioPads()} roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  )
}

function Connectors() {
  const d = PARTS.displayConnector
  const b = PARTS.batteryConnector
  return (
    <Part
      id="connectors"
      tags={['display', 'power', 'board']}
      position={[0, BOARD.t / 2, 0]}
      offset={[0, 0.5, 0]}
    >
      <Header x={d.x} z={d.z} w={d.w} d={d.d} h={0.1} />
      <Header x={b.x} z={b.z} w={b.w} d={b.d} h={0.12} />
    </Part>
  )
}

/**
 * The battery.
 *
 * Sits under the board and is far and away the largest single object in the
 * machine, which is the honest picture — most of the volume of a laptop is not
 * computer, it is chemistry.
 */
function Battery() {
  const b = PARTS.battery
  const tray = b.h * 0.4
  const cell = b.h - tray + 0.05
  return (
    <Part id="battery" tags={['power']} position={[b.x, b.y, b.z]} offset={[0, -2.3, 0]}>
      {/* The pack's moulded tray. */}
      <mesh position={[0, -b.h / 2 + tray / 2, 0]} castShadow receiveShadow geometry={roundedBox(b.w, tray, b.d, 0.05)}>
        <meshStandardMaterial color="#1c2027" roughness={0.75} metalness={0.15} />
      </mesh>
      {/* Three pouch cells, because that is how a laptop battery is built:
          foil pillows, soft-cornered, each carrying the pack's print. */}
      {[-1, 0, 1].map((k) => (
        <mesh
          key={k}
          position={[k * 1.9, b.h / 2 - cell / 2, 0]}
          castShadow
          receiveShadow
          geometry={roundedBox(1.78, cell, b.d * 0.88, 0.1, 4)}
        >
          <meshPhysicalMaterial attach="material-0" color="#aab2bc" roughness={0.4} metalness={0.7} clearcoat={0.6} clearcoatRoughness={0.3} />
          <meshPhysicalMaterial attach="material-1" color="#aab2bc" roughness={0.4} metalness={0.7} clearcoat={0.6} clearcoatRoughness={0.3} />
          <meshPhysicalMaterial attach="material-2" map={pouchLabel()} roughness={0.42} metalness={0.55} clearcoat={0.6} clearcoatRoughness={0.3} />
          <meshPhysicalMaterial attach="material-3" color="#aab2bc" roughness={0.4} metalness={0.7} clearcoat={0.6} clearcoatRoughness={0.3} />
          <meshPhysicalMaterial attach="material-4" color="#aab2bc" roughness={0.4} metalness={0.7} clearcoat={0.6} clearcoatRoughness={0.3} />
          <meshPhysicalMaterial attach="material-5" color="#aab2bc" roughness={0.4} metalness={0.7} clearcoat={0.6} clearcoatRoughness={0.3} />
        </mesh>
      ))}
      {/* The protection board at the end of the pack: it watches every cell,
          and it is where the lead to the mainboard leaves. */}
      <mesh position={[-b.w / 2 + 0.17, -b.h / 2 + tray + 0.016, 0]} castShadow geometry={roundedBox(0.22, 0.032, b.d * 0.6, 0.01, 2)}>
        <meshStandardMaterial color="#10231c" roughness={0.55} metalness={0.1} />
      </mesh>
      {[-0.5, 0, 0.5].map((z) => (
        <mesh key={z} position={[-b.w / 2 + 0.17, -b.h / 2 + tray + 0.045, z]} geometry={roundedBox(0.12, 0.03, 0.16, 0.006, 2)}>
          <meshStandardMaterial color="#15171b" roughness={0.6} />
        </mesh>
      ))}
    </Part>
  )
}

/* ------------------------------------------------------------------ */
/* Cooling                                                             */
/* ------------------------------------------------------------------ */

/**
 * The heat pipe.
 *
 * Glows toward the fins when the thermal beats are on screen. It is not
 * decoration: a heat pipe really does move heat by boiling a working fluid at
 * the hot end and condensing it at the cold end, so the gradient along its
 * length is the mechanism.
 */
function HeatPipe() {
  const mesh = useRef<THREE.Mesh>(null!)
  const plateRef = useRef<THREE.Mesh>(null!)
  const p = PARTS.pipe
  const length = p.to - p.from
  const rough = lappedRoughness()

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)

    /* Steady, not pulsing.
       Heat does not arrive in waves, and a throbbing pipe implied that it did.
       What is true is a *gradient* — hot where it meets the die, cool where it
       meets the fins — so the plate at the hot end is the brightest thing and
       the tube behind it is dimmer. The mechanism, rather than a flicker. */
    const hot = d.focus === 'cooling' || d.focus === 'heatpipe' ? 1 : 0.25
    setEmissive(mesh.current.material as THREE.MeshStandardMaterial, 0.06 + 0.5 * hot)
    const plate = plateRef.current?.material as THREE.MeshStandardMaterial
    if (plate) setEmissive(plate, 0.1 + 1.15 * hot)
  })

  /* The plate sits over the processor, and the bracket's arms run from its
     corners out to the four screws. */
  const plateX = -length / 2
  const plateTop = -0.06 + 0.05

  return (
    <Part
      id="heatpipe"
      tags={['cooling']}
      position={[p.from + length / 2, p.y, 0]}
      offset={[0, 2.7, 0]}
    >
      {/* Flattened, as laptop heat pipes are, so it fits the height of the
          chassis: round in the drawing, an oval in section. */}
      <mesh ref={mesh} rotation={[0, 0, Math.PI / 2]} scale={[0.62, 1, 1]} castShadow>
        <cylinderGeometry args={[p.r, p.r, length, 24]} />
        <meshStandardMaterial
          color="#c07a48"
          emissive="#ff7a3a"
          emissiveIntensity={0.1}
          metalness={1}
          roughness={0.3}
          roughnessMap={rough}
        />
      </mesh>
      {/* The flattened plate that clamps onto the die: the hot end, and the
          bright end of the gradient. Lapped copper, flat to a few microns. */}
      <mesh ref={plateRef} position={[plateX, -0.06, 0]} castShadow geometry={roundedBox(1.5, 0.1, 1.5, 0.02)}>
        <meshStandardMaterial
          color="#c98a52"
          emissive="#ff7a3a"
          emissiveIntensity={0.1}
          metalness={1}
          roughness={0.3}
          roughnessMap={rough}
        />
      </mesh>
      {/* The spring bracket that holds the plate down: four steel arms out to
          screws on brass standoffs. */}
      {BRACKET.map(([x, z]) => {
        const lx = x - p.from
        const sx = Math.sign(lx)
        const sz = Math.sign(z)
        const cx = plateX + sx * 0.7
        const cz = sz * 0.7
        const ax = (cx + plateX + lx) / 2
        const az = (cz + z) / 2
        const len = Math.hypot(plateX + lx - cx, z - cz) + 0.1
        return (
          <group key={`${x}:${z}`}>
            <mesh
              position={[ax, plateTop + 0.01, az]}
              rotation={[0, -Math.atan2(z - cz, plateX + lx - cx), 0]}
              castShadow
              geometry={roundedBox(len, 0.02, 0.13, 0.008, 2)}
            >
              <meshStandardMaterial color="#3a3f47" roughness={0.45} metalness={0.9} />
            </mesh>
            <mesh position={[plateX + lx, (BOARD.t / 2 - p.y + plateTop) / 2, z]}>
              <cylinderGeometry args={[0.045, 0.045, plateTop - (BOARD.t / 2 - p.y), 12]} />
              <meshStandardMaterial color="#b89a5a" roughness={0.35} metalness={1} />
            </mesh>
            <mesh position={[plateX + lx, plateTop + 0.035, z]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.03, 18]} />
              <meshStandardMaterial color="#9aa2ad" roughness={0.3} metalness={1} />
            </mesh>
          </group>
        )
      })}
    </Part>
  )
}

function Fins() {
  const f = PARTS.fins
  // Kept to 14. Denser fin stacks are truer to life and alias into a shimmering
  // moire at the camera distances this chapter uses.
  const count = 14
  /* Shared within the part, which is safe: the whole part dims as one. */
  const metal = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#b4bcc8', metalness: 1, roughness: 0.38, roughnessMap: lappedRoughness() }),
    [],
  )

  return (
    <Part id="fins" tags={['cooling']} position={[f.x, PARTS.pipe.y, f.z]} offset={[0, 2.7, 0]}>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          position={[(i / (count - 1) - 0.5) * f.w, 0, 0]}
          castShadow
          material={metal}
          geometry={roundedBox(0.022, f.h, f.d, 0.008, 2)}
        />
      ))}
    </Part>
  )
}

/** One impeller blade: a thin forward-curved vane, standing on its edge. */
function bladeGeometry(r0: number, r1: number, height: number, thick: number) {
  const steps = 10
  const sweep = 0.55
  const inner: THREE.Vector2[] = []
  const outer: THREE.Vector2[] = []
  for (let k = 0; k <= steps; k++) {
    const u = k / steps
    const rad = r0 + (r1 - r0) * u
    const a = sweep * u * u
    const n = new THREE.Vector2(-Math.sin(a), Math.cos(a)).multiplyScalar(thick / 2)
    const c = new THREE.Vector2(Math.cos(a) * rad, Math.sin(a) * rad)
    inner.push(c.clone().add(n))
    outer.push(c.clone().sub(n))
  }
  const shape = new THREE.Shape([...inner, ...outer.reverse()])
  const g = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false })
  g.rotateX(-Math.PI / 2)
  g.translate(0, -height / 2, 0)
  return g
}

function Fan() {
  const blades = useRef<THREE.Group>(null!)
  const f = PARTS.fan

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    // Spins up when the chapter is about heat. A fan that always ran flat out
    // would say the machine is always at its limit, which is the opposite of
    // what the thermal beats are explaining.
    const speed = d.focus === 'cooling' || d.focus === 'fan' ? 9 : 2.2
    blades.current.rotation.y += speed * dt
  })

  /* A blower, as in every thin laptop: the housing sits on the board and the
     impeller throws air sideways, out of the gap facing the fins, rather than
     down through itself. */
  const R = f.r * 1.02
  const base = -0.35
  const top = 0.1
  const wall = top - base
  const mid = (top + base) / 2
  const blade = useMemo(() => bladeGeometry(f.r * 0.3, f.r * 0.92, wall - 0.06, 0.03), [f.r, wall])
  const cover = useMemo(() => {
    const s = new THREE.Shape().absarc(0, 0, R, 0, Math.PI * 2, false)
    s.holes.push(new THREE.Path().absarc(0, 0, f.r * 0.62, 0, Math.PI * 2, true))
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.016, bevelEnabled: false, curveSegments: 40 })
    g.rotateX(-Math.PI / 2)
    return g
  }, [R, f.r])
  const vane = useMemo(() => new THREE.MeshStandardMaterial({ color: '#50575f', roughness: 0.55, metalness: 0.2 }), [])

  return (
    <Part id="fan" tags={['cooling']} position={[f.x, PARTS.pipe.y, f.z]} offset={[0, 2.7, 0]}>
      {/* Housing: a base, a wall open toward the fins, and a cover with the
          intake the blades show through. */}
      <mesh position={[0, base, 0]} receiveShadow>
        <cylinderGeometry args={[R, R, 0.02, 40]} />
        <meshStandardMaterial color="#1c2026" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, mid, 0]} castShadow>
        <cylinderGeometry args={[R, R, wall, 40, 1, true, Math.PI * 1.5 + 0.6, Math.PI * 2 - 1.2]} />
        <meshStandardMaterial color="#22262e" roughness={0.65} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, top, 0]} geometry={cover} castShadow>
        <meshStandardMaterial color="#262b33" roughness={0.5} metalness={0.4} />
      </mesh>
      <group ref={blades} position={[0, mid, 0]}>
        {Array.from({ length: 11 }, (_, i) => (
          <mesh key={i} rotation={[0, (i / 11) * Math.PI * 2, 0]} geometry={blade} material={vane} castShadow />
        ))}
        <mesh>
          <cylinderGeometry args={[f.r * 0.3, f.r * 0.3, wall - 0.04, 24]} />
          <meshStandardMaterial color="#2e343d" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* A light hub cap, off-centre in its print, so the spin reads even
            where the blades are hard to see. */}
        <mesh position={[0, wall / 2 - 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[f.r * 0.24, 24]} />
          <meshStandardMaterial color="#8d949e" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[f.r * 0.1, wall / 2 - 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[f.r * 0.12, f.r * 0.05]} />
          <meshStandardMaterial color="#20252c" roughness={0.6} />
        </mesh>
      </group>
    </Part>
  )
}

/* ------------------------------------------------------------------ */
/* Traffic                                                             */
/* ------------------------------------------------------------------ */

const HUES = [
  new THREE.Color('#7fe9ff'), // data
  new THREE.Color('#ffc46b'), // power
  new THREE.Color('#b98dff'), // peripheral traffic
]

/**
 * Packets moving along whichever bus the current beat is about.
 *
 * Outside the Part system on purpose: this is not a component, it is what the
 * components are doing, and it should stay legible while a part is spotlit
 * rather than dimming along with everything that is not the subject.
 */
function Flows() {
  const at = useCallback((i: number, _t: number, out: Packet): Packet => {
    const t = _t
    const d = updateDriver(t)

    /* With no bus in focus the board still ticks over on DDR at a low rate. A
       completely still board reads as powered off, which undercuts every beat
       that is not specifically about a bus. */
    const focus = d.motion ?? ''

    /* The interrupt beat is the one case where the *interruption* is the
       subject rather than the traffic. Memory traffic runs normally, an
       interrupt arrives from a port, and the program the processor was running
       stops while the processor services it. Freezing the stream mid-journey is the
       only way to show that a packet does not finish its trip — a faded-out
       stream would read as "less traffic", which is the wrong lesson. */
    /* Asking, over and over, and almost always finding nothing.
       This is half of the lecture's central contrast — "the lecture is those two
       clips side by side" — and it was not animated as polling at all: the beat
       inherited ordinary bidirectional USB traffic, so a reader saw a working
       bus rather than a processor wasting itself. Now a query goes out, comes
       back empty, and goes out again, with the processor lit the whole time
       because it is the one doing the asking. */
    if (focus === 'polling') {
      const CHECK = 0.85
      const lanes_ = BUSES.usb
      const lane_ = lanes_[i % lanes_.length]
      if (!lane_ || i >= 12) {
        out.on = false
        return out
      }
      const round = Math.floor(t / CHECK)
      const ph = (t % CHECK) / CHECK
      // One query in flight at a time per lane: out on the first half, back on
      // the second. Every eighth check actually finds something.
      const found = (round + (i % lanes_.length)) % 8 === 0
      const u = ph < 0.5 ? ph * 2 : 1 - (ph - 0.5) * 2
      const [x2, z2] = sampleLane(lane_, 1 - u)
      out.on = true
      out.x = x2
      out.y = TRACE_Y + 0.05
      out.z = z2
      out.hue = found ? 2 : 0
      out.scale = found ? 0.05 : 0.03
      // Dim on the way back is the point: the answer is "nothing".
      out.bright = found ? 2.6 : ph < 0.5 ? 1.5 : 0.5
      return out
    }

    /* The pair, in one frame: the transfer engine moves data on its own while
       the processor is busy elsewhere, and raises an interrupt the moment it is
       done. Both mechanisms already existed in this file; they had simply never
       been combined, so the beat that exists to combine them showed neither. */
    if (focus === 'together') {
      const CYCLE = 5.5
      const cycle = t % CYCLE
      const doneAt = CYCLE - 1.0

      if (i >= 16) {
        // "Tell me when you are done" — one short burst up the interrupt line,
        // and only after the transfer has actually finished.
        const live = cycle >= doneAt && cycle < doneAt + 0.55
        if (!live || i >= 22) {
          out.on = false
          return out
        }
        const u = Math.min(1, (cycle - doneAt) / 0.55)
        const [ix, iz] = sampleLane(BUSES.irq[0], u)
        out.on = true
        out.x = ix
        out.y = TRACE_Y + 0.05
        out.z = iz
        out.hue = 2
        out.scale = 0.055
        out.bright = 3
        return out
      }

      // The transfer itself, which stops once it is complete.
      if (cycle >= doneAt) {
        out.on = false
        return out
      }
      const dmaLanes = BUSES.dma
      const per = Math.max(1, Math.floor(16 / dmaLanes.length))
      const li = Math.floor(i / per)
      const lane_ = dmaLanes[li]
      if (!lane_) {
        out.on = false
        return out
      }
      const ph = (t * 0.6 + (i % per) / per) % 1
      const [x2, z2] = sampleLane(lane_, ph)
      out.on = true
      out.x = x2
      out.y = TRACE_Y + 0.05
      out.z = z2
      out.hue = 1
      out.scale = 0.04
      out.bright = 1.9
      return out
    }

    if (focus === 'interrupt' || focus === 'cost') {
      /* `cost` is the same mechanism with the rate turned up as the reader
         watches. The copy is about interrupts arriving tens of thousands of
         times a second until saving and restoring state dominates — so the
         period shrinks while the service time does not, and the crossover into
         "frozen more than running" is the argument for going back to polling.
         It used to be byte-identical to the beat before it. */
      const SERVICE = 1.5
      const period =
        focus === 'cost' ? Math.max(1.9, 7 - d.beatTime * 0.42) : 7
      const cycle = t % period
      const fires = Math.max(0.6, period - 3.6)
      const serviced = fires + SERVICE
      const stalled = cycle >= fires && cycle < serviced

      if (i >= 12) {
        // The interrupt line itself: a short, urgent burst, and nothing between.
        const live = cycle >= fires - 0.5 && cycle < fires + 0.25
        if (!live || i >= 20) {
          out.on = false
          return out
        }
        const u = Math.min(1, (cycle - (fires - 0.5)) / 0.75)
        const [ix, iz] = sampleLane(BUSES.irq[0], u)
        out.on = true
        out.x = ix
        out.y = TRACE_Y + 0.05
        out.z = iz
        out.hue = 2
        out.scale = 0.055
        out.bright = 3
        return out
      }

      // The interrupted program's memory traffic, held where it stands while
      // the handler runs. (Only this program stops: on a real machine DMA,
      // other cores and other devices carry on.)
      const held = stalled ? fires : t
      const lanes_ = BUSES.ddr
      const per = Math.max(1, Math.floor(12 / lanes_.length))
      const li = Math.floor(i / per)
      const lane_ = lanes_[li]
      if (!lane_) {
        out.on = false
        return out
      }
      const ph = (held * 0.85 + (i % per) / per + li * 0.11) % 1
      const [x2, z2] = sampleLane(lane_, li % 2 === 1 ? 1 - ph : ph)
      out.on = true
      out.x = x2
      out.y = TRACE_Y + 0.05
      out.z = z2
      out.hue = 0
      out.scale = 0.038
      out.bright = stalled ? 0.7 : 1.85
      return out
    }

    const active = BUS_IDS.includes(focus) ? focus : 'ddr'
    const idle = !BUS_IDS.includes(focus)
    const lanes = BUSES[active]
    const motion = BUS_MOTION[active]
    /* Capped, not just divided. Dividing the packet budget by lane count means
       a three-lane bus gets thirty packets per lane and renders as one solid
       glowing chevron rather than as data moving along a wire. Eight per lane
       reads as a stream at every lane count this board uses. */
    const perLane = Math.min(8, Math.max(1, Math.floor(FLOW_COUNT / lanes.length)))

    const laneIndex = Math.floor(i / perLane)
    const lane = lanes[laneIndex]
    if (!lane || laneIndex >= lanes.length || (idle && i % 4 !== 0)) {
      out.on = false
      return out
    }

    const slot = i % perLane

    /* Lane stagger is a property of the bus, not decoration.
       A half-duplex bus moves as a *rank*: every lane carries part of the same
       word and they must arrive together, which is the entire reason the traces
       are length-matched and the reason this beat's callout reads "same length,
       on purpose". The old `laneIndex * 0.11` spread nine lanes across most of
       a period and sent alternate lanes the opposite way — so the one thing the
       reader was told to look for was the one thing the motion denied. */
    const rank = motion.duplex === 'half'
    const phase = (t * motion.speed + slot / perLane + (rank ? 0 : laneIndex * 0.11)) % 1

    let back = false
    if (rank) {
      const turn = busTurn(t)
      // Nothing moves at all while the bus changes direction. That dead time is
      // real, and it is why mixing reads and writes costs more than either.
      if (turn.turning) {
        out.on = false
        return out
      }
      back = turn.back
    } else if (motion.duplex === 'full') {
      // Both directions at once, on separate pairs — out on one, back on the
      // other, inside every lane.
      back = laneIndex % 2 === 1
    }

    const [x, z] = sampleLane(lane, back ? 1 - phase : phase)

    out.on = true
    out.x = x
    out.y = TRACE_Y + 0.05
    out.z = z
    out.hue = motion.hue
    // Small on purpose. At 0.055 the memory bus rendered as one bright blob
    // rather than as parallel lanes, and bloom finished the job.
    out.scale = idle ? 0.03 : 0.038
    out.bright = idle ? 1.1 : 1.85
    return out
  }, [])

  return <Flow count={FLOW_COUNT} at={at} hues={HUES} probe="board" />
}
