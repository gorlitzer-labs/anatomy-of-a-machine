import { lectures } from '../content/lectures'
import { stepsFor, useDeck } from '../deck/deck'
import { Nav } from './Nav'
import { useLayout } from './layout'
import { SourcesButton } from './Sources'

/**
 * Persistent chrome for a lecture: where you are, what else is in it, and how
 * to get back out.
 *
 * The progress bar is plain React state now. Under scrolling it had to be
 * written straight to the DOM on `requestAnimationFrame`, because it moved on
 * every scroll frame and routing that through React re-rendered the tree dozens
 * of times a second. A deck position changes about thirty times per lecture, so
 * there is nothing left to optimise around.
 */
export function Hud() {
  const view = useDeck((s) => s.view)
  const lecture = useDeck((s) => s.lecture)
  const index = useDeck((s) => s.index)
  const jumpChapter = useDeck((s) => s.jumpChapter)
  const exit = useDeck((s) => s.exit)
  const compact = useLayout((s) => s.compact)
  const sheetOpen = useLayout((s) => s.sheetOpen)
  const toggleSheet = useLayout((s) => s.toggleSheet)

  if (view !== 'lecture') return null

  const current = lectures[lecture]
  const steps = stepsFor(lecture)
  if (!current || !steps.length) return null

  const activeChapter = steps[index]?.chapter ?? 0
  const progress = steps.length > 1 ? index / (steps.length - 1) : 1

  return (
    <div className="hud">
      <div className="hud__progress" style={{ transform: `scaleX(${progress})` }} />

      <div className="hud__bar">
        <button className="hud__back" onClick={exit}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true">
            <path
              d="M19 12H6M12 5.5 5.5 12 12 18.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Syllabus
        </button>
        <span className="hud__right">
          <SourcesButton lectureId={current.id} />
          <span className="hud__title">
            Lecture {String(current.number).padStart(2, '0')} · {current.title}
          </span>
        </span>
      </div>

      {/* On a phone the vertical rail has nowhere to live, so the same chapter
          list becomes a horizontal strip pinned above the sheet. Same data,
          same handler — only the axis changes. */}
      {compact && (
        <nav className="strip" aria-label="Chapters">
          {current.chapters.map((chapter, i) => (
            <button
              key={chapter.id}
              className="strip__item"
              data-active={i === activeChapter}
              aria-current={i === activeChapter ? 'true' : undefined}
              onClick={() => jumpChapter(i)}
            >
              {chapter.short}
            </button>
          ))}
        </nav>
      )}

      {compact && (
        <button
          className="sheet__grip"
          onClick={toggleSheet}
          aria-expanded={sheetOpen}
          aria-label={sheetOpen ? 'Hide the text' : 'Show the text'}
        >
          <i aria-hidden="true" />
        </button>
      )}

      <nav className="rail" aria-label="Chapters">
        {current.chapters.map((chapter, i) => (
          <button
            key={chapter.id}
            className="rail__item"
            data-active={i === activeChapter}
            aria-current={i === activeChapter ? 'true' : undefined}
            onClick={() => jumpChapter(i)}
          >
            {chapter.short}
            <i className="rail__dot" aria-hidden="true" />
          </button>
        ))}
      </nav>

      <Nav />
    </div>
  )
}
