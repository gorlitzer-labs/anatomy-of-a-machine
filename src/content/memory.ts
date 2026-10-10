import type { Chapter } from './types'

/**
 * Lecture 2 — Memory & State.
 *
 * The missing half of Lecture 1. Everything built so far can decide and nothing
 * can remember: signals only ever flowed forward, so the machine had no past.
 * This lecture bends one wire backwards and then spends the rest of its length
 * on what that costs.
 *
 * Every figure here was checked rather than recalled, and the ranges are real
 * ranges — cache latency is usually quoted in cycles, so the nanosecond number
 * moves with clock speed.
 */
export const memoryChapters: Chapter[] = [
  {
    id: 'remember',
    scene: 'cell',
    marker: '01',
    title: 'Remembering',
    short: 'The loop',
    beats: [
      {
        id: 'latch',
        kicker: 'The loop',
        heading: 'Bend a wire backwards and the circuit has a past',
        body: [
          'Two NOR gates, each one feeding the other\'s input. You have seen both of these before; the only new thing is the direction of those two wires.',
          'Everything up to now flowed one way, so the output depended only on what was arriving right then. Feed the answer back in and it now depends on what happened before — which is the entire idea of memory, and it costs two gates.',
        ],
        say: [
          {
            text: '[curious] Lecture one ended with a machine that decides. Here is the one thing it could not do. Remember.',
            look: 'cell',
          },
          'Two NOR gates. You have met both of them already. The only new thing on this screen is the direction of those two wires.',
          '[pause] Everything up to now flowed one way, so the output depended only on what was arriving right then. Feed the answer back into the input, and suddenly it depends on what happened before.',
          'That is memory. And it costs two gates.',
          '[reflective] Now watch it at rest. Nothing is visibly happening, and that IS the point. A latch that is holding looks exactly like a latch doing nothing. The circulating charge is the only sign it is alive.',
        ],
        camera: { position: [0, 6.8, 6.4], target: [0.3, 0, 0], fov: 34 },
        explode: 0,
        focus: 'latch',
        labels: [
          { text: 'The feedback', part: 'cell', offset: [0.4, 0.7, -1.7], tone: 'cyan' },
        ],
        aside: {
          label: 'What it is doing',
          text: 'Nothing, visibly — and that is the point. A latch at rest is holding, and holding looks like stillness. The circulating charge is the only sign it is alive.',
        },
      },
      {
        id: 'flipflop',
        kicker: 'The clock',
        heading: 'Remembering on a beat',
        body: [
          'A latch alone is nervous: while its input is open, changes race straight through. So pair two of them and gate each on opposite halves of a clock — the first listens while the second holds, then they swap.',
          'Now the value can only move one stage per tick. That is what makes a clocked machine possible, and it is why the next lecture is about time.',
        ],
        say: [
          'There is a problem with that latch, though. It is nervous.',
          'While its input is open, changes race straight through it. So pair two of them, and gate each one on opposite halves of a clock. The first listens while the second holds. Then they swap.',
          '[pause] Now a value can only move one stage per tick. That is what makes a clocked machine possible, and it is why the lecture after this one is about time.',
        ],
        camera: { position: [0.6, 6.4, 6.0], target: [0.2, 0, 0], fov: 35 },
        explode: 0,
        focus: 'flipflop',
        labels: [
          { text: 'Clock', part: 'cell', offset: [1.9, 0.7, 1.35], tone: 'amber' },
        ],
      },
    ],
  },

  {
    id: 'cells',
    scene: 'cell',
    marker: '02',
    title: 'Cells',
    short: 'Cells',
    beats: [
      {
        id: 'sram',
        kicker: 'SRAM',
        heading: 'Six transistors to hold one bit',
        body: [
          'Build that same loop out of transistors rather than drawn gates and you get an SRAM cell: two inverters facing each other, plus two more transistors that let the bit lines in when the row is selected.',
          'Count them. Six parts, per bit. It is fast, it holds its value as long as the power is on, and it is expensive in the only currency a chip has — area.',
        ],
        say: [
          {
            text: 'Build that same loop out of transistors instead of drawn gates, and you get an SRAM cell.',
            zoom: 0.9,
          },
          'Two inverters facing each other, plus two more transistors that let the bit lines in when the row is selected.',
          '[pause] Count them. Six parts. Per bit. It is fast, it holds its value for as long as the power is on, and it is expensive in the only currency a chip has. Area.',
        ],
        camera: { position: [0, 7.6, 7.0], target: [0, 0, 0], fov: 33 },
        explode: 0,
        focus: 'sram',
        labels: [
          { text: 'The same loop, in silicon', part: 'cell', offset: [0, 0.75, -1.5], tone: 'cyan' },
          { text: 'Bit lines', part: 'cell', offset: [2.5, 0.6, 1.5], tone: 'plain' },
        ],
      },
      {
        id: 'dram',
        kicker: 'DRAM',
        heading: 'A bucket with a leak',
        body: [
          'One transistor and one capacitor: charge the capacitor for a 1, drain it for a 0, and use the transistor as the tap. Two parts instead of six.',
          'The catch is that a capacitor this small does not hold its charge. It leaks, and the leakiest cells can forget in a fraction of a second, so every cell is topped up on their schedule. Dimming, tap and refill are one event: refresh.',
        ],
        say: [
          {
            text: 'So here is the cheap version.',
            zoom: 0.9,
          },
          'One transistor and one capacitor. Charge the capacitor for a one, drain it for a zero, and use the transistor as the tap. [pause] Two parts, instead of six.',
          'But there is a catch, and it is a serious one. A capacitor this small does not hold its charge. It leaks, continuously. Most cells hold on for a second or more, but the leakiest can forget in a fraction of that. So every cell gets topped up on the leakiest one\'s schedule.',
          'Watch the bucket dim, the tap open, and the charge go straight back in. Those three things are one event. And that event is called refresh.',
          '[matter-of-fact] In today\'s memory, every cell is read and rewritten every thirty-two milliseconds. About thirty times a second. Above eighty-five degrees that halves to sixteen, because heat makes the leak worse.',
          {
            text: '[pause] Now watch the same thing at real speed.',
            variant: 'b',
          },
          'It becomes a shimmer you cannot follow. Which is exactly why you have never once noticed your memory doing this.',
        ],
        camera: { position: [1.4, 7.2, 6.6], target: [0.4, 0, 0], fov: 33 },
        explode: 0,
        focus: 'dram',
        toggle: {
          label: 'Refresh rate',
          a: 'Slowed 60×',
          b: 'Real speed',
        },
        labels: [
          { text: 'The bucket', part: 'cell', offset: [1.15, 0.8, 0.9], tone: 'violet' },
        ],
        aside: {
          label: 'Refresh',
          text: 'In DDR5, every cell is read and rewritten every 32 ms (16 ms above 85 °C, as heat worsens the leak), the controller issuing a refresh command about every 3.9 µs. At real speed it is a shimmer you never notice.',
        },
      },
      {
        id: 'array',
        kicker: 'The trade',
        heading: 'Same area, wildly different number of bits',
        body: [
          'Here they are at their true relative pitch. The same patch of silicon holds a handful of SRAM cells or a great many DRAM cells, and that ratio is why your machine has megabytes of one and gigabytes of the other.',
          'Neither is better. One is fast and costly and never forgets; the other is cheap and vast and forgets constantly unless something keeps reminding it.',
        ],
        say: [
          {
            text: 'Here they are side by side, at their true relative pitch.',
            look: 'cell',
          },
          'The same patch of silicon holds a handful of SRAM cells, or a great many DRAM cells.',
          '[pause] And that ratio is the entire reason your machine has megabytes of one and gigabytes of the other.',
          'Neither one is better. One is fast and costly and never forgets. The other is cheap and vast, and forgets constantly unless something keeps reminding it.',
        ],
        camera: { position: [0, 9.0, 6.6], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'array',
        labels: [
          { text: 'SRAM', part: 'cell', offset: [-1.4, 0.6, -1.5], tone: 'cyan' },
          { text: 'DRAM', part: 'cell', offset: [1.5, 0.6, -1.5], tone: 'violet' },
        ],
      },
    ],
  },

  {
    id: 'ladder',
    scene: 'ladder',
    marker: '03',
    title: 'The Ladder',
    short: 'Ladder',
    beats: [
      {
        id: 'ladder',
        kicker: 'Distance is time',
        heading: 'Every tier is a longer walk',
        body: [
          'One core, and everywhere it can go for a value. Watch a single request travel out and come back: the trip to the nearest tier is quick, and the trip to storage is not.',
          'Block size is capacity and position is latency — so the ladder is a straight trade. Everything close by is small, everything vast is far away, and nothing is both.',
        ],
        say: [
          {
            text: 'So here is every place a core can go looking for a value.',
          },
          'Watch a single request travel out and come back. The trip to the nearest tier is quick. The trip to storage is not.',
          '[matter-of-fact] And read the figures as it goes. What it is asking for, what that actually costs in time, and whether the core is working or just waiting.',
          'Block size is capacity and position is latency, so the ladder is one straight trade. Everything close by is small, everything vast is far away, and nothing is both.',
          '[pause] One warning about that axis. It is logarithmic, and it has to be. At true scale, if the hop to the nearest cache took a tenth of a second, main memory would take eight seconds. And a storage read would take around an hour.',
        ],
        camera: { position: [0, 8.0, 8.0], target: [-0.35, 0, 0], fov: 36 },
        explode: 0,
        focus: 'ladder',
        readout: true,
        aside: {
          label: 'Read the axis carefully',
          text: 'It is logarithmic, and it has to be. At true scale, if the hop to L1 took a tenth of a second, main memory would take eight seconds and a storage read around an hour. The shape here is honest; the ratios are compressed.',
        },
      },
      {
        id: 'l1',
        kicker: 'Cache',
        heading: 'A small fast copy, close by',
        body: [
          'The tiers between the core and main memory are all the same idea: keep a copy of what was just used, because programs overwhelmingly ask for the same things again, and for their neighbours.',
          'That is the whole bet, and it is not obviously true — it is a property of how real programs behave, not of arithmetic. It just happens to hold often enough that every processor is built around it.',
        ],
        say: [
          {
            text: 'Every tier between the core and main memory is the same idea.',
          },
          'Keep a copy of whatever was just used, because programs overwhelmingly ask for the same things again, and for their neighbours.',
          '[reflective] And that is the whole bet. It is not obviously true. It is a property of how real programs happen to behave, not a fact about arithmetic. It just holds often enough that every processor ever built is designed around it.',
        ],
        camera: { position: [-1.2, 4.6, 4.6], target: [-1.5, 0, 0], fov: 33 },
        explode: 0,
        focus: 'l1',
        readout: true,
        labels: [
          { text: '~1 ns · 32–128 KB', part: 'ladder', offset: [-1.5, 0.7, 0.75], tone: 'violet' },
        ],
      },
      {
        id: 'ram',
        kicker: 'Main memory',
        heading: 'The wall the whole chip is built against',
        body: [
          'Miss every cache and the request goes here: seventy to a hundred nanoseconds away. At four billion cycles a second that is hundreds of cycles the core spends doing nothing at all.',
          'This one number explains most of Lecture 1. The prediction, the scheduling, the layers of cache — nearly all of a modern core exists to avoid arriving here.',
        ],
        say: [
          {
            text: 'Miss every cache, and the request ends up here.',
            zoom: 1.12,
          },
          'Seventy to a hundred nanoseconds away. [pause] At four billion cycles a second, that is hundreds of cycles the core spends doing nothing at all.',
          '[matter-of-fact] And this one number explains most of lecture one. The prediction, the scheduling, the layers of cache. Nearly all of a modern core exists to avoid arriving here.',
        ],
        camera: { position: [0.2, 5.2, 5.2], target: [-0.3, 0, 0], fov: 34 },
        explode: 0,
        focus: 'ram',
        readout: true,
        labels: [
          { text: '70–100 ns · 8–64 GB', part: 'ladder', offset: [0.3, 0.8, 0.9], tone: 'violet' },
        ],
      },
      {
        id: 'hbm',
        kicker: 'Stacking',
        heading: 'Do not make it faster — make it wider',
        body: [
          'Watch what happens. The memory does not become quicker silicon, and it does not move along the axis: a single trip takes as long as before, or slightly longer. What changes is that the chips are stacked and set right beside the processor, so the wires are short enough to lay a thousand of them side by side.',
          'That is what stacked memory buys. Not a shorter wait for one value, but a far wider road — many more values arriving per trip, on less energy per bit. It is bandwidth, not latency.',
        ],
        say: [
          'So can stacking fix a distance problem? Watch.',
          {
            text: 'The memory does not become quicker silicon. And notice it does not move along the axis. A single trip takes as long as before, sometimes a little longer. What changes is that the chips get stacked, and set right beside the processor, so the wires are short enough to lay a thousand of them side by side.',
            zoom: 0.88,
          },
          {
            text: '[pause] So that is what stacking buys. Not a shorter wait for one value. A far wider road, with many more values arriving on every trip, for less energy each. It is bandwidth, not latency.',
            zoom: 1,
          },
        ],
        camera: { position: [-0.6, 5.0, 5.0], target: [-0.9, 0.2, 0], fov: 34 },
        explode: 0,
        focus: 'hbm',
      },
      {
        id: 'unified',
        kicker: 'Unified memory',
        heading: 'One pool, and a step deleted',
        body: [
          'A processor and a separate graphics card each have their own memory, and moving work between them means copying it across. That copy is often more expensive than the arithmetic it was for.',
          'Put both over one pool and the copy simply is not there any more. Nothing got faster. A step was removed, which is usually the better kind of win.',
        ],
        say: [
          {
            text: 'A processor and a separate graphics card each have their own memory, and moving work between them means copying it across.',
          },
          'That copy is often more expensive than the arithmetic it was for.',
          '[pause] Put both of them over one pool, and the copy simply is not there any more.',
          'Notice that nothing got faster. A step was removed. Which is usually the better kind of win.',
        ],
        camera: { position: [0.4, 5.6, 5.6], target: [0, 0, 0.35], fov: 35 },
        explode: 0,
        focus: 'unified',
        labels: [
          { text: 'Second processor', part: 'ladder', offset: [0.5, 0.7, 1.25], tone: 'violet' },
        ],
      },
    ],
  },

  {
    id: 'keeping',
    scene: 'ladder',
    marker: '04',
    title: 'Keeping It',
    short: 'Storage',
    beats: [
      {
        id: 'ssd',
        kicker: 'Flash',
        heading: 'Charge trapped where it can barely get out',
        body: [
          'Everything so far forgets the moment the power stops. Flash does not: it parks charge in a pocket completely surrounded by insulator, so it can only leak away very slowly. A consumer drive is rated to hold its data unpowered for at least a year, even when worn out.',
          'The price is distance. Storage is the far end of the ladder — tens of microseconds for a random read, hundreds of times further than main memory.',
        ],
        say: [
          {
            text: 'Everything so far forgets the moment the power stops. Flash does not.',
            zoom: 1.18,
          },
          'It parks charge in a pocket that is completely surrounded by insulator. The charge does leak, but so slowly that a consumer drive is rated to hold its data, unpowered, for at least a year. Even when it is worn out.',
          '[pause] And the price is distance. Storage is the far end of the ladder. Tens of microseconds for a random read, which is hundreds of times further out than main memory.',
        ],
        camera: { position: [1.6, 4.8, 4.8], target: [1.4, 0, 0], fov: 34 },
        explode: 0,
        focus: 'ssd',
        readout: true,
        labels: [
          { text: 'tens of µs · ~1 TB', part: 'ladder', offset: [1.5, 0.85, 1.0], tone: 'plain' },
        ],
      },
      {
        id: 'wear',
        kicker: 'Wear',
        heading: 'Writing to it slowly destroys it',
        body: [
          'Forcing charge through an insulator damages it a little every time. Do it enough and the cell stops holding a value — permanently, unlike everything else in this lecture.',
          'So a drive quietly spreads writes across cells that have been used least, and retires the ones that have died. The dark squares are gone for good.',
        ],
        say: [
          'There is a cost to that trick, and it is an unusual one.',
          'Forcing charge through an insulator damages it a little, every single time. Do it often enough and the cell stops holding a value. Permanently, unlike everything else in this lecture.',
          'So a drive quietly spreads writes across the cells that have been used least, and retires the ones that have died. [pause] Those dark squares are gone for good.',
          '[reflective] And here is the part worth keeping. Most components age slowly, whatever you ask of them. Flash wears out fast, one write at a time, from being used exactly as intended.',
        ],
        camera: { position: [1.7, 4.4, 4.4], target: [1.5, 0.1, 0], fov: 33 },
        explode: 0,
        focus: 'wear',
        aside: {
          label: 'The thing that is finite',
          text: 'Most components age slowly, whatever you ask of them. Flash wears out fast, counted one write at a time, from being used exactly as intended.',
        },
      },
      {
        id: 'whole',
        kicker: 'The ladder, whole',
        heading: 'One trade, repeated all the way down',
        body: [
          'Fast, small and close. Slow, vast and far. Every tier picks a point on that line and none escapes it: stacking, which looks as if it does, widens the road rather than shortening it.',
          'Lecture 1 said a computer decides; this one says it remembers. What is left is the clock that makes the two happen in order.',
        ],
        say: [
          {
            text: 'So watch the ladder one last time, and notice that it is the same sentence at every rung.',
          },
          'Fast, small and close. Slow, vast and far. Every tier picks a point on that line, and nothing here escapes it. The ones that look like they do, like stacking, widen the road rather than shortening it.',
          '[pause] Lecture one said a computer decides. This one says it remembers.',
          '[reflective] What is left is the clock that makes those two things happen in order. Distance is time was a hint in this lecture. In the next one, it becomes the whole story.',
        ],
        camera: { position: [0, 8.4, 8.4], target: [-0.35, 0, 0], fov: 38 },
        explode: 0,
        focus: 'ladder',
        readout: true,
        aside: {
          label: 'Where this goes',
          text: 'Distance is time was a hint. Next lecture it becomes the whole story: light only moves so far per tick, and everything clever in a processor is a way not to wait.',
        },
      },
    ],
  },
]
