import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { clearHover, hoverRole, hoverWith, hovered, markTapped, pointer } from './hover'
import { orbit } from './orbit'
import { roleGlossary, type GlossaryEntry } from '../content/glossary'

/**
 * Naming geometry that is not a `Part`.
 *
 * `Part` is the right tool when a thing is *addressable*: the beat can spotlight
 * it, isolate it, or explode it away from its neighbours. Most of the course is
 * not like that. A memory array is two hundred identical cells, a rack is forty
 * identical nodes, a schematic is however many transistors that layout happens
 * to need — and a `Part` per element would mean an id per element, a focus
 * target per element, and a registry entry per element, all to answer a question
 * that only has as many distinct answers as there are *kinds* of thing.
 *
 * So these name by role. The reader points at a capacitor and is told what a
 * capacitor is, whether it is the only one in a DRAM cell or one of two hundred
 * in the array.
 *
 * The pattern was already here, invented for the architectures chapter's 256
 * re-tiling blocks; this is that idea extracted so every chapter can use it
 * without hand-rolling four pointer handlers each time.
 */

const scale = new THREE.Vector3()

/**
 * Whether the thing under the pointer is genuinely on screen.
 *
 * The same guard `Part` uses, and it exists for the same reason: pointer events
 * do not respect ancestor visibility, so without it an inactive chapter sitting
 * invisible at the same place in world space answers the hover instead.
 */
function displayed(object: THREE.Object3D) {
  if (!object.visible) return false
  let visible = true
  object.traverseAncestors((a) => {
    if (!a.visible) visible = false
  })
  if (!visible) return false
  return object.getWorldScale(scale).x > 0.8
}

export type NameHandlers = {
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
}

/**
 * Pointer handlers that name a piece of geometry by its role.
 *
 * Returns nothing at all for a role with no glossary entry, which is not a
 * detail: an object carrying handlers is raycast on every pointer move whether
 * or not it does anything with the result, and these scenes have hundreds of
 * them.
 *
 * `role` is namespaced by scene (`cell:capacitor`) so that two chapters can
 * both have a "core" without one silently answering for the other.
 */
export function nameHandlers(
  scene: string,
  role: string | (() => string | null),
  entry?: GlossaryEntry,
): NameHandlers {
  /* A thunk for geometry that is a different thing on different beats. The
     radiation chapter's grid is a memory array, then a neuromorphic array, then
     a register of qubits, and it is the same meshes throughout — so what to
     call one of them is a question that can only be answered when it is asked,
     not when it was built. */
  const fixed = typeof role === 'string' ? role : null
  const resolve = typeof role === 'string' ? () => role : role
  if (fixed !== null && !entry && !roleGlossary[fixed]) return {}

  const name = (pinned: boolean) => {
    const current = resolve()
    if (current === null) return false
    const id = `${scene}#${current}`
    if (entry) return hoverWith(id, entry, pinned)
    if (!roleGlossary[current]) {
      clearHover()
      return false
    }
    return hoverRole(id, current, pinned)
  }

  const holding = () => hovered.id?.startsWith(`${scene}#`) ?? false

  const point = (e: ThreeEvent<PointerEvent>) => {
    pointer.x = e.clientX
    pointer.y = e.clientY
  }

  return {
    onPointerOver: (e) => {
      e.stopPropagation()
      if (orbit.dragging || !displayed(e.object)) return
      point(e)
      if (!name(false)) return
      marked.object = e.object
      marked.instance = e.instanceId ?? null
    },
    onPointerMove: (e) => {
      if (marked.object !== e.object || !holding()) return
      point(e)
      // An instanced mesh is one object with many bodies, so moving between two
      // of them fires no over/out — the marker has to follow inside the move.
      if (e.instanceId !== undefined && marked.instance !== e.instanceId) {
        marked.instance = e.instanceId
      }
    },
    onPointerOut: (e) => {
      e.stopPropagation()
      if (marked.object !== e.object) return
      clearHover()
      marked.object = null
    },
    onPointerDown: (e) => {
      // Touch has no hover, so a tap is the only way in. Pins the card.
      if (e.pointerType !== 'touch') return
      e.stopPropagation()
      if (!displayed(e.object)) return
      markTapped()
      point(e)
      if (!name(true)) return
      marked.object = e.object
      marked.instance = e.instanceId ?? null
    },
  }
}

/**
 * Handlers for an instanced mesh whose bodies are not all the same thing.
 *
 * A wafer's dies are one mesh, but on the yield beat a third of them are scrap
 * and that is the whole point of the beat — so which name the pointer gets has
 * to be a question asked of the instance, not fixed when the mesh was built.
 *
 * `roleFor` returning null means "this one has no name", which is how parked or
 * empty instances stay silent rather than putting a card over blank space.
 */
export function instanceNameHandlers(
  scene: string,
  roleFor: (instanceId: number) => string | null,
): NameHandlers {
  const point = (e: ThreeEvent<PointerEvent>) => {
    pointer.x = e.clientX
    pointer.y = e.clientY
  }

  const name = (e: ThreeEvent<PointerEvent>, pinned: boolean) => {
    if (e.instanceId === undefined) return false
    const role = roleFor(e.instanceId)
    if (!role || !roleGlossary[role]) {
      clearHover()
      marked.object = null
      return false
    }
    point(e)
    hoverRole(`${scene}#${role}`, role, pinned)
    marked.object = e.object
    marked.instance = e.instanceId
    return true
  }

  return {
    onPointerOver: (e) => {
      e.stopPropagation()
      if (orbit.dragging || !displayed(e.object)) return
      name(e, false)
    },
    // Moving between two bodies of one instanced mesh fires no over/out at all,
    // so for these the move *is* the hover.
    onPointerMove: (e) => {
      e.stopPropagation()
      if (orbit.dragging || !displayed(e.object)) return
      name(e, false)
    },
    onPointerOut: (e) => {
      e.stopPropagation()
      if (marked.object !== e.object) return
      clearHover()
      marked.object = null
    },
    onPointerDown: (e) => {
      if (e.pointerType !== 'touch') return
      e.stopPropagation()
      if (!displayed(e.object)) return
      markTapped()
      name(e, true)
    },
  }
}

/** Memoised `nameHandlers` for a whole scene. */
export function useNamer(scene: string) {
  return useMemo(() => {
    const cache = new Map<string, NameHandlers>()
    return (role: string, entry?: GlossaryEntry) => {
      let handlers = cache.get(role)
      if (!handlers) {
        handlers = nameHandlers(scene, role, entry)
        cache.set(role, handlers)
      }
      return handlers
    }
  }, [scene])
}

/**
 * The exact body the pointer is on, for the highlight to draw around.
 *
 * Role hover cannot tint the thing it names the way `Part` does: the scenes
 * write emissive levels every frame to say what their geometry is *doing*, and
 * a hover that wrote to the same channel would either be overwritten or would
 * overwrite the lesson. So the highlight is drawn as a separate object instead —
 * see `HoverMarker`.
 */
export const marked: { object: THREE.Object3D | null; instance: number | null } = {
  object: null,
  instance: null,
}
