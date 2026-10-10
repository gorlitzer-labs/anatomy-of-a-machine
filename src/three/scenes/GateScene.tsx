import { useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { gateShape, xorArcShape, bevelledGate } from '../shapes'
import { benchMap, roundedBox, tiled } from '../surfaces'
import { GATE_OPS, tickAt, inputsFor, useSignalStore, type GateKind } from '../signal'

/** Where each gate sits along the bench, and how far right its output leaves. */
/* `back` is where the input wires meet the body, at the input lanes (z ±0.38),
   read off the outlines in shapes.ts. OR's back is concave, so a fixed -0.76
   stopped its wires 0.12 short of it; XOR's wires ran on through its extra arc
   into the gap behind the body, where the symbol has them end on the arc. */
const LAYOUT: Array<{ kind: GateKind; x: number; nose: number; back: number }> = [
  { kind: 'not', x: -5.2, nose: 0.9, back: -0.76 },
  { kind: 'and', x: -1.75, nose: 0.72, back: -0.76 },
  { kind: 'or', x: 1.75, nose: 0.95, back: -0.62 },
  { kind: 'xor', x: 5.2, nose: 0.95, back: -0.94 },
]

/* Each bench fits inside the 3.45 spacing between gates. At 5.8 wide with
   wires out to ±2.5 the benches lay over each other: tiles z-fought, the OR's
   output pad sat inside the XOR's back arc, and the NOT's output ran in
   between the AND's input pads as if it were feeding them. */
const IN_X = -1.48
const OUT_X = 1.48
const TILE_W = 3.3
const RAIL_Y = 0.08
const LANE_Z = 0.38

export function GateScene() {
  return (
    <group>
      <SignalClock />
      {LAYOUT.map((g) => (
        <Gate key={g.kind} {...g} />
      ))}
    </group>
  )
}

/**
 * Publishes the truth-table tick to the DOM.
 *
 * Lives once at the scene root rather than in each gate, so the four gates and
 * the table in the copy panel are all reading one clock.
 */
export function SignalClock() {
  useSceneFrame((state) => {
    /* Counted from beat entry, not from page load.
       "Look at the bottom row: 1 and 1 gives 0" is an instruction about one row
       of four on a 1.9 s cycle, so a reader arriving at the wrong moment waited
       up to 5.7 s with nothing telling them where in the cycle they were. */
    const d = updateDriver(state.clock.elapsedTime)
    useSignalStore.getState().setTick(tickAt(d.beatTime))
  })
  return null
}

function Gate({ kind, x, nose, back }: { kind: GateKind; x: number; nose: number; back: number }) {
  const body = useRef<THREE.Mesh>(null!)
  const wireA = useRef<THREE.Group>(null!)
  const wireB = useRef<THREE.Group>(null!)
  const wireOut = useRef<THREE.Group>(null!)

  const twoInput = kind !== 'not'
  const geometry = useMemo(
    () => bevelledGate(gateShape(kind)),
    [kind],
  )
  const arcGeometry = useMemo(
    () => (kind === 'xor' ? bevelledGate(xorArcShape(), 0.012) : null),
    [kind],
  )

  const bench = useMemo(() => tiled(benchMap(), TILE_W / 0.5, 2.4 / 0.5), [])

  useSceneFrame((state) => {
    const tick = tickAt(updateDriver(state.clock.elapsedTime).beatTime)
    const { a, b } = inputsFor(kind, tick)
    const out = kind === 'not' ? GATE_OPS.not(a, 0) : GATE_OPS[kind](a, b)

    lightRail(wireA.current, a)
    if (twoInput) lightRail(wireB.current, b)
    lightRail(wireOut.current, out)

    // The body itself warms slightly when it is passing a 1, so the gate reads
    // as the thing doing the work rather than an inert shape between wires.
    setEmissive(body.current.material as THREE.MeshStandardMaterial, 0.08 + out * 0.5)
  })

  return (
    <Part id={kind} position={[x, 0, 0]}>
      {/* Tile beneath, so each gate reads as its own bench. */}
      {/* Black anodised, with a fine registration grid. */}
      <mesh position={[0, -0.07, 0]} receiveShadow castShadow geometry={roundedBox(TILE_W, 0.1, 2.4, 0.04)}>
        <meshStandardMaterial color="#ffffff" map={bench} roughness={0.62} metalness={0.35} />
      </mesh>

      <mesh
        ref={body}
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
      >
        {/* Smoked glass-ceramic: dark, with a clear lacquer that the strip
            lights run along, and a glow from inside when it passes a 1. */}
        <meshPhysicalMaterial
          color="#111826"
          emissive="#7fd4ff"
          emissiveIntensity={0.08}
          roughness={0.26}
          metalness={0.35}
          clearcoat={0.7}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {arcGeometry && (
        <mesh geometry={arcGeometry} rotation={[-Math.PI / 2, 0, 0]}>
          <meshPhysicalMaterial color="#111826" roughness={0.26} metalness={0.35} clearcoat={0.7} clearcoatRoughness={0.1} />
        </mesh>
      )}

      {kind === 'not' && (
        // The inverting bubble: the mark that means "and then flip it".
        <mesh position={[0.76, 0.08, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.17, 40]} />
          <meshPhysicalMaterial color="#111826" roughness={0.26} metalness={0.35} clearcoat={0.7} clearcoatRoughness={0.1} />
        </mesh>
      )}

      <Rail ref={wireA} from={IN_X} to={back} z={twoInput ? -LANE_Z : 0} pad="start" />
      {twoInput && <Rail ref={wireB} from={IN_X} to={back} z={LANE_Z} pad="start" />}
      <Rail ref={wireOut} from={nose} to={OUT_X} z={0} pad="end" />
    </Part>
  )
}

/** A conducting trace plus its terminal pad, lit together. */
function Rail({
  ref,
  from,
  to,
  z,
  pad,
}: {
  ref: React.Ref<THREE.Group>
  from: number
  to: number
  z: number
  pad: 'start' | 'end'
}) {
  const length = to - from
  const mid = from + length / 2
  const padX = pad === 'start' ? from : to

  return (
    <group ref={ref}>
      <mesh position={[mid, RAIL_Y, z]} geometry={roundedBox(Math.abs(length), 0.06, 0.1, 0.025, 2)}>
        <meshStandardMaterial
          color="#0c3040"
          emissive="#4fd8ff"
          emissiveIntensity={0.05}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      <mesh position={[padX, RAIL_Y, z]}>
        <cylinderGeometry args={[0.16, 0.16, 0.1, 40]} />
        <meshStandardMaterial
          color="#0c3040"
          emissive="#4fd8ff"
          emissiveIntensity={0.05}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </group>
  )
}

/** Drives every emissive material under a rail group to the same signal level. */
function lightRail(group: THREE.Group, value: number) {
  if (!group) return
  const level = 0.05 + value * 2.8
  for (const child of group.children) {
    const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
    if (mat) setEmissive(mat, level)
  }
}
