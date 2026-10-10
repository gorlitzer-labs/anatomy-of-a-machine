import type { Chapter } from './types'

/**
 * Lecture 11 — The Phone.
 *
 * Opens Part IV, and it is the format proof: every lecture from here is the
 * same machine under a different budget, and every one of them can point back
 * at something already built.
 *
 * The numbers were checked. A phone case sheds roughly 3-5 W continuously,
 * while heavy work asks for 6-10 W and more, so a flagship processor can always
 * produce more heat than the phone it lives in can lose. And the ceiling is
 * *skin* temperature — governors hold the case somewhere around 43-46 °C (Pixel skin thresholds: 43 moderate, 45 severe, 46.5 critical) —
 * which means the limit is not the silicon's tolerance but a person's hand.
 */
export const phoneChapters: Chapter[] = [
  {
    id: 'onedie',
    scene: 'phone',
    marker: '01',
    title: 'One Die',
    short: 'One die',
    beats: [
      {
        id: 'die',
        kicker: 'The whole machine',
        heading: 'Everything from Lecture 5, printed together',
        body: [
          'Processor, graphics, memory, radio, camera pipeline, neural unit. On a laptop these were separate parts on a board with sockets and slots between them. Here they share one package: most of them on one piece of silicon, with the memory stacked directly on top.',
          'Nothing was invented to make that possible. What changed is that there was no room for anything else, and every connector deleted is power not spent driving a signal off-chip.',
        ],
        say: [
          'Part four starts here. The same machine, with a different budget. And this is the tightest one anybody carries.',
          'Processor, graphics, memory, radio, camera pipeline, neural unit. On a laptop these were separate parts on a board, with sockets and slots between them. Here they share one package. Most of them on one piece of silicon, with the memory stacked directly on top.',
          '[matter-of-fact] And nothing was invented to make that possible. What changed is that there was no room for anything else, and every connector deleted is power not spent driving a signal off-chip.',
        ],
        camera: { position: [0, 7.6, 7.2], target: [0, 0, 0], fov: 35 },
        explode: 0,
        focus: 'die',
        labels: [
          { text: 'Graphics', part: 'phone', offset: [0.7, 0.6, -0.6], tone: 'violet' },
          { text: 'Neural unit', part: 'phone', offset: [1.5, 0.6, -1.55], tone: 'plain' },
        ],
      },
      {
        id: 'compare',
        kicker: 'What was given up',
        heading: 'Nothing here is meant to be replaced',
        body: [
          'The laptop board had sockets: memory you could swap, storage you could upgrade, a battery held in by screws. None of that survives. Integration bought power and space by making almost every part permanent.',
          'That is the first trade of this lecture and it is not a technical one — it is why memory and storage are fixed for the life of the phone, and a tired battery is a job for a repair shop rather than a screwdriver.',
        ],
        say: [
          'Which costs something, and it is not a technical cost.',
          'The laptop board had sockets. Memory you could swap, storage you could upgrade, a battery held in by screws. None of that survives.',
          '[reflective] Integration bought power and space by making almost every part permanent. Which is why the memory and storage are fixed for the life of the phone, and a tired battery is a job for a repair shop, not a screwdriver.',
        ],
        camera: { position: [2.6, 6.4, 6.8], target: [0, 0, 0], fov: 35 },
        explode: 0,
        focus: 'compare',
      },
    ],
  },

  {
    id: 'cores',
    scene: 'phone',
    marker: '02',
    title: 'Not All Cores Are Equal',
    short: 'Cores',
    beats: [
      {
        id: 'little',
        kicker: 'Efficiency cores',
        heading: 'Most of the time, almost nothing is happening',
        body: [
          'A phone spends the overwhelming majority of its life doing very little: checking a radio, ticking a clock, waiting for you. Running that on a fast core would waste most of the energy on being fast.',
          'So there are small, slow, cheap cores that handle it, and they are the ones that are almost always on.',
        ],
        say: [
          'Now look at what the cores are doing, because they are not all the same.',
          'A phone spends the overwhelming majority of its life doing very little. Checking a radio, ticking a clock, waiting for you. Running that on a fast core would waste most of the energy on being fast.',
          '[pause] So there are small, slow, cheap cores that handle it. And they are the ones that are almost always on.',
        ],
        camera: { position: [-1.4, 6.0, 6.4], target: [-0.9, 0, 0], fov: 34 },
        explode: 0,
        focus: 'little',
        labels: [
          { text: 'Always on', part: 'phone', offset: [-0.3, 0.6, -1.5], tone: 'cyan' },
        ],
      },
      {
        id: 'prime',
        kicker: 'Prime cores',
        heading: 'And then, briefly, everything is',
        body: [
          'When you touch the screen, a large fast core wakes, does the work in a burst, and goes away again. Watch the rhythm: the big blocks flash and vanish while the small ones tick steadily.',
          'A small core does light work for far less energy, and for heavy work it is often cheaper to finish fast and switch off than to stay half-awake. So: slow by default and fast in bursts, not moderately fast throughout.',
        ],
        say: [
          'And then, briefly, everything is.',
          'When you touch the screen, a large fast core wakes, does the work in a burst, and goes away again. Watch the rhythm. The big blocks flash and vanish while the small ones tick steadily.',
          '[matter-of-fact] Because a small core does light work for far less energy. And for heavy work, it is often cheaper to finish fast and switch off than to stay half-awake. So the design is slow by default and fast in bursts, not moderately fast throughout.',
          '[reflective] Flagships mix two or three kinds of core. Apple\'s A eighteen Pro has two performance cores and four efficiency cores. MediaTek\'s Dimensity ninety-three hundred has four prime cores, four mid cores, and no efficiency cores at all. How fast do I need to be right now has more than one useful answer, and every designer weighs them differently.',
        ],
        camera: { position: [-1.6, 5.6, 6.2], target: [-1.1, 0, -0.3], fov: 34 },
        explode: 0,
        focus: 'prime',
        aside: {
          label: 'The arrangement',
          text: 'Flagships mix two or three kinds of core: Apple\'s A18 Pro has two performance cores and four efficiency cores; MediaTek\'s Dimensity 9300 has four prime cores, four mid cores and no efficiency cores at all. "How fast do I need to be right now" has more than one useful answer, and every designer weighs them differently.',
        },
      },
      {
        id: 'scheduler',
        kicker: 'Who decides',
        heading: 'The scheduler has to guess what you are about to do',
        body: [
          'Put work on a small core and it may take too long to feel responsive. Put it on a large one and the battery pays for a burst nobody needed. The decision is made in milliseconds, constantly, on incomplete information.',
          'This is Lecture 8\'s scheduler again, with a new problem: it is no longer choosing who runs, but *what kind of machine they run on*.',
        ],
        say: [
          'Which hands the scheduler a new problem.',
          'Put work on a small core and it may take too long to feel responsive. Put it on a large one and the battery pays for a burst nobody needed. And that decision is made in milliseconds, constantly, on incomplete information.',
          '[pause] This is lecture eight\'s scheduler again. Except it is no longer choosing who runs. It is choosing what kind of machine they run on.',
        ],
        camera: { position: [-0.9, 6.4, 6.6], target: [-0.7, 0, 0], fov: 35 },
        explode: 0,
        focus: 'scheduler',
      },
    ],
  },

  {
    id: 'dark',
    scene: 'phone',
    marker: '03',
    title: 'Dark Silicon',
    short: 'Dark',
    beats: [
      {
        id: 'gating',
        kicker: 'Power gating',
        heading: 'Not idle — disconnected',
        body: [
          'Watch the blocks go out. A part that is not needed is not running slowly or sitting idle; it is cut off from the supply and drawing almost nothing, and it can be brought back in a millisecond or so.',
          'This is the first thing in the course that turns *off*. Everything before this dimmed, because everything before this was always doing something.',
        ],
        say: [
          'And here is the first thing in this entire course that turns off.',
          {
            text: 'Watch the blocks go out. A part that is not needed is not running slowly, and it is not sitting idle. It is cut off from the supply, drawing almost nothing. And it can be brought back in a millisecond or so.',
            zoom: 0.9,
          },
          {
            text: '[matter-of-fact] Everything before this dimmed. Because everything before this was always doing something.',
            zoom: 1,
          },
        ],
        camera: { position: [0, 7.4, 7.0], target: [0, 0, 0], fov: 35 },
        explode: 0,
        focus: 'gating',
      },
      {
        id: 'dark',
        kicker: 'Why it must',
        heading: 'The chip is bigger than its power budget',
        body: [
          'There are more blocks on this die than can ever be powered at once. That is not an oversight — it is the direct consequence of Lecture 3: transistors kept shrinking, but the power each one needs stopped falling as fast as they shrank.',
          'So a modern chip is designed to be mostly off. You get a camera processor and a neural unit and a modem, and you get to use a few of them at a time.',
        ],
        say: [
          'Which is not an optimisation. It is a requirement.',
          'There are more blocks on this die than can ever be powered at once. And that is the direct consequence of lecture three. Transistors kept shrinking, but the power each one needs stopped falling as fast as they shrank.',
          '[pause] So a modern chip is designed to be mostly off. You get a camera processor, and a neural unit, and a modem. And you get to use a few of them at a time.',
          '[reflective] The industry calls the parts you cannot afford to switch on dark silicon. It sounds like a defect. It is a design assumption, and it is why specialised blocks are worth their area. A unit that is off costs almost nothing but space.',
        ],
        camera: { position: [1.2, 7.8, 7.2], target: [0.2, 0, 0], fov: 36 },
        explode: 0,
        focus: 'dark',
        aside: {
          label: 'The name',
          text: 'The industry calls the parts you cannot afford to switch on "dark silicon". It sounds like a defect. It is a design assumption, and it is why specialised blocks are worth their area: a unit that is off costs almost nothing but space.',
        },
      },
    ],
  },

  {
    id: 'sealed',
    scene: 'phone',
    marker: '04',
    title: 'The Sealed Slab',
    short: 'Heat',
    beats: [
      {
        id: 'sealed',
        kicker: 'No fan',
        heading: 'The only way out is through the case',
        body: [
          'A laptop had a heat pipe, a fin stack and a fan. A phone has no fan and no fins — at most a flat heat spreader, which in some flagships is a vapour chamber. Heat leaves through the back of the case and your hand, and that is the entire cooling system.',
          'The bar is power, in watts, and the green mark is what the case can shed continuously — very roughly three to five of them. Everything to the right of it is borrowed: the machine is running on stored heat capacity and will have to pay it back.',
        ],
        say: [
          'And now the constraint that decides all of it.',
          'A laptop had a heat pipe, a fin stack and a fan. A phone has no fan and no fins. At most a flat heat spreader, which in some flagships is a vapour chamber. Heat leaves through the back of the case, and your hand. That is the entire cooling system.',
          '[matter-of-fact] Read the panel. That is what the chip is asking for, against what the case can actually shed continuously, which is very roughly three to five watts. Everything above that line is borrowed. The machine is running on stored heat capacity, and it will have to pay it back.',
        ],
        camera: { position: [0, 6.6, 8.0], target: [0, 0, 0.8], fov: 36 },
        explode: 0,
        focus: 'sealed',
        readout: true,
        labels: [
          { text: 'What it can shed', part: 'phone', offset: [-0.4, 0.5, 2.35], tone: 'plain' },
        ],
      },
      {
        id: 'throttle',
        kicker: 'Throttling',
        heading: 'Everything slows down',
        body: [
          'Heavy work asks for six to ten watts and more. So heat accumulates, the bar climbs past what the case can lose, and the only control left is the clock — so the clock comes down.',
          'Look at the whole die: every block is now moving more slowly. That is not a metaphor for throttling; it is throttling.',
        ],
        say: [
          'So watch it pay.',
          'Heavy work asks for six to ten watts, and more. Heat accumulates, the bar climbs past what the case can lose, and the only control left is the clock. So the clock comes down. Watch the state change.',
          '[pause] And look at the whole die, not just the bar. Every block is moving more slowly, because they are. This is not a metaphor for throttling. It is what throttling is.',
          '[reflective] The governors are holding the case somewhere around forty-three to forty-six degrees, and the silicon could comfortably run hotter. The ceiling is not what the chip can survive. It is what a hand can hold.',
        ],
        camera: { position: [0, 6.4, 7.8], target: [0, 0, 0.6], fov: 36 },
        explode: 0,
        focus: 'throttle',
        readout: true,
        aside: {
          label: 'The limit is you',
          text: 'The governors hold the case around 43–46 °C, though the silicon could comfortably run hotter. The ceiling is not what the chip can survive but what a hand can hold.',
        },
      },
      {
        id: 'budget',
        kicker: 'The trade',
        heading: 'Peak is temporary',
        body: [
          'Flagship chips can make more heat than a phone can lose, so the box\'s number holds for a few seconds; a quick benchmark measures what you rarely see.',
          'Energy per task was the constraint, and all else followed: small cores by default, most of the chip off, almost nothing replaceable, a peak that cannot last.',
        ],
        say: [
          'Which makes peak performance, by definition, temporary.',
          'A flagship processor can always produce more heat than the phone around it can lose. So the number on the box is real for a few seconds, and then it is not. A benchmark that finishes quickly measures something you will rarely experience.',
          '[matter-of-fact] The constraint of this lecture was energy per task, and everything followed from it. Small cores by default. Most of the chip off. Almost nothing replaceable. And a peak that cannot be held.',
          '[pause] Next, the same sum with less of everything. A machine with no screen, no operating system, and no assumption that you can reboot it.',
        ],
        camera: { position: [0, 7.6, 8.4], target: [0, 0, 0.5], fov: 38 },
        explode: 0,
        focus: 'budget',
        readout: true,
        aside: {
          label: 'Where Part IV goes',
          text: 'The edge device drops screen and OS, the car gets fifteen years in a vibrating oven, the robot a hard deadline, the implant a few tens of milliwatts and a sealed battery.',
        },
      },
    ],
  },
]
