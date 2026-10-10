import type { Lane } from '../motion/lanes'
/**
 * Where everything sits on the laptop mainboard, and what runs between them.
 *
 * Split out of the scene for the same reason the architectures chapter was: the
 * interesting content is not the boxes, it is the routes. A board is mostly an
 * argument about distance — DDR is short and wide because it has to be, PCIe is
 * long and narrow because it can be, and power takes the fattest, shortest path
 * available. Those routes are data, so they live here.
 *
 * Coordinates are board-space: +x runs left to right along the board, +z runs
 * from the hinge edge toward the palm rest, y = 0 is the top copper.
 */

export const BOARD = { w: 8.2, d: 4.8, t: 0.16 }

/** Footprint of every component, in board space. */
export const PARTS = {
  soc: { x: -0.9, z: 0, w: 1.7, d: 1.7, h: 0.2 },
  ram: [
    { x: 1.15, z: -1.15, w: 1.35, d: 0.72, h: 0.13 },
    { x: 1.15, z: 1.15, w: 1.35, d: 0.72, h: 0.13 },
  ],
  vrm: { x: -3.0, z: 0, w: 0.9, d: 2.9 },
  ssd: { x: 2.9, z: -1.5, w: 2.1, d: 0.58, h: 0.11 },
  wifi: { x: 3.0, z: 1.45, w: 0.95, d: 0.62, h: 0.1 },
  battery: { x: -0.4, y: -1.15, z: 0.1, w: 6.2, d: 3.5, h: 0.5 },
  /** Cooling rides above the board and lifts off as one assembly. */
  /* The pipe ends inside the fin stack and the stack ends short of the fan.
     The pipe used to run on to 2.9, into the fan, where the blades swept
     through it, and the last fins stood inside the fan's housing. */
  pipe: { from: -0.9, to: 2.5, y: 0.52, r: 0.13 },
  fins: { x: 2.05, z: 0, w: 1.0, d: 1.7, h: 0.62 },
  fan: { x: 3.4, z: 0, r: 0.8 },
  ports: [
    { x: -3.5, z: 2.15, w: 0.62, d: 0.34, kind: 'usb' },
    { x: -2.7, z: 2.15, w: 0.62, d: 0.34, kind: 'usb' },
    { x: 3.45, z: 2.15, w: 0.5, d: 0.34, kind: 'jack' },
  ],
  displayConnector: { x: -0.9, z: -2.15, w: 1.5, d: 0.28 },
  batteryConnector: { x: -3.7, z: -0.6, w: 0.42, d: 0.8 },
}

/** Height of the routing layer, just clear of the copper. */
export const TRACE_Y = 0.1

/**
 * The buses, as polylines on the board surface.
 *
 * Lane *counts* carry the lesson and are not decorative: DDR is drawn wide and
 * short because a memory bus really is a hundred-odd parallel wires, matched in
 * groups of eight that must each arrive together, and PCIe is drawn as a
 * handful of long pairs because it really did trade width for length. Drawing
 * them the same would teach the opposite of the chapter.
 */
export const BUSES: Record<string, Lane[]> = {
  /* Power: battery connector to the regulators, then the fattest, shortest run
     on the whole board into the socket. Everything else is signalling. */
  power: [
    [
      [-3.7, -0.6],
      [-3.35, -0.6],
      [-3.0, -0.6],
    ],
    [
      [-3.7, -0.6],
      [-3.35, 0.4],
      [-3.0, 0.4],
    ],
    [
      [-3.0, -0.75],
      [-1.9, -0.55],
      [-1.55, -0.4],
    ],
    [
      [-3.0, 0],
      [-1.9, 0],
      [-1.55, 0],
    ],
    [
      [-3.0, 0.75],
      [-1.9, 0.55],
      [-1.55, 0.4],
    ],
  ],

  /* DDR: many wires, all short, all the same length. Nine is one byte group:
     eight data wires and the timing strobe they are captured against. Real
     boards serpentine the short ones so every bit in the group arrives with its
     strobe — the little detours here are that, not decoration. (Each group is
     matched and trained on its own, not the whole bus as one block.) */
  ddr: Array.from({ length: 9 }, (_, i) => {
    const z = -0.62 + (i / 8) * 1.24
    const sign = z < 0 ? -1 : 1
    const target = sign < 0 ? -1.15 : 1.15
    return [
      [-0.1, z],
      [0.28, z],
      [0.42, z + sign * 0.16],
      [0.56, z],
      [0.78, z * 0.5 + target * 0.5],
      [1.15, target],
    ] as Lane
  }),

  /* PCIe: four lanes, long, and it does not care. Serial links clock the data
     out of one end and recover the timing at the other, which is what buys the
     length that DDR cannot have.

     Eight lines, not four: a lane is two differential pairs, one each way, so
     an x4 link is eight pairs — sixteen wires. Each line here is one pair, drawn
     in lanes of two, and `full` duplex sends alternate lines opposite ways, so
     every lane carries traffic out and back at once. Drawing a lane as a single
     line made "four lanes" read as "four wires". */
  pcie: Array.from({ length: 8 }, (_, k) => {
    const lane = Math.floor(k / 2)
    const pair = k % 2
    const z = -0.24 + lane * 0.16 + (pair - 0.5) * 0.05
    return [
      [-0.1, z],
      [1.0, z - 0.35],
      [2.1, z - 0.9],
      [2.6, -1.35],
      [2.9, -1.5],
    ] as Lane
  }),

  /* USB and the outside world: out to the edge of the board, where a human
     can reach it. */
  usb: [
    [
      [-0.9, 0.9],
      [-1.6, 1.4],
      [-2.3, 1.9],
      [-2.7, 2.15],
    ],
    [
      [-0.9, 0.9],
      [-2.0, 1.5],
      [-3.0, 2.0],
      [-3.5, 2.15],
    ],
    [
      [-0.9, 0.9],
      [0.6, 1.7],
      [2.2, 2.0],
      [3.0, 1.45],
    ],
  ],

  /* DMA: storage straight into memory, not passing through the processor.
     Drawn as its own route rather than as traffic on the PCIe lane, because the
     whole point of the beat is that the processor is not on this path. */
  dma: Array.from({ length: 3 }, (_, i) => {
    const z = -1.35 + i * 0.14
    return [
      [2.9, z],
      [2.0, z + 0.5],
      [1.15, -1.15],
    ] as Lane
  }),

  /* An interrupt: one wire from a port to the processor whose only job is to
     say "stop what you are doing". */
  irq: [
    [
      [-2.7, 2.15],
      [-1.9, 1.5],
      [-0.9, 0.9],
    ],
  ],

  /* Display: back edge, toward the hinge. */
  display: Array.from({ length: 3 }, (_, i) => {
    const x = -1.35 + i * 0.45
    return [
      [x, -0.9],
      [x, -1.5],
      [x, -2.15],
    ] as Lane
  }),
}

/** Every lane on the board, for the beats that show the whole routing layer. */
export const ALL_LANES: Lane[] = Object.values(BUSES).flat()

export const FLOW_COUNT = 90

export type BusId = keyof typeof BUSES

/**
 * How each bus carries traffic. The direction discipline is the whole point.
 *
 *  - `half`  one direction at a time, every lane together, with a dead gap
 *            while the bus turns around. This is DDR: the data lines are
 *            shared between reads and writes, so the bus cannot do both at
 *            once and pays real time to change its mind.
 *  - `full`  both directions at the same time, on separate pairs. This is
 *            PCIe, and it is why a link is quoted as "x4" rather than as a
 *            single number.
 *  - `one`   power in, pixels out. Never anything else.
 *
 * An earlier version had DDR and PCIe both as `bidirectional: true`, which
 * erased the contrast entirely, and a doc that said the fix was to make PCIe
 * one-way. That would have been worse than the bug: PCIe really is full-duplex,
 * so the doc was wrong rather than the data. Half against full is the true
 * distinction *and* the visible one.
 */
export type Duplex = 'one' | 'half' | 'full'

export const BUS_MOTION: Record<string, { speed: number; hue: number; duplex: Duplex }> = {
  power: { speed: 0.22, hue: 1, duplex: 'one' },
  ddr: { speed: 0.85, hue: 0, duplex: 'half' },
  pcie: { speed: 0.5, hue: 0, duplex: 'full' },
  usb: { speed: 0.3, hue: 2, duplex: 'full' },
  display: { speed: 0.45, hue: 2, duplex: 'one' },
  dma: { speed: 0.6, hue: 1, duplex: 'one' },
  irq: { speed: 1.4, hue: 2, duplex: 'one' },
}

/** Seconds a half-duplex bus runs one way before it must turn around. */
export const TURNAROUND = 3.2
/** Seconds the bus is idle while it changes direction. Real, and not free. */
export const TURN_GAP = 0.45

/**
 * Direction of a half-duplex bus, and whether it is mid-turnaround.
 *
 * The gap is the part worth seeing: a memory controller that has just finished
 * reading cannot start writing on the next cycle, and that dead time is why
 * mixed read/write workloads get less out of a bus than either alone.
 */
export function busTurn(t: number) {
  const period = TURNAROUND + TURN_GAP
  const phase = t % (period * 2)
  const turning = phase % period > TURNAROUND
  return { back: phase >= period, turning }
}
