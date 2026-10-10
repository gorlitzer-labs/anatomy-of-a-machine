import { test } from 'node:test'
import assert from 'node:assert/strict'

function mem(): Storage {
  const m = new Map<string, string>()
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), clear: () => m.clear(), key: () => null, get length() { return m.size } } as Storage
}
const loc = (host: string, search = '') => ({ hostname: host, search }) as Location

test('only the production host is tracked, and ?notrack sticks until ?track', async () => {
  const { trackingAllowed } = await import('../src/lib/trackPolicy.ts')
  const s = mem()
  assert.equal(trackingAllowed(loc('anatomy.useful-shit.org'), s), true)
  assert.equal(trackingAllowed(loc('localhost'), s), false, 'dev/referee runs must not count')
  assert.equal(trackingAllowed(loc('anatomy-preview-x.example.workers.dev'), s), false, 'previews must not count')
  assert.equal(trackingAllowed(loc('anatomy.useful-shit.org', '?notrack'), s), false)
  assert.equal(trackingAllowed(loc('anatomy.useful-shit.org'), s), false, 'opt-out persists without the flag')
  assert.equal(trackingAllowed(loc('anatomy.useful-shit.org', '?track'), s), true)
  assert.equal(trackingAllowed(loc('anatomy.useful-shit.org'), s), true, 'opt back in persists')
})
