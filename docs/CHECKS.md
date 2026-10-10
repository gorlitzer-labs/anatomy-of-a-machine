# Checks

How to verify a change to this project, and the traps that have already caught
someone.

## Typecheck

```
npm run typecheck     # tsc -b
```

**Do not use `tsc --noEmit`.** The root `tsconfig.json` has `"files": []` and
only project references, so `tsc --noEmit` type-checks *nothing*, exits 0, and
prints nothing. It is indistinguishable from a passing check.

This was not theoretical. A whole session's worth of changes was "verified" with
`tsc --noEmit`, and it let a missing import reach the browser — `PRIORITY is not
defined`, 182 console errors, the arbitration readout silently blank. Verified
by appending `const broken: number = 'nope'` to a source file: `tsc --noEmit`
reported success, `tsc -b` reported the error.

```
npm run lint          # oxlint
npm run build         # tsc -b && vite build
```

## The beat audit

Run against a dev server, in the browser console or via Playwright. Sweeps every
beat of every lecture and reports: nothing visible, copy missing, callouts over
the copy card or the chapter rail, callouts outside the viewport.

Two things it gets wrong if you are careless:

- **Settle time.** Stepping via `location.hash` is a cut, but part dimming,
  focus strength and callout mounting all ease. Under ~900 ms the measurements
  are of a scene mid-transition, and callouts will be reported over the card
  that are nowhere near it. An early run produced 182 "problems" that were
  almost entirely this.
- **Same-hash navigation.** `page.goto` to a URL differing only in its hash does
  not reload, and `location.hash = x` when the hash is already `x` fires no
  `hashchange`, so the deck never moves. If the app appears stuck on the
  syllabus, the page is stale — reload it properly.

## Measuring an animation

The recurring failure in this project — **eight times now** — is an aggregate
measurement swamped by something static, reported as "no change" while the scene
works perfectly.

- `__signals(part)` reports emissive for every mesh **whether or not it is
  visible**. Scenes that hide things with `mesh.visible = false` are invisible to
  it. The unpipelined and pipelined beats of Lecture 3 measured 18.0 against
  18.5 while looking completely different; asked directly, they are 1 against 5.
- Scene bounding boxes are set by whatever is largest, usually a floor or a
  substrate that never changes. The datacenter's scale-out measured as "no
  change" because the floor dominates.
- **NDC bounds are not a framing test.** The implant measured −1.5 and looked
  wrong; the datacenter ships at −2.07 and looks right, because the box includes
  geometry deliberately running past the frame. Framing is checked by looking.
- Screenshot diffs with mismatched waits produce phantom regressions, and a
  control with identical waits is worthless because it samples the same phase.
- Sampling at 20 Hz cannot resolve a 15.6 Hz sawtooth. If the thing being
  measured is near the sample rate, the answer is aliasing, not evidence.

**The fix is always the same: add a dev probe that reports the quantity the beat
is about, and read that.** `__pipeline` returns instructions on screen;
`__extremes` returns corrupted and dead cells; `__funnel` returns packets each
side of the constriction; `__racks` returns racks actually rendered.

## Layout, at the sizes people actually use

The wide layout is not one layout. The copy card is a fixed 480 px inside a
`clamp(1.5rem, 6vw, 7rem)` gutter, so its *share* of the frame grows as the
window narrows: 39% at 1440 px, 48% at 1133 px — an iPad Mini in landscape,
which sits just above the 820 px compact breakpoint and therefore gets the
desktop layout in its most cramped form.

Audit both. A clean run at 1440x900 said nothing about 1133x744, where eight
callouts sat on the copy.

**Sliding the model right does not fix this**, and it was tried: it moves the
collisions into the chapter rail on the other side, because the free band
between card and rail is narrower than the model. Net result was 8 problems
becoming 10. Callouts avoid the chrome themselves instead — a label whose
authored side is obstructed mirrors about the part it names, and if neither side
is clear it stays put, because a callout that jumps every frame is worse than
one that overlaps. A purely vertical or depth-only offset cannot flip (mirroring
x = 0 is a no-op), so those need a lateral component.

## Chapter transitions

Two clocks run in `driver.ts` and conflating them is the bug to look for.

The **path** is `deck.current` sweeping continuously from one beat index to
another; the camera rides it, which is what makes a jump across four chapters
read as a flight rather than a cut. The **move** is the single gesture the
reader made — from one beat, to one other beat, however far apart. Everything
discrete belongs to the move: which scene renders, what is spotlit, which copy
is on screen, beat-local time.

Keying the discrete state to the path instead meant that clicking a chapter six
beats away stepped through every beat in between at roughly twenty per second.
Measured with `__layers()`: **five scene layers on screen at once**, each still
animating, and the copy card remounting for every beat it passed. It was
invisible when stepping one beat at a time, because for a single step the two
clocks agree exactly — which is why it survived so long.

```js
window.__layers()      // [{ id, visible, scale }] for every layer on screen
window.__trace(2000)   // every frame for 2 s: camera, layer scales, meshes drawn, emissive
```

`__layers()` sampled over a browser round-trip is enough to catch a chapter
bleeding into the next. It is **not** enough to catch a jump, because a jump is
a one-frame event and every round-trip spans tens of frames. That is what
`__trace` is for: it records on the render loop and hands the whole thing back
afterwards, so the frame the jump happened on is still in it.

Three invariants, all countable from one trace, all of which have been violated
by shipped code:

- **`blank = 0`** — no frame where nothing is legible. Strictly sequential
  handover windows put a hole in the middle of the move: 0.054 against 0.007 at
  the midpoint, which is an empty frame, which reads as a blink.
- **`doubled = 0`** — no frame with two chapters legible at once.
- **`starved = 0`** — no frame where a chapter is on screen with nothing drawn
  in it. This one is not about the handover at all: parts obey `focus` and
  `isolate`, which belong to a beat in a *different* chapter while they are off
  screen, so an isolate beat had already hidden the whole of the incoming
  chapter before the cut landed on it.

Then per-channel velocity discontinuity, as a multiple of that channel's own
typical speed — frame-rate independent, so a slow headless run is fine. Camera
and explode should sit around 1; anything in the tens is a real step.

Two traps in reading the emissive channel:

- **A scene cut steps it legitimately.** A different chapter is a different set
  of lights. Drop any window spanning a change of scene or every boundary in the
  course reports as a pop.
- **Discrete is often the lesson.** The clock snaps because a clock is discrete;
  the DRAM capacitor snaps because that sawtooth is refresh; a pipeline flush is
  abrupt because the flush is the cost. A high emissive discontinuity inside one
  scene is a question, not a finding — go and read what that beat is arguing
  before calling it a bug.

The useful absolute version is the largest single-frame change in **meshes
drawn** within one scene. Almost every scene here scales things away and hides
them at 2% (`visible = v > 0.02`), so a large step is only real if the geometry
was at full size when it vanished. Grepping for `.visible =` and checking each
one is gated on a damped value found the single exception in the whole course:
three kernel services appearing and disappearing in one frame.

Both a rail jump and a spammed arrow key have to be checked; interrupting a move
restarts it with a new pair of endpoints.

## Naming, and what the pointer can reach

Hover coverage is checked by sweeping the pointer over a grid of canvas
positions and collecting distinct tooltip titles — Playwright's `page.mouse.move`
and a read of `.tip`, not synthetic `PointerEvent`s, which do not carry what
R3F's raycaster needs. Allow ~200 ms per position: at 20 ms the sweep misses
things that are genuinely reachable and the result reads as a coverage hole.

Two real bugs it found, neither visible any other way:

- **A transparent volume swallows everything inside it.** The implant's tissue
  block encloses the threads and the chip, and the nearest hit wins — naming the
  tissue made every part of the implant unreachable. An enclosing volume should
  not be nameable.
- **A tooltip outliving its chapter.** Every scene is mounted at once, and a
  `<group>` is visible at scale 1 until the first frame puts it where it
  belongs — so a pointer resting over the canvas at load time named a part of
  some other lecture, and since the pointer never moved, no `pointerout` ever
  arrived to take the card away. Layers now mount hidden, and changing scene
  clears the card.

## Readouts

`publishReadout(scene, activeScene, readings)` renders live figures into the copy
card. Every scene is mounted at once, so a publisher that does not check it is
the visible scene will race the others, and whichever runs last in the frame
wins — which first showed the memory ladder's readings on an I/O beat, and then,
once the readings were scene-tagged, silently blanked them instead. Passing both
scene ids makes the guard impossible to forget.

Off-screen chapters now tick at ~10 Hz rather than every frame (`useSceneFrame`),
which reduces the race but does not remove it: a scene one frame into its
handover is on screen by this test and may still publish. The guard is still
required. `__frameload()` reports how much scene work is being skipped —
around 75-80% of scene-loop calls on a typical beat.

## Before claiming something works

Merged is not shipped. Distinguish:

- **code complete** — typechecks (with `tsc -b`), lints, PR merged
- **deployed but unverified** — live on the host, no runtime confirmation
- **shipped and verified** — measured on the deployed host

A number in the copy is a claim. If a scene computes it, publish it as a readout
and check the two agree; if it cannot be computed, state it as a checked figure
in the layout's header comment and say where it came from.
