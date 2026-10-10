import { clamp } from '../lib/math'

/**
 * Reader-controlled camera offset, layered on top of the authored beat camera.
 *
 * Deliberately an *offset* rather than a free orbit controller. Every beat's
 * framing is art-directed — what is centred, how much of the model is in shot,
 * which face catches the rim light — and handing that over to OrbitControls
 * would throw all of it away the first time someone dragged. So dragging
 * rotates around whatever the current beat is already looking at, within a
 * bounded cone, and springs back when the reader moves on.
 *
 * Mouse parallax used to live here instead. It was removed rather than kept
 * alongside: both effects move the camera in response to the pointer, and
 * running them together meant the model drifted whenever the reader was merely
 * moving the mouse toward the next button.
 */
export const orbit = {
  /** Applied, damped values — read by the rig each frame. */
  yaw: 0,
  pitch: 0,
  zoom: 1,
  /** Requested values — written by input. */
  toYaw: 0,
  toPitch: 0,
  toZoom: 1,
  dragging: false,
}

/** Bounds on how far the reader can swing from the authored angle. */
const YAW_LIMIT = 0.85 // ~49°
const PITCH_LIMIT = 0.5 // ~29°
/**
 * How far in the reader may pull before the authored framing stops working.
 *
 * Was 0.55, which let five taps of `+` put the camera inside the composition.
 * What you find in there is not detail: it is the parts the beat has dimmed to
 * nothing, and the wire rails, seen at grazing angles and filling the frame as
 * flat grey slabs. On the gates scene it is worse than untidy — that chapter
 * teaches the gate *silhouette* as notation, a flat-backed D against a curved
 * shield, and a silhouette has to be seen whole to be read at all.
 *
 * Measured rather than guessed. At 0.88 the AND gate is still whole and its
 * outline still reads; by 0.774 it is cropped and the neighbours have taken
 * over the frame. 0.8 sits just inside that, so a reader can still lean in.
 *
 * Deliberately one number for every scene. The failure is not specific to the
 * gates — get close enough anywhere and you are looking at dimmed geometry that
 * was never composed to be looked at — and a per-scene floor would mean twenty
 * values tuned by eye, of which nineteen would be guesses. If a scene later
 * turns out to need real close inspection, that is the moment to make this a
 * per-scene number, with that scene as the evidence.
 */
const ZOOM_MIN = 0.8
const ZOOM_MAX = 2.1

/** Screen pixels to radians. Tuned so a comfortable drag covers the cone. */
const SENSITIVITY = 0.0055

export function dragOrbit(dx: number, dy: number) {
  orbit.toYaw = clamp(orbit.toYaw - dx * SENSITIVITY, -YAW_LIMIT, YAW_LIMIT)
  orbit.toPitch = clamp(orbit.toPitch - dy * SENSITIVITY, -PITCH_LIMIT, PITCH_LIMIT)
}

/** `factor` > 1 pushes the camera out, < 1 pulls it in. */
export function zoomOrbit(factor: number) {
  orbit.toZoom = clamp(orbit.toZoom * factor, ZOOM_MIN, ZOOM_MAX)
}

/**
 * Absolute aim, in fractions of the reader's own limits (-1..1 on each axis).
 *
 * For narration cues: the narrator turning the object slightly to show you a
 * face while she talks about it. Expressed as a fraction rather than radians so
 * a cue can never swing further than a reader could drag, and so the authored
 * framing stays the composition.
 *
 * Ignored mid-drag. A camera that yanks itself out from under a hand is worse
 * than a cue that quietly does not happen.
 */
export function aimOrbit(yawFraction: number, pitchFraction: number) {
  if (orbit.dragging) return
  orbit.toYaw = clamp(yawFraction, -1, 1) * YAW_LIMIT
  orbit.toPitch = clamp(pitchFraction, -1, 1) * PITCH_LIMIT
}

/** Absolute zoom, for the same reason and with the same deference to a drag. */
export function aimZoom(zoom: number) {
  if (orbit.dragging) return
  orbit.toZoom = clamp(zoom, ZOOM_MIN, ZOOM_MAX)
}

/**
 * Springs the view back to the authored framing.
 *
 * Called when the reader steps to another beat: the next beat's camera was
 * composed from a specific angle, so carrying a 49° swing into it would land
 * them looking at the side of something the copy describes head-on.
 */
export function resetOrbit() {
  orbit.toYaw = 0
  orbit.toPitch = 0
  orbit.toZoom = 1
}

/** True when the reader has moved the camera at all — used to show the hint. */
export function orbitTouched() {
  return Math.abs(orbit.toYaw) > 0.02 || Math.abs(orbit.toPitch) > 0.02 || Math.abs(orbit.toZoom - 1) > 0.02
}
