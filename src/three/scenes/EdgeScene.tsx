import { useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { useNamer } from '../naming'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { damp } from '../../lib/math'
import { benchMap, coreFloorplan, flashTop, roundedBox, sramArray, tiled, topFaced } from '../surfaces'
import { BLOCKS, C, DIE, PERIOD, dutyAt, powered, type Block, type Role } from './edgeLayout'

/**
 * A device that is almost never awake.
 *
 * The only scene in the course whose main event is that nothing happens. It
 * would have been easy to make this look busy and it would have taught the
 * opposite of the truth — the reason a sensor lasts years on a coin cell is
 * that it is switched off for essentially all of its life.
 *
 * The look is the studio look of the rest of the course: the same anodised
 * bench, rounded geometry and lacquered faces. What is new here is only what
 * this chip needs — a die whose floor is drawn from the same block table the
 * blocks stand on, and faces for the three blocks no earlier chapter has
 * drawn: a counter, a radio and an analogue front end. None of it is lit
 * unless the layout says that block is powered; the furniture never is.
 */
export function EdgeScene() {
  return (
    <Part
      id="edge"
      tags={['asleep', 'timer', 'wake', 'work', 'sleep', 'noos', 'unreachable', 'determinism']}
      position={[0, 0, 0]}
    >
      <Bench />
      <Die />
      <Blocks />
      <DutyTrace />
    </Part>
  )
}

/* ------------------------------------------------------------------ */
/* Surfaces this scene alone needs                                      */
/* ------------------------------------------------------------------ */

/*
 * Painted once, lazily, on the same terms as the shared surfaces: a fixed seed
 * per texture so every load looks the same, and the framed convention for the
 * block faces — a uniform 10% border that `topFaced` samples for the sides, so
 * a slab's sides glow at a steady fraction of whatever its face is doing.
 */
const cache = new Map<string, THREE.CanvasTexture>()

function painted(key: string, w: number, h: number, paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  paint(canvas.getContext('2d')!, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  cache.set(key, tex)
  return tex
}

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const FRAME = 0.1
const SIDE = 'rgb(150,150,150)'

/** A face at a block's own proportions, with the shared frame, and its field. */
function framedFace(key: string, block: Block, draw: (ctx: CanvasRenderingContext2D, f: { x: number; y: number; w: number; h: number }) => void) {
  const w = 512
  const h = Math.round((512 * block.d) / block.w)
  return painted(`edge-face:${key}`, w, h, (ctx) => {
    ctx.fillStyle = SIDE
    ctx.fillRect(0, 0, w, h)
    const f = { x: w * FRAME, y: h * FRAME, w: w * (1 - FRAME * 2), h: h * (1 - FRAME * 2) }
    ctx.fillStyle = 'rgb(58,58,58)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    draw(ctx, f)
  })
}

/**
 * The timer: a ripple counter and the oscillator that clocks it.
 *
 * A low-power timer is a slow crystal — 32 kHz is typical — and a chain of
 * flip-flops, each toggling at half the rate of the one before. So the face is
 * the oscillator's round cell and one row of equal cells: small and regular,
 * which is the point — there is almost nothing here to power.
 */
function timerFace(block: Block) {
  return framedFace('timer', block, (ctx, f) => {
    // The oscillator.
    const r = Math.min(f.w, f.h) * 0.2
    ctx.strokeStyle = 'rgb(240,240,240)'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(f.x + f.w * 0.22, f.y + f.h * 0.3, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = 'rgb(200,200,200)'
    ctx.fillRect(f.x + f.w * 0.22 - r * 0.25, f.y + f.h * 0.3 - r * 0.6, r * 0.5, r * 1.2)
    // The count chain: eight flip-flops, two rows.
    const cols = 8
    const cw = (f.w * 0.9) / cols
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < cols; i++) {
        const x = f.x + f.w * 0.05 + i * cw
        const y = f.y + f.h * (row === 0 ? 0.62 : 0.8) - f.h * 0.07
        ctx.fillStyle = 'rgb(165,165,165)'
        ctx.fillRect(x + 3, y, cw - 6, f.h * 0.14)
        ctx.fillStyle = 'rgb(255,255,255)'
        ctx.fillRect(x + cw / 2 - 3, y + f.h * 0.04, 6, f.h * 0.06)
      }
    // The comparator that fires the wake, beside the oscillator.
    ctx.fillStyle = 'rgb(210,210,210)'
    ctx.beginPath()
    ctx.moveTo(f.x + f.w * 0.52, f.y + f.h * 0.14)
    ctx.lineTo(f.x + f.w * 0.84, f.y + f.h * 0.3)
    ctx.lineTo(f.x + f.w * 0.52, f.y + f.h * 0.46)
    ctx.closePath()
    ctx.fill()
  })
}

/**
 * The radio: an on-chip inductor and the amplifiers either side of it.
 *
 * The spiral is the one shape on an RF die anybody can find, and it is large —
 * a coil takes more area than a lot of the logic — which is honest about where
 * this block's cost comes from before a milliamp is spent.
 */
function radioFace(block: Block) {
  return framedFace('radio', block, (ctx, f) => {
    const cx = f.x + f.w / 2
    const cy = f.y + f.h * 0.3
    const turns = 4
    const outer = f.w * 0.44
    const pitch = outer / (turns + 1.4)
    ctx.strokeStyle = 'rgb(255,255,255)'
    ctx.lineWidth = pitch * 0.55
    ctx.lineJoin = 'miter'
    ctx.beginPath()
    // An octagonal spiral, inward: every RF process draws its coils this way.
    for (let k = 0; k <= turns * 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8
      const rad = outer - (k / 8) * pitch
      const x = cx + Math.cos(a) * rad
      const y = cy + Math.sin(a) * rad
      if (k === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    // The underpass out of the centre.
    ctx.lineWidth = pitch * 0.35
    ctx.strokeStyle = 'rgb(190,190,190)'
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx, f.y + f.h * 0.62)
    ctx.stroke()
    // Power amplifier and low-noise amplifier: rows of transistor fingers.
    for (const [y0, fingers] of [[0.64, 14], [0.82, 9]] as const) {
      const x0 = f.x + f.w * 0.12
      const bw = f.w * 0.76
      ctx.fillStyle = 'rgb(120,120,120)'
      ctx.fillRect(x0, f.y + f.h * y0, bw, f.h * 0.12)
      ctx.fillStyle = 'rgb(235,235,235)'
      for (let i = 0; i < fingers; i++)
        ctx.fillRect(x0 + 6 + (i * (bw - 12)) / fingers, f.y + f.h * y0 + 6, (bw - 12) / fingers - 5, f.h * 0.12 - 12)
    }
  })
}

/**
 * The sensor front end: a capacitor array and the comparator that reads it.
 *
 * An on-chip sensor's reading ends in an analogue-to-digital converter, and the
 * common low-power one is a successive-approximation converter — a
 * binary-weighted array of capacitors, halving at each step, and one
 * comparator. The halving is drawn as it is laid out: one big group, then
 * half, then half again.
 */
function sensorFace(block: Block) {
  return framedFace('sensor', block, (ctx, f) => {
    let y = f.y + f.h * 0.06
    let rows = 6
    const unit = f.w * 0.1
    for (let bit = 0; bit < 4; bit++) {
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < 8; c++) {
          ctx.fillStyle = (r + c) % 2 ? 'rgb(170,170,170)' : 'rgb(205,205,205)'
          ctx.fillRect(f.x + f.w * 0.08 + c * unit, y + r * unit * 0.62, unit - 4, unit * 0.62 - 4)
        }
      y += rows * unit * 0.62 + f.h * 0.025
      rows = Math.max(1, Math.round(rows / 2))
    }
    // The comparator.
    ctx.fillStyle = 'rgb(255,255,255)'
    ctx.beginPath()
    ctx.moveTo(f.x + f.w * 0.25, f.y + f.h * 0.76)
    ctx.lineTo(f.x + f.w * 0.75, f.y + f.h * 0.86)
    ctx.lineTo(f.x + f.w * 0.25, f.y + f.h * 0.96)
    ctx.closePath()
    ctx.fill()
  })
}

/** Shared die maps, re-framed into a block's proportions. */
function reframed(key: string, block: Block, source: () => THREE.Texture, rows = 1) {
  return framedFace(key, block, (ctx, f) => {
    const img = source().image as HTMLCanvasElement
    for (let r = 0; r < rows; r++) {
      const h = (f.h - (rows - 1) * 6) / rows
      ctx.drawImage(img, 0, 0, Math.min(img.width, (img.height * f.w) / h), img.height, f.x, f.y + r * (h + 6), f.w, h)
    }
  })
}

const FACES: Record<Role, (b: Block) => THREE.Texture> = {
  core: (b) => reframed('core', b, coreFloorplan),
  flash: () => flashTop(),
  sram: (b) => reframed('sram', b, sramArray, 2),
  timer: timerFace,
  radio: radioFace,
  sensor: sensorFace,
}

/** Die space to canvas space: +x right, +z toward the reader (the bottom of the image). */
const DIE_PX = 400
const dieX = (x: number) => (x / DIE.w + 0.5) * DIE.w * DIE_PX
const dieY = (z: number) => (z / DIE.d + 0.5) * DIE.d * DIE_PX

/**
 * The die's own floor, drawn from BLOCKS so it cannot disagree with them.
 *
 * Everything that is not one of the six blocks is still silicon doing
 * something: rows of standard cells for the glue logic, power straps across
 * them, the bus from the core to each block, a ring of bond pads, and the seal
 * ring round the edge. The timer's keep-out carries a ring of its own: it is a
 * separate power domain, the one that is never switched off, and a real
 * floorplan marks it the same way.
 *
 * A colour map under ordinary light, never emissive. It is furniture.
 */
const dieMap = () =>
  painted('edge-die', Math.round(DIE.w * DIE_PX), Math.round(DIE.d * DIE_PX), (ctx, w, h) => {
    const r = rng(1207)
    ctx.fillStyle = '#141a26'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 9000; i++) {
      const v = 22 + r() * 18
      ctx.fillStyle = `rgba(${v},${v + 5},${v + 16},0.55)`
      ctx.fillRect(r() * w, r() * h, 2, 2)
    }

    // Keep-outs: the blocks' footprints with a margin.
    const pad = 0.06 * DIE_PX
    const keep = BLOCKS.map((b) => ({
      b,
      x0: dieX(b.x - b.w / 2) - pad,
      x1: dieX(b.x + b.w / 2) + pad,
      y0: dieY(b.z - b.d / 2) - pad,
      y1: dieY(b.z + b.d / 2) + pad,
    }))
    const inside = (x: number, y: number) => keep.some((k) => x > k.x0 && x < k.x1 && y > k.y0 && y < k.y1)

    // The core area: inside the pad ring.
    const ring = 0.3 * DIE_PX
    const core = { x0: ring, y0: ring, x1: w - ring, y1: h - ring }

    // Standard-cell rows for the glue logic.
    for (let y = core.y0; y < core.y1; y += 7) {
      let x = core.x0
      while (x < core.x1) {
        const len = 3 + r() * 16
        if (!inside(x, y) && !inside(x + len, y)) {
          const v = 44 + r() * 30
          ctx.fillStyle = `rgb(${v},${v + 6},${v + 18})`
          ctx.fillRect(x, y, Math.min(len, core.x1 - x), 3.6)
        }
        x += len + 1.5 + r() * 3
      }
    }
    // Power straps, over the rows.
    ctx.fillStyle = 'rgba(120,140,170,0.28)'
    for (let x = core.x0 + 30; x < core.x1; x += 0.25 * DIE_PX) ctx.fillRect(x, core.y0, 5, core.y1 - core.y0)

    /* The bus: from the core to every block, a bundle of seven lines — along
       the core's row, then down or up into the block if it is not level with
       it. Drawn under the keep-outs, so each bundle stops at the block it
       serves and only its run between blocks shows. */
    const hub = BLOCKS.find((b) => b.role === 'core')!
    const hx = dieX(hub.x)
    const hy = dieY(hub.z)
    ctx.strokeStyle = 'rgba(130,145,170,0.4)'
    ctx.lineWidth = 2
    for (const k of keep) {
      if (k.b === hub) continue
      const tx = (k.x0 + k.x1) / 2
      const ty = (k.y0 + k.y1) / 2
      const level = hy > k.y0 + 20 && hy < k.y1 - 20
      for (let lane = -3; lane <= 3; lane++) {
        const o = lane * 7
        ctx.beginPath()
        ctx.moveTo(hx, hy + o)
        if (level) ctx.lineTo(tx, hy + o)
        else {
          ctx.lineTo(tx + o, hy + o)
          ctx.lineTo(tx + o, ty)
        }
        ctx.stroke()
      }
    }

    // Keep-outs: a darker floor with a thin metal edge, so each block sits in its place.
    for (const k of keep) {
      ctx.fillStyle = '#0b0f17'
      ctx.fillRect(k.x0, k.y0, k.x1 - k.x0, k.y1 - k.y0)
      ctx.strokeStyle = 'rgba(150,165,190,0.45)'
      ctx.lineWidth = 2
      ctx.strokeRect(k.x0 + 1, k.y0 + 1, k.x1 - k.x0 - 2, k.y1 - k.y0 - 2)
    }

    // The always-on domain, round the timer.
    const t = keep.find((k) => k.b.role === 'timer')!
    ctx.setLineDash([14, 9])
    ctx.strokeStyle = 'rgba(255,171,64,0.55)'
    ctx.lineWidth = 3
    ctx.strokeRect(t.x0 - 12, t.y0 - 12, t.x1 - t.x0 + 24, t.y1 - t.y0 + 24)
    ctx.setLineDash([])

    // Bond pads round the edge. The outer 5% stays plain: `topFaced` samples it for the sides.
    const edge = Math.min(w, h) * 0.06
    const pitch = 46
    const padW = 24
    ctx.fillStyle = 'rgb(92,100,114)'
    for (let x = ring; x < w - ring - padW; x += pitch) {
      ctx.fillRect(x, edge + 10, padW, padW * 1.2)
      ctx.fillRect(x, h - edge - 10 - padW * 1.2, padW, padW * 1.2)
    }
    for (let y = ring; y < h - ring - padW; y += pitch) {
      ctx.fillRect(edge + 10, y, padW * 1.2, padW)
      ctx.fillRect(w - edge - 10 - padW * 1.2, y, padW * 1.2, padW)
    }

    // Seal ring, inside the plain border.
    ctx.strokeStyle = 'rgba(190,200,220,0.7)'
    ctx.lineWidth = 5
    ctx.strokeRect(edge * 0.9, edge * 0.9, w - edge * 1.8, h - edge * 1.8)

    // The course's own mark, etched in a clear corner of the logic: never a real vendor's.
    ctx.font = '600 30px "JetBrains Mono", Menlo, monospace'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'right'
    const mark = 'ANATOMY · L12 · MCU'
    const mw = ctx.measureText(mark).width
    ctx.fillStyle = '#141a26'
    ctx.fillRect(w - ring - 24 - mw - 12, h - ring - 52, mw + 24, 40)
    ctx.fillStyle = 'rgba(150,160,178,0.6)'
    ctx.fillText(mark, w - ring - 24, h - ring - 32)
  })

/**
 * A soft shadow under the bench, painted.
 *
 * The course's contact shadow is one shared instance and this chapter has no
 * footprint registered with it; this is the same idea without touching that:
 * a blurred rounded rectangle, black in colour and soft in alpha, on a plane
 * that never writes depth. The colour is white and the black is in the map,
 * so the hover lift and the dimming pass, which both write `color`, cannot
 * turn it grey.
 */
const shadowMap = () =>
  painted('edge-shadow', 512, 384, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#000'
    ctx.shadowColor = 'rgba(0,0,0,0.85)'
    ctx.shadowBlur = 38
    ctx.shadowOffsetX = w * 4
    ctx.fillRect(w * 0.14 - w * 4, h * 0.16, w * 0.72, h * 0.68)
  })

/** The duty strip's graduations: one line per quarter of the period. */
const rulerMap = () =>
  painted('edge-ruler', 2048, 64, (ctx, w, h) => {
    ctx.fillStyle = '#0d1219'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i <= 4; i++) {
      ctx.fillStyle = 'rgba(120,140,168,0.55)'
      const x = Math.min(w - 5, Math.max(5, (i / 4) * w))
      ctx.fillRect(x - 5, 10, 10, h - 20)
    }
    // A fine rule along its length.
    ctx.fillStyle = 'rgba(90,108,135,0.4)'
    ctx.fillRect(0, h / 2 - 2, w, 4)
  })

/* ------------------------------------------------------------------ */
/* The chip                                                             */
/* ------------------------------------------------------------------ */

const BENCH = { w: DIE.w + 0.44, d: DIE.d + 0.44, h: 0.14 }
const DIE_H = 0.12
const DIE_Y = -DIE_H / 2
const BENCH_Y = -DIE_H - BENCH.h / 2

/**
 * What the die stands on. The same anodised finish and grid pitch as every
 * bench in the course, a bright machined lip so its edge catches a line, and a
 * soft shadow under it. Unnamed on purpose: it is the furniture, and the
 * nearest hit wins.
 */
function Bench() {
  const top = useMemo(() => tiled(benchMap(), BENCH.w / 0.5, BENCH.d / 0.5), [])
  const shadow = useMemo(shadowMap, [])
  return (
    <group>
      <mesh position={[0, BENCH_Y, 0]} receiveShadow geometry={roundedBox(BENCH.w, BENCH.h, BENCH.d, 0.05)}>
        <meshStandardMaterial color="#ffffff" map={top} roughness={0.62} metalness={0.35} />
      </mesh>
      <mesh position={[0, BENCH_Y + BENCH.h * 0.12, BENCH.d / 2 - 0.004]} geometry={roundedBox(BENCH.w - 0.08, BENCH.h * 0.5, 0.014, 0.006)}>
        <meshStandardMaterial color="#3a4654" roughness={0.26} metalness={0.95} />
      </mesh>
      <mesh position={[0, BENCH_Y - BENCH.h / 2 - 0.02, 0.05]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[BENCH.w * 1.4, BENCH.d * 1.47]} />
        <meshBasicMaterial color="#ffffff" map={shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Die() {
  const named = useNamer('edge')
  const map = useMemo(dieMap, [])
  return (
    <mesh position={[0, DIE_Y, 0]} receiveShadow geometry={topFaced(DIE.w, DIE_H, DIE.d, 0.02)} {...named('edge:die')}>
      <meshStandardMaterial color="#ffffff" map={map} roughness={0.38} metalness={0.45} />
    </mesh>
  )
}

const BLOCK_H = 0.16

function Blocks() {
  const named = useNamer('edge')
  const group = useRef<THREE.Group>(null!)
  const levels = useRef<number[]>(BLOCKS.map(() => 0))
  const tint = useMemo(() => new THREE.Color(), [])
  const faces = useMemo(() => BLOCKS.map((b) => FACES[b.role](b)), [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.focus ?? ''
    const t = state.clock.elapsedTime

    group.current.children.forEach((child, i) => {
      const block = BLOCKS[i]
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial
      const on = powered(block, t, focus)

      /* Snapping rather than fading. A microcontroller does not ramp into a
         wake — it is off, then it is on, within microseconds — and a soft fade
         would suggest something gentler and more continuous than what happens. */
      levels.current[i] = damp(levels.current[i], on ? 1 : 0, on ? 24 : 18, dt)
      const v = levels.current[i]

      /* Off is dark. Under the lacquer and the studio light a block at the
         old base colour read as lit even with its power removed, so the
         unpowered colour is lower and the powered one where it was. */
      tint.copy(C[block.role])
      mat.color.copy(tint).multiplyScalar(0.06 + v * 0.22)
      mat.emissive.copy(tint)
      /* The timer never reaches full brightness even when it is the only thing
         running: it is drawing a trickle, not working. The ceilings are higher
         than a flat slab's were because the light now comes through each
         block's own face, most of which is darker than its brightest lines —
         the ratio between them is what is kept. */
      const ceiling = block.role === 'timer' ? 0.85 : 2.4
      setEmissive(mat, 0.03 + v * ceiling)
      mesh.scale.y = 0.4 + v * 0.6
      mesh.position.y = (BLOCK_H * (0.4 + v * 0.6)) / 2
    })
  })

  return (
    <group ref={group}>
      {BLOCKS.map((b, i) => (
        <mesh
          key={b.id}
          position={[b.x, BLOCK_H / 2, b.z]}
          castShadow
          geometry={topFaced(b.w, BLOCK_H, b.d, 0.03)}
          {...named(`edge:${b.role}`)}
        >
          {/* Each block's face is the circuit it is, under the same clear
              lacquer as the course's other blocks; its colour is still its
              role, and its light is still whether it is powered. */}
          <meshPhysicalMaterial
            color={C[b.role]}
            emissive={C[b.role]}
            emissiveMap={faces[i]}
            emissiveIntensity={0.05}
            roughness={0.34}
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
 * The duty cycle, drawn as a strip of time.
 *
 * Nearly all of it is dark, and the point is the ratio rather than the events —
 * so the trace is wide, flat and mostly empty, and a reader who glances at it
 * should come away with "it is almost always off" before reading a word.
 *
 * Now an instrument rather than a row of tiles: the cells sit in a dark
 * channel in a bench-finished bezel, with a graduation either side at every
 * quarter of the period, so it reads as a scale of time, and the sweep is a
 * needle on a steel carriage.
 */
function DutyTrace() {
  const named = useNamer('edge')
  const group = useRef<THREE.Group>(null!)
  const ticks = useRef<THREE.Group>(null!)
  const marker = useRef<THREE.Group>(null!)
  const shown = useRef(0)
  const W = 4.2
  const TICKS = 60
  /* The strip shows one period, but starting half a period into the sleep, so
     the wake lands in the middle of it. Starting at the wake put the only lit
     stretch at the far left, under the copy card on a desktop layout, while the
     one tick sampled at exactly phase 1 (the next wake) lit up alone at the
     right: the reader was shown a lone blip where the copy says "the lit part".
     Ticks are sampled at their centres so that end tick is no longer lit. */
  const OFFSET = 0.5

  const bezel = useMemo(() => tiled(benchMap(), (W + 0.3) / 0.5, 0.5 / 0.5), [])
  const ruler = useMemo(rulerMap, [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.focus ?? ''
    const on = ['wake', 'work', 'sleep', 'determinism'].includes(focus)
    shown.current = damp(shown.current, on ? 1 : 0, 4, dt)
    group.current.visible = shown.current > 0.02
    group.current.scale.setScalar(Math.max(shown.current, 0.0001))

    const t = state.clock.elapsedTime
    const duty = dutyAt(t)
    marker.current.position.x = -W / 2 + ((duty.phase + OFFSET) % 1) * W

    // The trace itself is a fixed picture of one period: lit where awake.
    ticks.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
      const at = ((i + 0.5) / TICKS + OFFSET) % 1
      const awake = dutyAt(at * PERIOD).awake
      setEmissive(mat, awake ? 1.5 : 0.06)
    })
  })

  const cell = roundedBox(W / TICKS - 0.012, 0.05, 0.22, 0.008)

  return (
    <group ref={group} position={[0, 0.04, 1.85]}>
      {/* The bezel, and the dark channel the cells sit in. */}
      <mesh position={[0, -0.005, 0]} receiveShadow geometry={roundedBox(W + 0.3, 0.05, 0.5, 0.02)}>
        <meshStandardMaterial color="#ffffff" map={bezel} roughness={0.62} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.016, 0]} geometry={roundedBox(W + 0.08, 0.012, 0.28, 0.005)}>
        <meshStandardMaterial color="#070a0f" roughness={0.8} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, 0.021, side * 0.19]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W, 0.06]} />
          <meshStandardMaterial color="#ffffff" map={ruler} roughness={0.55} metalness={0.3} />
        </mesh>
      ))}

      {/* Only the cells go in here: the frame loop above walks these children. */}
      <group ref={ticks}>
        {Array.from({ length: TICKS }, (_, i) => (
          <mesh key={i} position={[-W / 2 + ((i + 0.5) / TICKS) * W, 0.04, 0]} geometry={cell} {...named('edge:duty')}>
            <meshPhysicalMaterial
              color="#0e2a36"
              emissive="#4fd8ff"
              emissiveIntensity={0.06}
              roughness={0.35}
              metalness={0.2}
              clearcoat={0.5}
              clearcoatRoughness={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* The needle: stands on the bezel rather than through it. */}
      <group ref={marker}>
        <mesh position={[0, 0.085, 0]} geometry={roundedBox(0.03, 0.14, 0.4, 0.01)}>
          <meshStandardMaterial color="#2a3340" emissive="#ffffff" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0, 0.03, -0.22]} geometry={roundedBox(0.08, 0.04, 0.06, 0.015)}>
          <meshStandardMaterial color="#232a33" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>
    </group>
  )
}
