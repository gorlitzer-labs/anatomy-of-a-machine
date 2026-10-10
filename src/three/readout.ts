import { create } from 'zustand'

/**
 * Live numbers a scene publishes into the copy card.
 *
 * The course's own doctrine is that the best motion *is* the number, and an
 * audit of all seventeen scenes found the plumbing for saying so did not exist:
 * `harnessLength()` computed the exact wiring reduction the copy claims and was
 * called from nowhere; `Tier.latencyText` only ever appeared in hand-copied
 * labels; the dark-silicon block count, the throttle multiplier and the CAN
 * priority that decides every arbitration were all computed and then discarded.
 *
 * Modelled on `signal.ts` → `TruthTable`, which is the one place in the codebase
 * where a scene and the copy already read the same state and therefore cannot
 * disagree.
 *
 * Written from `useFrame`, so the guard matters: React state is only touched
 * when the *rendered text* changes. A store set on every frame would re-render
 * the copy card at 60 Hz to display a number that reads the same.
 */

export type Reading = {
  label: string
  value: string
  /** Draws attention — the number the current beat is actually about. */
  key?: boolean
}

type ReadoutStore = {
  /**
   * Which scene published these.
   *
   * Every scene in the course is mounted at once and hidden by visibility, so
   * every `useFrame` runs on every frame no matter which scene is on screen.
   * Without this tag the last scene to publish won, and an I/O beat rendered
   * the memory ladder's readings — a real bug caught only because the numbers
   * were on screen to be read.
   */
  scene: string
  readings: Reading[]
  publish: (scene: string, readings: Reading[]) => void
}

export const useReadout = create<ReadoutStore>((set, get) => ({
  scene: '',
  readings: [],
  publish: (scene, readings) => {
    const now = get()
    if (now.scene === scene && now.readings.length === readings.length) {
      let same = true
      for (let i = 0; i < readings.length; i++) {
        if (
          now.readings[i].label !== readings[i].label ||
          now.readings[i].value !== readings[i].value ||
          now.readings[i].key !== readings[i].key
        ) {
          same = false
          break
        }
      }
      if (same) return
    }
    set({ scene, readings })
  },
}))

/**
 * Publishes from a frame loop. Safe to call every frame.
 *
 * `active` is the scene the driver is currently showing. Every scene is mounted
 * at once, so a publisher that does not check this writes on every frame of the
 * whole course and simply races the others — whichever ran last in the frame
 * won, which silently blanked the readout on beats whose own scene published
 * first. Passing the driver's scene makes the guard impossible to forget.
 */
export const publishReadout = (scene: string, active: string, readings: Reading[]) => {
  if (scene !== active) return
  useReadout.getState().publish(scene, readings)
}
