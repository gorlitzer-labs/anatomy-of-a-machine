import * as THREE from 'three'

/**
 * A microcontroller, asleep.
 *
 * The motion signature of this lecture is *stillness*, which makes it the only
 * scene in the course whose main event is that almost nothing happens. A
 * battery-powered sensor spends nearly all of its life drawing single-digit
 * microamps with every block switched off, wakes for a few milliseconds, and
 * goes back down.
 *
 * Checked figures: sleep currents run around 0.1-5 µA against 15-20 mA awake,
 * a difference of up to a hundred thousand times, and a device awake 0.01% of
 * the time averages roughly 6 µA — which is where "years on a coin cell" comes
 * from. Battery life is a function of *average* current, so it is dominated by
 * the duty cycle rather than by any headline number in a datasheet.
 *
 * HONEST COMPRESSION: a duty cycle of 0.01% is unwatchable — the reader would
 * stare at a dark rectangle for the entire beat and see one flicker. The scene
 * runs at roughly 12%, and the copy states the real figure rather than letting
 * the picture imply it.
 */

export type Role = 'core' | 'flash' | 'sram' | 'timer' | 'radio' | 'sensor'

export const C: Record<Role, THREE.Color> = {
  core: new THREE.Color('#4fd8ff'),
  flash: new THREE.Color('#6ee7a8'),
  sram: new THREE.Color('#a06bff'),
  timer: new THREE.Color('#ffab40'),
  radio: new THREE.Color('#ff7ad9'),
  sensor: new THREE.Color('#7fe9ff'),
}

export type Block = { id: string; role: Role; x: number; z: number; w: number; d: number }

/** A whole computer, and there is very little of it. */
export const BLOCKS: Block[] = [
  { id: 'core', role: 'core', x: -0.75, z: -0.35, w: 1.0, d: 0.9 },
  { id: 'flash', role: 'flash', x: 0.55, z: -0.45, w: 0.9, d: 0.7 },
  { id: 'sram', role: 'sram', x: 0.55, z: 0.35, w: 0.9, d: 0.5 },
  { id: 'timer', role: 'timer', x: -0.75, z: 0.6, w: 0.5, d: 0.42 },
  { id: 'radio', role: 'radio', x: 1.75, z: -0.1, w: 0.62, d: 1.1 },
  { id: 'sensor', role: 'sensor', x: -1.95, z: 0.1, w: 0.5, d: 1.1 },
]

export const DIE = { w: 4.6, d: 2.6 }

/** One wake cycle, in seconds. */
export const PERIOD = 8.5

/** The phases of a wake, as fractions of the period. */
const WAKE = { start: 0.0, sense: 0.02, compute: 0.05, send: 0.09, done: 0.12 }

export type Duty = {
  /** 0..1 through the cycle. */
  phase: number
  awake: boolean
  /** Which stage of the wake, or null while asleep. */
  doing: 'sense' | 'compute' | 'send' | null
}

export function dutyAt(t: number): Duty {
  const phase = (t % PERIOD) / PERIOD
  if (phase >= WAKE.done) return { phase, awake: false, doing: null }
  if (phase >= WAKE.send) return { phase, awake: true, doing: 'send' }
  if (phase >= WAKE.compute) return { phase, awake: true, doing: 'compute' }
  if (phase >= WAKE.sense) return { phase, awake: true, doing: 'sense' }
  return { phase, awake: true, doing: 'sense' }
}

/**
 * Whether a block is drawing power.
 *
 * The timer is the exception that makes the whole scheme work: something has to
 * stay awake to wake everything else, so one small counter runs continuously on
 * a trickle while the rest of the chip is genuinely off.
 */
export function powered(block: Block, t: number, focus: string): boolean {
  const d = dutyAt(t)

  // The beat about the timer holds everything else down so it can be seen.
  if (focus === 'timer') return block.role === 'timer'

  if (focus === 'asleep') return block.role === 'timer'

  if (!d.awake) return block.role === 'timer'

  switch (block.role) {
    case 'timer':
      return true
    case 'core':
      return true
    case 'sensor':
      return d.doing === 'sense'
    case 'sram':
      return d.doing === 'sense' || d.doing === 'compute'
    case 'flash':
      return d.doing === 'compute'
    case 'radio':
      return d.doing === 'send'
  }
}
