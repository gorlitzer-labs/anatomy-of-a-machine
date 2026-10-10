/**
 * anatomy's Worker. The site itself is static assets; this only answers `/api/*`
 * (`run_worker_first` in wrangler.jsonc), and hands every other request straight to the assets.
 *
 * POST /api/e — one reader event from src/lib/track.ts, written to Workers Analytics Engine.
 * Validated hard: this is a public endpoint, so anything not exactly the expected shape is
 * dropped, and nothing identifying is kept — no IP, no user agent, only country and a device class.
 */
export interface Env {
  ASSETS: Fetcher
  EVENTS: AnalyticsEngineDataset
}

const EVENTS = new Set(['open', 'beat', 'finish', 'listen', 'unlisten', 'leave'])
const ID = /^[a-z0-9-]{1,48}$/
const SID = /^[a-z0-9-]{1,16}$/
const HOST = /^[a-z0-9.-]{1,100}$/
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|pingdom/i
const MAX_BODY = 1024

export type Point = { blobs: string[]; doubles: number[]; indexes: string[] }

export function deviceOf(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/iPad|Tablet|(Android(?!.*Mobile))/i.test(ua)) return 'tablet'
  if (/Mobi|iPhone|Android/i.test(ua)) return 'mobile'
  return 'desktop'
}

/** The whole validation, pure, so it can be tested without a Worker. null = drop. */
export function toPoint(body: unknown, ua: string, country: string): Point | null {
  if (!body || typeof body !== 'object' || BOT.test(ua)) return null
  const b = body as Record<string, unknown>
  const str = (v: unknown, re: RegExp) => (typeof v === 'string' && re.test(v) ? v : null)
  const num = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max ? Math.round(v) : null)
  const e = typeof b.e === 'string' && EVENTS.has(b.e) ? b.e : null
  const sid = str(b.sid, SID)
  const lecture = str(b.lecture, ID)
  const beat = b.beat === '' ? '' : str(b.beat, ID)
  const index = num(b.index, 500)
  const dwell = num(b.dwell, 30 * 60 * 1000)
  const ref = b.ref === undefined ? '' : str(b.ref, HOST)
  if (!e || !sid || !lecture || beat === null || index === null || dwell === null || ref === null) return null
  return {
    // blob1 event · blob2 lecture · blob3 beat · blob4 session · blob5 device · blob6 country · blob7 referrer
    blobs: [e, lecture, beat, sid, deviceOf(ua), /^[A-Z]{2}$/.test(country) ? country : 'XX', ref],
    // double1 beat index · double2 visible ms spent on the previous beat
    doubles: [index, dwell],
    indexes: [lecture],
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    if (url.pathname === '/api/e') {
      if (req.method !== 'POST') return new Response(null, { status: 405 })
      const len = Number(req.headers.get('content-length') ?? '0')
      if (len > MAX_BODY) return new Response(null, { status: 413 })
      let body: unknown = null
      try { const text = await req.text(); if (text.length <= MAX_BODY) body = JSON.parse(text) } catch { /* dropped below */ }
      const cf = (req as Request & { cf?: { country?: string } }).cf
      const point = toPoint(body, req.headers.get('user-agent') ?? '', cf?.country ?? 'XX')
      if (point) env.EVENTS.writeDataPoint(point)
      // Always 204: a beacon cannot do anything with an error, and a validator's verdict is not
      // something to hand to whoever is probing the endpoint.
      return new Response(null, { status: 204 })
    }
    if (url.pathname.startsWith('/api/')) return new Response(null, { status: 404 })
    return env.ASSETS.fetch(req)
  },
} satisfies ExportedHandler<Env>
