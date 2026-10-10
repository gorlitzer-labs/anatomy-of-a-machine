import { useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { gateShape, xorArcShape, bevelledGate } from '../shapes'
import { benchMap, cellFace, roundedBox, tiled } from '../surfaces'
import { inputsFor, outputsFor, tickAt, STEP_PERIOD } from '../signal'
import { SignalClock } from './GateScene'

/*
 * A half adder: one XOR and one AND sharing the same two inputs.
 *
 * The XOR output is the sum bit, the AND output is the carry. That is the
 * entire trick behind binary addition, and it is why XOR earns its own beat in
 * the previous chapter.
 *
 * Routing note: the B bus and its stubs run at a higher Y than the A bus so the
 * two can cross without intersecting, with via posts dropping down where B
 * meets a gate. Real boards and dies solve this exactly the same way, with
 * layers, so the visual is doing double duty.
 */
const A_Y = 0.08
const B_Y = 0.3
const A_BUS_X = -3.4
const B_BUS_X = -2.6
const XOR_Z = -1.5
const AND_Z = 1.5
const GATE_X = 0.6
const LANE = 0.38
/* Where the XOR's inputs land: in the gap between its back arc and its body.
   At -0.24 the B via stood half inside the arc and the A trace stopped short
   of the body, so both inputs now run through the arc to the body. */
const XOR_IN_X = -0.14

export function AdderScene() {
  return (
    <group>
      <SignalClock />
      <HalfAdder />
      <RippleChain />
    </group>
  )
}

function HalfAdder() {
  const aParts = useRef<THREE.Group>(null!)
  const bParts = useRef<THREE.Group>(null!)
  const sumParts = useRef<THREE.Group>(null!)
  const carryParts = useRef<THREE.Group>(null!)
  const xorBody = useRef<THREE.Mesh>(null!)
  const andBody = useRef<THREE.Mesh>(null!)

  const xorGeo = useMemo(() => bevelledGate(gateShape('xor')), [])
  const arcGeo = useMemo(() => bevelledGate(xorArcShape(), 0.012), [])
  const andGeo = useMemo(() => bevelledGate(gateShape('and')), [])
  const bench = useMemo(() => tiled(benchMap(), 11.5 / 0.5, 6.4 / 0.5), [])

  useSceneFrame((state) => {
    const tick = tickAt(updateDriver(state.clock.elapsedTime).beatTime)
    const { a, b } = inputsFor('halfadder', tick)
    const { sum = 0, carry = 0 } = outputsFor('halfadder', tick)

    light(aParts.current, a)
    light(bParts.current, b)
    light(sumParts.current, sum)
    light(carryParts.current, carry)
    setEmissive(xorBody.current.material as THREE.MeshStandardMaterial, 0.08 + sum * 0.5)
    setEmissive(andBody.current.material as THREE.MeshStandardMaterial, 0.08 + carry * 0.5)
  })

  return (
    <Part id="halfadder" tags={['sum', 'carry']} position={[0, 0, 0]}>
      <mesh position={[0, -0.07, 0]} receiveShadow castShadow geometry={roundedBox(11.5, 0.1, 6.4, 0.045)}>
        <meshStandardMaterial color="#ffffff" map={bench} roughness={0.62} metalness={0.35} />
      </mesh>

      {/* A: enters low-left, runs up the board on the lower layer. */}
      <group ref={aParts}>
        <Trace x={[-5.4, A_BUS_X]} z={-2.6} y={A_Y} />
        <Trace z={[-2.6, AND_Z - LANE]} x={A_BUS_X} y={A_Y} />
        <Trace x={[A_BUS_X, XOR_IN_X + 0.08]} z={XOR_Z - LANE} y={A_Y} />
        <Trace x={[A_BUS_X, -0.24]} z={AND_Z - LANE} y={A_Y} />
        <Pad x={-5.4} z={-2.6} y={A_Y} />
      </group>

      {/* B: enters high-left on the upper layer, drops through vias at the gates. */}
      <group ref={bParts}>
        <Trace x={[-5.4, B_BUS_X]} z={2.6} y={B_Y} />
        <Trace z={[2.6, XOR_Z + LANE]} x={B_BUS_X} y={B_Y} />
        <Trace x={[B_BUS_X, XOR_IN_X]} z={XOR_Z + LANE} y={B_Y} />
        <Trace x={[B_BUS_X, -0.24]} z={AND_Z + LANE} y={B_Y} />
        <Via x={XOR_IN_X} z={XOR_Z + LANE} />
        <Via x={-0.24} z={AND_Z + LANE} />
        <Pad x={-5.4} z={2.6} y={B_Y} />
      </group>

      {/* XOR -> sum bit */}
      <mesh
        ref={xorBody}
        geometry={xorGeo}
        position={[GATE_X, 0, XOR_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
      >
        <meshPhysicalMaterial color="#111826" emissive="#7fd4ff" emissiveIntensity={0.08} roughness={0.26} metalness={0.35} clearcoat={0.7} clearcoatRoughness={0.1} />
      </mesh>
      <mesh geometry={arcGeo} position={[GATE_X, 0, XOR_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial color="#111826" roughness={0.26} metalness={0.35} clearcoat={0.7} clearcoatRoughness={0.1} />
      </mesh>

      {/* AND -> carry bit */}
      <mesh
        ref={andBody}
        geometry={andGeo}
        position={[GATE_X, 0, AND_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
      >
        <meshPhysicalMaterial color="#2a2018" emissive="#ffb066" emissiveIntensity={0.08} roughness={0.26} metalness={0.35} clearcoat={0.7} clearcoatRoughness={0.1} />
      </mesh>

      <group ref={sumParts}>
        <Trace x={[GATE_X + 0.95, 5.2]} z={XOR_Z} y={A_Y} />
        <Pad x={5.2} z={XOR_Z} y={A_Y} />
      </group>
      <group ref={carryParts}>
        <Trace x={[GATE_X + 0.72, 5.2]} z={AND_Z} y={A_Y} tone="amber" />
        <Pad x={5.2} z={AND_Z} y={A_Y} tone="amber" />
      </group>
    </Part>
  )
}

/**
 * Eight adders chained, with the carry rippling along.
 *
 * The point of the shot is that the carry cannot be known until the stage
 * before it has finished, so the result arrives one bit at a time rather than
 * all at once — the reason adder width costs time.
 *
 * The carry runs RIGHT TO LEFT: the lowest bit sits on the right, as it does
 * in a written binary number, and carrying moves toward the higher bits just
 * as it does in long addition on paper. It used to sweep left to right, which
 * is the lowest-bit-on-the-left picture — true of nothing the reader has ever
 * written down.
 */
function RippleChain() {
  const blocks = useRef<THREE.Group>(null!)
  const pulse = useRef<THREE.Mesh>(null!)
  const COUNT = 8
  const SPAN = 1.9
  const bench = useMemo(() => tiled(benchMap(), (SPAN * COUNT + 1.6) / 0.5, 3.2 / 0.5), [])

  useSceneFrame((state) => {
    // One sweep per truth-table step, so it stays in step with everything else.
    const p = (state.clock.elapsedTime % (STEP_PERIOD * 2)) / (STEP_PERIOD * 2)
    const front = p * (COUNT + 1) - 0.5

    blocks.current.children.forEach((child, i) => {
      // Stage 0 (the lowest bit) is the rightmost block.
      const lit = THREE.MathUtils.clamp(front - (COUNT - 1 - i), 0, 1)
      const group = child as THREE.Group
      for (const m of group.children) {
        const mat = (m as THREE.Mesh).material as THREE.MeshStandardMaterial
        if (mat) setEmissive(mat, 0.06 + lit * 2.2)
      }
    })

    pulse.current.position.x = ((COUNT - 1) / 2 - front) * SPAN
    const visible = front > -0.4 && front < COUNT + 0.4
    pulse.current.visible = visible
  })

  return (
    <Part id="ripple" position={[0, 0, 9]}>
      <mesh position={[0, -0.07, 0]} receiveShadow castShadow geometry={roundedBox(SPAN * COUNT + 1.6, 0.1, 3.2, 0.045)}>
        <meshStandardMaterial color="#ffffff" map={bench} roughness={0.62} metalness={0.35} />
      </mesh>

      {/* The carry line every stage hands along. */}
      <mesh position={[0, 0.08, 0.85]} geometry={roundedBox(SPAN * COUNT, 0.05, 0.08, 0.02, 2)}>
        <meshStandardMaterial color="#3a2a14" emissive="#ffab40" emissiveIntensity={0.25} />
      </mesh>

      <group ref={blocks}>
        {Array.from({ length: COUNT }, (_, i) => (
          <group key={i} position={[(i - (COUNT - 1) / 2) * SPAN, 0, 0]}>
            {/* One full adder: a machined block whose face lights as the carry
                reaches it. */}
            <mesh position={[0, 0.16, -0.2]} castShadow receiveShadow geometry={roundedBox(1.3, 0.3, 1.3, 0.06)}>
              <meshPhysicalMaterial color="#1a2a44" emissive="#4fd8ff" emissiveMap={cellFace()} emissiveIntensity={0.06} roughness={0.32} metalness={0.5} clearcoat={0.8} clearcoatRoughness={0.2} />
            </mesh>
            {/* Sum bit for this column, above its adder. */}
            <mesh position={[0, 0.42, -1.15]} geometry={roundedBox(0.5, 0.08, 0.5, 0.03)}>
              <meshStandardMaterial color="#0c3040" emissive="#4fd8ff" emissiveIntensity={0.06} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      <mesh ref={pulse} position={[0, 0.16, 0.85]}>
        <sphereGeometry args={[0.17, 32, 24]} />
        <meshStandardMaterial color="#ffe0b0" emissive="#ffab40" emissiveIntensity={4} />
      </mesh>
    </Part>
  )
}

/** Axis-aligned trace. Pass a range for the axis it runs along. */
function Trace({
  x,
  z,
  y,
  tone = 'cyan',
}: {
  x: number | [number, number]
  z: number | [number, number]
  y: number
  tone?: 'cyan' | 'amber'
}) {
  const along = Array.isArray(x)
    ? { len: x[1] - x[0], pos: [x[0] + (x[1] - x[0]) / 2, y, z as number], args: [Math.abs(x[1] - x[0]), 0.06, 0.1] }
    : { len: (z as [number, number])[1] - (z as [number, number])[0], pos: [x as number, y, (z as [number, number])[0] + ((z as [number, number])[1] - (z as [number, number])[0]) / 2], args: [0.1, 0.06, Math.abs((z as [number, number])[1] - (z as [number, number])[0])] }

  return (
    <mesh
      position={along.pos as [number, number, number]}
      geometry={roundedBox(...(along.args as [number, number, number]), 0.025, 2)}
    >
      <meshStandardMaterial
        color={tone === 'amber' ? '#3a2a14' : '#0c3040'}
        emissive={tone === 'amber' ? '#ffab40' : '#4fd8ff'}
        emissiveIntensity={0.05}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  )
}

function Pad({ x, z, y, tone = 'cyan' }: { x: number; z: number; y: number; tone?: 'cyan' | 'amber' }) {
  return (
    <mesh position={[x, y, z]}>
      <cylinderGeometry args={[0.17, 0.17, 0.1, 40]} />
      <meshStandardMaterial
        color={tone === 'amber' ? '#3a2a14' : '#0c3040'}
        emissive={tone === 'amber' ? '#ffab40' : '#4fd8ff'}
        emissiveIntensity={0.05}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  )
}

/** Post carrying the upper routing layer down to a gate input. */
function Via({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, (A_Y + B_Y) / 2, z]}>
      <cylinderGeometry args={[0.07, 0.07, B_Y - A_Y, 24]} />
      <meshStandardMaterial color="#0c3040" emissive="#4fd8ff" emissiveIntensity={0.05} roughness={0.3} metalness={0.6} />
    </mesh>
  )
}

function light(group: THREE.Group, value: number) {
  if (!group) return
  const level = 0.05 + value * 2.8
  group.traverse((o) => {
    const mat = (o as THREE.Mesh).material as THREE.MeshStandardMaterial
    if (mat?.emissive) setEmissive(mat, level)
  })
}
