<img src="hero.png" alt="Banner" width="100%">

# Anatomy of a Machine

Live at **https://anatomy.useful-shit.org** — a static build served from
Cloudflare Workers.

A scroll-driven teardown of a computer, from the CPU package down to a single
transistor. All 3D is generated procedurally — there are no model files.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/, static, deploy anywhere
```

## Stack

| Package | Version | Why |
| --- | --- | --- |
| `vite` | 8.2.1 | Static build, no SSR to fight with WebGL |
| `react` | 19.2.8 | |
| `three` | 0.185.1 | |
| `@react-three/fiber` | 9.7.0 | React renderer for three |
| `@react-three/drei` | 10.7.8 | `Environment`, `Lightformer`, `Html` |
| `@react-three/postprocessing` | 3.0.5 | Bloom, vignette, chromatic aberration |
| `gsap` | 3.15.0 | ScrollTrigger. Free including all plugins since April 2025 |
| `lenis` | 1.3.26 | Inertial scrolling, wired into GSAP's ticker |
| `zustand` | 5.0.15 | Discrete chapter/beat state only |

## How it fits together

The single most important rule: **ScrollTrigger never touches React state or
three.js objects directly.**

```
scroll  ->  ScrollTrigger.onUpdate  ->  scroll{} (plain mutable object)
                                             |
                          useFrame reads it, damps toward it, writes transforms
```

A scroll event fires dozens of times a second. Routing that through React would
re-render the tree on every one and stall the render loop. So continuous values
(progress, camera, explosion amount) live in a plain object in
`src/scroll/scrollState.ts`, and only discrete values (which beat is showing,
once every few seconds) go through zustand into the DOM.

`src/three/driver.ts` turns those numbers into a camera position, an explosion
amount and a focus target, interpolated across the current chapter's beats. It
memoises on a frame stamp, so the interpolation runs exactly once per frame no
matter how many components ask for it — which avoids having to reason about
R3F's `useFrame` priority ordering, where a priority above 0 silently takes over
the render loop.

### Layout

```
src/
  content/chapters.ts   <- lecture 1; one file per lecture beside it
  content/lectures.ts   the course: every lecture, written or planned
  deck/
    deck.ts             discrete step navigation and its tween
    useDeckInput.ts     keyboard, pointer, touch
    narration.ts        the voice, and the play button that drives it
  three/
    driver.ts           deck position -> scene state
    Part.tsx            one addressable piece: explodes, dims, isolates
    Annotations.tsx     callouts anchored to parts
    Scene.tsx           camera rig, lighting, scene switching
    signal.ts           truth-table clock shared by the 3D and the DOM
    shapes.ts           logic-gate silhouettes as extrudable profiles
    scenes/             Cpu, Mosfet, Gate, Adder, Fabric (all procedural)
  ui/                   DOM story layer and HUD
```

## Adding a chapter

Most chapters need no new engineering. Append to `chapters` in
`src/content/chapters.ts`:

```ts
{
  id: 'gates',
  scene: 'mosfet',          // reuse an existing scene, or add a new SceneId
  marker: '04',
  title: 'Logic Gates',
  short: 'Gates',
  beats: [
    {
      id: 'inverter',
      kicker: 'NOT',
      heading: 'Two transistors make a decision',
      body: ['...'],
      camera: { position: [0, 3, 7], target: [0, 0, 0], fov: 34 },
      explode: 0.3,
      focus: 'gate',        // dims everything else
      isolate: true,        // or hides it, for enclosed subjects
      labels: [{ text: 'Gate', part: 'gate', offset: [0, 0.5, 0], tone: 'amber' }],
    },
  ],
}
```

The section height, chapter rail, progress bar and scroll triggers all derive
from this. A chapter's scroll length is `beats.length * 100vh`, and beat `i`
sits exactly `i * 100vh` into the section.

Only a genuinely new subject needs code: add a scene component under
`three/scenes/`, wrap each piece in `<Part id="..." position={...} offset={...}>`,
and register it in the `SceneId` union and the `SceneLayer` list in `Scene.tsx`.

### Authoring cameras

Camera framing is the fiddliest part. In dev, two console helpers exist:

```js
__goto('package', 4)   // jump to chapter id, beat index
__stage()              // camera, fov, aspect, model bounds, centre in NDC
```

`centerNdc` is the model centre in normalised device coords — `[0, 0]` is dead
centre. Desktop framing aims for roughly `[0.2, 0]`, which places the subject
clear of the copy column on the left. Both helpers are stripped from production
builds.

Note that beat cameras are authored against a ~1.7 aspect ratio; the rig
compensates automatically on narrower viewports (`REFERENCE_ASPECT` in
`Scene.tsx`), so you do not need to author mobile cameras separately.

## State of things

Seventeen lectures in the syllabus. Lecture 1 — six chapters, 28 beats, five
procedural scenes — is the one described below, and the only one with narration
written. Built and runtime-verified in Chromium at 1440×900 and 390×844:

- **01 — The Package.** Assembled to fully exploded, every layer labelled.
- **02 — Inside the Die.** Isolated die: cores, cache, I/O, the instruction loop.
- **03 — Down to the Switch.** MOSFET anatomy, plus a channel that forms and
  evaporates with electrons drifting through it.
- **04 — Logic Gates.** NOT, AND, OR and XOR as real gate silhouettes, switching
  live against a truth table in the copy panel.
- **05 — Arithmetic.** A half adder (XOR = sum, AND = carry), then eight adders
  chained with the carry rippling along.
- **06 — Ways to Arrange Switches.** CPU, GPU, unified memory, FPGA and a tensor
  systolic array — one die re-tiling itself between them.

Verified: a full run fires all 28 beats in order with correct copy,
scene and framing, and no frame where the copy panel is empty; the 3D gate wires
match their truth tables row for row, sampled in sync with the DOM table;
production bundle runs with 0 console errors; dev probes absent from the build.

**Not yet verified:** Safari and Firefox, real mobile hardware (only an emulated
viewport), and sustained frame rate under load — no profiling has been done.

Planned, per the roadmap in the page footer: the whole machine, how silicon is
made, and why clock speed stopped climbing.

## The signal simulation

Chapters 04 and 05 animate real logic. `src/three/signal.ts` is the single
source of truth: everything derives from one integer tick, so the lit wires in
the 3D scene and the highlighted row in the DOM truth table cannot drift apart.
The scene computes the tick from its own clock; the table reads the same number
out of a zustand store; both map it to a row through the same function.

Gate silhouettes (`src/three/shapes.ts`) are extruded 2D profiles rather than
labelled boxes, because the outline *is* the notation — a flat-backed D is an
AND and a curved shield is an OR, and anyone who has seen a circuit diagram
reads them without a legend.

Chapter 06 draws all five architectures from one fixed pool of 256 instanced
blocks that move, resize and recolour between layouts rather than being swapped
out. That is the chapter's argument made visual: a GPU is not a different
substance from a CPU, it is the same switches arranged with different
priorities.

## Navigation and pacing

Readers can free-scroll, click the arrows at bottom-left, or use the keyboard:
`←` `→` `↑` `↓` `PageUp` `PageDown` `Space` step one beat, `Home` returns to the
top and `End` jumps to the last beat. Those keys are `preventDefault`ed because
the browser's native scrolling would jump past Lenis and desync ScrollTrigger
for a frame.

Beat positions come from `src/scroll/beats.ts`: beat `i` of a chapter sits
`i * 100vh` past that section's top. The scroll hook measures the same geometry
itself rather than relying on per-chapter ScrollTriggers — a trigger running
`top top` to `bottom bottom` reports inactive exactly at its end, which is
precisely where each chapter's last beat sits and exactly where the arrow
navigation lands. That left the copy panel and the 3D showing different
chapters. If the section height in `Story.tsx` changes, both files change with
it.

Pacing is set by `hold` in `beatPosition` (`src/lib/math.ts`). At `hold = 0.28`
the scene is still for roughly 28vh either side of every beat and moves through
the middle 44% — so there is a settled frame to read against. Lower values make
the scene drift the whole time the copy is on screen, which reads as restless.
Measured over a full scroll-through, the scene is settled at ~82% of sampled
scroll positions.

One related detail worth keeping: `Part` damps its explode amount rather than
taking it straight from the driver. Inside a chapter that is nearly transparent,
but at a chapter boundary `explode` jumps (1 -> 0 when the next chapter starts
assembled) and an undamped value teleported every layer in one frame while the
camera glided — the mismatch read as a lurch.

## Narration and the play button

Press play (or `P`) and the deck advances on its own, reading each beat aloud
and pointing at what it is talking about.

This is the one feature that inverts the control model everything else is built
on — `useDeckInput` exists to make sure nothing continuous advances a beat — so
it is a mode, entered deliberately, and any manual step re-targets it rather
than fighting it.

### She points, she does not just read

A voice reading the copy aloud is worse than the copy, which can at least be
re-read. What a narrator can do that a page cannot is direct attention. So a
spoken line carries cues, and the player fires them the moment that line starts:

```ts
say: [
  { text: 'Current wants to run from this terminal, the source,', look: 'source' },
  { text: 'to this one. The drain.', look: 'drain' },
  { text: 'And above that gap sits the gate.', look: 'gate' },
]
```

- `look` — highlights a part and opens its glossary card, through the same
  hover store the reader's own pointer uses. The id must exist in `glossary`;
  `checkCues()` reports the ones that do not on every dev startup, because a
  cue that silently does nothing is the exact failure mode `docs/CHECKS.md`
  catalogues.
- `orbit` / `zoom` — a small camera nudge, in fractions of the reader's own
  drag limits, ignored mid-drag. Chapter 06 uses only these: its blocks are
  instanced and have no glossary entries to name.

Cues fire when muted too, so the guided tour works with the sound off.

### The script is a second register, not the copy read out

`say` sits beside `body` on the beat, colocated so the two cannot drift. Prose
written for a page does not survive being spoken: `250 W` and `~1 ns` are read
differently by every engine, and page-length sentences lose their shape aloud.

The scripts are written to *explain* rather than recite — set up a question,
name the thing, then pay it off — with `[pause]`, `[reflective]`, `[awe]` and
friends directing delivery for Eleven v3, and capitals marking the load-bearing
word. Those tags are stripped before the speech-synthesis fallback and before
captions, so only the renderer ever sees them.

All 28 beats of lecture 1 are scripted: 116 lines, 13,153 characters. The other
sixteen lectures have the mechanism and no script.

### Captions

The line being spoken, as text, toggled from the nav and remembered in
`localStorage`. Not a transcript — the copy card already is one — but one line
at a time, arriving with the voice. Muted, with captions on, the whole guided
tour still works.

### A different narrator each lecture

One voice reads a whole lecture, asides included, and the next lecture is read
by someone else. The rotation is the only place a voice ever changes, which is
what makes the change mean something.

```js
const CAST = [
  { name: 'Lily',    id: '...', accent: 'british'  },
  { name: 'Bella',   id: '...', accent: 'american' },
  { name: 'Alice',   id: '...', accent: 'british'  },
  { name: 'Matilda', id: '...', accent: 'american' },
]
```

Keyed on the lecture's number, so the casting never moves. Ordered so accents
alternate and consecutive lectures open differently — the hand-over reads as
deliberate rather than as a fault. Only voices ElevenLabs classes
`informative_educational` are in the pool; the account carries fifteen others
that are excellent and wrong for this.

**Rotating, not random.** Every line's hash includes the voice that spoke it, so
a random draw would pick differently on each run and re-bill the whole course
every time. A rotation looks just as varied and costs nothing to re-run.

An earlier version gave `aside` lines a second voice. That was right while every
lecture shared one narrator — the change of voice was the only thing marking the
change of register. Once each lecture has its own narrator it stops working: a
second voice inside a lecture competes with the hand-over between lectures, and
the listener cannot tell which boundary they just heard. The `aside` role stays
in the content because it still marks a register, and `--aside-voice` re-enables
a second reader for anyone who wants one.

### Choosing a voice

The course is narrated by women, so `--voices` filters to female voices
(`--all-genders` lifts it) and the speech-synthesis fallback scores female names
first. The four in `CAST` were chosen by ear from this account — an earlier
version of this script hardcoded one from memory, which is the wrong way to pick
something whose only real test is listening to it.

```bash
npm run narrate -- --dry                 # work and cost, nothing sent
npm run narrate -- --voices              # what the account has
npm run narrate -- --audition id1,id2    # three real lines in each, to ./audition
# the rotation supplies the voice; no id needed
ELEVENLABS_API_KEY=... npm run narrate

# override it entirely, for a different account
ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=<id> npm run narrate
```

`--audition` renders the same three lines from the course in each candidate —
a declarative opener, a number read aloud, and a turn into a payoff — because
what matters is how a voice handles this register, not marketing copy.

Defaults are `eleven_v3` (the model that reads sentence structure and audio
tags) at stability 0.5. Pass `--stability 0` for more colour and less
repeatability, or `--model eleven_multilingual_v2` if a run comes back
inconsistent between lines — duller, but steadier across 116 separate files.

### Why pre-rendered, not live

This deployment is a `dist/` directory served from the edge — static assets
and no Worker script at all. There is no server to hold an API key and no way
to synthesise at runtime without shipping one in the bundle. So audio is rendered on a developer's machine and served as a static
asset — one file per line, because a cue has to fire exactly when its line
starts and separate files make that exact rather than estimated.

Until somebody runs the render, the player falls back to the browser's own
`speechSynthesis`: free, no build step, working the moment the code lands, and
markedly worse. **The fallback is not the product.** Judging the narration on it
is judging the wrong thing.

Re-runs are hashed per line against text, voice, model and settings, so fixing
one sentence re-renders one file rather than re-billing the lecture — and
re-casting one role re-renders only that role's lines.

The API key needs the `text_to_speech` and `voices_read` scopes. ElevenLabs
keys are scoped on creation, and a key with only `text_to_speech` authenticates
fine and then fails on `--voices` with a 401.

The MP3s are committed rather than ignored: the deploy builds from a checkout
and uploads whatever `dist/` holds, so there is no other way to get them, and
audio missing from the upload degrades silently to the synthesiser. At 64 kbit/s a lecture is around 5 MB — fine for
one, wrong for seventeen. If the course gets scripted through, this moves to
object storage before the repo does.

### How long a beat lasts

Manual stepping never had to answer this; autoplay does. The hold is the
longest of the narration, the written copy at reading speed, and `sceneDwell` —
one full truth-table cycle for the beats in chapter 04 that say "watch the
table". That floor lands correctly because `driver.beatTime` restarts on beat
entry, putting row 0 at the moment the copy appears. It does not bind for
lecture 1, where every script runs longer than its cycle, so it is a guard for
shorter beats rather than an active constraint.

## Known trade-offs

- **Bundle is ~397 kB gzipped**, nearly all three.js and postprocessing. Fine
  for a visual piece; if it matters, code-split the postprocessing chunk.
- **The cooler was cut** from the package chapter. It is physically separate
  from the package and so much larger that it read as the subject of the shot,
  and its thin fins aliased badly.
- **MOSFET proportions are stylised.** A real gate oxide is ~1 nm against a
  ~20 nm gate length and would be invisible at any usable scale. The topology is
  faithful; the thicknesses are not.
- **Postprocessing degrades on small viewports** and under
  `prefers-reduced-motion`: lower DPR cap, no multisampling, weaker bloom.

## License

Code: [MIT](LICENSE). Lecture text, narration and images:
[CC BY 4.0](LICENSE-CONTENT.md).
