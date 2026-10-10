import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { lectures } from '../content/lectures'
import { credits, lectureSources, shortCite } from '../content/sources'
import { useDeck } from '../deck/deck'

/**
 * Everything one lecture stands on, in one place: the people whose ideas it
 * explains, and every source its cards cite.
 *
 * The numbered markers answer "where does this sentence come from" while
 * reading. This answers the other question — "whose work is this" — which no
 * single card is the right place for.
 */
const useSourcesPanel = create<{ open: boolean; set: (open: boolean) => void }>((set) => ({
  open: false,
  set: (open) => set({ open }),
}))

const hasSources = (lectureId: string) =>
  lectureSources(lectureId).length > 0 || (credits[lectureId]?.length ?? 0) > 0

export function SourcesButton({ lectureId }: { lectureId: string }) {
  const set = useSourcesPanel((s) => s.set)
  if (!hasSources(lectureId)) return null
  return (
    <button className="hud__sources" onClick={() => set(true)}>
      Sources &amp; credits
    </button>
  )
}

export function SourcesPanel() {
  const open = useSourcesPanel((s) => s.open)
  const set = useSourcesPanel((s) => s.set)
  const view = useDeck((s) => s.view)
  const lecture = lectures[useDeck((s) => s.lecture)]
  const ref = useRef<HTMLDialogElement>(null)

  const shown = open && view === 'lecture' && !!lecture

  // A native dialog: focus trap, Escape and the backdrop come for free, and a
  // screen reader announces it as what it is.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (shown && !el.open) el.showModal()
    if (!shown && el.open) el.close()
  }, [shown])

  if (!lecture) return null
  const list = lectureSources(lecture.id)
  const people = credits[lecture.id] ?? []
  const index = new Map(list.map(([id], i) => [id, i + 1]))

  return (
    <dialog
      ref={ref}
      className="sources"
      aria-labelledby="sources-title"
      onClose={() => set(false)}
      onClick={(e) => e.target === e.currentTarget && set(false)}
    >
      <div className="sources__inner">
        <header className="sources__head">
          <p className="sources__kicker">
            Lecture {String(lecture.number).padStart(2, '0')} · {lecture.title}
          </p>
          <h2 id="sources-title">Sources &amp; credits</h2>
          <button className="sources__close" onClick={() => set(false)} aria-label="Close">
            ×
          </button>
        </header>

        {people.length > 0 && (
          <section>
            <h3>The people behind it</h3>
            <ul className="sources__people">
              {people.map((p) => (
                <li key={p.name}>
                  <strong>{p.name}</strong> {p.for}
                  {p.source && index.has(p.source) && (
                    <span className="sources__ref"> [{index.get(p.source)}]</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {list.length > 0 && (
          <section>
            <h3>Sources</h3>
            <ol className="sources__list">
              {list.map(([id, s]) => (
                <li key={id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.title}
                  </a>
                  <span className="sources__meta">
                    {[shortCite(s), s.authors && s.venue, s.kind].filter(Boolean).join(' · ')}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </dialog>
  )
}
