import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { hovered } from './hover'
import { marked } from './naming'
import { damp } from '../lib/math'

/**
 * A wire cage around whatever the pointer is naming.
 *
 * `Part` says "this one" by lifting its material toward white, which works
 * because a part owns its materials. Role-named geometry does not: the scenes
 * write emissive levels every frame to say what a block is *doing*, and a hover
 * that wrote to the same channel would fight the lesson for the channel that
 * carries it.
 *
 * So the highlight is a separate object that sits around the body instead of
 * changing it. One of them, reused — a highlight per element would be several
 * hundred objects, all but one of them switched off.
 *
 * Drawn without depth testing on purpose: half of what gets named in this
 * course is inside something else, and a cage that the enclosing package hides
 * is a highlight that appears not to work.
 */
export function HoverMarker() {
  const group = useRef<THREE.Group>(null!)
  const shown = useRef(0)

  const box = useMemo(() => new THREE.Box3(), [])
  const size = useMemo(() => new THREE.Vector3(), [])
  const centre = useMemo(() => new THREE.Vector3(), [])
  const matrix = useMemo(() => new THREE.Matrix4(), [])

  const geometry = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), [])

  useFrame((_, dt) => {
    const object = marked.object
    const on = Boolean(object && hovered.id)

    if (on && object) {
      /* An instanced mesh is a single object holding hundreds of bodies, so its
         bounding box is the whole array. Cage the one instance the pointer is
         actually on by composing that instance's matrix with the mesh's. */
      const instanced = object as THREE.InstancedMesh
      if (instanced.isInstancedMesh && marked.instance !== null) {
        instanced.getMatrixAt(marked.instance, matrix)
        matrix.premultiply(instanced.matrixWorld)
        const geo = instanced.geometry
        if (!geo.boundingBox) geo.computeBoundingBox()
        box.copy(geo.boundingBox!).applyMatrix4(matrix)
      } else {
        box.setFromObject(object)
      }
      if (!box.isEmpty()) {
        box.getSize(size)
        box.getCenter(centre)
        group.current.position.copy(centre)
        // A floor on each axis: a bit line is a millimetre thick, and a cage
        // drawn to its true height is a single line the reader cannot see.
        group.current.scale.set(
          Math.max(size.x, 0.06) * 1.12,
          Math.max(size.y, 0.06) * 1.12,
          Math.max(size.z, 0.06) * 1.12,
        )
      }
    }

    shown.current = damp(shown.current, on ? 1 : 0, 16, dt)
    group.current.visible = shown.current > 0.02
    const material = (group.current.children[0] as THREE.LineSegments)
      ?.material as THREE.LineBasicMaterial
    if (material) material.opacity = shown.current * 0.55
  })

  return (
    <group ref={group} visible={false}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial
          color="#8fd8f5"
          transparent
          opacity={0}
          depthTest={false}
        />
      </lineSegments>
    </group>
  )
}
