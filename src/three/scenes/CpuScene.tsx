import { useLayoutEffect, useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import {
  coreFloorplan,
  ioPads,
  lappedRoughness,
  lidMarking,
  pasteBump,
  roundedBox,
  siliconMap,
  sramArray,
  substrateBump,
  substrateMap,
} from '../surfaces'

/**
 * A desktop CPU package, built entirely from primitives.
 *
 * Note on materials: every mesh declares its own `<meshStandardMaterial>`
 * rather than sharing hoisted instances. Part's focus-dimming mutates material
 * colour in place, so a shared material would dim every part that references it.
 */
export function CpuScene() {
  return (
    <group>
      <Socket />
      <Pads />
      <Substrate />
      <Capacitors />
      <Die />
      <ThermalInterface />
      <HeatSpreader />
    </group>
  )
}

function Socket() {
  return (
    /* Rest heights across the stack are derived so each layer's underside
       touches the top of the one below (socket top = -0.114 = pad underside).
       Authored by eye they left visible gaps, so the "assembled" state read as
       a set of floating plates rather than one solid package. */
    <Part id="socket" position={[0, -0.254, 0]} offset={[0, -1.7, 0]}>
      {/* Glass-filled polymer: near-black, satin, with a faint clear skin. */}
      <mesh castShadow receiveShadow geometry={roundedBox(4.9, 0.28, 4.9, 0.06)}>
        <meshPhysicalMaterial color="#0e1116" roughness={0.62} metalness={0.05} clearcoat={0.35} clearcoatRoughness={0.5} />
      </mesh>
      {/* Contact field: the sprung pins the pads land on, as a darker inset. */}
      <mesh position={[0, 0.143, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.7, 3.7]} />
        <meshStandardMaterial color="#1a1510" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Retention frame, outside the substrate footprint and clear of the
          contact field: four walls rather than the flat annulus it was, so the
          package visibly sits *in* the socket rather than on it. Inner edge at
          2.05, which clears the 4.0 substrate. */}
      {[0, 1, 2, 3].map((i) => {
        const along = i < 2
        const sgn = i % 2 ? -1 : 1
        return (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={along ? [0, 0.154, sgn * 2.22] : [sgn * 2.22, 0.154, 0]}
            geometry={along ? roundedBox(4.8, 0.028, 0.34, 0.012) : roundedBox(0.34, 0.028, 4.1, 0.012)}
          >
            <meshStandardMaterial color="#151a22" roughness={0.45} metalness={0.2} />
          </mesh>
        )
      })}
      {/* The load lever, satin steel, along one side with its hooked end. */}
      <mesh position={[2.56, -0.02, -0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 4.3, 12]} />
        <meshStandardMaterial color="#9aa2ad" roughness={0.35} metalness={1} />
      </mesh>
      <mesh position={[2.72, -0.02, 2.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.36, 12]} />
        <meshStandardMaterial color="#9aa2ad" roughness={0.35} metalness={1} />
      </mesh>
    </Part>
  )
}

/**
 * LGA contacts — 784 of them, so instanced.
 *
 * A denser 34×34 grid was closer to a real socket count but aliased into a
 * shimmering moiré at these camera distances. Fewer, chunkier pads read more
 * clearly as contacts.
 */
function Pads() {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const count = 28 * 28

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const step = 0.128
    const span = ((28 - 1) * step) / 2
    let i = 0
    for (let x = 0; x < 28; x++) {
      for (let z = 0; z < 28; z++) {
        const px = x * step - span
        const pz = z * step - span
        // Real packages keep a keep-out zone under the die for power delivery.
        const inHole = Math.abs(px) < 0.42 && Math.abs(pz) < 0.42
        // Hide by zero-scaling, not by translating far away: an off-screen
        // instance still counts toward the mesh's bounding volume, which would
        // inflate the shadow camera and defeat frustum culling.
        pos.set(px, 0, pz)
        scale.setScalar(inHole ? 0 : 1)
        m.compose(pos, quat, scale)
        ref.current.setMatrixAt(i++, m)
      }
    }
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [])

  return (
    <Part id="pads" tags={['substrate']} position={[0, -0.1, 0]} offset={[0, -0.85, 0]}>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[0.038, 0.038, 0.028, 12]} />
        <meshStandardMaterial color="#e2b54a" metalness={1} roughness={0.22} />
      </instancedMesh>
    </Part>
  )
}

function Substrate() {
  return (
    <Part id="substrate" position={[0, 0, 0]} offset={[0, 0, 0]}>
      {/* Solder mask over routed copper: the routing is painted, the traces
          stand proud of the mask, and the mask has the wet clear gloss it has
          in the hand. Only the top carries the routing; the edges are the bare
          laminate, which is what a package's edge looks like. */}
      <mesh castShadow receiveShadow geometry={roundedBox(4, 0.16, 4, 0.03)}>
        <meshStandardMaterial attach="material-0" color="#1b2a1f" roughness={0.7} metalness={0.05} />
        <meshStandardMaterial attach="material-1" color="#1b2a1f" roughness={0.7} metalness={0.05} />
        <meshPhysicalMaterial
          attach="material-2"
          map={substrateMap()}
          bumpMap={substrateBump()}
          bumpScale={1.2}
          roughness={0.42}
          metalness={0.1}
          clearcoat={0.5}
          clearcoatRoughness={0.42}
        />
        <meshStandardMaterial attach="material-3" color="#1b2a1f" roughness={0.7} metalness={0.05} />
        <meshStandardMaterial attach="material-4" color="#1b2a1f" roughness={0.7} metalness={0.05} />
        <meshStandardMaterial attach="material-5" color="#1b2a1f" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Copper trace fan-out on the top face. Kept fairly rough and only
          semi-metallic on purpose: at high metalness it mirrored the blue
          environment and read as a glowing cyan disc rather than copper. */}
      <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.66, 1.84, 64, 1]} />
        <meshStandardMaterial color="#7a5c22" metalness={0.6} roughness={0.5} />
      </mesh>
    </Part>
  )
}

function Capacitors() {
  const caps = useMemo(() => {
    const out: Array<[number, number]> = []
    for (let i = 0; i < 14; i++) {
      const side = i % 2 === 0 ? 1 : -1
      out.push([(i / 14 - 0.5) * 1.9, side * 1.05])
    }
    return out
  }, [])

  /* Shared within the part, which is safe: the whole part dims as one. */
  const body = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9b7650', roughness: 0.55, metalness: 0.05 }), [])
  const cap = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d6d9de', roughness: 0.28, metalness: 1 }), [])

  return (
    <Part id="capacitors" tags={['substrate']} position={[0, 0.12, 0]} offset={[0, 0.32, 0]}>
      {/* Multilayer ceramic capacitors: a tan ceramic body between two
          plated terminations. The two-tone is what makes a speck read as a
          component rather than as a crumb on the board. */}
      {caps.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow material={body} geometry={roundedBox(0.07, 0.066, 0.056, 0.01, 2)} />
          <mesh position={[-0.0475, 0, 0]} castShadow material={cap} geometry={roundedBox(0.022, 0.07, 0.06, 0.008, 2)} />
          <mesh position={[0.0475, 0, 0]} castShadow material={cap} geometry={roundedBox(0.022, 0.07, 0.06, 0.008, 2)} />
        </group>
      ))}
    </Part>
  )
}

/** Core positions on the die floorplan, reused by the pulse animation. */
const CORE_X = [-0.72, -0.24, 0.24, 0.72]
const CORE_Z = [-0.44, 0.44]

function Die() {
  return (
    <Part id="die" tags={['core', 'cache']} position={[0, 0.13, 0]} offset={[0, 1.05, 0]}>
      {/* Bulk silicon. Polished silicon carries a thin-film rainbow where the
          passivation layers catch the light — the single most recognisable
          thing about a bare die, and what made the flat navy slab read as
          plastic. */}
      <mesh castShadow receiveShadow geometry={roundedBox(2.2, 0.1, 1.6, 0.012, 2)}>
        <meshPhysicalMaterial
          map={siliconMap()}
          roughness={0.2}
          metalness={0.7}
          iridescence={0.85}
          iridescenceIOR={1.7}
          iridescenceThicknessRange={[240, 620]}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
        />
      </mesh>
      <Cores />
      <Cache />
      <IoStrips />
    </Part>
  )
}

/** The repeated blocks. Each pulses on its own phase during the fetch/execute beat. */
function Cores() {
  const group = useRef<THREE.Group>(null!)

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.focus ?? ''
    const t = state.clock.elapsedTime

    /* Cores only run when a beat is about them running.
       They used to pulse on every beat in the chapter, including the ones where
       the die is under a soldered lid and cannot be seen at all — motion for
       the sake of looking alive. On the cores and cycle beats the staggered
       phase carries something real: eight independent workers, each on its own
       rhythm, which is exactly what "eight instruction streams at the same
       moment" means. Elsewhere they are simply lit. */
    const running = focus === 'core' || focus === 'cycle'
    group.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (!running) {
        setEmissive(mat, focus === 'die' || focus === null ? 0.55 : 0.3)
        return
      }
      const pulse = 0.5 + 0.5 * Math.sin(t * 3.2 - i * 0.9)
      setEmissive(mat, 0.3 + pulse * 0.95)
    })
  })

  return (
    <group ref={group}>
      {CORE_Z.flatMap((z) =>
        CORE_X.map((x) => (
          <mesh key={`${x}:${z}`} position={[x, 0.06, z]} geometry={roundedBox(0.42, 0.024, 0.46, 0.006, 2)}>
            {/* The pulse lights the core's own floorplan — standard-cell rows
                and hard macros — instead of a uniform panel. */}
            <meshStandardMaterial
              color="#1d5a74"
              map={coreFloorplan()}
              emissive="#4fe0ff"
              emissiveMap={coreFloorplan()}
              emissiveIntensity={0.8}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
        )),
      )}
    </group>
  )
}

function Cache() {
  return (
    <group>
      {/* Grey, because the copy calls it grey — "the large, regular grey areas
          are cache" is how you read a real die photograph, and a violet block
          made the narration contradict the picture it was describing.

          Kept emissive rather than dropped to a flat dark material: cores and
          I/O both glow, and an unlit cache receded into the substrate exactly
          when it is the subject. Neutral and slightly cool so it reads as grey
          next to the cyan cores rather than as a third accent colour. */}
      <mesh position={[0, 0.06, 0]} geometry={roundedBox(1.9, 0.022, 0.36, 0.006, 2)}>
        <meshStandardMaterial
          color="#50565f"
          map={sramArray()}
          emissive="#b4bcc8"
          emissiveMap={sramArray()}
          emissiveIntensity={0.42}
          roughness={0.4}
          metalness={0.35}
        />
      </mesh>
      {/* SRAM banks — the regularity is the visual signature of cache, and with
          the colour gone it is the only signature left, so the stripes need to
          stay legible against the slab. */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[(i / 11 - 0.5) * 1.78, 0.073, 0]}>
          <boxGeometry args={[0.1, 0.008, 0.3]} />
          <meshStandardMaterial color="#4a515c" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function IoStrips() {
  return (
    <group>
      {[-0.735, 0.735].map((z) => (
        <mesh key={z} position={[0, 0.058, z]} geometry={roundedBox(2.0, 0.018, 0.09, 0.005, 2)}>
          <meshStandardMaterial
            color="#4a3218"
            map={ioPads()}
            emissive="#ffab40"
            emissiveMap={ioPads()}
            emissiveIntensity={0.5}
            roughness={0.45}
          />
        </mesh>
      ))}
    </group>
  )
}

/* The paste rests on the tallest thing on the die, the SRAM stripes at 0.207,
   not on the bare silicon at 0.18: the cores, cache and I/O strips used to sit
   0.02 up inside it. The lid is raised by the same 0.027 to stay on the paste. */
function ThermalInterface() {
  return (
    <Part id="tim" tags={['ihs']} position={[0, 0.222, 0]} offset={[0, 1.75, 0]}>
      {/* Metal-loaded paste: grey, a little wet, with the marks of being spread. */}
      <mesh geometry={roundedBox(2.4, 0.03, 1.8, 0.012, 2)}>
        <meshStandardMaterial color="#8f949b" roughness={0.5} metalness={0.35} bumpMap={pasteBump()} bumpScale={2.5} />
      </mesh>
    </Part>
  )
}

function HeatSpreader() {
  const rough = lappedRoughness()
  return (
    <Part id="ihs" position={[0, 0.287, 0]} offset={[0, 2.45, 0]}>
      {/* Nickel-plated copper. Satin, not chrome: a lapped roughness map puts
          fine machining marks into the highlight, and the bevelled edges carry
          the strip lights round the corners. */}
      <mesh castShadow receiveShadow geometry={roundedBox(3.95, 0.1, 3.95, 0.035)}>
        <meshPhysicalMaterial color="#b9bfc9" metalness={1} roughness={0.46} roughnessMap={rough} />
      </mesh>
      {/* The raised centre, laser-marked on top. The marking is on the top face
          only; the sides are plain plate. */}
      <mesh position={[0, 0.11, 0]} castShadow geometry={roundedBox(2.95, 0.14, 2.95, 0.05)}>
        <meshPhysicalMaterial attach="material-0" color="#cdd3dc" metalness={1} roughness={0.4} roughnessMap={rough} />
        <meshPhysicalMaterial attach="material-1" color="#cdd3dc" metalness={1} roughness={0.4} roughnessMap={rough} />
        <meshPhysicalMaterial attach="material-2" color="#ffffff" map={lidMarking()} metalness={1} roughness={0.42} roughnessMap={rough} />
        <meshPhysicalMaterial attach="material-3" color="#cdd3dc" metalness={1} roughness={0.4} roughnessMap={rough} />
        <meshPhysicalMaterial attach="material-4" color="#cdd3dc" metalness={1} roughness={0.4} roughnessMap={rough} />
        <meshPhysicalMaterial attach="material-5" color="#cdd3dc" metalness={1} roughness={0.4} roughnessMap={rough} />
      </mesh>
    </Part>
  )
}

/*
 * A cooler used to sit here. It was cut deliberately: this chapter is about the
 * package as it ships, and a finned heatsink is both physically separate and
 * visually so much larger that it read as the subject of the shot. Its dense
 * thin fins also aliased badly at this camera distance.
 */
