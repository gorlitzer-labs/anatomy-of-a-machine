import { useCallback, useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { useNamer } from '../naming'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { lectures } from '../../content/lectures'
import { stepsFor, useDeck } from '../../deck/deck'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { gateShape, xorArcShape, bevelledGate } from '../shapes'
import { Flow, type Packet } from '../motion/Flow'
import { sampleLane, type Lane } from '../motion/lanes'
import { benchMap, plateTop, roundedBox, tiled, topFaced, transistorTop } from '../surfaces'
import {
  CELL_KINDS,
  CELL_LAYOUTS,
  CELL_PACKETS,
  type CellKind,
  type CellRole,
  dramCell,
} from './cellLayouts'

/**
 * One bit, held four ways.
 *
 * Unlike the architectures chapter, this scene *cuts* between layouts instead
 * of morphing. That chapter's claim was "the same silicon, retiled", so a morph
 * was the argument. This chapter's claim is the opposite — these are genuinely
 * different circuits with different part counts — and morphing a NOR gate into
 * a capacitor would quietly say they are variations on one thing.
 */
export function CellScene() {
  const kind = useCellKind()
  const bench = useMemo(() => tiled(benchMap(), 6.6 / 0.5, 4.6 / 0.5), [])

  return (
    <Part id="cell" tags={[...CELL_KINDS]} position={[0, 0, 0]}>
      {/* Bench, matching the logic-gate chapter so the notation reads as
          continuous with it: the same black anodised board and grid pitch.
          Its top is at y = 0, where every schematic's parts stand — it sat
          8 cm lower, so the whole circuit hovered over its own board. */}
      <mesh position={[0, -0.06, 0]} receiveShadow castShadow geometry={roundedBox(6.6, 0.12, 4.6, 0.05)}>
        <meshStandardMaterial color="#ffffff" map={bench} roughness={0.62} metalness={0.35} />
      </mesh>

      {/* Keyed by layout so a change remounts and replays the settle. */}
      <Settle key={kind}>
        <Gates kind={kind} />
        <Boxes kind={kind} />
        <Wires kind={kind} />
        <Packets kind={kind} />
      </Settle>
    </Part>
  )
}

/** Which layout the beat on screen is asking for. */
function useCellKind(): CellKind {
  const lecture = useDeck((s) => s.lecture)
  const shown = useDeck((s) => s.shown)
  const step = stepsFor(lecture)[shown]
  const beat = step ? lectures[lecture]?.chapters[step.chapter]?.beats[step.beat] : null
  const focus = beat?.focus ?? ''
  return CELL_KINDS.includes(focus as CellKind) ? (focus as CellKind) : 'latch'
}

/**
 * A short scale-in on mount.
 *
 * The swap happens mid-camera-move, so without this the new schematic pops into
 * a frame that is still travelling and reads as a glitch rather than a change.
 */
function Settle({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!)
  const t = useRef(0)

  useSceneFrame((_, dt) => {
    t.current = Math.min(1, t.current + dt * 4)
    const e = 1 - Math.pow(1 - t.current, 3)
    group.current.scale.setScalar(0.88 + e * 0.12)
  })

  return <group ref={group}>{children}</group>
}

/* ------------------------------------------------------------------ */

const ROLE_COLOR: Record<CellRole, { base: string; glow: string }> = {
  transistor: { base: '#17222e', glow: '#4fd8ff' },
  access: { base: '#2a1d10', glow: '#ffab40' },
  capacitor: { base: '#241a3a', glow: '#a06bff' },
  bitline: { base: '#0c3040', glow: '#4fd8ff' },
  store: { base: '#17222e', glow: '#4fd8ff' },
}

function Gates({ kind }: { kind: CellKind }) {
  const gates = CELL_LAYOUTS[kind].gates
  const group = useRef<THREE.Group>(null!)
  const named = useNamer('cell')

  const geometries = useMemo(
    () =>
      gates.map((g) => ({
        body: bevelledGate(gateShape(g.kind)),
        arc: g.kind === 'xor' ? bevelledGate(xorArcShape(), 0.012) : null,
      })),
    [gates],
  )

  useSceneFrame(() => {
    /* Steady, deliberately.
       This used to pulse, which contradicted the beat's own copy: a latch at
       rest is *holding*, and holding looks like stillness. The only thing that
       should move here is the charge going round the loop — that circulation is
       what says the circuit is alive, and a breathing gate was competing with
       it while arguing nothing. */
    for (const child of group.current.children) {
      const mesh = child.children[0] as THREE.Mesh | undefined
      const mat = mesh?.material as THREE.MeshStandardMaterial | undefined
      if (mat) setEmissive(mat, 0.22)
    }
  })

  return (
    <group ref={group}>
      {gates.map((g, i) => (
        <group key={i} position={[g.x, 0, g.z]} rotation={[0, g.flip ? Math.PI : 0, 0]} scale={g.scale ?? 1}>
          <mesh
            geometry={geometries[i].body}
            rotation={[-Math.PI / 2, 0, 0]}
            castShadow
            {...named(g.inverted ? `cell:n${g.kind}` : `cell:${g.kind}`)}
          >
            {/* The logic-gate chapter's smoked glass-ceramic, so a NOR here
                is visibly the same object as the NOR there. */}
            <meshPhysicalMaterial
              color="#111826"
              emissive="#7fd4ff"
              emissiveIntensity={0.14}
              roughness={0.26}
              metalness={0.35}
              clearcoat={0.7}
              clearcoatRoughness={0.1}
            />
          </mesh>
          {geometries[i].arc && (
            <mesh geometry={geometries[i].arc!} rotation={[-Math.PI / 2, 0, 0]}>
              <meshPhysicalMaterial color="#111826" roughness={0.26} metalness={0.35} clearcoat={0.7} clearcoatRoughness={0.1} />
            </mesh>
          )}
          {/* Only where the layout says the gate inverts. Drawn on everything,
              it turned the flip-flop's AND and OR gates into NAND and NOR. */}
          {gates[i].inverted && (
            <mesh position={[gates[i].flip ? -1.1 : 1.1, 0.08, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.17, 40]} />
              <meshPhysicalMaterial color="#111826" roughness={0.26} metalness={0.35} clearcoat={0.7} clearcoatRoughness={0.1} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

/* In the density beat the same geometry means something else. A box there is a
   whole cell at its real relative pitch, not the capacitor inside one, and
   naming it "capacitor" would undercut the only claim the beat makes: that
   these two grids hold wildly different numbers of bits in the same area. */
const ARRAY_ROLE: Partial<Record<CellRole, string>> = {
  capacitor: 'dramcell',
  store: 'sramcell',
}

function Boxes({ kind }: { kind: CellKind }) {
  const boxes = CELL_LAYOUTS[kind].boxes
  const group = useRef<THREE.Group>(null!)
  const named = useNamer('cell')

  useSceneFrame((state) => {
    const t = state.clock.elapsedTime
    const d = updateDriver(t)
    group.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (!mat) return
      const role = boxes[i]?.role
      /* One phase for the whole cell. The capacitor's sawtooth and the access
         transistor's window are the same event — refresh is "open the word
         line, read, write back" — so they are derived from one call rather
         than from two free-running sines that drift against each other. */
      const cell = dramCell(t, d.variant === 'b', kind === 'array' ? i * 0.013 : 0)
      if (role === 'capacitor') {
        /* The leak. A DRAM cell's charge drains away and has to be topped up,
           so the capacitor dims steadily and then snaps back — that sawtooth is
           refresh, and it is the whole reason the beat exists. */
        setEmissive(mat, 0.15 + cell.charge * 0.95)
      } else if (role === 'access') {
        // Access transistors conduct only while the word line is asserted, and
        // the rest of the cell is only reachable during that window.
        setEmissive(mat, 0.1 + (cell.accessing ? 1 : 0) * 1.1)
      } else {
        /* Transistors are lit while the cell is being accessed and dim
           otherwise, rather than breathing on a timer. A stored bit is not an
           activity — it is a state — so the only thing that should change here
           is whether something is reading it. */
        setEmissive(mat, cell.accessing ? 0.85 : 0.16)
      }
      if (d.focus === 'array') mat.emissiveIntensity *= 0.9
    })
  })

  return (
    <group ref={group}>
      {boxes.map((b, i) => {
        const c = ROLE_COLOR[b.role]
        /* A switch shows its layout on top — diffusion, contacts and the gate
           stripe the word line drives — so the lit state lights a transistor
           rather than a cube. Not the capacitor plates, whose broad faces are
           the sides and must glow at full strength, and not the density grid,
           where each box is a whole cell far too small to read a layout on. */
        const face = kind !== 'array' && b.role !== 'capacitor'
        const r = Math.min(b.sx, b.sy, b.sz) * (kind === 'array' ? 0.18 : 0.12)
        return (
          <mesh
            key={i}
            position={[b.x, b.sy / 2, b.z]}
            castShadow
            receiveShadow
            geometry={face ? topFaced(b.sx, b.sy, b.sz, r) : roundedBox(b.sx, b.sy, b.sz, r, 2)}
            {...named(`cell:${kind === 'array' ? ARRAY_ROLE[b.role] ?? b.role : b.role}`)}
          >
            <meshPhysicalMaterial
              color={c.base}
              emissive={c.glow}
              emissiveIntensity={0.3}
              emissiveMap={face ? transistorTop() : b.role === 'capacitor' && kind !== 'array' ? plateTop() : null}
              roughness={b.role === 'capacitor' ? 0.3 : 0.38}
              metalness={b.role === 'capacitor' ? 0.7 : 0.4}
              clearcoat={0.5}
              clearcoatRoughness={0.2}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/**
 * Wires as metal traces laid on the bench, each lane one merged strip.
 *
 * They were one-pixel lines, which read as a drawing floating over the board
 * rather than as the conductor the charge travels in; at the same xz they are
 * now flat traces with rounded joints. Same routes exactly, and the same two
 * registers — the plain wiring dim, the loop that carries the bit lit.
 */
function traces(lanes: Lane[], width: number, height: number) {
  const parts: THREE.BufferGeometry[] = []
  for (const lane of lanes) {
    for (let i = 0; i < lane.length - 1; i++) {
      const [x0, z0] = lane[i]
      const [x1, z1] = lane[i + 1]
      const len = Math.hypot(x1 - x0, z1 - z0)
      if (len < 1e-6) continue
      const seg = new THREE.BoxGeometry(len, height, width)
      seg.rotateY(-Math.atan2(z1 - z0, x1 - x0))
      seg.translate((x0 + x1) / 2, height / 2, (z0 + z1) / 2)
      parts.push(seg)
    }
    // A round joint at every vertex, so corners are continuous and ends are
    // capped rather than cut square.
    for (const [x, z] of lane) {
      const joint = new THREE.CylinderGeometry(width / 2, width / 2, height, 20)
      joint.translate(x, height / 2, z)
      parts.push(joint)
    }
  }
  if (!parts.length) return null
  const merged = mergeGeometries(parts.map((p) => p.toNonIndexed()))
  for (const p of parts) p.dispose()
  return merged
}

function Wires({ kind }: { kind: CellKind }) {
  const layout = CELL_LAYOUTS[kind]

  const plain = useMemo(
    () => traces(layout.wires.filter((_, i) => !layout.live.includes(i)), 0.04, 0.016),
    [layout],
  )
  // A hair taller, so where the live loop meets a plain wire it is on top.
  const live = useMemo(
    () => traces(layout.wires.filter((_, i) => layout.live.includes(i)), 0.05, 0.02),
    [layout],
  )

  return (
    <group>
      {plain && (
        <mesh geometry={plain} receiveShadow>
          <meshStandardMaterial color="#2a3c4a" emissive="#4d6f86" emissiveIntensity={0.35} roughness={0.35} metalness={0.7} />
        </mesh>
      )}
      {/* The loop, or the line that carries the bit. Brighter, because it is
          the part of the schematic the copy is pointing at. */}
      {live && (
        <mesh geometry={live} receiveShadow>
          <meshStandardMaterial color="#0c3040" emissive="#4fd8ff" emissiveIntensity={0.85} roughness={0.3} metalness={0.5} />
        </mesh>
      )}
    </group>
  )
}

/** Charge moving along the live wires. */
const CHARGE = [new THREE.Color('#bff2ff')]

function Packets({ kind }: { kind: CellKind }) {
  const layout = CELL_LAYOUTS[kind]
  const lanes = useMemo(
    () => layout.live.map((i) => layout.wires[i]),
    [layout],
  )

  const at = useCallback(
    (i: number, t: number, out: Packet): Packet => {
      const perLane = lanes.length ? Math.floor(CELL_PACKETS / lanes.length) : 0
      const lane = lanes[Math.floor(i / Math.max(perLane, 1))]
      if (!lane || !perLane) {
        out.on = false
        return out
      }
      const slot = i % perLane
      const [x, z] = sampleLane(lane, (t * 0.22 + slot / perLane) % 1)
      out.on = true
      out.x = x
      out.y = 0.09
      out.z = z
      out.hue = 0
      out.scale = 0.055
      return out
    },
    [lanes],
  )

  return <Flow count={CELL_PACKETS} at={at} hues={CHARGE} brightness={1} />
}
