import { useEffect, useRef, type ReactNode } from 'react'
import { jargon } from '../content/jargon'
import { shortCite, sources } from '../content/sources'
import { keep, useNote, type Note, type Segment } from './richLayout'

/**
 * Beat copy with its jargon underlined and its claims numbered.
 *
 * Both are layered on at render time from their own files — `jargon.ts` and
 * `sources.ts` — so the copy stays plain strings that read the same in the
 * editor as on the card, and the narration never meets a footnote marker.
 */

/**
 * One paragraph of laid-out copy.
 *
 * The copy marks emphasis the way it would be typed, `*like this*`, and it
 * used to reach the reader with the asterisks still in it. Emphasis is applied
 * here, at the very end, rather than stripped from the text earlier: citation
 * anchors are matched against the copy exactly as written, and some of them
 * contain the asterisks. The state carries across segments, so an emphasised
 * phrase holding an underlined term stays emphasised around it.
 */
export function RichText({ segments }: { segments: Segment[] }) {
  // A marker carries the word before it (`lead`), so that word is copy too.
  const plain = (s: Segment) => (typeof s === 'string' ? s : 'lead' in s ? s.lead : '')
  const stars = segments.reduce((n, s) => n + plain(s).split('*').length - 1, 0)
  // An odd count means a literal asterisk rather than emphasis; leave it be.
  const paired = stars > 0 && stars % 2 === 0
  let em = false
  const runs = (text: string, key: string): ReactNode[] => {
    if (!paired) return [text]
    const out: ReactNode[] = []
    text.split('*').forEach((run, j) => {
      if (j > 0) em = !em
      if (run) out.push(em ? <em key={`${key}.${j}`}>{run}</em> : run)
    })
    return out
  }
  const out: ReactNode[] = []
  segments.forEach((s, i) => {
    if (typeof s === 'string') return out.push(...runs(s, `${i}`))
    if ('term' in s) {
      const node = (
        <Term key={i} id={s.term}>
          {s.text}
        </Term>
      )
      return out.push(em ? <em key={`e${i}`}>{node}</em> : node)
    }
    out.push(
      <span key={i} className="cite-wrap">
        {runs(s.lead, `l${i}`)}
        <Cite n={s.cite} label={s.label} refs={s.refs} />
      </span>,
    )
  })
  return <>{out}</>
}

/** Plain text with `*emphasis*`, for the places that show copy without notes. */
export function Emphasised({ text }: { text: string }) {
  return <RichText segments={[text]} />
}

/** Hover to read, click or tap to keep it open. */
function triggerProps(make: (rect: DOMRect, pinned: boolean) => Note, isThis: (n: Note | null) => boolean) {
  const { show, hide } = useNote.getState()
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      const cur = useNote.getState().note
      if (!cur?.pinned) show(make(e.currentTarget.getBoundingClientRect(), false))
    },
    onMouseLeave: () => hide(),
    onFocus: (e: React.FocusEvent<HTMLElement>) => show(make(e.currentTarget.getBoundingClientRect(), false)),
    onBlur: () => hide(),
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      const cur = useNote.getState().note
      if (isThis(cur) && cur?.pinned) hide(true)
      else show(make(e.currentTarget.getBoundingClientRect(), true))
    },
  }
}

function Term({ id, children }: { id: string; children: ReactNode }) {
  const open = useNote((s) => s.note?.kind === 'term' && s.note.key === id)
  return (
    <button
      type="button"
      className="term"
      data-open={open || undefined}
      aria-expanded={open}
      aria-label={`${children}: definition`}
      {...triggerProps(
        (rect, pinned) => ({ kind: 'term', key: id, rect, pinned }),
        (n) => n?.kind === 'term' && n.key === id,
      )}
    >
      {children}
    </button>
  )
}

function Cite({ n, label, refs }: { n: number; label: string; refs: string[] }) {
  const open = useNote((s) => s.note?.kind === 'cite' && s.note.n === n)
  return (
    <sup className="cite">
      <button
        type="button"
        className="cite__btn"
        data-open={open || undefined}
        aria-expanded={open}
        aria-label={`Source ${label}`}
        {...triggerProps(
          (rect, pinned) => ({ kind: 'cite', n, label, refs, rect, pinned }),
          (x) => x?.kind === 'cite' && x.n === n,
        )}
      >
        {label}
      </button>
    </sup>
  )
}

const GAP = 8
const MARGIN = 12

/**
 * The one floating card for both kinds, rendered at the root.
 *
 * Fixed-position and placed from the trigger's rect rather than nested in the
 * copy, because the copy card scrolls inside a sheet on a phone and clips
 * anything that pokes out of it.
 */
export function NoteCard() {
  const note = useNote((s) => s.note)
  const hide = useNote((s) => s.hide)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!note || !el) return
    const { width, height } = el.getBoundingClientRect()
    const r = note.rect
    const x = Math.min(Math.max(MARGIN, r.left + r.width / 2 - width / 2), window.innerWidth - width - MARGIN)
    // Above the word by default, so the line being read stays visible; below
    // when there is no room.
    const above = r.top - GAP - height
    const y = above > MARGIN ? above : Math.min(r.bottom + GAP, window.innerHeight - height - MARGIN)
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    el.style.visibility = 'visible'
  }, [note])

  useEffect(() => {
    if (!note?.pinned) return
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      if (e.target instanceof Node && ref.current?.contains(e.target)) return
      if (e.target instanceof Element && e.target.closest('.term, .cite__btn')) return
      hide(true)
    }
    // Stepping the deck, scrolling the sheet or orbiting all move the word out
    // from under a card placed against it.
    const drop = () => hide(true)
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', close)
    window.addEventListener('hashchange', drop)
    window.addEventListener('scroll', drop, true)
    window.addEventListener('resize', drop)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', close)
      window.removeEventListener('hashchange', drop)
      window.removeEventListener('scroll', drop, true)
      window.removeEventListener('resize', drop)
    }
  }, [note, hide])

  if (!note) return null

  return (
    <div
      ref={ref}
      className="note"
      data-kind={note.kind}
      role="tooltip"
      style={{ visibility: 'hidden' }}
      onMouseEnter={keep}
      onMouseLeave={() => hide()}
    >
      {note.kind === 'term' ? (
        <>
          <p className="note__term">{jargon[note.key]?.term}</p>
          <p className="note__line">{jargon[note.key]?.line}</p>
        </>
      ) : (
        <>
          <p className="note__term">{note.refs.length > 1 ? 'Sources' : 'Source'} {note.label}</p>
          <ul className="note__refs">
            {note.refs.map((id) => {
              const s = sources[id]
              if (!s) return null
              return (
                <li key={id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.title}
                  </a>
                  <span className="note__meta">
                    {[shortCite(s), s.authors && s.venue].filter(Boolean).join(' · ')}
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
