# Motion

How things move in this course, and why. Companion to `CURRICULUM.md`, which
covers what each lecture says; this covers what each lecture *does*.

## The rule

**Motion carries the argument. If you changed the motion, the lesson would
become wrong.**

That is the test, and it is falsifiable. Apply it to anything that moves:

- A CPU's packets pause mid-trip. Remove the pause and the beat about stalls has
  nothing to point at. ✅ load-bearing
- A GPU's lanes step in one bar. Stagger them and it becomes a CPU. ✅
- DDR moves as a rank and turns around; PCIe runs both ways at once. Swap them
  and the chapter teaches the opposite of the truth. ✅

  *This line used to read "DDR runs both ways over short lanes; PCIe runs one
  way over long ones", and an audit found the code had both buses bidirectional,
  erasing the contrast. The obvious fix — make PCIe one-way, as the doc said —
  would have been worse than the bug, because PCIe genuinely is full-duplex. The
  doc was wrong, not the data. The true distinction is **half against full
  duplex**: DDR's data lines are shared, so every lane moves together in one
  direction and the bus goes still while it turns around; PCIe has a pair per
  direction and never stops. That is both truer and more visible than what was
  originally specified, and the turnaround gap teaches something the old version
  could not — why mixing reads and writes costs more than either alone.*

  **When a doc and the code disagree, establish which one is right before
  "fixing" the code to match.**
- Dust motes drift in the background. ❌ decoration — fine, but it is scenery,
  not teaching, and it should never grow.

The failure mode is ambient motion everywhere: when everything moves, nothing
means anything, and the reader stops reading movement as information.

**This rule was written and then not held to.** An audit of every animated thing
in the course found fifteen free-running sines, and most were "this object is
alive" filler that argued nothing — several actively arguing the *opposite* of
their own beat's copy:

| Was | Argued | Now |
|---|---|---|
| Ladder core pulsing | "busy", identically at every tier | Lit only while it has work — 41% of the time at L1, 23% at memory, 11% at storage |
| Latch gates breathing | "changing" | Steady. The copy says holding looks like stillness; now it does |
| Board SoC heartbeat | "working hard", including on the two beats whose point is that it is idle | Follows what it is actually doing; dark during DMA and interrupt stalls |
| Heat pipe throbbing | heat arrives in waves | A steady gradient, hot end to cold end — the mechanism |
| Cores pulsing on every package beat | nothing; the die is under a soldered lid | Only on the beats about cores running |
| Six kernel programs glowing gently | all equally busy | Lit while they have a request in flight |

The tell is easy to check: if the animation would look the same on a beat that
claims the opposite, it is decoration.

**Corollary — the hold matters as much as the move.** Beats settle and stay
settled while the copy is being read. Continuous drift is what makes a piece
feel restless and is why the step tween eases to a genuine stop rather than
damping asymptotically toward one.

**Corollary — a handover is a cut, and it lands on the fastest frame.**
Changing chapter is one frame: the departing scene leaves at full size and the
arriving one is already there, a little under size, settling the rest of the way
in. That frame is the middle of the step tween, where `smootherstep` is
steepest and the camera is moving faster than anywhere else in the move.
Cutting on motion is the oldest trick in editing and it works here for the same
reason.

This took three attempts and the first two both shipped, so the reasoning is
worth keeping. A scale-only handover has exactly three options and two of them
are bugs:

| | What the reader sees | Measured |
|---|---|---|
| **Overlap** | Both chapters at once | The departing scene held at 0.36 scale for ~800 ms *after* the camera arrived, then vanished in one frame |
| **Gap** | A blink | At the midpoint the departing scene was at 0.054 and the arriving one at 0.007 — an empty frame |
| **Cut** | A cut | Nothing absent, nothing doubled |

A cross-fade would be the fourth and it is not available: fading needs opacity,
and these scenes are full of coplanar slabs that flicker the moment they are
made transparent. **A cut is only a pop when nothing replaces what left.**

The other half of the same mistake was keying the swap to the interpolated beat
index rather than to the reader's gesture, so clicking a chapter six beats away
marched through every beat in between — five chapters on screen at once, all
animating, the copy card remounting for each. Both are "which scene is showing"
treated as a continuous quantity rather than as a thing the reader asked for.

**Corollary — an off-screen chapter answers to nobody.** `focus` and `isolate`
belong to the beat being read, and for every chapter that is not on screen that
beat is somewhere else entirely — so nothing in them matches, and an isolate
beat quietly shrank away whole chapters nobody was looking at. The cut then
landed on a chapter whose parts were all already hidden: one black frame, and
~0.4 s of them scaling back in. The damped handover had been smearing this for
as long as it existed; making the handover honest is what exposed it.

**Nothing animates for a chapter nobody is looking at.** All twenty scenes are
mounted at once, so this had to be made true rather than assumed: off-screen
scenes tick at ~10 Hz instead of every frame, with the elapsed time accumulated
so their damped state still arrives where it would have. Throttled rather than
skipped, deliberately — a skipped chapter would be caught mid-morph on arrival,
wearing whatever architecture it happened to be showing when the reader last
left it.

---

## The vocabulary

Eight motions are built and proven across Lectures 1 and 5. Six more are needed
for what remains. Each entry says what the motion *means*, so the wrong one
isn't reached for.

### Built

| Motion | Says | Used in |
|---|---|---|
| **Explode** | This is made of parts, and here is their order | Package, board |
| **Focus / dim** | Look here | Everywhere |
| **Isolate** | The others would occlude, or are irrelevant now | Die under lid, buses under the heat pipe |
| **Emissive pulse** | This is doing work — staggered phase means independent, shared phase means lockstep | Cores, blocks, the die |
| **Flow along lanes** | This is how data moves, and *how* it moves is the lesson | Fabric packets, board buses, cell charge |
| **Morph** | This is the same thing, rearranged | Architectures re-tiling one die |
| **Cut + settle** | This is a different thing | Memory cells: latch vs SRAM vs DRAM |
| **Reader orbit** | You may look around; the framing is still authored | Every beat |

Morph and cut are a matched pair and choosing wrongly makes a false claim.
The architectures chapter morphs because it is genuinely one die re-tiled. The
memory-cell chapter cuts because a NOR gate is *not* a variation on a capacitor,
and morphing between them would say it was.

### Needed

| Motion | Says | Needed for |
|---|---|---|
| **Travel-time** | Distance is time — the journey *takes* proportionally longer | L2 the ladder |
| **Fill / drain** | State accumulates or leaks away | L2 refresh, L5 battery, L11 thermal |
| **Barrier crossing** | Something crossed a boundary and was checked | L7, L8, L9 |
| **Queue / contention** | Many want one resource and must take turns | L8 scheduling, L13 bus arbitration |
| **Attrition** | This is finite and degrades | L2 flash wear, L16 radiation |
| **Rate contrast** | Two loops at genuinely different speeds, in one frame | L14 control vs perception |

**Travel-time is the one to get right.** It is the only motion where the
animation *is* the number, and it has an honesty problem: at true scale an L1
hit is ~1 ns and a DRAM hit ~80 ns, so if L1 takes 0.1 s then RAM takes 8 s and
an SSD read takes over an hour. Nobody will wait. The options, in preference
order:

1. **Compress the axis, print the truth.** Lay tiers out on a log scale, run the
   packet at constant speed so the *trip* is visibly longer, and put the real
   figure on screen. Honest, readable, and the log axis is itself worth teaching.
2. Real-time for the near tiers only (registers → L3), then a labelled cut.
3. Real ratios throughout. Correct and unwatchable.

Pick 1, and say on screen that the axis is logarithmic. A visualisation that
silently compresses a ratio it is trying to teach has undermined itself.

---

## Naming what is on screen

Motion says what a thing is *doing*. The pointer says what it *is*, and the two
are different registers on purpose — a reader who is hovering has stopped
reading and started pointing, and wants a name and one fact, not another
paragraph.

This was built for Lecture 1 and then not extended. An audit found the package,
the transistor, the gates, the architectures and the board carrying forty named
parts between them, and **fourteen of the twenty scenes wrapping their entire
contents in a single `Part`** — so the memory ladder answered "the memory
hierarchy" wherever you pointed at it, and the kernel, the wafer, the phone, the
car and the rest answered with one name each or nothing.

Two mechanisms, and which to use is decided by whether the beat can address the
thing:

- **`Part`** for anything a beat spotlights, isolates or explodes. It owns its
  materials, so it says "this one" by lifting toward white.
- **Role naming** (`naming.ts`) for everything else — a memory array is two
  hundred identical cells, a rack is forty identical nodes, a schematic is
  however many transistors that layout needs. A `Part` each would mean an id, a
  focus target and a registry entry per element, all to answer a question with
  as many distinct answers as there are *kinds* of thing.

Role naming cannot tint what it names: the scenes write emissive every frame to
say what their geometry is doing, and a hover writing to the same channel would
either be overwritten or would overwrite the lesson. So the highlight is a
separate wire cage that sits around the body instead of changing it, drawn
without depth testing because half of what gets named in this course is inside
something else.

Three things the pattern has to get right, all of them learned the hard way:

- **A role can change between beats.** The radiation chapter's grid is a memory
  array, then an array of neurons, then a register of qubits, and it is the same
  meshes throughout. Naming resolves when the pointer asks, not when the mesh
  was built.
- **A name that carries a number the scene animates must read the same table the
  scene does.** The memory ladder's tiers name themselves from `TIERS` — the
  latency in the tooltip is the same figure that decides how far the packet has
  to walk. A hand-written line would be a second copy, free to drift.
- **An enclosing volume must not be nameable.** The implant's tissue block
  contains the threads and the chip, and the nearest hit wins.

---

## Before the next lecture: extract three primitives

Two lectures produced **2,937 lines** of scene code, and an audit says a large
share of it is the same three things written repeatedly:

- `sampleLane` in `boardLayout.ts` and `sampleWire` in `cellLayouts.ts` are the
  same function, and the memory ladder was about to need a third copy.
- **Five** scenes hand-roll an instanced-packet `useFrame` loop.
- **Three** hand-roll polyline → `lineSegments` geometry.

At 1,470 lines per lecture, seventeen lectures is ~25,000 lines of scene code,
most of it duplicated. Extract these first and each new lecture becomes mostly
*data*:

**`Lanes`** — a set of polylines. Builds the `lineSegments` geometry, and
answers "where am I at 0..1 along lane *n*" by arc length. Replaces two copies
of the sampler and three geometry builders.

**`Flow`** — instanced packets travelling `Lanes`, parameterised by speed, hue,
direction, density and a per-packet phase function. Every existing motion
signature becomes a config rather than a loop: lockstep is "all packets share a
phase", stalling is "phase includes a hold", systolic is "two lane sets at right
angles".

**`Blocks`** — instanced boxes with per-role colour and an activity function.
Covers the fabric's 256 cells, the memory cell's transistors, and the board's
components.

Estimated after extraction: a lecture reusing existing grammar drops from
~1,400 lines to ~400, most of it content.

**The fourth grammar still does not exist.** Barrier crossing, queue/contention
and rate contrast have no implementation, and they gate Lectures 7 through 9 and
parts of 13 and 14. That is a build, not a refactor, and it should follow the
extraction rather than precede it — the three primitives above are what it will
be built out of.

---

## Per-lecture motion signature

What moves, and what the movement argues. One line per lecture; the beat-level
detail belongs in each lecture's content file when it is written.

### Part I — Silicon

**L1 The Chip** ✅ *built* — Explode down the package stack; the channel
appearing and vanishing under the gate; gates lighting against live truth
tables; one die re-tiling through five architectures, each with its own traffic
character.

**L2 Memory & State** 🟡 *cell scene started* — Three signatures. **The loop**:
a signal circulating in a cross-coupled pair with nowhere to go, which is what
"remembering" looks like when nothing else in the course could. **Leak and
refresh**: a capacitor dimming steadily then snapping back — every cell every
64 ms, ~16 times a second, while the controller issues refresh commands every
~3.9 µs to work through them all. **Travel-time**: the ladder, log axis, real
numbers on screen.

**L3 Time** — A conveyor. Instructions advance one stage per tick against a
global metronome; a hazard inserts a visible bubble; speculation runs ahead on
faith and, when wrong, *rewinds* — the flush is the cost made visible. Closing
beat: raise the clock and watch power climb superlinearly until it stops being
worth it.

**L4 How Silicon Is Made** — Exposure: mask, light, and a pattern that *appears*
rather than being drawn. Then layers stacking, a wafer speckling with defects,
and dies sorting into bins. Yield is the motion: same wafer, different defect
density, different piles.

### Part II — The Machine

**L5 The Board** ✅ *built* — Bus character: DDR bidirectional over short
length-matched lanes, PCIe one-way over four long ones, power one-way and
never stalling, USB out to the edge. Fan spins up on the thermal beats.

**L6 I/O** — Two contrasts, both about who is doing the work. **Interrupt**: a
packet mid-journey is preempted — it stops, something else runs, it resumes.
**DMA**: data moves and the CPU packet never participates at all. The lecture is
those two clips side by side.

**L7 Boot** — The only linear timeline in the course. Regions light in strict
order, each unlocking the next, from a single voltage rail to a running kernel.
Nothing loops.

### Part III — Software *(needs the fourth grammar)*

**L8 The Kernel** — Barrier crossing: a request hits a wall, is inspected, and
is let through or refused. Address translation as a checkpoint that *rewrites*
what passes. Scheduling as a queue with one slot and visible preemption.

**L9 Operating Systems** — Crossing count as the argument: monolithic keeps
everything inside one wall, microkernel splits it into many, and the extra
crossings are the cost you can watch. RTOS adds a deadline line that work must
finish before.

**L10 From Code to Current** — A continuous descent through every scene already
built, source down to a switching transistor. Cheap to build and the payoff of
the whole course, because it reuses everything.

### Part IV — Machines for Purposes

**L11 The Phone** — Power gating: blocks going fully dark when unused, which no
earlier lecture has shown. Big and little cores on visibly different rhythms.
Thermal throttle: the clock *slowing* as heat accumulates in a sealed slab.

**L12 The Edge** — Mostly stillness, deliberately. Everything dark, an event
arrives, a brief flare of activity, back to dark. The absence of motion is the
lecture.

**L13 The Car** — Contention: many ECUs wanting one bus, priority winning,
lower-priority messages waiting. Zonal: wiring visibly collapsing from a harness
into zones. Lockstep: two cores doing identical work in parallel, compared every
cycle, with divergence flagged as a fault.

**L14 The Robot** — Rate contrast, in one frame: a 1 kHz control loop and a slow
perception loop at their true relative rates. Then a deadline miss, and what it
costs.

**L15 The Datacenter** — Scale-out. One node, then a rack, then many; a job
sharded across them; interconnect traffic as the thing that actually limits it.

**L16 The Extremes** ✅ built — Attrition: radiation strikes flipping bits at
random, and redundant units voting to outvote the damage. Built and measured:
unprotected damage accumulates 1→3→4→6→7→8 and never recovers; scrubbed damage
holds steady at 2; hard errors only ever increase. The dense array takes 7–8
corrupted cells to the coarse one's 2 from the same strikes, which is the
cluster, not a higher rate.

Attrition is the one motion in this table that **cannot** run on the page clock,
and building it is what surfaced the fact that nothing else could either. A
count that resets every cycle is not attrition, it is a blinking light.

**L17 The Implant** ✅ built — Two motions and both are ceilings.

A **thermal bar** that activity pushes up and must not cross the line. Measured:
14.8 → 20.1 → 25.4 → 30.7 → 35.9 → 39.8 mW, then clamped at 40 and held, never
crossing. The steady beat sits at 24.7 mW, which is a real part's real draw.
*The number changed during authoring:* the plan said ~70 mW (the thermal bound
for 1 °C of tissue rise), but the guideline cap actually applied to implanted
interfaces is 15–40 mW depending on depth. The lecture uses the tighter figure,
because against 70 mW a 24.7 mW device has comfortable headroom and the chapter
has no argument.

And a **funnel**: far more signal arriving than can ever leave, which is why the
computing has to happen inside. Measured at the constriction — `raw` 96 in / 0
out, `pipe` 96 in / 2 out (48:1 on screen against a real 200:1, disclosed), and
`spikes` 23 in / 11 out with only 15 of 64 threads lit. The resolution beat
deliberately shows *fewer* packets leaving than the failure beat, not more: at
full admission the outbound column was denser than the jammed one it contrasts
with, which reads as "now there is more data" — the opposite of the claim.
