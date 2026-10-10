import { createContext, useContext, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { RootState } from '@react-three/fiber'
import type { SceneId } from '../content/types'

/**
 * Which scene layer a component is inside, and how much of it is on screen.
 *
 * Every scene the current lecture uses stays mounted (five, for lecture 1), so
 * by default every one of their frame loops runs on every frame, whichever
 * chapter the reader is actually looking at — instanced matrix writes, lane
 * resampling and packet integration for chapters nobody can see.
 */
export const SceneIdContext = createContext<SceneId | null>(null)

/** Written by `SceneLayer` each frame. */
export const layerPresence = new Map<SceneId, number>()

/** Below this the layer has shrunk to nothing and is not being drawn. */
export const PRESENCE_FLOOR = 0.004

export const sceneOnScreen = (id: SceneId | null) =>
  id === null || (layerPresence.get(id) ?? 0) > PRESENCE_FLOOR

/**
 * Longest gap between updates for a scene nobody is looking at. At ~10 Hz an
 * off-screen chapter costs a sixth of what it did.
 */
const IDLE_PERIOD = 0.1

/**
 * `useFrame`, but throttled while its chapter is off screen.
 *
 * Throttled rather than skipped, and called with the *accumulated* elapsed
 * time rather than the frame's own. Both matter. Scene state is damped toward
 * its target, and damping is framerate-independent, so an off-screen scene
 * stepped at 10 Hz with the right `dt` arrives at the same place as one stepped
 * at 60 Hz — it is ready the instant the reader steps into it, which is what
 * running every frame was buying and the only reason it was worth the cost.
 *
 * Skipping outright would have been cheaper and wrong: a chapter would be
 * caught mid-morph on arrival, wearing whatever architecture it was showing
 * when the reader last left it.
 *
 * Outside a scene layer (the annotations, the rig) there is nothing to gate on
 * and this is exactly `useFrame`.
 */
export function useSceneFrame(callback: (state: RootState, dt: number) => void) {
  const id = useContext(SceneIdContext)
  const idle = useRef(0)

  useFrame((state, dt) => {
    if (sceneOnScreen(id)) {
      idle.current = 0
      if (import.meta.env.DEV) work.ran++
      callback(state, dt)
      return
    }
    idle.current += dt
    if (idle.current < IDLE_PERIOD) {
      if (import.meta.env.DEV) work.skipped++
      return
    }
    const elapsed = idle.current
    idle.current = 0
    if (import.meta.env.DEV) work.ran++
    callback(state, elapsed)
  })
}

/**
 * Scene-loop calls run against calls skipped, for checking that the gate above
 * is actually gating. Dev only.
 */
export const work = { ran: 0, skipped: 0 }
