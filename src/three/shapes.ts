import * as THREE from 'three'
import type { GateKind } from './signal'

/**
 * The standard logic-gate silhouettes, as extrudable 2D profiles.
 *
 * Drawn as real shapes rather than labelled boxes because the outline *is* the
 * notation — a flat-backed D is an AND, a curved shield is an OR, and anyone
 * who has seen a circuit diagram reads them without a legend.
 *
 * Profiles are in the XY plane; the scene rotates them flat so they lie on the
 * board like traces, matching the top-down language of the earlier chapters.
 */
export function gateShape(kind: GateKind): THREE.Shape {
  const s = new THREE.Shape()

  if (kind === 'not') {
    // Triangle. The inverting bubble is separate geometry.
    s.moveTo(-0.7, -0.72)
    s.lineTo(0.62, 0)
    s.lineTo(-0.7, 0.72)
    s.closePath()
    return s
  }

  if (kind === 'and') {
    // Flat back, straight sides, semicircular nose.
    s.moveTo(-0.78, -0.72)
    s.lineTo(0, -0.72)
    s.absarc(0, 0, 0.72, -Math.PI / 2, Math.PI / 2, false)
    s.lineTo(-0.78, 0.72)
    s.closePath()
    return s
  }

  // OR and XOR share a body: concave back, sides sweeping to a point.
  s.moveTo(-0.78, -0.72)
  s.quadraticCurveTo(0.18, -0.6, 0.95, 0)
  s.quadraticCurveTo(0.18, 0.6, -0.78, 0.72)
  s.quadraticCurveTo(-0.4, 0, -0.78, -0.72)
  s.closePath()
  return s
}

/** The extra back-arc that distinguishes XOR from OR. */
export function xorArcShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-1.02, -0.72)
  s.quadraticCurveTo(-0.64, 0, -1.02, 0.72)
  s.quadraticCurveTo(-0.86, 0, -1.02, -0.72)
  s.closePath()
  return s
}

export const EXTRUDE = { depth: 0.16, bevelEnabled: false, curveSegments: 24 }

/**
 * A gate body, extruded with a rounded bevel on its top and bottom edges.
 *
 * Same outline and same 0..0.16 thickness as `EXTRUDE`: the bevel is inset
 * (`bevelOffset` cancels `bevelSize`) and the solid is shifted up by the bevel
 * thickness, so every wire that was authored to end on the body's edge still
 * ends on it. A hard-edged extrusion has no highlight on its rim, so the
 * outline — which *is* the notation — was carried only by its colour against
 * the tile; a bevel draws it again in light.
 */
export function bevelledGate(shape: THREE.Shape, bevel = 0.03) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: EXTRUDE.depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: 4,
    curveSegments: 40,
  })
  g.translate(0, 0, bevel)
  return g
}
