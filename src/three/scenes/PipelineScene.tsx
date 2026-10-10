import { useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { useNamer } from '../naming'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { publishReadout } from '../readout'
import { damp } from '../../lib/math'
import {
  benchMap,
  decodeTop,
  executeTop,
  fetchTop,
  instructionTop,
  memoryTop,
  roundedBox,
  tiled,
  topFaced,
  writebackTop,
} from '../surfaces'
import {
  CLOCK_RATE,
  KIND_COLOR,
  SLOTS,
  STAGES,
  WALL,
  WALL_LIMIT,
  flushed,
  slotKind,
  stageX,
} from './pipelineLayout'

/**
 * Instructions moving through a pipeline, on a clock.
 *
 * The motion is the argument twice over. Instructions advance exactly one stage
 * per tick and hold in between, so the clock is visible as the thing that makes
 * everything move together rather than as a number in the copy. And a stall is
 * a *gap* travelling down the pipe — you can see the hole, count it, and watch
 * it cost throughput, which no static diagram of a pipeline can show.
 */
export function PipelineScene() {
  return (
    <Part
      id="pipeline"
      tags={['clock', 'stages', 'overlap', 'hazard', 'branch', 'speculation', 'wall', 'cores']}
      position={[0, 0, 0]}
    >
      <Bench />
      <Stages />
      <Clock />
      <Instructions />
      <Wall />
    </Part>
  )
}

/*
 * The bench runs further back than the stages need, so the clock that drives
 * them stands on it instead of hanging in the void behind it.
 */
const BENCH = { w: 7.4, front: 1.3, back: -1.85 }
const CLOCK_Z = -1.55
const CLOCK_Y = 0.34

/**
 * The board the pipeline is built on: the same black anodised bench and grid
 * pitch as the logic chapters, so this reads as more of that machine. Its top
 * is at y = 0, where the stages stand — it sat 7 cm lower, so the whole
 * pipeline hovered over its own board.
 */
function Bench() {
  const d = BENCH.front - BENCH.back
  const map = useMemo(() => tiled(benchMap(), BENCH.w / 0.5, d / 0.5), [d])
  return (
    <mesh
      position={[0, -0.06, (BENCH.front + BENCH.back) / 2]}
      receiveShadow
      geometry={roundedBox(BENCH.w, 0.12, d, 0.05)}
    >
      <meshStandardMaterial color="#ffffff" map={map} roughness={0.62} metalness={0.35} />
    </mesh>
  )
}

/**
 * What each stage physically is — an instruction cache, a decoder, an ALU, a
 * data cache, a register file — drawn on its face, so the five slabs read as
 * five different pieces of hardware rather than five of one thing. Keyed by
 * the stage ids in `STAGES`.
 */
const STAGE_FACE: Record<string, () => THREE.Texture> = {
  fetch: fetchTop,
  decode: decodeTop,
  execute: executeTop,
  memory: memoryTop,
  writeback: writebackTop,
}

/** The five places an instruction can be. */
function Stages() {
  const group = useRef<THREE.Group>(null!)
  const named = useNamer('pipeline')

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const t = state.clock.elapsedTime
    const tick = Math.floor(t * CLOCK_RATE)
    const dim = d.motion === 'wall' || d.motion === 'cores' ? 0.06 : 1

    group.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
      if (!mat) return
      // A stage lights when something is actually in it, so an idle pipeline
      // looks idle.
      const n = tick - i
      const busy = n >= 0 && slotKind(d.motion ?? '', n) !== 'bubble' && !flushed(d.motion ?? '', n, tick)
      setEmissive(mat, (busy ? 0.34 : 0.1) * dim)
    })
  })

  return (
    <group ref={group}>
      {STAGES.map((s, i) => (
        <mesh
          key={s.id}
          position={[stageX(i), 0.05, 0]}
          castShadow
          receiveShadow
          geometry={topFaced(1.02, 0.1, 1.5, 0.035)}
          {...named(`pipeline:${s.id}`)}
        >
          <meshPhysicalMaterial
            color="#131a24"
            emissive="#4fd8ff"
            emissiveMap={STAGE_FACE[s.id]()}
            emissiveIntensity={0.12}
            roughness={0.36}
            metalness={0.4}
            clearcoat={0.45}
            clearcoatRoughness={0.22}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * The metronome.
 *
 * A bar that snaps on every tick rather than pulsing smoothly, because the
 * point of a clock is that it is discrete — everything in the machine happens
 * on an edge, not continuously.
 */
function Clock() {
  const rig = useRef<THREE.Group>(null!)
  const bar = useRef<THREE.Mesh>(null!)
  const level = useRef(0)
  const present = useRef(1)
  const named = useNamer('pipeline')

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const t = state.clock.elapsedTime
    const phase = (t * CLOCK_RATE) % 1
    // Square-ish: hard on for the first third of the tick, then decay.
    const edge = phase < 0.34 ? 1 : 0
    level.current = damp(level.current, edge, 14, dt)
    const loud = d.motion === 'clock' ? 1 : 0.42
    setEmissive(bar.current.material as THREE.MeshStandardMaterial, (0.1 + level.current * 1.5) * loud)
    /* On the power-wall beats the clock sits right behind the bars, where it
       read as a second, amber threshold line beside the red one the copy points
       at. It folds away there, as the chart grows in — its carrier and the
       taps to each stage with it, which would otherwise be left standing
       behind the bars as the same line in metal. */
    const wall = d.motion === 'wall' || d.motion === 'cores'
    present.current = damp(present.current, wall ? 0 : 1, 4, dt)
    const p = Math.max(present.current, 0.0001)
    rig.current.visible = present.current > 0.02
    rig.current.scale.set(p, p, 1)
    bar.current.scale.set(1, 1 + level.current * 1.6, 1)
  })

  // Everything below is in the rig's frame, centred on the bar.
  const floor = -CLOCK_Y
  const channel = -0.12
  const reach = -CLOCK_Z - 0.75 // from under the bar to the back edge of the stages

  return (
    <group ref={rig} position={[0, CLOCK_Y, CLOCK_Z]}>
      <mesh ref={bar} {...named('pipeline:clock')} geometry={roundedBox(6.4, 0.07, 0.07, 0.03)}>
        <meshStandardMaterial color="#2a1d10" emissive="#ffab40" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>

      {/* A machined channel the bar runs in: a floor below it and a lip on
          either side, clear of it in depth so it can swell on the edge
          without touching either. */}
      <mesh position={[0, channel, 0]} castShadow geometry={roundedBox(6.6, 0.04, 0.17, 0.015)}>
        <meshStandardMaterial color="#232a33" roughness={0.3} metalness={0.9} />
      </mesh>
      {[-0.07, 0.07].map((z) => (
        <mesh key={z} position={[0, -0.07, z]} castShadow geometry={roundedBox(6.6, 0.1, 0.025, 0.01)}>
          <meshStandardMaterial color="#2c343e" roughness={0.28} metalness={0.9} />
        </mesh>
      ))}
      {[-3.22, 3.22].map((x) => (
        <mesh
          key={x}
          position={[x, (floor + channel) / 2, 0]}
          castShadow
          geometry={roundedBox(0.09, channel - floor, 0.09, 0.02)}
        >
          <meshStandardMaterial color="#232a33" roughness={0.32} metalness={0.9} />
        </mesh>
      ))}

      {/* One tap to every stage, off the one wire: the whole point of the
          clock is that every stage hears the same edge. Gold traces, dark:
          they carry it, they do not flash with it. */}
      {STAGES.map((s, i) => (
        <group key={s.id} position={[stageX(i), 0, 0]} {...named('pipeline:clock')}>
          <mesh position={[0, (floor + channel) / 2, 0]} geometry={roundedBox(0.03, channel - floor, 0.03, 0.01)}>
            <meshStandardMaterial color="#8a6a38" roughness={0.35} metalness={0.95} />
          </mesh>
          <mesh position={[0, floor + 0.004, reach / 2]} receiveShadow geometry={roundedBox(0.05, 0.008, reach, 0.003)}>
            <meshStandardMaterial color="#8a6a38" roughness={0.35} metalness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * The instructions themselves.
 *
 * Each slot is one instruction; where it sits is `tick - n`, so the whole
 * stream advances together and a bubble is simply a slot that renders as a gap.
 */
function Instructions() {
  const group = useRef<THREE.Group>(null!)
  const colour = useMemo(() => new THREE.Color(), [])
  const named = useNamer('pipeline')

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.motion ?? ''
    const t = state.clock.elapsedTime
    const raw = t * CLOCK_RATE
    const tick = Math.floor(raw)
    const phase = raw - tick
    // Move during the first 60% of the tick, then hold. The hold is what makes
    // the clock legible — continuous drift would read as a conveyor, not a beat.
    const eased = phase < 0.6 ? 0.5 - 0.5 * Math.cos((phase / 0.6) * Math.PI) : 1

    group.current.children.forEach((child, k) => {
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial
      const n = tick - k + 4
      const stage = tick - n + eased

      const kind = slotKind(focus, n)
      const gone = flushed(focus, n, tick)
      const visible =
        !!focus &&
        /* The bar chart occupies the same volume as the pipeline, so on the
           beats that show it the pipeline gets out of the way. `cores` used to
           render both at once plus the stages at full brightness, all stacked
           in one place, and neither visual argued its claim — "two cores at
           three gigahertz burn far less than one at six" is arithmetic about
           the bars. */
        focus !== 'wall' &&
        focus !== 'cores' &&
        n >= 0 &&
        stage >= -0.5 &&
        stage <= STAGES.length - 0.5 &&
        kind !== 'bubble' &&
        !gone

      mesh.visible = visible
      if (!visible) return

      mesh.position.set(stageX(0) + stage * (stageX(1) - stageX(0)), 0.19, 0)
      colour.copy(KIND_COLOR[kind])
      // Albedo stays dark: at full colour *and* full emissive these crossed the
      // bloom threshold and rendered as featureless white slabs.
      mat.color.copy(colour).multiplyScalar(0.22)
      mat.emissive.copy(colour)
      setEmissive(mat, kind === 'speculative' ? 0.42 : 0.62)
    })

    if (import.meta.env.DEV) {
      /* Counts instructions actually on screen.
         `__signals` walks the tree and reports emissive whether or not a mesh
         is visible, and an unpipelined machine differs from a pipelined one
         only in how many slots are *hidden* — so from outside the two beats
         measured identically (18.0 against 18.5) while looking completely
         different. Occupancy has to be asked for directly. */
      ;(window as unknown as Record<string, unknown>).__pipeline = () => ({
        motion: d.motion,
        occupied: group.current.children.filter((c) => c.visible).length,
        stages: STAGES.length,
      })
    }
  })

  return (
    <group ref={group}>
      {Array.from({ length: SLOTS }, (_, i) => (
        <mesh key={i} castShadow geometry={topFaced(0.82, 0.16, 0.9, 0.04)} {...named('pipeline:instruction')}>
          {/* An instruction word on its face: fields of bits, under a clear
              lacquer. The colour is still what kind of instruction it is. */}
          <meshPhysicalMaterial
            color="#123240"
            emissive="#4fd8ff"
            emissiveMap={instructionTop()}
            emissiveIntensity={0.6}
            roughness={0.32}
            metalness={0.3}
            clearcoat={0.6}
            clearcoatRoughness={0.15}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * The clock wall, as bars.
 *
 * Frequency along the bottom, power up the side, and a line where the cooling
 * runs out. The curve bending away from the line is the entire reason the last
 * twenty years of processors look the way they do.
 */
function Wall() {
  const group = useRef<THREE.Group>(null!)
  const shown = useRef(0)
  const named = useNamer('pipeline')

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const want = d.motion === 'wall' || d.motion === 'cores' ? 1 : 0
    shown.current = damp(shown.current, want, 4, dt)
    group.current.scale.setScalar(Math.max(shown.current, 0.0001))
    group.current.visible = shown.current > 0.02

    group.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (!mat?.emissive) return
      const over = mesh.userData.over as boolean | undefined
      if (over !== undefined) {
        setEmissive(mat, over ? 1.1 + 0.3 * Math.sin(state.clock.elapsedTime * 3) : 0.35)
      }
    })

    if (d.motion === 'cores') {
      /* The sentence, as arithmetic, read off the same table the bars are drawn
         from. "Two cores at three gigahertz burn far less than one core at six"
         is a claim about two numbers that were both already here and neither of
         which reached the reader. */
      const one6 = WALL.find((w) => w.ghz === 6)?.power ?? 0
      const one3 = WALL.find((w) => w.ghz === 3)?.power ?? 0
      publishReadout('pipeline', d.scene, [
        { label: 'One core at 6 GHz', value: one6.toFixed(2) },
        { label: 'Two cores at 3 GHz', value: (one3 * 2).toFixed(2) },
        { label: 'Power saved (model)', value: `${Math.round((1 - (one3 * 2) / one6) * 100)}%`, key: true },
        { label: 'Cooling budget', value: WALL_LIMIT.toFixed(2) },
      ])
    }
  })

  const span = 5.4

  return (
    /* Stands on the stage slabs (top at 0.1), which stay drawn, dimmed, on
       these beats. At 0.05 every bar was planted halfway into a slab. */
    <group ref={group} position={[0, 0.1, 0]}>
      {WALL.map((p, i) => {
        const h = p.power * 1.5
        const over = p.power > WALL_LIMIT
        return (
          <mesh
            key={p.ghz}
            position={[(i / (WALL.length - 1) - 0.5) * span, h / 2, 0]}
            userData={{ over }}
            castShadow
            receiveShadow
            geometry={roundedBox(0.52, h, 0.52, 0.04)}
            {...named(over ? 'pipeline:overbudget' : 'pipeline:bar')}
          >
            <meshPhysicalMaterial
              color={over ? '#3a1420' : '#12202c'}
              emissive={over ? '#ff7a92' : '#4fd8ff'}
              emissiveIntensity={0.35}
              roughness={0.34}
              metalness={0.35}
              clearcoat={0.55}
              clearcoatRoughness={0.18}
            />
          </mesh>
        )
      })}
      {/* Where the cooling runs out. Everything above this line is a processor
          nobody can ship. */}
      <mesh position={[0, WALL_LIMIT * 1.5, 0]} geometry={roundedBox(span + 0.9, 0.03, 0.03, 0.012)} {...named('pipeline:limit')}>
        <meshStandardMaterial color="#3a1420" emissive="#ff7a92" emissiveIntensity={1.4} />
      </mesh>
    </group>
  )
}
