import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { lectures } from '../content/lectures'
import { stepsFor, useDeck } from '../deck/deck'
import { partRegistry } from './registry'
import { layout } from '../ui/layout'
import type { Label } from '../content/types'

/**
 * Callouts naming the part under the camera.
 *
 * Which labels exist is discrete state (it changes once per beat), so it comes
 * from React. Where each one sits is continuous, so it is written to the object
 * transform in `useFrame` instead of through state.
 */
export function Annotations() {
  const lecture = useDeck((s) => s.lecture)
  const shown = useDeck((s) => s.shown)
  const step = stepsFor(lecture)[shown]
  const beat = step
    ? lectures[lecture]?.chapters[step.chapter]?.beats[step.beat]
    : undefined
  const labels = beat?.labels ?? []

  return (
    <>
      {labels.map((label) => (
        // Keyed by beat too, so moving between beats remounts the callout and
        // replays its fade-in rather than sliding the old one across.
        <Annotation key={`${beat?.id}:${label.text}`} label={label} />
      ))}
    </>
  )
}

const world = new THREE.Vector3()
const probe = new THREE.Vector3()

/**
 * Where the chrome is, in normalised device coordinates.
 *
 * The copy column reaches `layout.copyRight` across the frame and the chapter
 * rail hugs the right edge. Both are fixed to the viewport, so both are
 * expressible in NDC and a callout can be asked to stay out of them.
 */
const RAIL_NDC = 0.76
const MARGIN = 0.02

/**
 * One callout, placed on whichever side of its part is actually free.
 *
 * Offsets are authored against a wide desktop window. The copy column is a
 * fixed 480 px, so its *share* of the frame grows as the window narrows — 39%
 * at 1440 px but 48% at 1133 px, which is an iPad Mini in landscape — and
 * callouts authored to sit left of their part started landing on the copy.
 *
 * Sliding the whole model right was tried and is worse: it moves the collisions
 * into the chapter rail on the other side, because the free band between the
 * two is narrower than the model. So the label moves instead of the machine. If
 * the authored side is obstructed and mirroring it about the part is clear, the
 * callout flips; if neither side is clear it stays where the author put it,
 * because a callout that jumps around every frame is worse than one that
 * overlaps.
 */
function Annotation({ label }: { label: Label }) {
  const group = useRef<THREE.Group>(null!)
  const chip = useRef<HTMLSpanElement>(null)
  const offset = useRef(new THREE.Vector3(...(label.offset ?? [0, 0, 0]))).current
  const camera = useThree((s) => s.camera)

  useFrame(() => {
    const part = partRegistry.get(label.part)
    if (!part) return
    part.getWorldPosition(world)

    // Hide the callout when its part has been scaled away by isolation.
    const visible = part.visible && part.scale.x > 0.5
    if (group.current.visible !== visible) group.current.visible = visible
    if (!visible) return

    /* Measured from the rendered label, not assumed.
       A projected anchor is a point and a callout is a box, so a label centred
       just clear of the copy still overlaps it by half its own width — which is
       how "Bit lines" ended up on the card after being flipped away from the
       rail. Reading the span's width makes the test about the thing that
       actually collides. */
    const halfWidth = chip.current ? chip.current.offsetWidth / window.innerWidth : 0.08
    const halfHeight = chip.current ? chip.current.offsetHeight / window.innerHeight : 0.03

    /* Vertical bounds matter on the compact layout, where the model is pushed
       into a band across the top and a callout anchored *above* its part runs
       straight off the screen — which is how "Heat pipe" ended up 78 px above
       the viewport on an iPad in portrait. The band's floor is
       `1 - 2 * MODEL_BAND` in NDC, since bandCentre is `1 - MODEL_BAND`. */
    const floor = layout.compact ? layout.bandCentre * 2 - 1 : -1
    const obstructed = (x: number, y: number) => {
      const left = layout.compact ? -1 : layout.copyRight * 2 - 1
      /* The chapter rail only exists on the wide layout; on a phone it is the
         strip across the top instead. Treating the rail's column as blocked
         there flipped every right-hand callout onto the far side of its part —
         "Fast, and wrong" ended up under the slow grid it contrasts with. */
      const right = layout.compact ? 1 - MARGIN : RAIL_NDC
      return (
        x - halfWidth < left + MARGIN ||
        x + halfWidth > right ||
        y + halfHeight > 1 - MARGIN ||
        y - halfHeight < floor + MARGIN
      )
    }

    probe.copy(world).add(offset).project(camera)
    if (obstructed(probe.x, probe.y)) {
      // Mirror about the part and take it only if that side is genuinely free.
      probe.copy(world).addScaledVector(offset, -1).project(camera)
      if (!obstructed(probe.x, probe.y)) {
        group.current.position.copy(world).addScaledVector(offset, -1)
        return
      }
    }
    group.current.position.copy(world).add(offset)
  })

  return (
    <group ref={group}>
      <Html
        center
        // Labels are decoration over a scrolling page; they must never eat
        // wheel events or block the copy beneath them.
        style={{ pointerEvents: 'none' }}
        zIndexRange={[8, 0]}
      >
        <span ref={chip} className="anno" data-tone={label.tone ?? 'plain'}>
          <i className="anno__dot" />
          {label.text}
        </span>
      </Html>
    </group>
  )
}
