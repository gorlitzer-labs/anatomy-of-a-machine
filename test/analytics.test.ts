/**
 * Reader analytics: the public endpoint's validation (worker/index.ts) and the opt-out
 * (src/lib/track.ts). Run: npm test
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toPoint, deviceOf } from '../worker/index.ts'

const UA_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15'
const ok = { e: 'beat', sid: 'a1b2c3d4e5f6', lecture: 'chip', beat: 'inverter', index: 7, dwell: 4200 }

test('a well-formed event becomes one data point, with nothing identifying in it', () => {
  const p = toPoint({ ...ok, ref: 'www.reddit.com' }, UA_MAC, 'MT')
  assert.deepEqual(p, {
    blobs: ['beat', 'chip', 'inverter', 'a1b2c3d4e5f6', 'desktop', 'MT', 'www.reddit.com'],
    doubles: [7, 4200],
    indexes: ['chip'],
  })
  assert.ok(!JSON.stringify(p).includes('Macintosh'), 'user agent must not be stored')
})

test('anything not exactly the expected shape is dropped', () => {
  const bad: unknown[] = [
    null, 'x', [], {},
    { ...ok, e: 'purchase' },                       // unknown event
    { ...ok, lecture: 'chip; DROP TABLE' },         // not an id
    { ...ok, lecture: 'x'.repeat(49) },             // too long
    { ...ok, sid: 'A'.repeat(20) },                 // bad session id
    { ...ok, index: -1 }, { ...ok, index: 1e6 },    // out of range
    { ...ok, dwell: Number.NaN }, { ...ok, dwell: 31 * 60 * 1000 },
    { ...ok, ref: 'http://evil.com/<script>' },     // not a host
    { ...ok, beat: 42 },
  ]
  for (const b of bad) assert.equal(toPoint(b, UA_MAC, 'MT'), null, JSON.stringify(b))
})

test('bots and headless browsers are not readers', () => {
  for (const ua of ['Googlebot/2.1', 'Mozilla/5.0 HeadlessChrome/147.0', 'facebookexternalhit/1.1', 'Chrome-Lighthouse'])
    assert.equal(toPoint(ok, ua, 'US'), null, ua)
})

test('country is kept only as a 2-letter code', () => {
  assert.equal(toPoint(ok, UA_MAC, 'T1')?.blobs[5], 'XX')
  assert.equal(toPoint(ok, UA_MAC, '')?.blobs[5], 'XX')
})

test('device class', () => {
  assert.equal(deviceOf('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Mobile/15E148'), 'mobile')
  assert.equal(deviceOf('Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile Safari'), 'mobile')
  assert.equal(deviceOf('Mozilla/5.0 (iPad; CPU OS 18_0)'), 'tablet')
  assert.equal(deviceOf('Mozilla/5.0 (Linux; Android 15; SM-X910) Safari'), 'tablet')
  assert.equal(deviceOf(UA_MAC), 'desktop')
})
