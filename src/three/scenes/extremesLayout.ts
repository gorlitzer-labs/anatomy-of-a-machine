import * as THREE from 'three'

/**
 * The extremes, as one grid of cells seen under three different disciplines.
 *
 * The lecture joins two subjects that look unrelated — surviving radiation, and
 * machines that are not von Neumann — because they are the same question asked
 * at two edges of the design space. Every other lecture in Part IV takes the
 * ordinary arrangement and squeezes it. This one is about where the ordinary
 * arrangement stops applying at all.
 *
 * So the geometry is deliberately constant and its *meaning* changes: the same
 * grid is memory being struck by particles, then neurons firing at each other,
 * then states held until they are measured. Keeping one object across all
 * eleven beats is the argument — these are not three exotic devices, they are
 * three ways to organise the same cells.
 *
 * MOTION SIGNATURE: attrition, and voting. Damage arrives at random and
 * accumulates; redundant units outvote it. Both are scheduled on beat time and
 * never on the page clock — a strike the reader did not see arrive is just a
 * red square, and accumulation that resets on a modulo is not accumulation.
 *
 * Checked figures:
 *  - RAD750 (BAE datasheet): rad-tolerant 0.25 um, 110-132 MHz, 200 krad(Si);
 *    rad-hard 0.15 um, 200 MHz, 1 Mrad(Si); both latchup-immune, SEU
 *    < 1.6E-10 errors/bit-day, -55 to +125 C; first flight units 2005. A
 *    hardened PowerPC 750, the processor of the 1998 iMac G3. It flies on
 *    Curiosity and Perseverance and on more than a hundred satellites. (No
 *    primary source gives a transistor count, so the copy does not state one.)
 *  - Multi-cell upsets defeat per-word ECC only when the cells share a word;
 *    memories interleave to prevent that, but clusters grow with each node.
 *  - Scaling and upsets: the charge needed to flip a cell falls as cells
 *    shrink, but the cell's collection area falls faster, so the per-bit soft
 *    error rate at advanced nodes can actually *decrease*. What gets worse is
 *    that one strike now deposits charge across several adjacent cells at once
 *    (charge sharing, single-event multi-node upsets), and there are vastly
 *    more bits per die. The failure mode changed from "a rare single flip you
 *    can correct" to "a cluster that defeats the correction".
 *  - Superconducting qubits run at roughly 10-20 mK.
 */

export type CellState = 'ok' | 'flipped' | 'dead'

export const C = {
  ok: new THREE.Color('#4fd8ff'),
  flipped: new THREE.Color('#ff7a92'),
  dead: new THREE.Color('#39414d'),
  vote: new THREE.Color('#6ee7a8'),
  spike: new THREE.Color('#ffab40'),
  quantum: new THREE.Color('#a06bff'),
}

/**
 * Two cell pitches in the same footprint.
 *
 * The ratio is the beat about scaling: same area, same particle flux, four
 * times the bits. Neither number is a real node — the honest version of that
 * comparison is thousands of times, which cannot be drawn.
 */
export type Grid = { cols: number; rows: number }
export const COARSE: Grid = { cols: 9, rows: 6 }
export const FINE: Grid = { cols: 18, rows: 12 }

export const cellCount = (g: Grid) => g.cols * g.rows

/**
 * One unit's footprint, and where the three of them sit.
 *
 * The cell field is a little smaller than it was (2.5 x 1.7) so each unit can
 * be a package rather than a bare slab: at 2.5 the outermost cells reached the
 * substrate's edge, and the three units stand only 2.85 apart, so there was no
 * room for a cavity wall between the die and the outside of the part.
 */
export const UNIT = { w: 2.34, d: 1.62 }
export const UNIT_X = [-2.85, 0, 2.85]

/**
 * The package each unit sits in: body, the die in its cavity, and the leads
 * that leave the two long sides. The leads stop short of the voter's carrier.
 */
export const PKG = {
  w: 2.8,
  d: 2.2,
  h: 0.1,
  /** The body's top, where the die and the cavity wall stand. */
  top: -0.025,
  die: { w: 2.62, d: 1.9, h: 0.012 },
  lead: { reach: 0.17, t: 0.016 },
}

export const cellX = (g: Grid, i: number) => ((i % g.cols) / (g.cols - 1) - 0.5) * UNIT.w
export const cellZ = (g: Grid, i: number) =>
  (Math.floor(i / g.cols) / (g.rows - 1) - 0.5) * UNIT.d
export const cellSize = (g: Grid) => (UNIT.w / g.cols) * 0.72

/** How tall a cell stands, and where its centre sits: on the die. */
export const CELL_H = 0.09
export const CELL_Y = 0.03

/** Where the voter sits, downstream of all three units. */
export const VOTER_Z = 1.6

/**
 * A deterministic hash, so a "random" strike is the same strike every time the
 * reader returns to the beat.
 *
 * Genuine randomness would be worse in two ways: a reader stepping back to see
 * the event again would see a different event, and the three redundant units
 * could by chance be struck identically — which is precisely the case the
 * chapter says is rare enough to build on.
 */
function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export type Strike = {
  /** Seconds after the beat starts. */
  at: number
  unit: number
  /** Cells corrupted by this one strike — one at a coarse pitch, a cluster at a fine one. */
  spread: number[]
  /** Permanent, rather than a value that can simply be written again. */
  hard: boolean
}

/** Seconds between strikes on screen. */
const RATE = 1.3

/**
 * The strikes for a beat, precomputed from the start of that beat.
 *
 * HONEST COMPRESSION, and it is enormous: a spacecraft memory sees on the order
 * of one upset per device per day, and here one arrives every second or so. The
 * copy states the real rate rather than letting the picture imply it, because
 * the lesson is that the rate is low and the consequence is total — which is
 * the one combination a picture cannot carry at true speed.
 */
export function strikesFor(g: Grid, units: number, cluster: boolean, hardEvery = 0): Strike[] {
  const n = cellCount(g)
  const out: Strike[] = []
  for (let i = 0; i < 40; i++) {
    const unit = Math.floor(hash(i * 3.1) * units) % units
    const cell = Math.floor(hash(i * 7.7) * n) % n
    const col = cell % g.cols
    const spread = [cell]
    if (cluster) {
      /* Charge shared with the immediate neighbours. Kept inside the row so a
         cluster never wraps around an edge and reads as two separate hits. */
      if (col > 0) spread.push(cell - 1)
      if (col < g.cols - 1) spread.push(cell + 1)
      if (cell + g.cols < n) spread.push(cell + g.cols)
    }
    out.push({
      at: 0.7 + i * RATE,
      unit,
      spread,
      hard: hardEvery > 0 && i % hardEvery === hardEvery - 1,
    })
  }
  return out
}

/** How long a soft error stays visible before it is scrubbed and rewritten. */
export const SOFT_LIFE = 2.6

/**
 * The state of every corrupted cell in a unit, at `beatTime`.
 *
 * Accumulation is the point, so this only ever reads forward from the start of
 * the beat: a hard error, once written, is never cleared for as long as the
 * reader stays on it. Attrition that resets is not attrition, it is a blinking
 * light — and this scene exists to demonstrate the difference.
 */
export function cellsAt(
  strikes: Strike[],
  unit: number,
  beatTime: number,
  scrub: boolean,
): Map<number, CellState> {
  const out = new Map<number, CellState>()
  for (const s of strikes) {
    if (s.unit !== unit || s.at > beatTime) continue
    const age = beatTime - s.at
    for (const c of s.spread) {
      if (s.hard) {
        out.set(c, 'dead')
        continue
      }
      // A dead cell stays dead; a soft flip landing on one changes nothing.
      if (out.get(c) === 'dead') continue
      if (!scrub || age < SOFT_LIFE) out.set(c, 'flipped')
      else out.delete(c)
    }
  }
  return out
}

/**
 * What the majority vote produces.
 *
 * The voter is the whole argument for triplication and also its weak point: it
 * is the one thing in the module that is not itself redundant, which the beat
 * about cost says out loud rather than leaving the reader to notice.
 */
export function voteAt(strikes: Strike[], beatTime: number, cells: number) {
  const per = [0, 1, 2].map((u) => cellsAt(strikes, u, beatTime, true))
  let corrected = 0
  let disagreeing = -1
  for (let c = 0; c < cells; c++) {
    const bad = per.map((m) => m.has(c))
    if (bad.filter(Boolean).length === 1) {
      corrected++
      disagreeing = bad.indexOf(true)
    }
  }
  return { per, disagreeing, corrected, outvoted: corrected > 0 }
}

/**
 * Spiking activity: sparse, event-driven, propagating cell to cell.
 *
 * Deliberately a *cascade* rather than scattered blinking. The claim is that a
 * neuron fires because the ones feeding it fired, so a spike has to visibly
 * cause the next one — otherwise this is a decorative twinkle and argues
 * nothing the clock sweep did not already argue. The sparsity is the other half
 * of the claim: the efficiency rests entirely on most of the array doing
 * nothing at any given moment, so most cells must be visibly dark.
 */
export function spikeAt(cell: number, beatTime: number, g: Grid): number {
  const col = cell % g.cols
  const local = beatTime * 1.5 - (col / g.cols) * 3.4 - hash(cell * 5.3) * 0.25
  if (local < 0) return 0
  const round = Math.floor(local / 3.2)
  if (hash(cell * 11.7 + round * 2.3) < 0.68) return 0
  const phase = local % 3.2
  if (phase > 0.6) return 0
  return (1 - phase / 0.6) * (0.6 + 0.4 * hash(cell * 3.7))
}

/**
 * Measurement, for the quantum beat.
 *
 * The honest limit of this picture is stated in the copy: a blended colour is a
 * poor metaphor for a superposition, because it looks like a cell holding an
 * intermediate value and that is exactly what a qubit does not hold. What the
 * animation can carry truthfully is the *collapse* — that reading it destroys
 * it and one classical answer comes out — so the collapse is what the motion is
 * built around and the blend is only what precedes it.
 */
export const MEASURE_PERIOD = 7
export function measureAt(beatTime: number) {
  const phase = (beatTime % MEASURE_PERIOD) / MEASURE_PERIOD
  return { phase, collapsed: phase > 0.74, settling: phase > 0.74 && phase < 0.84 }
}
