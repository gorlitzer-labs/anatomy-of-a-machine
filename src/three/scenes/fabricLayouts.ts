import * as THREE from 'three'

/**
 * Layout, interconnect and dataflow definitions for the architectures chapter.
 *
 * Split out of the scene component because there are now three things that vary
 * per architecture — where the blocks sit, what wires them together, and how
 * data moves through them — and the third is the one that actually distinguishes
 * the machines. A GPU is not a CPU with smaller squares; it is a CPU that gave
 * up independent control flow so every lane could step at once. That is a
 * statement about motion, so it has to be animated, not tiled.
 */
export type FabricKind = 'fpga' | 'asic' | 'cpu' | 'gpu' | 'tensor' | 'npu' | 'unified'

/**
 * Ordered as the chapter walks them, which is the argument the chapter makes:
 * you wire the gates yourself (FPGA), the wiring is frozen at the factory
 * (ASIC), the frozen job is "obey a list of instructions" and universality
 * comes back (CPU), the same trick times a thousand lanes (GPU, then with a
 * matrix unit welded in), and finally back to fixed-function for one job
 * (NPU/TPU). One trade, made four times.
 *
 * `unified` is out of that sequence and out of this chapter — it belongs with
 * memory, in Lecture 2. The layout stays because that lecture will use it.
 */
export const KINDS: FabricKind[] = ['fpga', 'asic', 'cpu', 'gpu', 'tensor', 'npu', 'unified']

/** The five the closing beat cycles through. Tensor is a GPU variant, not a peer. */
export const SPECTRUM: FabricKind[] = ['fpga', 'asic', 'cpu', 'gpu', 'npu']

export const CELL_COUNT = 256
export const PACKET_COUNT = 120
export const LINK_COUNT = 96
export const DIE = 5.2

export const C = {
  core: new THREE.Color('#4fd8ff'),
  // Grey, matching the die scene in chapter 02 and the copy that calls cache
  // grey in both. `mem` stays violet — that is the ASIC's local memory, a
  // different block the course never describes by colour.
  cache: new THREE.Color('#9aa3b0'),
  io: new THREE.Color('#ffab40'),
  logic: new THREE.Color('#6ee7a8'),
  mac: new THREE.Color('#ff7ad9'),
  mem: new THREE.Color('#c08bff'),
  // Deliberately hot and distinct from every programmable role: a fixed-function
  // block is the one thing on this die that can never be told to do anything else.
  fixed: new THREE.Color('#ff8a5c'),
}

export type Role = 'core' | 'cache' | 'io' | 'logic' | 'mac' | 'mem' | 'fixed'

export type Cell = {
  x: number
  z: number
  sx: number
  sz: number
  sy: number
  color: THREE.Color
  role: Role
}

export function blankCells(): Cell[] {
  // Each cell owns its Color. Sharing one instance means the per-frame morph's
  // `lerp` mutates the palette itself, which turns every layout the same hue.
  return Array.from({ length: CELL_COUNT }, () => ({
    x: 0,
    z: 0,
    sx: 0,
    sz: 0,
    sy: 0,
    color: new THREE.Color(0x4fd8ff),
    role: 'core' as Role,
  }))
}

function put(
  cells: Cell[],
  i: number,
  x: number,
  z: number,
  sx: number,
  sz: number,
  sy: number,
  color: THREE.Color,
  role: Role,
) {
  if (i >= CELL_COUNT) return i
  cells[i] = { x, z, sx, sz, sy, color: color.clone(), role }
  return i + 1
}

/** A few big cores, a lot of cache, edges given to I/O. */
function cpuLayout(): Cell[] {
  const cells = blankCells()
  let i = 0
  for (const z of [-1.42, 1.42]) {
    for (const x of [-1.74, -0.58, 0.58, 1.74]) {
      i = put(cells, i, x, z, 1.02, 1.16, 0.22, C.core, 'core')
    }
  }
  for (let k = 0; k < 20; k++) {
    i = put(cells, i, (k / 19 - 0.5) * 4.3, 0, 0.17, 0.94, 0.1, C.cache, 'cache')
  }
  for (const z of [-2.34, 2.34]) {
    for (let k = 0; k < 12; k++) {
      i = put(cells, i, (k / 11 - 0.5) * 4.4, z, 0.28, 0.16, 0.08, C.io, 'io')
    }
  }
  return cells
}

/** Hundreds of identical lanes; nearly the whole die is arithmetic. */
function gpuLayout(): Cell[] {
  const cells = blankCells()
  let i = 0
  const n = 16
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      i = put(cells, i, (c / (n - 1) - 0.5) * 4.5, (r / (n - 1) - 0.5) * 4.5, 0.19, 0.19, 0.11, C.core, 'core')
    }
  }
  return cells
}

/** CPU cluster and GPU cluster over one shared bank of memory. */
function unifiedLayout(): Cell[] {
  const cells = blankCells()
  let i = 0
  for (const z of [-1.95, -0.8]) {
    for (const x of [-1.85, -0.72]) {
      i = put(cells, i, x, z, 0.98, 0.98, 0.22, C.core, 'core')
    }
  }
  const n = 8
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      i = put(cells, i, 0.6 + (c / (n - 1)) * 1.9, -2.25 + (r / (n - 1)) * 1.9, 0.2, 0.2, 0.12, C.core, 'core')
    }
  }
  // Taller than anything else on the die: this is the shared pool, and its
  // height is the point — both clusters sit on top of the same memory.
  for (let k = 0; k < 24; k++) {
    i = put(cells, i, (k / 23 - 0.5) * 4.6, 1.6, 0.16, 1.7, 0.34, C.mem, 'mem')
  }
  return cells
}

/** A grid of configurable blocks with routing channels between them. */
function fpgaLayout(): Cell[] {
  const cells = blankCells()
  let i = 0
  const n = 10
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      i = put(cells, i, (c / (n - 1) - 0.5) * 4.4, (r / (n - 1) - 0.5) * 4.4, 0.3, 0.3, 0.14, C.logic, 'logic')
    }
  }
  return cells
}

/**
 * Tensor cores: dense matrix units embedded *inside* an otherwise ordinary GPU.
 * The surrounding lanes stay, which is the honest picture — tensor cores are an
 * addition to a GPU, not a separate chip.
 */
function tensorLayout(): Cell[] {
  const cells = blankCells()
  let i = 0
  const n = 14
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = (c / (n - 1) - 0.5) * 4.5
      const z = (r / (n - 1) - 0.5) * 4.5
      // Four dense MAC tiles, larger and hotter than the lanes around them.
      const isMac = (r % 7 >= 2 && r % 7 <= 4) && (c % 7 >= 2 && c % 7 <= 4)
      if (isMac) i = put(cells, i, x, z, 0.26, 0.26, 0.2, C.mac, 'mac')
      else i = put(cells, i, x, z, 0.15, 0.15, 0.08, C.core, 'core')
    }
  }
  return cells
}

/**
 * An NPU / TPU: the whole die is one systolic array. No general-purpose lanes
 * left at all — every cell is a multiply-accumulate.
 */
function npuLayout(): Cell[] {
  const cells = blankCells()
  let i = 0
  const n = 14
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      i = put(cells, i, (c / (n - 1) - 0.5) * 4.4, (r / (n - 1) - 0.5) * 4.4, 0.24, 0.24, 0.16, C.mac, 'mac')
    }
  }
  return cells
}

/**
 * A generic fixed-function ASIC: a pipeline of dedicated blocks, each a
 * different size because each does a different job.
 *
 * Deliberately the only irregular floorplan in the chapter. Every other machine
 * here is a repeating tile — that repetition is what makes them programmable,
 * because identical units can be handed any work. An ASIC has no repetition to
 * offer: the shapes are the specification. Stage widths differ, the stages are
 * in a fixed order, and there is nowhere for data to go but forward.
 */
function asicLayout(): Cell[] {
  const cells = blankCells()
  let i = 0

  // Six stages across the die, sized by what each one notionally does.
  const stages: Array<{ x: number; sx: number; sz: number; sy: number }> = [
    { x: -1.95, sx: 0.5, sz: 1.5, sy: 0.18 },
    { x: -1.15, sx: 0.75, sz: 2.4, sy: 0.3 },
    { x: -0.2, sx: 0.6, sz: 1.1, sy: 0.22 },
    { x: 0.6, sx: 0.55, sz: 2.9, sy: 0.36 },
    { x: 1.45, sx: 0.5, sz: 1.8, sy: 0.24 },
    { x: 2.1, sx: 0.4, sz: 0.9, sy: 0.16 },
  ]
  for (const s of stages) {
    i = put(cells, i, s.x, -0.15, s.sx, s.sz, s.sy, C.fixed, 'fixed')
  }

  // Two small helper blocks hanging off the wide stage, so the pipeline reads
  // as a designed thing rather than as a row of boxes.
  // Sits between the wide stage (ends z = 1.3) and the memory strip (starts
  // z = 1.98). At z 1.85 and 0.5 deep it ran into three of the memory cells.
  i = put(cells, i, 0.6, 1.64, 0.55, 0.44, 0.14, C.fixed, 'fixed')
  i = put(cells, i, -1.15, -1.85, 0.75, 0.45, 0.14, C.fixed, 'fixed')

  // A strip of local memory. Fixed-function silicon still has to hold a line of
  // data between stages; it just does not get to choose how much.
  for (let k = 0; k < 14; k++) {
    i = put(cells, i, (k / 13 - 0.5) * 3.6, 2.15, 0.2, 0.34, 0.12, C.mem, 'mem')
  }

  // I/O along one edge only — data enters at one end and leaves at the other.
  for (let k = 0; k < 10; k++) {
    i = put(cells, i, (k / 9 - 0.5) * 3.4, -2.35, 0.26, 0.16, 0.08, C.io, 'io')
  }
  return cells
}

export const LAYOUTS: Record<FabricKind, Cell[]> = {
  fpga: fpgaLayout(),
  asic: asicLayout(),
  cpu: cpuLayout(),
  gpu: gpuLayout(),
  tensor: tensorLayout(),
  npu: npuLayout(),
  unified: unifiedLayout(),
}

/* ------------------------------------------------------------------ */
/* Interconnect                                                        */
/* ------------------------------------------------------------------ */

export type Link = [number, number, number, number] // x1, z1, x2, z2

/**
 * What wires the blocks together. Topology is as much a part of an
 * architecture's identity as the blocks: a ring bus, a row mesh and a
 * reconfigurable routing fabric are different machines even when the tiles look
 * alike.
 */
/** Seconds between FPGA reconfigurations. Shared, because the wires and the
    traffic must agree on when the chip becomes a different circuit. */
export const FPGA_REROUTE = 3.2

export function linksFor(kind: FabricKind, phase: number): Link[] {
  const out: Link[] = []

  if (kind === 'cpu') {
    // Ring bus: every core hangs off one loop through the cache.
    const stops: Array<[number, number]> = []
    for (const x of [-1.74, -0.58, 0.58, 1.74]) stops.push([x, -1.42])
    for (const x of [1.74, 0.58, -0.58, -1.74]) stops.push([x, 1.42])
    for (let k = 0; k < stops.length; k++) {
      const a = stops[k]
      const b = stops[(k + 1) % stops.length]
      out.push([a[0], a[1], b[0], b[1]])
      out.push([a[0], a[1], a[0], 0]) // drop into the shared cache
    }
    return out
  }

  if (kind === 'asic') {
    /* One chain, one direction, no loop back. The contrast with the CPU's ring
       is the point: a ring exists so any core can reach any cache, because
       nobody knows in advance what the software will ask for. Here the route is
       known at design time, so there is exactly one. */
    const xs = [-1.95, -1.15, -0.2, 0.6, 1.45, 2.1]
    for (let k = 0; k < xs.length - 1; k++) {
      out.push([xs[k], -0.15, xs[k + 1], -0.15])
    }
    // Taps up to the memory strip and down to the I/O edge.
    out.push([-1.15, -0.15, -1.15, 1.95])
    out.push([0.6, -0.15, 0.6, 1.95])
    out.push([-1.95, -0.15, -1.95, -2.25])
    out.push([2.1, -0.15, 2.1, -2.25])
    return out
  }

  if (kind === 'gpu') {
    // Row-wise: lanes in a row share an instruction, so the wiring is per row.
    for (let r = 0; r < 16; r += 2) {
      const z = (r / 15 - 0.5) * 4.5
      out.push([-2.3, z, 2.3, z])
    }
    return out
  }

  if (kind === 'unified') {
    // Fat, direct links from the pool to both clusters. Nothing in between —
    // that absence is the whole idea.
    for (let k = 0; k < 8; k++) {
      const x = -2.0 + (k / 7) * 1.6
      out.push([x, 1.2, x - 0.2, -1.4])
    }
    for (let k = 0; k < 8; k++) {
      const x = 0.7 + (k / 7) * 1.7
      out.push([x, 1.2, x, -1.3])
    }
    return out
  }

  if (kind === 'fpga') {
    // Routing that actually re-routes. `phase` steps every few seconds and each
    // step picks a different set of connections — the chip becoming a different
    // circuit, which is the one thing an FPGA does that nothing else here can.
    const n = 10
    let seed = 1013 + phase * 7919
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let k = 0; k < 40; k++) {
      const r = Math.floor(rand() * n)
      const c = Math.floor(rand() * (n - 1))
      const x1 = (c / (n - 1) - 0.5) * 4.4
      const x2 = ((c + 1) / (n - 1) - 0.5) * 4.4
      const z = (r / (n - 1) - 0.5) * 4.4
      if (rand() > 0.5) out.push([x1, z, x2, z])
      else out.push([z, x1, z, x2])
    }
    return out
  }

  // tensor / npu: a systolic mesh — each cell talks only to its neighbours,
  // which is why the array can be clocked so hard.
  const n = kind === 'npu' ? 14 : 8
  const span = kind === 'npu' ? 4.4 : 4.5
  for (let r = 0; r < n; r += 2) {
    const z = (r / (n - 1) - 0.5) * span
    out.push([-span / 2, z, span / 2, z])
  }
  for (let c = 0; c < n; c += 2) {
    const x = (c / (n - 1) - 0.5) * span
    out.push([x, -span / 2, x, span / 2])
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Dataflow                                                            */
/* ------------------------------------------------------------------ */

export type FabricPacket = { x: number; y: number; z: number; on: number; hue: number }

const OUT: FabricPacket = { x: 0, y: 0, z: 0, on: 0, hue: 0 }

/**
 * A GPU's lanes move in lockstep only within a group — a warp of 32 threads on
 * Nvidia, a 32- or 64-wide wavefront on AMD. Different groups run their own
 * instructions on their own schedule.
 *
 * This used to be one bar sweeping the whole die, under copy calling it "not a
 * stylisation", which drew a chip-wide lockstep that no GPU has. Four bands of
 * rows, each on its own phase, is the honest version: lockstep inside a band,
 * independent across them.
 */
const GROUP_PHASE = [0, 0.41, 0.17, 0.66]

function groupPhase(row: number, rows: number) {
  return GROUP_PHASE[Math.min(GROUP_PHASE.length - 1, Math.floor((row * GROUP_PHASE.length) / rows))]
}

/**
 * The systolic array's weights are loaded once and then held (weight-
 * stationary, as in the first TPU): they stream in from the top for a short
 * window, then stop, while activations keep marching in from the left.
 */
const WEIGHT_CYCLE = 9
const WEIGHT_LOAD = 2.2

/**
 * Where data packet `i` is at time `t`.
 *
 * This is the part that makes the architectures feel different rather than look
 * different. Each machine gets a motion signature that is true to how it works:
 * a CPU fetches erratically and stalls, a GPU steps each group of lanes at once, unified
 * memory moves work without a copy, an FPGA routes along whatever it currently
 * is, and a systolic array marches two streams through a fixed grid.
 */
export function packetAt(kind: FabricKind, i: number, t: number): FabricPacket {
  const p = OUT

  switch (kind) {
    case 'cpu': {
      // Eight streams only, each on its own irregular rhythm, pausing mid-trip:
      // a few threads doing awkward sequential work.
      if (i >= 8) return { ...p, on: 0 }
      const trip = cpuTrip(i, t)
      const coreX = [-1.74, -0.58, 0.58, 1.74][i % 4]
      const coreZ = i < 4 ? -1.42 : 1.42
      return { x: coreX, y: 0.44, z: coreZ * trip.atCore, on: 1, hue: 0 }
    }

    case 'asic': {
      /* A steady conveyor. Never stalls, never branches, never waits for a
         scheduler — because there is no scheduler. Contrast this deliberately
         with the CPU above, whose packets pause mid-trip: that pause is a stall,
         and the price of not having one is that this chip can do nothing else. */
      if (i >= 24) return { ...p, on: 0 }
      const xs = [-1.95, -1.15, -0.2, 0.6, 1.45, 2.1]
      const k = (t * 0.34 + i * 0.042) % 1
      // Walk the stage positions rather than a straight line, so the packet
      // visibly steps through the pipeline instead of gliding past it.
      const at = k * (xs.length - 1)
      const seg = Math.min(Math.floor(at), xs.length - 2)
      const f = at - seg
      const x = xs[seg] + (xs[seg + 1] - xs[seg]) * f
      return { x, y: 0.44, z: -0.15, on: 1, hue: 1 }
    }

    case 'gpu': {
      // Every lane in a group on the SAME phase — one instruction, the whole
      // group, together — and each group on its own phase.
      const lane = i % 16
      const z = (lane / 15 - 0.5) * 4.5
      const k = (t * 0.55 + groupPhase(lane, 16)) % 1
      const x = -2.35 + k * 4.7
      return { x, y: 0.44, z, on: i < 16 ? 1 : 0, hue: 0 }
    }

    case 'unified': {
      // Straight from the pool into whichever cluster wants it. No staging hop,
      // because there is no copy to make.
      if (i >= 26) return { ...p, on: 0 }
      const toCpu = i % 2 === 0
      const k = (t * 0.42 + i * 0.09) % 1
      const startX = toCpu ? -1.3 - (i % 5) * 0.28 : 0.9 + (i % 6) * 0.3
      const endX = toCpu ? -1.3 : 1.5
      const z = 1.55 - k * (toCpu ? 3.1 : 3.0)
      return { x: startX + (endX - startX) * k * 0.4, y: 0.5, z, on: 1, hue: toCpu ? 0 : 1 }
    }

    case 'fpga': {
      /* Signals running along whatever the fabric is wired as right now — and
         this time that is true.
         The comment said exactly this before, while the packets ran a fixed set
         of rows and columns computed from the index and never referred to
         `linksFor` at all. So the wiring rearranged itself every few seconds,
         the traffic carried on regardless, and the one claim that separates an
         FPGA from everything else in the chapter was animated as false. Reading
         the same route table the wires are drawn from is the whole fix. */
      const routes = linksFor('fpga', Math.floor(t / FPGA_REROUTE))
      if (i >= 30 || routes.length === 0) return { ...p, on: 0 }
      const [x1, z1, x2, z2] = routes[i % routes.length]
      const k = (t * 0.5 + (i % 7) * 0.14) % 1
      return {
        x: x1 + (x2 - x1) * k,
        y: 0.44,
        z: z1 + (z2 - z1) * k,
        on: 1,
        hue: 2,
      }
    }

    case 'tensor': {
      /* Two motions in one frame, because that is what the chip is.
         `tensor` used to fall through to `npu`, so the whole die ran as a
         systolic array — under copy reading "this is a hedge, and an honest
         one: the chip around them is still a programmable GPU, so you get the
         matrix unit without giving up the ability to run anything else". The
         animation said the opposite: the ordinary lanes had stopped being a
         GPU.

         Now the GPU wavefront still sweeps the lanes, and the systolic crossing
         happens only inside the four MAC tiles. */
      const SPAN = 4.5
      if (i < 16) {
        // The GPU it still is: lanes in lockstep within each group.
        const lane = i % 16
        const z = (lane / 15 - 0.5) * SPAN
        const k = (t * 0.55 + groupPhase(lane, 16)) % 1
        return { x: -2.35 + k * 4.7, y: 0.44, z, on: 1, hue: 0 }
      }
      // The matrix units it also has: a crossing, confined to each tile.
      const j = i - 16
      if (j >= 48) return { ...p, on: 0 }
      const tile = j % 4
      const tx = (tile % 2 === 0 ? -1 : 1) * 1.125
      const tz = (tile < 2 ? -1 : 1) * 1.125
      const m = Math.floor(j / 4)
      const along = ((t * 0.7 + m * 0.16) % 1 - 0.5) * 0.62
      const across = ((m % 6) / 5 - 0.5) * 0.62
      const down = m % 2 === 0
      return {
        x: tx + (down ? across : along),
        y: 0.46,
        z: tz + (down ? along : across),
        on: 1,
        hue: 1,
      }
    }

    case 'npu': {
      /* Two orthogonal streams, which is what a systolic array actually is:
         weights are loaded down from the top and then held in the cells,
         activations march in from the left, and every cell multiplies what
         arrives by the weight it holds and passes it on. The weight stream
         runs only during a short load window and then stops, because in a
         weight-stationary array like the first TPU the weights stay put. */
      const span = kind === 'npu' ? 4.4 : 4.5
      const lanes = kind === 'npu' ? 14 : 10
      const half = 60
      if (i < half) {
        const cycleT = t % WEIGHT_CYCLE
        if (cycleT > WEIGHT_LOAD) return { ...p, on: 0 }
        const lane = i % lanes
        const x = (lane / (lanes - 1) - 0.5) * span
        const k = (cycleT / WEIGHT_LOAD + Math.floor(i / lanes) * 0.24) % 1
        return { x, y: 0.44, z: -span / 2 + k * span, on: 1, hue: 1 }
      }
      const j = i - half
      const lane = j % lanes
      const z = (lane / (lanes - 1) - 0.5) * span
      const k = (t * 0.5 + Math.floor(j / lanes) * 0.24) % 1
      return { x: -span / 2 + k * span, y: 0.44, z, on: 1, hue: 0 }
    }
  }
}

/**
 * One core's request, out to memory and back.
 *
 * Shared by the packet and by the core's own brightness, because "the core is
 * doing nothing while it waits" is the claim and two independent timers cannot
 * make it.
 *
 * The hold sits at the *memory* end. It used to sit at the far end of the
 * journey where the packet reverses anyway, which made a 0.5 s pause almost
 * invisible and put the waiting in the wrong place: the copy says the core
 * waits for memory, so the request is what waits, at memory.
 */
export function cpuTrip(i: number, t: number) {
  const period = 2.2 + (i % 3) * 0.6
  const k = (t / period + i * 0.37) % 1
  // 1 = at the core, 0 = at memory. Out, wait, back.
  const atCore = k < 0.32 ? 1 - k / 0.32 : k < 0.66 ? 0 : (k - 0.66) / 0.34
  return { k, atCore, waiting: k >= 0.32 && k < 0.66 }
}

/** Per-architecture block brightness, 0..1. */
export function activity(role: Role, i: number, t: number, kind: FabricKind) {
  switch (kind) {
    case 'cpu':
      /* A core is lit when it has its answer and dark while it is waiting for
         one — derived from that core's own packet, so the block and the traffic
         cannot disagree.
         It used to be a free-running 2.6 s sine, uncorrelated with anything, so
         a core read "busy" precisely while its own request was stalled at
         memory — on the beat whose aside is "watch the motion, the packets
         pause mid-trip, that pause is a stall, the core waiting on memory". */
      return role === 'core' ? (cpuTrip(i, t).atCore > 0.9 ? 1 : 0.16) : 0.28
    case 'asic': {
      // Each stage lights as the work reaches it, in strict order. The pipeline
      // is always busy and always busy in the same sequence.
      if (role !== 'fixed') return role === 'mem' ? 0.34 : 0.24
      if (i > 5) return 0.4 // the two helper blocks, always warm
      const front = ((t * 0.34) % 1) * 5
      const d = Math.abs(front - i)
      return THREE.MathUtils.clamp(1 - d * 0.5, 0.25, 1)
    }
    case 'gpu': {
      // Lit by the passing wavefront rather than by a free-running sine, so the
      // blocks and the packets tell the same story.
      const col = i % 16
      const k = (t * 0.55 + groupPhase(Math.floor(i / 16), 16)) % 1
      const front = k * 16
      const d = Math.abs(front - col)
      return THREE.MathUtils.clamp(1 - d * 0.55, 0.18, 1)
    }
    case 'unified':
      return role === 'mem' ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 4 - i * 0.5)) : 0.45
    case 'fpga':
      return 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 1.2 - (i % 10) * 0.55 - Math.floor(i / 10) * 0.2))
    case 'tensor': {
      /* The lanes follow the same wavefront the GPU's do, because they are the
         same lanes. The MAC tiles sit steadily brighter rather than pulsing on
         a 1.26 s sine that argued nothing — they are denser and busier, and
         that is a property, not an event. */
      if (role === 'mac') return 0.85
      const col = i % 14
      const k = (t * 0.55 + groupPhase(Math.floor(i / 14), 14)) % 1
      const d = Math.abs(k * 14 - col)
      return THREE.MathUtils.clamp(1 - d * 0.55, 0.18, 1)
    }
    case 'npu': {
      // Diagonal accumulation wave: the partial sums sweeping through.
      const r = Math.floor(i / 14)
      const c = i % 14
      const wave = ((t * 4) % 28) - (r + c)
      return THREE.MathUtils.clamp(1 - Math.abs(wave) * 0.42, 0.16, 1)
    }
  }
}
