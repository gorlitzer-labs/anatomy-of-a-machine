import { stepsFor, useDeck } from '../deck/deck'
import { useNarration } from '../deck/narration'

/**
 * Step-through controls.
 *
 * Almost all of this used to be machinery for staying in sync with the scroll
 * position: a `requestAnimationFrame` loop polling `window.scrollY`, a rebuilt
 * table of document offsets, and a pending-target ref so rapid clicks were not
 * dropped mid-animation. None of it survives the move to a deck, because the
 * index the buttons write is the same index everything else reads.
 */
export function Nav() {
  const lecture = useDeck((s) => s.lecture)
  const index = useDeck((s) => s.index)
  const go = useDeck((s) => s.go)

  const total = stepsFor(lecture).length
  if (!total) return null

  return (
    <nav className="nav" aria-label="Step through the lecture">
      <Play />
      <button
        className="nav__btn"
        onClick={() => go(-1)}
        aria-label="Previous step"
        disabled={index <= 0}
      >
        <Arrow dir="left" />
      </button>
      <span className="nav__count">
        <span className="sr-only">Step </span>
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
      <button
        className="nav__btn"
        onClick={() => go(1)}
        aria-label="Next step"
        disabled={index >= total - 1}
      >
        <Arrow dir="right" />
      </button>
      <span className="nav__hint" aria-hidden="true">
        ← → to step · P to listen · drag to orbit · scroll to zoom
      </span>
    </nav>
  )
}

/**
 * Play, and the mute that goes with it.
 *
 * Two controls rather than one, because they are two different questions. Play
 * asks "should the deck advance by itself", mute asks "should there be a
 * voice", and a reader who wants the pacing without the narration — on a train,
 * in an office — is not an edge case. Muted autoplay holds each beat for as
 * long as its copy takes to read.
 *
 * Captions are the third: the line she is on, as text. That one is also the
 * accessibility answer for the whole feature — muted, with captions on, the
 * guided tour still runs and the words still land in time with the model.
 *
 * All three of the qualifiers only appear once playing, since on a still deck
 * they control nothing.
 */
function Play() {
  const playing = useNarration((s) => s.playing)
  const speaking = useNarration((s) => s.speaking)
  const muted = useNarration((s) => s.muted)
  const captions = useNarration((s) => s.captions)
  const toggle = useNarration((s) => s.toggle)
  const setMuted = useNarration((s) => s.setMuted)
  const setCaptions = useNarration((s) => s.setCaptions)

  return (
    <>
      <button
        className="nav__btn nav__btn--play"
        onClick={toggle}
        data-on={playing || undefined}
        data-speaking={(playing && speaking && !muted) || undefined}
        /* Advertises itself whenever the deck is standing still: the voice is
           the point of the thing, and a still deck is one nobody is hearing. */
        data-attract={!playing || undefined}
        /* Labelled while stopped. A bare triangle beside two arrows reads as one
           more media control, and readers who did not already know the course
           speaks never pressed it. The word says what it does; once playing,
           the pause glyph needs no explaining. */
        data-label={!playing || undefined}
        aria-label={playing ? 'Pause the lecture' : 'Listen to the lecture'}
        aria-pressed={playing}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          {playing ? (
            <path d="M9 6.5v11M15 6.5v11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M8 5.6 18.5 12 8 18.4Z" fill="currentColor" />
          )}
        </svg>
        {!playing && <span className="nav__label" aria-hidden="true">Listen</span>}
      </button>
      {playing && (
        <button
          className="nav__btn nav__btn--mute"
          onClick={() => setMuted(!muted)}
          data-off={muted || undefined}
          aria-label={muted ? 'Turn the narration on' : 'Turn the narration off'}
          aria-pressed={!muted}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
            <path
              d="M11 5.5 6.8 9H4v6h2.8L11 18.5Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {muted ? (
              <path d="m15.5 9.5 4 5m0-5-4 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            ) : (
              <path
                d="M14.8 9.2a4 4 0 0 1 0 5.6M17.4 6.8a7.5 7.5 0 0 1 0 10.4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      )}
      {playing && (
        <button
          className="nav__btn nav__btn--cc"
          onClick={() => setCaptions(!captions)}
          data-off={!captions || undefined}
          aria-label={captions ? 'Hide the spoken line' : 'Show the spoken line'}
          aria-pressed={captions}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
            <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M10 10.4a2.4 2.4 0 1 0 0 3.2M17 10.4a2.4 2.4 0 1 0 0 3.2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </>
  )
}

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d={dir === 'right' ? 'M5 12h13M12 5.5 18.5 12 12 18.5' : 'M19 12H6M12 5.5 5.5 12 12 18.5'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
