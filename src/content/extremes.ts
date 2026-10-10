import type { Chapter } from './types'

/**
 * Lecture 16 — The Extremes.
 *
 * The lecture that inverts the course's own arc. Fourteen lectures have argued
 * that smaller is faster, denser and cheaper; this one puts that arrangement
 * somewhere it cannot be repaired and shows what has to be given back.
 *
 * The second half is a different kind of edge. Everything up to here has been a
 * von Neumann machine under some budget — the same fetch, decode, execute over
 * a stored program, squeezed. These are machines that are not arranged that way
 * at all, and they are placed here rather than in a chapter of their own
 * because the honest thing to say about them is that they are still exotic.
 *
 * Every figure in this file was checked at authoring time; the ones that are
 * compressed on screen say so in the beat that compresses them.
 */
export const extremesChapters: Chapter[] = [
  {
    id: 'nofix',
    scene: 'extremes',
    marker: '01',
    title: 'Where Nothing Can Be Fixed',
    short: 'No repair',
    beats: [
      {
        id: 'nofix',
        kicker: 'The constraint',
        heading: 'Nobody is coming to reboot it',
        body: [
          'Every machine so far had an escape. A phone can be restarted, a server swapped, a car recalled. This one is on Mars, and the round trip for a radio message is roughly eight to forty-five minutes depending on where the planets are — and about every twenty-six months the Sun passes between them and cuts the link altogether.',
          'That single fact reorganises the entire design. Performance stops being the thing being maximised and becomes something you spend to buy certainty.',
        ],
        say: [
          'Lecture fifteen could buy anything it needed. This one can buy nothing at all.',
          'Every machine so far has had an escape. A phone can be restarted, a server swapped out, a car recalled. This one is on Mars, and the round trip for a radio message is roughly eight to forty-five minutes, depending on where the planets are. And about every twenty-six months, the Sun passes between them and cuts the link altogether.',
          '[matter-of-fact] And that single fact reorganises the entire design. Performance stops being the thing being maximised, and becomes something you spend to buy certainty.',
          '[reflective] This is the only lecture in this part where the dominant constraint is not power, heat, cost or latency. And the only one where the machine is deliberately decades behind.',
        ],
        camera: { position: [0, 6.2, 7.4], target: [0, 0, 0.2], fov: 36 },
        explode: 0,
        focus: 'nofix',
        aside: {
          label: 'The trade, stated',
          text: 'Survival, and everything else is negotiable. This is the only lecture in Part IV where the dominant constraint is not power, heat, cost or latency — and the only one where the machine is deliberately decades behind.',
        },
      },
      {
        id: 'strike',
        kicker: 'The environment',
        heading: 'Space is full of things that ruin memory',
        body: [
          'A heavy ion or a high-energy proton crosses the die and leaves a track of charge. If it deposits more charge than a memory cell uses to hold its value, the cell changes state. The chip is not damaged. The number in it is simply now a different number.',
          'Watch the errors arrive and stay. Nothing corrects them: this is an unprotected machine after a while, still running, still fast, and increasingly wrong.',
        ],
        say: [
          'Because space is full of things that ruin memory.',
          'A heavy ion or a high-energy proton crosses the die and leaves a track of charge. If it deposits more charge than a memory cell uses to hold its value, the cell changes state.',
          '[pause] The chip is not damaged. The number in it is simply now a different number.',
          '[matter-of-fact] Watch the errors arrive, and stay. Nothing here is correcting them, so this is what an unprotected machine looks like after a while. Still running, still fast, and increasingly wrong.',
        ],
        camera: { position: [0, 5.4, 6.4], target: [0, 0, 0], fov: 35 },
        explode: 0,
        focus: 'strike',
        labels: [{ text: 'One particle, one bit', part: 'extremes', offset: [0, 0.9, -1.5], tone: 'amber' }],
        aside: {
          label: 'Compressed, heavily',
          text: 'On screen a strike lands about once a second. Real rates for a hardened part are tiny — the RAD750 is specified at under 1.6 errors per ten billion bits a day — but never zero, and paid on every bit a machine holds. The rate is reassuring and the consequence is not, which a picture at true speed cannot carry.',
        },
      },
    ],
  },

  {
    id: 'flips',
    scene: 'extremes',
    marker: '02',
    title: 'Bits Flip',
    short: 'Upsets',
    beats: [
      {
        id: 'seu',
        kicker: 'Soft errors',
        heading: 'A wrong value, not a broken circuit',
        body: [
          'This is called a single event upset, and the important word is *upset*. The transistors still work. Write the cell again and it holds the new value perfectly, because nothing about it was destroyed.',
          'Watch the same strikes now, with something rewriting memory continuously in the background. The errors appear and are scrubbed away. A machine that does this is not error-free — it is error-free *for now*, which is a different and more honest claim.',
        ],
        say: [
          'This is called a single event upset, and the important word is upset.',
          'The transistors still work. Write the cell again and it holds the new value perfectly, because nothing about it was destroyed.',
          '[pause] So watch the same strikes now, with something rewriting memory continuously in the background. The errors appear, and are scrubbed away.',
          '[reflective] A machine that does this is not error-free. It is error-free for now, which is a different and more honest claim.',
        ],
        camera: { position: [0, 5.0, 6.0], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'seu',
      },
      {
        id: 'smaller',
        kicker: 'Scaling',
        heading: 'Smaller target, bigger problem',
        body: [
          'You might expect shrinking to make upsets worse, since a smaller cell holds less charge and needs less to flip. True, but it is also a smaller target, and the target shrinks faster than the charge. Per bit, an advanced node can actually be struck *less* often.',
          'What changed instead: left, an isolated hit; right, one particle upsetting several neighbours at once. And error correction that repairs any single bit cannot repair four in one word, so memories spread each word\'s bits apart — and the clusters keep growing.',
        ],
        say: [
          'Now, the obvious guess about shrinking, and why it is wrong.',
          'You would think shrinking makes upsets worse, because a smaller cell holds less charge and needs less to flip it. That is true. But the cell also becomes a smaller target — and the target shrinks faster than the charge does. Per bit, an advanced node can actually be struck less often.',
          '[matter-of-fact] So look at what changed instead. On the left, an isolated hit. On the right, one particle dumping charge across several neighbours at once. And error correction that repairs any single bit cannot repair four in one word, so memories spread each word\'s bits apart. And the clusters keep growing.',
          '[reflective] Which matters more than the rate does. A failure you can correct is an inconvenience. One that defeats your correction is an outage. Scaling did not simply make the problem bigger. It made it one the simplest answer does not solve, on far more bits.',
        ],
        camera: { position: [0, 6.6, 7.6], target: [0, 0, 0], fov: 38 },
        explode: 0,
        focus: 'smaller',
        labels: [
          { text: 'Coarse', part: 'extremes', offset: [-1.85, 0.8, -1.45], tone: 'cyan' },
          { text: 'Dense: a cluster', part: 'extremes', offset: [2.3, 0.8, -1.45], tone: 'amber' },
        ],
        aside: {
          label: 'Why this matters more than the rate',
          text: 'A failure you can correct is an inconvenience; one that defeats your correction is an outage. Scaling made the problem one the simplest answer does not solve, on far more bits.',
        },
      },
      {
        id: 'hard',
        kicker: 'Hard errors',
        heading: 'And some of it does not come back',
        body: [
          'Not every strike is recoverable. Enough deposited energy can permanently damage a cell, and that cell is not holding a wrong value; it is not holding a value. A strike can also trigger latch-up, a short circuit through the chip that can destroy it unless the power is cut within milliseconds — which is why hardened parts are built to be immune to it.',
          'Watch the grey squares accumulate. Every other kind of wear in this course has been slow and statistical. This is the same idea as the flash cell from Lecture 2 wearing out, arriving in an afternoon instead of over years.',
        ],
        say: [
          'And not every strike is recoverable.',
          'Enough deposited energy can permanently damage a cell. And that cell is not holding a wrong value. It is not holding a value.',
          'A strike can also trigger latch-up. A short circuit through the chip, which can destroy it unless the power is cut within milliseconds. Which is why hardened parts are built to be immune to it.',
          '[pause] Watch the grey squares accumulate. Every other kind of wear in this course has been slow and statistical. This is the flash cell from lecture two wearing out, arriving in an afternoon instead of over years.',
        ],
        camera: { position: [0, 5.2, 6.2], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'hard',
      },
    ],
  },

  {
    id: 'voting',
    scene: 'extremes',
    marker: '03',
    title: 'Outvoting the Damage',
    short: 'Redundancy',
    beats: [
      {
        id: 'tmr',
        kicker: 'Triple modular redundancy',
        heading: 'Build three, and believe the majority',
        body: [
          'You cannot stop the particle. So stop caring about it: run the same computation on three identical units and compare the answers. A strike corrupts one of them, the other two agree, and the majority is passed on.',
          'Watch the voter. It lights when it has just had to overrule a unit — which is the only way to see that any of this is working, because a module doing its job looks exactly like a module that was never hit.',
        ],
        say: [
          'So you cannot stop the particle. Stop caring about it instead.',
          'Run the same computation on three identical units, and compare the answers. A strike corrupts one of them, the other two agree, and the majority is passed on.',
          '[pause] Watch the voter. It lights when it has just had to overrule a unit — which is the only way to see that any of this is working, because a module doing its job looks exactly like a module that was never hit.',
          '[matter-of-fact] And why three? Two units detect a disagreement but cannot tell you which one is wrong. Three is the smallest number that can not only notice the error but identify and outvote it. The same reason a jury is not two people.',
        ],
        camera: { position: [0, 7.4, 8.4], target: [0, 0, 0.4], fov: 40 },
        explode: 0,
        focus: 'tmr',
        labels: [{ text: 'Majority wins', part: 'extremes', offset: [0, 0.8, 1.6], tone: 'plain' }],
        aside: {
          label: 'Why three',
          text: 'Two units detect a disagreement but cannot tell you which one is wrong. Three is the smallest number that can not only notice the error but identify and outvote it — the same reason a jury is not two people.',
        },
      },
      {
        id: 'voter',
        kicker: 'The bill',
        heading: 'Three times the silicon for one answer',
        body: [
          'Three units, three times the area, three times the power, and the throughput of one. Measured the way any other lecture in this course measures things, this design is a catastrophe — and it is the correct choice, because the thing being maximised is not throughput.',
          'And look at the bar itself. Everything upstream is triplicated; here the voter is not. Designs can triplicate the voters too, but at the very end there is always one that is not. Redundancy does not remove single points of failure, it *relocates* them, and the engineering is largely about relocating them somewhere small enough to verify exhaustively.',
        ],
        say: [
          'Which costs exactly what it sounds like it costs.',
          'Three units, three times the area, three times the power. And the throughput of one.',
          '[pause] Measured the way any other lecture in this course measures things, this design is a catastrophe. And it is the correct choice, because the thing being maximised is not throughput.',
          '[reflective] And look at the bar itself. Everything upstream is triplicated. Here, the voter is not. Designs can triplicate the voters too, but at the very end there is always one that is not. Redundancy does not remove single points of failure. It relocates them — and the engineering is largely about relocating them somewhere small enough to verify exhaustively.',
        ],
        camera: { position: [0.6, 6.4, 7.6], target: [0, 0, 0.8], fov: 38 },
        explode: 0,
        focus: 'voter',
      },
      {
        id: 'slow',
        kicker: 'The processor',
        heading: 'A rover runs a 1998 design, deliberately',
        body: [
          'Perseverance runs a RAD750: a hardened PowerPC 750, the 1998 iMac\'s chip, at up to 200 megahertz. Your phone outruns it many times over.',
          'Not a budget compromise: the hardening needs a special process that trails commercial chips by generations. The slowness is part price, part help: larger features need a bigger strike to flip, and a slower clock gives a struck node longer to settle. Left: slow, survivable. Right: quick, gathering errors.',
        ],
        say: [
          'Which is how you end up here.',
          'Perseverance runs a RAD750. A hardened PowerPC 750, the chip in the nineteen ninety-eight iMac, at up to two hundred megahertz. Your phone outruns it many times over.',
          '[matter-of-fact] And that is not a budget compromise. The hardening needs a special process that trails commercial chips by generations. Its larger features need a bigger strike to flip, and a slower clock gives a struck node longer to settle. On the left, survivable and slow. On the right, quick and accumulating errors.',
          '[pause] The slowness is partly the price of hardening. And partly, a help.',
          '[reflective] It is rated for two hundred thousand to a million rads of total dose, depending on the version, and minus fifty-five to plus a hundred and twenty-five degrees. It flies on Curiosity and Perseverance and on the order of a hundred satellites. Hardened parts like it cost many times their commercial equivalents.',
        ],
        camera: { position: [-1.1, 7.9, 9.0], target: [-1.1, 0, 0], fov: 54 },
        explode: 0,
        focus: 'slow',
        labels: [
          { text: 'Hardened, 200 MHz', part: 'extremes', offset: [-1.7, 0.8, -1.45], tone: 'cyan' },
          { text: 'Fast, and wrong', part: 'extremes', offset: [2.3, 0.8, -1.45], tone: 'amber' },
        ],
        aside: {
          label: 'What it is rated for',
          text: 'Two hundred thousand to a million rads of total dose, depending on the version, and −55 to +125 °C. It flies on Curiosity and Perseverance and on the order of a hundred satellites. Hardened parts like it cost many times their commercial equivalents.',
        },
      },
    ],
  },

  {
    id: 'notvon',
    scene: 'extremes',
    marker: '04',
    title: 'Not von Neumann',
    short: 'Other machines',
    beats: [
      {
        id: 'notvon',
        kicker: 'The arrangement',
        heading: 'Everything so far has been one machine, squeezed',
        body: [
          'A phone, a microcontroller, a car, a rover, a machine room. Wildly different budgets, and underneath, the identical arrangement: memory over here, a processor over there, instructions fetched across the gap, one step per tick.',
          'Watch the sweep. You have seen this rhythm in the pipeline, the boot sequence, the scheduler. It is so consistent that it is easy to mistake for what computing *is*, rather than one way of arranging it.',
        ],
        say: [
          'Now step back, because there is something all sixteen lectures have had in common.',
          'A phone, a microcontroller, a car, a rover, a machine room. Wildly different budgets. And underneath, the identical arrangement. Memory over here, a processor over there, instructions fetched across the gap, one step per tick.',
          '[pause] Watch the sweep. You have seen this rhythm in the pipeline, in the boot sequence, in the scheduler. It is so consistent that it is easy to mistake it for what computing is, rather than for one way of arranging it.',
          '[matter-of-fact] Lecture two measured the cost of it. The walk between memory and processor dominates both time and energy. Every trick in this course — caches, prefetch, direct memory access, stacked memory — is a way to pay less for that walk. None of them removes it, because the arrangement requires it.',
        ],
        camera: { position: [0, 5.6, 6.4], target: [0, 0, 0], fov: 35 },
        explode: 0,
        focus: 'notvon',
        aside: {
          label: 'The gap',
          text: 'Lecture 2 measured it: the walk between memory and processor dominates both time and energy. Every trick in this course — caches, prefetch, DMA, HBM — is a way to pay less for that walk. None of them removes it, because the arrangement requires it.',
        },
      },
      {
        id: 'neuro',
        kicker: 'Neuromorphic',
        heading: 'Memory where the computing is, no clock',
        body: [
          'Same cells, no sweep. Each holds its own state, does its own arithmetic, and waits until a neighbour sends it something. There is no instruction stream: nothing central to stream it from.',
          'Watch how little is lit at any moment. That sparsity is the whole efficiency argument: no fetch across the gap, no work where nothing changed.',
        ],
        say: [
          'So here is an arrangement that does not.',
          'Same cells, no sweep. Each one holds its own state and does its own arithmetic, and it does nothing at all until a neighbour sends it something. There is no instruction stream, because there is nothing central to stream it from.',
          '[pause] And watch how little of the array is lit at any moment. That sparsity is the whole efficiency argument. No fetch across the gap, and no work at all where nothing changed.',
          '[reflective] Intel\'s Loihi 2 is built this way. No global clock, each core working only when a spike arrives. IBM\'s NorthPole keeps a clock, but puts all its memory on the chip beside the arithmetic, and reports about twenty-five times the energy efficiency of a graphics processor built on a comparable process, on image-recognition inference. But neither has shipped as a commercial product. So of any brain-inspired claim, ask what task, against what baseline.',
        ],
        camera: { position: [0, 5.4, 6.2], target: [0, 0, 0], fov: 35 },
        explode: 0,
        focus: 'neuro',
        aside: {
          label: 'Where it actually is',
          text: 'Intel\'s Loihi 2 is built this way: no global clock; a core works only when a spike arrives. IBM\'s NorthPole keeps a clock but puts all its memory on the chip beside the arithmetic, and reports about twenty-five times the energy efficiency of a GPU on a comparable process, on image-recognition inference. Neither has shipped as a commercial product: of any "brain-inspired" claim, ask what task, against what baseline.',
        },
      },
      {
        id: 'quantum',
        kicker: 'Quantum',
        heading: 'A different question',
        body: [
          'A qubit is not a bit holding an intermediate value; the blend on screen is this course\'s worst metaphor, drawn only so the collapse means something. At measurement the ambiguity vanishes and one classical answer comes out: reading it destroys it.',
          'This is not a machine that runs your programs faster. It is a machine on which a small number of specific problems have a fundamentally cheaper method — everything else is no better, usually far worse.',
        ],
        say: [
          'And one more, which is not a faster computer at all.',
          'A qubit is not a bit holding an intermediate value, and the blend on screen is this course\'s worst metaphor. It is drawn only so that the collapse means something.',
          '[pause] Watch what happens at measurement. The ambiguity disappears, and one ordinary classical answer comes out. Reading it destroys it.',
          '[matter-of-fact] This is not a machine that runs your programs more quickly. It is a machine on which a small number of specific problems have a fundamentally cheaper method. Everything else is no better, and usually far worse.',
          '[reflective] Superconducting qubits work at ten to twenty millikelvin. Colder than deep space, maintained by a dilution refrigerator whose cold space alone is about the size of a kitchen fridge, around a chip the size of a coin. Lecture eleven sealed a computer in a fanless slab. This one needs a tower of cryogenics for one chip. And both are the same sentence — the constraint decides the machine.',
        ],
        camera: { position: [0, 5.4, 6.2], target: [0, 0, 0], fov: 35 },
        explode: 0,
        focus: 'quantum',
        aside: {
          label: 'The extreme, restated',
          text: 'Superconducting qubits work at ten to twenty millikelvin — colder than deep space, maintained by a dilution refrigerator whose cold space alone is about the size of a kitchen fridge, around a chip the size of a coin. Lecture 11 sealed a computer in a fanless slab; this needs a tower of cryogenics for one chip. Same sentence: the constraint decides the machine.',
        },
      },
    ],
  },
]
