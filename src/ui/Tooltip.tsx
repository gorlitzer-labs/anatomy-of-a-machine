import { useEffect, useRef } from 'react'
import { clearHover, pointer, useHover } from '../three/hover'
import { useLayout } from './layout'
import { Emphasised } from './Rich'

/** Gap between cursor and card, and the margin kept from the viewport edge. */
const OFFSET = 18
const MARGIN = 12

/**
 * Names whatever the pointer is over.
 *
 * Positioned by writing a transform on an animation frame rather than through
 * React: the content changes a few times per session, but the position changes
 * on every mouse move, and those are two very different update rates that
 * should not share a render path.
 */
export function Tooltip() {
  const entry = useHover((s) => s.entry)
  const pinned = useHover((s) => s.pinned)
  const compact = useLayout((s) => s.compact)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // A pinned card is docked by CSS to the foot of the model band, so there is
    // no cursor to follow and nothing to position.
    if (!entry || pinned) return
    let raf = 0
    const loop = () => {
      const el = ref.current
      if (el) {
        const { width, height } = el.getBoundingClientRect()
        // Flip to the other side of the cursor rather than letting the card
        // slide under the viewport edge, which would put the text half
        // off-screen exactly when the reader is at the edge of the model.
        const flipX = pointer.x + OFFSET + width > window.innerWidth - MARGIN
        const flipY = pointer.y + OFFSET + height > window.innerHeight - MARGIN
        const x = flipX ? pointer.x - OFFSET - width : pointer.x + OFFSET
        const y = flipY ? pointer.y - OFFSET - height : pointer.y + OFFSET
        el.style.transform = `translate3d(${Math.max(MARGIN, x)}px, ${Math.max(MARGIN, y)}px, 0)`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [entry, pinned, compact])

  if (!entry) return null

  return (
    <div
      className="tip"
      ref={ref}
      role="tooltip"
      data-tone={entry.tone ?? 'plain'}
      data-pinned={pinned || undefined}
    >
      <p className="tip__term">{entry.term}</p>
      <p className="tip__line">
        <Emphasised text={entry.line} />
      </p>
      {entry.fact && <p className="tip__fact">{entry.fact}</p>}
      {pinned && (
        <button className="tip__close" onClick={() => clearHover(true)} aria-label="Dismiss">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
