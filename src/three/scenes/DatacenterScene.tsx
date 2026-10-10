import { useCallback, useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Part } from '../Part'
import { useNamer } from '../naming'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { Flow, type Packet } from '../motion/Flow'
import { sampleLane } from '../motion/lanes'
import { roundedBox, topFaced } from '../surfaces'
import { damp } from '../../lib/math'
import {
  C,
  COOLANT,
  FLOOR,
  FRAME,
  GATHER_LANES,
  NODES_PER_RACK,
  NODE_D,
  NODE_H,
  PUE,
  RACKS,
  RACK_W,
  ROWS,
  jobAt,
  nodeY,
  overheadShare,
  rackPos,
  racksShown,
} from './dcLayout'

/**
 * A machine room.
 *
 * Nothing here is cleverer than the laptop from Lecture 5 — there is simply an
 * enormous amount of it, so the motion signature is repetition: the same
 * picture, then many of it. The one thing that does not scale is the moment
 * every answer has to arrive at the same place, and that is what the job beats
 * are built around.
 */
export function DatacenterScene() {
  return (
    <Part
      id="datacenter"
      tags={['node', 'ecc', 'rack', 'hall', 'shard', 'compute', 'gather', 'power', 'cooling', 'pue']}
      position={[0, 0, 0]}
    >
      <Floor />
      <Racks />
      <Interconnect />
      <Coolant />
      <PowerBar />
      <Traffic />
    </Part>
  )
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                             */
/* ------------------------------------------------------------------ */

/*
 * Painted here rather than in the shared surfaces module, which several
 * lectures are being brought up to the new look against at once. Same method:
 * a canvas, painted once at first use, fixed seed, shared between meshes.
 */

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const painted = new Map<string, THREE.CanvasTexture>()

function paint(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const hit = painted.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  draw(canvas.getContext('2d')!, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  painted.set(key, tex)
  return tex
}

/*
 * A node's atlas: the front bezel in the top band, the lid below it, and a
 * strip between the two that every other face samples. It is an emissive map,
 * so it decides *where* a node glows and the frame loop still decides how
 * much and in what colour — the same signal as before, carried by drive bays,
 * a vent and a lid instead of by a flat block.
 */
const ATLAS = 512
const BEZEL_ROWS = 122
const SIDE_ROW = 125
const LID_ROW = 128

const nodeAtlas = () =>
  paint('dc-node', ATLAS, ATLAS, (ctx, w) => {
    const r = rng(15)

    /* Bezel. Brighter than it looks: this is emissive, in sRGB, and a mid grey
       would glow at a fifth of the level the frame loop asks for. */
    ctx.fillStyle = '#c4c4c4'
    ctx.fillRect(0, 0, w, BEZEL_ROWS)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, 3)
    // Rack ears, one each end, with their thumbscrews.
    for (const x of [0, w - 26]) {
      ctx.fillStyle = '#9a9a9a'
      ctx.fillRect(x, 3, 26, BEZEL_ROWS - 3)
      ctx.fillStyle = '#3a3a3a'
      ctx.beginPath()
      ctx.arc(x + 13, BEZEL_ROWS / 2, 5, 0, Math.PI * 2)
      ctx.fill()
    }
    // Eight drive bays: a dark gap round each caddy, a latch, an activity light.
    for (let i = 0; i < 8; i++) {
      const x = 36 + i * 37
      ctx.fillStyle = '#2c2c2c'
      ctx.fillRect(x, 14, 34, 94)
      ctx.fillStyle = '#e2e2e2'
      ctx.fillRect(x + 2, 16, 30, 90)
      ctx.fillStyle = '#5a5a5a'
      for (let y = 22; y < 78; y += 6) ctx.fillRect(x + 6, y, 22, 2)
      ctx.fillStyle = '#3a3a3a'
      ctx.fillRect(x + 6, 84, 22, 14)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x + 25, 100, 5, 4)
    }
    // A vent grille, and the power button and status light beside it.
    ctx.fillStyle = '#8a8a8a'
    ctx.fillRect(338, 14, 118, 94)
    ctx.fillStyle = '#262626'
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 10; x++) {
        ctx.beginPath()
        ctx.arc(346 + x * 11.4 + (y % 2) * 5.7, 21 + y * 11.4, 3.6, 0, Math.PI * 2)
        ctx.fill()
      }
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(472, 34, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#4a4a4a'
    ctx.beginPath()
    ctx.arc(472, 86, 9, 0, Math.PI * 2)
    ctx.fill()

    // The sides, all one steady value.
    ctx.fillStyle = '#8c8c8c'
    ctx.fillRect(0, BEZEL_ROWS, w, LID_ROW - BEZEL_ROWS)

    /* Lid: brushed sheet, a vented band at the front where the air comes in,
       a seam where the lid lifts, screws, and a service label. */
    ctx.fillStyle = '#b4b4b4'
    ctx.fillRect(0, LID_ROW, w, ATLAS - LID_ROW)
    for (let y = LID_ROW; y < ATLAS; y += 2) {
      const v = 168 + r() * 26
      ctx.fillStyle = `rgba(${v},${v},${v},0.35)`
      ctx.fillRect(0, y, w, 1)
    }
    ctx.fillStyle = '#3c3c3c'
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 44; x++) ctx.fillRect(18 + x * 11 + (y % 2) * 5, LID_ROW + 12 + y * 11, 6, 6)
    ctx.fillStyle = '#5a5a5a'
    ctx.fillRect(0, LID_ROW + 66, w, 3)
    ctx.fillRect(0, 380, w, 2)
    for (const [x, y] of [[14, 214], [w - 14, 214], [14, ATLAS - 14], [w - 14, ATLAS - 14]]) {
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#e8e8e8'
    ctx.fillRect(326, 400, 150, 80)
    ctx.fillStyle = '#6a6a6a'
    for (let i = 0; i < 5; i++) ctx.fillRect(338, 412 + i * 12, 60 + ((i * 37) % 66), 4)
    ctx.fillRect(420, 412, 44, 44)
  })

const faced = new Map<string, THREE.BufferGeometry>()

/**
 * A node's body: the bezel on the front, the lid on top, one steady value on
 * every other face — the same trick as `topFaced`, with two faces instead of
 * one, so a node reads as a server from the aisle and from above.
 */
function nodeGeometry(w: number, h: number, d: number) {
  const key = `${w}|${h}|${d}`
  let g = faced.get(key)
  if (!g) {
    g = roundedBox(w, h, d, 0.016).clone()
    const pos = g.attributes.position
    const nor = g.attributes.normal
    const uv = g.attributes.uv
    const bezel = BEZEL_ROWS / ATLAS
    const lid = (ATLAS - LID_ROW) / ATLAS
    const top = 1 - LID_ROW / ATLAS
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) / w + 0.5
      if (nor.getZ(i) > 0.5) uv.setXY(i, u, 1 - (0.5 - pos.getY(i) / h) * bezel)
      else if (nor.getY(i) > 0.5) uv.setXY(i, u, top - (0.5 - pos.getZ(i) / d) * lid)
      else uv.setXY(i, 0.5, 1 - SIDE_ROW / ATLAS)
    }
    uv.needsUpdate = true
    faced.set(key, g)
  }
  return g
}

/*
 * The floor, painted in world space: the house's black anodised finish and
 * registration dots, a plate under each rack where it is bolted down, and a
 * perforated tile in the cold aisle in front of it — where the air comes up
 * from under the floor, before the cooling beat says air stops being enough.
 */
const FLOOR_PX = 140

const floorMap = () =>
  paint('dc-floor', Math.round(FLOOR.w * FLOOR_PX), Math.round(FLOOR.d * FLOOR_PX), (ctx, w, h) => {
    const r = rng(51)
    const at = (x: number, z: number): [number, number] => [
      (x + FLOOR.w / 2) * FLOOR_PX,
      (z - FLOOR.z + FLOOR.d / 2) * FLOOR_PX,
    ]
    ctx.fillStyle = '#0c1119'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 26000; i++) {
      const v = 12 + r() * 10
      ctx.fillStyle = `rgba(${v},${v + 4},${v + 10},0.6)`
      ctx.fillRect(r() * w, r() * h, 2, 2)
    }
    // The bench grid: a dot every eighth of a unit, a line every half.
    ctx.fillStyle = 'rgba(110,160,210,0.34)'
    const step = FLOOR_PX / 8
    for (let y = step / 2; y < h; y += step)
      for (let x = step / 2; x < w; x += step) {
        ctx.beginPath()
        ctx.arc(x, y, 1.4, 0, Math.PI * 2)
        ctx.fill()
      }
    ctx.strokeStyle = 'rgba(70,110,150,0.16)'
    ctx.lineWidth = 1
    for (let x = 0; x <= w; x += FLOOR_PX / 2) {
      ctx.beginPath()
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, h)
      ctx.stroke()
    }
    for (let y = 0; y <= h; y += FLOOR_PX / 2) {
      ctx.beginPath()
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(w, y + 0.5)
      ctx.stroke()
    }

    for (let i = 0; i < RACKS; i++) {
      const [rx, rz] = rackPos(i)
      // The plate the rack is bolted to.
      const [px, pz] = at(rx - FRAME.x - 0.06, rz - FRAME.z - 0.06)
      const pw = (FRAME.x + 0.06) * 2 * FLOOR_PX
      const pd = (FRAME.z + 0.06) * 2 * FLOOR_PX
      ctx.fillStyle = '#0f151e'
      ctx.fillRect(px, pz, pw, pd)
      ctx.strokeStyle = 'rgba(120,170,220,0.13)'
      ctx.strokeRect(px + 0.5, pz + 0.5, pw, pd)

      // A perforated tile in the cold aisle in front of it.
      const [tx, tz] = at(rx - RACK_W / 2, rz + FRAME.z + 0.07)
      const tw = RACK_W * FLOOR_PX
      const td = 0.3 * FLOOR_PX
      ctx.fillStyle = '#131b25'
      ctx.fillRect(tx, tz, tw, td)
      ctx.fillStyle = '#070a0f'
      for (let y = tz + 5; y < tz + td - 3; y += 5.2)
        for (let x = tx + 5; x < tx + tw - 3; x += 5.2) {
          ctx.beginPath()
          ctx.arc(x, y, 1.6, 0, Math.PI * 2)
          ctx.fill()
        }
      ctx.strokeStyle = 'rgba(140,190,235,0.16)'
      ctx.strokeRect(tx + 0.5, tz + 0.5, tw - 1, td - 1)
    }
  })

/* ------------------------------------------------------------------ */
/* The room                                                             */
/* ------------------------------------------------------------------ */

function Floor() {
  const named = useNamer('datacenter')
  const map = useMemo(floorMap, [])
  return (
    <mesh
      position={[0, FLOOR.y, FLOOR.z]}
      receiveShadow
      geometry={topFaced(FLOOR.w, FLOOR.h, FLOOR.d, 0.05)}
      {...named('dc:hall')}
    >
      <meshStandardMaterial color="#ffffff" map={map} roughness={0.62} metalness={0.35} />
    </mesh>
  )
}

/** One geometry from many pieces, so a rack's frame is one draw call rather than twenty. */
function merged(parts: THREE.BufferGeometry[]) {
  const g = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)))!
  parts.forEach((p) => p.dispose())
  return g
}

const piece = (w: number, h: number, d: number, x: number, y: number, z: number, radius = 0.01) =>
  roundedBox(w, h, d, radius).clone().translate(x, y, z)

/**
 * The frame a rack's nodes are mounted in: four steel posts, a ring of rails
 * at the top, a rail along the foot of each side, and a pair of slides under
 * every node. Open, so the top nodes' lids stay visible from the hall.
 *
 * Unnamed on purpose: it is the furniture, and the nearest hit wins.
 */
function rackFrame() {
  const { post, x, z, top, rail } = FRAME
  const parts: THREE.BufferGeometry[] = []
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) parts.push(piece(post, top, post, sx * x, top / 2, sz * z, 0.012))
  for (const sz of [-1, 1]) parts.push(piece(x * 2, rail, rail, 0, top - rail / 2, sz * z))
  for (const sx of [-1, 1]) {
    parts.push(piece(rail, rail, z * 2, sx * x, top - rail / 2, 0))
    parts.push(piece(rail, rail, z * 2, sx * x, rail / 2, 0))
  }
  for (let n = 0; n < NODES_PER_RACK; n++)
    for (const sx of [-1, 1])
      parts.push(piece(0.022, 0.012, NODE_D, sx * (RACK_W / 2 + 0.004), nodeY(n) - NODE_H / 2 - 0.006, 0, 0.004))
  return merged(parts)
}

/**
 * Racks of identical nodes.
 *
 * How many are present is decided by the beat, so scaling out is something the
 * reader watches happen rather than a fact they are told. The nodes themselves
 * never change — that sameness is the argument.
 */
function Racks() {
  const named = useNamer('datacenter')
  const group = useRef<THREE.Group>(null!)
  const levels = useRef<number[]>(Array.from({ length: RACKS }, () => 0))
  const tint = useMemo(() => new THREE.Color(), [])
  const frame = useMemo(rackFrame, [])
  const body = useMemo(() => nodeGeometry(RACK_W, NODE_H, NODE_D), [])
  const face = useMemo(nodeAtlas, [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.focus ?? ''
    const t = state.clock.elapsedTime
    const shown = racksShown(focus)
    const job = jobAt(t)

    if (import.meta.env.DEV) {
      /* Reports the racks actually on screen.
         Every aggregate measurement available from outside is dominated by
         something static — the floor sets the scene's bounding box, and the
         emissive dump ignores visibility — so scale-out is unmeasurable without
         asking the scene directly. */
      ;(window as unknown as Record<string, unknown>).__racks = () =>
        levels.current.filter((v) => v > 0.5).length
    }

    group.current.children.forEach((rack, r) => {
      const present = r < shown
      levels.current[r] = damp(levels.current[r], present ? 1 : 0, 4, dt)
      const v = levels.current[r]
      rack.scale.setScalar(Math.max(v, 0.0001))
      rack.visible = v > 0.02

      // A rack's first child holds its nodes; the second is its frame.
      rack.children[0].children.forEach((child, n) => {
        const mesh = child as THREE.Mesh
        const mat = mesh.material as THREE.MeshStandardMaterial

        /* During compute every node is lit and they are all doing the same
           thing at once — the easy, parallel part. During the gather almost all
           of them are finished and idle while their answers travel, which is
           the part that does not scale. */
        let colour = C.node
        let level = 0.35
        if (focus === 'compute' && job.computing) {
          colour = C.busy
          level = 1.3
        } else if (focus === 'gather' && job.gathering) {
          /* "Almost every" node: the one rack the answers converge on is the
             somewhere specific, and it warms as they arrive, so the reader can
             see where the whole job is waiting. */
          const collector = rackPos(r)[0] === 0 && rackPos(r)[1] === 0
          colour = collector ? C.gather : C.idle
          level = collector ? 0.25 + 0.65 * job.progress : 0.12
        } else if (focus === 'shard' && job.progress < 1) {
          colour = C.node
          level = 0.5 + 0.6 * (n / NODES_PER_RACK)
        } else if (focus === 'ecc') {
          // One bit somewhere is always wrong at this scale; the memory catches
          // it silently, which is why it is worth paying for.
          const hit = Math.floor(t * 1.4) % (RACKS * NODES_PER_RACK) === r * NODES_PER_RACK + n
          colour = hit ? C.overhead : C.node
          level = hit ? 1.8 : 0.4
        }
        tint.copy(colour)
        mat.color.copy(tint).multiplyScalar(0.2)
        mat.emissive.copy(tint)
        setEmissive(mat, level)
      })
    })
  })

  return (
    <group ref={group}>
      {Array.from({ length: RACKS }, (_, r) => {
        const [x, z] = rackPos(r)
        return (
          <group key={r} position={[x, 0, z]}>
            <group>
              {Array.from({ length: NODES_PER_RACK }, (_, n) => (
                <mesh
                  key={n}
                  position={[0, nodeY(n), 0]}
                  castShadow
                  receiveShadow
                  geometry={body}
                  {...named(r === 0 ? 'dc:node' : 'dc:peer')}
                >
                  {/* Lacquered like every block in the new look. The emissive
                      map says what a node is; the frame loop says what it is
                      doing. */}
                  <meshPhysicalMaterial
                    color="#16202c"
                    emissive={C.node}
                    emissiveMap={face}
                    emissiveIntensity={0.4}
                    roughness={0.4}
                    metalness={0.3}
                    clearcoat={0.5}
                    clearcoatRoughness={0.2}
                  />
                </mesh>
              ))}
            </group>
            <mesh geometry={frame} castShadow receiveShadow>
              <meshStandardMaterial color="#232a33" roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/**
 * The wires between racks, in floor trays. Only drawn once there is more than
 * one rack. They grow out from the rack that collects the answers, along the
 * same lanes the answers travel.
 */
function Interconnect() {
  const group = useRef<THREE.Group>(null!)
  const shown = useRef(0)
  const [tray, fibre] = useMemo(() => {
    const trays: THREE.BufferGeometry[] = []
    const fibres: THREE.BufferGeometry[] = []
    for (const lane of GATHER_LANES) {
      const [[x0, z0], [x1, z1]] = lane
      const len = Math.hypot(x1 - x0, z1 - z0)
      if (len < 0.01) continue
      const angle = Math.atan2(-(z1 - z0), x1 - x0)
      const place = (g: THREE.BufferGeometry, y: number) =>
        g.rotateY(angle).translate((x0 + x1) / 2, y, (z0 + z1) / 2)
      trays.push(place(roundedBox(len, 0.018, 0.075, 0.006).clone(), 0))
      fibres.push(place(roundedBox(len, 0.006, 0.026, 0.002).clone(), 0.009))
    }
    return [merged(trays), merged(fibres)]
  }, [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const on = !['node', 'ecc', 'rack'].includes(d.focus ?? '')
    shown.current = damp(shown.current, on ? 1 : 0, 4, dt)
    group.current.visible = shown.current > 0.03
    group.current.scale.set(Math.max(shown.current, 0.0001), 1, Math.max(shown.current, 0.0001))
  })

  return (
    <group ref={group}>
      <mesh geometry={tray} receiveShadow>
        <meshStandardMaterial color="#1a232e" roughness={0.35} metalness={0.85} />
      </mesh>
      <mesh geometry={fibre}>
        <meshStandardMaterial color="#3f5a72" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  )
}

/**
 * The liquid loop, on the cooling beat.
 *
 * A supply and a return header over each row, and a drop from each into the
 * back of every rack with a port at every node — the copy's "the coolant comes
 * to the chip", drawn as the plumbing that does it. It comes down from the
 * headers when the beat arrives and goes back up when it leaves. Never lit:
 * nothing about the flow is being claimed, only that there is one.
 */
function Coolant() {
  const group = useRef<THREE.Group>(null!)
  const shown = useRef(0)
  const [supply, back] = useMemo(() => {
    const pipes: THREE.BufferGeometry[][] = [[], []]
    const span = Math.max(...Array.from({ length: RACKS }, (_, i) => Math.abs(rackPos(i)[0]))) + FRAME.x + 0.1
    const low = nodeY(0)
    for (const rz of ROWS) {
      COOLANT.behind.forEach((behind, k) => {
        const z = rz - behind
        pipes[k].push(
          new THREE.CylinderGeometry(COOLANT.r, COOLANT.r, span * 2, 16).rotateZ(Math.PI / 2).translate(0, 0, z),
        )
        for (const end of [-span, span])
          pipes[k].push(new THREE.SphereGeometry(COOLANT.r * 1.15, 16, 10).translate(end, 0, z))
        for (let i = 0; i < RACKS; i++) {
          const [rx, iz] = rackPos(i)
          if (iz !== rz) continue
          const x = rx + (k === 0 ? -COOLANT.dropX : COOLANT.dropX)
          const drop = COOLANT.y - low
          const r = COOLANT.r * 0.7
          pipes[k].push(new THREE.CylinderGeometry(r, r, drop, 12).translate(x, -drop / 2, z))
          pipes[k].push(new THREE.CylinderGeometry(r * 1.6, r * 1.6, 0.03, 16).translate(x, -0.005, z))
          // A port into the back of every node, like a board's cold plate hose.
          const reach = behind - NODE_D / 2
          for (let n = 0; n < NODES_PER_RACK; n++)
            pipes[k].push(
              new THREE.CylinderGeometry(r * 0.55, r * 0.55, reach, 8)
                .rotateX(Math.PI / 2)
                .translate(x, nodeY(n) - COOLANT.y, z + reach / 2),
            )
        }
      })
    }
    return pipes.map(merged)
  }, [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    shown.current = damp(shown.current, d.focus === 'cooling' ? 1 : 0, 4, dt)
    group.current.visible = shown.current > 0.02
    group.current.scale.set(1, Math.max(shown.current, 0.0001), 1)
  })

  return (
    <group ref={group} position={[0, COOLANT.y, 0]}>
      <mesh geometry={supply} castShadow>
        <meshPhysicalMaterial color={COOLANT.supply} roughness={0.3} metalness={0.6} clearcoat={0.5} clearcoatRoughness={0.2} />
      </mesh>
      <mesh geometry={back} castShadow>
        <meshPhysicalMaterial color={COOLANT.back} roughness={0.28} metalness={0.85} clearcoat={0.3} clearcoatRoughness={0.25} />
      </mesh>
    </group>
  )
}

/**
 * Where the building's electricity actually goes.
 *
 * Split into the share that reaches the computers and the share that does not.
 * PUE is normally quoted as a multiplier, which is easy to nod at; as a
 * proportion of the bill spent on *not computing* it is much harder to ignore.
 */
function PowerBar() {
  const named = useNamer('datacenter')
  const group = useRef<THREE.Group>(null!)
  const it = useRef<THREE.Mesh>(null!)
  const over = useRef<THREE.Mesh>(null!)
  const shown = useRef(0)
  const share = useRef(overheadShare(PUE.enterprise))
  const W = 4.4

  /* The meter the two shares lie in: a steel trough with a notch every tenth,
     so "a third" and "a tenth" can be read off the scale as well as seen. */
  const trough = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [piece(W + 0.16, 0.05, 0.42, 0, -0.07, 0, 0.02)]
    for (let k = 0; k <= 10; k++)
      parts.push(piece(0.012, 0.012, k % 5 === 0 ? 0.07 : 0.045, -W / 2 + (k * W) / 10, -0.04, 0.17, 0.004))
    return merged(parts)
  }, [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.focus ?? ''
    const on = ['power', 'cooling', 'pue'].includes(focus)
    shown.current = damp(shown.current, on ? 1 : 0, 4, dt)
    group.current.visible = shown.current > 0.02
    group.current.scale.setScalar(Math.max(shown.current, 0.0001))

    // The pue beat moves between a typical room and a very good one, so the
    // reader sees the overhead shrink rather than reading two numbers.
    const t = state.clock.elapsedTime
    const target = focus === 'pue' && (t % 8) > 4 ? overheadShare(PUE.hyperscale) : overheadShare(PUE.enterprise)
    share.current = damp(share.current, target, 2.2, dt)
    const s = share.current

    it.current.scale.x = Math.max(1 - s, 0.0001)
    it.current.position.x = -W / 2 + ((1 - s) * W) / 2
    over.current.scale.x = Math.max(s, 0.0001)
    over.current.position.x = W / 2 - (s * W) / 2
  })

  const bar = roundedBox(W, 0.09, 0.26, 0.03)
  return (
    <group ref={group} position={[0, 0.06, 2.55]}>
      <mesh geometry={trough} receiveShadow>
        <meshStandardMaterial color="#2a323c" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh ref={it} scale={[1, 1, 1]} geometry={bar} castShadow {...named('dc:compute')}>
        <meshPhysicalMaterial
          color="#0e2a36"
          emissive={C.node}
          emissiveIntensity={1.1}
          roughness={0.32}
          metalness={0.3}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
        />
      </mesh>
      <mesh ref={over} scale={[0.0001, 1, 1]} geometry={bar} castShadow {...named('dc:overhead')}>
        <meshPhysicalMaterial
          color="#2a1018"
          emissive={C.overhead}
          emissiveIntensity={1.1}
          roughness={0.32}
          metalness={0.3}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
        />
      </mesh>
    </group>
  )
}

const HUES = [
  new THREE.Color('#7fe9ff'), // work going out
  new THREE.Color('#ffab40'), // answers coming back
]

/**
 * Work going out, and answers coming back.
 *
 * The asymmetry is the lesson. Scatter is many independent journeys outward and
 * costs nothing much; the gather is every journey converging on one place at
 * the same moment, and it is the reason a hundred thousand machines do not
 * behave like one machine a hundred thousand times faster.
 */
function Traffic() {
  const at = useCallback((i: number, t: number, out: Packet): Packet => {
    const d = updateDriver(t)
    const focus = d.focus ?? ''
    if (!['shard', 'compute', 'gather'].includes(focus)) {
      out.on = false
      return out
    }

    const job = jobAt(t)
    const rack = i % RACKS
    const lane = GATHER_LANES[rack]

    if (focus === 'shard' && job.progress < 1 && !job.computing) {
      // Outward: independent, staggered, cheap.
      const u = 1 - Math.min(1, job.progress + (i / (RACKS * 3)) * 0.3)
      const [x, z] = sampleLane(lane, u)
      out.on = true
      out.x = x
      out.y = 0.55
      out.z = z
      out.hue = 0
      out.scale = 0.055
      out.bright = 2
      return out
    }

    if (focus === 'gather' && job.gathering) {
      /* Inward, and all of it at once. Every rack's answer is on its way to the
         same point, so the middle of the room is where the whole job waits. */
      const u = Math.min(1, job.progress * 1.1 - (i % 3) * 0.06)
      if (u < 0) {
        out.on = false
        return out
      }
      const [x, z] = sampleLane(lane, 1 - u)
      out.on = true
      out.x = x
      out.y = 0.55
      out.z = z
      out.hue = 1
      out.scale = 0.06
      out.bright = 2.4
      return out
    }

    out.on = false
    return out
  }, [])

  return <Flow count={RACKS * 3} at={at} hues={HUES} probe="dc" />
}
