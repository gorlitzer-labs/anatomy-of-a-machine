import type { Chapter } from './types'

/**
 * Lecture 13 — The Car.
 *
 * The first machine in the course where being wrong can hurt someone, and
 * every decision in it follows from that rather than from performance.
 *
 * Checked: CAN arbitration is bitwise and non-destructive, and the lower
 * identifier wins — the winning frame survives the contention intact and does
 * not need resending. Dual-core lockstep is a standard route to ISO 26262
 * ASIL D. Automotive silicon is typically qualified to AEC-Q100 Grade 1,
 * −40 °C to 125 °C (Grade 0, to 150 °C, near the engine). And zonal
 * architecture is in production (Rivian's second-generation R1), though
 * McKinsey/GSA forecast only about 18% of new vehicles zonal by 2030.
 */
export const carChapters: Chapter[] = [
  {
    id: 'many',
    scene: 'car',
    marker: '01',
    title: 'Not One Computer',
    short: 'Many',
    beats: [
      {
        id: 'units',
        kicker: 'How many',
        heading: 'A car is dozens of small computers',
        body: [
          'Not one processor running everything, but many separate units — one for the engine, one for the brakes, one per door, one for the mirrors — each a small machine of exactly the kind Lecture 12 described.',
          'They were separate for a good reason: each was made by whoever made the part it controls, and a fault in the seat heater has no way to reach the brakes if they share nothing.',
        ],
        say: [
          'Lecture twelve ended by handing a guarantee about time to two machines. This is the first of them.',
          'And a car is not one computer. It is dozens of small ones. One for the engine, one for the brakes, one per door, one for the mirrors. Each a small machine of exactly the kind the last lecture described.',
          '[matter-of-fact] They were separate for a good reason. Each was made by whoever made the part it controls. And a fault in the seat heater has no way to reach the brakes if they share nothing.',
        ],
        camera: { position: [0, 7.4, 7.2], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'units',
      },
      {
        id: 'harness',
        kicker: 'The cost',
        heading: 'And every one of them needs wiring',
        body: [
          'Group units by what they do and the wiring has to reach across the whole car to connect them. The harness grew to tens of kilograms of copper and about a fifth of the cost of a car\'s electrical system, and it is still largely built by hand.',
          'Look at the stubs. Every unit is where its function is, not where it is convenient, and the copper pays for it.',
        ],
        say: [
          'But every one of them needs wiring.',
          'Group the units by what they do, and the wiring has to reach across the whole car to connect them. The harness grew to tens of kilograms of copper, and about a fifth of the cost of a car\'s electrical system. And it is still largely built by hand.',
          '[pause] Look at the stubs, and read the figure. Every unit is where its function is, not where it is convenient. And the copper pays for it.',
        ],
        camera: { position: [1.8, 6.6, 7.0], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'harness',
        readout: true,
      },
    ],
  },

  {
    id: 'onewire',
    scene: 'car',
    marker: '02',
    title: 'One Wire, Many Talkers',
    short: 'The bus',
    beats: [
      {
        id: 'bus',
        kicker: 'CAN',
        heading: 'So they share a single pair of wires',
        body: [
          'Rather than a wire from everything to everything, one bus runs the length of the car and every unit hangs off it — in a real car, a handful of such buses at different speeds, joined by gateways. It is slow by any standard in this course and completely unbothered by that.',
          'What matters is not how much it carries. It is what happens when two units try to talk at the same moment.',
        ],
        say: [
          'So they share a single pair of wires.',
          'Rather than a wire from everything to everything, one bus runs the length of the car and every unit hangs off it. In a real car there are a handful of these, at different speeds, joined by gateways. Each one is slow by any standard in this course, and completely unbothered by that.',
          '[matter-of-fact] Because what matters is not how much it carries. It is what happens when two units try to talk at the same moment.',
        ],
        camera: { position: [0, 6.4, 7.2], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'bus',
      },
      {
        id: 'arbitrate',
        kicker: 'Arbitration',
        heading: 'The most urgent message wins, by construction',
        body: [
          'Every message starts with an identifier, and the identifier *is* the priority. As units transmit, the one sending the lower number overrides the others bit by bit, and the losers detect it and stop.',
          'Watch the three that start together. Two turn amber and pull back. One is green and keeps going.',
        ],
        say: [
          'And the answer is unusually elegant.',
          'Every message starts with an identifier, and that identifier is the priority. As units transmit, the one sending the lower number overrides the others bit by bit, and the losers detect it and stop.',
          '[pause] Watch the three that start together. Two turn amber and pull back. One stays green, and keeps going.',
        ],
        camera: { position: [0, 6.0, 6.8], target: [0, 0, 0], fov: 35 },
        explode: 0,
        focus: 'arbitrate',
        readout: true,
        labels: [
          { text: 'Lower number wins', part: 'car', offset: [0, 0.7, -2.15], tone: 'plain' },
        ],
      },
      {
        id: 'nondestructive',
        kicker: 'The elegant part',
        heading: 'The winner never noticed',
        body: [
          'The contention did not damage the winning message and did not delay it; the losers retry once the bus is free.',
          'A network that only detected collisions would make everyone back off and retry, slowing down exactly when it was busiest. Here the most urgent message waits at most for the frame already on the wire, which is why you can put brakes on it.',
        ],
        say: [
          'And here is the property worth stopping on.',
          'The contention did not damage the winning message, and it did not delay it. It carried on uninterrupted, and it never has to be sent again. The losers simply retry, the moment the bus is free.',
          '[matter-of-fact] Compare that to a network that merely detects collisions. Everyone backs off and retries, so it gets slower exactly when it is busiest. Here the most urgent message waits, at most, for the frame already on the wire. And that is why you can put brakes on it.',
          '[reflective] What it costs is flexibility. Priority is fixed at design time, in the identifiers. A low-priority unit on a busy bus may wait a long time, and nothing at runtime can promote it.',
        ],
        camera: { position: [-1.2, 5.6, 6.6], target: [-0.3, 0, 0], fov: 35 },
        explode: 0,
        focus: 'nondestructive',
        readout: true,
        aside: {
          label: 'What it costs',
          text: 'Priority is fixed at design time, so on a busy bus a low-priority unit can wait a long time.',
        },
      },
    ],
  },

  {
    id: 'zonal',
    scene: 'car',
    marker: '03',
    title: 'Rewiring',
    short: 'Zonal',
    beats: [
      {
        id: 'zonal',
        kicker: 'Zonal architecture',
        heading: 'Group them by where they are, not by what they do',
        body: [
          'Watch the units move. Put a controller in each corner, wire everything nearby to it, and run one trunk from each corner to a central computer. A unit now reaches only as far as the corner it is in.',
          'The wiring on screen halves, and that is the whole argument: less copper, less weight, and a harness that is far easier to build. This is not a proposal — Rivian\'s second-generation R1 is built this way, and lost more than 2.6 km of wire, about 20 kg, doing it. Most cars are still wired the old way, but the industry is moving.',
        ],
        say: [
          'Now watch the units move.',
          {
            text: 'Put a controller in each corner, wire everything nearby to it, and run one trunk from each corner to a central computer. A unit now reaches only as far as the corner it is in.',
            zoom: 0.9,
          },
          {
            text: '[pause] And read the wiring figure while it happens. It halves. That is the whole argument — less copper, less weight, and a harness that is far easier to build.',
            zoom: 1,
          },
          '[matter-of-fact] And this is not a proposal. Rivian\'s second-generation R1 is built this way, and lost more than two and a half kilometres of wire doing it. About twenty kilograms. Most cars are still wired the old way, but the industry is moving.',
        ],
        camera: { position: [0, 7.6, 7.4], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'zonal',
        readout: true,
      },
      {
        id: 'software',
        kicker: 'The catch',
        heading: 'The hardware got simpler and the software got much harder',
        body: [
          'Functions that used to be a box from one supplier are now software sharing a computer with other suppliers\' software. Everything that Lecture 8 said about isolation suddenly matters in a vehicle.',
          'That inversion is the real story of the change: fewer parts, far more integration, and a safety argument that now has to be made about software rather than about wiring.',
        ],
        say: [
          'But the hardware getting simpler made the software much harder.',
          'Functions that used to be a box from one supplier are now software, sharing a computer with other suppliers\' software. And everything lecture eight said about isolation suddenly matters in a vehicle.',
          '[reflective] That inversion is the real story of the change. Fewer parts, far more integration, and a safety argument that now has to be made about software rather than about wiring.',
        ],
        camera: { position: [1.6, 7.0, 7.2], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'software',
        readout: true,
      },
    ],
  },

  {
    id: 'mustnot',
    scene: 'car',
    marker: '04',
    title: 'It Must Not Fail',
    short: 'Safety',
    beats: [
      {
        id: 'lockstep',
        kicker: 'Lockstep',
        heading: 'Two cores doing exactly the same thing',
        body: [
          'The second core computes nothing new. It runs the identical instructions on the identical data, often a clock cycle or two behind so that one disturbance cannot strike both at the same moment, and a comparator checks the two results continuously.',
          'Watch the bar. Green while they agree; the instant they diverge it goes red. The machine does not know which core is right — only that something is wrong, which is enough to stop trusting the answer.',
        ],
        say: [
          'Which brings us to the requirement everything here answers to. It must not fail.',
          'So two cores run exactly the same instructions, on exactly the same data, and a comparator checks the two results continuously. The second core computes nothing new. It often runs a clock cycle or two behind, so that one disturbance cannot strike both at the same moment.',
          '[pause] Watch the bar. Green while they agree. And the instant they diverge, it goes red. The machine does not know which core is right. Only that something is wrong, which is enough to stop trusting the answer.',
        ],
        camera: { position: [0, 5.0, 6.0], target: [0, 0.2, 0.2], fov: 34 },
        explode: 0,
        focus: 'lockstep',
        labels: [
          { text: 'The comparator', part: 'car', offset: [0, 0.55, 1.35], tone: 'plain' },
        ],
      },
      {
        id: 'asil',
        kicker: 'Proving it',
        heading: 'Safety here is a document as much as a circuit',
        body: [
          'The safety goals for braking are typically rated at the highest safety level, and reaching it means showing what fails, how often, and what happens next — with lockstep, error-correcting memory and self-tests as the evidence.',
          'Half the work is not making the machine reliable. It is being able to demonstrate that it is, to someone who will not take your word for it.',
        ],
        say: [
          'And safety here is a document, as much as it is a circuit.',
          'The safety goals for braking are typically rated at the highest safety level, and reaching it means showing what fails, how often, and what happens next, with lockstep and error-correcting memory and self-tests as the evidence.',
          '[matter-of-fact] So half the work is not making the machine reliable. It is being able to demonstrate that it is, to somebody who will not take your word for it.',
        ],
        camera: { position: [1.4, 5.4, 6.2], target: [0.2, 0.2, 0.2], fov: 34 },
        explode: 0,
        focus: 'asil',
      },
      {
        id: 'lifetime',
        kicker: 'The budget',
        heading: 'Fifteen years, in a vibrating oven',
        body: [
          'Automotive silicon is typically qualified from forty below to a hundred and twenty-five above — a hundred and fifty near the engine — and built to last around fifteen years of vibration, damp and temperature swings, in a machine that may never be serviced by anyone who understands it.',
          'So a car\'s safety controllers skip the newest process node, even if its driver-assistance computer uses it. The constraint was never speed. It was not failing, for a very long time, in a bad place.',
        ],
        say: [
          'And it has to keep being true for around fifteen years.',
          'Automotive silicon is typically qualified from forty below to a hundred and twenty-five above. A hundred and fifty, near the engine. And it is expected to work through vibration, damp and temperature swings, in a machine that may never be serviced by anyone who understands it.',
          '[pause] Which is why a car\'s safety controllers do not run the newest process node, even when its driver-assistance computer does. The constraint was never speed. It was that it must not fail, for a very long time, in a bad place.',
          '[reflective] The next machine needs the same thing. But its deadline is measured in the time a physical object takes to move, and it cannot ask the world to wait.',
        ],
        camera: { position: [0, 7.0, 7.6], target: [0, 0, 0], fov: 37 },
        explode: 0,
        focus: 'lifetime',
        aside: {
          label: 'Where this goes',
          text: 'The car needs an answer that is correct and on time. The robot in the next lecture needs the same thing, but its deadline is measured in the time a physical thing takes to move — and it cannot ask the world to wait.',
        },
      },
    ],
  },
]
