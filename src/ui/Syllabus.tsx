import { isNarrated, lectureByNumber, lectures, parts } from '../content/lectures'
import { useEffect, useState } from 'react'
import { stepsFor, useDeck } from '../deck/deck'

/**
 * The homepage.
 *
 * Shows the whole course, not only the finished part of it. A syllabus that
 * listed one readable lecture would say "this is a piece about CPUs"; listing
 * all seventeen says "this is a course, and here is the shape of it" — which is
 * the actual claim, and it costs nothing to make it honestly since planned
 * lectures carry their constraint line and no chapters.
 */
export function Syllabus() {
  const view = useDeck((s) => s.view)
  const enter = useDeck((s) => s.enter)

  if (view !== 'syllabus') return null

  const live = lectures.filter((l) => l.state === 'live').length
  const narrated = lectures.filter(isNarrated).length

  return (
    <div className="syllabus">
      <div className="syllabus__inner">
        <header className="syllabus__head">
          <p className="syllabus__kicker">
            An interactive course · {lectures.length} lectures · {live} readable ·{' '}
            {narrated} narrated
          </p>
          <h1 className="syllabus__title">
            Everything a computer does, it does with <em>switches</em>.
          </h1>
          <p className="syllabus__lede">
            Every machine in this course is built from the same few parts: switches, wires,
            memory and a clock. A phone, a car&apos;s engine computer and a TPU all use them.
            What changes is the budget, and what each one gives up to fit it. Every lecture
            says what mattered most and what was sacrificed.
          </p>
        </header>

        {parts.map((part) => (
          <section className="part" key={part.no}>
            <div className="part__head">
              <span className="part__no">{part.no}</span>
              <h2 className="part__name">{part.name}</h2>
              <span className="part__blurb">{part.blurb}</span>
            </div>

            <ul className="part__list">
              {part.lectures.map((n) => {
                const lecture = lectureByNumber(n)
                if (!lecture) return null
                const index = lectures.indexOf(lecture)
                const ready = lecture.state === 'live'
                const beats = stepsFor(index).length
                const voiced = isNarrated(lecture)

                return (
                  <li key={lecture.id}>
                    <button
                      className="lecture"
                      data-state={lecture.state}
                      disabled={!ready}
                      onClick={() => enter(index)}
                      aria-label={
                        ready
                          ? `Start lecture ${lecture.number}, ${lecture.title}${
                              voiced ? ', narrated' : ''
                            }`
                          : `Lecture ${lecture.number}, ${lecture.title} — not written yet`
                      }
                    >
                      <span className="lecture__no">
                        {String(lecture.number).padStart(2, '0')}
                      </span>
                      <span className="lecture__text">
                        <b className="lecture__title">{lecture.title}</b>
                        <span className="lecture__sub">{lecture.subtitle}</span>
                        {lecture.constraint && (
                          <span className="lecture__constraint">{lecture.constraint}</span>
                        )}
                      </span>
                      <span className="lecture__meta">
                        {ready ? (
                          <>
                            {lecture.chapters.length} chapters
                            <i>{beats} steps</i>
                            {/* Only the narrated ones are marked. Badging the rest
                                "silent" would make the majority of the syllabus look
                                broken, when what is actually true is that two of them
                                have something extra. */}
                            {voiced && (
                              <em className="lecture__voiced">
                                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" aria-hidden="true">
                                  <path
                                    d="M11 5.5 6.8 9H4v6h2.8L11 18.5Z"
                                    fill="currentColor"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M14.8 9.2a4 4 0 0 1 0 5.6M17.4 6.8a7.5 7.5 0 0 1 0 10.4"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                Narrated
                              </em>
                            )}
                          </>
                        ) : (
                          <i>Planned</i>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}

        <footer className="syllabus__foot">
          <Counter />
          <p>
            Vibe-coded for fun, and maybe to learn something. Built entirely out of
            switches, like everything else here.
          </p>
        </footer>
      </div>
    </div>
  )
}

/**
 * Eight switches counting in binary, the whole course in one byte. It only
 * ticks while the syllabus is mounted, and holds still for reduced motion.
 */
function Counter() {
  const [n, setN] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setN((v) => (v + 1) & 0xff), 600)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="counter" aria-hidden="true">
      <span className="counter__bits">
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} data-on={(n >> (7 - i)) & 1 ? '' : undefined} />
        ))}
      </span>
      <span className="counter__value">{String(n).padStart(3, '0')}</span>
    </div>
  )
}
