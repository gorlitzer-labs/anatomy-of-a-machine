/**
 * Reader analytics: what people actually do in a lecture, so the course can be improved from
 * evidence rather than guesses. Cloudflare Web Analytics sees every lecture as `/` (the deck
 * routes on the hash), so it cannot answer "which lectures get read, and where do people stop".
 *
 * Privacy, by construction:
 *  - no cookies, no localStorage identity; one random id per browser TAB (sessionStorage), gone
 *    when the tab closes — it can tie the beats of one reading together, never a person;
 *  - no IP address or user agent is stored (the server keeps only country and device class);
 *  - off everywhere except the production host, and `?notrack` switches it off for a browser
 *    for good (`?track` switches it back on) — so the author's own reading stays out.
 *
 * Observes the deck and narration stores from outside, so no lecture code knows it exists.
 */
import { lectures } from '../content/lectures'
import { beatAt, stepsFor, useDeck } from '../deck/deck'
import { useNarration } from '../deck/narration'
import { PROD_HOST, safe, trackingAllowed } from './trackPolicy'

const ENDPOINT = '/api/e'
/** A reader who walked away from an open tab did not read for eight hours. */
const MAX_DWELL_MS = 30 * 60 * 1000

export type TrackEvent = 'open' | 'beat' | 'finish' | 'listen' | 'unlisten' | 'leave'
export type Payload = {
  e: TrackEvent
  sid: string
  lecture: string
  beat: string
  index: number
  dwell: number
  ref?: string
}

function sessionId(): string {
  return safe(() => {
    let id = sessionStorage.getItem('anatomy:sid')
    if (!id) { id = crypto.randomUUID().slice(0, 12); sessionStorage.setItem('anatomy:sid', id) }
    return id
  }, 'nosession')
}

function send(p: Payload) {
  const body = JSON.stringify(p)
  if (!safe(() => navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' })), false))
    safe(() => void fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }), undefined)
}

/** Visible time only: a hidden tab is not reading. */
function makeClock() {
  let visibleSince = document.visibilityState === 'visible' ? performance.now() : 0
  let banked = 0
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') visibleSince = performance.now()
    else if (visibleSince) { banked += performance.now() - visibleSince; visibleSince = 0 }
  })
  return {
    /** Visible ms since the last lap, then restart. */
    lap(): number {
      const now = performance.now()
      const ms = banked + (visibleSince ? now - visibleSince : 0)
      banked = 0
      if (visibleSince) visibleSince = now
      return Math.round(Math.min(ms, MAX_DWELL_MS))
    },
  }
}

export function startTracking(): void {
  if (!trackingAllowed()) return
  const sid = sessionId()
  const clock = makeClock()
  let ref: string | undefined = safe(() => (document.referrer ? new URL(document.referrer).hostname : undefined), undefined)
  if (ref === PROD_HOST) ref = undefined
  let at: { lecture: number; index: number } | null = null
  const finished = new Set<number>()

  const idOf = (lecture: number) => lectures[lecture]?.id ?? String(lecture)
  const beatOf = (lecture: number, index: number) => beatAt(lecture, index)?.id ?? ''
  const emit = (e: TrackEvent, lecture: number, index: number, dwell: number) => {
    send({ e, sid, lecture: idOf(lecture), beat: beatOf(lecture, index), index, dwell, ...(ref ? { ref } : {}) })
    ref = undefined // the referrer belongs to the first event of the visit only
  }

  const onDeck = (s: { view: string; lecture: number; index: number }) => {
    if (s.view !== 'lecture') {
      if (at) emit('leave', at.lecture, at.index, clock.lap())
      at = null
      return
    }
    if (at && at.lecture === s.lecture && at.index === s.index) return
    const dwell = clock.lap()
    if (!at || at.lecture !== s.lecture) {
      if (at) emit('leave', at.lecture, at.index, dwell)
      emit('open', s.lecture, s.index, 0)
    } else {
      emit('beat', s.lecture, s.index, dwell) // dwell = time spent on the beat just left
    }
    at = { lecture: s.lecture, index: s.index }
    const last = stepsFor(s.lecture).length - 1
    if (s.index >= last && last >= 0 && !finished.has(s.lecture)) { finished.add(s.lecture); emit('finish', s.lecture, s.index, 0) }
  }

  onDeck(useDeck.getState())
  useDeck.subscribe(onDeck)

  let playing = useNarration.getState().playing
  useNarration.subscribe((n) => {
    if (n.playing === playing || !at) { playing = n.playing; return }
    playing = n.playing
    emit(playing ? 'listen' : 'unlisten', at.lecture, at.index, 0)
  })

  // pagehide, not unload: it fires on mobile tab switches and bfcache, unload often does not.
  window.addEventListener('pagehide', () => { if (at) emit('leave', at.lecture, at.index, clock.lap()) })
}
