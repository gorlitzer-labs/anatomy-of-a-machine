import * as THREE from 'three'

/**
 * Sets an animated emissive level in a way that survives Part's dimming pass.
 *
 * Part caches each material's authored emissive intensity into `userData.base`
 * and recomputes `emissiveIntensity = base * (1 - dim)` every frame it is
 * dimming. Anything animating emissive must therefore write to `base` as well,
 * or the two will fight and the animation will freeze whenever a part is dimmed.
 */
export function setEmissive(mat: THREE.MeshStandardMaterial, value: number) {
  if (!mat.userData.base) {
    mat.userData.base = { color: mat.color.clone(), emissive: value }
  }
  ;(mat.userData.base as { emissive: number }).emissive = value
  mat.emissiveIntensity = value
}
