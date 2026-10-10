import type { GateKind } from '../signal'
import type { Lane as Wire } from '../motion/lanes'

/**
 * Four ways to hold one bit, as schematics.
 *
 * The chapter's argument is a cost curve, and the thing that carries it is
 * *how many parts you can count*. A latch is gates you already recognise; an
 * SRAM cell is six transistors; a DRAM cell is one transistor and a capacitor.
 * Nothing here is stylised into abstraction, because the countability is the
 * lesson — six versus two is why one is fast and expensive and the other is
 * cheap and forgetful.
 *
 * Coordinates are tile-space, roughly ±2.6 in x and ±2.0 in z, drawn flat like
 * the logic-gate bench so the notation carries over.
 */

export type CellKind = 'latch' | 'flipflop' | 'sram' | 'dram' | 'array'

export const CELL_KINDS: CellKind[] = ['latch', 'flipflop', 'sram', 'dram', 'array']

export type CellRole = 'transistor' | 'capacitor' | 'access' | 'bitline' | 'store'

export type Box = {
  x: number
  z: number
  sx: number
  sz: number
  sy: number
  role: CellRole
}

/**
 * `inverted` draws the little circle on the nose.
 *
 * It used to be drawn on *every* gate unconditionally, so the flip-flop's `and`
 * and `or` gates rendered as NAND and NOR — and Lecture 1 teaches that notation
 * explicitly ("the little circle on the nose is the notation for 'and then flip
 * it'"), so the course was contradicting the symbol it had just taught.
 */
export type Gate = { kind: GateKind; x: number; z: number; flip?: boolean; inverted?: boolean; scale?: number }

export type CellLayout = {
  gates: Gate[]
  boxes: Box[]
  wires: Wire[]
  /** Wires that carry a moving signal, as indices into `wires`. */
  live: number[]
}

/**
 * SR latch: two NOR gates, each feeding the other's input.
 *
 * The loop is the whole idea. Nothing in the previous chapters could remember
 * anything, because signals only ever flowed forward. Bend the output back into
 * the input and the circuit has a past.
 */
const latch: CellLayout = {
  gates: [
    // NOR, and the bubble is what makes the cross-coupled pair hold.
    { kind: 'or', x: -0.2, z: -0.95, inverted: true },
    { kind: 'or', x: -0.2, z: 0.95, inverted: true },
  ],
  boxes: [],
  wires: [
    // Inputs.
    [
      [-2.4, -1.25],
      [-1.1, -1.25],
    ],
    [
      [-2.4, 1.25],
      [-1.1, 1.25],
    ],
    // Outputs, running out to the right.
    [
      [0.95, -0.95],
      [2.4, -0.95],
    ],
    [
      [0.95, 0.95],
      [2.4, 0.95],
    ],
    // The cross-coupling. These two are the memory.
    [
      [1.5, -0.95],
      [1.5, -0.35],
      [-1.5, -0.35],
      [-1.5, 0.65],
      [-1.1, 0.65],
    ],
    [
      [1.5, 0.95],
      [1.5, 0.35],
      [-1.5, 0.35],
      [-1.5, -0.65],
      [-1.1, -0.65],
    ],
  ],
  live: [4, 5],
}

/**
 * Flip-flop: two latches in series, gated by opposite halves of a clock.
 *
 * Drawn as a pair because that is why it works — the first stage listens while
 * the second holds, then they swap, so a value can never race through both in
 * one tick. This is the part that makes a clocked machine possible.
 */
/* Four full-size gates do not fit in a row on this board: at scale 1 each AND
   nose ran into the OR behind it and the first OR's point went 0.4 into the
   second AND. At 0.85 each AND nose meets its OR's hollow back, and the two
   stages sit apart with the wire between them in the gap. */
const FF = 0.85
const flipflop: CellLayout = {
  gates: [
    { kind: 'and', x: -1.887, z: -0.7, scale: FF },
    { kind: 'or', x: -0.773, z: -0.7, scale: FF },
    { kind: 'and', x: 0.998, z: -0.7, scale: FF },
    { kind: 'or', x: 2.112, z: -0.7, scale: FF },
  ],
  boxes: [],
  wires: [
    // Data in.
    [
      [-2.9, -0.95],
      [-2.55, -0.95],
    ],
    // Between the two stages.
    [
      [0.035, -0.7],
      [0.335, -0.7],
    ],
    // Out.
    [
      [2.92, -0.7],
      [3.1, -0.7],
    ],
    // The clock spine, and its two taps — one inverted, which is the trick.
    [
      [-2.9, 1.35],
      [3.0, 1.35],
    ],
    [
      [-1.887, 1.35],
      [-1.887, -0.1],
    ],
    [
      [0.998, 1.35],
      [0.998, -0.1],
    ],
  ],
  live: [3],
}

/**
 * A 6T SRAM cell.
 *
 * Two inverters facing each other — the same loop as the latch, built from
 * transistors instead of drawn gates — plus two access transistors that let the
 * bit lines in when the word line says so. Six parts to hold one bit, and every
 * one of them costs area.
 */
const sram: CellLayout = {
  gates: [],
  boxes: [
    // Left inverter: pull-up and pull-down.
    { x: -0.85, z: -0.75, sx: 0.5, sz: 0.5, sy: 0.3, role: 'transistor' },
    { x: -0.85, z: 0.75, sx: 0.5, sz: 0.5, sy: 0.3, role: 'transistor' },
    // Right inverter.
    { x: 0.85, z: -0.75, sx: 0.5, sz: 0.5, sy: 0.3, role: 'transistor' },
    { x: 0.85, z: 0.75, sx: 0.5, sz: 0.5, sy: 0.3, role: 'transistor' },
    // Access transistors, one per bit line.
    { x: -1.85, z: 0, sx: 0.44, sz: 0.44, sy: 0.26, role: 'access' },
    { x: 1.85, z: 0, sx: 0.44, sz: 0.44, sy: 0.26, role: 'access' },
  ],
  wires: [
    // The cross-coupled pair — the same loop as the latch, one level down.
    // Each end lands on a transistor's edge (z ±0.5). Ending at 0.28 and -0.4
    // the loop hung in the gap between the four, touching none of them.
    [
      [-0.85, 0.5],
      [-0.85, 0],
      [0.4, 0],
      [0.4, -0.5],
      [0.85, -0.5],
    ],
    [
      [0.85, 0.5],
      [0.85, 0.12],
      [-0.4, 0.12],
      [-0.4, -0.5],
      [-0.85, -0.5],
    ],
    // Access paths out to the bit lines.
    [
      [-1.62, 0],
      [-0.85, 0],
    ],
    [
      [1.62, 0],
      [0.85, 0],
    ],
    // Bit lines, running vertically past the cell.
    [
      [-2.5, -1.7],
      [-2.5, 1.7],
    ],
    [
      [2.5, -1.7],
      [2.5, 1.7],
    ],
    // Word line: says "this row, now".
    [
      [-2.5, -1.35],
      [2.5, -1.35],
    ],
  ],
  live: [0, 1],
}

/**
 * A 1T1C DRAM cell.
 *
 * One transistor and one capacitor. That is the entire cell, and it is why
 * memory is cheap — but a capacitor is a bucket with a slow leak, so the value
 * has to be read and rewritten thousands of times a second just to survive.
 */
const dram: CellLayout = {
  gates: [],
  boxes: [
    { x: -0.3, z: 0, sx: 0.55, sz: 0.55, sy: 0.32, role: 'transistor' },
    // The capacitor, drawn as a pair of plates.
    { x: 1.15, z: -0.16, sx: 1.0, sz: 0.12, sy: 0.5, role: 'capacitor' },
    { x: 1.15, z: 0.34, sx: 1.0, sz: 0.12, sy: 0.5, role: 'capacitor' },
  ],
  wires: [
    // Bit line in.
    [
      [-2.5, -1.5],
      [-2.5, 1.5],
    ],
    [
      [-2.5, 0],
      [-0.6, 0],
    ],
    // Transistor out to the capacitor's top plate.
    [
      [0, 0],
      [1.15, 0],
      [1.15, -0.16],
    ],
    // Word line.
    [
      [-0.3, -1.6],
      [-0.3, -0.3],
    ],
    [
      [-2.5, -1.6],
      [2.4, -1.6],
    ],
  ],
  live: [1, 2],
}

/**
 * Density, side by side.
 *
 * Left block is SRAM at its real relative pitch, right block is DRAM. Nothing
 * else in the chapter makes the cost argument as immediately as the two grids
 * next to each other: same area, wildly different number of bits.
 */
function array(): CellLayout {
  const boxes: Box[] = []
  // SRAM: big cells, few of them.
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      boxes.push({
        x: -2.35 + c * 0.52,
        z: -0.78 + r * 0.52,
        sx: 0.36,
        sz: 0.36,
        sy: 0.2,
        role: 'store',
      })
    }
  }
  // DRAM: small cells, a lot of them, in the same footprint.
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 12; c++) {
      boxes.push({
        x: 0.55 + c * 0.175,
        z: -0.96 + r * 0.175,
        sx: 0.11,
        sz: 0.11,
        sy: 0.12,
        role: 'capacitor',
      })
    }
  }
  return { gates: [], boxes, wires: [], live: [] }
}

export const CELL_LAYOUTS: Record<CellKind, CellLayout> = {
  latch,
  flipflop,
  sram,
  dram,
  array: array(),
}

/** Longest wire-segment count across every layout, so buffers allocate once. */
export const CELL_SEGMENTS = Math.max(
  ...Object.values(CELL_LAYOUTS).map((l) =>
    l.wires.reduce((n, w) => n + w.length - 1, 0),
  ),
)

export const CELL_PACKETS = 24

/* ---------------- DRAM refresh ---------------- */

/**
 * The real refresh rate, and the one the scene runs at by default.
 *
 * In DDR5 every cell is read and rewritten every 32 ms (16 ms above 85 °C) —
 * about thirty times a second. It was 64 ms in DDR4, and this constant said so
 * long after the copy had moved on to DDR5. At that speed the sawtooth reads as
 * a shimmer and a reader learns nothing from watching it, so the default is
 * sixty times slower.
 *
 * That compression used to be undisclosed, and it sat directly beneath an aside
 * printing the real figure — the one place in the course where the picture
 * contradicted a number on the same screen. It is now both stated *and*
 * offered: the beat carries a toggle, and at real speed the shimmer is itself
 * the lesson about why refresh is invisible and why it still costs.
 */
export const REFRESH_REAL_HZ = 31.25
export const REFRESH_SHOWN_HZ = REFRESH_REAL_HZ / 60

/**
 * One phase for the whole cell.
 *
 * The capacitor and the access transistor are not two animations that happen to
 * co-occur — refresh *is* "open the access transistor, read, write back", so
 * they are one event. They used to run at 0.5 and 0.55 Hz respectively, drifting
 * against each other, which meant a reader watching for a full cycle repeatedly
 * saw the capacitor snap back to full while the access transistor was dark: a
 * physically impossible picture, on the beat whose entire mechanism is that
 * pairing.
 */
export const ACCESS_WINDOW = 0.08

export function dramCell(t: number, realTime: boolean, stagger = 0) {
  const hz = realTime ? REFRESH_REAL_HZ : REFRESH_SHOWN_HZ
  const phase = (t * hz + stagger) % 1
  const accessing = phase > 1 - ACCESS_WINDOW
  // Drains steadily, and is topped back up only while the word line is open.
  const charge = accessing ? 1 : 1 - phase
  return { phase, accessing, charge }
}
