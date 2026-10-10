import type { Chapter } from './types'

/**
 * Lecture 12 — The Edge.
 *
 * The counterpart to the phone. That lecture's machine was mostly off; this
 * one's is off for essentially all of its life, and the whole design follows
 * from that rather than from anything about speed.
 *
 * Checked figures: sleep currents run around 0.1-5 µA against 15-20 mA awake —
 * up to a hundred thousand times — and a device awake 0.01% of the time
 * averages roughly 6 µA, which is where "years on a coin cell" comes from.
 * Battery life is a function of average current, so it is decided by the duty
 * cycle and not by any headline number in a datasheet.
 */
export const edgeChapters: Chapter[] = [
  {
    id: 'asleep',
    scene: 'edge',
    marker: '01',
    title: 'Asleep',
    short: 'Asleep',
    beats: [
      {
        id: 'asleep',
        kicker: 'The normal state',
        heading: 'Almost nothing is happening, almost always',
        body: [
          'This is a whole computer — processor, memory, storage, a radio, a sensor — and it is switched off. Not idling, not waiting on a scheduler: disconnected, drawing a few millionths of an amp.',
          'That is not a low-power mode it drops into occasionally. It is where the device spends essentially its entire life, and everything else in this lecture is a consequence.',
        ],
        say: [
          'Lecture eleven ended on a machine with less of everything. This is it.',
          'A whole computer. Processor, memory, storage, a radio, a sensor. And it is switched off. Not idling, not waiting on a scheduler. Disconnected, drawing a few millionths of an amp.',
          '[matter-of-fact] And that is not a low-power mode it drops into occasionally. It is where the device spends essentially its entire life, and everything else in this lecture is a consequence of it.',
        ],
        camera: { position: [0, 6.6, 6.4], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'asleep',
      },
      {
        id: 'timer',
        kicker: 'The exception',
        heading: 'One thing has to stay awake',
        body: [
          'Something must be able to wake everything else, and it cannot be the processor, because the processor is off. So a small counter runs continuously on a trickle of current — the only part of the chip that never stops.',
          'It is dim on purpose. It is not working; it is counting, which is nearly free, and that near-free counting is what buys everything else the right to be entirely off.',
        ],
        say: [
          'Except something has to be able to wake everything else.',
          'And it cannot be the processor, because the processor is off. So a small counter runs continuously on a trickle of current. The only part of the chip that never stops.',
          '[reflective] It is dim on purpose. It is not working. It is counting, which is nearly free, and that near-free counting is what buys everything else the right to be entirely off.',
        ],
        camera: { position: [-1.6, 5.2, 5.6], target: [-0.7, 0, 0.3], fov: 33 },
        explode: 0,
        focus: 'timer',
        labels: [
          { text: 'Never sleeps', part: 'edge', offset: [-0.75, 0.6, 1.15], tone: 'amber' },
        ],
      },
    ],
  },

  {
    id: 'cycle',
    scene: 'edge',
    marker: '02',
    title: 'Wake, Work, Sleep',
    short: 'The cycle',
    beats: [
      {
        id: 'wake',
        kicker: 'The event',
        heading: 'Something happens, and the machine exists again',
        body: [
          'The counter reaches its number, or a sensor line changes, and an interrupt brings the processor back — the same mechanism from Lecture 6, doing the only job it does here.',
          'Watch the strip below. Nearly all of it is dark. The lit part is the entire working life of the device, laid end to end.',
        ],
        say: [
          'Then the counter reaches its number, or a sensor line changes.',
          'And an interrupt brings the processor back. The same mechanism from lecture six, doing the only job it does here.',
          '[pause] Watch the strip below. Nearly all of it is dark. That lit part is the entire working life of the device, laid end to end.',
        ],
        camera: { position: [0, 6.4, 7.0], target: [0, 0, 0.6], fov: 35 },
        explode: 0,
        focus: 'wake',
      },
      {
        id: 'work',
        kicker: 'The work',
        heading: 'Read something, decide something, say something',
        body: [
          'Sensor, then memory, then radio — and the radio is usually the most expensive part by a wide margin, which is why so much edge design is about *not transmitting*: summarise on the device, send a number rather than a stream.',
          'This is the argument for putting compute at the edge at all. It is not that the processing is better here. It is that moving the data costs more than doing the work.',
        ],
        say: [
          'Sensor, then memory, then radio.',
          {
            text: 'And the radio is usually the most expensive part by a wide margin, which is why so much edge design is about not transmitting. Summarise on the device. Send a number rather than a stream.',
            zoom: 0.9,
          },
          {
            text: '[matter-of-fact] Which is the actual argument for putting compute at the edge at all. It is not that the processing is better here. It is that moving the data costs more than doing the work.',
            zoom: 1,
          },
        ],
        camera: { position: [0.9, 5.6, 6.2], target: [0.5, 0, 0.2], fov: 34 },
        explode: 0,
        focus: 'work',
        labels: [
          { text: 'The expensive part', part: 'edge', offset: [1.75, 0.6, -1.05], tone: 'violet' },
        ],
      },
      {
        id: 'sleep',
        kicker: 'The arithmetic',
        heading: 'Average current is the only number that matters',
        body: [
          'Awake it might draw fifteen milliamps; asleep, one microamp. If it is awake for a hundredth of a percent of the time, the average works out around two and a half microamps — and it is the average that empties the battery.',
          'So no datasheet figure decides how long this lasts. The duty cycle does, and almost all of the engineering goes into making the awake part shorter rather than the asleep part cheaper.',
        ],
        say: [
          'And here is the only number that decides how long this lasts.',
          'Awake it might draw fifteen milliamps. Asleep, one microamp. And if it is awake for a hundredth of a percent of the time, the average works out around two and a half microamps.',
          '[pause] It is the average that empties the battery. So no datasheet figure decides how long this device runs. The duty cycle does.',
          '[reflective] Which is why almost all of the engineering goes into making the awake part shorter, rather than the asleep part cheaper.',
        ],
        camera: { position: [0, 6.8, 7.4], target: [0, 0, 0.7], fov: 36 },
        explode: 0,
        focus: 'sleep',
        aside: {
          label: 'What you are watching',
          text: 'The strip runs at roughly one part in eight for the sake of being visible. A real device of this kind is nearer one part in ten thousand — the picture is compressed, the ratio in the copy is not.',
        },
      },
    ],
  },

  {
    id: 'given',
    scene: 'edge',
    marker: '03',
    title: 'What It Gave Up',
    short: 'Traded',
    beats: [
      {
        id: 'noos',
        kicker: 'No operating system',
        heading: 'Almost nothing here is protecting anything from anything',
        body: [
          'There is no address translation, and often no wall at all — at most a thin one. Lecture 8 spent a chapter on a machine that stops programs touching each other; this one often runs a single program that owns everything, directly.',
          'That is affordable because there is usually only one program and nobody will ever install another. And it is why a bug here is not a crashed application — it is the whole device down.',
        ],
        say: [
          'Now what it gave up. And it gave up a great deal.',
          'There is no address translation. And often there is no wall at all, or at most a thin one. Lecture eight spent an entire chapter on a machine that stops programs touching each other. This one often runs a single program that owns everything, directly.',
          '[matter-of-fact] Which is affordable because there is usually only one program, and nobody will ever install another. And it is why a bug here is not a crashed application. It is the whole device down.',
        ],
        camera: { position: [-1.2, 6.0, 6.4], target: [-0.4, 0, 0], fov: 34 },
        explode: 0,
        focus: 'noos',
      },
      {
        id: 'unreachable',
        kicker: 'No one is coming',
        heading: 'Assume it will never be touched again',
        body: [
          'It might be in a wall, a field, a shipping container or a body. There is no screen to show an error, often no way to update it, and nobody nearby to turn it off and on again.',
          'So it has to recover from everything by itself, forever, which is a completely different engineering problem from the one a laptop has — and the reason a watchdog timer that reboots the machine when the software stops answering is standard rather than defensive.',
        ],
        say: [
          'Because it might be in a wall. A field. A shipping container. Or a body.',
          'There is no screen to show an error, often no way to update it, and nobody nearby to turn it off and on again.',
          '[pause] So it has to recover from everything by itself, forever. Which is a completely different engineering problem from the one a laptop has, and the reason a watchdog timer that reboots the machine when the software stops answering is standard here rather than defensive.',
        ],
        camera: { position: [1.4, 6.2, 6.6], target: [0.4, 0, 0], fov: 35 },
        explode: 0,
        focus: 'unreachable',
      },
      {
        id: 'determinism',
        kicker: 'What it gets back',
        heading: 'It does the same thing in nearly the same time, every time',
        body: [
          'Often no scheduler, no cache sometimes missing, no other program competing. The same input produces the same work in very nearly the same number of microseconds on every run — far less variance than anything with a cache and a scheduler.',
          'Everything Lectures 2, 3 and 8 added to make an average fast was also a source of variance. Give it all up and you get what a laptop can never offer: a guarantee.',
        ],
        say: [
          'And in exchange for all of that, it gets one thing.',
          'Often no scheduler. No cache sometimes missing. No other program competing. The same input produces the same work, in very nearly the same number of microseconds, on every run. Far less variance than anything with a cache and a scheduler.',
          '[matter-of-fact] Everything lectures two, three and eight added to make an average fast was also a source of variance. Give it all up, and you get what a laptop can never offer. A guarantee.',
          '[pause] Which is why the next two lectures are built on this machine rather than on a phone. A car and a robot do not need something fast. They need something that is never late.',
        ],
        camera: { position: [0, 6.6, 7.2], target: [0, 0, 0.5], fov: 36 },
        explode: 0,
        focus: 'determinism',
        aside: {
          label: 'Where this goes',
          text: 'That guarantee is why the next two lectures are built on this machine rather than on a phone. A car and a robot do not need something fast; they need something that is never late.',
        },
      },
    ],
  },
]
