import { useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { useNamer } from '../naming'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { publishReadout } from '../readout'
import { damp } from '../../lib/math'
import { roundedBox, substrateBump, substrateMap, topFaced } from '../surfaces'
import {
  BLOCKS,
  C,
  DIE,
  PKG,
  SHED_MAX_W,
  SHED_MIN_W,
  SUSTAINED,
  WATTS_MAX,
  powered,
  thermalAt,
  type Block,
} from './phoneLayout'

/**
 * One die, and the heat it cannot lose.
 *
 * Two motions here are new to the course. Power gating: a block that is not
 * needed goes *fully dark* rather than dim, because it is disconnected from the
 * supply and drawing nothing — dimming would say "working less", which is the
 * wrong idea entirely. And throttling: when the case reaches its limit,
 * everything in the scene visibly slows down, because the animation rate is
 * driven by the same clock multiplier the copy is describing.
 */
export function PhoneScene() {
  return (
    <Part
      id="phone"
      tags={['die', 'compare', 'prime', 'little', 'scheduler', 'gating', 'dark', 'sealed', 'throttle', 'budget']}
      position={[0, 0, 0]}
    >
      <Package />
      <Die />
      <Blocks />
      <HeatBar />
    </Part>
  )
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

/*
 * This lecture's own faces, painted once at first use in the manner of
 * `surfaces.ts` — same conventions, same fixed seeds — and kept here because
 * nothing else in the course draws a phone's floorplan.
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
  const ctx = canvas.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  painted.set(key, tex)
  return tex
}

/** Pixels per world unit on the die, so every block's circuitry shares one scale. */
const PX = 280

/*
 * `topFaced` gives the sides of a block the texel at 4% in from a corner, so
 * every face keeps the house frame: a mid-grey border a tenth of the way in,
 * which the sides glow at, and the circuit inside it.
 */
const FRAME = 0.1
const SIDE = 'rgb(150,150,150)'
const FILL = 'rgb(62,62,62)'
const INK = 'rgb(236,236,236)'

type Rect = { x: number; y: number; w: number; h: number }

/** Standard-cell rows: the texture of logic, cells of one height laid end to end. */
function cells(ctx: CanvasRenderingContext2D, f: Rect, r: () => number, pitch = 4) {
  for (let y = f.y + 1; y < f.y + f.h - 2; y += pitch) {
    let x = f.x + 1
    while (x < f.x + f.w - 2) {
      const len = 2 + r() * 10
      const v = 120 + r() * 110
      ctx.fillStyle = `rgb(${v},${v},${v})`
      ctx.fillRect(x, y, Math.min(len, f.x + f.w - 1 - x), pitch * 0.6)
      x += len + 1 + r() * 2
    }
  }
}

/** An SRAM macro: the most regular thing on a die, which is how cache is found on a photo. */
function sram(ctx: CanvasRenderingContext2D, f: Rect, pitch = 4) {
  ctx.fillStyle = 'rgb(28,28,28)'
  ctx.fillRect(f.x, f.y, f.w, f.h)
  for (let y = f.y + 2; y < f.y + f.h - pitch; y += pitch)
    for (let x = f.x + 2; x < f.x + f.w - pitch; x += pitch) {
      ctx.fillStyle = ((x - f.x) / pitch + (y - f.y) / pitch) % 2 < 1 ? 'rgb(210,210,210)' : 'rgb(168,168,168)'
      ctx.fillRect(x, y, pitch * 0.7, pitch * 0.7)
    }
  ctx.strokeStyle = INK
  ctx.lineWidth = 1.5
  ctx.strokeRect(f.x + 0.5, f.y + 0.5, f.w - 1, f.h - 1)
}

function outline(ctx: CanvasRenderingContext2D, f: Rect, width = 1.5) {
  ctx.strokeStyle = INK
  ctx.lineWidth = width
  ctx.strokeRect(f.x + width / 2, f.y + width / 2, f.w - width, f.h - width)
}

const sub = (f: Rect, u: number, v: number, w: number, h: number): Rect => ({
  x: f.x + f.w * u,
  y: f.y + f.h * v,
  w: f.w * w,
  h: f.h * h,
})

/** A CPU core: logic rows, its L1 caches along the top, a register file, and an L2 slice. */
function core(ctx: CanvasRenderingContext2D, f: Rect, r: () => number, big: boolean) {
  cells(ctx, f, r, big ? 4 : 3)
  sram(ctx, sub(f, 0.04, 0.05, 0.43, 0.24), big ? 4 : 3)
  sram(ctx, sub(f, 0.53, 0.05, 0.43, 0.24), big ? 4 : 3)
  if (big) {
    // A big core carries its own share of L2, and a wide vector unit.
    sram(ctx, sub(f, 0.04, 0.74, 0.92, 0.21), 4)
    ctx.fillStyle = 'rgb(40,40,40)'
    const vec = sub(f, 0.56, 0.38, 0.38, 0.28)
    ctx.fillRect(vec.x, vec.y, vec.w, vec.h)
    cells(ctx, { x: vec.x + 3, y: vec.y + 3, w: vec.w - 6, h: vec.h - 6 }, r, 3)
    outline(ctx, vec)
  }
  const rf = sub(f, 0.08, big ? 0.4 : 0.55, 0.26, big ? 0.2 : 0.34)
  ctx.fillStyle = 'rgb(200,200,200)'
  ctx.fillRect(rf.x, rf.y, rf.w, rf.h)
  ctx.fillStyle = 'rgb(60,60,60)'
  for (let y = rf.y + 2; y < rf.y + rf.h - 1; y += 3) ctx.fillRect(rf.x + 2, y, rf.w - 4, 1)
}

/** Graphics: many identical shader clusters around a shared cache. */
function gpu(ctx: CanvasRenderingContext2D, f: Rect, r: () => number) {
  const cols = 3
  const rows = 4
  const gap = 5
  const band = f.h * 0.14
  const cw = (f.w - gap * (cols + 1)) / cols
  const ch = (f.h - band - gap * (rows + 2)) / rows
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const top = j < rows / 2 ? f.y + gap + j * (ch + gap) : f.y + band + gap * 2 + j * (ch + gap)
      const c = { x: f.x + gap + i * (cw + gap), y: top, w: cw, h: ch }
      cells(ctx, c, r, 3)
      sram(ctx, { x: c.x + 2, y: c.y + c.h * 0.62, w: c.w - 4, h: c.h * 0.32 }, 3)
      outline(ctx, c)
    }
  sram(ctx, { x: f.x + gap, y: f.y + f.h / 2 - band / 2, w: f.w - gap * 2, h: band }, 4)
}

/** The neural unit: one big regular array of multiply-accumulate cells, fed from buffers either side. */
function npu(ctx: CanvasRenderingContext2D, f: Rect) {
  sram(ctx, sub(f, 0.03, 0.04, 0.16, 0.92), 4)
  sram(ctx, sub(f, 0.81, 0.04, 0.16, 0.92), 4)
  const a = sub(f, 0.23, 0.06, 0.54, 0.88)
  ctx.fillStyle = 'rgb(34,34,34)'
  ctx.fillRect(a.x, a.y, a.w, a.h)
  const n = 12
  const cw = a.w / n
  const ch = a.h / n
  ctx.fillStyle = 'rgb(222,222,222)'
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) ctx.fillRect(a.x + i * cw + 1, a.y + j * ch + 1, cw - 2.2, ch - 2.2)
  outline(ctx, a)
}

/** The camera pipeline: fixed-function stages in a row, with line buffers between them. */
function isp(ctx: CanvasRenderingContext2D, f: Rect, r: () => number) {
  const stages = 5
  const gap = 4
  const sw = (f.w - gap * (stages + 1)) / stages
  for (let i = 0; i < stages; i++) {
    const s = { x: f.x + gap + i * (sw + gap), y: f.y + 4, w: sw, h: f.h - 8 }
    cells(ctx, { x: s.x, y: s.y, w: s.w, h: s.h * 0.62 }, r, 3)
    sram(ctx, { x: s.x, y: s.y + s.h * 0.68, w: s.w, h: s.h * 0.32 }, 3)
    outline(ctx, s)
  }
}

/** The modem: DSP clusters for the baseband, and the analog front end with its spiral inductors. */
function modem(ctx: CanvasRenderingContext2D, f: Rect, r: () => number) {
  for (let i = 0; i < 3; i++) {
    const c = sub(f, 0.03 + i * 0.16, 0.08, 0.14, 0.84)
    cells(ctx, { x: c.x, y: c.y, w: c.w, h: c.h * 0.6 }, r, 3)
    sram(ctx, { x: c.x, y: c.y + c.h * 0.66, w: c.w, h: c.h * 0.34 }, 3)
    outline(ctx, c)
  }
  const rf = sub(f, 0.53, 0.06, 0.44, 0.88)
  ctx.fillStyle = 'rgb(30,30,30)'
  ctx.fillRect(rf.x, rf.y, rf.w, rf.h)
  outline(ctx, rf)
  const coil = rf.h * 0.72
  for (let k = 0; k < 2; k++) {
    const cx = rf.x + rf.w * (0.27 + k * 0.46)
    const cy = rf.y + rf.h / 2
    ctx.strokeStyle = INK
    ctx.lineWidth = 2
    for (let turn = 0; turn < 4; turn++) {
      const s = coil / 2 - turn * (coil / 10)
      ctx.strokeRect(cx - s, cy - s, s * 2, s * 2)
    }
  }
}

/** The memory interface: rows of I/O drivers along the edge the DRAM sits over, and the controller behind them. */
function mem(ctx: CanvasRenderingContext2D, f: Rect, r: () => number) {
  cells(ctx, sub(f, 0.02, 0.05, 0.96, 0.36), r, 3)
  const pads = Math.floor(f.w / 12)
  const pw = f.w / pads
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < pads; i++) {
      const x = f.x + i * pw + 1.5
      const y = f.y + f.h * (0.48 + row * 0.26)
      ctx.fillStyle = INK
      ctx.fillRect(x, y, pw - 3, f.h * 0.14)
      ctx.fillStyle = 'rgb(150,150,150)'
      ctx.fillRect(x + 1.5, y + f.h * 0.16, pw - 6, f.h * 0.06)
    }
}

/**
 * A block's top face: its own floorplan, in grey, for the role colour to tint.
 *
 * Every block used to be one flat lit slab, so "the prime core is on" and "the
 * modem is on" looked like the same panel in two colours. Each now wears what
 * that kind of silicon actually looks like from above, and the power-gating
 * motion lights and darkens a circuit rather than a panel.
 */
function blockFace(b: Block) {
  return paint(`phone-block:${b.id}`, Math.round(b.w * PX), Math.round(b.d * PX), (ctx, w, h) => {
    const r = rng(b.id.length * 131 + b.id.charCodeAt(b.id.length - 1))
    ctx.fillStyle = SIDE
    ctx.fillRect(0, 0, w, h)
    const f = { x: w * FRAME, y: h * FRAME, w: w * (1 - FRAME * 2), h: h * (1 - FRAME * 2) }
    ctx.fillStyle = FILL
    ctx.fillRect(f.x, f.y, f.w, f.h)
    const inner = { x: f.x + 3, y: f.y + 3, w: f.w - 6, h: f.h - 6 }
    if (b.role === 'prime') core(ctx, inner, r, true)
    else if (b.role === 'little') core(ctx, inner, r, false)
    else if (b.role === 'gpu') gpu(ctx, inner, r)
    else if (b.role === 'npu') npu(ctx, inner)
    else if (b.role === 'isp') isp(ctx, inner, r)
    else if (b.role === 'modem') modem(ctx, inner, r)
    else mem(ctx, inner, r)
    outline(ctx, f, 2.5)
  })
}

/*
 * The die between the blocks, drawn from the same BLOCKS table the blocks are
 * placed with so it cannot disagree with them.
 *
 * Round every block is its power switch: a collar of header transistors
 * standing between that block and the supply. That collar is the mechanism of
 * the dark-silicon chapter — when a block goes out, it is these that opened —
 * so it is drawn, as a ring of small cells just outside each block's footprint.
 * Everything else is the uncore: glue logic, a bump ring at the edge, and the
 * seal ring round it.
 */
const dieMap = () =>
  paint('phone-die', Math.round(DIE.w * 200), Math.round(DIE.d * 200), (ctx, w, h) => {
    const S = w / DIE.w
    const r = rng(1107)
    ctx.fillStyle = '#161d2b'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 9000; i++) {
      const v = 26 + r() * 26
      ctx.fillStyle = `rgba(${v},${v + 6},${v + 20},0.55)`
      ctx.fillRect(r() * w, r() * h, 2, 2)
    }
    // Glue logic in the channels: faint rows, so the gaps read as silicon, not as a tray.
    for (let y = 24; y < h - 24; y += 5) {
      let x = 24
      while (x < w - 24) {
        const len = 3 + r() * 16
        const v = 40 + r() * 22
        ctx.fillStyle = `rgba(${v},${v + 8},${v + 22},0.8)`
        ctx.fillRect(x, y, Math.min(len, w - 24 - x), 2.4)
        x += len + 2 + r() * 3
      }
    }
    const toPx = (x: number, z: number) => [(x + DIE.w / 2) * S, (z + DIE.d / 2) * S] as const
    for (const b of BLOCKS) {
      const [cx, cy] = toPx(b.x, b.z)
      const bw = b.w * S
      const bd = b.d * S
      // The block's own footprint, bare, with a keep-out gap round it.
      ctx.fillStyle = '#0d121c'
      ctx.fillRect(cx - bw / 2 - 7, cy - bd / 2 - 7, bw + 14, bd + 14)
      // The switch collar.
      const ring = 5
      const x0 = cx - bw / 2 - ring - 3
      const y0 = cy - bd / 2 - ring - 3
      const rw = bw + (ring + 3) * 2
      const rh = bd + (ring + 3) * 2
      ctx.fillStyle = 'rgba(150,170,205,0.7)'
      for (let x = x0; x < x0 + rw - 3; x += 6) {
        ctx.fillRect(x, y0, 4, ring)
        ctx.fillRect(x, y0 + rh - ring, 4, ring)
      }
      for (let y = y0 + ring + 2; y < y0 + rh - ring - 3; y += 6) {
        ctx.fillRect(x0, y, ring, 4)
        ctx.fillRect(x0 + rw - ring, y, ring, 4)
      }
    }
    // Bump pads round the edge, and the seal ring outside them.
    ctx.fillStyle = 'rgba(175,190,215,0.75)'
    for (let x = 22; x < w - 22; x += 16) {
      ctx.fillRect(x, 10, 8, 8)
      ctx.fillRect(x, h - 18, 8, 8)
    }
    for (let y = 30; y < h - 30; y += 16) {
      ctx.fillRect(10, y, 8, 8)
      ctx.fillRect(w - 18, y, 8, 8)
    }
    ctx.strokeStyle = 'rgba(200,210,228,0.85)'
    ctx.lineWidth = 4
    ctx.strokeRect(3, 3, w - 6, h - 6)
  })

/**
 * The gauge's face: a watt scale under the channel the reading runs in.
 *
 * One tick a watt on the same 0-10 W scale `thermalAt` reports in, and the
 * three-to-five watt band the copy names tinted green, so "what the case can
 * shed" is a range on the instrument rather than one line the reader has to
 * take on trust. The green mark still sits where it always has, inside it.
 */
const GAUGE = { w: 4.6, pad: 0.2, d: 0.46 }
const gaugeFace = () =>
  paint('phone-gauge', 1024, Math.round((1024 * GAUGE.d) / (GAUGE.w + GAUGE.pad * 2)), (ctx, w, h) => {
    const r = rng(505)
    ctx.fillStyle = '#1a212c'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 1600; i++) {
      const v = 22 + r() * 14
      ctx.fillStyle = `rgba(${v},${v + 4},${v + 10},0.6)`
      ctx.fillRect(r() * w, r() * h, 2, 2)
    }
    const at = (share: number) => ((GAUGE.pad + share * GAUGE.w) / (GAUGE.w + GAUGE.pad * 2)) * w
    // The band the case can shed continuously, front and back of the channel.
    const lo = at(SHED_MIN_W / WATTS_MAX)
    const hi = at(SHED_MAX_W / WATTS_MAX)
    ctx.fillStyle = 'rgba(110,231,168,0.42)'
    ctx.fillRect(lo, h * 0.06, hi - lo, h * 0.18)
    ctx.fillRect(lo, h * 0.76, hi - lo, h * 0.18)
    ctx.fillStyle = 'rgba(205,214,228,0.95)'
    for (let k = 0; k <= WATTS_MAX; k++) {
      const x = at(k / WATTS_MAX)
      const long = k % 5 === 0
      ctx.fillRect(x - 1.5, h * 0.76, 3, h * (long ? 0.14 : 0.08))
      ctx.fillRect(x - 1.5, h * (long ? 0.1 : 0.16), 3, h * (long ? 0.14 : 0.08))
    }
    ctx.font = `500 ${Math.round(h * 0.13)}px "JetBrains Mono", Menlo, monospace`
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'left'
    ctx.fillText('0 W', at(0) + 8, h * 0.98)
    ctx.textAlign = 'right'
    ctx.fillText(`${WATTS_MAX} W`, at(1) - 8, h * 0.98)
  })

/** A soft pool of shade under the package, since this scene has no bench or board to rest on. */
const shadeMap = () =>
  paint('phone-shade', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillRect(0, 0, w, h)
    ctx.filter = 'blur(22px)'
    ctx.fillStyle = '#000'
    ctx.fillRect(w * 0.18, h * 0.18, w * 0.64, h * 0.64)
    ctx.filter = 'none'
  })

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

/**
 * The package the die is soldered to: a routed substrate under a glossy mask,
 * with a ring of capacitors round the die — the same kind of object as the
 * processor package in Lecture 1 and the laptop's SoC in Lecture 5, which is
 * the comparison the first beat asks for.
 */
function Package() {
  const shade = useMemo(() => shadeMap(), [])
  const caps = useMemo(() => {
    const out: Array<[number, number, boolean]> = []
    const ex = DIE.w / 2 + (PKG.w - DIE.w) / 4
    const ez = DIE.d / 2 + (PKG.d - DIE.d) / 4
    for (let i = 0; i < 11; i++) {
      const u = (i / 10 - 0.5) * DIE.w * 0.86
      out.push([u, -ez, false], [u, ez, false])
    }
    for (let i = 0; i < 7; i++) {
      const u = (i / 6 - 0.5) * DIE.d * 0.8
      out.push([-ex, u, true], [ex, u, true])
    }
    return out
  }, [])
  const top = PKG.y + PKG.h / 2
  return (
    <group>
      <mesh position={[0, PKG.y, 0]} castShadow receiveShadow geometry={roundedBox(PKG.w, PKG.h, PKG.d, 0.03)}>
        <meshStandardMaterial attach="material-0" color="#172419" roughness={0.7} metalness={0.05} />
        <meshStandardMaterial attach="material-1" color="#172419" roughness={0.7} metalness={0.05} />
        <meshPhysicalMaterial
          attach="material-2"
          color="#6a7f70"
          map={substrateMap()}
          bumpMap={substrateBump()}
          bumpScale={1}
          roughness={0.42}
          metalness={0.1}
          clearcoat={0.5}
          clearcoatRoughness={0.4}
        />
        <meshStandardMaterial attach="material-3" color="#172419" roughness={0.7} metalness={0.05} />
        <meshStandardMaterial attach="material-4" color="#172419" roughness={0.7} metalness={0.05} />
        <meshStandardMaterial attach="material-5" color="#172419" roughness={0.7} metalness={0.05} />
      </mesh>
      {caps.map(([x, z, turn], i) => (
        <group key={i} position={[x, top + 0.022, z]} rotation={[0, turn ? Math.PI / 2 : 0, 0]}>
          <mesh castShadow geometry={roundedBox(0.08, 0.042, 0.06, 0.01, 2)}>
            <meshStandardMaterial color="#9b7650" roughness={0.55} metalness={0.05} />
          </mesh>
          <mesh geometry={roundedBox(0.12, 0.044, 0.062, 0.01, 2)}>
            <meshStandardMaterial color="#d6d9de" roughness={0.28} metalness={1} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, PKG.y - PKG.h / 2 - 0.02, 0.2]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[PKG.w * 1.55, (PKG.d + 0.9) * 1.55]} />
        <meshBasicMaterial map={shade} transparent opacity={0.7} depthWrite={false} color="#000000" />
      </mesh>
    </group>
  )
}

function Die() {
  const named = useNamer('phone')
  return (
    <mesh position={[0, -0.06, 0]} castShadow receiveShadow geometry={topFaced(DIE.w, 0.12, DIE.d, 0.02)} {...named('phone:die')}>
      <meshPhysicalMaterial
        color="#b4c4dc"
        map={dieMap()}
        roughness={0.3}
        metalness={0.5}
        iridescence={0.5}
        iridescenceIOR={1.7}
        iridescenceThicknessRange={[240, 620]}
        clearcoat={0.6}
        clearcoatRoughness={0.15}
      />
    </mesh>
  )
}

function Blocks() {
  const group = useRef<THREE.Group>(null!)
  const named = useNamer('phone')
  const levels = useRef<number[]>(BLOCKS.map(() => 0))
  const tint = useMemo(() => new THREE.Color(), [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.motion ?? ''
    const t = state.clock.elapsedTime
    const th = thermalAt(t)

    if (import.meta.env.DEV) {
      /* The throttle claim is not observable from outside: the clock multiplier
         changes the *rate* of an oscillation, and sampling that over a browser
         round-trip aliases it away entirely. Exposed directly so the beat can
         be checked rather than assumed. */
      ;(window as unknown as Record<string, unknown>).__thermal = () => thermalAt(performance.now() / 1000)
      ;(window as unknown as Record<string, unknown>).__thermalNow = () => th
    }

    group.current.children.forEach((child, i) => {
      const block = BLOCKS[i]
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial

      const on = powered(block, t, focus)
      /* Gated hard to zero rather than damped toward it. Power gating happens
         in microseconds and is binary — a block is connected to the supply or
         it is not — so a gentle fade would misrepresent the mechanism. */
      const target = on ? 1 : 0
      levels.current[i] = damp(levels.current[i], target, on ? 14 : 20, dt)
      const v = levels.current[i]

      /* Prime cores work in bursts and efficiency cores tick along steadily,
         and the difference in rhythm is the point of the big.LITTLE beats.
         Both run on the throttled clock, so when the case gets hot the whole
         die visibly slows.

         Only on the beats that are *about* rhythm, though. This ran on every
         beat, including ones about integration, serviceability and the thermal
         budget, where a 0.9 s sine on the prime cores is the "this object is
         alive" filler the rest of the course had already purged — and fast
         enough to read as flicker rather than as work. */
      const rhythmic = ['prime', 'little', 'scheduler', 'throttle'].includes(focus)
      const beat = !rhythmic
        ? 0.75
        : block.role === 'prime'
          ? 0.6 + 0.4 * Math.sin(t * th.clock * 7)
          : block.role === 'little'
            ? 0.55 + 0.2 * Math.sin(t * th.clock * 2.4 - i)
            : 0.75

      tint.copy(C[block.role])
      mat.color.copy(tint).multiplyScalar(0.14 + v * 0.16)
      mat.emissive.copy(tint)
      setEmissive(mat, v * beat * 1.5 + 0.03)
      // Powered blocks stand slightly proud, so "off" reads even in silhouette.
      mesh.scale.y = 0.35 + v * 0.65
      mesh.position.y = (0.18 * (0.35 + v * 0.65)) / 2
    })
  })

  return (
    <group ref={group}>
      {BLOCKS.map((b) => {
        const face = blockFace(b)
        return (
          <mesh
            key={b.id}
            position={[b.x, 0.09, b.z]}
            castShadow
            geometry={topFaced(b.w, 0.18, b.d, 0.025)}
            {...named(`phone:${b.role}`)}
          >
            <meshPhysicalMaterial
              color={C[b.role]}
              map={face}
              emissive={C[b.role]}
              emissiveMap={face}
              emissiveIntensity={0.4}
              roughness={0.4}
              metalness={0.15}
              clearcoat={0.6}
              clearcoatRoughness={0.15}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/**
 * The case temperature, and the line it may not cross.
 *
 * The limit drawn here is what a hand can hold, not what the silicon can take.
 * The chip would happily run hotter; the person holding it is the constraint,
 * which is why a phone's real ceiling is roughly 3-5 W sustained however good
 * the processor is.
 *
 * An instrument now rather than a bare bar: an anodised plate with the watt
 * scale etched into it, a channel the reading runs in, and the two limits as
 * posts standing out of the plate.
 */
function HeatBar() {
  const named = useNamer('phone')
  const fill = useRef<THREE.Mesh>(null!)
  const group = useRef<THREE.Group>(null!)
  const shown = useRef(0)
  const W = GAUGE.w

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.motion ?? ''
    const on = ['sealed', 'throttle', 'budget'].includes(focus)
    shown.current = damp(shown.current, on ? 1 : 0, 4, dt)
    group.current.visible = shown.current > 0.02
    group.current.scale.setScalar(Math.max(shown.current, 0.0001))

    const th = thermalAt(state.clock.elapsedTime)
    fill.current.scale.x = Math.max(th.heat, 0.0001)
    fill.current.position.x = -W / 2 + (th.heat * W) / 2
    const mat = fill.current.material as THREE.MeshStandardMaterial
    mat.emissive.setHex(th.throttled ? 0xff7a92 : 0xffab40)
    setEmissive(mat, th.throttled ? 1.8 : 0.9)

    if (on) {
      /* Labels the axis, which the bar itself cannot do. The clock multiplier
         is published too: `thermalAt().clock` drives the animation rate of
         every block in this scene — throttling is literal here rather than
         depicted — and the reader was never told the number. */
      publishReadout('phone', d.scene, [
        { label: 'Asking for', value: `${th.watts.toFixed(1)} W`, key: true },
        { label: 'Can shed continuously', value: `~${SHED_MIN_W}–${SHED_MAX_W} W` },
        { label: 'Clock', value: `${Math.round(th.clock * 100)}%` },
        { label: 'State', value: th.throttled ? 'throttled' : 'sprinting' },
      ])
    }
  })

  const face = useMemo(() => gaugeFace(), [])
  return (
    <group ref={group} position={[0, 0.05, 2.35]}>
      {/* The plate, with its scale. */}
      <mesh position={[0, -0.03, 0]} castShadow receiveShadow geometry={topFaced(W + GAUGE.pad * 2, 0.05, GAUGE.d, 0.02)}>
        <meshStandardMaterial color="#ffffff" map={face} roughness={0.55} metalness={0.4} />
      </mesh>
      {/* The channel the reading runs in. */}
      <mesh position={[0, 0.0, 0]} receiveShadow geometry={roundedBox(W + 0.04, 0.02, 0.2, 0.008)}>
        <meshStandardMaterial color="#07090d" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh ref={fill} scale={[0.0001, 1, 1]} geometry={roundedBox(W, 0.07, 0.17, 0.02)} {...named('phone:heat')}>
        <meshPhysicalMaterial
          color="#2a1d10"
          emissive="#ffab40"
          emissiveIntensity={0.9}
          roughness={0.3}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
        />
      </mesh>
      {/* What the case can shed continuously. Everything to the right of this
          is borrowed time. */}
      <mesh position={[-W / 2 + W * SUSTAINED, 0.06, 0]} geometry={roundedBox(0.035, 0.22, 0.32, 0.01)} {...named('phone:sustained')}>
        <meshStandardMaterial color="#1b2a22" emissive="#6ee7a8" emissiveIntensity={1.4} />
      </mesh>
      {/* Too hot to hold. */}
      <mesh position={[W / 2 - 0.06, 0.06, 0]} geometry={roundedBox(0.035, 0.22, 0.32, 0.01)} {...named('phone:toohot')}>
        <meshStandardMaterial color="#3a1420" emissive="#ff7a92" emissiveIntensity={1.6} />
      </mesh>
    </group>
  )
}
