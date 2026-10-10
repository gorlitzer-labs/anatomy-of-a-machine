/** Where reader analytics may run, and the per-browser opt-out. No imports: testable anywhere. */
export const PROD_HOST = 'anatomy.useful-shit.org'
const OPT_OUT = 'anatomy:notrack'

export const safe = <T>(f: () => T, fallback: T): T => {
  try { return f() } catch { return fallback }
}

/** `?notrack` / `?track` in the URL flip a persistent per-browser opt-out. */
export function trackingAllowed(loc: Location = window.location, store: Storage | null = safe(() => localStorage, null)): boolean {
  const q = new URLSearchParams(loc.search)
  if (q.has('notrack')) safe(() => store?.setItem(OPT_OUT, '1'), undefined)
  if (q.has('track')) safe(() => store?.removeItem(OPT_OUT), undefined)
  if (safe(() => store?.getItem(OPT_OUT) === '1', false)) return false
  return loc.hostname === PROD_HOST || q.has('track')
}

