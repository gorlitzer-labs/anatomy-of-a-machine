# Anatomy of Machines — curriculum

The full map. Not a commitment to build all of it; a commitment to know where
each piece goes before building any of it.

## The spine

Every machine in this course is the same handful of primitives — switches,
wires, memory, a clock — under a **different constraint budget**. A phone SoC
and a car ECU and a TPU are not different technologies. They are the same
technology with different things sacrificed.

So every chapter answers the same two questions:

1. **What dominated?** (energy, latency, cost, heat, safety, size, lifetime)
2. **What was traded away to satisfy it?**

That framing is already load-bearing in Lecture 1: FPGA → ASIC → CPU → GPU →
NPU is one trade made four times — give up the ability to do anything, gain
speed at one thing. Part IV is that same sentence applied to whole machines
instead of whole chips.

**The failure mode to avoid:** 16 lectures of "here is a thing, and here is
another thing." That is a wiki. The constraint framing is what makes it a
course. If a chapter can't name what it trades, it isn't a chapter yet.

---

## PART I — SILICON

*What everything is made of. Bottom-up, physical, teardown grammar.*

### Lecture 1 — The Chip ✅ built
Package · Die · Transistor · Gates · Arithmetic · Processor units

The ladder from a slab you can hold to a switch a few dozen atoms across, then
back up to the five ways people arrange those switches.
**Constraint:** none yet — this is the vocabulary.
**Status:** live, 28 beats. Units chapter runs FPGA → ASIC → CPU → GPU
(+ tensor cores) → NPU/TPU → a closing beat that cycles all five, and unified
memory has moved out to Lecture 2.

### Lecture 2 — Memory & State ✅ built
Remembering · Cells · The Ladder · Keeping It — 4 chapters, 13 beats

Arithmetic without state isn't a computer. This is the missing half of Lecture 1
— everything so far can decide, nothing can remember. Also the natural home for
**unified memory**, relocated out of the units chapter where it never fit.
**Constraint:** distance is time. Every memory technology is a different bribe
paid to physics for a shorter walk.
**New scenes:** latch/flip-flop, DRAM cell array, cache hierarchy.

### Lecture 3 — Time ✅ built
The Clock · Pipelining · Guessing · The Wall — 4 chapters, 9 beats

**Constraint:** light only moves so far per tick. Everything clever in a modern
core is an attempt to not wait.
**New scenes:** pipeline stages as a conveyor, hazard bubbles, speculation.

### Lecture 4 — How Silicon Is Made
The wafer · Photolithography · EUV · The metal stack · Yield and binning ·
Why "3nm" is marketing · Chiplets and advanced packaging

**Constraint:** you are printing with light at a wavelength larger than the
thing you're printing. Closes back to Lecture 1's package.
**New scenes:** lithography exposure, wafer/yield map, chiplet assembly.

---

## PART II — THE MACHINE

*A chip becomes a computer. Still teardown grammar — this part is cheap to build
because the engine already does physical explosion.*

### Lecture 5 — The Board ✅ built
The Board · Power · Buses · Heat — 4 chapters, 13 beats

A laptop taken apart the same way the CPU package was. Highest value-per-effort
lecture in the course: new content, existing visual grammar.
**Constraint:** a sealed box with a fixed power and heat budget — the battery
sets how much energy exists, the regulators how much reaches the chip, the pipe
and fan how much heat can leave, and whichever runs out first is the real limit.
It is almost never the silicon.

Clocks and crystals were cut rather than crammed in; they belong with Lecture 3,
where pipelining gives them something to be about.

### Lecture 6 — I/O ✅ built
Interrupts · Getting Out of the Way · The Outside World — 3 chapters, 8 beats

How a machine touches the world. Sets up everything in Part IV — robots and
cars are mostly I/O problems wearing a compute costume.
**Constraint:** the world is analogue, asynchronous, and does not wait for you.

### Lecture 7 — Boot ✅ built
Cold · The First Instruction · The Handoff — 3 chapters, 8 beats

The single best narrative chapter available: voltage rises, and eleven seconds
later there is a prompt. Also the bridge from Part II to Part III.
**Constraint:** at t=0 nothing is initialised, including the thing that
initialises things.

---

## PART III — SOFTWARE

*The fourth grammar now exists: containment. Built bespoke for Lecture 8 and
extended by Lecture 9 rather than designed up front for hypothetical callers.
An inside, an outside, a wall enforced by hardware, and one contended thing at
the centre.*

### Lecture 8 — The Kernel ✅ built
Two Worlds · Asking · Taking Turns · Every Address Is a Lie — 4 chapters, 9 beats

**Constraint:** one machine, many programs, none of which trust each other.

### Lecture 9 — Operating Systems ✅ built
Where the Wall Goes · Families · Deadlines — 3 chapters, 8 beats

The RTOS chapter is load-bearing — it's the hinge into cars and robots.
**Constraint:** who gets to decide what runs next, and can you prove it decides
in time.

### Lecture 10 — From Code to Current ✅ built
What You Wrote · The Contract · Where It Runs · What Actually Happens ·
Current — 5 chapters, 10 beats

The payoff, and the only lecture that could not have been written earlier: it
descends through the scenes the course already built. One new scene at the top
of the ladder; after that it is the pipeline from Lecture 3, the adder from
Lecture 1 and the transistor from Lecture 1, revisited with a different
question. **Parts I–III are complete.**

---

## PART IV — MACHINES FOR PURPOSES

*The same primitives, recombined under radically different budgets. Each lecture
is one dominant constraint and everything sacrificed to it.*

### Lecture 11 — The Phone ✅ built
One Die · Not All Cores Are Equal · Dark Silicon · The Sealed Slab —
4 chapters, 10 beats

**Dominant constraint: energy per task.** Traded: sustained performance,
serviceability, thermal headroom. The lecture turns on one measured gap — a
phone sheds roughly 3–5 W continuously while heavy work asks for 6–10 W and
more, so peak performance is by definition temporary. And the ceiling is *skin*
temperature (governors hold ~43–48 °C), which means the limit is a hand, not
the silicon.

Proves the Part IV format: same machine, different budget, pointing back at
lectures that already exist.

### Lecture 12 — The Edge ✅ built
Asleep · Wake, Work, Sleep · What It Gave Up — 3 chapters, 8 beats

**Dominant constraint: power, and no human nearby.** Traded: an OS, a screen,
the assumption that you can reboot it. Sleep runs 0.1–5 µA against 15–20 mA
awake, and a device awake 0.01% of the time averages ~6 µA — so battery life is
decided by the duty cycle, not by any datasheet headline.

The only scene in the course whose main event is that nothing happens: 8.3×
brighter awake than asleep, quiet 81% of the time, five of six blocks fully
dark and one counter that never stops.

### Lecture 13 — The Car ✅ built
Not One Computer · One Wire, Many Talkers · Rewiring · It Must Not Fail —
4 chapters, 10 beats

**Dominant constraint: it must not fail, for fifteen years, in a vibrating oven.**
Traded: cutting-edge silicon, cost, update freedom. CAN arbitration is bitwise
and non-destructive — the winning frame survives intact and never resends, which
is the property that lets you put brakes on it. Zone-wiring halves the harness
on screen (measured). Lockstep is the ASIL D route; AEC-Q100 Grade 1 is
−40 °C to 125 °C.

*Current as of 2026: zonal is production reality, not roadmap — OEMs have
largely already left domain-based E/E architectures. Hardware complexity drops,
software complexity explodes. That inversion is the chapter's punchline.*

### Lecture 14 — The Robot ✅ built
Two Loops · Two Brains · Late Is Wrong — 3 chapters, 8 beats

**Dominant constraint: close a physical loop before the world moves.** Traded:
generality. Rate contrast is the signature — the control loop laps the
perception loop 8× on screen (nearer 30× in reality, stated in the copy), and a
missed deadline is shown as the arm physically overshooting rather than as a
statistic.

*Current as of 2026: motion loops typically run 100 Hz–1 kHz on an MCU with
microsecond determinism, while perception runs Linux-class on an SoC. The live
industry question is whether unified SoCs with hardware-enforced IPC can
collapse that split into one chip. Perfect chapter tension — an unresolved
argument, not a settled fact.*

### Lecture 15 — The Datacenter ✅ built
One Node · Then Many · Splitting the Work · The Real Budget — 4 chapters, 10 beats

**Dominant constraint: throughput per watt per dollar, times a hundred thousand.**
Racks went ~16 kW (2025) → ~27 kW (2026), AI racks reach ~130 kW, at which point
air cooling is not inefficient but *incapable*. PUE runs 1.09–1.20 at hyperscale
against 1.5–1.8 enterprise — a third of the bill spent on not computing.

The gather beat is the point: scatter and compute scale perfectly, the gather
does not, and the room visibly goes dark while every answer converges on one
place.

### Lecture 16 — The Extremes
Rad-hard and space · Why a Mars rover runs a CPU slower than a 1998 desktop ·
Neuromorphic and quantum as not-von-Neumann
**Dominant constraint: survival.** Traded: everything else, cheerfully.

**Status:** live, 11 beats. One grid of cells under three disciplines — struck
by particles, then spiking, then measured. Verified at authoring time: RAD750
110–200 MHz / 10.4 M transistors / ~1 Mrad / −55 to +125 °C, descended from the
1998 iMac's PowerPC 750; superconducting qubits at 10–20 mK.

**A planned beat that turned out to be wrong.** The scaling chapter was going to
argue "smaller cells are more vulnerable, so upsets get worse". Checking it
first: the critical charge does fall, but the cell's collection area falls
*faster*, so per-bit soft error rate at advanced nodes can actually **decrease**.
What genuinely changed is charge sharing — one strike now corrupts a contiguous
cluster, defeating correction that repairs any single bit — plus vastly more
bits per die. The beat argues the real mechanism, and it is a better beat than
the one that was planned.

### Lecture 17 — The Implant (BCI) — **capstone**
Electrode arrays · Microvolt amplification · The thermal budget · On-chip spike
detection, sorting and compression · Wireless power and telemetry · Sealed for
decades

**Dominant constraint: you may not heat the tissue, you may not change the
battery, and you cannot get the data out.**

This is the right ending for the entire course, not a footnote in Extremes,
because it is the one machine where *every* constraint in the course binds at
once — and the reader can only understand it if they've done all sixteen
lectures before it:

- **Thermal → the whole power budget.** Two figures were in circulation while
  planning this and they are *not* interchangeable, so the lecture says which it
  uses. The **thermal bound** — the point at which a skull unit raises tissue
  1 °C — is around **70 mW** (literature range ~47–81 mW). The **guideline cap**
  actually applied to implanted interfaces is tighter, roughly **15–40 mW**
  depending on implant depth, with power density held under ~80 mW/cm².
  The lecture uses the guideline band, because a real N1-class SoC draws about
  **24.7 mW** and the argument that matters is that this is a device sitting
  near its ceiling rather than one with comfortable headroom. Against 70 mW that
  argument is much weaker; against 15–40 mW it is the whole chapter. Calls back
  to L3's power wall and L11's energy-per-task.
- **Bandwidth → you must compute inside the skull.** The plan cited µECoG
  research at **65,536 electrodes**; the lecture instead uses the deployed N1
  figures — **1024 electrodes on 64 threads**, ~200 kbit/s per channel, so of
  order **200 Mbit/s** raw — because those numbers are hardware that exists and
  they interlock with the power figure. On-chip spike detection reduces that by
  about **200×**, which is exactly what brings it inside a low-energy radio.
  Calls back to L2 (distance is energy) and L6 (the world is analogue).
- **Fixed-function or nothing.** A general-purpose core cannot fit that budget.
  It must be an ASIC with a fixed dataflow. Calls straight back to **L1 Ch6** —
  the FPGA → ASIC → CPU → GPU → NPU trade, made one final time under the
  harshest budget in the course.
- **It cannot crash and cannot be rebooted.** Calls back to L7 (boot) and L9
  (RTOS).

If Lecture 10 closes the loop *downward* (code → current), Lecture 17 closes it
*outward*: here is every lesson at once, in a machine the size of a fingernail,
inside a skull.

**Status:** live, 11 beats — the course is complete at 17 lectures and 183
beats. Two ceilings carry it, and both are measured rather than asserted: the
thermal bar climbs 14.8 → 39.8 mW and then refuses, never crossing; the funnel
runs 96 packets in against 2 out on the `pipe` beat, a measured 48:1 against a
real 200:1 that the copy states. The closing chapter introduces nothing — it
re-reads the same object through every lecture before it, which is the argument
the whole course has been making.

---

## Three grammars, not one

This is the main architectural risk in the whole plan. The current engine does
exactly one thing well, and two thirds of the course needs something else.

| Grammar | What it shows | Lectures | Engine status |
|---|---|---|---|
| **Teardown** | Physical things coming apart in layers | 1, 4, 5, 11, 13, 15, 17 | ✅ built (`Part`, explode, focus, isolate) |
| **Signal flow** | State moving through a fixed structure | 1, 2, 3, 6, 14, 17 | 🟡 partial (`signal.ts`, fabric packets) |
| **Abstract systems** | Relationships with no geometry — scheduling, privilege, address translation | 7, 8, 9, 10, 12 | ❌ does not exist |

**Recommendation:** build the third grammar as a deliberate, reusable scene kit
*before* starting Part III — containment (rings, boundaries), flow (a request
crossing a boundary), and population (many processes, one resource). If Part III
gets attempted with the teardown engine, the kernel will render as more glowing
boxes on a die and teach nothing.

---

## Build order

Not 1 → 16. Sequenced by (value × engine-readiness) ÷ risk.

1. **Engine work** — deck navigation, drag-orbit, tooltips, lecture data model,
   syllabus screen. Unblocks everything. *(Design settled, ready to build.)*
2. **L1 units chapter reorder** — FPGA → ASIC → CPU → GPU → NPU + spectrum recap.
   Small, high value, closes out Lecture 1.
3. **L5 The Board** — new content, zero new engine. Best value-per-effort available.
4. **L2 Memory** — completes Lecture 1's missing half; absorbs unified memory.
5. **L11 The Phone** — *build one Part IV lecture early* to prove the
   "machines for purposes" format works before committing to six of them.
6. Then reassess. L3/L7 next if the format holds; the abstract-grammar kit if
   Part III is the priority.

## Standing rules

- **Every number gets verified at authoring time.** No latency figure, node size,
  clock rate or standard number goes into a beat from memory. This doc states
  structure, not facts.
- **A chapter that can't name its trade isn't ready.** See the spine.
- **Scope reality:** Lecture 1 is 6 chapters / 28 beats / ~4,250 LOC. Sixteen
  lectures at that density is a multi-month project measured in tens of
  thousands of lines. The map exists so pieces can ship independently — not so
  they all ship.

## Sources

- [Zonal architecture in automotive electronics 2026](https://promwad.com/news/zonal-architecture-automotive-2026-practical-implementation)
- [Centralized vs zonal ECU architecture 2026](https://promwad.com/news/centralized-vs-zonal-ecu-architecture-software-defined-vehicles-2026)
- [Domain vs zonal architecture — Automotive IQ](https://www.automotive-iq.com/autonomous-drive/articles/domain-vs-zonal-architecture-the-engineering-shift-behind-software-defined-vehicles)
- [Embedded AI hardware platforms 2026](https://promwad.com/news/embedded-ai-hardware-platforms-2026)
- [Robot control board design — compute and I/O](https://hilelectronic.com/robot-control-board-pcb/)
- [Characterizing and optimizing real-time optimal control for embedded SoCs](https://arxiv.org/html/2410.12142)
- [Simulation-informed power budget estimate of a fully-implantable BCI](https://link.springer.com/article/10.1007/s10439-024-03528-7)
- [Power budget of a skull unit in a fully-implantable BCI — bio-heat model](https://pubmed.ncbi.nlm.nih.gov/37856256/)
- [Next-gen BCI packs 65,000 electrodes on one chip](https://www.genengnews.com/topics/artificial-intelligence/next-gen-brain-computer-interface-packs-65000-electrodes-on-one-chip/)
- [Silicon chips on the brain — Columbia Engineering](https://www.engineering.columbia.edu/about/news/silicon-chips-brain-researchers-announce-new-generation-brain-computer-interface)
- [Minimally invasive high-density cortical microelectrode arrays — Nature BME](https://www.nature.com/articles/s41551-025-01501-w)
- [Advanced spike sorting approaches in implantable VLSI](https://arxiv.org/pdf/2309.00913)
- [Event-based neural compressive telemetry for intracortical BCIs](https://pmc.ncbi.nlm.nih.gov/articles/PMC7616507/)
