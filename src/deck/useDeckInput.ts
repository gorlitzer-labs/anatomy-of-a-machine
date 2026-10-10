import { useEffect } from 'react'
import { useDeck } from './deck'
import { useNarration } from './narration'
import { dragOrbit, orbit, zoomOrbit } from '../three/orbit'
import { clearHover, tapped } from '../three/hover'
import { useNote } from '../ui/richLayout'

/**
 * Every way of moving through the deck.
 *
 * Stepping is deliberate only: arrow keys, space, Home/End, and the on-screen
 * buttons. Nothing continuous advances a beat.
 *
 * Wheel-to-step was tried and removed. A mouse wheel emits discrete notches, but
 * a trackpad emits a long decaying stream of small deltas, so the same flick
 * that moves one beat on a mouse fires a queue of them on a trackpad — and no
 * threshold or cooldown fixes that, it only trades "skips five beats" for
 * "feels laggy and drops presses". A slideshow should move when you ask it to,
 * once per ask.
 *
 * So the continuous gestures drive the camera, where continuous is exactly what
 * you want:
 *
 *   arrows, space, home/end, buttons -> step through beats
 *   p                                -> play: the deck advances on its own
 *   c                                -> flip a comparison beat's two states
 *   drag, one-finger touch           -> orbit
 *   wheel, pinch, +/-                -> zoom
 *   escape                           -> back to the syllabus
 */

/** Pointer travel before a press becomes a drag rather than a click. */
const DRAG_SLOP = 5

export function useDeckInput(stage: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = stage.current
    if (!el) return

    /* ---------- keyboard ---------- */

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      // A modal owns the keyboard: the sources list is read with the arrow
      // keys, and stepping the deck behind it would be invisible.
      if (document.querySelector('dialog[open]')) return

      const { view, go, jump, exit, variant, setVariant } = useDeck.getState()
      if (view !== 'lecture') return

      /* The comparison toggle, for readers who have a keyboard. The on-screen
         buttons are the primary control — most of this course is read on a
         tablet — but stepping and comparing are the two things a reader does
         repeatedly, and only one of them was reachable from the keys. */
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault()
        setVariant(variant === 'a' ? 'b' : 'a')
        return
      }

      /* Play, on its own letter rather than on space. Space already steps, and
         it is the key a reader hits when they want the deck to stop moving —
         binding it to "start moving on your own" would be exactly backwards. */
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        useNarration.getState().toggle()
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        // Escape backs out one level at a time: an open definition or source
        // first, the lecture only once nothing is open over it.
        if (useNote.getState().note) useNote.getState().hide(true)
        else exit()
        return
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomOrbit(0.88)
        return
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        zoomOrbit(1.14)
        return
      }

      const forward = ['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)
      const back = ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)
      if (!forward && !back && e.key !== 'Home' && e.key !== 'End') return

      // These would otherwise scroll the document, which no longer has anywhere
      // to scroll to but still moves the sticky layer on some browsers.
      e.preventDefault()
      if (e.key === 'Home') jump(0)
      else if (e.key === 'End') jump(Number.MAX_SAFE_INTEGER)
      else go(forward ? 1 : -1)
    }

    /* ---------- wheel: zoom only ---------- */

    const onWheel = (e: WheelEvent) => {
      if (useDeck.getState().view !== 'lecture') return
      // Claimed rather than ignored. Letting it through would scroll the page
      // behind a fixed layer that has nowhere to go, so the gesture would feel
      // broken instead of merely doing something else.
      e.preventDefault()
      // Trackpad pinch arrives as ctrl+wheel; both mean the same thing here.
      const step = e.ctrlKey ? 0.02 : 0.012
      zoomOrbit(1 + Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) * step, 0.14))
    }

    /* ---------- pointer drag: orbit ---------- */

    let id: number | null = null
    let lastX = 0
    let lastY = 0
    let travel = 0

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return // touch is handled below
      if (e.button !== 0) return
      id = e.pointerId
      lastX = e.clientX
      lastY = e.clientY
      travel = 0
      el.setPointerCapture(e.pointerId)
    }

    const onMove = (e: PointerEvent) => {
      if (id !== e.pointerId) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      travel += Math.abs(dx) + Math.abs(dy)
      // Below the slop threshold this is still a click, and rotating the model
      // by two pixels under a reader's cursor would make hovering a part feel
      // unstable.
      if (travel < DRAG_SLOP) return
      orbit.dragging = true
      dragOrbit(dx, dy)
    }

    const onUp = (e: PointerEvent) => {
      if (id !== e.pointerId) return
      id = null
      orbit.dragging = false
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    }

    /* ---------- touch ---------- */

    let pinchStart = 0

    const dist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)

    let touchStartAt = 0
    let touchMoved = 0

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchStart = dist(e.touches)
        return
      }
      lastX = e.touches[0].clientX
      lastY = e.touches[0].clientY
      touchStartAt = e.timeStamp
      touchMoved = 0
    }

    const onTouchMove = (e: TouchEvent) => {
      if (useDeck.getState().view !== 'lecture') return

      if (e.touches.length === 2 && pinchStart > 0) {
        const now = dist(e.touches)
        zoomOrbit(pinchStart / Math.max(now, 1))
        pinchStart = now
        e.preventDefault()
        return
      }

      /* One finger orbits on both axes. It used to orbit horizontally and
         navigate vertically, which is the touch spelling of wheel-to-step and
         had the same problem — the reader could not tell which gesture they had
         just made. Navigation is the on-screen buttons, on every device. */
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY
      touchMoved += Math.abs(x - lastX) + Math.abs(y - lastY)
      orbit.dragging = true
      dragOrbit(x - lastX, y - lastY)
      lastX = x
      lastY = y
      e.preventDefault()
    }

    const onTouchEnd = (e: TouchEvent) => {
      orbit.dragging = false
      pinchStart = 0

      /* A short, still touch is a tap. If it did not land on a part — the part
         would have stamped `tapped` a moment ago — it means "dismiss the card".
         Checked here rather than on the canvas because R3F handles its own
         events on the canvas element and this listener runs after them. */
      const quick = e.timeStamp - touchStartAt < 400 && touchMoved < DRAG_SLOP * 2
      if (quick && performance.now() - tapped.at > 250) clearHover(true)
    }

    window.addEventListener('keydown', onKey)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('keydown', onKey)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [stage])
}
