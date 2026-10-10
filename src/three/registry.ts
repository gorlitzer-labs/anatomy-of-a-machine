import type * as THREE from 'three'

/**
 * Live handles to every mounted Part, keyed by id.
 *
 * Annotations anchor to a part rather than to a hard-coded coordinate, so a
 * label stays attached to its geometry as the explosion moves it. Authoring
 * label positions as fixed world coordinates would require re-deriving them by
 * hand every time an explode offset changed.
 */
export const partRegistry = new Map<string, THREE.Group>()
