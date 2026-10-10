import { lectures } from '../content/lectures'
import { stepsFor, useDeck } from '../deck/deck'
import { useLayout } from './layout'
import {
  inputsFor,
  outputsFor,
  rowFor,
  useSignalStore,
  type TruthKind,
} from '../three/signal'
import { useReadout } from '../three/readout'
import type { Beat } from '../content/types'
import { citationsFor, lectureSources } from '../content/sources'
import { RichText } from './Rich'
import { layoutRich } from './richLayout'

/**
 * The copy panel.
 *
 * Under the scroll model this rendered every beat of every chapter at once,
 * stacked absolutely inside tall spacer sections, with all but one hidden. The
 * deck only ever has one beat on screen, so it renders one card and lets the
 * key change drive the transition — which also means the truth table and the
 * signal store can never be live for a beat the reader cannot see.
 */
export function Story() {
  const view = useDeck((s) => s.view)
  const lecture = useDeck((s) => s.lecture)
  const shown = useDeck((s) => s.shown)
  const compact = useLayout((s) => s.compact)
  const sheetOpen = useLayout((s) => s.sheetOpen)

  if (view !== 'lecture') return null

  const steps = stepsFor(lecture)
  const step = steps[shown]
  if (!step) return null

  const chapter = lectures[lecture]?.chapters[step.chapter]
  const beat = chapter?.beats[step.beat]
  if (!chapter || !beat) return null

  return (
    <div className="story" data-compact={compact || undefined} data-open={sheetOpen || undefined}>
      <div className="beats">
        {/* Keyed by beat id so stepping remounts the card and replays its
            entrance, rather than cross-fading text in place. */}
        <BeatBlock
          key={beat.id}
          beat={beat}
          lectureId={lectures[lecture]?.id ?? ''}
          chapterTitle={chapter.title}
          scene={chapter.scene}
        />
      </div>
    </div>
  )
}

/**
 * The truth table for the gate on screen, with the current row highlighted.
 *
 * Reads the same tick the 3D scene animates from, so the highlighted row and
 * the lit wires can never disagree — a table that lagged the geometry would
 * actively teach the wrong thing.
 */
function TruthTable({ kind }: { kind: TruthKind }) {
  const tick = useSignalStore((s) => s.tick)
  const rows = kind === 'not' ? [0, 1] : [0, 1, 2, 3]
  const active = rowFor(kind, tick)
  const half = kind === 'halfadder'

  return (
    <table className="truth">
      <thead>
        <tr>
          {kind === 'not' ? <th>In</th> : <><th>A</th><th>B</th></>}
          {half ? <><th>Sum</th><th>Carry</th></> : <th>Out</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const { a, b } = inputsFor(kind, r)
          const res = outputsFor(kind, r)
          return (
            <tr key={r} data-active={r === active}>
              <td>{a}</td>
              {kind !== 'not' && <td>{b}</td>}
              {half ? (
                <>
                  <td data-on={res.sum === 1}>{res.sum}</td>
                  <td data-on={res.carry === 1} data-tone="amber">{res.carry}</td>
                </>
              ) : (
                <td data-on={res.out === 1}>{res.out}</td>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/**
 * The two-state control for a beat that states a comparison.
 *
 * Rendered as buttons rather than bound only to a key, because the reader on a
 * tablet has no keyboard and this is the one control in the course that is not
 * optional — a beat with a toggle is *incomplete* until the reader operates it.
 */
function Toggle({ toggle }: { toggle: NonNullable<Beat['toggle']> }) {
  const variant = useDeck((s) => s.variant)
  const setVariant = useDeck((s) => s.setVariant)

  return (
    <div className="toggle">
      {toggle.label && <span className="toggle__label">{toggle.label}</span>}
      <div className="toggle__pair" role="group" aria-label={toggle.label ?? 'Compare'}>
        {(['a', 'b'] as const).map((side) => (
          <button
            key={side}
            type="button"
            className="toggle__btn"
            data-on={variant === side || undefined}
            aria-pressed={variant === side}
            onClick={() => setVariant(side)}
          >
            {toggle[side]}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Live numbers from the scene.
 *
 * Reads the same state the geometry is animating from, so the figure and the
 * picture cannot disagree — the reason the truth table works, applied to every
 * other number the course asserts.
 */
function Readout({ scene }: { scene: string }) {
  const readings = useReadout((s) => s.readings)
  const from = useReadout((s) => s.scene)
  // Stale readings from a scene that is mounted but not on screen are not this
  // beat's numbers, and showing them would be worse than showing nothing.
  if (from !== scene || !readings.length) return null

  return (
    <dl className="readout">
      {readings.map((r) => (
        <div className="readout__row" key={r.label} data-key={r.key || undefined}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

const numberings = new Map<string, Map<string, number>>()
const numbering = (lecture: string) => {
  let m = numberings.get(lecture)
  if (!m) numberings.set(lecture, (m = new Map(lectureSources(lecture).map(([id], i) => [id, i + 1]))))
  return m
}

function BeatBlock({
  beat,
  lectureId,
  chapterTitle,
  scene,
}: {
  beat: Beat
  lectureId: string
  chapterTitle: string
  scene: string
}) {
  // The aside is laid out with the body so numbering and first-use underlining
  // run across the whole card, not restart inside the note.
  const rich = layoutRich(
    beat.aside ? [...beat.body, beat.aside.text] : beat.body,
    citationsFor(lectureId, beat.id),
    lectureId,
    beat.id,
    (id) => numbering(lectureId).get(id),
  )
  return (
    <article className="beat">
      <div className="beat__card">
        <p className="beat__kicker">
          <span className="beat__chapter">{chapterTitle}</span>
          {beat.kicker}
        </p>
        <h2 className="beat__heading">{beat.heading}</h2>
        {beat.body.map((_, i) => (
          <p className="beat__body" key={i}>
            <RichText segments={rich[i]} />
          </p>
        ))}
        {beat.toggle && <Toggle toggle={beat.toggle} />}
        {beat.readout && <Readout scene={scene} />}
        {beat.truth && <TruthTable kind={beat.truth} />}
        {beat.aside && (
          <dl className="beat__aside">
            <dt>{beat.aside.label}</dt>
            <dd>
              <RichText segments={rich[beat.body.length]} />
            </dd>
          </dl>
        )}
      </div>
    </article>
  )
}
