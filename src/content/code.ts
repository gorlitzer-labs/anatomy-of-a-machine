import type { Chapter } from './types'

/**
 * Lecture 10 — From Code to Current.
 *
 * The payoff, and the only lecture that could not have been written earlier:
 * it descends through the scenes the course has already built, so it needed all
 * of them to exist first. One new scene at the top of the ladder; after that it
 * is the pipeline from Lecture 3, the adder from Lecture 1, and the transistor
 * from Lecture 1, revisited with a different question.
 *
 * The question is the whole lecture. Everything so far has explained a layer.
 * This asks what actually happens, physically, when you write a line of code —
 * and the answer runs all the way down to a channel forming under a gate.
 */
export const codeChapters: Chapter[] = [
  {
    id: 'written',
    scene: 'code',
    marker: '01',
    title: 'What You Wrote',
    short: 'Source',
    beats: [
      {
        id: 'source',
        kicker: 'The top',
        heading: 'A line of code is a claim about intent',
        body: [
          'At the top of the ladder is something written for a person: a name, an operation, a couple of values. It says what should happen, not how, and nothing in the machine understands a word of it.',
          'Everything below this point exists to turn that intent into voltages, and every step down is more numerous and less clever than the one above.',
        ],
        say: [
          'Lecture nine promised one line of code, taken all the way down. Here it is.',
          'At the top of the ladder is something written for a person. A name, an operation, a couple of values. It says what should happen, not how, and nothing in the machine understands a word of it.',
          '[pause] Everything below this point exists to turn that intent into voltages. And every step down is more numerous, and less clever, than the one above.',
        ],
        camera: { position: [0, 3.2, 7.2], target: [0, 0.5, 0], fov: 35 },
        explode: 0,
        focus: 'source',
      },
      {
        id: 'compile',
        kicker: 'The compiler',
        heading: 'One statement becomes several instructions',
        body: [
          'The compiler does not translate word for word. It works out what the line requires — fetch these values, do this arithmetic, put the answer there — and emits a sequence of much simpler operations that add up to it.',
          'Watch the statement fall. This readable line becomes nine instructions one level down — the exact count depends on the processor and the compiler — each a step the machine must take that you never wrote.',
        ],
        say: [
          'The compiler does not translate word for word.',
          'It works out what the line requires. Fetch these values, do this arithmetic, put the answer there. And it emits a sequence of much simpler operations that add up to it.',
          '[matter-of-fact] Watch the statement fall, and read the count. This readable line becomes nine instructions one level down. The exact count depends on the processor and the compiler. And every one of those nine is a step the machine has to take that you never wrote.',
          '[reflective] Which is most of what a compiler actually does. There are many correct sequences of instructions for the same line, and they differ enormously in speed. Most of the work is not translation at all. It is choosing among the correct answers.',
        ],
        camera: { position: [0, 3.4, 7.6], target: [0, 0.4, 0], fov: 36 },
        explode: 0,
        focus: 'compile',
        readout: true,
        labels: [
          { text: 'One statement', part: 'code', offset: [0.9, 1.68, 0.62], tone: 'cyan' },
          { text: 'Becomes several', part: 'code', offset: [1.15, 0.98, 0.62], tone: 'violet' },
        ],
      },
      {
        id: 'expand',
        kicker: 'All the way down',
        heading: 'Hundreds of bits',
        body: [
          'Each instruction is written down as a number, and each number as bits: 32 apiece here, as on RISC-V or Arm. Count the rows: one readable line became 288 ones and zeros, none knowing what it was for.',
          'The meaning survived; the names and intent did not. Each step made it less clever and more numerous, the price of nearing what a switch can act on.',
        ],
        say: [
          'And several become hundreds of bits.',
          'Each instruction is written down as a number, and each number as bits. Here, thirty-two bits apiece, as on RISC-V or Arm.',
          '[pause] Count the rows. The one readable line you started with ends as two hundred and eighty-eight ones and zeros. And not one of them knows what it was for.',
          '[matter-of-fact] The meaning survived. The names and the intent did not. Each step made it less clever and more numerous, which is the price of getting closer to something a switch can act on.',
        ],
        camera: { position: [0.6, 3.0, 7.4], target: [0, 0.2, 0], fov: 37 },
        explode: 0,
        focus: 'expand',
        readout: true,
        aside: {
          label: 'Why a compiler is hard',
          text: 'A line has many correct instruction sequences of hugely different speed: most of the work is picking.',
        },
      },
    ],
  },

  {
    id: 'contract',
    scene: 'code',
    marker: '02',
    title: 'The Contract',
    short: 'The ISA',
    beats: [
      {
        id: 'machine',
        kicker: 'Machine code',
        heading: 'The instruction is just a number',
        body: [
          'There is nothing symbolic left. An instruction is a pattern of bits, part of which says what to do and part of which says what to do it to, and the processor is built so that those bits fall on the right wires.',
          'This is where the software stops and the silicon starts. Everything above was a description; from here it is a voltage on a line.',
        ],
        say: [
          'There is nothing symbolic left.',
          'An instruction is a pattern of bits. Part of it says what to do, and part of it says what to do it to, and the processor is built so that those bits fall on the right wires.',
          '[reflective] This is where the software stops and the silicon starts. Everything above was a description. From here it is a voltage on a line.',
        ],
        camera: { position: [0, 2.4, 6.6], target: [0, -0.3, 0], fov: 36 },
        explode: 0,
        focus: 'machine',
        readout: true,
      },
      {
        id: 'isa',
        kicker: 'The instruction set',
        heading: 'The one promise a processor makes',
        body: [
          'The instruction set is the agreement: these bit patterns mean these operations, and they keep meaning them. Honour it and programs compiled decades ago still run, no matter how the inside changed. New instructions get added; old ones are retired only rarely, and deliberately.',
          'That is why Lecture 3\'s pipelines, caches and speculation could be invented without breaking anything. They are all ways of keeping this promise faster — and a processor is free to do anything it likes internally as long as, for any one program, the answer is indistinguishable from having obeyed one instruction at a time.',
        ],
        say: [
          'And between those two there is exactly one promise.',
          'The instruction set is the agreement. These bit patterns mean these operations, and they keep meaning them. Honour it, and programs compiled decades ago still run, no matter how the inside changed. New instructions get added. Old ones are retired only rarely, and deliberately.',
          '[matter-of-fact] Which is why lecture three\'s pipelines, caches and speculation could be invented without breaking anything. They are all ways of keeping this promise faster. A processor is free to do anything it likes internally, as long as, for any one program, the answer is indistinguishable from having obeyed one instruction at a time.',
        ],
        camera: { position: [0.8, 2.6, 6.8], target: [0, -0.3, 0], fov: 36 },
        explode: 0,
        focus: 'isa',
      },
    ],
  },

  {
    id: 'running',
    scene: 'pipeline',
    marker: '03',
    title: 'Where It Runs',
    short: 'Running',
    beats: [
      {
        id: 'overlap',
        kicker: 'Back to the pipeline',
        heading: 'Those instructions, in the machine from Lecture 3',
        body: [
          'Here they are, arriving. Each of the instructions the compiler emitted enters the pipeline, moves one stage per tick, and — if nothing holds it up — finishes five ticks later, with four others in flight around it.',
          'The line you wrote is now several of these blocks, overlapping, in a machine that has no idea they were ever related.',
        ],
        say: [
          'So here are those instructions, arriving in the machine from lecture three.',
          {
            text: 'Each one the compiler emitted enters the pipeline, moves one stage per tick, and, if nothing holds it up, finishes five ticks later, with four others in flight around it.',
            zoom: 0.9,
          },
          {
            text: '[pause] The line you wrote is now several of these blocks, overlapping, in a machine that has no idea they were ever related.',
            zoom: 1,
          },
        ],
        camera: { position: [0, 8.84, 10.54], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'overlap',
      },
      {
        id: 'speculation',
        kicker: 'And not politely',
        heading: 'Some of your line runs before it is known to be needed',
        body: [
          'If the statement was inside a condition, the processor did not wait to find out. It guessed, ran ahead, and was ready to throw the work away — which it sometimes did.',
          'Your line was executed. It may also have been executed and discarded, several times, and nothing in the result you got reveals which. The timing of what came after sometimes can — that leak is what the Spectre attacks exploited.',
        ],
        say: [
          'And if the statement was inside a condition, the processor did not wait to find out.',
          'It guessed, ran ahead, and was ready to throw the work away. Which it sometimes did.',
          '[reflective] So your line was executed. It may also have been executed and discarded, several times over. And nothing in the result you got reveals which.',
          '[matter-of-fact] The timing of what came after sometimes can. That leak is what the Spectre attacks exploited.',
        ],
        camera: { position: [1.02, 9.18, 10.2], target: [0.2, 0, 0], fov: 34 },
        explode: 0,
        focus: 'speculation',
      },
    ],
  },

  {
    id: 'physical',
    scene: 'adder',
    marker: '04',
    title: 'What Actually Happens',
    short: 'Physical',
    beats: [
      {
        id: 'halfadder',
        kicker: 'The arithmetic',
        heading: 'The add is two gates disagreeing',
        body: [
          'Whatever the line said, if it added two numbers then this is what performed it: an XOR for the sum and an AND for the carry, exactly as in Lecture 1. Two of these and an OR make a full adder, which also takes the carry from the bit before, and the adder needs one for every bit.',
          'No part of this knows it is doing arithmetic. Two gates produce a pattern that we agree to read as a number.',
        ],
        say: [
          'Down one more level. Whatever that line said, if it added two numbers, this is what performed it.',
          'An XOR for the sum, and an AND for the carry. Exactly as in lecture one. Watch the table.',
          'Two of these and an OR make a full adder, which also takes in the carry from the bit before. And the adder needs one of those for every bit.',
          '[matter-of-fact] And no part of this knows it is doing arithmetic. Two gates produce a pattern that we agree to read as a number.',
        ],
        camera: { position: [0, 10.5, 11.8], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'halfadder',
        truth: 'halfadder',
      },
    ],
  },

  {
    id: 'current',
    scene: 'mosfet',
    marker: '05',
    title: 'Current',
    short: 'Current',
    beats: [
      {
        id: 'channel',
        kicker: 'The bottom',
        heading: 'And the gate is a channel that appears',
        body: [
          'One more level. That XOR is a handful of transistors, and each one works like this: a voltage on a gate, a layer of electrons pulled into existence beneath it, and current where a moment ago there was none. Half of them are the mirror image, using holes instead of electrons and switching on when the gate goes low.',
          'This is the actual event. Everything above — the statement, the instructions, the bits, the pipeline, the gates — is bookkeeping we invented so that this could be arranged usefully.',
        ],
        say: [
          'And one more level still.',
          'That XOR is a handful of transistors. And each one works like this. A voltage on a gate, a layer of electrons pulled into existence beneath it, and current where a moment ago there was none.',
          'Half of them are the mirror image. They use holes instead of electrons, and switch on when the gate goes low.',
          '[pause] This is the actual event. Everything above it — the statement, the instructions, the bits, the pipeline, the gates — is bookkeeping we invented so that this could be arranged usefully.',
        ],
        camera: { position: [1.6, 2.6, 6.6], target: [0, 0.15, 0], fov: 34 },
        explode: 0.26,
        focus: 'channel',
        labels: [
          { text: 'Your line, here', part: 'channel', offset: [0, 0.5, 1.25], tone: 'cyan' },
        ],
      },
      {
        id: 'whole',
        kicker: 'The whole ladder',
        heading: 'Ten lectures, one line of code',
        body: [
          'Statement, instructions, bits, a pipeline, gates, a channel of electrons a few dozen atoms across. Every layer exists because the one below it is too dumb to be worked with directly, and every layer is a promise that the one below will be kept out of sight.',
          'Nothing in the stack understands the layer above it. That is not a flaw in the design — it is the design.',
        ],
        say: [
          {
            text: 'So. Ten lectures, one line of code.',
            zoom: 1.1,
          },
          'Statement, instructions, bits, a pipeline, gates, and a channel of electrons a few dozen atoms across.',
          '[matter-of-fact] Every layer exists because the one below it is too dumb to be worked with directly. And every layer is a promise that the one below will be kept out of sight.',
          '[reflective] Nothing in the stack understands the layer above it. That is not a flaw in the design. That is the design.',
          '[pause] Parts one to three built one machine, from a switch to an operating system. What is left is what happens to that machine when the budget changes.',
        ],
        camera: { position: [0, 4.0, 8.4], target: [0, 0.1, 0], fov: 40 },
        explode: 0.2,
        focus: null,
        aside: {
          label: 'Where the course goes now',
          text: 'Parts I to III built one machine, from a switch to an operating system. Part IV asks what happens to that machine when the budget changes — when it must fit a phone, survive a car, close a robot\'s control loop, or run inside a skull on a few tens of milliwatts.',
        },
      },
    ],
  },
]
