import * as THREE from 'three'

/**
 * A computer inside a skull.
 *
 * The capstone, and it is a capstone because every constraint the course has
 * introduced applies to this one object at the same time. The phone's sealed
 * thermal budget, the microcontroller's energy budget, the rover's you-cannot-
 * repair-it, the car's it-must-not-fail, the datacenter's move-the-computation-
 * to-the-data. What is new is only that the heat sink is a person.
 *
 * MOTION SIGNATURE: two ceilings.
 *  - A thermal bar that activity pushes up and that must not cross a line.
 *  - A funnel: far more signal arriving than can ever leave, so the narrowing
 *    is where the lesson is.
 *
 * Checked figures, all from the published N1 work and the implant-safety
 * literature:
 *  - 1024 electrodes distributed across 64 threads.
 *  - Roughly 200 kbit/s per channel raw, so of order 200 Mbit/s off the whole
 *    array.
 *  - The radio carries about 1 Mbit/s, so a reduction of more than 200x is
 *    needed (Neuralink compression brief). On-chip spike detection can cut the
 *    chip's output by up to 1250x (Yoon et al., VLSI 2021), which more than
 *    closes that gap.
 *  - The SoC draws about 24.7 mW (Yoon et al., VLSI 2021).
 *  - The limit is written in temperature, not power: ISO 14708-1 cl. 17 allows
 *    no implant surface more than 2 C above 37 C, and brain work designs to
 *    about 1 C. The milliwatts that allows are device- and site-specific:
 *    15 mW is SCALO's conservative cap for a small cortical implant, about
 *    70 mW (47-81) Serrano-Amenos et al. 2023 for a skull unit.
 *
 * No rule states a milliwatt cap, so the bar's line at 40 mW is a drawn
 * ceiling inside that published range, not a regulatory number. What is true
 * whichever estimate applies is the lecture's point: 24.7 mW is a large share
 * of the whole allowance, not a small slice of it, and every feature anyone
 * wants to add has to be paid for out of the same budget.
 */

export const C = {
  tissue: new THREE.Color('#2b1a24'),
  thread: new THREE.Color('#4fd8ff'),
  soc: new THREE.Color('#a06bff'),
  raw: new THREE.Color('#4fd8ff'),
  spike: new THREE.Color('#ffab40'),
  dropped: new THREE.Color('#ff7a92'),
  safe: new THREE.Color('#6ee7a8'),
  over: new THREE.Color('#ff7a92'),
}

/* ---------------- the numbers ---------------- */

export const CHANNELS = 1024
export const THREADS = 64
/** Raw bits per second off the whole array, in megabits. */
export const RAW_MBPS = 200
/** What a low-energy radio actually sustains, in megabits. */
export const RADIO_MBPS = 1
export const REDUCTION = RAW_MBPS / RADIO_MBPS

/** Milliwatts. A drawn ceiling inside the published 15-70 mW range (there is
    no regulatory milliwatt cap), and the real chip's measured draw. */
export const CAP_MW = 40
export const MEASURED_MW = 24.7

/* ---------------- geometry ---------------- */

/* Vertical extents, kept deliberately tight. Measured at the first draft's
   scale the scene ran to NDC -1.87, i.e. a third of the array hanging below
   the viewport, because this is the only scene in the course that is mostly
   tall rather than mostly wide. */
export const SOC_Y = 0.45
export const SKULL_Y = 1.2
export const OUT_Y = 2.15
/** Where the array ends, below the surface. */
export const TIP_Y = -1.15

/** The block of tissue: its width and depth, and the height of its centre. */
export const TISSUE = { w: 3.6, y: (TIP_Y + SKULL_Y) / 2 - 0.1 }

/** The sealed can: the lid's radius, its thickness, and the titanium wall round it. */
export const SOC = { r: 1.05, h: 0.16, wall: 1.1 }

/**
 * The section of skull. Two tables of compact bone either side of a spongy
 * layer — the proportions of a real calvarium, roughly a quarter, a half and a
 * quarter — and the hole the one route out passes through. The outer radius
 * and the hole are the ones the plain ring had.
 */
export const SKULL = { r: 1.5, hole: 0.16, table: 0.04, spongy: 0.07 }

/**
 * Recording sites. 1,024 of them on sixty-four threads is sixteen each, and
 * they sit along the deep end of the thread, the part that is in cortex — the
 * first `SITE_REACH` of its length from the tip.
 */
export const SITES_PER_THREAD = 16
export const SITE_REACH = 0.36

/**
 * Where each thread enters the tissue.
 *
 * Sixty-four is the real number and all sixty-four are drawn, because the
 * count is one of the few things about this device that can be shown honestly
 * at full scale — unlike the bandwidth, which is compressed by a factor stated
 * in the copy.
 */
export function threadAt(i: number): [number, number] {
  // A phyllotactic spiral, which is simply the arrangement that packs a disc
  // evenly without any of the rings or seams a polar grid would show.
  const golden = Math.PI * (3 - Math.sqrt(5))
  const r = 0.95 * Math.sqrt((i + 0.5) / THREADS)
  const a = i * golden
  return [Math.cos(a) * r, Math.sin(a) * r]
}

/**
 * Splayed where they end in tissue, gathered where they meet the silicon.
 *
 * The array fans out to sample a volume and converges on one small piece of
 * chip, which is the shape of the whole lecture in miniature.
 */
export const TIP_SPREAD = 1.45
export const TOP_SPREAD = 0.86

/** A thread's two ends: deep in tissue, and at the underside of the processor. */
export function threadEnds(i: number) {
  const [x, z] = threadAt(i)
  return {
    from: [x * TIP_SPREAD, TIP_Y, z * TIP_SPREAD] as [number, number, number],
    to: [x * TOP_SPREAD, SOC_Y - 0.1, z * TOP_SPREAD] as [number, number, number],
  }
}

/**
 * Where a thread's signal is on its climb to the processor, at `u` in 0..1.
 *
 * Deliberately not routed through `motion/lanes`. That primitive samples a
 * polyline in the xz plane laid flat at a fixed height, and every route here is
 * vertical — bending it to carry a y would distort a shared thing to suit one
 * caller, which is the opposite of the reason it was extracted. Both routes in
 * this scene are straight lines, so a lerp is the whole of it.
 *
 * Shares `threadEnds` with the geometry rather than computing its own path.
 * They had drifted apart in the first draft — the meshes were drawn straight up
 * while the packets converged — so the signals visibly travelled beside their
 * own wires instead of along them.
 */
export function threadPoint(i: number, u: number): [number, number, number] {
  const { from, to } = threadEnds(i)
  return [
    from[0] + (to[0] - from[0]) * u,
    from[1] + (to[1] - from[1]) * u,
    from[2] + (to[2] - from[2]) * u,
  ]
}

/** The one route out: straight up through the skull to whatever is listening. */
export function outPoint(u: number): [number, number, number] {
  return [0, SOC_Y + 0.1 + (OUT_Y - SOC_Y - 0.1) * u, 0]
}

/** Where along the outbound route the skull boundary sits, 0..1. */
export const SKULL_U = (SKULL_Y - SOC_Y - 0.1) / (OUT_Y - SOC_Y - 0.1)

/* ---------------- the two ceilings ---------------- */

export type Mode = {
  /** Traffic climbing the threads, 0..1 of the drawn maximum. */
  inbound: number
  /** Share of what reaches the processor that gets out, 0..1. */
  admitted: number
  /** Inbound is already reduced to spikes rather than raw signal. */
  detected: boolean
  /** Packets visibly stopping at the boundary rather than passing it. */
  showDrops: boolean
  /** Power draw as a share of the cap, or -1 for no bar. */
  power: number
  /** The bar is being held down by a limit rather than sitting where it likes. */
  clamped: boolean
}

const BASE: Mode = {
  inbound: 0,
  admitted: 0,
  detected: false,
  showDrops: false,
  power: -1,
  clamped: false,
}

/**
 * What each beat shows.
 *
 * The three funnel beats are the argument and they differ only in these
 * numbers, which is the point: same array, same radio, and the only thing that
 * changes is where the reduction happens.
 */
export function modeFor(motion: string | null, beatTime: number): Mode {
  switch (motion) {
    case 'sealed':
      return { ...BASE, inbound: 0.35, admitted: 0.35 }
    case 'array':
      return { ...BASE, inbound: 1, admitted: 0.12 }

    case 'warm':
      return { ...BASE, inbound: 0.6, admitted: 0.12, power: MEASURED_MW / CAP_MW }
    case 'budget': {
      /* Demand climbs as the reader watches and is refused at the line. The
         refusal is the beat: this is Lecture 5's power budget with a limit that
         cannot be renegotiated by fitting a better cooler. */
      const want = Math.min(1.45, 0.25 + beatTime * 0.12)
      return { ...BASE, inbound: 0.6, admitted: 0.12, power: Math.min(1, want), clamped: want > 1 }
    }
    case 'nofan':
      return { ...BASE, inbound: 0.45, admitted: 0.12, power: MEASURED_MW / CAP_MW }

    // Everything the array hears, arriving at the processor.
    case 'raw':
      return { ...BASE, inbound: 1, admitted: 0 }
    // ...and what the radio can actually carry. The rest stops at the skull.
    case 'pipe':
      return { ...BASE, inbound: 1, admitted: 0.06, showDrops: true }
    // Reduce it before it travels, and the same trickle now carries the meaning.
    /* Fewer packets leaving than on the raw beat, not more.
       At admitted: 1 the outbound column was denser than the jammed one it is
       meant to contrast with, which reads as "now there is more data" — the
       opposite of the claim. What changed is that the trickle is now sufficient,
       so it stays a trickle and simply never stops. */
    case 'spikes':
      return { ...BASE, inbound: 0.14, admitted: 0.42, detected: true }
    case 'inside':
      return { ...BASE, inbound: 0.14, admitted: 0.42, detected: true, power: MEASURED_MW / CAP_MW }

    case 'everything':
      return { ...BASE, inbound: 0.5, admitted: 0.5, detected: true, power: MEASURED_MW / CAP_MW }
    default:
      return { ...BASE, inbound: 0.4, admitted: 0.3 }
  }
}

/*
 * HONEST COMPRESSION, and it is the largest in the course.
 *
 * The real ratio is 200 to 1. Drawn faithfully, one packet would leave for
 * every two hundred that arrived, and a reader would watch a still picture
 * punctuated by an event every several seconds.
 *
 * MEASURED on the `pipe` beat: 96 packets climbing the threads against 2
 * leaving, so the constriction reads at about 48 to 1. The copy states that
 * figure and the real one, exactly as the microcontroller's duty cycle and the
 * memory ladder's log axis do. It is deliberately not exported as a constant —
 * nothing computes from it, and a number that only ever gets asserted is the
 * thing this course keeps finding wrong elsewhere.
 */
