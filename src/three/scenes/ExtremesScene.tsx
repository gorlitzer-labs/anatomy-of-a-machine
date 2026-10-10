import { useLayoutEffect, useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { nameHandlers } from '../naming'
import { driver, updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { damp } from '../../lib/math'
import { benchMap, roundedBox, tiled } from '../surfaces'
import {
  C,
  CELL_H,
  CELL_Y,
  COARSE,
  FINE,
  type Grid,
  PKG,
  UNIT_X,
  VOTER_Z,
  cellCount,
  cellSize,
  cellX,
  cellZ,
  cellsAt,
  measureAt,
  spikeAt,
  strikesFor,
  voteAt,
} from './extremesLayout'

/**
 * A rad-hard module, and then the same cells arranged two other ways.
 *
 * Every animation that matters here is on `beatTime`, because every one of them
 * is a *history* rather than a state: strikes that have landed, errors that
 * have accumulated, cells that have died. The clock sweep is the single
 * exception and is deliberately on the page clock — a clock has no beginning to
 * miss, and the point of the neuromorphic beat is that it is gone.
 */

const S_SOFT = strikesFor(COARSE, 1, false)
const S_HARD = strikesFor(COARSE, 1, false, 3)
const S_TRIPLE = strikesFor(COARSE, 3, false)
const S_FINE = strikesFor(FINE, 1, true)

type Mode = {
  /** Which of the three unit slots hold a coarse grid. */
  coarse: number[]
  /** Whether the dense grid is on screen, in slot 2. */
  fine: boolean
  strikes: typeof S_SOFT | null
  fineStrikes: typeof S_FINE | null
  /** Errors get rewritten rather than accumulating. */
  scrub: boolean
  voter: boolean
  /** Ticks per second for the instruction sweep, or 0 for no clock at all. */
  sweep: number
  spikes: boolean
  quantum: boolean
}

const BASE: Mode = {
  coarse: [1],
  fine: false,
  strikes: null,
  fineStrikes: null,
  scrub: true,
  voter: false,
  sweep: 0,
  spikes: false,
  quantum: false,
}

/**
 * What each beat shows.
 *
 * Keyed on `motion` rather than `focus` so that two beats can hold the same
 * camera on the same module and still argue different things — which the
 * triplication pair and the two contrast beats all rely on.
 */
function modeFor(motion: string | null): Mode {
  switch (motion) {
    // The machine, inert. No strikes at all: the beat is about there being
    // nobody to fix it, and damage arriving now would answer a later question.
    case 'nofix':
      return { ...BASE }
    // Damage with nothing correcting it, so the reader watches it pile up.
    case 'strike':
      return { ...BASE, strikes: S_SOFT, scrub: false }
    // The same damage, rewritten. Soft errors are lost values, not broken
    // silicon, and the recovery is what makes that difference visible.
    case 'seu':
      return { ...BASE, strikes: S_SOFT, scrub: true }
    // Coarse against dense, same flux, same footprint. The left takes isolated
    // hits; the right takes clusters, which is the real cost of scaling.
    case 'smaller':
      return { ...BASE, coarse: [0], fine: true, strikes: S_SOFT, fineStrikes: S_FINE }
    // Attrition: every third strike is permanent and never comes back.
    case 'hard':
      return { ...BASE, strikes: S_HARD }
    case 'tmr':
      return { ...BASE, coarse: [0, 1, 2], strikes: S_TRIPLE, voter: true }
    case 'voter':
      return { ...BASE, coarse: [0, 1, 2], strikes: S_TRIPLE, voter: true }
    // Survivable and slow on the left, quick and fragile on the right. The
    // sweep rates carry the ratio the copy states.
    case 'slow':
      return { ...BASE, coarse: [0], fine: true, fineStrikes: S_FINE, sweep: 1 }
    // The rhythm the whole course has shown, named for the first time.
    case 'notvon':
      return { ...BASE, sweep: 2.4 }
    // Same cells, no clock.
    case 'neuro':
      return { ...BASE, spikes: true }
    case 'quantum':
      return { ...BASE, quantum: true }
    default:
      return { ...BASE }
  }
}

export function ExtremesScene() {
  return (
    <Part
      id="extremes"
      tags={[
        'nofix',
        'strike',
        'seu',
        'smaller',
        'hard',
        'tmr',
        'voter',
        'slow',
        'notvon',
        'neuro',
        'quantum',
      ]}
      position={[0, 0, 0]}
    >
      <Units />
      <Voter />
      <Particles />
    </Part>
  )
}

/**
 * What a cell is called depends on the beat, not on the mesh.
 *
 * These are the same meshes throughout: an array of memory, then an array of
 * neurons, then a register of qubits. Fixing the name when the geometry was
 * built would have the radiation chapter's tooltips telling a reader looking at
 * a superposed qubit that they are pointing at a bit of SRAM.
 */
const cellName = () => {
  const m = modeFor(driver.motion)
  if (m.quantum) return 'extremes:qubit'
  if (m.spikes) return 'extremes:neuron'
  return 'extremes:bit'
}

const cellHandlers = nameHandlers('extremes', cellName)
const substrateHandlers = nameHandlers('extremes', 'extremes:unit')

/*
 * Two packages, one per kind of part the lecture compares.
 *
 * The coarse grid is the hardened part, so it sits the way rad-hard memory
 * flies: a ceramic flatpack, lid off, the die in a cavity behind a gold seal
 * ring, flat gold leads out of both long sides. The dense grid is the
 * commercial part it is set against on the scaling and processor beats — black
 * moulded plastic, finer-pitched tinned leads. Same footprint, same die size:
 * the comparison is four times the bits in the same area, and the packages
 * say which side of the trade each one is on without a word on screen.
 *
 * All of it is furniture. None of it is lit, none of it moves on its own, and
 * only the body answers the pointer, as the unit it always named.
 */
type Finish = { body: string; roughness: number; wall: string; ring: string; lead: string; leads: number; leadW: number }
const CERAMIC: Finish = { body: '#2b2521', roughness: 0.55, wall: '#342c27', ring: '#d8b25a', lead: '#d8b25a', leads: 16, leadW: 0.05 }
const PLASTIC: Finish = { body: '#121418', roughness: 0.78, wall: '#17191e', ring: '#5b636e', lead: '#aeb4bb', leads: 30, leadW: 0.028 }

/** Where the body's centre and bottom are. */
const BODY_Y = PKG.top - PKG.h / 2
const BODY_BOTTOM = PKG.top - PKG.h

/*
 * The die, routed along the grid its cells stand on.
 *
 * Word lines along every row and bit lines down every column, drawn through
 * the cell centres from the same `cellX` and `cellZ` the cells are placed
 * with, so what shows in the gaps between cells is the array's own wiring —
 * the reason a memory is a grid at all — and it cannot drift off the cells.
 * Painted once per pitch.
 */
const dieMaps = new Map<string, THREE.CanvasTexture>()
function dieMap(g: Grid) {
  const key = `${g.cols}x${g.rows}`
  const hit = dieMaps.get(key)
  if (hit) return hit
  const W = 1024
  const H = Math.round((W * PKG.die.d) / PKG.die.w)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const px = (x: number) => (x / PKG.die.w + 0.5) * W
  const pz = (z: number) => (z / PKG.die.d + 0.5) * H

  ctx.fillStyle = '#121a27'
  ctx.fillRect(0, 0, W, H)
  let seed = 16 + g.cols
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 5000; i++) {
    const v = 24 + r() * 22
    ctx.fillStyle = `rgba(${v},${v + 6},${v + 18},0.5)`
    ctx.fillRect(r() * W, r() * H, 2, 2)
  }

  const n = cellCount(g)
  const fine = g.cols > COARSE.cols
  ctx.strokeStyle = 'rgba(150,175,210,0.34)'
  ctx.lineWidth = fine ? 1.5 : 2.5
  ctx.beginPath()
  for (let c = 0; c < g.cols; c++) {
    const x = px(cellX(g, c))
    ctx.moveTo(x, pz(cellZ(g, 0)) - 18)
    ctx.lineTo(x, pz(cellZ(g, n - 1)) + 18)
  }
  for (let row = 0; row < g.rows; row++) {
    const z = pz(cellZ(g, row * g.cols))
    ctx.moveTo(px(cellX(g, 0)) - 18, z)
    ctx.lineTo(px(cellX(g, g.cols - 1)) + 18, z)
  }
  ctx.stroke()

  // Bond pads down both long edges, and the seal ring round the die.
  ctx.fillStyle = 'rgba(200,210,225,0.55)'
  const pads = fine ? 30 : 16
  for (let i = 0; i < pads; i++) {
    const x = W * 0.06 + (i / (pads - 1)) * W * 0.88
    ctx.fillRect(x - 5, 10, 10, 12)
    ctx.fillRect(x - 5, H - 22, 10, 12)
  }
  ctx.strokeStyle = 'rgba(190,200,220,0.7)'
  ctx.lineWidth = 4
  ctx.strokeRect(4, 4, W - 8, H - 8)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  dieMaps.set(key, tex)
  return tex
}

/**
 * A soft contact shadow, painted rather than rendered.
 *
 * The course's shared contact shadow is one instance moved between scenes, and
 * this lecture is not on its list. A blurred rounded rectangle on a plane just
 * under each part anchors it the same way, costs one texture and no extra
 * render pass, and scales with the unit it belongs to — so a unit arriving or
 * leaving takes its shadow with it.
 */
let shadowTex: THREE.CanvasTexture | null = null
function shadowMap() {
  if (shadowTex) return shadowTex
  const W = 256
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = W
  const ctx = canvas.getContext('2d')!
  // Drawn off-canvas and only its blurred shadow let in: the portable blur.
  ctx.shadowColor = 'rgba(0,0,0,0.85)'
  ctx.shadowBlur = 34
  ctx.shadowOffsetX = W * 4
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.roundRect(W * 0.2 - W * 4, W * 0.2, W * 0.6, W * 0.6, 18)
  ctx.fill()
  shadowTex = new THREE.CanvasTexture(canvas)
  return shadowTex
}

function Shadow({ w, d, y, strength = 0.75 }: { w: number; d: number; y: number; strength?: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[w / 0.6, d / 0.6]} />
      <meshBasicMaterial color="#000000" alphaMap={shadowMap()} transparent opacity={strength} depthWrite={false} />
    </mesh>
  )
}

/** Flat leads out of both long sides, instanced: one draw per package. */
function Leads({ f }: { f: Finish }) {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const count = f.leads * 2
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const span = PKG.w - 0.42
    for (let side = 0; side < 2; side++)
      for (let i = 0; i < f.leads; i++) {
        const x = (i / (f.leads - 1) - 0.5) * span
        const z = (side ? 1 : -1) * (PKG.d / 2 + PKG.lead.reach / 2 - 0.02)
        m.makeTranslation(x, BODY_Y - 0.01, z)
        mesh.current.setMatrixAt(side * f.leads + i, m)
      }
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.computeBoundingSphere()
  }, [f.leads])
  return (
    <instancedMesh
      ref={mesh}
      args={[roundedBox(f.leadW, PKG.lead.t, PKG.lead.reach + 0.04, 0.006, 2), undefined, count]}
      castShadow
    >
      <meshStandardMaterial color={f.lead} roughness={0.28} metalness={1} />
    </instancedMesh>
  )
}

/** The package: body, cavity wall with its seal ring, the die, the leads. */
function Package({ g }: { g: Grid }) {
  const f = g === FINE ? PLASTIC : CERAMIC
  const map = dieMap(g)
  /* The cavity wall fills the rim between the die and the body's edge, and
     the ring runs along its top. Four bars each, not a frame geometry, so the
     rounded edges catch light the same way every other part's do. */
  const rimX = (PKG.w - PKG.die.w) / 2
  const rimZ = (PKG.d - PKG.die.d) / 2
  const wallH = 0.022
  const wall = [
    { x: 0, z: -(PKG.d - rimZ) / 2, w: PKG.w, d: rimZ },
    { x: 0, z: (PKG.d - rimZ) / 2, w: PKG.w, d: rimZ },
    { x: -(PKG.w - rimX) / 2, z: 0, w: rimX, d: PKG.die.d },
    { x: (PKG.w - rimX) / 2, z: 0, w: rimX, d: PKG.die.d },
  ]
  return (
    <group>
      <mesh position={[0, BODY_Y, 0]} castShadow receiveShadow geometry={roundedBox(PKG.w, PKG.h, PKG.d, 0.03)} {...substrateHandlers}>
        <meshStandardMaterial color={f.body} roughness={f.roughness} metalness={0.15} />
      </mesh>
      {wall.map((b, i) => (
        <group key={i} position={[b.x, PKG.top + wallH / 2, b.z]}>
          <mesh receiveShadow geometry={roundedBox(b.w, wallH, b.d, 0.008, 2)}>
            <meshStandardMaterial color={f.wall} roughness={f.roughness} metalness={0.15} />
          </mesh>
          <mesh position={[0, wallH / 2 + 0.002, 0]} geometry={roundedBox(b.w - 0.03, 0.004, b.d * 0.45, 0.002, 1)}>
            <meshStandardMaterial color={f.ring} roughness={0.3} metalness={1} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, PKG.top + PKG.die.h / 2, 0]} receiveShadow geometry={roundedBox(PKG.die.w - 0.01, PKG.die.h, PKG.die.d - 0.01, 0.004, 1)}>
        <meshStandardMaterial color="#ffffff" map={map} roughness={0.38} metalness={0.5} />
      </mesh>
      <Leads f={f} />
      <Shadow w={PKG.w + 0.1} d={PKG.d + PKG.lead.reach * 2} y={BODY_BOTTOM - 0.004} />
    </group>
  )
}

/** One unit: its package and its cells. */
function unitMeshes(g: Grid, key: string) {
  const s = cellSize(g)
  /* A cell is a lacquered cap with rounded edges: the same finish as the
     instructions and the kernel's programs, so a cell catches a line of the
     environment along every edge and reads as a part, not a pixel. */
  const cap = roundedBox(s, CELL_H, s, s * 0.2, 2)
  return (
    <group key={key}>
      <Package g={g} />
      {Array.from({ length: cellCount(g) }, (_, i) => (
        <mesh key={i} position={[cellX(g, i), CELL_Y, cellZ(g, i)]} castShadow geometry={cap} {...cellHandlers}>
          <meshPhysicalMaterial
            color="#16202c"
            emissive={C.ok}
            emissiveIntensity={0.5}
            roughness={LACQUER.roughness}
            metalness={0.25}
            clearcoat={LACQUER.clearcoat}
            clearcoatRoughness={0.16}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * A unit's cells, in index order.
 *
 * Each slot is a positioned group holding the unit's own group, which holds
 * the package and then one mesh per cell. Painting used to walk the slot's
 * children and skip the first as the substrate — but the slot's only child is
 * the unit group, so it skipped everything and no cell was ever painted. The
 * probe below computed the damage correctly the whole time; the screen showed
 * 54 cyan cells on every beat. Resolved by name of structure, not by counting.
 */
const cellsOf = (slot: THREE.Object3D) => slot.children[0].children.slice(1)

/** The cap's finish while it holds a value, and once it is dead. */
const LACQUER = { roughness: 0.34, clearcoat: 0.65 }
/* Never quite zero: crossing zero switches the clearcoat shader on or off,
   which recompiles the program mid-beat. */
const SCORCHED = { roughness: 0.9, clearcoat: 0.02 }

/**
 * The cells.
 *
 * Four grids are mounted permanently — three at the coarse pitch and one dense
 * — and the beat decides which are on screen. Hidden meshes cost nothing to
 * draw, and mounting them once avoids rebuilding geometry mid-transition, which
 * is what `Flow`'s header warns about.
 */
function Units() {
  const group = useRef<THREE.Group>(null!)
  const fine = useRef<THREE.Group>(null!)
  const shown = useRef<number[]>([0, 0, 0, 0])
  const tint = useMemo(() => new THREE.Color(), [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const m = modeFor(d.motion)
    const bt = d.beatTime
    const t = state.clock.elapsedTime

    if (import.meta.env.DEV) {
      /* Reports corrupted and dead cells directly. Every aggregate measurement
         of this scene from outside is useless: the emissive dump ignores
         visibility, and the substrate fixes the bounding box, so accumulation
         is invisible to a screenshot diff. */
      ;(window as unknown as Record<string, unknown>).__extremes = () => {
        const state0 = m.strikes ? cellsAt(m.strikes, 0, bt, m.scrub) : new Map()
        const fineState = m.fineStrikes ? cellsAt(m.fineStrikes, 0, bt, m.scrub) : new Map()
        const vote = m.voter && m.strikes ? voteAt(m.strikes, bt, cellCount(COARSE)) : null
        return {
          motion: d.motion,
          beatTime: Number(bt.toFixed(2)),
          units: m.coarse.length + (m.fine ? 1 : 0),
          flipped: [...state0.values()].filter((v) => v === 'flipped').length,
          dead: [...state0.values()].filter((v) => v === 'dead').length,
          fineFlipped: fineState.size,
          outvoted: vote?.outvoted ?? null,
          voterLit: m.voter
            ? (m.strikes ?? []).some((s) => s.at <= bt && bt - s.at < 0.45)
            : null,
          corrected: vote?.corrected ?? null,
          spiking: m.spikes
            ? Array.from({ length: cellCount(COARSE) }, (_, i) => spikeAt(i, bt, COARSE)).filter(
                (v) => v > 0,
              ).length
            : null,
        }
      }
    }

    const sweep = m.sweep > 0 ? Math.floor(t * m.sweep) % COARSE.cols : -1
    const q = measureAt(bt)

    group.current.children.forEach((unit, u) => {
      /* Slot 2 is shared with the dense grid. The two used to cross-fade in
         place, so for half a second big and small cells stood through each
         other; now the leaving grid goes quickly and the arriving one waits. */
      const handover = u === 2 && (m.fine || shown.current[3] > 0.05)
      const present = m.coarse.includes(u) && !(u === 2 && shown.current[3] > 0.05)
      shown.current[u] = damp(shown.current[u], present ? 1 : 0, handover && !present ? 14 : 5, dt)
      const v = shown.current[u]
      unit.visible = v > 0.02
      unit.scale.setScalar(Math.max(v, 0.0001))
      if (!unit.visible) return

      /* Strikes are generated against slot 0..n-1 of however many units this
         beat shows, while `u` is the physical position on screen — and the
         single-unit beats render the *centre* one. Mapping through `coarse` is
         what ties a strike to the unit the reader is actually looking at. */
      const bad = m.strikes ? cellsAt(m.strikes, m.coarse.indexOf(u), bt, m.scrub) : null

      cellsOf(unit).forEach((child, i) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshPhysicalMaterial
        paintCell(mat, tint, {
          state: bad?.get(i) ?? 'ok',
          spike: m.spikes ? spikeAt(i, bt, COARSE) : -1,
          quantum: m.quantum ? q : null,
          swept: sweep >= 0 && i % COARSE.cols === sweep,
          hasClock: m.sweep > 0,
          index: i,
        })
      })
    })

    // The dense grid.
    const fineIn = m.fine && shown.current[2] < 0.05
    shown.current[3] = damp(shown.current[3], fineIn ? 1 : 0, !m.fine && m.coarse.includes(2) ? 14 : 5, dt)
    const fv = shown.current[3]
    fine.current.visible = fv > 0.02
    fine.current.scale.setScalar(Math.max(fv, 0.0001))
    if (fine.current.visible) {
      const bad = m.fineStrikes ? cellsAt(m.fineStrikes, 0, bt, m.scrub) : null
      // A modern part is quick as well as fragile, so its clock runs visibly
      // faster than the hardened one beside it.
      const fsweep = m.sweep > 0 ? Math.floor(t * m.sweep * 6) % FINE.cols : -1
      cellsOf(fine.current).forEach((child, i) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshPhysicalMaterial
        paintCell(mat, tint, {
          state: bad?.get(i) ?? 'ok',
          spike: -1,
          quantum: null,
          swept: fsweep >= 0 && i % FINE.cols === fsweep,
          hasClock: m.sweep > 0,
          index: i,
        })
      })
    }
  })

  return (
    <>
      <group ref={group}>
        {UNIT_X.map((x, u) => (
          <group key={u} position={[x, 0, 0]}>
            {unitMeshes(COARSE, `c${u}`)}
          </group>
        ))}
      </group>
      <group ref={fine} position={[UNIT_X[2], 0, 0]}>
        {unitMeshes(FINE, 'fine')}
      </group>
    </>
  )
}

/**
 * One cell's colour and brightness.
 *
 * Pulled out because four grids paint identically and the rules are the
 * lecture: a flipped cell is wrong but recoverable, a dead one is gone, a
 * spiking one is doing work nothing scheduled, and a superposed one is not yet
 * either value.
 */
function paintCell(
  mat: THREE.MeshPhysicalMaterial,
  tint: THREE.Color,
  o: {
    state: string
    spike: number
    quantum: { phase: number; collapsed: boolean; settling: boolean } | null
    swept: boolean
    hasClock: boolean
    index: number
  },
) {
  let colour = C.ok
  let level = 0.42

  if (o.state === 'dead') {
    colour = C.dead
    level = 0.04
  } else if (o.state === 'flipped') {
    colour = C.flipped
    level = 2.0
  } else if (o.quantum) {
    if (o.quantum.collapsed) {
      // One classical answer, and it is definite. Half the cells read 1.
      const one = o.index % 3 !== 0
      colour = one ? C.ok : C.dead
      level = one ? 1.5 : 0.06
    } else {
      // Not yet either value. The copy says plainly that this is the picture's
      // weakest metaphor, so the beat rests on the collapse rather than here.
      colour = C.quantum
      level = 0.5 + 0.5 * Math.sin(o.quantum.phase * 14 + o.index * 0.7)
    }
  } else if (o.spike >= 0) {
    if (o.spike > 0) {
      colour = C.spike
      level = 0.25 + o.spike * 1.9
    } else {
      // Most of the array, most of the time, doing nothing at all. That is the
      // entire efficiency claim, so it has to be visibly dark.
      colour = C.ok
      level = 0.06
    }
  } else if (o.hasClock) {
    colour = C.ok
    level = o.swept ? 1.7 : 0.16
  }

  tint.copy(colour)
  /* The cap's own colour is kept low (it was 0.22 of the tint) so that what a
     cell shows is its emissive state, not the environment on a coloured
     surface. Under a clear lacquer a 0.22 cap lit cyan by reflection alone,
     and the "visibly dark" cells of the neuromorphic beat were not dark. */
  mat.color.copy(tint).multiplyScalar(0.09)
  mat.emissive.copy(tint)
  setEmissive(mat, level)

  /* A dead cell loses its lacquer as well as its light: matte where every
     living cap catches the environment. The difference is permanent for the
     same reason the damage is, and it survives the dim of a far-off frame. */
  const finish = o.state === 'dead' ? SCORCHED : LACQUER
  mat.roughness = finish.roughness
  mat.clearcoat = finish.clearcoat
}

/**
 * The majority vote.
 *
 * Lights green whenever it has just had to overrule one of the three units,
 * which is the only way to see that redundancy is doing something: a module
 * that is working correctly looks identical to one that has no damage, and the
 * voter is the only place the difference surfaces.
 */
/** How long the voter stays lit after an overruling.
    Kept well under the strike interval so the bar is dark more often than lit —
    measured at 0.75 s it was lit 57% of the time, which still read as a status
    lamp rather than as a sequence of separate corrections. */
const FLASH = 0.45

const voterHandlers = nameHandlers('extremes', 'extremes:voter')
const particleHandlers = nameHandlers('extremes', 'extremes:particle')

/* The bar keeps the width it always had, 2.2 of the old 2.5 unit: the tmr and
   voter beats are framed round it. */
const VOTER_W = 5.5
const CARRIER = { w: VOTER_W + 0.34, h: 0.05, d: 0.54 }

function Voter() {
  const rig = useRef<THREE.Group>(null!)
  const bar = useRef<THREE.Mesh>(null!)
  const up = useRef(0)
  const carrier = useMemo(() => tiled(benchMap(), CARRIER.w / 0.5, CARRIER.d / 0.5), [])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const m = modeFor(d.motion)
    up.current = damp(up.current, m.voter ? 1 : 0, 5, dt)
    rig.current.visible = up.current > 0.02
    rig.current.scale.set(1, Math.max(up.current, 0.0001), 1)
    if (!rig.current.visible) return

    const mat = bar.current.material as THREE.MeshStandardMaterial
    /* Flashes at the moment of an overruling and decays, rather than lighting
       for as long as some cell disagrees.
       Measured: at the compressed strike rate roughly two cells are corrupted
       at any instant, so "is anything currently outvoted" was true on every
       sampled frame and the bar sat permanently green — which reads as a
       decorative status light and says "always fixing something", the opposite
       of the truth. Keying on the most recent strike instead makes each
       correction a discrete event the reader can count. */
    const bt = d.beatTime
    let since = Infinity
    for (const s of m.strikes ?? []) {
      if (s.at <= bt) since = Math.min(since, bt - s.at)
    }
    const flash = since < FLASH ? 1 - since / FLASH : 0
    mat.emissive.copy(flash > 0.02 ? C.vote : C.ok)
    setEmissive(mat, 0.3 + flash * 1.9)
  })

  /* The voter stands on a carrier of the same anodised bench as every board in
     the course, with a gold input pad under each unit's output edge — three in
     — and one out at the end: the whole of majority voting, in its wiring.
     Rises as one piece, as the bar alone used to. */
  const top = -0.05
  return (
    <group ref={rig} position={[0, 0.02, VOTER_Z]}>
      <mesh position={[0, top - CARRIER.h / 2, 0]} receiveShadow geometry={roundedBox(CARRIER.w, CARRIER.h, CARRIER.d, 0.025)}>
        <meshStandardMaterial color="#ffffff" map={carrier} roughness={0.62} metalness={0.35} />
      </mesh>
      {UNIT_X.map((x) => (
        <mesh key={x} position={[x, top + 0.003, -CARRIER.d / 2 + 0.05]} geometry={roundedBox(0.5, 0.006, 0.06, 0.003, 1)}>
          <meshStandardMaterial color="#d8b25a" roughness={0.3} metalness={1} />
        </mesh>
      ))}
      <mesh position={[CARRIER.w / 2 - 0.06, top + 0.003, 0]} geometry={roundedBox(0.06, 0.006, 0.22, 0.003, 1)}>
        <meshStandardMaterial color="#d8b25a" roughness={0.3} metalness={1} />
      </mesh>
      <mesh ref={bar} castShadow geometry={roundedBox(VOTER_W, 0.14, 0.34, 0.045)} {...voterHandlers}>
        <meshPhysicalMaterial
          color="#16202c"
          emissive={C.ok}
          emissiveIntensity={0.3}
          roughness={0.34}
          metalness={0.3}
          clearcoat={0.6}
          clearcoatRoughness={0.16}
        />
      </mesh>
      <Shadow w={CARRIER.w} d={CARRIER.d} y={top - CARRIER.h - 0.004} strength={0.6} />
    </group>
  )
}

/**
 * Particles arriving.
 *
 * Each streak is tied to the strike it causes and lands on the cell it
 * corrupts, on the frame that cell turns red. Decoupling them — a general
 * shower of particles over an array that reddens on its own schedule — would
 * leave cause and effect in different places, which is the defect this course
 * keeps finding elsewhere.
 */
const TRAVEL = 0.55
const POOL = 6

function Particles() {
  const group = useRef<THREE.Group>(null!)

  useSceneFrame((state) => {
    const d = updateDriver(state.clock.elapsedTime)
    const m = modeFor(d.motion)
    const bt = d.beatTime

    const all = [
      ...(m.strikes ?? []).map((s) => ({ s, grid: COARSE, x: UNIT_X[m.coarse[s.unit] ?? 1] })),
      ...(m.fineStrikes ?? []).map((s) => ({ s, grid: FINE, x: UNIT_X[2] })),
    ]
      .filter(({ s }) => bt >= s.at - TRAVEL && bt <= s.at + 0.12)
      .slice(0, POOL)

    group.current.children.forEach((child, i) => {
      const hit = all[i]
      if (!hit) {
        child.visible = false
        return
      }
      const { s, grid, x } = hit
      const p = Math.min(1, (bt - (s.at - TRAVEL)) / TRAVEL)
      child.visible = true
      const cell = s.spread[0]
      child.position.set(x + cellX(grid, cell), 3.4 * (1 - p) + 0.06, cellZ(grid, cell) - 1.5 * (1 - p))
      for (const part of (child as THREE.Group).children[0].children) {
        setEmissive((part as THREE.Mesh).material as THREE.MeshStandardMaterial, 0.4 + p * 2.6)
      }
    })
  })

  return (
    <group ref={group}>
      {Array.from({ length: POOL }, (_, i) => (
        <group key={i} visible={false}>
          {/* A bright head on the cell it is about to hit, and a trail that
              thins back along the way it came. The streak used to be a rod
              tilted the other way, across its own path. */}
          <group rotation={[TRAIL_TILT, 0, 0]}>
            <mesh position={[0, TRAIL / 2, 0]} {...particleHandlers}>
              <cylinderGeometry args={[0.003, 0.02, TRAIL, 8, 1]} />
              <meshStandardMaterial color="#2a1620" emissive={C.flipped} emissiveIntensity={1.4} />
            </mesh>
            <mesh {...particleHandlers}>
              <sphereGeometry args={[0.03, 12, 8]} />
              <meshStandardMaterial color="#3a1c26" emissive={C.flipped} emissiveIntensity={1.4} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}

/** The streak's length, and the tilt that lays it back along its path. */
const TRAIL = 0.85
/* The head travels (0, -3.4, +1.5) from where it enters to the cell, so the
   trail points the opposite way: local +y turned about x until it is (0, 3.4, -1.5). */
const TRAIL_TILT = -Math.atan2(1.5, 3.4)
