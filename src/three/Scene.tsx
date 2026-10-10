import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { driver, updateDriver } from './driver'
import { partRegistry } from './registry'
import { orbit, resetOrbit } from './orbit'
import { deck, moveProgress } from '../deck/deck'
import { layout } from '../ui/layout'
import { damp, damp3 } from '../lib/math'
import { layerPresence, SceneIdContext, work } from './layers'
import { Annotations } from './Annotations'
import { HoverMarker } from './HoverMarker'
import { CpuScene } from './scenes/CpuScene'
import { MosfetScene } from './scenes/MosfetScene'
import { GateScene } from './scenes/GateScene'
import { AdderScene } from './scenes/AdderScene'
import { FabricScene } from './scenes/FabricScene'
import { BoardScene } from './scenes/BoardScene'
import { CellScene } from './scenes/CellScene'
import { LadderScene } from './scenes/LadderScene'
import { PipelineScene } from './scenes/PipelineScene'
import { FabScene } from './scenes/FabScene'
import { KernelScene } from './scenes/KernelScene'
import { BootScene } from './scenes/BootScene'
import { CodeScene } from './scenes/CodeScene'
import { PhoneScene } from './scenes/PhoneScene'
import { EdgeScene } from './scenes/EdgeScene'
import { CarScene } from './scenes/CarScene'
import { RobotScene } from './scenes/RobotScene'
import { DatacenterScene } from './scenes/DatacenterScene'
import { ExtremesScene } from './scenes/ExtremesScene'
import { ImplantScene } from './scenes/ImplantScene'
import type { SceneId } from '../content/types'
import { lectures } from '../content/lectures'
import { useDeck } from '../deck/deck'

/**
 * Every scene the course can draw, by id.
 *
 * A table rather than twenty JSX layers, because which of them are mounted is
 * now a decision rather than "all of them".
 */
const SCENES: Record<SceneId, () => React.JSX.Element> = {
  cpu: CpuScene,
  mosfet: MosfetScene,
  gates: GateScene,
  adder: AdderScene,
  fabric: FabricScene,
  board: BoardScene,
  cell: CellScene,
  ladder: LadderScene,
  pipeline: PipelineScene,
  fab: FabScene,
  kernel: KernelScene,
  boot: BootScene,
  code: CodeScene,
  phone: PhoneScene,
  edge: EdgeScene,
  car: CarScene,
  robot: RobotScene,
  datacenter: DatacenterScene,
  extremes: ExtremesScene,
  implant: ImplantScene,
}

export function Scene() {
  /* Only the scenes the current lecture can actually reach.
   *
   * All twenty used to be mounted for the whole session, and every one of them
   * built its geometry and materials at startup and kept them until the tab
   * closed — nothing in this codebase calls `dispose`, because nothing was ever
   * unmounted. The median lecture needs *one* scene, and lecture 1 needs five.
   *
   * Safe to swap on the lecture rather than the chapter because entering a
   * lecture is already a cut: `deck.enter` sets position without easing,
   * precisely so the previous lecture's framing does not bleed into the next.
   * Within a lecture every scene it uses stays mounted, so chapter-to-chapter
   * transitions — which *are* eased, and which `useSceneFrame` keeps warm at
   * 10 Hz so a chapter is correct the moment you arrive in it — are untouched.
   */
  const lecture = useDeck((s) => s.lecture)
  const needed = useMemo(() => {
    const ids = lectures[lecture]?.chapters.map((c) => c.scene) ?? []
    return [...new Set(ids)]
  }, [lecture])

  return (
    <>
      <DevProbe />
      <Rig />
      <Lighting />
      <Backdrop />
      <Dust />
      {needed.some((id) => id in GROUNDS) && <Ground />}
      {needed.map((id) => {
        const SceneComponent = SCENES[id]
        return SceneComponent ? (
          <SceneLayer id={id} key={id}>
            <SceneComponent />
          </SceneLayer>
        ) : null
      })}
      <HoverMarker />
      <Annotations />
      {/* No ground plane. A floor here caught the directional light's shadow as
          a hard-edged parallelogram that read as a rendering artifact rather
          than as ground, and its lit surface fought the copy. The package
          floats in void; layers still self-shadow. */}
    </>
  )
}

/**
 * One chapter replaces another on a single frame, and the arriving one settles
 * the last of the way in.
 *
 * There are only three things a scale-only handover can do, and two of them are
 * bugs this project has now shipped. **Overlap** and both chapters are on
 * screen together — the original bug, a third-size ghost of the last chapter
 * sitting over the new one. **Gap** and neither is: replacing the overlap with
 * strictly sequential windows put a hole in the middle of the move where the
 * departing scene had shrunk to 0.05 and the arriving one had not yet reached
 * 0.06, which is an empty frame, which reads as a blink. Measured at 0.054
 * against 0.007 at the midpoint.
 *
 * The third is a **cut**, and a cut is only a pop when nothing replaces what
 * left. Here something does, on the same frame, and that frame is the middle of
 * the step tween — where `smootherstep` is at its steepest and the camera is
 * moving faster than anywhere else in the move. Cutting on motion is the oldest
 * trick in editing and it works for the same reason here.
 *
 * A cross-fade would be the fourth option and it is not available: fading needs
 * opacity, and this scene is full of coplanar slabs that flicker the moment
 * they are made transparent, which is why nothing else here uses it either.
 */

/** How much of its size the arriving chapter eases in over. */
const ARRIVAL = 0.16

function SceneLayer({ id, children }: { id: SceneId; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!)
  const settle = useRef(0)

  useFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const showing = d.scene === id

    /* The departing chapter leaves in one frame, undamped and at full size.
       Damping it out is what produced both earlier bugs: whatever the lambda,
       a shrinking scene is either still legible while the next one arrives, or
       it has vanished before the next one has. */
    if (!showing) {
      settle.current = 0
      group.current.visible = false
      layerPresence.set(id, 0)
      return
    }

    // Arrives a little under size and grows into place, which keeps the sense
    // of continuing the zoom the chapter boundaries are written as, without
    // ever being small enough to leave the frame looking empty.
    settle.current = damp(settle.current, 1, 7, dt)
    group.current.scale.setScalar(1 - ARRIVAL + ARRIVAL * settle.current)
    group.current.visible = true
    layerPresence.set(id, 1)
  })

  /* Starts hidden and at nothing, rather than relying on the first frame to
     put it there. A `<group>` defaults to visible at scale 1, and pointer
     events do not wait for a frame — so between mount and the first `useFrame`
     every chapter in the course was on screen at full size and answering
     hovers. The reader never saw the flash, but a pointer resting over the
     canvas at load time did: it named a part of some other lecture, and since
     the pointer never moved, no `pointerout` ever arrived to take the card
     away again. */
  const initial = id === 'cpu'

  return (
    <SceneIdContext.Provider value={id}>
      <group
        ref={group}
        name={`layer:${id}`}
        visible={initial}
        scale={initial ? 1 - ARRIVAL : 0.0001}
      >
        {children}
      </group>
    </SceneIdContext.Provider>
  )
}



/**
 * Dev-only handle for inspecting camera framing from the browser console or an
 * automated check. Stripped from production builds by the `import.meta.env.DEV`
 * guard, which Vite constant-folds.
 */
function DevProbe() {
  const state = useThree()
  if (!import.meta.env.DEV) return null
  /**
   * Measures only what the camera can actually see.
   *
   * The ancestor-visibility walk matters: inactive scene layers keep their own
   * meshes flagged visible and only switch off the layer group, so a naive
   * traversal folds every other chapter's geometry into the bounding box. That
   * made the reported framing meaningless the moment there was more than one
   * scene — the numbers described a phantom object spanning all of them.
   */
  const shown = (o: THREE.Object3D) => {
    if (!o.visible) return false
    let ok = true
    o.traverseAncestors((a) => {
      if (!a.visible) ok = false
    })
    return ok
  }

  /**
   * What the renderer is actually holding, for checking that leaving a lecture
   * gives it back.
   *
   * Scenes are mounted per lecture now, so every lecture boundary is a mount
   * and an unmount — seventeen of them if somebody plays the course through.
   * React unmounting a component is not the same as the GPU releasing what it
   * allocated, and `renderer.info` is the only place that difference shows up.
   * A JS heap reading will not: the buffers live in the driver, not the heap.
   *
   * Dev only, like the rest of this probe.
   */
  ;(window as unknown as Record<string, unknown>).__gpu = () => ({
    geometries: state.gl.info.memory.geometries,
    textures: state.gl.info.memory.textures,
    programs: state.gl.info.programs?.length ?? 0,
    calls: state.gl.info.render.calls,
    triangles: state.gl.info.render.triangles,
  })

  ;(window as unknown as Record<string, unknown>).__stage = () => {
    const cam = state.camera as THREE.PerspectiveCamera
    const box = new THREE.Box3()
    const ndc = new THREE.Box2()
    const corner = new THREE.Vector3()
    state.scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh || !shown(m)) return
      if (m.geometry?.type === 'PlaneGeometry') return // skip the ground
      m.updateWorldMatrix(true, false)
      box.expandByObject(m)
    })
    // Project all eight corners, not just the centre: a subject can be centred
    // and still hang off both edges of the frame.
    for (let i = 0; i < 8; i++) {
      corner.set(
        i & 1 ? box.max.x : box.min.x,
        i & 2 ? box.max.y : box.min.y,
        i & 4 ? box.max.z : box.min.z,
      )
      corner.project(cam)
      ndc.expandByPoint(new THREE.Vector2(corner.x, corner.y))
    }
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const projected = center.clone().project(cam)
    const r = (n: number) => +n.toFixed(2)
    return {
      camPos: cam.position.toArray().map(r),
      fov: +cam.fov.toFixed(1),
      aspect: +cam.aspect.toFixed(2),
      driverPos: driver.position.toArray().map(r),
      driverScene: driver.scene,
      motion: driver.motion,
      variant: driver.variant,
      beatTime: +driver.beatTime.toFixed(2),
      explode: +driver.explode.toFixed(2),
      contentSize: size.toArray().map(r),
      contentCenter: center.toArray().map(r),
      // NDC of the model centre: [0,0] is dead centre of frame.
      centerNdc: [r(projected.x), r(projected.y)],
      // NDC bounds of everything visible. Inside [-1,1] on both axes means the
      // subject is fully in frame; the copy card covers roughly x < -0.05.
      ndc: { minX: r(ndc.min.x), maxX: r(ndc.max.x), minY: r(ndc.min.y), maxY: r(ndc.max.y) },
    }
  }
  /**
   * NDC bounds of one named part — the subject of a beat, rather than the whole
   * scene.
   *
   * Whole-scene bounds answer the wrong question once a scene is bigger than
   * the frame: a beat that deliberately pushes in on the regulators will always
   * report the far end of the board hanging off the edge, and that is correct
   * and intended. What has to be checked is that the thing the copy is talking
   * about is fully in shot and clear of the copy card.
   */
  ;(window as unknown as Record<string, unknown>).__part = (partId: string) => {
    const part = partRegistry.get(partId)
    if (!part) return null
    const cam = state.camera as THREE.PerspectiveCamera
    const box = new THREE.Box3().setFromObject(part)
    if (box.isEmpty()) return null
    const ndc = new THREE.Box2()
    const corner = new THREE.Vector3()
    for (let i = 0; i < 8; i++) {
      corner.set(
        i & 1 ? box.max.x : box.min.x,
        i & 2 ? box.max.y : box.min.y,
        i & 4 ? box.max.z : box.min.z,
      )
      corner.project(cam)
      ndc.expandByPoint(new THREE.Vector2(corner.x, corner.y))
    }
    const r = (n: number) => +n.toFixed(2)
    return { minX: r(ndc.min.x), maxX: r(ndc.max.x), minY: r(ndc.min.y), maxY: r(ndc.max.y) }
  }

  /**
   * Pairs of named parts whose solid volumes run into each other.
   *
   * Two blocks laid out side by side on a floorplan should touch at most; when
   * a layout edit makes one poke into its neighbour, the renderer draws both
   * through each other and nothing fails. Compared per part rather than per
   * mesh, because a part's own meshes overlap on purpose. Touching faces are
   * not reported — a pair counts only when it overlaps by more than `slack`
   * of the thinner of the two on every axis. `contained` marks one box wholly
   * inside the other, which is usually deliberate nesting (a die under its lid)
   * rather than a collision, so it is reported but flagged.
   */
  ;(window as unknown as Record<string, unknown>).__overlaps = (slack = 0.06, by: 'part' | 'mesh' = 'part') => {
    const boxes: Array<{ id: string; box: THREE.Box3; node: THREE.Object3D }> = []
    const meshBox = (m: THREE.Mesh) => {
      m.updateWorldMatrix(true, false)
      return new THREE.Box3().setFromObject(m)
    }
    const solid = (o: THREE.Object3D): o is THREE.Mesh => {
      const m = o as THREE.Mesh
      if (!m.isMesh || !shown(m) || (m as unknown as THREE.InstancedMesh).isInstancedMesh) return false
      // Flat decals, lines and the ground are not solids that can collide.
      return m.geometry?.type !== 'PlaneGeometry'
    }
    if (by === 'part') {
      for (const [id, part] of partRegistry) {
        if (!shown(part)) continue
        const box = new THREE.Box3()
        part.traverse((o) => {
          if (solid(o)) box.union(meshBox(o))
        })
        if (!box.isEmpty()) boxes.push({ id, box, node: part })
      }
    } else {
      // Floorplans are often one part holding many block meshes, so the
      // collisions that matter there are between siblings of a single part.
      const label = (o: THREE.Object3D, box: THREE.Box3, kind: string) => {
        let layer = '?'
        o.traverseAncestors((x) => {
          if (x.name.startsWith('layer:')) layer = x.name.slice(6)
        })
        const c = box.getCenter(new THREE.Vector3()).toArray().map((n) => +n.toFixed(2))
        return `${layer}:${kind}@${c.join(',')}`
      }
      // Instanced meshes (racks, cells, keys) count one box per instance, so
      // two instances placed into each other are caught like any other pair.
      const im = new THREE.Matrix4()
      state.scene.traverse((o) => {
        const inst = o as THREE.InstancedMesh
        if (!inst.isInstancedMesh || !shown(inst) || inst.geometry?.type === 'PlaneGeometry') return
        inst.updateWorldMatrix(true, false)
        if (!inst.geometry.boundingBox) inst.geometry.computeBoundingBox()
        const kind = 'Inst' + (inst.geometry.type ?? 'mesh').replace('Geometry', '')
        for (let i = 0; i < inst.count; i++) {
          inst.getMatrixAt(i, im)
          const box = inst.geometry.boundingBox!.clone().applyMatrix4(im.premultiply(inst.matrixWorld))
          const s = box.getSize(new THREE.Vector3())
          if (box.isEmpty() || s.x * s.y * s.z < 1e-9) continue
          boxes.push({ id: `${label(inst, box, kind)}#${i}`, box, node: inst })
        }
      })
      state.scene.traverse((o) => {
        if (!solid(o)) return
        const box = meshBox(o)
        if (box.isEmpty()) return
        // Most meshes are unnamed, so label them by where they are: the layer,
        // the shape and the box centre are enough to find the line in a layout.
        let layer = '?'
        o.traverseAncestors((x) => {
          if (x.name.startsWith('layer:')) layer = x.name.slice(6)
        })
        const c = box.getCenter(new THREE.Vector3()).toArray().map((n) => +n.toFixed(2))
        const kind = (o.geometry?.type ?? 'mesh').replace('Geometry', '')
        boxes.push({ id: o.name || `${layer}:${kind}@${c.join(',')}`, box, node: o })
      })
    }
    const nested = (a: THREE.Object3D, b: THREE.Object3D) => {
      let hit = false
      a.traverseAncestors((x) => {
        if (x === b) hit = true
      })
      b.traverseAncestors((x) => {
        if (x === a) hit = true
      })
      return hit
    }
    const out: Array<{ a: string; b: string; depth: number[]; contained: boolean }> = []
    const sa = new THREE.Vector3()
    const sb = new THREE.Vector3()
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const A = boxes[i].box
        const B = boxes[j].box
        if (!A.intersectsBox(B) || nested(boxes[i].node, boxes[j].node)) continue
        A.getSize(sa)
        B.getSize(sb)
        const depth = (['x', 'y', 'z'] as const).map((k) => {
          const d = Math.min(A.max[k], B.max[k]) - Math.max(A.min[k], B.min[k])
          return d / Math.max(Math.min(sa[k], sb[k]), 1e-6)
        })
        if (depth.some((d) => d <= slack)) continue
        out.push({
          a: boxes[i].id,
          b: boxes[j].id,
          depth: depth.map((d) => +d.toFixed(2)),
          contained: A.containsBox(B) || B.containsBox(A),
        })
      }
    return out
  }

  /** Every scene layer's current visibility and scale — for auditing transitions. */
  ;(window as unknown as Record<string, unknown>).__layers = () => {
    const rows: Array<{ id: string; visible: boolean; scale: number }> = []
    state.scene.traverse((o) => {
      if (!o.name.startsWith('layer:')) return
      rows.push({ id: o.name.slice(6), visible: o.visible, scale: +o.scale.x.toFixed(3) })
    })
    return rows.filter((r) => r.visible)
  }

  /**
   * Per-frame recording of everything that moves, for finding a jump.
   *
   * A jump is by definition a one-frame event, and every other probe here
   * samples over a browser round-trip — tens of frames — so a discontinuity is
   * averaged into invisibility before it can be read. This records on the
   * render loop itself and hands the whole trace back afterwards, so the frame
   * the jump happened on is still in it.
   */
  ;(window as unknown as Record<string, unknown>).__trace = (ms = 2000) => {
    const cam = state.camera as THREE.PerspectiveCamera
    const rows: Array<Record<string, number>> = []
    const layers: THREE.Object3D[] = []
    state.scene.traverse((o) => {
      if (o.name.startsWith('layer:')) layers.push(o)
    })
    /* Walks only what is actually being drawn, refusing to descend into a
       hidden subtree. Both halves matter: summing emissive over the whole scene
       would be nineteen chapters of noise around the one being measured, and
       descending into them every frame would cost more than the thing being
       looked for. */
    const shownWalk = (o: THREE.Object3D, out: { lit: number; meshes: number }) => {
      if (!o.visible) return
      const m = o as THREE.Mesh
      if (m.isMesh) {
        out.meshes++
        const mats = Array.isArray(m.material) ? m.material : [m.material]
        for (const mat of mats) {
          const std = mat as THREE.MeshStandardMaterial
          if (std?.emissive) out.lit += std.emissiveIntensity ?? 0
        }
      }
      for (const child of o.children) shownWalk(child, out)
    }

    let stop = false
    const sample = () => {
      if (stop) return
      const seen = { lit: 0, meshes: 0 }
      shownWalk(state.scene, seen)
      const row: Record<string, number> = {
        t: +state.clock.elapsedTime.toFixed(4),
        camX: cam.position.x,
        camY: cam.position.y,
        camZ: cam.position.z,
        fov: cam.fov,
        explode: driver.explode,
        focusStrength: driver.focusStrength,
        deck: deck.current,
        shift: moveProgress(state.clock.elapsedTime),
        lit: +seen.lit.toFixed(3),
        meshes: seen.meshes,
        // Which chapter is drawing, as a number. `lit` steps legitimately when
        // the scene cuts — a different chapter is simply a different set of
        // lights — so any analysis of it has to drop the frames that span a
        // cut, or it reports the cut as a pop on every single boundary.
        scene: SCENE_INDEX.indexOf(driver.scene),
      }
      for (const l of layers) row[l.name.slice(6)] = l.visible ? l.scale.x : 0
      rows.push(row)
      requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
    return new Promise((resolve) => {
      setTimeout(() => {
        stop = true
        resolve(rows)
      }, ms)
    })
  }

  /**
   * How much per-frame scene work is being done, and how much is being skipped
   * because its chapter is off screen. Sampled over `ms`.
   */
  ;(window as unknown as Record<string, unknown>).__frameload = (ms = 1000) => {
    const from = { ...work }
    return new Promise((resolve) => {
      setTimeout(() => {
        const ran = work.ran - from.ran
        const skipped = work.skipped - from.skipped
        resolve({ ran, skipped, skippedShare: +(skipped / (ran + skipped)).toFixed(3) })
      }, ms)
    })
  }

  /** Every registered part id. */
  ;(window as unknown as Record<string, unknown>).__parts = () => [...partRegistry.keys()]

  /**
   * Whether a part is genuinely on screen.
   *
   * The same test the hover system uses, exposed so a beat can be checked for
   * the failure that is easiest to ship and hardest to notice: `isolate` hiding
   * something the copy or a callout is pointing at. A beat about moving data
   * from storage to memory that has hidden both is not a subtle bug, but it is
   * invisible to a typecheck and to any measurement of the *focused* part.
   */
  ;(window as unknown as Record<string, unknown>).__visible = (partId: string) => {
    const part = partRegistry.get(partId)
    if (!part || !part.visible) return false
    let ok = true
    part.traverseAncestors((a) => {
      if (!a.visible) ok = false
    })
    if (!ok) return false
    return part.getWorldScale(new THREE.Vector3()).x > 0.5
  }

  /** Reads a named part's current emissive level, for verifying animations. */
  ;(window as unknown as Record<string, unknown>).__emissive = (partId: string) => {
    const part = partRegistry.get(partId)
    if (!part) return null
    let value: number | null = null
    part.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh || value !== null) return
      const mat = m.material as THREE.MeshStandardMaterial
      if (mat?.emissiveIntensity !== undefined) value = mat.emissiveIntensity
    })
    return value
  }
  /** Every emissive level under a part, for checking signal wiring. */
  ;(window as unknown as Record<string, unknown>).__signals = (partId: string) => {
    const part = partRegistry.get(partId)
    if (!part) return null
    const out: Array<{ geo: string; e: number }> = []
    part.traverse((o) => {
      const m = o as THREE.Mesh
      const mat = m.material as THREE.MeshStandardMaterial
      if (m.isMesh && mat?.emissive) {
        out.push({ geo: m.geometry.type, e: +(mat.emissiveIntensity ?? 0).toFixed(2) })
      }
    })
    return out
  }
  /** Lists the widest meshes in the scene — for tracking down bbox outliers. */
  ;(window as unknown as Record<string, unknown>).__widest = () => {
    const rows: Array<{ name: string; geo: string; w: number; visible: boolean }> = []
    state.scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const b = new THREE.Box3().setFromObject(m)
      const s = b.getSize(new THREE.Vector3())
      let vis = true
      o.traverseAncestors((a) => {
        if (!a.visible) vis = false
      })
      rows.push({
        name: m.name || m.parent?.name || '(anon)',
        geo: m.geometry?.type ?? '?',
        w: +Math.max(s.x, s.z).toFixed(2),
        visible: vis && m.visible,
      })
    })
    return rows.sort((a, b) => b.w - a.w).slice(0, 8)
  }
  return null
}

/** Stable ordering of the scene ids, so a trace can record which one is up. */
const SCENE_INDEX: SceneId[] = [
  'cpu', 'mosfet', 'gates', 'adder', 'fabric', 'board', 'cell', 'ladder', 'pipeline',
  'fab', 'kernel', 'boot', 'code', 'phone', 'edge', 'car', 'robot', 'datacenter',
  'extremes', 'implant',
]

const UP = new THREE.Vector3(0, 1, 0)
const FALLBACK_RIGHT = new THREE.Vector3(1, 0, 0)

function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const target = useRef(new THREE.Vector3(0, 0.2, 0))
  const aimed = useRef(new THREE.Vector3())
  const dolly = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const view = useRef(new THREE.Vector3())
  const lift = useRef(new THREE.Vector3())
  const lastStep = useRef(deck.to)

  useFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)

    /* Stepping to another beat springs the reader's orbit back to the authored
       angle. Each beat's camera was composed from a specific direction, so
       carrying a swing into the next one lands the reader looking at the side
       of something the copy describes head-on. */
    if (deck.to !== lastStep.current) {
      lastStep.current = deck.to
      resetOrbit()
    }

    // Snappy while the reader is actually dragging, slower on the spring back
    // so the return reads as the scene settling rather than as a snap.
    const lambda = orbit.dragging ? 20 : 6
    orbit.yaw = damp(orbit.yaw, orbit.toYaw, lambda, dt)
    orbit.pitch = damp(orbit.pitch, orbit.toPitch, lambda, dt)
    orbit.zoom = damp(orbit.zoom, orbit.toZoom, 8, dt)

    /* Compose the model into the right-hand two thirds, clear of the copy.
       Aiming the camera left of the model shifts it right on screen. The offset
       is proportional to camera distance so the *screen-space* shift is the same
       whether we are 9 units out on the wide shot or 2.5 units out on a
       close-up — a fixed world offset would fling the model out of frame when
       the camera pushes in. */
    /* Distance to what the camera is LOOKING AT, not to the world origin.
       Once scenes stopped all sitting at the origin (the ripple chain lives at
       z = 9), |position| stopped being a proxy for subject distance and the
       offset over-shot badly — it swung the chain off the side of the frame. */
    /* Compose the subject into whichever region the layout has left for it.
       On wide screens the copy floats over the left third, so the model is
       pushed right. On compact screens the copy takes a sheet across the
       bottom, so the model is pushed *up* into its band instead — aiming below
       the subject raises it on screen. Both offsets are proportional to camera
       distance, so the shift is the same fraction of the frame whether the
       camera is nine units out or two. */
    const dist = d.position.distanceTo(d.target)
    /* Deliberately NOT scaled by how wide the copy column is.
       Tried that: at 1133 px the card reaches 48% across rather than 39%, so
       pushing the model further right looked like the fix. It moved eight
       callout collisions off the card and created ten new ones against the
       chapter rail on the other side. The free band between card and rail is
       only ~480 px there, and no amount of sliding makes a model fit a band
       narrower than it is. The callouts avoid the chrome instead. */
    const aimOffset = layout.compact ? 0 : -0.13 * dist

    /* Aspect compensation. `fov` is vertical, so a portrait viewport shows a
       much narrower slice of the world and crops the package off both edges.
       Beat cameras are authored against REFERENCE_ASPECT; anything narrower
       gets pushed back. The square root is deliberate — compensating the full
       ratio would fit the width perfectly but leave the subject tiny. */
    const REFERENCE_ASPECT = 1.7
    const fit = THREE.MathUtils.clamp(
      Math.sqrt(REFERENCE_ASPECT / Math.max(camera.aspect, 0.2)),
      1,
      2,
    )
    /* Half the visible height at the subject's distance — the world distance
       that one full NDC unit of vertical screen space corresponds to. */
    const halfHeight = dist * fit * Math.tan((d.fov * Math.PI) / 360)

    /* Aspect compensation pushes the camera back ALONG ITS VIEW VECTOR, not
       outward from the origin — scaling the raw position would drag the camera
       sideways for any scene that is not centred at 0,0,0. The reader's zoom
       rides on the same vector for the same reason. */
    dolly.current.subVectors(d.position, d.target).multiplyScalar(fit * orbit.zoom)

    /* The reader's orbit is applied to that view vector rather than to the
       camera's world position, so it rotates around whatever this beat is
       looking at instead of around the scene origin. Yaw is about world up;
       pitch is about the horizontal axis perpendicular to the current view,
       which keeps the horizon level at every yaw. */
    dolly.current.applyAxisAngle(UP, orbit.yaw)
    right.current.crossVectors(UP, dolly.current)
    // Degenerate exactly overhead, where "perpendicular and horizontal" has no
    // unique answer. Any horizontal axis will do.
    if (right.current.lengthSq() < 1e-8) right.current.copy(FALLBACK_RIGHT)
    else right.current.normalize()
    dolly.current.applyAxisAngle(right.current, orbit.pitch)

    dolly.current.add(d.target)

    /* Lift the subject into its band by translating the whole frustum, not by
       aiming below it.

       Tilting the camera is only a screen translation for small angles, and it
       was quietly wrong here: a 0.54 NDC lift arrived as roughly 0.25, leaving
       the model low in its band with a fifth of a phone screen dead above it.
       Moving the eye and the look-at point together by the same vector is exact
       at any magnitude. The horizontal offset stays a tilt because 13% is small
       enough for the approximation to hold, and because it wants to feel like a
       glance rather than a pan. */
    lift.current.set(0, 0, 0)
    if (layout.bandCentre !== 0) {
      // Camera-local up: perpendicular to the view direction, in the plane
      // containing world up.
      view.current.subVectors(dolly.current, d.target).normalize()
      right.current.crossVectors(UP, view.current)
      if (right.current.lengthSq() < 1e-8) right.current.copy(FALLBACK_RIGHT)
      else right.current.normalize()
      lift.current
        .crossVectors(view.current, right.current)
        .normalize()
        .multiplyScalar(-layout.bandCentre * halfHeight)
      dolly.current.add(lift.current)
    }

    // Tighter than it was under scrolling. The step tween already owns the
    // pacing of the move, so a slow damp here would only add lag on top of it.
    damp3(camera.position, dolly.current, 9, dt)
    damp3(target.current, d.target, 9, dt)
    aimed.current.copy(target.current).add(lift.current)
    aimed.current.x += aimOffset
    camera.lookAt(aimed.current)

    const fov = damp(camera.fov, d.fov, 9, dt)
    if (Math.abs(fov - camera.fov) > 0.001) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}

function Lighting() {
  return (
    <>
      {/* Sky and ground rather than a flat ambient. A flat ambient lifts every
          face by the same amount, which is exactly what makes a box look like a
          cut-out; a hemisphere lifts the tops more than the undersides, so even
          the shadow side of a part still says which way is up. */}
      <hemisphereLight args={['#33496e', '#06070b', 0.42]} />
      <directionalLight
        position={[6, 9, 5]}
        intensity={2.6}
        color="#fff3e4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-radius={3}
      />
      {/* Cyan rim from behind separates the metal lid from the black ground. */}
      <directionalLight position={[-7, 3, -6]} intensity={1.1} color="#4ac8ff" />
      {/* A second, warm kicker low on the other side. With one rim every part
          had one lit edge and one that dissolved into the void; two opposed
          colours give the silhouette both edges and the palette's two poles,
          the same cyan and amber the signals use. */}
      <directionalLight position={[7, 1.5, -5]} intensity={0.55} color="#ff9d5c" />

      {/* No interior fill light here. A point light inside the package leaked
          through the gaps between layers as the stack separated, producing a
          blown-out core that bloom then amplified. The die's own emissive
          materials provide that warmth instead. */}

      {/* Procedural environment map. Deliberately not `preset="city"` — drei's
          presets fetch an HDRI from a CDN at runtime, which adds a network
          dependency and a visible pop-in on first paint.

          Lit like a product studio: one big overhead softbox for the broad
          sheen, two tall strip lights either side for the line of light that
          runs along every bevelled edge, and a ring behind the subject, which
          is what puts the round highlight into polished metal. Composed for
          CONTRAST, not even coverage — a metal surface shows you the
          environment, and a uniform one renders nickel as a flat grey slab. */}
      <Environment resolution={512}>
        {/* Overhead softbox. */}
        <Lightformer form="rect" intensity={0.9} position={[0, 7, 0]} scale={[9, 6, 1]} rotation={[Math.PI / 2, 0, 0]} color="#f4f6fa" />
        {/* Key streak, directly overhead and narrow. */}
        <Lightformer form="rect" intensity={6} position={[1, 6, 1]} scale={[10, 0.9, 1]} rotation={[-Math.PI / 2, 0, 0]} color="#ffffff" />
        {/* Strip lights, left and right, for the edge lines. */}
        <Lightformer form="rect" intensity={3.2} position={[-7, 2, 1]} scale={[0.6, 9, 1]} rotation={[0, Math.PI / 2, 0]} color="#d6ecff" />
        <Lightformer form="rect" intensity={2.4} position={[7, 2, -1]} scale={[0.6, 9, 1]} rotation={[0, -Math.PI / 2, 0]} color="#ffe6cc" />
        {/* The ring. */}
        <Lightformer form="ring" intensity={3} position={[0, 3, -9]} scale={4} color="#7fd8ff" />
        {/* Low warm bounce so the shadow side is not dead black. */}
        <Lightformer form="rect" intensity={1.1} position={[5, -1, 3]} scale={[6, 3, 1]} color="#ffa268" />
        {/* Broad, dim front fill. Lifts the metal off black overall without
            killing the streaks above — the narrow sources still dominate the
            specular, this only sets the floor. */}
        <Lightformer form="rect" intensity={0.35} position={[0, 2, 10]} scale={[18, 12, 1]} color="#8a9bb4" />
      </Environment>
    </>
  )
}

/**
 * The void, given a horizon.
 *
 * A flat black background put every subject on nothing at all, and nothing has
 * no depth: there was no way to tell whether the package was a metre away or
 * ten. A faint horizon band — a little lighter and a little bluer at eye level,
 * falling to near-black above and below — gives the frame a floor and a sky
 * without drawing either, and it stays dark enough that the copy card still
 * sits on black. Painted into an equirectangular texture and set as the scene
 * background, so it is not a mesh: nothing raycasts it, no bounding box or
 * framing probe counts it, and it costs one full-screen texture fetch.
 */
function Backdrop() {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 512)
    g.addColorStop(0, '#030409')
    g.addColorStop(0.36, '#060a13')
    g.addColorStop(0.5, '#0d1626')
    g.addColorStop(0.56, '#08101c')
    g.addColorStop(0.72, '#040609')
    g.addColorStop(1, '#020304')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 16, 512)
    const tex = new THREE.CanvasTexture(canvas)
    tex.mapping = THREE.EquirectangularReflectionMapping
    tex.colorSpace = THREE.SRGBColorSpace
    const before = scene.background
    scene.background = tex
    return () => {
      scene.background = before
      tex.dispose()
    }
  }, [scene])
  return null
}

/**
 * Where each subject in the new look rests, for the contact shadow under it.
 *
 * `y` is the underside of the lowest part at explode 0, and `drop` is how far
 * that part falls at explode 1 — the socket leaves by 1.7 as the package comes
 * apart, and a floor it fell through would draw its shadow on top of it.
 * Lectures join this table as they are brought up to the Lecture 1 look.
 */
const GROUNDS: Partial<Record<SceneId, { y: number; drop: number; x: number; z: number; w: number; d: number }>> = {
  cpu: { y: -0.41, drop: 1.7, x: 0, z: 0, w: 11, d: 11 },
  mosfet: { y: -0.91, drop: 0, x: 0, z: 0, w: 11, d: 8 },
  gates: { y: -0.125, drop: 0, x: 0, z: 0, w: 20, d: 6 },
  adder: { y: -0.125, drop: 0, x: 0, z: 3.4, w: 22, d: 18 },
  fabric: { y: -0.125, drop: 0, x: 0, z: 0, w: 10, d: 10 },
  cell: { y: -0.12, drop: 0, x: 0, z: 0, w: 9, d: 7 },
  // The ladder has no board: its blocks stand on y = 0 along the axis, and the
  // second core comes in from +z on the unified beat.
  ladder: { y: 0, drop: 0, x: -0.2, z: 0.3, w: 7, d: 4 },
  // The bench reaches back under the clock, so its middle sits behind the stages.
  pipeline: { y: -0.12, drop: 0, x: 0, z: -0.275, w: 9.5, d: 5 },
  // Under the wafer's chuck, which is the lowest thing in the lecture.
  fab: { y: -0.195, drop: 0, x: 0, z: 0, w: 7, d: 7 },
  // Under the battery, which hangs 1.15 below the board and leaves by 2.3 as
  // the machine comes apart. Shared by Lectures 5 and 6, which use one board.
  board: { y: -1.4, drop: 2.3, x: -0.2, z: 0.1, w: 10, d: 7 },
  // Under the boot bench, which runs forward of the stages to carry the rail.
  boot: { y: -0.12, drop: 0, x: 0, z: 0.1, w: 9.4, d: 4.6 },
  // Under the round bench the kernel and its programs stand on (Lectures 8 and 9).
  kernel: { y: -0.12, drop: 0, x: 0, z: 0, w: 9.2, d: 9.2 },
  // Under the plinth the code rack stands on (Lecture 10).
  code: { y: -0.67, drop: 0, x: 0, z: 0.05, w: 7.5, d: 3.2 },
}

/**
 * A soft contact shadow under whichever of those subjects is on screen.
 *
 * The floor was cut because a lit ground plane caught the key light's shadow
 * as a hard-edged parallelogram and fought the copy. This is not a floor: it is
 * a transparent plane that draws only a blurred shadow, darkest where the model
 * is closest to it, so the subject is anchored to *something* without a
 * surface appearing. One instance, moved to the current scene, rather than one
 * per scene — each re-renders the depth of the scene every frame.
 *
 * Sized through its own `scale`, never by scaling a group around it. three
 * leaves scale out of every camera's view matrix, so a scaled group stretched
 * the shadow's plane but not the camera that draws it: the camera saw a 1 x 1
 * patch in the middle of the subject and the plane spread that patch over the
 * whole footprint. Under a wafer it was one flat dark rectangle filling the
 * frame behind it; under the benches it was the same rectangle, hidden by the
 * bench; under the ladder the patch fell between blocks and there was no
 * shadow at all.
 */
function Ground() {
  const group = useRef<THREE.Group>(null!)
  const drop = useRef(0)
  const [id, setId] = useState<SceneId | null>(null)
  useFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const g = GROUNDS[d.scene]
    // Re-rendered only when the subject changes, which is once per chapter.
    const next = g ? d.scene : null
    if (next !== id) setId(next)
    if (!g) {
      group.current.visible = false
      return
    }
    // Damped like Part damps explode, so the shadow falls with the socket.
    drop.current = damp(drop.current, Math.min(d.explode, 1), 9, dt)
    group.current.visible = true
    group.current.position.set(g.x, g.y - g.drop * drop.current - 0.01, g.z)
  })
  const size = id ? GROUND_SIZE[id] : undefined
  return (
    <group ref={group} visible={false}>
      {/* Order matters: frame callbacks of equal priority run in the order
          they subscribed, and siblings subscribe in order — so these three run
          as on, shadow, off, every frame. They mount and remount together,
          keyed by the scene: a shadow rebuilt for a new footprint on its own
          would subscribe after both switches and run with auto-clear off. */}
      {id && size && (
        <group key={id}>
          <AutoClear on />
          <ContactShadows scale={size} resolution={256} opacity={0.75} blur={2.2} far={3.2} color="#000208" frames={Infinity} />
          <AutoClear on={false} />
        </group>
      )}
    </group>
  )
}

/** Each footprint as one stable array, so the shadow rebuilds only when the scene changes. */
const GROUND_SIZE = Object.fromEntries(
  Object.entries(GROUNDS).map(([id, g]) => [id, [g.w, g.d] as [number, number]]),
) as Partial<Record<SceneId, [number, number]>>

/**
 * Turns the renderer's auto-clear on for the contact shadow's own passes, and
 * back off for everything after.
 *
 * The postprocessing EffectComposer switches `autoClear` off on the renderer,
 * as it clears its own buffers. ContactShadows assumes it is on: it renders
 * the scene's depth and two blur passes into render targets it never clears
 * itself. With it off, each frame's shadow was drawn on top of every earlier
 * one and then blurred again, so over a few seconds the shadow spread to fill
 * its whole plane — a dark rectangle hanging in the void wherever a subject
 * did not cover it, and on a subject that moved, a smear of everywhere it had
 * been. Measured on the memory ladder, which has no board to hide it:
 * `gl.autoClear` read false, and turning it on for these passes removed the
 * rectangle and left only the shadow under the blocks.
 */
const autoClearWas = { value: false }

function AutoClear({ on }: { on: boolean }) {
  const gl = useThree((s) => s.gl)
  useFrame(() => {
    if (on) {
      autoClearWas.value = gl.autoClear
      gl.autoClear = true
    } else {
      gl.autoClear = autoClearWas.value
    }
  })
  return null
}

/** Slow drifting motes. Cheap depth cue for an otherwise empty black void. */
function Dust() {
  const points = useRef<THREE.Points>(null!)
  const geometry = useMemo(() => {
    const count = 320
    const pos = new Float32Array(count * 3)
    // Deterministic scatter — a fixed seed keeps the look identical between
    // reloads, which matters when art-directing camera framing.
    let seed = 7
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 26
      pos[i * 3 + 1] = (rand() - 0.5) * 14
      pos[i * 3 + 2] = (rand() - 0.5) * 26
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  useFrame((state) => {
    points.current.rotation.y = state.clock.elapsedTime * 0.012
  })

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial size={0.035} color="#6f8ba8" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}
