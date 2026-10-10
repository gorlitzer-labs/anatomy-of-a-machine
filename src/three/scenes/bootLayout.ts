/**
 * Boot, as a sequence.
 *
 * Every other scene in the course loops, because every other subject is a
 * steady state: a bus carries traffic, a pipeline runs instructions, a
 * scheduler takes turns. Boot is the one thing that happens *once*, in order,
 * and never again — so it is the only scene that runs to an end and stops.
 *
 * That is the whole motion signature. Stages light in strict order and stay
 * lit; nothing that has completed un-completes; and at the end the machine sits
 * there, done, until the beat restarts it.
 */

export type Stage = {
  id: string
  label: string
  /** Share of the whole boot this stage occupies. */
  weight: number
}

export const STAGES: Stage[] = [
  { id: 'rail', label: 'Power', weight: 0.9 },
  { id: 'reset', label: 'Reset', weight: 0.5 },
  { id: 'firmware', label: 'Firmware', weight: 1.5 },
  { id: 'post', label: 'Self-test', weight: 1.2 },
  { id: 'find', label: 'Find a disk', weight: 1.0 },
  { id: 'loader', label: 'Bootloader', weight: 0.9 },
  { id: 'kernel', label: 'Kernel', weight: 1.6 },
]

const TOTAL = STAGES.reduce((n, s) => n + s.weight, 0)

/**
 * Seconds for one boot.
 *
 * Eleven, because the closing beat's heading is "Eleven seconds, and none of it
 * repeats" — so the scene's duration is the number the copy states rather than
 * an unrelated 9.5.
 */
export const RUN = 11

export const SPAN = 5.6
export const stageX = (i: number) => (i / (STAGES.length - 1) - 0.5) * SPAN

/** Cumulative fraction at which each stage begins and ends. */
export const BOUNDS = (() => {
  const out: Array<{ from: number; to: number }> = []
  let acc = 0
  for (const s of STAGES) {
    const from = acc / TOTAL
    acc += s.weight
    out.push({ from, to: acc / TOTAL })
  }
  return out
})()

export type BootState = {
  /** 0..1 through the boot, clamped at 1 during the rest period. */
  progress: number
  /** Index of the stage currently running, or STAGES.length once finished. */
  active: number
  /** Supply voltage, 0..1. Rises first and must be stable before anything runs. */
  voltage: number
  finished: boolean
}

/**
 * Which stage of the boot each beat is about. -1 is the machine still off.
 *
 * The closing beat is absent on purpose: it replays the whole sequence rather
 * than any one stage of it.
 */
const STAGE_FOR: Record<string, number> = {
  cold: -1,
  rail: 0,
  firmware: 2,
  post: 3,
  find: 4,
  loader: 5,
  kernel: 6,
}

/** A moment before a beat's stage starts, so the reader sees it begin. */
const LEAD = 0.45

/**
 * Where the boot is, for the beat on screen and how long it has been there.
 *
 * Runs on beat time, not on the page clock, and this is the one scene where
 * that distinction is the entire subject. Boot was previously a 12-second
 * modulo, which meant the machine booted and re-booted continuously underneath
 * copy reading "it happens once, in order, and never again" — and a reader
 * arriving at the beat that says "watch the rail fill before anything else
 * moves" had roughly a one-in-eleven chance of the rail still being empty.
 *
 * Now each beat starts at the beginning of its own stage, with everything
 * before it already complete, runs that stage, and holds. Nothing loops.
 * Voltage leads everything: nothing is permitted to execute until the rail is
 * up, which is what a power-on reset is for. The ramp is not decoration — it
 * is the first thing that has to be true.
 */
export function bootAt(beatTime: number, motion: string | null): BootState {
  const elapsed = Math.max(0, beatTime - LEAD)
  const stage = motion !== null && motion in STAGE_FOR ? STAGE_FOR[motion] : null

  let progress: number
  if (stage === -1) {
    // Off is not a paused boot. It is no boot.
    progress = 0
  } else if (stage === null) {
    // The closing beat runs the whole thing once and then simply stops, which
    // is the sentence it sits under.
    progress = Math.min(1, elapsed / RUN)
  } else {
    const b = BOUNDS[stage]
    const span = (b.to - b.from) * RUN
    /* Held a hair short of the boundary so this stage stays the running one
       for as long as the reader is reading about it, rather than handing off
       to a successor that then sits at zero looking stalled. */
    progress = Math.min(b.to - 1e-4, b.from + ((b.to - b.from) * elapsed) / span)
  }

  const voltage = Math.min(1, progress / BOUNDS[0].to)
  let active = STAGES.length
  /* Nothing is running on a machine that is off. Without this guard progress 0
     falls inside stage 0's bounds, so the first stage lit up as "running"
     underneath copy reading "a machine with power off is not paused — it is
     nothing", which is the one claim that beat exists to make. */
  if (stage !== -1) {
    for (let i = 0; i < BOUNDS.length; i++) {
      if (progress >= BOUNDS[i].from && progress < BOUNDS[i].to) {
        active = i
        break
      }
    }
  }
  return { progress, active, voltage, finished: progress >= 1 }
}

/** How far through its own stage the boot is, 0..1. */
export function stageProgress(state: BootState, i: number) {
  const b = BOUNDS[i]
  if (state.progress >= b.to) return 1
  if (state.progress < b.from) return 0
  return (state.progress - b.from) / (b.to - b.from)
}
