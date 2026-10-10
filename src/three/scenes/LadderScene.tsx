import { useCallback, useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { useNamer } from '../naming'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { publishReadout } from '../readout'
import { Flow, type Packet } from '../motion/Flow'
import { sampleLane } from '../motion/lanes'
import { cacheTop, coreFloorplan, dramTop, flashTop, registerFile, roundedBox, topFaced } from '../surfaces'
import { damp } from '../../lib/math'
import {
  CORE_X,
  targetFor,
  tripAt,
  LADDER_PACKETS,
  TIERS,
  TIER_ENTRIES,
  TIER_LANES,
  TRIP_SPEED,
  tierHeight,
  tierSize,
  tierDepth,
  tierX,
} from './ladderLayout'

/**
 * The memory hierarchy, where distance on screen is latency.
 *
 * This is the one scene in the course whose animation *is* a number rather than
 * an illustration of one: a packet leaves the core at constant speed and the
 * trip simply takes longer for tiers that are further away. Everything else
 * here — block size, the stack, the second core — is arranged around keeping
 * that one reading honest.
 */
export function LadderScene() {
  return (
    <Part id="ladder" tags={[...TIERS.map((t) => t.id), 'ladder', 'hbm', 'unified', 'wear']} position={[0, 0, 0]}>
      <Rail />
      <Core />
      <SecondCore />
      {TIERS.map((tier) => (
        <TierBlock key={tier.id} id={tier.id} />
      ))}
      <Traffic />
    </Part>
  )
}

/**
 * Every tenfold step of latency, from 1 ns to 10 µs.
 *
 * On a log axis these are evenly spaced, and that even spacing is what "log"
 * means: each step right is ten times longer, not a fixed amount longer. The
 * tier ticks bunch and spread because the tiers do; these do not, so the two
 * together show the axis and the ladder on it as separate things.
 */
const DECADES = [1, 10, 100, 1000, 10000]

/** The axis itself, so the log spacing is visible as a thing, not just implied. */
function Rail() {
  const start = CORE_X
  const end = tierX(TIERS[TIERS.length - 1].ns) + 0.6
  return (
    <group>
      {/* A machined track rather than a hairline, so the road the request
          walks is an object in the scene with a length you can see. */}
      <mesh position={[(start + end) / 2, 0.006, 0]} receiveShadow geometry={roundedBox(end - start, 0.012, 0.05, 0.005, 2)}>
        <meshStandardMaterial color="#1d2a38" emissive="#3f5a72" emissiveIntensity={0.5} roughness={0.3} metalness={0.8} />
      </mesh>
      {DECADES.map((ns) => (
        <mesh key={ns} position={[tierX(ns), 0.006, 0]} geometry={roundedBox(0.012, 0.012, 0.16, 0.004, 2)}>
          <meshStandardMaterial color="#1d2a38" emissive="#3f5a72" emissiveIntensity={0.45} roughness={0.35} metalness={0.8} />
        </mesh>
      ))}
      {/* Tick under each tier: this axis is not linear, and the ticks bunching
          toward the left is what says so. */}
      {TIERS.map((t) => (
        <mesh key={t.id} position={[tierX(t.ns), 0.008, 0]} geometry={roundedBox(0.02, 0.016, 0.34, 0.006, 2)}>
          <meshStandardMaterial color="#2a3a4a" emissive="#5f7d96" emissiveIntensity={0.8} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * A processor package: a dark ceramic body with the die on top, whose own
 * floorplan is what lights when the core is working.
 *
 * Shared by both cores, so the second core on the unified beat is visibly the
 * same kind of thing as the first, differing only in its colour.
 */
function Package({ die, glow, base, intensity }: { die?: React.Ref<THREE.Mesh>; glow: string; base: string; intensity: number }) {
  return (
    <>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow geometry={roundedBox(0.62, 0.32, 0.62, 0.05)}>
        <meshPhysicalMaterial color="#12171f" roughness={0.42} metalness={0.4} clearcoat={0.5} clearcoatRoughness={0.25} />
      </mesh>
      {/* A seat for the die: the lid's raised centre, in lapped metal. */}
      <mesh position={[0, 0.325, 0]} geometry={roundedBox(0.48, 0.012, 0.48, 0.004, 2)}>
        <meshStandardMaterial color="#8e97a4" roughness={0.35} metalness={0.95} />
      </mesh>
      <mesh ref={die} position={[0, 0.34, 0]} geometry={roundedBox(0.4, 0.022, 0.4, 0.006, 2)}>
        <meshStandardMaterial
          color={base}
          map={coreFloorplan()}
          emissive={glow}
          emissiveMap={coreFloorplan()}
          emissiveIntensity={intensity}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </>
  )
}

function Core() {
  const die = useRef<THREE.Mesh>(null!)
  const named = useNamer('ladder')

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const t = state.clock.elapsedTime

    /* Lit only while it has something to work on.
       This replaced a free-running pulse that said nothing. A core that has
       issued a load and is waiting for it is doing *nothing at all*, and the
       further away the answer is the longer it does nothing — so on the L1 beat
       this is bright most of the time and on the storage beat it is dark almost
       always. That contrast is the lecture, and a heartbeat was actively
       arguing the opposite: that the core is busy throughout. */
    const { tier, local } = targetFor(d.motion ?? 'ladder', t)
    const trip = tripAt(tier, local)
    setEmissive(die.current.material as THREE.MeshStandardMaterial, trip.arrived ? 1.5 : 0.1)

    /* Names the tier the request is currently visiting, and what that walk
       really costs. `latencyText` has been on every tier since the scene was
       written and only ever reached the reader through hand-copied labels — so
       on the overview beat, where the target changes every few seconds, nothing
       on screen said which level was answering. */
    publishReadout('ladder', d.scene, [
      { label: 'Asking', value: tier.label, key: true },
      { label: 'Real latency', value: tier.latencyText },
      { label: 'Core', value: trip.arrived ? 'working' : 'waiting' },
    ])
  })

  return (
    <group position={[CORE_X, 0, 0]} {...named('ladder:core')}>
      <Package die={die} base="#0d2b3a" glow="#3ad8ff" intensity={0.6} />
    </group>
  )
}

/**
 * The second core, for the unified-memory beat.
 *
 * Slides in on the far side of main memory rather than being toggled, because
 * the point of that beat is a step being *deleted* — and a thing appearing by
 * moving into place reads as an arrangement changing, where a hard cut reads as
 * a different diagram.
 */
function SecondCore() {
  const group = useRef<THREE.Group>(null!)
  const shown = useRef(0)
  const named = useNamer('ladder')

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    shown.current = damp(shown.current, d.focus === 'unified' ? 1 : 0, 5, dt)
    group.current.scale.setScalar(Math.max(shown.current, 0.0001))
    // Hidden entirely rather than merely scaled away, so it stops contributing
    // its position to the scene's bounds while it is not part of the argument.
    group.current.visible = shown.current > 0.02
    group.current.position.z = shown.current > 0.02 ? 1.15 - shown.current * 0.3 : 0
  })

  return (
    <group ref={group} position={[tierX(TIERS[4].ns), 0, 1.15]} {...named('ladder:gpu')}>
      <Package base="#2b1a3a" glow="#c08bff" intensity={1.4} />
    </group>
  )
}

/**
 * One tier.
 *
 * Two behaviours ride on top of the static block. On the HBM beat, main memory
 * grows a stack *where it stands*, and the request to it goes out as a much
 * wider burst. It used to walk toward the core, which on an axis where position
 * is latency claimed that stacked memory answers sooner — it does not (HBM's
 * idle latency is, if anything, a little higher than DDR5's). What stacking
 * buys is width: short wires make a 1024-bit bus possible. On the wear beat,
 * storage loses cells permanently.
 */
const FACE: Record<string, () => THREE.Texture> = {
  registers: registerFile,
  l1: cacheTop,
  l2: cacheTop,
  l3: cacheTop,
  ram: dramTop,
  ssd: flashTop,
}

function TierBlock({ id }: { id: string }) {
  const tier = TIERS.find((t) => t.id === id)!
  const group = useRef<THREE.Group>(null!)
  const slab = useRef<THREE.Mesh>(null!)
  const stack = useRef<THREE.Group>(null!)
  const x = useRef(tierX(tier.ns))
  const lift = useRef(0)
  const dead = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const named = useNamer('ladder')
  const size = tierSize(tier.cap)
  const depth = tierDepth(tier.cap)
  const height = tierHeight(tier.cap)
  const isRam = id === 'ram'
  const isSsd = id === 'ssd'

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const t = state.clock.elapsedTime

    // HBM: main memory stacks upward in place. It does not move along the
    // axis, because its latency does not fall.
    const near = isRam && d.focus === 'hbm'
    x.current = damp(x.current, tierX(tier.ns), 3.2, dt)
    group.current.position.x = x.current
    lift.current = damp(lift.current, near ? 1 : 0, 3.2, dt)
    if (stack.current) {
      stack.current.scale.setScalar(Math.max(lift.current, 0.0001))
      stack.current.visible = lift.current > 0.02
    }
    if (slab.current) slab.current.scale.y = 1 - lift.current * 0.55

    /* A tier lights when the request reaches it, not on a timer. The point of a
       hierarchy is that only one level is answering at a time. */
    const { tier: target, local } = targetFor(d.motion ?? 'ladder', t)
    const trip = tripAt(target, local)
    const visited = target.id === id && trip.u > 0.9
    const subject = d.focus === id || (isRam && d.focus === 'hbm')
    const mat = slab.current?.material as THREE.MeshStandardMaterial
    if (mat) setEmissive(mat, visited ? 1.2 : subject ? 0.42 : 0.16)

    /* Wear: flash cells die permanently, and the count only ever goes up.
       It used to be `(t % 24) / 24`, which un-wore the drive every twenty-four
       seconds underneath copy reading "permanently, unlike everything else in
       this lecture" and "the dark squares are gone for good". Attrition that
       resets is not attrition. Run from beat time and clamped, it now only
       increases, and restarts only when the reader re-enters the beat. */
    if (isSsd && dead.current) {
      const worn = d.motion === 'wear' ? Math.min(0.55, d.beatTime / 14) : 0
      for (let i = 0; i < 64; i++) {
        const gone = (i * 2654435761) % 1000 < worn * 1000
        const col = i % 8
        const row = Math.floor(i / 8)
        dummy.position.set((col / 7 - 0.5) * size * 0.8, height + 0.02, (row / 7 - 0.5) * depth * 0.8)
        dummy.scale.setScalar(gone ? size * 0.055 : 0.0001)
        dummy.updateMatrix()
        dead.current.setMatrixAt(i, dummy.matrix)
      }
      dead.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={group} position={[tierX(tier.ns), 0, 0]}>
      {/* Each tier shows on its face what it physically is — a register
          file, an SRAM array, a module of DRAM chips, a grid of flash blocks —
          so the ladder reads as six kinds of storage rather than six boxes in
          six colours. The block's size is still its capacity and its place on
          the axis still its latency; only the surface changed. */}
      <mesh
        ref={slab}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        geometry={topFaced(size, height, depth, Math.min(0.035, size * 0.12))}
        {...named(`ladder:${tier.id}`, TIER_ENTRIES[tier.id])}
      >
        <meshPhysicalMaterial
          color="#141a24"
          emissive={tier.color}
          emissiveMap={FACE[tier.id]?.()}
          emissiveIntensity={0.25}
          roughness={0.36}
          metalness={0.4}
          clearcoat={0.45}
          clearcoatRoughness={0.22}
        />
      </mesh>

      {isRam && (
        // Stacked dies, appearing only when the chapter is about stacking them.
        <group ref={stack} position={[0, height * 0.5, 0]} {...named('ladder:stack')}>
          {[0, 1, 2, 3].map((k) => (
            <mesh
              key={k}
              position={[0, 0.12 + k * 0.13, 0]}
              castShadow
              receiveShadow
              geometry={topFaced(size * 0.72, 0.09, depth * 0.72, 0.02)}
            >
              <meshPhysicalMaterial
                color="#1b1430"
                emissive="#c08bff"
                emissiveMap={dramTop()}
                emissiveIntensity={0.9}
                roughness={0.3}
                metalness={0.45}
                clearcoat={0.5}
                clearcoatRoughness={0.2}
              />
            </mesh>
          ))}
        </group>
      )}

      {isSsd && (
        <instancedMesh ref={dead} args={[undefined, undefined, 64]} {...named('ladder:wear')}>
          <boxGeometry args={[1, 0.02, 1]} />
          <meshBasicMaterial color="#3a1420" />
        </instancedMesh>
      )}
    </group>
  )
}

const HUES = [
  new THREE.Color('#7fe9ff'), // the request going out
  new THREE.Color('#ffc46b'), // the answer coming back
  new THREE.Color('#c08bff'), // second core, unified memory
]

/**
 * The round trip.
 *
 * One request at a time, deliberately. A continuous stream would average away
 * exactly what the beat is about — that a single access to storage takes
 * visibly, uncomfortably longer than a single access to L1.
 */
function Traffic() {
  const at = useCallback((i: number, t: number, out: Packet): Packet => {
    const d = updateDriver(t)
    const focus = d.motion ?? 'ladder'

    /* On the overview beat the request walks out to a different tier each pass,
       so the whole ladder is seen without having to step through it.
       This used to inline its own copy of the tier selection — the exact thing
       `targetFor` exists to prevent — and that copy still had the flat five
       second dwell after the shared one was fixed. Storage needs 5.44 s to go
       and return, so the request was cut off short and the packet jumped to a
       new tier mid-flight, on the one beat that asks the reader to watch a
       single request travel out and come back. */
    const { tier: target, local } = targetFor(focus, t)
    const span = Math.abs(tierX(target.ns) - CORE_X)
    const trip = (2 * span) / TRIP_SPEED

    /* Half the packets are the first core's request, the other half are the
       second core's — and the second half only exists on the unified beat.
       Everything else is parked. */
    const secondCore = focus === 'unified' && i >= LADDER_PACKETS / 2
    const slot = i % 10
    /* Stacked memory: the same trip, far wider. Every packet goes, abreast
       rather than strung out, because the thing HBM buys is bus width — many
       values arriving per trip — not a shorter one. */
    const wide = focus === 'hbm'
    if (wide) {
      const phase = (local % trip) / trip
      const u = phase < 0.5 ? phase * 2 : 1 - (phase - 0.5) * 2
      const [x] = sampleLane(TIER_LANES[target.id], u)
      out.on = true
      out.x = x
      out.y = 0.42
      out.z = (i / (LADDER_PACKETS - 1) - 0.5) * 0.9
      out.hue = phase < 0.5 ? 0 : 1
      out.scale = 0.045
      out.bright = 2.2
      return out
    }
    if (slot >= 4 || (i >= LADDER_PACKETS / 2 && !secondCore)) {
      out.on = false
      return out
    }

    // Staggered so a request reads as a burst of data, not a single dot.
    const phase = ((local + slot * 0.06) % trip) / trip
    const outbound = phase < 0.5
    const u = outbound ? phase * 2 : 1 - (phase - 0.5) * 2

    if (secondCore) {
      /* Straight down the z axis into the same pool. No staging hop, because
         there is no copy to make — which is the entire point of the beat. */
      out.on = true
      out.x = tierX(TIERS[4].ns)
      out.y = 0.42
      out.z = 0.85 * (1 - u)
      out.hue = 2
    } else {
      const [x] = sampleLane(TIER_LANES[target.id], u)
      out.on = true
      out.x = x
      out.y = 0.42
      out.z = 0
      out.hue = outbound ? 0 : 1
    }
    out.scale = 0.06
    out.bright = 2.2
    return out
  }, [])

  return <Flow count={LADDER_PACKETS} at={at} hues={HUES} />
}
