import { useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { publishReadout } from '../readout'
import { damp } from '../../lib/math'
import { dopantMap, lappedRoughness, latticeMap, roundedBox, tiled } from '../surfaces'

/**
 * An n-channel MOSFET, drawn roughly 100 million times life size.
 *
 * Proportions are stylised for legibility — a real gate oxide is ~1nm against a
 * ~20nm gate length, which at this scale would be invisible. The topology
 * (bulk / source / drain / oxide / gate, with the channel forming under the
 * oxide) is faithful.
 */
export function MosfetScene() {
  return (
    <group position={[0, -0.2, 0]}>
      <Bulk />
      <Channel />
      <Terminal id="source" x={-1.15} />
      <Terminal id="drain" x={1.15} />
      <GateOxide />
      <Gate />
      <Contacts />
      <Inverter />
    </group>
  )
}

const PERIOD = 1.8
/** Fraction of the cycle spent switching. Small = crisp edges, but not a strobe. */
const EDGE = 0.06

/**
 * How strongly the transistor is conducting right now, 0..1.
 *
 * A roughly 50% duty cycle: off, snap on, hold, snap off, hold. The point of
 * the shot is that the channel *appears and disappears*, so both states need
 * equal screen time — an earlier version held the channel on for ~90% of the
 * cycle and just flickered off, which read as a glitch rather than a switch.
 */
function conduction(elapsed: number, focused: boolean) {
  if (!focused) return 0
  const phase = (elapsed % PERIOD) / PERIOD
  const rise = THREE.MathUtils.clamp((phase - 0.3) / EDGE + 1, 0, 1)
  const fall = THREE.MathUtils.clamp((0.7 - phase) / EDGE + 1, 0, 1)
  return Math.min(rise, fall)
}

function Bulk() {
  /* One lattice pitch on every face, so the crystal reads as the same crystal
     from the top and in the cut face at the front. The texture holds 16 atoms
     a side, and 3.2 units per repeat puts them 0.2 apart: coarse enough to
     read as atoms at the anatomy distance, where a finer pitch shimmered. */
  const faces = useMemo(() => {
    const l = latticeMap()
    const k = 1 / 3.2
    return { top: tiled(l, 4.6 * k, 3 * k), front: tiled(l, 4.6 * k, 0.7 * k), side: tiled(l, 3 * k, 0.7 * k) }
  }, [])
  const props = { color: '#1c2438', emissive: '#7c9ee6', emissiveIntensity: 0.6, roughness: 0.32, metalness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.3 }
  return (
    <Part id="bulk" position={[0, -0.35, 0]} offset={[0, 0, 0]}>
      {/* The crystal itself: a square lattice of silicon atoms, faintly lit so
          it reads on the shadow side too. At this magnification the bulk is a
          crystal, and a flat slab said "plastic". */}
      <mesh castShadow receiveShadow geometry={roundedBox(4.6, 0.7, 3.0, 0.06)}>
        <meshPhysicalMaterial attach="material-0" {...props} emissiveMap={faces.side} />
        <meshPhysicalMaterial attach="material-1" {...props} emissiveMap={faces.side} />
        <meshPhysicalMaterial attach="material-2" {...props} emissiveMap={faces.top} />
        <meshPhysicalMaterial attach="material-3" {...props} emissiveMap={faces.top} />
        <meshPhysicalMaterial attach="material-4" {...props} emissiveMap={faces.front} />
        <meshPhysicalMaterial attach="material-5" {...props} emissiveMap={faces.front} />
      </mesh>
    </Part>
  )
}

function Terminal({ id, x }: { id: 'source' | 'drain'; x: number }) {
  return (
    <Part
      id={id}
      tags={['gate']}
      position={[x, 0.1, 0]}
      offset={[Math.sign(x) * TERMINAL_SPREAD, 0.55, 0]}
    >
      {/* Heavily doped silicon: the same crystal, crowded with donor atoms,
          which is what makes it conduct. The speckle is the doping. */}
      <mesh castShadow receiveShadow geometry={roundedBox(1.15, 0.42, 1.85, 0.05)}>
        <meshPhysicalMaterial
          color="#1a5570"
          emissive="#3fd2ff"
          emissiveMap={dopantMap()}
          emissiveIntensity={0.42}
          roughness={0.28}
          metalness={0.4}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
        />
      </mesh>
    </Part>
  )
}

/** The inversion layer. Only exists while the gate is energised. */
function Channel() {
  const mesh = useRef<THREE.Mesh>(null!)
  const electrons = useRef<THREE.InstancedMesh>(null!)
  const dummy = useRef(new THREE.Object3D()).current

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const t = state.clock.elapsedTime
    const on = conduction(t, d.focus === 'channel')

    const mat = mesh.current.material as THREE.MeshStandardMaterial
    setEmissive(mat, 0.05 + on * 4.6)
    mesh.current.scale.y = 0.35 + on * 0.65

    // Electrons drift source -> drain only while the channel exists.
    for (let i = 0; i < 48; i++) {
      const lane = (i % 6) / 5 - 0.5
      const travel = ((t * 0.9 + i * 0.083) % 1) * 2.3 - 1.15
      dummy.position.set(travel, 0.02, lane * 1.5)
      // Drawn a little longer along the direction of drift, which is what an
      // eye does with a small bright thing in motion — and makes the
      // direction legible in a still frame.
      dummy.scale.set(on * 0.15, on * 0.085, on * 0.085)
      dummy.updateMatrix()
      electrons.current.setMatrixAt(i, dummy.matrix)
    }
    electrons.current.instanceMatrix.needsUpdate = true
  })

  return (
    <Part id="channel" position={[0, 0.02, 0]} offset={[0, 0.22, 0]}>
      <mesh ref={mesh} geometry={roundedBox(1.5, 0.07, 1.85, 0.03)}>
        <meshStandardMaterial
          color="#0a3b4d"
          emissive="#4ff0ff"
          emissiveIntensity={0.05}
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>
      <instancedMesh ref={electrons} args={[undefined, undefined, 48]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#bff6ff" emissive="#7fe9ff" emissiveIntensity={3} />
      </instancedMesh>
    </Part>
  )
}

/* The gate stack is as wide as the gap between source and drain, 1.15. At 1.7
   it cut into the tops of both terminals when assembled. */
const GATE_W = 1.1

function GateOxide() {
  return (
    <Part id="oxide" tags={['gate']} position={[0, 0.16, 0]} offset={[0, 1.35, 0]}>
      {/* Silicon dioxide is glass, and a thin film of it shows colour. */}
      <mesh geometry={roundedBox(GATE_W, 0.09, 1.95, 0.025)}>
        <meshPhysicalMaterial
          color="#d8ecff"
          transmission={0.9}
          thickness={0.4}
          roughness={0.06}
          ior={1.45}
          iridescence={0.6}
          iridescenceIOR={1.45}
          iridescenceThicknessRange={[300, 700]}
          transparent
        />
      </mesh>
    </Part>
  )
}

function Gate() {
  const mesh = useRef<THREE.Mesh>(null!)

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const on = conduction(state.clock.elapsedTime, d.focus === 'channel')
    const mat = mesh.current.material as THREE.MeshStandardMaterial
    // Kept modest: at higher levels the orange emissive clipped to flat yellow
    // and pulled attention away from the channel, which is the subject here.
    setEmissive(mat, 0.12 + on * 1.1)
  })

  return (
    <Part id="gate" position={[0, 0.36, 0]} offset={[0, 2.15, 0]}>
      {/* A metal gate: machined, with the lapped roughness the lid has. */}
      <mesh ref={mesh} castShadow geometry={roundedBox(GATE_W, 0.3, 1.95, 0.05)}>
        <meshStandardMaterial
          color="#7a3f24"
          emissive="#ff8a3d"
          emissiveIntensity={0.15}
          roughness={0.34}
          roughnessMap={lappedRoughness()}
          metalness={0.9}
        />
      </mesh>
    </Part>
  )
}

/** How far a terminal moves outwards at explode = 1, shared with its contact. */
const TERMINAL_SPREAD = 1.5

function Contacts() {
  const pins: Array<[number, string]> = [
    [-1.15, 'source'],
    [0, 'gate'],
    [1.15, 'drain'],
  ]
  const meshes = useRef<Array<THREE.Mesh | null>>([])
  const spread = useRef(0)
  /* The source and drain contacts stay over their terminals as those slide
     apart. Fixed at ±1.15 they hung over bare bulk once exploded, and from the
     anatomy camera the drain's pin read as standing on the gate. */
  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    spread.current = damp(spread.current, d.explode, 9, dt)
    pins.forEach(([x], i) => {
      const m = meshes.current[i]
      if (m) m.position.x = x + Math.sign(x) * TERMINAL_SPREAD * spread.current
    })
  })
  /* Contacts rise at least as fast as the gate they land on. With an explode
     offset of 1.2 against the gate's 2.15, the gate climbed up the middle pin
     and the pin ran straight through it at every explode level above zero.
     Shortened from 1.6 so the faster climb does not carry them out of frame. */
  return (
    <Part id="contacts" position={[0, 1.15, 0]} offset={[0, 2.2, 0]}>
      {pins.map(([x, label], i) => (
        <mesh key={label} ref={(m) => {
            meshes.current[i] = m
          }} position={[x, 0, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 1.2, 32]} />
          <meshStandardMaterial color="#d99468" metalness={1} roughness={0.24} roughnessMap={lappedRoughness()} />
        </mesh>
      ))}
    </Part>
  )
}

/**
 * The second transistor, and the decision the pair makes.
 *
 * The beat's copy is "wire two complementary transistors in series and you get
 * an inverter: in goes 1, out comes 0" — the rung the whole course pivots on,
 * from *a switch* to *a decision*. It was illustrated by one transistor sitting
 * still: no second device, no series connection, no inversion, and no motion at
 * all, because the beat carried `focus: null` so even the channel animation was
 * switched off.
 *
 * Drawn as a compact pair beside the exploded transistor rather than as another
 * full teardown: what matters here is the *relationship* between two devices and
 * an output, and a second life-size transistor would swamp it.
 */
function Inverter() {
  const group = useRef<THREE.Group>(null!)
  const pmos = useRef<THREE.Mesh>(null!)
  const nmos = useRef<THREE.Mesh>(null!)
  const input = useRef<THREE.Mesh>(null!)
  const output = useRef<THREE.Mesh>(null!)
  const shown = useRef(0)

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const on = d.motion === 'logic'
    shown.current = damp(shown.current, on ? 1 : 0, 5, dt)
    group.current.visible = shown.current > 0.02
    group.current.scale.setScalar(Math.max(shown.current, 0.0001))
    if (!group.current.visible) return

    /* One input drives both devices, and they are complementary: the n-type
       conducts when the input is high, the p-type when it is low. Exactly one
       of them is ever on, which is why this arrangement burns almost nothing
       while it is holding a value — the CMOS idea, in two blocks. */
    const high = conduction(state.clock.elapsedTime, true) > 0.5
    setEmissive(input.current.material as THREE.MeshStandardMaterial, high ? 1.8 : 0.12)
    setEmissive(nmos.current.material as THREE.MeshStandardMaterial, high ? 1.6 : 0.1)
    setEmissive(pmos.current.material as THREE.MeshStandardMaterial, high ? 0.1 : 1.6)
    // The output is the opposite of the input. That is the whole beat.
    setEmissive(output.current.material as THREE.MeshStandardMaterial, high ? 0.12 : 1.8)

    publishReadout('mosfet', d.scene, [
      { label: 'In', value: high ? '1' : '0' },
      { label: 'p-type (conducts on 0)', value: high ? 'off' : 'ON' },
      { label: 'n-type (conducts on 1)', value: high ? 'ON' : 'off' },
      { label: 'Out', value: high ? '0' : '1', key: true },
    ])
  })

  return (
    /* Clear of the exploded transistor below it. At 1.85 the two overlapped and
       the n-type device hid behind the gate stack, which made a picture about
       *two* devices unreadable. */
    /* Pushed back to -0.6 so the gate contact rising beside it does not skim
       through the front of the n-type block. */
    <group ref={group} position={[0, 2.45, -0.6]} scale={0.92}>
      {/* Input on the left, the two devices stacked in series, output right. */}
      <mesh ref={input} position={[-1.9, 0, 0]}>
        <sphereGeometry args={[0.17, 32, 24]} />
        <meshStandardMaterial color="#123c50" emissive="#2ec5f0" emissiveIntensity={0.12} roughness={0.25} metalness={0.3} />
      </mesh>
      <mesh ref={pmos} position={[0, 0.52, 0]} castShadow geometry={roundedBox(1.5, 0.42, 0.7, 0.06)}>
        <meshPhysicalMaterial color="#2a1d3a" emissive="#c08bff" emissiveMap={dopantMap()} emissiveIntensity={0.1} roughness={0.3} clearcoat={0.6} />
      </mesh>
      <mesh ref={nmos} position={[0, -0.52, 0]} castShadow geometry={roundedBox(1.5, 0.42, 0.7, 0.06)}>
        <meshPhysicalMaterial color="#123240" emissive="#4fd8ff" emissiveMap={dopantMap()} emissiveIntensity={0.1} roughness={0.3} clearcoat={0.6} />
      </mesh>
      <mesh ref={output} position={[1.9, 0, 0]}>
        <sphereGeometry args={[0.17, 32, 24]} />
        <meshStandardMaterial color="#2a2410" emissive="#ffab40" emissiveIntensity={0.12} roughness={0.25} metalness={0.3} />
      </mesh>
      {/* The series connection, and the tap between them that is the output. */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.62, 16]} />
        <meshStandardMaterial color="#8c96a6" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 1.9, 16]} />
        <meshStandardMaterial color="#8c96a6" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[-0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 1.9, 16]} />
        <meshStandardMaterial color="#8c96a6" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  )
}
