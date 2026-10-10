import { useContext, useEffect, useRef, type ReactNode } from 'react'
import { type ThreeEvent } from '@react-three/fiber'
import { SceneIdContext, useSceneFrame } from './layers'
import * as THREE from 'three'
import { updateDriver } from './driver'
import { partRegistry } from './registry'
import { clearHover, cued, hoverPart, hovered, markTapped, pointer } from './hover'
import { marked } from './naming'
import { orbit } from './orbit'
import { glossary } from '../content/glossary'
import { damp } from '../lib/math'
import type { Vec3 } from '../content/types'

const DIM_COLOR = new THREE.Color('#0a0d14')
const LIFT_COLOR = new THREE.Color('#dff4ff')

/** Scratch vector for the on-screen test. Shared: the test is synchronous. */
const scale = new THREE.Vector3()

type PartProps = {
  /** Focus id. A part matches if `id` equals the driver focus or is in `tags`. */
  id: string
  tags?: string[]
  /** Assembled position. */
  position: Vec3
  /** Vector added to `position` at explode = 1. */
  offset?: Vec3
  /** Multiplier on the global explode amount — lets layers separate at different rates. */
  rate?: number
  children: ReactNode
}

/**
 * One addressable piece of the model.
 *
 * Handles three things: displacement along its explode vector, dimming when a
 * different part is spotlit, and naming itself when the pointer is over it.
 * Dimming lerps the material colour toward the background rather than using
 * opacity — transparency here would mean depth-sorting a stack of coplanar
 * slabs, which flickers.
 */
export function Part({ id, tags, position, offset = [0, 0, 0], rate = 1, children }: PartProps) {
  const layer = useContext(SceneIdContext)
  const group = useRef<THREE.Group>(null!)
  const dim = useRef(0)
  const lift = useRef(0)
  const hide = useRef(0)
  const explode = useRef(0)

  useEffect(() => {
    partRegistry.set(id, group.current)
    return () => {
      partRegistry.delete(id)
      if (hovered.id === id) clearHover()
    }
  }, [id])

  /* Parts with no glossary entry take no pointer handlers at all, rather than
     taking them and returning early. An object with handlers is raycast on
     every pointer move whether or not it does anything with the result, and the
     package scene alone has seven of them stacked in the same few centimetres. */
  const named = Boolean(glossary[id])

  /**
   * Whether this part is actually on screen right now.
   *
   * Pointer events do not respect ancestor visibility: an inactive chapter's
   * scene layer is `visible = false`, and its geometry is still raycast and
   * still fires hover. Without this guard, hovering the exploded package named
   * the XOR gate and the ripple-carry adder — parts of two other chapters,
   * sitting invisible at the same place in world space.
   *
   * Testing world scale rather than the visibility flag alone covers the other
   * two ways a part can be present but not shown: a scene layer part-way
   * through its cross-fade, and a part that isolation has shrunk away.
   */
  const displayed = () => {
    const group_ = group.current
    if (!group_ || !group_.visible) return false
    let visible = true
    group_.traverseAncestors((a) => {
      if (!a.visible) visible = false
    })
    if (!visible) return false
    return group_.getWorldScale(scale).x > 0.8
  }

  const onOver = named
    ? (e: ThreeEvent<PointerEvent>) => {
        // The nearest part wins. Without this the pointer names every layer it
        // passes through on the way into the stack.
        e.stopPropagation()
        if (orbit.dragging || !displayed()) return
        pointer.x = e.clientX
        pointer.y = e.clientY
        hoverPart(id)
        marked.object = group.current
        marked.instance = null
      }
    : undefined

  const onMove = named
    ? (e: ThreeEvent<PointerEvent>) => {
        if (hovered.id !== id) return
        pointer.x = e.clientX
        pointer.y = e.clientY
      }
    : undefined

  const onOut = named
    ? (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        if (hovered.id !== id) return
        clearHover()
        marked.object = null
      }
    : undefined

  /* Touch has no hover, so a tap is the only way in. Pins the card until the
     reader taps somewhere that is not a part. */
  const onDown = named
    ? (e: ThreeEvent<PointerEvent>) => {
        if (e.pointerType !== 'touch') return
        e.stopPropagation()
        if (!displayed()) return
        markTapped()
        pointer.x = e.clientX
        pointer.y = e.clientY
        hoverPart(id, true)
        marked.object = group.current
        marked.instance = null
      }
    : undefined

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)

    /* Damped rather than applied straight from the driver.
       Within a lecture, explode tracks the step tween continuously and a high
       lambda keeps it feeling directly driven. At a chapter boundary it jumps
       (1 -> 0 when the next chapter starts assembled), and undamped that
       teleported every layer in a single frame while the camera glided — the
       mismatch read as a lurch. This turns the jump into a ~0.2s move. */
    const target = Math.min(d.explode * rate, 1)
    explode.current = damp(explode.current, target, 9, dt)
    const t = explode.current

    group.current.position.set(
      position[0] + offset[0] * t,
      position[1] + offset[1] * t,
      position[2] + offset[2] * t,
    )

    /* A part in a chapter that is not on screen answers to nobody.
       `focus` and `isolate` belong to the beat being read, and that beat is in
       some other chapter — so every part here is unmatched, and an isolate beat
       would quietly shrink away an entire chapter that nobody is looking at.
       That cost a black frame: stepping out of an isolate beat cut to the next
       chapter with all of its parts already hidden, and they took ~0.4s to
       scale back in. Measured as one frame with zero meshes drawn, against none
       at all for a step out of an ordinary beat. */
    const foreign = layer !== null && layer !== d.scene
    const matched = foreign || d.focus === null || d.focus === id || tags?.includes(d.focus)

    // Isolation shrinks a part away rather than toggling `visible`, so the
    // change reads as a move instead of a pop.
    hide.current = damp(hide.current, !foreign && d.isolate && !matched ? 1 : 0, 7, dt)
    const shown = 1 - hide.current
    group.current.scale.setScalar(Math.max(shown, 0.0001))
    group.current.visible = shown > 0.02

    const targetDim = matched ? 0 : 0.82 * d.focusStrength
    dim.current = damp(dim.current, targetDim, 6, dt)
    /* Hover lifts the part toward a cool white so the thing being named is
       unambiguous, which matters most in the package scene where six flat slabs
       sit within a couple of millimetres of each other.

       Not when the part is already the beat's focus, though. There the scene
       has dimmed everything else to nothing, so the part is unambiguous
       already, and lifting it on top of that only washes the material out — on
       the gates it pushed a pale body to near-white and its wires past the
       bloom threshold. A highlight is only information when there is something
       to be distinguished from. */
    const isFocus = d.focus !== null && (d.focus === id || !!tags?.includes(d.focus))
    const named = hovered.id === id || cued.id === id
    lift.current = damp(lift.current, named && !isFocus ? 1 : 0, 12, dt)

    const active = dim.current > 0.001 || lift.current > 0.001
    if (active || group.current.userData.tinted) {
      group.current.userData.tinted = active
      applyTint(group.current, dim.current, lift.current)
    }
  })

  return (
    <group
      ref={group}
      onPointerOver={onOver}
      onPointerMove={onMove}
      onPointerOut={onOut}
      onPointerDown={onDown}
    >
      {children}
    </group>
  )
}

function applyTint(root: THREE.Object3D, dim: number, lift: number) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const m of mats) {
      const mat = m as THREE.MeshStandardMaterial
      if (!mat.color) continue
      // Cache the authored look the first time we touch this material.
      if (!mat.userData.base) {
        mat.userData.base = {
          color: mat.color.clone(),
          emissive: mat.emissiveIntensity ?? 1,
        }
      }
      const base = mat.userData.base as { color: THREE.Color; emissive: number }
      mat.color.copy(base.color).lerp(DIM_COLOR, dim).lerp(LIFT_COLOR, lift * 0.22)
      if (mat.emissive) mat.emissiveIntensity = base.emissive * (1 - dim) * (1 + lift * 0.5)
    }
  })
}
