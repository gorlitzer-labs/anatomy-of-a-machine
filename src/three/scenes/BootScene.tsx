import { useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { useNamer } from '../naming'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { damp } from '../../lib/math'
import {
  benchMap,
  bootFindTop,
  bootFirmwareTop,
  bootKernelTop,
  bootLoaderTop,
  bootPostTop,
  bootPowerTop,
  bootResetTop,
  roundedBox,
  tiled,
  topFaced,
} from '../surfaces'
import { BOUNDS, SPAN, STAGES, bootAt, stageProgress, stageX } from './bootLayout'

/**
 * The only scene in the course that runs to an end and stops.
 *
 * Everything else loops, because every other subject is a steady state. Boot
 * happens once, in order, and never again — so stages light in strict sequence
 * and stay lit, nothing that has completed un-completes, and at the end the
 * machine simply sits there running until the beat starts it over.
 */
export function BootScene() {
  return (
    <Part
      id="boot"
      tags={['cold', 'rail', 'reset', 'firmware', 'post', 'find', 'loader', 'kernel', 'handoff']}
      position={[0, 0, 0]}
    >
      <Bench />
      <Rail />
      <Stages />
      <Wall />
    </Part>
  )
}

/*
 * The bench runs a little further forward than the stages need, so the supply
 * rail lies in a channel on it rather than along its very edge.
 */
const BENCH = { w: SPAN + 1.6, front: 1.3, back: -1.1 }
const RAIL_Z = 0.95
/** Where each stage stands: on a machined pad, just proud of the bench. */
const PAD = { w: 0.74, d: 0.94, h: 0.008 }
const BLOCK = { w: 0.6, h: 0.55, d: 0.8 }

/**
 * The board the sequence is built on: the same black anodised bench and grid
 * pitch as the logic and pipeline chapters, with its top at y = 0, where the
 * stages stand. It sat 7 cm lower, so the whole row hovered over its own board.
 */
function Bench() {
  const d = BENCH.front - BENCH.back
  const map = useMemo(() => tiled(benchMap(), BENCH.w / 0.5, d / 0.5), [d])
  return (
    <group>
      <mesh position={[0, -0.06, (BENCH.front + BENCH.back) / 2]} receiveShadow geometry={roundedBox(BENCH.w, 0.12, d, 0.05)}>
        <meshStandardMaterial color="#ffffff" map={map} roughness={0.62} metalness={0.35} />
      </mesh>

      {/* A machined pad under every stage, so a stage that has not run yet —
          a thin dark tile — still has a place in the row that says a stage
          belongs here. */}
      {STAGES.map((s, i) => (
        <mesh key={s.id} position={[stageX(i), PAD.h / 2, 0]} receiveShadow geometry={roundedBox(PAD.w, PAD.h, PAD.d, 0.004)}>
          <meshStandardMaterial color="#1c232c" roughness={0.34} metalness={0.85} />
        </mesh>
      ))}

      {/* One feed from the rail to every stage. Every stage runs off the same
          supply, which is why none of them may start until it is up. Dull
          gold, and darker than the pipeline's clock taps: on the cold beat a
          bright gold line reads as power already arriving. */}
      {STAGES.map((s, i) => {
        const from = PAD.d / 2
        const to = RAIL_Z - 0.07
        return (
          <group key={s.id} position={[stageX(i), 0, 0]}>
            <mesh position={[0, 0.003, (from + to) / 2]} receiveShadow geometry={roundedBox(0.05, 0.006, to - from, 0.002)}>
              <meshStandardMaterial color="#5a4a30" roughness={0.5} metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.004, from + 0.04]}>
              <cylinderGeometry args={[0.028, 0.028, 0.008, 20]} />
              <meshStandardMaterial color="#6e5a38" roughness={0.45} metalness={0.9} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/**
 * The supply rail.
 *
 * Fills before anything else is allowed to happen, because that is what a
 * power-on reset is for: the logic is held in reset until the voltage is up and
 * steady, since a processor fed a rising voltage does not run slowly, it runs
 * wrongly. The ramp is the first thing that has to be true.
 */
function Rail() {
  const bar = useRef<THREE.Mesh>(null!)
  const named = useNamer('boot')

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const b = bootAt(d.beatTime, d.motion)
    bar.current.scale.x = Math.max(b.voltage, 0.0001)
    bar.current.position.x = -SPAN / 2 - 0.5 + (b.voltage * (SPAN + 1)) / 2
    const mat = bar.current.material as THREE.MeshStandardMaterial
    // Dim until it is up: a rail that is still rising is not yet a supply.
    setEmissive(mat, b.voltage < 0.98 ? 0.4 : 1.3)
  })

  return (
    <group position={[0, 0.02, RAIL_Z]}>
      {/* A machined channel the rail lies in, a lip either side, with a
          terminal post at each end. */}
      <mesh position={[0, -0.012, 0]} receiveShadow geometry={roundedBox(SPAN + 1.24, 0.016, 0.2, 0.006)}>
        <meshStandardMaterial color="#232a33" roughness={0.3} metalness={0.9} />
      </mesh>
      {[-0.088, 0.088].map((z) => (
        <mesh key={z} position={[0, 0.004, z]} castShadow geometry={roundedBox(SPAN + 1.24, 0.05, 0.024, 0.01)}>
          <meshStandardMaterial color="#2c343e" roughness={0.28} metalness={0.9} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (SPAN / 2 + 0.56), 0, 0]}>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.05, 0.07, 6]} />
            <meshStandardMaterial color="#9aa3ad" roughness={0.3} metalness={0.95} />
          </mesh>
          <mesh position={[0, 0.058, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.012, 20]} />
            <meshStandardMaterial color="#c7ced6" roughness={0.25} metalness={0.95} />
          </mesh>
        </group>
      ))}

      {/* The bus bar itself, tin-plated and dark until the supply fills it —
          not copper, which in this light is the amber of a live rail. */}
      <mesh geometry={roundedBox(SPAN + 1, 0.03, 0.09, 0.012)}>
        <meshStandardMaterial color="#20252c" roughness={0.36} metalness={0.85} />
      </mesh>
      <mesh ref={bar} scale={[0.0001, 1, 1]} geometry={roundedBox(SPAN + 1, 0.05, 0.12, 0.02)} {...named('boot:rail')}>
        <meshStandardMaterial color="#2a1d10" emissive="#ffab40" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>
    </group>
  )
}

/**
 * The stages.
 *
 * Each one rises as it runs and stays up once it is done. Nothing here decays
 * back, which is the difference between this scene and every other one — a
 * booted machine does not gradually un-boot.
 */
function Stages() {
  const group = useRef<THREE.Group>(null!)
  const namer = useNamer('boot')
  const heights = useRef<number[]>(STAGES.map(() => 0))
  const colour = useMemo(() => new THREE.Color(), [])

  const PENDING = useMemo(() => new THREE.Color('#1a212b'), [])
  const RUNNING = useMemo(() => new THREE.Color('#ffab40'), [])
  const DONE = useMemo(() => new THREE.Color('#4fd8ff'), [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const b = bootAt(d.beatTime, d.motion)

    group.current.children.forEach((child, i) => {
      const mesh = child.children[0] as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial
      const done = b.progress >= BOUNDS[i].to
      const running = b.active === i
      const p = stageProgress(b, i)

      // Rises while it runs, then holds. It never comes back down.
      heights.current[i] = damp(heights.current[i], done ? 1 : running ? 0.25 + p * 0.75 : 0.05, 9, dt)
      const h = heights.current[i]
      mesh.scale.y = Math.max(h, 0.02)
      mesh.position.y = (h * BLOCK.h) / 2

      colour.copy(done ? DONE : running ? RUNNING : PENDING)
      mat.color.copy(colour).multiplyScalar(0.24)
      mat.emissive.copy(colour)
      // The focused stage is brighter, so a beat about firmware points at
      // firmware without the reader having to count along the row.
      const named = d.focus === STAGES[i].id
      /* A completed stage has to stay clearly lit — "nothing un-completes" is
         the signature of this scene, and at 0.55 the finished stages read as
         dark, which said the opposite. */
      setEmissive(mat, running ? 1.6 : done ? (named ? 1.5 : 0.95) : 0.08)
    })
  })

  return (
    <group ref={group}>
      {STAGES.map((s, i) => (
        <group key={s.id} position={[stageX(i), PAD.h, 0]}>
          {/* Lacquered, with what the stage is drawn on its face — the
              regulator, the reset supervisor, the flash chip, the memory it
              trains, the partition table, the 512-byte sector, the rings — so
              seven blocks read as seven different things that each hand on
              to the next. The height and the colour are still the state. */}
          <mesh castShadow receiveShadow geometry={topFaced(BLOCK.w, BLOCK.h, BLOCK.d, 0.035)} {...namer(`boot:${s.id}`)}>
            <meshPhysicalMaterial
              color="#1a212b"
              emissive="#4fd8ff"
              emissiveMap={STAGE_FACE[s.id]()}
              emissiveIntensity={0.1}
              roughness={0.34}
              metalness={0.3}
              clearcoat={0.55}
              clearcoatRoughness={0.18}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Each stage's face, keyed by the stage ids in `STAGES`. */
const STAGE_FACE: Record<string, () => THREE.Texture> = {
  rail: bootPowerTop,
  reset: bootResetTop,
  firmware: bootFirmwareTop,
  post: bootPostTop,
  find: bootFindTop,
  loader: bootLoaderTop,
  kernel: bootKernelTop,
}

/**
 * The wall going up.
 *
 * The last thing boot does is hand the machine to a kernel, and the first thing
 * that kernel does is put a boundary between itself and everything else. This
 * is the arrangement from Lecture 8 arriving — deliberately the same shape, so
 * the handoff reads as the start of that lecture rather than as the end of this
 * one.
 */
function Wall() {
  const rig = useRef<THREE.Group>(null!)
  const ring = useRef<THREE.Mesh>(null!)
  const lip = useRef<THREE.Mesh>(null!)
  const up = useRef(0)
  const named = useNamer('boot')

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const b = bootAt(d.beatTime, d.motion)
    const showing = d.motion === 'kernel' || d.motion === 'handoff'
    // Rises only once the kernel stage is actually reached.
    const want = showing && b.progress >= BOUNDS[6].from ? 1 : 0
    up.current = damp(up.current, want, 4, dt)
    const u = Math.max(up.current, 0.0001)
    rig.current.visible = up.current > 0.02
    /* Grown from the bench, not from its own middle: "watch the wall rise" is
       the copy, and a wall scaled about its centre came out of the air at
       mid-height and spread both ways. */
    ring.current.scale.set(1, u, 1)
    ring.current.position.y = (WALL_H * u) / 2
    lip.current.position.y = WALL_H * u
    const level = 0.2 + up.current * 0.9
    setEmissive(ring.current.material as THREE.MeshStandardMaterial, level)
    setEmissive(lip.current.material as THREE.MeshStandardMaterial, level * 1.2)
  })

  return (
    /* Sized to the kernel's own block. At 0.95 the wall cut through the
       bootloader beside it and through the supply rail in front. */
    <group ref={rig} position={[stageX(6), 0, 0]} visible={false}>
      <mesh ref={ring} {...named('boot:wall')}>
        <cylinderGeometry args={[WALL_R, WALL_R, WALL_H, 64, 1, true]} />
        <meshStandardMaterial
          color="#16202c"
          emissive="#4fd8ff"
          emissiveIntensity={0.2}
          roughness={0.4}
          metalness={0.4}
          side={THREE.DoubleSide}
          transparent
          opacity={0.55}
        />
      </mesh>
      {/* Its rising edge, solid, so the top of the wall is a line in light
          rather than wherever a translucent sheet happens to fade out. */}
      <mesh ref={lip} rotation={[Math.PI / 2, 0, 0]} {...named('boot:wall')}>
        <torusGeometry args={[WALL_R, 0.014, 10, 96]} />
        <meshStandardMaterial color="#16202c" emissive="#4fd8ff" emissiveIntensity={0.24} roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  )
}

const WALL_R = 0.6
const WALL_H = 0.6
