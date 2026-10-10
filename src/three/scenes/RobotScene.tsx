import { useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { useNamer } from '../naming'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { damp } from '../../lib/math'
import { benchMap, kernelFloor, roundedBox, tiled } from '../surfaces'
import {
  C,
  DEADLINE,
  FAST_R,
  LAPS,
  SLOW_R,
  armAngle,
  fastPhase,
  missedAt,
  slowPhase,
  workAt,
} from './robotLayout'

/**
 * Two loops, at genuinely different speeds, in one frame.
 *
 * The contrast only works if both are visible together — shown separately they
 * are two circles going round. Side by side, the fast loop laps the slow one
 * repeatedly and the reader gets the ratio without being told it.
 */
export function RobotScene() {
  return (
    <Part
      id="robot"
      tags={['fast', 'slow', 'contrast', 'split', 'unified', 'deadline', 'miss', 'predictable']}
      position={[0, 0, 0]}
    >
      <Shadow />
      <Bench />
      <Loop kind="slow" />
      <Loop kind="fast" />
      <Deadline />
      <Arm />
    </Part>
  )
}

/*
 * The bench: the same black anodised board and grid pitch as every bench in
 * the course, round like the kernel's, with its top at y = 0. It reaches just
 * past the perception loop's ticks, the outermost thing in the scene.
 */
const BENCH_R = 2.8
const BENCH_H = 0.12
/** Inside the control loop, an inlay the arm stands on, turned rather than grained. */
const INLAY_R = FAST_R - 0.22
/** Each loop runs in a machined track this wide, inlaid in the bench. */
const TRACK_W = 0.16

function Bench() {
  const named = useNamer('robot')
  const map = useMemo(() => tiled(benchMap(), (BENCH_R * 2) / 0.5, (BENCH_R * 2) / 0.5), [])
  return (
    <group>
      <mesh position={[0, -BENCH_H / 2, 0]} receiveShadow {...named('robot:bench')}>
        <cylinderGeometry args={[BENCH_R, BENCH_R, BENCH_H, 144]} />
        <meshStandardMaterial color="#ffffff" map={map} roughness={0.62} metalness={0.35} />
      </mesh>
      {/* A rounded rim, so the edge of the bench catches a line of light. */}
      <mesh position={[0, -0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[BENCH_R - 0.012, 0.012, 8, 180]} />
        <meshStandardMaterial color="#0c1119" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* The controller's own ground, inside its loop: a turned steel inlay,
          so the inner machine visibly stands on different ground from the
          outer one before anything lights. Never lit. */}
      <mesh position={[0, 0.002, 0]} receiveShadow>
        <cylinderGeometry args={[INLAY_R + 0.02, INLAY_R + 0.02, 0.004, 96]} />
        <meshStandardMaterial color="#141a22" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.0045, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[INLAY_R, 96]} />
        <meshStandardMaterial color="#2a3440" map={kernelFloor()} roughness={0.36} metalness={0.8} />
      </mesh>

      <Ticks />
    </group>
  )
}

/**
 * The ratio, engraved.
 *
 * One tick on the perception loop per lap of the control loop, and one at the
 * top of the control loop where every lap begins. Both runners start together
 * at the top, so each time the slow one crosses a tick the fast one is back at
 * its own — the eight-to-one is on the bench, not only in the copy. Dull steel,
 * never lit: the runners say when a lap happens.
 */
function Ticks() {
  const ticks = useMemo(
    () => [
      ...Array.from({ length: LAPS }, (_, k) => ({ a: -Math.PI / 2 + (k / LAPS) * Math.PI * 2, r: SLOW_R + TRACK_W / 2 + 0.12, len: 0.2 })),
      { a: -Math.PI / 2, r: FAST_R + TRACK_W / 2 + 0.09, len: 0.14 },
    ],
    [],
  )
  return (
    <group>
      {ticks.map((k, i) => (
        <mesh
          key={i}
          position={[Math.cos(k.a) * k.r, 0.01, Math.sin(k.a) * k.r]}
          rotation={[0, -k.a, 0]}
          receiveShadow
          geometry={roundedBox(k.len, 0.02, 0.04, 0.006)}
        >
          <meshStandardMaterial color="#6a7c90" roughness={0.22} metalness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * A soft shadow under the bench, so it rests on something without a floor
 * appearing. The course's contact shadow is keyed per scene in `Scene.tsx`;
 * this is the same idea, painted once, local to this lecture.
 */
function Shadow() {
  const map = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(0,2,8,0.8)')
    g.addColorStop(0.62, 'rgba(0,2,8,0.62)')
    g.addColorStop(0.8, 'rgba(0,2,8,0.22)')
    g.addColorStop(1, 'rgba(0,2,8,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
  const size = BENCH_R * 2 * 1.3
  return (
    <mesh position={[0, -BENCH_H - 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial color="#ffffff" map={map} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/** One loop: a ring in its track, and a runner going round it. */
function Loop({ kind }: { kind: 'fast' | 'slow' }) {
  const named = useNamer('robot')
  const runner = useRef<THREE.Mesh>(null!)
  const ring = useRef<THREE.Mesh>(null!)
  const fast = kind === 'fast'
  const r = fast ? FAST_R : SLOW_R
  const size = fast ? 0.13 : 0.17
  /* High enough that the fast runner clears the deadline mark it passes over
     every lap; it used to run straight through it. The slow one has nothing to
     clear, so it rides just over its own track. */
  const height = fast ? 0.26 : size + 0.03

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.motion ?? ''
    const t = state.clock.elapsedTime
    const p = fast ? fastPhase(t) : slowPhase(t)
    const a = -Math.PI / 2 + p * Math.PI * 2
    runner.current.position.set(Math.cos(a) * r, height, Math.sin(a) * r)

    // Each loop is emphasised on the beat that is about it, so the reader knows
    // which circle to watch without a callout doing the work.
    const mine = fast
      ? ['fast', 'contrast', 'deadline', 'miss', 'predictable'].includes(focus)
      : ['slow', 'contrast', 'split', 'unified'].includes(focus)
    const mat = runner.current.material as THREE.MeshStandardMaterial
    const rmat = ring.current.material as THREE.MeshStandardMaterial
    setEmissive(mat, mine ? 2.2 : 0.6)
    setEmissive(rmat, mine ? 0.7 : 0.2)
  })

  return (
    <group>
      {/* The track: a dark machined groove the lit ring is inlaid in. */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[r - TRACK_W / 2, r + TRACK_W / 2, 160]} />
        <meshStandardMaterial color="#141a22" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Its two lips, bright machined edges that catch a line of light. */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, 0.004, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r + side * (TRACK_W / 2), 0.006, 6, 180]} />
          <meshStandardMaterial color="#3a4654" roughness={0.26} metalness={0.95} />
        </mesh>
      ))}
      <mesh
        ref={ring}
        position={[0, 0.006, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        {...named(fast ? 'robot:control' : 'robot:perception')}
      >
        <ringGeometry args={[r - 0.03, r + 0.03, 160]} />
        <meshStandardMaterial
          color="#131c26"
          emissive={fast ? C.fast : C.slow}
          emissiveIntensity={0.3}
          roughness={0.35}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={runner} castShadow {...named(fast ? 'robot:controlwork' : 'robot:perceptionwork')}>
        <sphereGeometry args={[size, 32, 24]} />
        <meshPhysicalMaterial
          color="#0e1c26"
          emissive={fast ? C.fast : C.slow}
          emissiveIntensity={1.4}
          roughness={0.3}
          metalness={0.3}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
        />
      </mesh>
    </group>
  )
}

/**
 * The deadline on the control loop, and the work racing it.
 *
 * The arc that fills is the work; the mark is when it must be done. On a normal
 * pass the arc stops well short and waits. On a late pass it is still growing
 * when it passes the mark, and it turns red there — the moment of failure,
 * rather than a summary of it.
 */
/** Segments in the deadline arc. Its index buffer is 6 per segment. */
const ARC_SEGMENTS = 96
/** The work arc's band, inside the control loop's track. */
const ARC_IN = FAST_R - 0.16
const ARC_OUT = FAST_R - 0.07
/** The deadline mark: a machined stop across the work's track. */
const MARK = { w: 0.05, h: 0.12, d: 0.26 }

function Deadline() {
  const named = useNamer('robot')
  const group = useRef<THREE.Group>(null!)
  const arc = useRef<THREE.Mesh>(null!)
  const mark = useRef<THREE.Mesh>(null!)
  const shown = useRef(0)

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.motion ?? ''
    const on = ['deadline', 'miss', 'predictable'].includes(focus)
    shown.current = damp(shown.current, on ? 1 : 0, 4, dt)
    group.current.visible = shown.current > 0.02
    group.current.scale.setScalar(Math.max(shown.current, 0.0001))

    const t = state.clock.elapsedTime
    /* Overruns belong to the `miss` beat only.
       `predictable` is the beat arguing that this design has given up
       everything that produces variance — "far slower than it could be, and
       that is the point" — and it was sharing the overrun, so it kept missing
       one pass in five underneath a claim that it never misses. */
    const w = workAt(t, focus === 'miss')
    /* The arc's length is the measurement, so it changes every frame — but it
       is drawn by *revealing* a ring that already exists rather than by
       building a new one. This used to dispose and reallocate a RingGeometry at
       60 Hz, which is precisely the per-frame garbage `Flow`'s header was
       written to warn about, and it showed up as periodic stutter. */
    const arcs = Math.round(w.progress * ARC_SEGMENTS)
    arc.current.geometry.setDrawRange(0, Math.max(1, arcs) * 6)
    const mat = arc.current.material as THREE.MeshStandardMaterial
    mat.emissive.copy(w.late ? C.miss : C.deadline)
    setEmissive(mat, w.late ? 2.4 : 1.0)

    const mm = mark.current.material as THREE.MeshStandardMaterial
    setEmissive(mm, w.late ? 2.6 : 1.2)
    mm.emissive.copy(w.late ? C.miss : C.deadline)
  })

  const da = -Math.PI / 2 + DEADLINE * Math.PI * 2
  const mr = (ARC_IN + ARC_OUT) / 2

  return (
    <group ref={group}>
      {/* The whole period, as an empty track the work fills. What is left of
          it past the arc is the margin — the idle the copy calls the safety —
          and a bare groove makes that space something you can see. */}
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[ARC_IN - 0.02, ARC_OUT + 0.02, 160]} />
        <meshStandardMaterial color="#10161d" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh ref={arc} position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} {...named('robot:work')}>
        {/* The whole arc, allocated once. How much of it is visible is set by
            the draw range each frame. */}
        <ringGeometry args={[ARC_IN, ARC_OUT, ARC_SEGMENTS, 1, -Math.PI / 2, Math.PI * 2 * DEADLINE]} />
        <meshStandardMaterial
          color="#132318"
          emissive={C.deadline}
          emissiveIntensity={1}
          roughness={0.35}
          metalness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* The mark stands on a steel foot across the track, like a stop on a
          rail, so it reads as a place rather than a painted line. */}
      <group position={[Math.cos(da) * mr, 0, Math.sin(da) * mr]} rotation={[0, -da, 0]}>
        <mesh position={[0, 0.006, 0]} receiveShadow geometry={roundedBox(MARK.w + 0.06, 0.012, MARK.d + 0.04, 0.004)}>
          <meshStandardMaterial color="#3a4654" roughness={0.26} metalness={0.95} />
        </mesh>
        <mesh
          ref={mark}
          position={[0, MARK.h / 2, 0]}
          castShadow
          geometry={roundedBox(MARK.w, MARK.h, MARK.d, 0.012)}
          {...named('robot:deadline')}
        >
          <meshStandardMaterial color="#132318" emissive={C.deadline} emissiveIntensity={1.2} roughness={0.35} metalness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

/*
 * The arm: a bolted base, a turret that turns, a shoulder, one link and a
 * gripper at its end pointing down at the bench. Dimensions are what keep it
 * clear of the loops — the gripper stops short of the work arc, and the link
 * of the control loop's runner, which passes at the same height once a lap.
 */
const PIVOT_Y = 0.24
const LINK = { x: 0.47, len: 0.78, h: 0.14, d: 0.18 }
const WRIST_X = 0.74
const BASE_R = 0.34

/** The turret's profile, turned: a flared foot, a waist, a chamfered crown. */
function turretGeometry() {
  const pts = [
    [0, -0.15],
    [0.24, -0.15],
    [0.245, -0.13],
    [0.225, -0.1],
    [0.205, 0.1],
    [0.2, 0.125],
    [0.175, 0.15],
    [0, 0.15],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  return new THREE.LatheGeometry(pts, 48)
}

/**
 * The thing that actually moves.
 *
 * Present on every beat, because it is the reason any of this matters. When the
 * control loop is late the correction arrives after the world has moved, and
 * the arm overshoots — which is what a missed deadline looks like from outside:
 * not a dropped frame, a thing in the wrong place.
 */
function Arm() {
  const named = useNamer('robot')
  const pivot = useRef<THREE.Group>(null!)
  const limb = useRef<THREE.Mesh>(null!)
  const angle = useRef(0)
  const turret = useMemo(turretGeometry, [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.motion ?? ''
    const t = state.clock.elapsedTime
    const enabled = focus === 'miss'
    const want = armAngle(t, enabled)
    // Damped, because it is a physical thing with mass — the overshoot has to
    // look like something that could not stop in time.
    angle.current = damp(angle.current, want, 9, dt)
    pivot.current.rotation.y = angle.current

    const mat = limb.current.material as THREE.MeshStandardMaterial
    const late = missedAt(t, enabled) && fastPhase(t) > DEADLINE
    mat.emissive.copy(late ? C.miss : C.arm)
    setEmissive(mat, late ? 1.8 : 0.4)
  })

  return (
    <group>
      {/* The base does not turn: a flange bolted to the inlay, and a pedestal. */}
      <group>
        <mesh position={[0, 0.025, 0]} castShadow receiveShadow {...named('robot:joint')}>
          <cylinderGeometry args={[BASE_R, BASE_R + 0.01, 0.04, 64]} />
          <meshStandardMaterial color="#232a33" roughness={0.3} metalness={0.9} />
        </mesh>
        {Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2 + Math.PI / 8
          return (
            <mesh key={k} position={[Math.cos(a) * (BASE_R - 0.05), 0.051, Math.sin(a) * (BASE_R - 0.05)]}>
              <cylinderGeometry args={[0.018, 0.018, 0.012, 12]} />
              <meshStandardMaterial color="#3a4654" roughness={0.26} metalness={0.95} />
            </mesh>
          )
        })}
        <mesh position={[0, 0.07, 0]} castShadow {...named('robot:joint')}>
          <cylinderGeometry args={[0.26, 0.28, 0.05, 64]} />
          <meshStandardMaterial color="#1c232c" roughness={0.34} metalness={0.85} />
        </mesh>
      </group>

      <group ref={pivot} position={[0, PIVOT_Y, 0]}>
        {/* The turret, and a cap on its crown. */}
        <mesh geometry={turret} castShadow receiveShadow {...named('robot:joint')}>
          <meshPhysicalMaterial
            color="#1a222c"
            emissive={C.arm}
            emissiveIntensity={0.3}
            roughness={0.34}
            metalness={0.55}
            clearcoat={0.5}
            clearcoatRoughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.156, 0]} {...named('robot:joint')}>
          <cylinderGeometry args={[0.13, 0.15, 0.012, 48]} />
          {/* Satin, not mirror: a polished disc here reflected the black sky
              and read as a hole bored down the turret. */}
          <meshStandardMaterial color="#1a222c" emissive={C.arm} emissiveIntensity={0.3} roughness={0.45} metalness={0.55} />
        </mesh>
        {/* The shoulder: a boss across the link's root, on the axis it would
            pitch about. */}
        <mesh position={[0.14, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow {...named('robot:joint')}>
          <cylinderGeometry args={[0.1, 0.1, 0.24, 32]} />
          <meshStandardMaterial color="#232a33" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* The link stops short of the control loop's ring: at full length its
            tip sat on the ring and the runner went through it once a lap. */}
        <mesh
          ref={limb}
          position={[LINK.x, 0, 0]}
          castShadow
          receiveShadow
          geometry={roundedBox(LINK.len, LINK.h, LINK.d, 0.04)}
          {...named('robot:arm')}
        >
          <meshPhysicalMaterial
            color="#1a222c"
            emissive={C.arm}
            emissiveIntensity={0.4}
            roughness={0.32}
            metalness={0.5}
            clearcoat={0.6}
            clearcoatRoughness={0.15}
          />
        </mesh>

        {/* The wrist and gripper, hanging from the end of the link toward the
            bench: this is what would be in the wrong place. */}
        <group position={[WRIST_X, 0, 0]}>
          <mesh position={[0, -0.1, 0]} castShadow {...named('robot:arm')}>
            <cylinderGeometry args={[0.07, 0.07, 0.1, 32]} />
            <meshStandardMaterial color="#232a33" roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[0, -0.155, 0]} castShadow geometry={roundedBox(0.1, 0.02, 0.16, 0.006)} {...named('robot:arm')}>
            <meshStandardMaterial color="#3a4654" roughness={0.26} metalness={0.95} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[0, -0.195, side * 0.055]}
              castShadow
              geometry={roundedBox(0.05, 0.07, 0.02, 0.006)}
              {...named('robot:arm')}
            >
              <meshStandardMaterial color="#3a4654" roughness={0.26} metalness={0.95} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}
