# Reader analytics

Cloudflare Web Analytics (the beacon in `index.html`) counts visits, but the deck routes on the
hash, so to it every lecture is `/`. It cannot say which lectures are read, how far people get,
or where they stop. This does.

## What is recorded

`src/lib/track.ts` observes the deck and narration stores and sends one small event per action
to `POST /api/e` (`worker/index.ts`), which writes it to Workers Analytics Engine
(dataset `anatomy_events`).

| event | when | extra |
|---|---|---|
| `open` | a lecture is entered | referrer host, on the first event of a visit |
| `beat` | the reader moves to another beat | visible ms spent on the beat just left |
| `finish` | the last beat of a lecture is reached | |
| `listen` / `unlisten` | narration starts / stops | |
| `leave` | the reader leaves the lecture or the page | visible ms on the last beat |

Every event carries the lecture id, beat id and index, a per-tab session id, country (2 letters)
and device class (desktop / tablet / mobile).

## What is not

No cookies. No IP address, no user agent, no identity: the session id is random, lives in
`sessionStorage`, and dies with the tab — it links the beats of one reading, never a person.
Bots and headless browsers are dropped server-side. Hidden-tab time is not counted as reading.

## Where it runs

Only on `anatomy.useful-shit.org`. Not on localhost (dev, the beat audit) and not on preview
deploys. **`?notrack`** switches it off in that browser for good (use it on your own machines);
**`?track`** switches it back on (and enables it on any host, for testing).

## Reading it

```bash
CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… npm run stats -- --days 7
```

Per lecture: readers, opens, how many finished, the most common last beat (where people stop),
Listen usage — plus the beats readers linger on longest, referrers, countries and devices.
Analytics Engine keeps 3 months of data.
