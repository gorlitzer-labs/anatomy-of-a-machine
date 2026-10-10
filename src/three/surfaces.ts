import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/**
 * Procedural surfaces: every texture here is painted onto a canvas at first use.
 *
 * There are still no asset files. What changed is that a flat colour stopped
 * being the only thing a material could say. Silicon, solder mask, nickel and
 * paste are each recognisable by their *texture* long before their colour — a
 * die photograph reads as a die because of the fine regular rows, not because
 * it is blue — and a flat slab of any colour reads as a placeholder.
 *
 * Painted once, lazily, and shared. A texture is safe to share between parts in
 * a way a material is not: Part's dimming writes `material.color`, never the
 * texture, so two parts on one texture still dim independently.
 *
 * Deterministic: a fixed seed per texture, so the look is identical between
 * reloads, which matters when art-directing a frame.
 */

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

type Paint = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

const cache = new Map<string, THREE.CanvasTexture>()

function painted(key: string, w: number, h: number, paint: Paint, color = true) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  paint(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
  tex.anisotropy = 8
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  cache.set(key, tex)
  return tex
}

/** A repeat-tiled copy of a shared texture. Shares the image, not the transform. */
export function tiled(tex: THREE.Texture, rx: number, ry: number) {
  const t = tex.clone()
  t.repeat.set(rx, ry)
  t.needsUpdate = true
  return t
}

/* ------------------------------------------------------------------ */
/* Package                                                              */
/* ------------------------------------------------------------------ */

/**
 * Substrate routing, drawn as a fan-out from the die to the edge.
 *
 * The copy for this layer calls it a road network, and a real package's top
 * layer looks like one: traces leave the die in bundles, bend at 45°, and
 * spread to the ball grid. Two outputs from one drawing — the colour map (copper
 * seen through green solder mask) and a height map for the same traces, so they
 * stand proud of the mask under a grazing light.
 */
function paintRouting(ctx: CanvasRenderingContext2D, w: number, h: number, mode: 'color' | 'bump') {
  const r = rng(11)
  const c = mode === 'color'
  ctx.fillStyle = c ? '#0e3a28' : '#000'
  ctx.fillRect(0, 0, w, h)
  if (c) {
    // Mottled mask: solder resist is never a perfectly even film.
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(${20 + r() * 20},${70 + r() * 40},${48 + r() * 20},0.05)`
      const s = 20 + r() * 90
      ctx.fillRect(r() * w, r() * h, s, s)
    }
  }
  const trace = c ? 'rgba(88,176,112,0.55)' : 'rgba(255,255,255,0.9)'
  // Die keep-out in the middle (2.2 x 1.6 of a 4 x 4 substrate).
  const hx = (1.15 / 4) * w
  const hz = (0.85 / 4) * h
  const cx = w / 2
  const cy = h / 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let i = 0; i < 360; i++) {
    const side = i % 4
    const t = r() * 2 - 1
    let x: number
    let y: number
    let dx: number
    let dy: number
    if (side === 0) { x = cx + t * hx; y = cy - hz; dx = 0; dy = -1 }
    else if (side === 1) { x = cx + t * hx; y = cy + hz; dx = 0; dy = 1 }
    else if (side === 2) { x = cx - hx; y = cy + t * hz; dx = -1; dy = 0 }
    else { x = cx + hx; y = cy + t * hz; dx = 1; dy = 0 }
    ctx.strokeStyle = trace
    ctx.lineWidth = 1.2 + r() * 2.2
    ctx.beginPath()
    ctx.moveTo(x, y)
    // Straight out, one 45° dogleg away from the centre line, then straight to the edge.
    const run1 = 20 + r() * 70
    x += dx * run1
    y += dy * run1
    ctx.lineTo(x, y)
    const bend = (dx === 0 ? Math.sign(x - cx) : Math.sign(y - cy)) || 1
    const run2 = 10 + r() * 60
    x += (dx === 0 ? bend : dx) * run2
    y += (dy === 0 ? bend : dy) * run2
    ctx.lineTo(x, y)
    const run3 = w
    ctx.lineTo(x + dx * run3, y + dy * run3)
    ctx.stroke()
    // A via where some traces drop to an inner layer.
    if (r() < 0.35) {
      ctx.fillStyle = c ? 'rgba(200,170,90,0.8)' : '#fff'
      ctx.beginPath()
      ctx.arc(x, y, 2.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  // Power planes in the corners: large pours with a hatch of stitching vias.
  for (const [px, py] of [[0.08, 0.08], [0.92, 0.08], [0.08, 0.92], [0.92, 0.92]]) {
    ctx.fillStyle = c ? 'rgba(70,150,96,0.35)' : 'rgba(255,255,255,0.45)'
    ctx.fillRect(px * w - 60, py * h - 60, 120, 120)
    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = c ? 'rgba(210,180,100,0.7)' : '#fff'
      ctx.beginPath()
      ctx.arc(px * w - 48 + (i % 5) * 24, py * h - 48 + Math.floor(i / 5) * 24, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  if (c) {
    // Pin-1 fiducial: every package carries one, and it is gold.
    ctx.fillStyle = '#d8b04a'
    ctx.beginPath()
    ctx.moveTo(26, 26)
    ctx.lineTo(70, 26)
    ctx.lineTo(26, 70)
    ctx.closePath()
    ctx.fill()
  }
}

export const substrateMap = () => painted('substrate', 1024, 1024, (c, w, h) => paintRouting(c, w, h, 'color'))
export const substrateBump = () => painted('substrate-bump', 1024, 1024, (c, w, h) => paintRouting(c, w, h, 'bump'), false)

/**
 * Nickel-plated copper, lapped flat.
 *
 * A lid is not mirror chrome and it is not a flat grey: it is fine concentric
 * lapping marks under a satin plate. Painted as a roughness map, so the marks
 * only exist where they catch the light — which is how they look on the real
 * thing.
 */
export const lappedRoughness = () =>
  painted('lapped', 512, 512, (ctx, w, h) => {
    const r = rng(3)
    // A roughness map multiplies the material's roughness, so this sits near
    // white and the marks only pull it down (or up) by a fraction.
    ctx.fillStyle = 'rgb(225,225,225)'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 1400; i++) {
      const v = 170 + r() * 85
      ctx.strokeStyle = `rgba(${v},${v},${v},0.35)`
      ctx.lineWidth = 0.5 + r() * 1.2
      const y = r() * h
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y + (r() - 0.5) * 6)
      ctx.stroke()
    }
  }, false)

/**
 * The laser marking on top of the lid.
 *
 * Deliberately not any real vendor's mark: the course's own name, a lot code
 * and a matrix code, laid out the way every lid lays them out. Engraving on
 * nickel reads as a slightly darker, rougher patch — so this is a colour map
 * that is mostly the plate itself, with the marking a shade below it.
 */
export const lidMarking = () =>
  painted('lid', 1024, 1024, (ctx, w, h) => {
    const r = rng(5)
    ctx.fillStyle = '#c7ccd4'
    ctx.fillRect(0, 0, w, h)
    const etch = 'rgba(92,98,110,0.85)'
    ctx.fillStyle = etch
    ctx.font = '600 64px "Space Grotesk", "Helvetica Neue", Arial, sans-serif'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('ANATOMY', 150, 400)
    ctx.font = '400 38px "Space Grotesk", "Helvetica Neue", Arial, sans-serif'
    ctx.fillText('OF A MACHINE  ·  L01', 152, 460)
    ctx.font = '400 30px "JetBrains Mono", Menlo, monospace'
    ctx.fillText('X1-8C  4.20GHZ', 152, 560)
    ctx.fillText('LOT 2609-A7  ·  SAMPLE', 152, 606)
    // Matrix code: a finder L and a random field, as on every production lid.
    const ox = 720
    const oy = 520
    const cell = 12
    for (let y = 0; y < 14; y++)
      for (let x = 0; x < 14; x++) {
        const finder = x === 0 || y === 13
        const clock = (y === 0 && x % 2 === 0) || (x === 13 && y % 2 === 1)
        if (finder || clock || r() < 0.5) ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell)
      }
    // Pin-1 triangle in the corner.
    ctx.beginPath()
    ctx.moveTo(90, 900)
    ctx.lineTo(150, 900)
    ctx.lineTo(90, 840)
    ctx.closePath()
    ctx.fill()
  })

/** Thermal paste: a grey film with the trowel marks of being spread. */
export const pasteBump = () =>
  painted('paste', 512, 512, (ctx, w, h) => {
    const r = rng(9)
    ctx.fillStyle = '#777'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 260; i++) {
      const v = 60 + r() * 140
      ctx.fillStyle = `rgba(${v},${v},${v},0.25)`
      ctx.beginPath()
      ctx.ellipse(r() * w, r() * h, 10 + r() * 60, 4 + r() * 14, r() * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, false)

/* ------------------------------------------------------------------ */
/* Die                                                                  */
/* ------------------------------------------------------------------ */

/**
 * A core's floorplan, as an emissive map.
 *
 * Standard-cell rows are the texture of logic: thousands of cells laid in
 * rows of one fixed height, with a few hard macros — register file, caches,
 * the vector unit — sitting in them as rectangles. It is what a core actually
 * looks like under a microscope, and it glows where the pulse lights it, so the
 * "this core is working" motion now lights a circuit rather than a panel.
 */
export const coreFloorplan = () =>
  painted('core', 256, 256, (ctx, w, h) => {
    const r = rng(21)
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, w, h)
    for (let y = 6; y < h - 6; y += 4) {
      let x = 6
      while (x < w - 6) {
        const len = 2 + r() * 12
        const v = 70 + r() * 120
        ctx.fillStyle = `rgb(${v},${v},${v})`
        ctx.fillRect(x, y, Math.min(len, w - 6 - x), 2.4)
        x += len + 1 + r() * 2
      }
    }
    // Hard macros: darker blocks with their own regular inner grid.
    const macros: Array<[number, number, number, number]> = [
      [14, 14, 96, 70],
      [140, 20, 96, 48],
      [22, 150, 62, 86],
      [150, 150, 88, 88],
    ]
    for (const [x, y, mw, mh] of macros) {
      ctx.fillStyle = '#141414'
      ctx.fillRect(x, y, mw, mh)
      ctx.fillStyle = 'rgb(210,210,210)'
      for (let j = y + 4; j < y + mh - 3; j += 5)
        for (let i = x + 4; i < x + mw - 3; i += 5) ctx.fillRect(i, j, 3, 3)
      ctx.strokeStyle = 'rgb(255,255,255)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(x + 0.5, y + 0.5, mw - 1, mh - 1)
    }
    ctx.strokeStyle = 'rgb(240,240,240)'
    ctx.lineWidth = 3
    ctx.strokeRect(2, 2, w - 4, h - 4)
  })

/** SRAM: the most regular thing on the die, which is how you find cache on a photo. */
export const sramArray = () =>
  painted('sram', 1024, 192, (ctx, w, h) => {
    ctx.fillStyle = '#101010'
    ctx.fillRect(0, 0, w, h)
    for (let y = 8; y < h - 8; y += 5)
      for (let x = 8; x < w - 8; x += 5) {
        ctx.fillStyle = (x / 5 + y / 5) % 2 < 1 ? 'rgb(200,200,200)' : 'rgb(160,160,160)'
        ctx.fillRect(x, y, 3.4, 3.4)
      }
    // Sense-amp spines between sub-arrays.
    ctx.fillStyle = 'rgb(255,255,255)'
    for (let x = 0; x < w; x += 128) ctx.fillRect(x, 0, 3, h)
    ctx.fillRect(0, h / 2 - 1.5, w, 3)
  })

/** I/O ring: a row of bond pads and their drivers. */
export const ioPads = () =>
  painted('io', 1024, 64, (ctx, w, h) => {
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, w, h)
    for (let x = 6; x < w - 10; x += 20) {
      ctx.fillStyle = 'rgb(255,255,255)'
      ctx.fillRect(x, 10, 13, 22)
      ctx.fillStyle = 'rgb(150,150,150)'
      ctx.fillRect(x + 2, 38, 9, 16)
    }
  })

/** Bare silicon: dark, faintly gridded by the reticle stitching. */
export const siliconMap = () =>
  painted('silicon', 512, 512, (ctx, w, h) => {
    const r = rng(33)
    ctx.fillStyle = '#1b2233'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 4000; i++) {
      const v = 30 + r() * 25
      ctx.fillStyle = `rgba(${v},${v + 6},${v + 20},0.5)`
      ctx.fillRect(r() * w, r() * h, 2, 2)
    }
    ctx.strokeStyle = 'rgba(120,140,180,0.25)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath()
      ctx.moveTo((i / 8) * w, 0)
      ctx.lineTo((i / 8) * w, h)
      ctx.moveTo(0, (i / 8) * h)
      ctx.lineTo(w, (i / 8) * h)
      ctx.stroke()
    }
    // Seal ring round the edge.
    ctx.strokeStyle = 'rgba(190,200,220,0.8)'
    ctx.lineWidth = 6
    ctx.strokeRect(6, 6, w - 12, h - 12)
  })

/* ------------------------------------------------------------------ */
/* Transistor                                                           */
/* ------------------------------------------------------------------ */

/**
 * The silicon crystal, seen edge-on: a square lattice of atoms.
 *
 * At a hundred million times life size the bulk should read as a crystal, not
 * as a block of plastic. Emissive, faintly, so the lattice is legible on the
 * shadow side too.
 */
export const latticeMap = () =>
  painted('lattice', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
    const step = 16
    ctx.strokeStyle = 'rgba(150,175,220,0.55)'
    ctx.lineWidth = 1.4
    for (let y = step / 2; y < h; y += step)
      for (let x = step / 2; x < w; x += step) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + step, y)
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + step)
        ctx.stroke()
      }
    for (let y = step / 2; y < h; y += step)
      for (let x = step / 2; x < w; x += step) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 5)
        g.addColorStop(0, 'rgba(255,255,255,1)')
        g.addColorStop(0.5, 'rgba(255,255,255,0.6)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.fillRect(x - 5, y - 5, 10, 10)
      }
  })

/** Heavily doped silicon: the same lattice, crowded with donor atoms. */
export const dopantMap = () =>
  painted('dopant', 256, 256, (ctx, w, h) => {
    const r = rng(41)
    ctx.fillStyle = '#6a6a6a'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 700; i++) {
      const x = r() * w
      const y = r() * h
      const s = 0.6 + r() * 1.1
      const g = ctx.createRadialGradient(x, y, 0, x, y, s * 2)
      g.addColorStop(0, 'rgba(255,255,255,0.7)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(x - s * 2, y - s * 2, s * 4, s * 4)
    }
  })

/* ------------------------------------------------------------------ */
/* Benches (gates, adders, the fabric's package)                        */
/* ------------------------------------------------------------------ */

/**
 * The board the logic sits on: black anodised, with a fine registration grid.
 *
 * Tiled in world units — one repeat per half unit — so every bench in the
 * course shares one grid pitch whatever its size.
 */
export const benchMap = () =>
  painted('bench', 256, 256, (ctx, w, h) => {
    const r = rng(51)
    ctx.fillStyle = '#0c1119'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 1600; i++) {
      const v = 12 + r() * 10
      ctx.fillStyle = `rgba(${v},${v + 4},${v + 10},0.6)`
      ctx.fillRect(r() * w, r() * h, 2, 2)
    }
    ctx.strokeStyle = 'rgba(70,110,150,0.16)'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, w, h)
    ctx.fillStyle = 'rgba(110,160,210,0.4)'
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        ctx.beginPath()
        ctx.arc(x * 64 + 32, y * 64 + 32, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
  })

/** A logic block's top face: an inset panel with a bright frame, for emissive use. */
export const cellFace = () =>
  painted('cell', 128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#6a6a6a'
    ctx.fillRect(0, 0, w, h)
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, 'rgba(255,255,255,0.35)')
    g.addColorStop(1, 'rgba(0,0,0,0.25)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 6
    ctx.strokeRect(6, 6, w - 12, h - 12)
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    for (let y = 24; y < h - 20; y += 10) ctx.fillRect(22, y, w - 44, 3)
  })

/* ------------------------------------------------------------------ */
/* Memory (Lecture 2)                                                   */
/* ------------------------------------------------------------------ */

/*
 * Every map in this section is an emissive map for a `topFaced` box, and they
 * share one convention: a uniform frame of fixed brightness round the edge.
 * `topFaced` points every side-face vertex at that frame, so the sides glow at
 * one steady fraction of the top, and the top carries the pattern. The frame
 * value is therefore how bright a block's sides are relative to its face.
 */
const FRAME = 0.1
const SIDE = 'rgb(150,150,150)'

function framed(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = SIDE
  ctx.fillRect(0, 0, w, h)
  const fx = w * FRAME
  const fy = h * FRAME
  return { x: fx, y: fy, w: w - fx * 2, h: h - fy * 2 }
}

/**
 * A transistor seen from above, the way a layout draws it: two diffusion
 * regions with their contacts, and the gate stripe crossing between them.
 *
 * The gate is the brightest thing on it, because the gate is what the word
 * line drives — when a cell is accessed, that stripe is what lights.
 */
export const transistorTop = () =>
  painted('transistor', 128, 128, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(60,60,60)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    // Diffusion, either side of the gate.
    ctx.fillStyle = 'rgb(150,150,150)'
    ctx.fillRect(f.x + f.w * 0.1, f.y + f.h * 0.2, f.w * 0.3, f.h * 0.6)
    ctx.fillRect(f.x + f.w * 0.6, f.y + f.h * 0.2, f.w * 0.3, f.h * 0.6)
    // Contacts.
    ctx.fillStyle = 'rgb(255,255,255)'
    for (const cx of [0.25, 0.75])
      for (const cy of [0.35, 0.5, 0.65]) {
        ctx.beginPath()
        ctx.arc(f.x + f.w * cx, f.y + f.h * cy, f.w * 0.045, 0, Math.PI * 2)
        ctx.fill()
      }
    // The gate stripe, running past the diffusion on both ends as poly does.
    ctx.fillStyle = 'rgb(240,240,240)'
    ctx.fillRect(f.x + f.w * 0.44, f.y + f.h * 0.06, f.w * 0.12, f.h * 0.88)
  })

/** A capacitor plate: a lapped metal face with a bright rim. */
export const plateTop = () =>
  painted('plate', 64, 64, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    const g = ctx.createLinearGradient(f.x, f.y, f.x + f.w, f.y + f.h)
    g.addColorStop(0, 'rgb(235,235,235)')
    g.addColorStop(1, 'rgb(170,170,170)')
    ctx.fillStyle = g
    ctx.fillRect(f.x, f.y, f.w, f.h)
  })

/** The register file: a few dozen wide words, each a row of bit slots. */
export const registerFile = () =>
  painted('registers', 256, 256, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(70,70,70)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    const rows = 8
    const cols = 16
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 3 === 0 ? 'rgb(250,250,250)' : 'rgb(190,190,190)'
        ctx.fillRect(
          f.x + 6 + c * ((f.w - 12) / cols),
          f.y + 6 + r * ((f.h - 12) / rows),
          (f.w - 12) / cols - 3,
          (f.h - 12) / rows - 5,
        )
      }
  })

/** SRAM for a cache tier: the same regular array as the die's cache, framed. */
export const cacheTop = () =>
  painted('cache-top', 256, 256, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(64,64,64)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    for (let y = f.y + 4; y < f.y + f.h - 4; y += 6)
      for (let x = f.x + 4; x < f.x + f.w - 4; x += 6) {
        ctx.fillStyle = ((x + y) / 6) % 2 < 1 ? 'rgb(255,255,255)' : 'rgb(205,205,205)'
        ctx.fillRect(x, y, 4, 4)
      }
    // Sense-amp spines between the sub-arrays.
    ctx.fillStyle = 'rgb(255,255,255)'
    ctx.fillRect(f.x + f.w / 2 - 1.5, f.y, 3, f.h)
    ctx.fillRect(f.x, f.y + f.h / 2 - 1.5, f.w, 3)
  })

/**
 * Main memory: a module's worth of DRAM packages in a row.
 *
 * Eight chips on a strip, each a fine array inside — the DIMM silhouette is
 * what a reader recognises as "RAM", and the fine grid inside each is the
 * density the previous chapter was about.
 */
export const dramTop = () =>
  painted('dram-top', 512, 512, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(56,56,56)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    const chips = 4
    const rows = 2
    const gx = f.w / chips
    const gy = f.h / rows
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < chips; c++) {
        const x0 = f.x + c * gx + 8
        const y0 = f.y + r * gy + 10
        const cw = gx - 16
        const ch = gy - 20
        ctx.fillStyle = 'rgb(120,120,120)'
        ctx.fillRect(x0, y0, cw, ch)
        ctx.fillStyle = 'rgb(245,245,245)'
        for (let y = y0 + 5; y < y0 + ch - 4; y += 4)
          for (let x = x0 + 5; x < x0 + cw - 4; x += 4) ctx.fillRect(x, y, 2.4, 2.4)
      }
  })

/**
 * Flash: an 8 × 8 grid of erase blocks, each striped with its pages.
 *
 * The grid is the same one the wear beat kills cells on — centres at 10% to
 * 90% of the face in eight steps — so a worn-out square lands squarely on a
 * block instead of somewhere between two.
 */
export const flashTop = () =>
  painted('flash-top', 512, 512, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(60,60,60)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    const bw = w * 0.085
    const bh = h * 0.085
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const cx = w * (0.1 + (c / 7) * 0.8)
        const cy = h * (0.1 + (r / 7) * 0.8)
        ctx.fillStyle = 'rgb(150,150,150)'
        ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh)
        ctx.fillStyle = 'rgb(250,250,250)'
        for (let k = 0; k < 5; k++) ctx.fillRect(cx - bw / 2 + 3, cy - bh / 2 + 3 + k * (bh - 6) / 5, bw - 6, (bh - 6) / 5 - 2)
      }
  })

/* ------------------------------------------------------------------ */
/* Pipeline (Lecture 3)                                                 */
/* ------------------------------------------------------------------ */

/*
 * The five stages, each drawn as the hardware that does that step, on the same
 * framed convention as the memory faces. A stage slab is 1.02 × 1.5, so these
 * are painted at that aspect and the top face carries them undistorted.
 */
const STAGE_W = 176
const STAGE_H = 256

function sramBlock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pitch = 5) {
  ctx.fillStyle = 'rgb(90,90,90)'
  ctx.fillRect(x, y, w, h)
  for (let j = y + 3; j < y + h - 3; j += pitch)
    for (let i = x + 3; i < x + w - 3; i += pitch) {
      ctx.fillStyle = ((i + j) / pitch) % 2 < 1 ? 'rgb(235,235,235)' : 'rgb(190,190,190)'
      ctx.fillRect(i, j, pitch - 2, pitch - 2)
    }
}

/** Fetch: an instruction cache, and the program counter that addresses it. */
export const fetchTop = () =>
  painted('stage-fetch', STAGE_W, STAGE_H, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(56,56,56)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    // Two sub-arrays with a sense-amp spine between them.
    sramBlock(ctx, f.x + 6, f.y + 6, f.w - 12, f.h * 0.34)
    sramBlock(ctx, f.x + 6, f.y + f.h * 0.34 + 12, f.w - 12, f.h * 0.34)
    ctx.fillStyle = 'rgb(255,255,255)'
    ctx.fillRect(f.x + 6, f.y + f.h * 0.34 + 7, f.w - 12, 2)
    // The program counter: one register wide, a row of bits.
    const py = f.y + f.h * 0.78
    ctx.fillStyle = 'rgb(140,140,140)'
    ctx.fillRect(f.x + 10, py, f.w - 20, f.h * 0.14)
    for (let k = 0; k < 12; k++) {
      ctx.fillStyle = k % 3 === 1 ? 'rgb(255,255,255)' : 'rgb(200,200,200)'
      ctx.fillRect(f.x + 14 + k * ((f.w - 28) / 12), py + 5, (f.w - 28) / 12 - 3, f.h * 0.14 - 10)
    }
  })

/**
 * Decode: a programmable logic array, the textbook decoder — input lines down,
 * product terms across, and a dot wherever a term reads a line.
 */
export const decodeTop = () =>
  painted('stage-decode', STAGE_W, STAGE_H, (ctx, w, h) => {
    const r = rng(61)
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(56,56,56)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    const cols = 10
    const rows = 16
    const x0 = f.x + 12
    const y0 = f.y + 12
    const cw = (f.w - 24) / (cols - 1)
    const rh = (f.h - 24) / (rows - 1)
    ctx.fillStyle = 'rgb(130,130,130)'
    for (let c = 0; c < cols; c++) ctx.fillRect(x0 + c * cw - 1, y0 - 6, 2, f.h - 12)
    for (let k = 0; k < rows; k++) ctx.fillRect(x0 - 6, y0 + k * rh - 1, f.w - 12, 2)
    ctx.fillStyle = 'rgb(255,255,255)'
    for (let k = 0; k < rows; k++)
      for (let c = 0; c < cols; c++)
        if (r() < 0.32) {
          ctx.beginPath()
          ctx.arc(x0 + c * cw, y0 + k * rh, 3, 0, Math.PI * 2)
          ctx.fill()
        }
  })

/**
 * Execute: the ALU, in the notched-funnel symbol every datapath diagram draws
 * it as, over the carry chain of the adder it is built round.
 */
export const executeTop = () =>
  painted('stage-execute', STAGE_W, STAGE_H, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(56,56,56)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    // The carry chain: a column of full-adder cells, one per bit.
    for (let k = 0; k < 16; k++) {
      ctx.fillStyle = k % 2 ? 'rgb(120,120,120)' : 'rgb(100,100,100)'
      ctx.fillRect(f.x + 8, f.y + 8 + k * ((f.h - 16) / 16), f.w - 16, (f.h - 16) / 16 - 2)
    }
    // Operands in at the top, result out at the bottom.
    const cx = f.x + f.w / 2
    const top = f.y + f.h * 0.2
    const bot = f.y + f.h * 0.78
    ctx.beginPath()
    ctx.moveTo(f.x + f.w * 0.1, top)
    ctx.lineTo(cx - f.w * 0.1, top)
    ctx.lineTo(cx, top + f.h * 0.1)
    ctx.lineTo(cx + f.w * 0.1, top)
    ctx.lineTo(f.x + f.w * 0.9, top)
    ctx.lineTo(f.x + f.w * 0.68, bot)
    ctx.lineTo(f.x + f.w * 0.32, bot)
    ctx.closePath()
    ctx.fillStyle = 'rgb(70,70,70)'
    ctx.fill()
    ctx.strokeStyle = 'rgb(255,255,255)'
    ctx.lineWidth = 4
    ctx.lineJoin = 'round'
    ctx.stroke()
    ctx.fillStyle = 'rgb(235,235,235)'
    for (const x of [f.x + f.w * 0.27, f.x + f.w * 0.73]) ctx.fillRect(x - 2, f.y + 6, 4, top - f.y - 6)
    ctx.fillRect(cx - 2, bot, 4, f.y + f.h - 6 - bot)
  })

/** Memory: the data cache, with its tag column beside the data array. */
export const memoryTop = () =>
  painted('stage-memory', STAGE_W, STAGE_H, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(56,56,56)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    const tagW = f.w * 0.24
    ctx.fillStyle = 'rgb(150,150,150)'
    ctx.fillRect(f.x + 6, f.y + 6, tagW, f.h - 12)
    for (let j = f.y + 10; j < f.y + f.h - 10; j += 8) {
      ctx.fillStyle = 'rgb(225,225,225)'
      ctx.fillRect(f.x + 10, j, tagW - 8, 4)
    }
    sramBlock(ctx, f.x + tagW + 12, f.y + 6, f.w - tagW - 18, f.h - 12)
  })

/** Write back: the register file the answer lands in. */
export const writebackTop = () =>
  painted('stage-writeback', STAGE_W, STAGE_H, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(64,64,64)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    const rows = 16
    const cols = 8
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r * 3 + c) % 5 === 0 ? 'rgb(255,255,255)' : 'rgb(185,185,185)'
        ctx.fillRect(
          f.x + 6 + c * ((f.w - 12) / cols),
          f.y + 6 + r * ((f.h - 12) / rows),
          (f.w - 12) / cols - 3,
          (f.h - 12) / rows - 4,
        )
      }
  })

/**
 * An instruction word, seen from above: its fields laid side by side, the way
 * an instruction-set manual draws one — opcode, destination, sources — each a
 * run of bits. Shared by every instruction; what the word *is* is its colour.
 */
export const instructionTop = () =>
  painted('instruction', 128, 128, (ctx, w, h) => {
    const r = rng(71)
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(120,120,120)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    // Four rows of eight bits; field boundaries are the brighter gaps.
    const fields = [3, 2, 3]
    const bw = (f.w - 12) / 8
    const bh = (f.h - 12) / 4
    for (let row = 0; row < 4; row++) {
      let c = 0
      for (const [i, n] of fields.entries()) {
        for (let k = 0; k < n; k++, c++) {
          const on = r() < 0.5
          ctx.fillStyle = on ? 'rgb(255,255,255)' : 'rgb(170,170,170)'
          ctx.fillRect(f.x + 6 + c * bw + 1.5, f.y + 6 + row * bh + 2, bw - 3, bh - 4)
        }
        if (i < fields.length - 1) {
          ctx.fillStyle = 'rgb(60,60,60)'
          ctx.fillRect(f.x + 6 + c * bw - 1, f.y + 4, 2, f.h - 8)
        }
      }
    }
  })

/* ------------------------------------------------------------------ */
/* Fab (Lecture 4)                                                      */
/* ------------------------------------------------------------------ */

/**
 * One die's floorplan, drawn in two inks: four cores in standard-cell rows, a
 * shared cache between them, and the ring of I/O pads round the edge.
 *
 * Painted by both the die and the mask, from the same numbers, because the
 * mask *is* the die — four times larger and inverted — and the one thing the
 * exposure beats argue is that what is on the mask is what arrives below it.
 */
function paintFloorplan(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  ink: string,
  faint: string,
) {
  const r = rng(83)
  // The I/O ring.
  ctx.fillStyle = ink
  const pads = 14
  const pad = w / (pads * 1.6)
  for (let k = 0; k < pads; k++) {
    const u = x + (k + 0.5) * (w / pads) - pad / 2
    const v = y + (k + 0.5) * (h / pads) - pad / 2
    ctx.fillRect(u, y + w * 0.02, pad, pad * 1.4)
    ctx.fillRect(u, y + h - w * 0.02 - pad * 1.4, pad, pad * 1.4)
    ctx.fillRect(x + w * 0.02, v, pad * 1.4, pad)
    ctx.fillRect(x + w - w * 0.02 - pad * 1.4, v, pad * 1.4, pad)
  }
  const ix = x + w * 0.14
  const iy = y + h * 0.14
  const iw = w * 0.72
  const ih = h * 0.72
  // Four cores, two above the cache and two below: standard-cell rows.
  const cw = iw * 0.47
  const ch = ih * 0.33
  for (const [cx, cy] of [
    [ix, iy],
    [ix + iw - cw, iy],
    [ix, iy + ih - ch],
    [ix + iw - cw, iy + ih - ch],
  ]) {
    ctx.fillStyle = faint
    ctx.fillRect(cx, cy, cw, ch)
    ctx.fillStyle = ink
    for (let row = cy + 2; row < cy + ch - 2; row += 3) {
      let u = cx + 2
      while (u < cx + cw - 3) {
        const cell = 2 + r() * 7
        if (r() < 0.8) ctx.fillRect(u, row, Math.min(cell, cx + cw - 2 - u), 1.6)
        u += cell + 1
      }
    }
  }
  // The shared cache: the most regular thing on the die.
  const my = iy + ch + ih * 0.06
  const mh = ih - ch * 2 - ih * 0.12
  ctx.fillStyle = faint
  ctx.fillRect(ix, my, iw, mh)
  ctx.fillStyle = ink
  for (let v = my + 2; v < my + mh - 1; v += 2.6)
    for (let u = ix + 2; u < ix + iw - 2; u += 2.6) ctx.fillRect(u, v, 1.5, 1.5)
}

/**
 * A die's top face, as an emissive map for `topFaced`: its floorplan lit, so a
 * printed die glows its pattern in whatever colour the beat gives it, and a
 * bare one, whose colour is near black, shows nothing at all.
 */
export const dieFace = () =>
  painted('die-face', 256, 256, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(95,95,95)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    // Seal ring.
    ctx.strokeStyle = 'rgb(235,235,235)'
    ctx.lineWidth = 3
    ctx.strokeRect(f.x + 2, f.y + 2, f.w - 4, f.h - 4)
    paintFloorplan(ctx, f.x + 4, f.y + 4, f.w - 8, f.h - 8, 'rgb(255,255,255)', 'rgb(135,135,135)')
  })

/**
 * The reticle: a quartz plate with the die's floorplan in chrome, four times
 * the size of the die it prints, inside a clear border.
 *
 * Four times is not a stylisation. A projection scanner reduces the mask by
 * 4x onto the wafer, and the mask here is exactly four dies across.
 */
export const reticleMap = () =>
  painted('reticle', 512, 512, (ctx, w, h) => {
    // Clear quartz border, with the alignment marks a scanner reads.
    ctx.fillStyle = '#b9c4d2'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2a3140'
    for (const [u, v] of [
      [0.05, 0.5],
      [0.95, 0.5],
      [0.5, 0.05],
      [0.5, 0.95],
    ]) {
      ctx.fillRect(u * w - 9, v * h - 1.5, 18, 3)
      ctx.fillRect(u * w - 1.5, v * h - 9, 3, 18)
    }
    // The chrome field, and the pattern etched clear through it.
    const m = w * 0.1
    ctx.fillStyle = '#161a21'
    ctx.fillRect(m, m, w - m * 2, h - m * 2)
    paintFloorplan(ctx, m + 6, m + 6, w - m * 2 - 12, h - m * 2 - 12, '#c8d6e8', '#262c37')
  })

/** A vacuum chuck: black anodised, cut with the concentric grooves that hold the wafer down. */
export const chuckMap = () =>
  painted('chuck', 512, 512, (ctx, w, h) => {
    const r = rng(91)
    ctx.fillStyle = '#0d1219'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 3000; i++) {
      const v = 13 + r() * 10
      ctx.fillStyle = `rgba(${v},${v + 4},${v + 10},0.6)`
      ctx.fillRect(r() * w, r() * h, 2, 2)
    }
    const cx = w / 2
    const cy = h / 2
    ctx.strokeStyle = 'rgba(90,130,170,0.35)'
    ctx.lineWidth = 2
    for (let k = 1; k <= 7; k++) {
      ctx.beginPath()
      ctx.arc(cx, cy, (k / 7.6) * (w / 2), 0, Math.PI * 2)
      ctx.stroke()
    }
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * w * 0.06, cy + Math.sin(a) * h * 0.06)
      ctx.lineTo(cx + Math.cos(a) * w * 0.46, cy + Math.sin(a) * h * 0.46)
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(150,180,210,0.5)'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(cx, cy, w / 2 - 4, 0, Math.PI * 2)
    ctx.stroke()
  })

/**
 * The exposure's falloff down its length: faint where it leaves the mask,
 * strongest where it converges on the wafer, and with no hard edge at either
 * end. An alpha map, read from green.
 */
export const beamFade = () =>
  painted(
    'beam-fade',
    4,
    256,
    (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      // Canvas top is the cylinder's top (v = 1), which is the mask end.
      g.addColorStop(0, 'rgb(0,0,0)')
      g.addColorStop(0.12, 'rgb(90,90,90)')
      g.addColorStop(0.7, 'rgb(190,190,190)')
      g.addColorStop(0.97, 'rgb(255,255,255)')
      g.addColorStop(1, 'rgb(200,200,200)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
    false,
  )

/**
 * One layer of the stack, from above, as an emissive map for `topFaced`.
 *
 * The device layers are fins crossed by gates. Above them every metal layer
 * routes in one direction, at right angles to the one below it, and the pitch
 * coarsens on the way up: the finest wires at the bottom carry signal between
 * neighbouring transistors, the fat ones at the top carry power and clock
 * across the whole chip. Both are how real stacks are built.
 */
export const layerTop = (level: number) =>
  painted(`layer-${level}`, 256, 256, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(55,55,55)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    ctx.fillStyle = 'rgb(255,255,255)'
    if (level === 0) {
      // Fins, and gates across them.
      for (let u = f.x + 3; u < f.x + f.w - 2; u += 6) ctx.fillRect(u, f.y + 2, 1.5, f.h - 4)
      ctx.fillStyle = 'rgb(200,200,200)'
      for (let v = f.y + 5; v < f.y + f.h - 3; v += 11) ctx.fillRect(f.x + 2, v, f.w - 4, 3)
      return
    }
    if (level === 1) {
      // Contacts down to the transistors.
      for (let v = f.y + 6; v < f.y + f.h - 4; v += 11)
        for (let u = f.x + 5; u < f.x + f.w - 4; u += 12) ctx.fillRect(u, v, 3, 3)
      return
    }
    const r = rng(100 + level)
    const pitch = 4 + (level - 2) * 2.2
    const across = level % 2 === 0
    const span = across ? f.h : f.w
    const len = across ? f.w : f.h
    for (let s = 2; s < span - pitch * 0.5; s += pitch) {
      // Each track is broken into wire segments, as a router leaves it.
      let a = 2
      while (a < len - 4) {
        const seg = 10 + r() * len * 0.5
        const b = Math.min(a + seg, len - 2)
        const t = pitch * 0.5
        if (r() < 0.85) {
          if (across) ctx.fillRect(f.x + a, f.y + s, b - a, t)
          else ctx.fillRect(f.x + s, f.y + a, t, b - a)
        }
        a = b + 3 + r() * 6
      }
    }
  })

/* ------------------------------------------------------------------ */
/* Geometry                                                             */
/* ------------------------------------------------------------------ */

const boxes = new Map<string, THREE.BufferGeometry>()

/**
 * A box with rounded edges, cached by size.
 *
 * Every hard-edged box in the course was a perfect 90° corner, and a perfect
 * corner has no highlight — so every slab read as a flat panel with an
 * outline. A radius of a few percent catches a line of the environment on
 * every edge, which is what makes a machined part look machined.
 *
 * The radius is clamped to under half the thinnest side, so a thin layer gets
 * a proportionally small bevel rather than collapsing into a pill.
 */
export function roundedBox(w: number, h: number, d: number, radius = 0.04, segments = 3) {
  const r = Math.min(radius, Math.min(w, h, d) * 0.45)
  const key = `${w}|${h}|${d}|${r}|${segments}`
  let g = boxes.get(key)
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, segments, r)
    boxes.set(key, g)
  }
  return g
}

const faced = new Map<string, THREE.BufferGeometry>()

/**
 * A rounded box whose top face carries a whole texture and whose sides carry
 * one texel of it.
 *
 * Box UVs put the full map on every face, which squashes a floorplan down the
 * thin sides of a slab into streaks. These blocks are seen from above and the
 * pattern is only true of the top — a cache is an array *in plan* — so every
 * vertex facing sideways or down samples the map's uniform frame instead, and
 * the sides glow at that steady fraction of whatever the face is doing. One
 * material, one draw call, and the emissive animation still drives the lot.
 */
export function topFaced(w: number, h: number, d: number, radius = 0.04) {
  const key = `${w}|${h}|${d}|${radius}`
  let g = faced.get(key)
  if (!g) {
    g = roundedBox(w, h, d, radius).clone()
    const pos = g.attributes.position
    const nor = g.attributes.normal
    const uv = g.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      if (nor.getY(i) > 0.5) uv.setXY(i, pos.getX(i) / w + 0.5, 0.5 - pos.getZ(i) / d)
      else uv.setXY(i, FRAME * 0.4, FRAME * 0.4)
    }
    uv.needsUpdate = true
    faced.set(key, g)
  }
  return g
}

/* ------------------------------------------------------------------ */
/* Board (Lectures 5 and 6)                                             */
/* ------------------------------------------------------------------ */

/** What the mainboard's face is painted from, in board space (+x right, +z toward the palm rest). */
export type PcbArt = {
  w: number
  d: number
  /** Every bus, as the polylines the packets ride. */
  lanes: Array<Array<[number, number]>>
  /** Silkscreen outlines, with a reference designator beside each. */
  outlines: Array<{ x: number; z: number; w: number; d: number; ref: string }>
  /** Plated mounting holes. */
  holes: Array<[number, number]>
}

/**
 * The mainboard's top face, as a colour map and a height map from one drawing.
 *
 * Solder mask is a thin film, so the copper under it shows through as relief:
 * every bus the packets ride is also routed *in* the board, a shade lighter and
 * standing proud of the mask, and the floating lines above the board are that
 * same routing seen as topology. The two cannot disagree because both are drawn
 * from the lanes in `boardLayout`.
 *
 * Kept quiet on purpose. A real board is a solid field of passives and fine
 * routing; here the fill is faint escape routing and via stitching that reads as
 * "a board" at a glance and never competes with a component the copy names.
 */
function paintPcb(ctx: CanvasRenderingContext2D, W: number, H: number, art: PcbArt, mode: 'color' | 'bump') {
  const r = rng(61)
  const c = mode === 'color'
  const px = (x: number) => (x / art.w + 0.5) * W
  const pz = (z: number) => (z / art.d + 0.5) * H
  const unit = W / art.w

  ctx.fillStyle = c ? '#0b1f18' : '#000'
  ctx.fillRect(0, 0, W, H)
  if (c) {
    // Mask is never a perfectly even film.
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = `rgba(${12 + r() * 12},${36 + r() * 20},${28 + r() * 12},0.06)`
      const s = 30 + r() * 140
      ctx.fillRect(r() * W, r() * H, s, s * (0.5 + r()))
    }
  }

  // Ground pour: large copper areas under the mask, hatched with stitching vias.
  ctx.fillStyle = c ? 'rgba(34,70,52,0.22)' : 'rgba(255,255,255,0.28)'
  for (let i = 0; i < 14; i++) {
    const x = r() * W
    const y = r() * H
    ctx.fillRect(x, y, 90 + r() * 260, 60 + r() * 160)
  }

  // Fine escape routing: short 45-degree runs, the texture of a real board.
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = c ? 'rgba(44,88,64,0.32)' : 'rgba(255,255,255,0.5)'
  for (let i = 0; i < 520; i++) {
    let x = r() * W
    let y = r() * H
    ctx.lineWidth = 1.2 + r() * 1.4
    ctx.beginPath()
    ctx.moveTo(x, y)
    const horizontal = r() < 0.5
    const run = 20 + r() * 110
    x += horizontal ? run : 0
    y += horizontal ? 0 : run
    ctx.lineTo(x, y)
    const bend = (r() < 0.5 ? -1 : 1) * (8 + r() * 30)
    x += bend
    y += Math.abs(bend)
    ctx.lineTo(x, y)
    ctx.lineTo(x + (horizontal ? 20 + r() * 60 : 0), y + (horizontal ? 0 : 20 + r() * 60))
    ctx.stroke()
    if (r() < 0.4) {
      ctx.fillStyle = c ? 'rgba(96,120,90,0.45)' : '#fff'
      ctx.beginPath()
      ctx.arc(x, y, 2.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // The buses themselves, wider than the fill, because they are.
  ctx.strokeStyle = c ? 'rgba(58,116,82,0.6)' : 'rgba(255,255,255,0.95)'
  ctx.lineWidth = unit * 0.022
  for (const lane of art.lanes) {
    ctx.beginPath()
    lane.forEach(([x, z], k) => (k ? ctx.lineTo(px(x), pz(z)) : ctx.moveTo(px(x), pz(z))))
    ctx.stroke()
  }

  if (!c) return

  // Silkscreen: the white ink every board carries, outlining where parts go.
  ctx.strokeStyle = 'rgba(206,214,206,0.38)'
  ctx.fillStyle = 'rgba(206,214,206,0.45)'
  ctx.lineWidth = 2.2
  ctx.font = `500 ${Math.round(unit * 0.11)}px "JetBrains Mono", Menlo, monospace`
  ctx.textBaseline = 'bottom'
  for (const o of art.outlines) {
    const x0 = px(o.x - o.w / 2) - 6
    const y0 = pz(o.z - o.d / 2) - 6
    const bw = o.w * unit + 12
    const bh = o.d * unit + 12
    // Corner brackets rather than a closed box, as most silkscreen draws them.
    const k = Math.min(bw, bh) * 0.22
    ctx.beginPath()
    for (const [cx, cy, sx, sy] of [
      [x0, y0, 1, 1],
      [x0 + bw, y0, -1, 1],
      [x0, y0 + bh, 1, -1],
      [x0 + bw, y0 + bh, -1, -1],
    ]) {
      ctx.moveTo(cx + sx * k, cy)
      ctx.lineTo(cx, cy)
      ctx.lineTo(cx, cy + sy * k)
    }
    ctx.stroke()
    ctx.fillText(o.ref, x0, y0 - 4)
  }
  // Board name and revision, along the palm-rest edge where nothing sits.
  ctx.font = `600 ${Math.round(unit * 0.13)}px "Space Grotesk", "Helvetica Neue", Arial, sans-serif`
  ctx.fillText('ANATOMY  MB-L05  REV B', px(-0.6), pz(art.d / 2 - 0.24))
  ctx.font = `400 ${Math.round(unit * 0.08)}px "JetBrains Mono", Menlo, monospace`
  ctx.fillText('10 LAYER  ·  FR-4  ·  1.2 MM', px(-0.6), pz(art.d / 2 - 0.1))

  // Mounting holes: exposed gold rings with the hole through the middle.
  for (const [x, z] of art.holes) {
    ctx.fillStyle = '#8f7a45'
    ctx.beginPath()
    ctx.arc(px(x), pz(z), unit * 0.105, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#030405'
    ctx.beginPath()
    ctx.arc(px(x), pz(z), unit * 0.075, 0, Math.PI * 2)
    ctx.fill()
  }
}

export const pcbMap = (art: PcbArt) => painted('pcb', 2048, 1200, (c, w, h) => paintPcb(c, w, h, art, 'color'))
export const pcbBump = (art: PcbArt) => painted('pcb-bump', 2048, 1200, (c, w, h) => paintPcb(c, w, h, art, 'bump'), false)

/**
 * A packaged chip's top: black mould compound, laser-marked.
 *
 * Epoxy mould reads as a packaged part because of two things, a faint stipple
 * and the marking — engraved, so it is the compound a shade lighter rather than
 * printed ink. Never a real vendor's mark: the course's own, with a part code
 * and a date code laid out the way every package lays them out.
 */
export const moldTop = (key: string, lines: string[], aspect = 1) =>
  painted(`mold:${key}`, 512, Math.round(512 / aspect), (ctx, w, h) => {
    const r = rng(key.length * 97 + 7)
    ctx.fillStyle = '#16181c'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 2600; i++) {
      const v = 18 + r() * 14
      ctx.fillStyle = `rgba(${v},${v + 1},${v + 4},0.7)`
      ctx.fillRect(r() * w, r() * h, 2, 2)
    }
    const size = Math.min(h * 0.16, w * 0.09)
    ctx.fillStyle = 'rgba(128,134,146,0.75)'
    ctx.textBaseline = 'middle'
    lines.forEach((line, k) => {
      ctx.font = `${k === 0 ? 600 : 400} ${Math.round(size * (k === 0 ? 1.15 : 0.9))}px "JetBrains Mono", Menlo, monospace`
      ctx.fillText(line, w * 0.14, h * 0.5 + (k - (lines.length - 1) / 2) * size * 1.5)
    })
    // Pin 1: a moulded dimple in the corner.
    ctx.fillStyle = 'rgba(6,7,9,0.9)'
    ctx.beginPath()
    ctx.arc(w * 0.07, h * 0.16, Math.min(w, h) * 0.035, 0, Math.PI * 2)
    ctx.fill()
  })

/**
 * A lithium pouch cell's wrap: printed film over foil.
 *
 * The rating is the pack's, three cells in series, and it agrees with the copy:
 * "something around eleven or twelve volts".
 */
export const pouchLabel = () =>
  // Drawn at the cell's own proportions, long across the board's depth, so the
  // print is not stretched along it.
  painted('pouch', 600, 1040, (ctx, w, h) => {
    const r = rng(71)
    ctx.fillStyle = '#aab2bc'
    ctx.fillRect(0, 0, w, h)
    // Foil wrinkles, where the pouch was folded round its stack.
    for (let i = 0; i < 160; i++) {
      const v = 150 + r() * 70
      ctx.strokeStyle = `rgba(${v},${v + 4},${v + 10},0.25)`
      ctx.lineWidth = 1 + r() * 4
      const y = r() * h
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.bezierCurveTo(w * 0.3, y + (r() - 0.5) * 40, w * 0.7, y + (r() - 0.5) * 40, w, y + (r() - 0.5) * 20)
      ctx.stroke()
    }
    // The printed label panel.
    ctx.fillStyle = '#1c2530'
    ctx.fillRect(w * 0.1, h * 0.36, w * 0.8, h * 0.28)
    ctx.fillStyle = '#e8ecf1'
    ctx.font = '600 44px "Space Grotesk", "Helvetica Neue", Arial, sans-serif'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('Li-ion POLYMER', w * 0.16, h * 0.44)
    ctx.font = '400 24px "JetBrains Mono", Menlo, monospace'
    ctx.fillText('3S1P · 11.55 V NOMINAL', w * 0.16, h * 0.5)
    ctx.fillText('DO NOT PUNCTURE OR HEAT', w * 0.16, h * 0.545)
    ctx.fillStyle = '#f0b44a'
    ctx.fillRect(w * 0.16, h * 0.58, w * 0.22, 8)
  })

/** An M.2 card's gold edge fingers, the part that goes into the socket. */
export const edgeFingers = () =>
  painted('fingers', 256, 64, (ctx, w, h) => {
    ctx.fillStyle = '#0f2a22'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#e0b552'
    const n = 30
    for (let k = 0; k < n; k++) {
      // The key notch: one gap where the fingers stop, so the card only goes in one way.
      if (k === 22 || k === 23) continue
      ctx.fillRect(k * (w / n) + 1.5, 6, w / n - 3, h - 12)
    }
  })

/* ------------------------------------------------------------------ */
/* Boot (Lecture 7)                                                     */
/* ------------------------------------------------------------------ */

/*
 * Each stage's face: the hardware or the data that stage is about, drawn in
 * plan, as an emissive map for a `topFaced` stage block (0.6 × 0.8).
 *
 * These are lit panels with the drawing *etched out of* them, the reverse of
 * the memory and pipeline faces, which are dark panels with a bright drawing.
 * Boot's whole argument is carried by whether a stage is lit, and "nothing
 * un-completes" has to read at a glance from across the room — a dark face
 * with thin bright lines reads as a stage that is mostly off. So the face
 * stays bright and the detail is the darker ink, and the frame, which the
 * sides sample, is brighter still, because the sides are most of what the
 * camera sees of a stage that has risen.
 */
const BOOT_W = 192
const BOOT_H = 256
const BOOT_FACE = 'rgb(206,206,206)'
const BOOT_SIDE = 'rgb(222,222,222)'
const INK = 'rgb(104,104,104)'
const DEEP = 'rgb(72,72,72)'
const BRIGHT = 'rgb(255,255,255)'

function bootFramed(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = BOOT_SIDE
  ctx.fillRect(0, 0, w, h)
  const fx = w * FRAME
  const fy = h * FRAME
  const f = { x: fx, y: fy, w: w - fx * 2, h: h - fy * 2 }
  ctx.fillStyle = BOOT_FACE
  ctx.fillRect(f.x, f.y, f.w, f.h)
  // A fine engraved border just inside the frame, so the face reads as a panel.
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.strokeRect(f.x + 4, f.y + 4, f.w - 8, f.h - 8)
  return f
}

function bootPrint(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, colour = DEEP) {
  ctx.fillStyle = colour
  ctx.font = `600 ${size}px "JetBrains Mono", Menlo, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
  ctx.textAlign = 'start'
}

/** A small moulded IC in plan: body, gull-wing leads either side, pin-1 dot. */
function bootChip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pins: number) {
  const pitch = h / pins
  ctx.fillStyle = INK
  for (let k = 0; k < pins; k++) {
    const py = y + pitch * (k + 0.5) - pitch * 0.18
    ctx.fillRect(x - w * 0.16, py, w * 0.16, pitch * 0.36)
    ctx.fillRect(x + w, py, w * 0.16, pitch * 0.36)
  }
  ctx.fillStyle = DEEP
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.arc(x + w * 0.2, y + Math.min(w, h) * 0.14, Math.min(w, h) * 0.06, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * Power: a buck regulator as it sits on a board — the moulded inductor that
 * dominates it, two bulk capacitors, and the small controller between them.
 */
export const bootPowerTop = () =>
  painted('boot-rail', BOOT_W, BOOT_H, (ctx, w, h) => {
    const f = bootFramed(ctx, w, h)
    const cx = f.x + f.w / 2
    // The inductor: a square body with the winding's ring showing through.
    const s = f.w * 0.62
    const iy = f.y + f.h * 0.1
    ctx.fillStyle = DEEP
    ctx.fillRect(cx - s / 2, iy, s, s)
    ctx.strokeStyle = INK
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(cx, iy + s / 2, s * 0.3, 0, Math.PI * 2)
    ctx.stroke()
    // Two bulk capacitors, round cans with a vent cross.
    const cy = f.y + f.h * 0.74
    for (const dx of [-0.26, 0.26]) {
      const x = cx + dx * f.w
      ctx.fillStyle = DEEP
      ctx.beginPath()
      ctx.arc(x, cy, f.w * 0.16, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = INK
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(x - f.w * 0.08, cy)
      ctx.lineTo(x + f.w * 0.08, cy)
      ctx.moveTo(x, cy - f.w * 0.08)
      ctx.lineTo(x, cy + f.w * 0.08)
      ctx.stroke()
    }
    // The controller, between them.
    bootChip(ctx, cx - f.w * 0.07, cy - f.w * 0.08, f.w * 0.14, f.w * 0.16, 3)
  })

/**
 * Reset: the supervisor. A comparator watching the supply against a fixed
 * threshold, and the reset line it holds until the supply is past it.
 */
export const bootResetTop = () =>
  painted('boot-reset', BOOT_W, BOOT_H, (ctx, w, h) => {
    const f = bootFramed(ctx, w, h)
    const cx = f.x + f.w / 2
    const cy = f.y + f.h * 0.44
    const s = f.w * 0.32
    // Inputs: the supply, and the reference it is compared with.
    ctx.strokeStyle = INK
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(f.x + 10, cy - s * 0.45)
    ctx.lineTo(cx - s * 0.8, cy - s * 0.45)
    ctx.moveTo(f.x + 10, cy + s * 0.45)
    ctx.lineTo(cx - s * 0.8, cy + s * 0.45)
    // Output, down to the reset line.
    ctx.moveTo(cx + s * 0.8, cy)
    ctx.lineTo(f.x + f.w - 18, cy)
    ctx.lineTo(f.x + f.w - 18, f.y + f.h * 0.84)
    ctx.stroke()
    // The comparator.
    ctx.fillStyle = DEEP
    ctx.beginPath()
    ctx.moveTo(cx - s * 0.8, cy - s)
    ctx.lineTo(cx + s * 0.8, cy)
    ctx.lineTo(cx - s * 0.8, cy + s)
    ctx.closePath()
    ctx.fill()
    bootPrint(ctx, '+', cx - s * 0.5, cy - s * 0.45, 18, BOOT_FACE)
    bootPrint(ctx, '−', cx - s * 0.5, cy + s * 0.45, 18, BOOT_FACE)
    // The reset line itself, held low, across the bottom.
    ctx.fillStyle = DEEP
    ctx.fillRect(f.x + 12, f.y + f.h * 0.84 - 3, f.w - 24, 7)
    bootPrint(ctx, 'RST', cx, f.y + f.h * 0.93, 14)
  })

/**
 * Firmware: the SPI flash chip on the board, eight leads, and the address the
 * processor is wired to fetch from first. On x86 that is FFFFFFF0.
 */
export const bootFirmwareTop = () =>
  painted('boot-firmware', BOOT_W, BOOT_H, (ctx, w, h) => {
    const f = bootFramed(ctx, w, h)
    const bw = f.w * 0.52
    const bh = f.h * 0.5
    const bx = f.x + (f.w - bw) / 2
    const by = f.y + f.h * 0.1
    bootChip(ctx, bx, by, bw, bh, 4)
    // Its array of erase sectors, faintly, inside the mould.
    ctx.fillStyle = INK
    for (let j = 0; j < 6; j++)
      for (let i = 0; i < 4; i++) ctx.fillRect(bx + 8 + i * ((bw - 16) / 4), by + 20 + j * ((bh - 28) / 6), (bw - 16) / 4 - 4, (bh - 28) / 6 - 4)
    bootPrint(ctx, 'FFFFFFF0', f.x + f.w / 2, f.y + f.h * 0.78, 17)
    ctx.fillStyle = DEEP
    ctx.fillRect(f.x + f.w * 0.16, f.y + f.h * 0.86, f.w * 0.68, 3)
  })

/**
 * Self-test: memory, the thing it spends most of this stage finding and
 * training — two modules, each a row of DRAM packages above its edge contacts.
 */
export const bootPostTop = () =>
  painted('boot-post', BOOT_W, BOOT_H, (ctx, w, h) => {
    const f = bootFramed(ctx, w, h)
    for (let m = 0; m < 2; m++) {
      const x = f.x + 12 + m * (f.w / 2)
      const mw = f.w / 2 - 24
      const y = f.y + 12
      const mh = f.h - 24
      ctx.strokeStyle = INK
      ctx.lineWidth = 3
      ctx.strokeRect(x, y, mw, mh)
      // Packages down the module.
      for (let k = 0; k < 4; k++) {
        ctx.fillStyle = DEEP
        ctx.fillRect(x + 6, y + 8 + k * ((mh - 40) / 4), mw - 12, (mh - 40) / 4 - 7)
      }
      // Edge contacts at the end that goes into the slot.
      ctx.fillStyle = INK
      for (let k = 0; k < 5; k++) ctx.fillRect(x + 4 + k * ((mw - 8) / 5), y + mh - 24, (mw - 8) / 5 - 3, 18)
    }
  })

/**
 * Find a disk: a partition table, the thing it is reading on every drive it
 * tries — a header, then a small partition set aside for the loader, then the
 * rest of the disk.
 */
export const bootFindTop = () =>
  painted('boot-find', BOOT_W, BOOT_H, (ctx, w, h) => {
    const f = bootFramed(ctx, w, h)
    const x = f.x + 14
    const bw = f.w - 28
    let y = f.y + 12
    // Header rows.
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = k === 0 ? DEEP : INK
      ctx.fillRect(x, y, bw, 9)
      y += 14
    }
    y += 6
    // The small partition, set aside for the loader: the one being looked for.
    ctx.strokeStyle = DEEP
    ctx.lineWidth = 4
    ctx.strokeRect(x, y, bw, f.h * 0.16)
    bootPrint(ctx, 'EFI', x + bw / 2, y + f.h * 0.08, 16)
    y += f.h * 0.16 + 8
    // The rest of the disk.
    ctx.fillStyle = INK
    ctx.fillRect(x, y, bw, f.y + f.h - 12 - y)
    ctx.fillStyle = BOOT_FACE
    for (let yy = y + 10; yy < f.y + f.h - 20; yy += 12) ctx.fillRect(x + 8, yy, bw - 16, 3)
  })

/**
 * The bootloader: one boot sector, exactly 512 bytes, as sixteen by thirty-two
 * cells — code, then the partition entries, then the two-byte signature
 * firmware checks for, 55 AA, in the last two cells.
 */
export const bootLoaderTop = () =>
  painted('boot-loader', BOOT_W, BOOT_H, (ctx, w, h) => {
    const r = rng(83)
    const f = bootFramed(ctx, w, h)
    const cols = 16
    const rows = 32
    const cw = (f.w - 16) / cols
    const rh = (f.h - 16) / rows
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const n = j * cols + i
        let fill: string | null
        if (n >= 510) fill = DEEP // the signature
        else if (n >= 446) fill = (n - 446) % 16 < 8 ? INK : 'rgb(150,150,150)' // four partition entries
        else fill = r() < 0.72 ? (r() < 0.5 ? INK : 'rgb(150,150,150)') : null // code, and its zero padding
        if (!fill) continue
        ctx.fillStyle = fill
        ctx.fillRect(f.x + 8 + i * cw + 0.5, f.y + 8 + j * rh + 0.5, cw - 1.5, rh - 1.5)
      }
  })

/**
 * The kernel: the privilege rings, drawn the way every architecture manual
 * draws them, with ring 0 — the kernel's — solid at the centre. The wall that
 * rises round this block is the outermost of them made physical.
 */
export const bootKernelTop = () =>
  painted('boot-kernel', BOOT_W, BOOT_H, (ctx, w, h) => {
    const f = bootFramed(ctx, w, h)
    const cx = f.x + f.w / 2
    const cy = f.y + f.h / 2
    const R = f.w * 0.44
    ctx.lineWidth = 5
    for (let k = 3; k >= 1; k--) {
      ctx.strokeStyle = k === 3 ? DEEP : INK
      ctx.beginPath()
      ctx.arc(cx, cy, (R * (k + 1)) / 4, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.fillStyle = DEEP
    ctx.beginPath()
    ctx.arc(cx, cy, R / 4, 0, Math.PI * 2)
    ctx.fill()
    bootPrint(ctx, '0', cx, cy + 1, 18, BRIGHT)
  })

/* ------------------------------------------------------------------ */
/* Kernel (Lectures 8 and 9)                                            */
/* ------------------------------------------------------------------ */

/*
 * Emissive maps in the boot stages' convention: a bright face with the detail
 * etched dark into it, and a brighter frame the sides sample. These blocks are
 * lit to say who is running and who is waiting, so the face has to stay bright
 * enough that a lit block is plainly lit.
 */

/**
 * Kernel space: the inlaid floor inside the wall, turned rather than grained —
 * fine concentric grooves, the one surface in the scene with no grid, so the
 * inside reads as a different material from the bench the programs stand on.
 */
export const kernelFloor = () =>
  painted('kernel-floor', 512, 512, (ctx, w, h) => {
    const r = rng(97)
    ctx.fillStyle = 'rgb(228,228,228)'
    ctx.fillRect(0, 0, w, h)
    const cx = w / 2
    const cy = h / 2
    for (let k = 4; k < w / 2; k += 3) {
      const v = 196 + Math.floor(r() * 30)
      ctx.strokeStyle = `rgb(${v},${v},${v})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, k, 0, Math.PI * 2)
      ctx.stroke()
    }
    // A scribed register line near the rim, where the wall is seated.
    ctx.strokeStyle = 'rgb(150,150,150)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx, cy, w / 2 - 10, 0, Math.PI * 2)
    ctx.stroke()
  })

/**
 * The core, from above: one CPU core's floorplan in a hexagonal die — the
 * register file, the execution units, decode, and the two first-level caches
 * that sit beside it — so the thing every program is waiting for is plainly a
 * processor rather than a lit token.
 */
export const kernelCoreTop = () =>
  painted('kernel-core', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = BOOT_SIDE
    ctx.fillRect(0, 0, w, h)
    const cx = w / 2
    const cy = h / 2
    // The die: a hexagon matching the geometry's (vertex toward +z, which is
    // the bottom of the map).
    const hex = (R: number) => {
      ctx.beginPath()
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2
        const x = cx + Math.sin(a) * R
        const y = cy + Math.cos(a) * R
        if (k === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
    }
    hex(w * 0.5)
    ctx.fillStyle = BOOT_FACE
    ctx.fill()
    hex(w * 0.44)
    ctx.strokeStyle = INK
    ctx.lineWidth = 3
    ctx.stroke()
    // Two cache arrays either side: L1 instruction and L1 data.
    for (const side of [-1, 1]) {
      const x = cx + side * w * 0.2 - w * 0.07
      ctx.fillStyle = INK
      ctx.fillRect(x, cy - h * 0.2, w * 0.14, h * 0.4)
      ctx.fillStyle = BOOT_FACE
      for (let y = cy - h * 0.18; y < cy + h * 0.19; y += 7) ctx.fillRect(x + 4, y, w * 0.14 - 8, 2)
    }
    // The register file: a small tight grid at the top of the core.
    ctx.fillStyle = DEEP
    ctx.fillRect(cx - w * 0.1, cy - h * 0.22, w * 0.2, h * 0.14)
    ctx.fillStyle = INK
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 6; i++) ctx.fillRect(cx - w * 0.09 + i * w * 0.031, cy - h * 0.205 + j * h * 0.042, w * 0.022, h * 0.03)
    // Execution units, then decode.
    ctx.fillStyle = DEEP
    ctx.fillRect(cx - w * 0.1, cy - h * 0.05, w * 0.09, h * 0.12)
    ctx.fillRect(cx + w * 0.01, cy - h * 0.05, w * 0.09, h * 0.12)
    ctx.fillStyle = INK
    ctx.fillRect(cx - w * 0.1, cy + h * 0.1, w * 0.2, h * 0.09)
    bootPrint(ctx, 'CPU 0', cx, cy + h * 0.3, 15)
  })

/**
 * A program, from above: its own address space, low to high — code, data,
 * heap, a gap, and the stack at the top — which is exactly what the wall and
 * the page tables are keeping every other program out of.
 */
export const kernelProgramTop = () =>
  painted('kernel-program', 144, 200, (ctx, w, h) => {
    const r = rng(113)
    const f = bootFramed(ctx, w, h)
    const x = f.x + 12
    const bw = f.w - 24
    const top = f.y + 12
    const bottom = f.y + f.h - 12
    const span = bottom - top
    const band = (from: number, to: number) => [top + span * from, span * (to - from)] as const
    // Stack, at the top of the address space, as a pile of frames.
    const [sy, sh] = band(0, 0.22)
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = k === 3 ? INK : DEEP
      ctx.fillRect(x, sy + k * (sh / 4), bw, sh / 4 - 3)
    }
    // The unmapped gap between stack and heap: nothing there, drawn as nothing.
    ctx.strokeStyle = INK
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    const [gy, gh] = band(0.25, 0.47)
    ctx.strokeRect(x + 1, gy, bw - 2, gh)
    ctx.setLineDash([])
    // Heap: blocks of assorted size.
    const [hy, hh] = band(0.5, 0.66)
    let hx = x
    while (hx < x + bw - 8) {
      const bwk = Math.min(8 + r() * 26, x + bw - hx)
      ctx.fillStyle = r() < 0.7 ? INK : DEEP
      ctx.fillRect(hx, hy, bwk - 3, hh)
      hx += bwk
    }
    // Data: a tight grid of words.
    const [dy, dh] = band(0.69, 0.8)
    ctx.fillStyle = INK
    for (let j = 0; j < 2; j++)
      for (let i = 0; i < 6; i++) ctx.fillRect(x + i * (bw / 6), dy + j * (dh / 2), bw / 6 - 3, dh / 2 - 3)
    // Code: instruction lines of ragged length.
    const [cy, ch] = band(0.83, 1)
    ctx.fillStyle = DEEP
    for (let y = cy; y < cy + ch - 3; y += 6) ctx.fillRect(x, y, bw * (0.45 + r() * 0.55), 3)
  })

/** A filesystem: a directory tree, root at the top, files hanging off it. */
export const kernelFsTop = () =>
  painted('kernel-fs', 160, 160, (ctx, w, h) => {
    const f = bootFramed(ctx, w, h)
    const x0 = f.x + f.w * 0.2
    ctx.fillStyle = DEEP
    ctx.fillRect(x0 - 10, f.y + 14, 22, 14)
    ctx.strokeStyle = DEEP
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x0, f.y + 28)
    ctx.lineTo(x0, f.y + f.h - 22)
    ctx.stroke()
    for (let k = 0; k < 4; k++) {
      const y = f.y + 44 + k * ((f.h - 66) / 3)
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(x0 + 22, y)
      ctx.stroke()
      ctx.fillStyle = k % 2 ? INK : DEEP
      ctx.fillRect(x0 + 24, y - 6, f.w * 0.5 - (k % 2) * 16, 12)
    }
  })

/** A device driver: the controller it drives, a chip with its bus to the device. */
export const kernelDriverTop = () =>
  painted('kernel-driver', 160, 160, (ctx, w, h) => {
    const f = bootFramed(ctx, w, h)
    const s = f.w * 0.46
    bootChip(ctx, f.x + (f.w - s) / 2, f.y + f.h * 0.14, s, s, 5)
    ctx.fillStyle = INK
    for (let k = 0; k < 4; k++) ctx.fillRect(f.x + f.w * 0.3 + k * f.w * 0.12, f.y + f.h * 0.66, 4, f.h * 0.2)
  })

/** A network stack: its layers, one above the other, with a packet on top. */
export const kernelNetTop = () =>
  painted('kernel-net', 160, 160, (ctx, w, h) => {
    const f = bootFramed(ctx, w, h)
    const x = f.x + 14
    const bw = f.w - 28
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = k === 0 ? DEEP : INK
      const y = f.y + 14 + k * ((f.h - 28) / 4)
      ctx.fillRect(x + k * 4, y, bw - k * 8, (f.h - 28) / 4 - 6)
    }
  })

/**
 * A hexagonal prism with rounded edges whose top carries a whole texture, and
 * whose sides carry the frame of it — `topFaced` for the core's die.
 *
 * Its corners sit where a six-segment cylinder's do (one toward +z), so it is
 * a drop-in for the plain hexagon it replaces. `h` tall, centred on the origin.
 */
export function hexFaced(r: number, h: number, bevel = 0.03) {
  const key = `hex|${r}|${h}|${bevel}`
  let g = faced.get(key)
  if (!g) {
    const s = new THREE.Shape()
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2
      const x = Math.sin(a) * r
      const y = -Math.cos(a) * r
      if (k === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    }
    s.closePath()
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: h - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelOffset: -bevel,
      bevelSegments: 3,
    })
    geo.translate(0, 0, bevel)
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, -h / 2, 0)
    const pos = geo.attributes.position
    const nor = geo.attributes.normal
    const uv = geo.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      if (nor.getY(i) > 0.5) uv.setXY(i, pos.getX(i) / (2 * r) + 0.5, 0.5 - pos.getZ(i) / (2 * r))
      else uv.setXY(i, FRAME * 0.4, FRAME * 0.4)
    }
    uv.needsUpdate = true
    g = geo
    faced.set(key, g)
  }
  return g
}

/* ------------------------------------------------------------------ */
/* Code (Lecture 10)                                                    */
/* ------------------------------------------------------------------ */

/**
 * One line of source, from above: its tokens as pills in a line, the way an
 * editor sets them — a line-number gutter, then names, operators and a value,
 * each a different weight of ink.
 *
 * Still not text, on purpose. The scene says the point is what happens to the
 * line, not what it says, and a readable line invites reading. This is the
 * *shape* of a statement: long names, short operators, the semicolon.
 * An emissive map for a `topFaced` slab 1.5 × 0.62.
 */
export const sourceTop = () =>
  painted('code-source', 512, 212, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(58,58,58)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    // The gutter: a line number, and the rule beside it.
    ctx.fillStyle = 'rgb(120,120,120)'
    ctx.fillRect(f.x + 14, f.y + f.h * 0.38, 16, f.h * 0.24)
    ctx.fillRect(f.x + 40, f.y + 10, 2, f.h - 20)
    // total = price * count + tax ;
    const tokens: Array<[number, number]> = [
      [5, 255], [1, 170], [5, 255], [1, 170], [5, 255], [1, 170], [3, 230], [1, 140],
    ]
    // Twenty-two characters and eight spaces.
    const em = (f.w - 70) / 30
    let x = f.x + 56
    for (const [chars, ink] of tokens) {
      const tw = chars * em
      ctx.fillStyle = `rgb(${ink},${ink},${ink})`
      ctx.beginPath()
      ctx.roundRect(x, f.y + f.h * 0.34, tw, f.h * 0.32, f.h * 0.1)
      ctx.fill()
      x += tw + em
    }
  })

/**
 * A byte, from above: eight equal places, front to back. All eight the same
 * brightness — which of them are set is the bit row's business, one shelf
 * down. An emissive map for a `topFaced` key 0.108 × 0.62.
 */
export const byteTop = () =>
  painted('code-byte', 48, 256, (ctx, w, h) => {
    const f = framed(ctx, w, h)
    ctx.fillStyle = 'rgb(70,70,70)'
    ctx.fillRect(f.x, f.y, f.w, f.h)
    const pitch = (f.h - 8) / 8
    ctx.fillStyle = 'rgb(245,245,245)'
    for (let k = 0; k < 8; k++) ctx.fillRect(f.x + 4, f.y + 4 + k * pitch + 2, f.w - 8, pitch - 4)
  })

/** What the rack's back panel is painted from, in panel space (x centred, y up from the bottom edge). */
export type RackArt = {
  w: number
  h: number
  /** Every parent-to-child route, as a polyline and a trace width in panel units. */
  routes: Array<{ points: Array<[number, number]>; width: number }>
}

/**
 * The back of the rack: the anodised bench finish, stood on end, with the
 * fan-out between the levels routed into it — one statement to each of its
 * instructions, each instruction to its four bytes, each byte to its eight
 * bits. Dull steel and never lit: it is the family tree, and the light that
 * falls down it is the descent.
 */
export const rackPanel = (art: RackArt) =>
  painted('code-rack', 2048, Math.round((2048 * art.h) / art.w), (ctx, W, H) => {
    const r = rng(131)
    const px = (x: number) => (x / art.w + 0.5) * W
    const py = (y: number) => (1 - y / art.h) * H
    ctx.fillStyle = '#0c1119'
    ctx.fillRect(0, 0, W, H)
    for (let i = 0; i < 26000; i++) {
      const v = 12 + r() * 10
      ctx.fillStyle = `rgba(${v},${v + 4},${v + 10},0.6)`
      ctx.fillRect(r() * W, r() * H, 2, 2)
    }
    // The registration grid, at the benches' pitch of half a unit.
    ctx.fillStyle = 'rgba(110,160,210,0.32)'
    for (let x = -Math.floor(art.w); x <= art.w; x += 0.5)
      for (let y = 0.25; y < art.h; y += 0.5) {
        ctx.beginPath()
        ctx.arc(px(x), py(y), 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const unit = W / art.w
    // Opaque, so the shared trunk of a fan does not brighten where routes overlap.
    for (const { points, width } of art.routes) {
      ctx.strokeStyle = 'rgb(74,100,126)'
      ctx.lineWidth = Math.max(1.2, width * unit)
      ctx.beginPath()
      points.forEach(([x, y], k) => (k === 0 ? ctx.moveTo(px(x), py(y)) : ctx.lineTo(px(x), py(y))))
      ctx.stroke()
    }
    // A via where each route lands, drawn after every trace so none covers one.
    ctx.fillStyle = 'rgb(128,150,172)'
    for (const { points, width } of art.routes) {
      const [ex, ey] = points[points.length - 1]
      ctx.beginPath()
      ctx.arc(px(ex), py(ey), Math.max(1, width * unit * 1.3), 0, Math.PI * 2)
      ctx.fill()
    }
  })
