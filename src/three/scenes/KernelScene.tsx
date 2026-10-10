import { useCallback, useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { useNamer } from '../naming'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { publishReadout } from '../readout'
import { Flow, type Packet } from '../motion/Flow'
import { laneGeometry, laneLength, sampleLane, type Lane } from '../motion/lanes'
import { damp } from '../../lib/math'
import {
  benchMap,
  hexFaced,
  kernelCoreTop,
  kernelDriverTop,
  kernelFloor,
  kernelFsTop,
  kernelNetTop,
  kernelProgramTop,
  roundedBox,
  tiled,
  topFaced,
} from '../surfaces'
import {
  CORE_R,
  DEADLINE,
  MICRO_CHECKS,
  MICRO_LANES,
  DEADLINE_R,
  SERVICE_BOUNDARY_R,
  RT_PERIOD,
  SERVICES,
  SERVICE_COLOR,
  servicePos,
  PROCESSES,
  P_COLOR,
  REFUSED,
  REQUEST_LANES,
  SLICE,
  WALL_R,
  angleOf,
  gatePos,
  holderAt,
  processPos,
  requestU,
  requestPeriod,
  walkRequest,
  GATE_AT,
} from './kernelLayout'

/**
 * The first scene in the course with nothing physical to show.
 *
 * Its grammar is containment rather than teardown: an inside, an outside, a
 * wall that is enforced rather than agreed, and one thing at the centre that
 * only one program can hold. Everything the lecture says is a consequence of
 * that arrangement, so the arrangement is the scene.
 */
export function KernelScene() {
  return (
    <Part
      id="kernel"
      tags={[
        'user', 'wall', 'syscall', 'refuse', 'schedule', 'preempt', 'fair', 'mmu', 'isolation',
        'monolith', 'micro', 'trade', 'families', 'posix', 'rtos', 'hard', 'embedded',
      ]}
      position={[0, 0, 0]}
    >
      <Bench />
      <Floor />
      <Wall />
      <Core />
      <Processes />
      <Services />
      <Deadline />
      <Requests />
      <Readouts />
    </Part>
  )
}

/*
 * The bench is user space: the same black anodised board and grid pitch as the
 * logic, pipeline and boot chapters, round, with its top at y = 0 where the
 * programs stand. It reaches just past the real-time track, the outermost
 * thing in either lecture.
 */
const BENCH_R = 4.05
const BENCH_H = 0.12
/** Where each program stands: a machined pad, just proud of the bench. */
const PAD = { w: 0.62, d: 0.82, h: 0.008 }
/** Kernel space is an inlay, standing this far proud of the bench. */
const FLOOR_Y = 0.004

/**
 * User space: the bench everything outside the wall stands on.
 *
 * Unnamed on purpose. It is the ground, and the nearest hit wins — naming it
 * would answer "user space" under every program, gate and packet.
 */
function Bench() {
  const map = useMemo(() => tiled(benchMap(), (BENCH_R * 2) / 0.5, (BENCH_R * 2) / 0.5), [])
  return (
    <group>
      <mesh position={[0, -BENCH_H / 2, 0]} receiveShadow>
        <cylinderGeometry args={[BENCH_R, BENCH_R, BENCH_H, 128]} />
        <meshStandardMaterial color="#ffffff" map={map} roughness={0.62} metalness={0.35} />
      </mesh>
      {/* A rounded rim, so the edge of the bench catches a line of light. */}
      <mesh position={[0, -0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[BENCH_R - 0.012, 0.012, 8, 160]} />
        <meshStandardMaterial color="#0c1119" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* A machined pad under every program: its place outside the wall. */}
      {Array.from({ length: PROCESSES }, (_, i) => {
        const [x, z] = processPos(i)
        return (
          <mesh
            key={i}
            position={[x, PAD.h / 2, z]}
            rotation={[0, -angleOf(i), 0]}
            receiveShadow
            geometry={roundedBox(PAD.w, PAD.h, PAD.d, 0.004)}
          >
            <meshStandardMaterial color="#1c232c" roughness={0.34} metalness={0.85} />
          </mesh>
        )
      })}

      <Tracks />
    </group>
  )
}

/**
 * The road every request travels, routed into the bench: program to gate to
 * core. Dull steel, inlaid rather than drawn, and never lit — the packets say
 * when the road is in use.
 */
function Tracks() {
  const pieces = useMemo(() => trackPieces(REQUEST_LANES), [])
  return (
    <group>
      {pieces.map((p, k) => (
        <mesh
          key={k}
          position={[p.x, p.y, p.z]}
          rotation={[0, p.angle, 0]}
          receiveShadow
          geometry={roundedBox(p.length, 0.006, 0.05, 0.002)}
        >
          <meshStandardMaterial color="#35475a" roughness={0.42} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/** One flat strip per lane segment, laid on whichever surface it crosses. */
function trackPieces(lanes: Lane[]) {
  const out: { x: number; y: number; z: number; angle: number; length: number }[] = []
  for (const lane of lanes) {
    for (let k = 0; k + 1 < lane.length; k++) {
      const [ax, az] = lane[k]
      const [bx, bz] = lane[k + 1]
      const length = Math.hypot(bx - ax, bz - az)
      // Inside the wall the strip lies on the kernel inlay, not the bench.
      const inside = Math.hypot((ax + bx) / 2, (az + bz) / 2) < WALL_R
      out.push({
        x: (ax + bx) / 2,
        y: (inside ? FLOOR_Y : 0) + 0.003,
        z: (az + bz) / 2,
        angle: -Math.atan2(bz - az, bx - ax),
        length,
      })
    }
  }
  return out
}

/**
 * Kernel space: the ground inside the wall.
 *
 * An inlay in the bench, turned rather than grained, so the inside is visibly
 * a different surface from the outside before anything on it lights.
 */
function Floor() {
  const mesh = useRef<THREE.Mesh>(null!)
  const named = useNamer('kernel')

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const inside = ['wall', 'syscall', 'refuse', 'mmu', 'isolation'].includes(d.focus ?? '')
    setEmissive(mesh.current.material as THREE.MeshStandardMaterial, inside ? 0.34 : 0.14)
  })

  return (
    <group>
      {/* The inlay's seat: a dark machined disc the floor sits in. */}
      <mesh position={[0, (FLOOR_Y - 0.006) / 2, 0]} receiveShadow>
        <cylinderGeometry args={[WALL_R + 0.03, WALL_R + 0.03, FLOOR_Y + 0.006, 96]} />
        <meshStandardMaterial color="#141a22" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh
        ref={mesh}
        position={[0, FLOOR_Y + 0.001, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        {...named('kernel:space')}
      >
        <circleGeometry args={[WALL_R, 96]} />
        <meshStandardMaterial
          color="#0d1a24"
          emissive="#2f6f8a"
          emissiveMap={kernelFloor()}
          emissiveIntensity={0.14}
          roughness={0.42}
          metalness={0.55}
        />
      </mesh>
    </group>
  )
}

/**
 * The privilege boundary.
 *
 * Solid, with a gap per program. Drawn as a real wall with real openings
 * because "protected memory" is usually explained as a rule, and it is not a
 * rule — it is a hardware check that a program physically cannot talk its way
 * past. A dotted line would have said the wrong thing.
 */
function Wall() {
  const named = useNamer('kernel')
  const gates = useRef<THREE.Group>(null!)
  /* One material for every arc of the wall and one for its lip, so the wall
     still lights as one thing although it is now six pieces. */
  const ring = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#16202c',
        emissive: '#4fd8ff',
        emissiveIntensity: 0.2,
        roughness: 0.4,
        metalness: 0.45,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.62,
      }),
    [],
  )
  const lip = useMemo(
    () =>
      new THREE.MeshStandardMaterial({ color: '#16202c', emissive: '#4fd8ff', emissiveIntensity: 0.24, roughness: 0.3, metalness: 0.5 }),
    [],
  )
  const frame = useMemo(() => portal(GATE), [])

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.focus ?? ''
    const t = state.clock.elapsedTime
    const loud = focus === 'wall' || focus === 'isolation' ? 1 : 0.4
    const level = 0.18 + loud * 0.5
    setEmissive(ring, level)
    setEmissive(lip, level * 1.2)

    gates.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
      if (!mat) return
      // A gate lights while something is being checked at it.
      const phase = (t * 0.42 + i * 0.13) % 1
      const { checking } = requestU(phase)
      const busy = ['syscall', 'refuse', 'mmu'].includes(focus) && checking
      const refused = focus === 'refuse' && i === REFUSED && checking
      mat.emissive.setHex(refused ? 0xff7a92 : 0xffab40)
      setEmissive(mat, busy ? 1.5 : 0.16)
    })
  })

  /* Each arc runs from one gate's post to the next, so the openings are real:
     the wall stops at every gate, and the gate is the only way through it. */
  const gap = (GATE.w / 2 - GATE.post / 2) / WALL_R
  const arc = (Math.PI * 2) / PROCESSES - gap * 2

  return (
    <group>
      {Array.from({ length: PROCESSES }, (_, i) => {
        const from = angleOf(i) + gap
        return (
          <group key={i}>
            {/* three's cylinder measures theta from +z toward +x, which is
                a quarter turn from `angleOf` and runs the other way. */}
            <mesh position={[0, WALL_H / 2, 0]} material={ring} {...named('kernel:wall')}>
              <cylinderGeometry args={[WALL_R, WALL_R, WALL_H, 24, 1, true, Math.PI / 2 - from - arc, arc]} />
            </mesh>
            {/* The top edge, solid, so the wall ends in a line of light rather
                than wherever a translucent sheet happens to fade. */}
            <group rotation={[0, -from, 0]}>
              <mesh position={[0, WALL_H, 0]} rotation={[Math.PI / 2, 0, 0]} material={lip} {...named('kernel:wall')}>
                <torusGeometry args={[WALL_R, 0.014, 8, 40, arc]} />
              </mesh>
            </group>
          </group>
        )
      })}
      {/* The gates: a portal in each opening. A request passes *through* the
          frame, and it is the frame that lights while it is checked there. */}
      <group ref={gates}>
        {Array.from({ length: PROCESSES }, (_, i) => {
          const [gx, gz] = gatePos(i)
          return (
            <mesh
              key={i}
              position={[gx, FLOOR_Y, gz]}
              rotation={[0, -angleOf(i), 0]}
              geometry={frame}
              castShadow
              {...named('kernel:gate')}
            >
              <meshStandardMaterial color="#2a1d10" emissive="#ffab40" emissiveIntensity={0.16} roughness={0.35} metalness={0.5} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

const WALL_H = 0.4
/** A gate's portal: overall width and height, post and lintel, radial depth. */
const GATE = { w: 0.46, h: 0.46, post: 0.08, lintel: 0.1, depth: 0.12 }

/**
 * A portal, as an extruded doorframe: two posts and a lintel, open at the
 * floor. Built in a gate's own frame — radial along x, the opening spanning z —
 * with its foot at 0.
 */
function portal({ w, h, post, lintel, depth }: { w: number; h: number; post: number; lintel: number; depth: number }) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2, 0)
  s.lineTo(-w / 2, h)
  s.lineTo(w / 2, h)
  s.lineTo(w / 2, 0)
  s.lineTo(w / 2 - post, 0)
  s.lineTo(w / 2 - post, h - lintel)
  s.lineTo(-w / 2 + post, h - lintel)
  s.lineTo(-w / 2 + post, 0)
  s.closePath()
  const bevel = Math.min(0.012, depth * 0.2)
  const g = new THREE.ExtrudeGeometry(s, {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: 2,
  })
  g.translate(0, 0, -depth / 2 + bevel)
  g.rotateY(Math.PI / 2)
  return g
}

/**
 * The single core, and whoever currently holds it.
 *
 * It takes the colour of the process running on it, which is the cheapest
 * possible way to show that the resource is exclusive: there is one of it, and
 * it is always somebody's.
 */
function Core() {
  const named = useNamer('kernel')
  const mesh = useRef<THREE.Mesh>(null!)
  const flash = useRef(0)
  const colour = useMemo(() => new THREE.Color(), [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const t = state.clock.elapsedTime
    const focus = d.focus ?? ''
    const scheduling = ['schedule', 'preempt', 'fair'].includes(focus)

    const holder = holderAt(t)
    const intoSlice = t % SLICE
    // The timer interrupt: a hard flash at the instant a slice ends, because
    // preemption is an event, not a fade.
    const preempting = focus === 'preempt' && intoSlice < 0.14
    flash.current = damp(flash.current, preempting ? 1 : 0, 12, dt)

    const mat = mesh.current.material as THREE.MeshStandardMaterial
    colour.copy(scheduling ? P_COLOR[holder] : new THREE.Color('#4fd8ff'))
    if (flash.current > 0.02) colour.lerp(new THREE.Color('#ffffff'), flash.current)
    mat.color.copy(colour).multiplyScalar(0.25)
    mat.emissive.copy(colour)
    setEmissive(mat, (scheduling ? 1.1 : 0.5) + flash.current * 1.4)
    mesh.current.scale.setScalar(1 + flash.current * 0.22)
  })

  return (
    <group>
      {/* Its socket: a machined hexagonal seat in the kernel floor. */}
      <mesh position={[0, FLOOR_Y + 0.008, 0]} receiveShadow geometry={hexFaced(CORE_R + 0.07, 0.016, 0.006)}>
        <meshStandardMaterial color="#1c232c" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* The die, with its floorplan on its face: the one processor every
          program is waiting for. Same hexagon, same height, same colour rule. */}
      <mesh
        ref={mesh}
        position={[0, 0.16 + FLOOR_Y + 0.012, 0]}
        castShadow
        geometry={hexFaced(CORE_R, 0.32, 0.03)}
        {...named('kernel:core')}
      >
        <meshPhysicalMaterial
          color="#123240"
          emissive="#4fd8ff"
          emissiveMap={kernelCoreTop()}
          emissiveIntensity={0.5}
          roughness={0.34}
          metalness={0.3}
          clearcoat={0.55}
          clearcoatRoughness={0.18}
        />
      </mesh>
    </group>
  )
}

/** The programs, outside the wall, each one unable to reach anything directly. */
function Processes() {
  const group = useRef<THREE.Group>(null!)
  const named = useNamer('kernel')

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const t = state.clock.elapsedTime
    const focus = d.focus ?? ''
    const scheduling = ['schedule', 'preempt', 'fair'].includes(focus)
    const holder = holderAt(t)

    group.current.children.forEach((child, i) => {
      const mat = (child.children[0] as THREE.Mesh)?.material as THREE.MeshStandardMaterial
      if (!mat) return
      if (scheduling) {
        /* Only the process holding the core is lit. Everything else is
           *waiting*, and waiting is the normal state — a machine with six
           programs and one core spends most of its time with five of them
           doing nothing at all. */
        setEmissive(mat, i === holder ? 1.4 : 0.12)
      } else if (focus === 'refuse' && i === REFUSED) {
        // The one being turned away, and it is the only thing that should blink.
        setEmissive(mat, 0.4 + 0.6 * ((t * 2) % 1 < 0.5 ? 1 : 0))
      } else {
        /* Lit while this program has a request in flight, dim otherwise.
           A program with nothing outstanding is not glowing gently — it is
           waiting, which looks like nothing. The gentle sine that used to be
           here made six idle programs all look equally busy. */
        const phase = (t * 0.42 + i * 0.13) % 1
        setEmissive(mat, phase < 0.7 ? 0.85 : 0.16)
      }
    })
  })

  return (
    <group ref={group}>
      {Array.from({ length: PROCESSES }, (_, i) => {
        const [x, z] = processPos(i)
        return (
          <group key={i} position={[x, PAD.h, z]} rotation={[0, -angleOf(i), 0]}>
            {/* Lacquered, with its own address space drawn on its face — code,
                data, heap, a gap and the stack — which is what the wall and
                the page tables are keeping every other program out of. */}
            <mesh
              position={[0, 0.16, 0]}
              castShadow
              receiveShadow
              geometry={topFaced(0.52, 0.32, 0.72, 0.035)}
              {...named('kernel:process')}
            >
              <meshPhysicalMaterial
                color={P_COLOR[i].clone().multiplyScalar(0.22)}
                emissive={P_COLOR[i]}
                emissiveMap={kernelProgramTop()}
                emissiveIntensity={0.5}
                roughness={0.34}
                metalness={0.3}
                clearcoat={0.55}
                clearcoatRoughness={0.18}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/**
 * The services, which move.
 *
 * They slide between inside and outside rather than being swapped, because the
 * lecture's claim is that this is one arrangement changed rather than two
 * different systems — the same filesystem, the same driver, on the other side
 * of a line.
 */
function Services() {
  const group = useRef<THREE.Group>(null!)
  const out = useRef(0)
  const here = useRef(0)
  const named = useNamer('kernel')

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.focus ?? ''
    const shown = ['monolith', 'micro', 'trade', 'families', 'posix'].includes(focus)
    const outside = focus === 'micro' || focus === 'trade'
    out.current = damp(out.current, outside ? 1 : 0, 3, dt)

    /* Scaled in rather than switched on. This was `visible = shown`, so three
       service blocks appeared and vanished in a single frame in the middle of
       an otherwise still scene — the one hard visibility toggle in the course
       that happens in front of the reader rather than off the end of a wire.
       Every other scene here already damps this; measured as the largest
       emissive discontinuity in the whole course. */
    here.current = damp(here.current, shown ? 1 : 0, 5, dt)
    group.current.scale.setScalar(Math.max(here.current, 0.0001))
    group.current.visible = here.current > 0.02
    group.current.children.forEach((child, i) => {
      const [ix, iz] = servicePos(i, false)
      const [ox, oz] = servicePos(i, true)
      child.position.set(ix + (ox - ix) * out.current, 0, iz + (oz - iz) * out.current)
      const mat = (child.children[0] as THREE.Mesh)?.material as THREE.MeshStandardMaterial
      /* A service lights when a request is actually at it. Outside the wall the
         requests take longer to arrive, so the same three services visibly do
         less work per unit time — which is the cost the beat is about. */
      if (mat) {
        const phase = (state.clock.elapsedTime * 0.3 + i * 0.16) % 1
        const atService = out.current > 0.5 ? phase > 0.82 : phase > 0.5 && phase < 0.75
        setEmissive(mat, atService ? 1.3 : 0.22)
      }
      // Outside the wall each service gets a boundary of its own — which is
      // exactly what makes it safer and exactly what makes it cost more.
      const ring = child.children[1] as THREE.Mesh | undefined
      if (ring) {
        ring.scale.setScalar(Math.max(out.current, 0.0001))
        ring.visible = out.current > 0.03
      }
    })
  })

  return (
    <group ref={group}>
      {Array.from({ length: SERVICES }, (_, i) => (
        <group key={i}>
          {/* What the service is, on its face: a directory tree, a device
              controller, a stack of protocol layers. */}
          <mesh
            position={[0, 0.14 + FLOOR_Y, 0]}
            castShadow
            receiveShadow
            geometry={topFaced(0.36, 0.28, 0.36, 0.03)}
            {...named('kernel:service')}
          >
            <meshPhysicalMaterial
              color={SERVICE_COLOR[i].clone().multiplyScalar(0.22)}
              emissive={SERVICE_COLOR[i]}
              emissiveMap={SERVICE_FACE[i]()}
              emissiveIntensity={0.5}
              roughness={0.34}
              metalness={0.3}
              clearcoat={0.55}
              clearcoatRoughness={0.18}
            />
          </mesh>
          <mesh position={[0, 0.17, 0]} {...named('kernel:boundary')}>
            <cylinderGeometry args={[SERVICE_BOUNDARY_R, SERVICE_BOUNDARY_R, 0.34, 40, 1, true]} />
            <meshStandardMaterial
              color="#16202c"
              emissive="#6ee7a8"
              emissiveIntensity={0.5}
              roughness={0.4}
              metalness={0.45}
              side={THREE.DoubleSide}
              transparent
              opacity={0.5}
            />
            {/* Its top edge, solid, like the kernel's own wall. Scales with it. */}
            <mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]} {...named('kernel:boundary')}>
              <torusGeometry args={[SERVICE_BOUNDARY_R, 0.01, 8, 64]} />
              <meshStandardMaterial color="#16202c" emissive="#6ee7a8" emissiveIntensity={0.6} roughness={0.3} metalness={0.5} />
            </mesh>
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Each service's face, in `SERVICES` order: filesystem, driver, network. */
const SERVICE_FACE = [kernelFsTop, kernelDriverTop, kernelNetTop]

/**
 * The deadline.
 *
 * A ring at a fixed radius that a real-time task must reach before its period
 * ends. A general scheduler is judged on averages; this one is judged on the
 * worst case, and a line you must not cross is a different kind of goal from a
 * number you would like to be small.
 */
function Deadline() {
  const group = useRef<THREE.Group>(null!)
  const marker = useRef<THREE.Mesh>(null!)
  const shown = useRef(0)
  const named = useNamer('kernel')

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.motion ?? ''
    const on = ['rtos', 'hard', 'embedded'].includes(focus)
    shown.current = damp(shown.current, on ? 1 : 0, 4, dt)
    group.current.visible = shown.current > 0.02
    group.current.scale.setScalar(Math.max(shown.current, 0.0001))

    /* Scheduled from beat time: "watch the third pass" is unfollowable when the
       passes are counted from page load, because the reader never sees a first
       one. */
    const bt = d.beatTime
    const pass = Math.floor(bt / RT_PERIOD)
    const phase = (bt % RT_PERIOD) / RT_PERIOD

    /* On `hard`, the third pass overruns. On every other beat the work finishes
       *before* the line and holds there until the period resets.
       It used to sail past the deadline on every pass of every beat, including
       the one introducing the rule that the work must be finished before the
       line, every time. A reader was being told a rule while watching it
       broken. */
    const late = focus === 'hard' && pass % 3 === 2
    const finishAt = late ? 0.92 : 0.55
    /* Same angular rate whether the pass is late or not — only for longer.
       Scaling `reach` by 1.18 made the late pass move visibly *faster*, which
       reads as "this one was quicker" on the beat about being too slow. */
    const reach = Math.min(phase, finishAt)
    const angle = -Math.PI / 2 + reach * Math.PI * 2 * 0.75
    const r = DEADLINE_R
    marker.current.position.set(Math.cos(angle) * r, TASK_R + 0.012, Math.sin(angle) * r)
    const mat = marker.current.material as THREE.MeshStandardMaterial
    const missed = late && reach > DEADLINE
    mat.emissive.setHex(missed ? 0xff7a92 : 0x6ee7a8)
    setEmissive(mat, missed ? 2.2 : 1.3)

    if (focus === 'rtos' || focus === 'hard') {
      publishReadout('kernel', d.scene, [
        { label: 'Pass', value: `${pass + 1}` },
        { label: 'Deadline at', value: `${Math.round(DEADLINE * 100)}% of period` },
        { label: 'Work finished at', value: `${Math.round(finishAt * 100)}%`, key: true },
        { label: 'Result', value: missed ? 'MISSED' : finishAt < DEADLINE ? 'in time' : 'running' },
      ])
    }
  })

  const dr = DEADLINE_R
  const da = -Math.PI / 2 + DEADLINE * Math.PI * 2 * 0.75
  const finish = useMemo(() => portal(FINISH), [])

  return (
    <group ref={group}>
      {/* The period: a track inlaid in the bench, the task riding on it. */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[dr - 0.1, dr + 0.1, 160]} />
        <meshStandardMaterial color="#141a22" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} {...named('kernel:period')}>
        <ringGeometry args={[dr - 0.02, dr + 0.02, 160]} />
        <meshStandardMaterial color="#1b2a22" emissive="#3f6f55" emissiveIntensity={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* The line itself: a gantry across the track and a line on it, so the
          task visibly passes under the line on the pass that is late. */}
      <group position={[Math.cos(da) * dr, 0, Math.sin(da) * dr]} rotation={[0, -da, 0]}>
        <mesh geometry={finish} rotation={[0, Math.PI / 2, 0]} castShadow {...named('kernel:deadline')}>
          <meshStandardMaterial color="#3a1420" emissive="#ff7a92" emissiveIntensity={1.6} roughness={0.35} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.009, 0]} geometry={roundedBox(FINISH.w - FINISH.post * 2, 0.006, 0.04, 0.002)} {...named('kernel:deadline')}>
          <meshStandardMaterial color="#3a1420" emissive="#ff7a92" emissiveIntensity={1.6} />
        </mesh>
      </group>
      <mesh ref={marker} castShadow {...named('kernel:task')}>
        <sphereGeometry args={[TASK_R, 32, 24]} />
        <meshStandardMaterial color="#1b2a22" emissive="#6ee7a8" emissiveIntensity={1.3} roughness={0.3} />
      </mesh>
    </group>
  )
}

const TASK_R = 0.13
/** The deadline's gantry: wide across the track, thin along it. */
const FINISH = { w: 0.6, h: 0.5, post: 0.07, lintel: 0.08, depth: 0.08 }

const HUES = [
  new THREE.Color('#7fe9ff'), // a request on its way in
  new THREE.Color('#ffab40'), // the same request, now the kernel's
  new THREE.Color('#ff7a92'), // refused
]

/**
 * Requests crossing the wall.
 *
 * Three things happen at the gate and each is a different beat: the request
 * pauses to be checked, it changes colour because it is now running as the
 * kernel rather than as the program, and on the refusal beat one of them is
 * turned around and sent back.
 */
function Requests() {
  const viaService = useMemo(() => laneGeometry(MICRO_LANES, 0.02), [])

  const at = useCallback((i: number, t: number, out: Packet): Packet => {
    const d = updateDriver(t)
    const focus = d.focus ?? ''

    /* The microkernel path: same request, but it has to leave the kernel again
       to reach a service that is now outside the wall, and be checked at every
       boundary it meets. Counting the pauses is the lecture. */
    const viaSvc = focus === 'micro' || focus === 'trade'
    if (viaSvc || focus === 'monolith') {
      const per = 3
      const p = Math.floor(i / per)
      if (p >= PROCESSES) {
        out.on = false
        return out
      }
      const lane = viaSvc ? MICRO_LANES[p] : REQUEST_LANES[p]
      const stops = viaSvc ? MICRO_CHECKS : [GATE_AT]
      /* Constant speed, not constant period. The two paths now take genuinely
         different amounts of time, in proportion to how far the request has to
         travel and how many times it is stopped — which is the difference the
         beat is about. Under the old fixed period the microkernel request
         simply moved faster and finished just as often. */
      const period = requestPeriod(lane, stops)
      const elapsed = (t + p * 0.42 + (i % per) * 0.16) % period
      const { u, checking } = walkRequest(lane, stops, elapsed)
      const [x, z] = sampleLane(lane, u)
      out.on = true
      out.x = x
      out.y = 0.24
      out.z = z
      out.hue = 1
      out.scale = checking ? 0.085 : 0.06
      out.bright = checking ? 3 : 2
      return out
    }

    if (!['syscall', 'refuse', 'mmu', 'isolation'].includes(focus)) {
      out.on = false
      return out
    }

    const per = 4
    const p = Math.floor(i / per)
    if (p >= PROCESSES) {
      out.on = false
      return out
    }

    const phase = (t * 0.42 + p * 0.13 + (i % per) * 0.05) % 1
    const { u, checking } = requestU(phase)
    const refused = focus === 'refuse' && p === REFUSED

    /* A refused request never gets past the gate. It is walked back out along
       the way it came, which is the honest picture: the program is not told
       "no" by the kernel changing its mind later, it simply never got in. */
    const eff = refused && u > 0.42 ? 0.42 - (u - 0.42) : u
    if (refused && eff < 0) {
      out.on = false
      return out
    }

    const lane = REQUEST_LANES[p]
    const [x, z] = sampleLane(lane, eff)

    out.on = true
    out.x = x
    out.y = 0.24
    out.z = z
    // Past the checkpoint the request is the kernel's, and it changes colour to
    // say so. On the address-translation beat this is the moment the address a
    // program asked for stops being the address that will actually be used.
    out.hue = refused ? 2 : u > 0.42 ? 1 : 0
    out.scale = checking ? 0.085 : 0.06
    out.bright = checking ? 3 : 2
    return out
  }, [])

  return (
    <group>
      {/* The direct road is routed into the bench (see Tracks). */}
      <ServiceRoutes geometry={viaService} />
      <Flow count={PROCESSES * 4} at={at} hues={HUES} probe="kernel" />
    </group>
  )
}

/** The longer road, drawn only when the services are out beyond the wall. */
function ServiceRoutes({ geometry }: { geometry: THREE.BufferGeometry }) {
  const ref = useRef<THREE.LineSegments>(null!)
  const shown = useRef(0)

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const on = d.focus === 'micro' || d.focus === 'trade'
    shown.current = damp(shown.current, on ? 1 : 0, 4, dt)
    ref.current.visible = shown.current > 0.03
    const mat = ref.current.material as THREE.LineBasicMaterial
    mat.opacity = shown.current * 0.55
  })

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#6ee7a8" transparent opacity={0.55} />
    </lineSegments>
  )
}

/**
 * The numbers this lecture asserts, published while it animates.
 *
 * "Counting the pauses is the lecture" is a sentence in the copy, and nothing
 * on screen counted them. Now the crossing count, the path length and the time
 * one request actually takes are all readable, so the microkernel's cost is a
 * figure the reader watches rather than a claim they are asked to accept.
 */
function Readouts() {
  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const m = d.motion ?? ''
    if (m !== 'monolith' && m !== 'micro' && m !== 'trade') return

    const viaSvc = m === 'micro' || m === 'trade'
    const lane = viaSvc ? MICRO_LANES[0] : REQUEST_LANES[0]
    const stops = viaSvc ? MICRO_CHECKS : [GATE_AT]
    const period = requestPeriod(lane, stops)

    publishReadout('kernel', d.scene, [
      { label: 'Arrangement', value: viaSvc ? 'Microkernel' : 'Monolithic' },
      { label: 'Boundary crossings', value: `${stops.length}`, key: true },
      { label: 'Distance travelled', value: `${laneLength(lane).toFixed(1)} units` },
      { label: 'Time per request', value: `${period.toFixed(2)} s` },
    ])
  })
  return null
}
