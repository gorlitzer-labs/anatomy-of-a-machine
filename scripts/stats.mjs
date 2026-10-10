#!/usr/bin/env node
// Reader analytics report, from Workers Analytics Engine (see docs/ANALYTICS.md).
//
//   CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… npm run stats [-- --days 7]
//
// Answers: which lectures get opened, how many readers finish, where they stop, how long they
// spend on each beat, whether they use Listen, where they come from. Analytics Engine samples at
// high volume, so every count is SUM(_sample_interval), not COUNT(*).
const args = process.argv.slice(2)
const days = Number(args[args.indexOf('--days') + 1]) || 7
const { CLOUDFLARE_ACCOUNT_ID: acct, CLOUDFLARE_API_TOKEN: token } = process.env
if (!acct || !token) { console.error('set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (Account Analytics: Read)'); process.exit(2) }

async function sql(q) {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acct}/analytics_engine/sql`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: q,
  })
  const text = await r.text()
  if (!r.ok) throw new Error(`${r.status}: ${text.slice(0, 300)}`)
  return JSON.parse(text).data
}

// 'selftest' is the lecture id deploy verification writes with; it is never a real reading.
const W = `timestamp > NOW() - INTERVAL '${days}' DAY AND blob2 != 'selftest'`
const T = 'anatomy_events'
const pad = (s, n) => String(s).padEnd(n)
const num = (s, n) => String(s).padStart(n)
const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : '—')

const [totals, lectures, drop, dwell, listen, refs, geo, dev] = await Promise.all([
  sql(`SELECT SUM(_sample_interval) AS events, COUNT(DISTINCT blob4) AS readers FROM ${T} WHERE ${W}`),
  sql(`SELECT blob2 AS lecture,
         SUM(IF(blob1 = 'open', _sample_interval, 0)) AS opens,
         SUM(IF(blob1 = 'finish', _sample_interval, 0)) AS finishes,
         COUNT(DISTINCT blob4) AS readers
       FROM ${T} WHERE ${W} GROUP BY lecture ORDER BY opens DESC`),
  // where readings end: the beat of each 'leave'
  sql(`SELECT blob2 AS lecture, double1 AS idx, blob3 AS beat, SUM(_sample_interval) AS n
       FROM ${T} WHERE ${W} AND blob1 = 'leave' GROUP BY lecture, idx, beat ORDER BY lecture, n DESC`),
  // time spent per beat: dwell is recorded on the step AWAY from a beat, against the new index
  sql(`SELECT blob2 AS lecture, double1 - 1 AS idx, quantileWeighted(0.5)(double2, _sample_interval) AS p50, SUM(_sample_interval) AS n
       FROM ${T} WHERE ${W} AND blob1 = 'beat' AND double2 > 0 GROUP BY lecture, idx ORDER BY lecture, idx`),
  sql(`SELECT blob2 AS lecture, SUM(_sample_interval) AS n FROM ${T} WHERE ${W} AND blob1 = 'listen' GROUP BY lecture ORDER BY n DESC`),
  sql(`SELECT blob7 AS ref, COUNT(DISTINCT blob4) AS readers FROM ${T} WHERE ${W} AND blob7 != '' GROUP BY ref ORDER BY readers DESC LIMIT 10`),
  sql(`SELECT blob6 AS country, COUNT(DISTINCT blob4) AS readers FROM ${T} WHERE ${W} GROUP BY country ORDER BY readers DESC LIMIT 10`),
  sql(`SELECT blob5 AS device, COUNT(DISTINCT blob4) AS readers FROM ${T} WHERE ${W} GROUP BY device ORDER BY readers DESC`),
])

const t = totals[0] ?? { events: 0, readers: 0 }
console.log(`\nanatomy — last ${days} day(s): ${t.readers} readers (tab sessions), ${t.events} events\n`)
if (!Number(t.events)) { console.log('no events yet.'); process.exit(0) }

console.log(`${pad('LECTURE', 12)} ${num('READERS', 8)} ${num('OPENS', 6)} ${num('FINISHED', 9)}  ${pad('MOST COMMON LAST BEAT', 30)} ${num('LISTEN', 6)}`)
for (const l of lectures) {
  const top = drop.find((d) => d.lecture === l.lecture)
  const li = listen.find((x) => x.lecture === l.lecture)?.n ?? 0
  console.log(`${pad(l.lecture, 12)} ${num(l.readers, 8)} ${num(l.opens, 6)} ${num(`${l.finishes} (${pct(l.finishes, l.opens)})`, 9)}  ${pad(top ? `#${top.idx} ${top.beat} (${top.n}×)` : '—', 30)} ${num(li, 6)}`)
}

const slow = [...dwell].filter((d) => Number(d.n) >= 3).sort((a, b) => b.p50 - a.p50).slice(0, 8)
if (slow.length) {
  console.log('\nLONGEST BEATS (median visible seconds, beats with ≥3 readings) — confusing, or just rich?')
  for (const d of slow) console.log(`  ${pad(d.lecture, 12)} beat #${num(d.idx, 2)}  ${num((d.p50 / 1000).toFixed(1), 6)} s  (${d.n} readings)`)
}
const line = (title, rows, k) => rows.length && console.log(`\n${title}: ` + rows.map((r) => `${r[k] || '(none)'} ${r.readers}`).join(' · '))
line('REFERRERS (first event of a visit)', refs, 'ref')
line('COUNTRIES', geo, 'country')
line('DEVICES', dev, 'device')
console.log('')
