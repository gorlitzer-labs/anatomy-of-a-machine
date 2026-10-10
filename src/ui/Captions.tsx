import { useNarration } from '../deck/narration'
import { Emphasised } from './Rich'

/**
 * The one surface narration owns.
 *
 * It shows the line being spoken, and — when that line is pointing at something
 * — the name of the thing being pointed at.
 *
 * Both live here on purpose. Narration used to put the spoken line in this
 * panel and open the glossary card as a second floating panel at the same time,
 * which meant a reader could have three blocks of text on screen at once: the
 * beat's written copy, the caption, and the card. On a phone the card docked
 * full-width across the model and did it on nearly every beat. The card was
 * also redundant by construction — its definition repeats what the voice is
 * saying at that exact moment.
 *
 * What was worth keeping is only the *name*. "Gate oxide" is a label the voice
 * often does not say verbatim, and it is what ties the highlight on screen to
 * the sentence in the ear. So the name moved here, and the card went away.
 *
 * A dot in the part's own tone, then the term, then the line — the same
 * grammar as the scene's own callouts, so a reader who has seen one recognises
 * the other.
 *
 * Reader-driven hovering is untouched: point at something yourself and the full
 * card still follows the cursor, definition and all. That is a different act
 * from being shown something, and it can afford the space because the reader
 * asked for it.
 *
 * `aria-live="polite"` rather than `assertive`: a caption is a courtesy, and
 * interrupting a screen reader mid-sentence to announce a line it is probably
 * already reading would make the page worse for the people it is meant to help.
 */
export function Captions() {
  const playing = useNarration((s) => s.playing)
  const captions = useNarration((s) => s.captions)
  const line = useNarration((s) => s.line)
  const looking = useNarration((s) => s.looking)

  if (!playing || !captions) return null

  return (
    <div className="caption" aria-live="polite" aria-atomic="true">
      {/* Keyed by line so each one remounts and replays its fade rather than
          cross-fading letters in place, which reads as a glitch at this size. */}
      {line && (
        <p className="caption__line" key={line} data-tone={looking?.tone ?? undefined}>
          {looking && (
            <span className="caption__term">
              <i aria-hidden="true" />
              {looking.term}
            </span>
          )}
          <Emphasised text={line} />
        </p>
      )}
    </div>
  )
}
