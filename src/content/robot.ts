import type { Chapter } from './types'

/**
 * Lecture 14 — The Robot.
 *
 * The car needed an answer that was correct and on time. This needs the same
 * thing, but its deadline is set by how fast a physical object moves, and it
 * cannot ask the world to wait.
 *
 * Checked: the joint loop a robot controller exposes typically runs between
 * 100 Hz and 1 kHz (Franka's FCI: 1 kHz), while the servo drive's own
 * current loop runs at kHz rates (Synapticon: 16 kHz). It runs on a
 * microcontroller, usually under a small RTOS, with microsecond determinism, while perception runs
 * Linux-class on an application processor at video rates. Whether a single SoC
 * with hardware-enforced separation can collapse that split is a live argument
 * in the industry rather than a settled fact, and the lecture presents it as
 * one.
 */
export const robotChapters: Chapter[] = [
  {
    id: 'twoloops',
    scene: 'robot',
    marker: '01',
    title: 'Two Loops',
    short: 'Two loops',
    beats: [
      {
        id: 'fast',
        kicker: 'The control loop',
        heading: 'Read the joint, correct it, again',
        body: [
          'The inner loop does one small thing very often: read where the joint actually is, compare it to where it should be, adjust the motor. Nothing clever, and it runs somewhere between a hundred and a thousand times a second — while inside the motor drive, the loop that sets the current runs faster still, often thousands of times a second.',
          'It has to be that fast because the arm keeps moving whether or not the computer is ready. Every pass it misses is a period where the machine is running on a stale idea of where it is.',
        ],
        say: [
          'Lecture thirteen handed this one a deadline measured in how long a physical thing takes to move.',
          'The inner loop does one small thing, very often. Read where the joint actually is, compare it to where it should be, adjust the motor. Nothing clever. And it runs somewhere between a hundred and a thousand times a second. Inside the motor drive, the loop that sets the current runs faster still. Often thousands of times a second.',
          '[matter-of-fact] It has to be that fast, because the arm keeps moving whether or not the computer is ready. Every pass it misses is a period where the machine is running on a stale idea of where it is.',
        ],
        camera: { position: [0, 6.4, 6.6], target: [0, 0, 0], fov: 35 },
        explode: 0,
        focus: 'fast',
      },
      {
        id: 'slow',
        kicker: 'The perception loop',
        heading: 'And a much slower one, thinking about the world',
        body: [
          'The outer loop looks at a camera, works out what is in front of it, and decides where the arm should go next. That is heavy work — a neural network over an image — and it arrives at video rates, tens of times a second at best.',
          'It is also the loop that needs an operating system, a filesystem and gigabytes of memory. Everything Part III described lives out here.',
        ],
        say: [
          'And wrapped around it, a much slower loop, thinking about the world.',
          'It looks at a camera, works out what is in front of it, and decides where the arm should go next. That is heavy work, a neural network over an image, and it arrives at video rates. Tens of times a second, at best.',
          '[reflective] It is also the loop that needs an operating system, a filesystem and gigabytes of memory. Everything part three described lives out here.',
        ],
        camera: { position: [0, 7.4, 7.4], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'slow',
      },
      {
        id: 'contrast',
        kicker: 'Together',
        heading: 'One goes round many times while the other goes round once',
        body: [
          'Watch both. The inner ring laps the outer one over and over, and that ratio is the whole architecture — a fast, dumb, utterly reliable loop wrapped inside a slow, clever, occasionally unpredictable one.',
          'On screen the ratio is about eight to one so that both are watchable. In a real machine it is nearer thirty to one, and often more.',
        ],
        say: [
          'Watch both of them together.',
          {
            text: 'The inner ring laps the outer one, over and over. And that ratio is the whole architecture. A fast, dumb, utterly reliable loop, wrapped inside a slow, clever, occasionally unpredictable one.',
            zoom: 0.9,
          },
          {
            text: '[pause] On screen the ratio is about eight to one, so that both are watchable. In a real machine it is nearer thirty to one, and often more.',
            zoom: 1,
          },
        ],
        camera: { position: [0, 8.0, 7.8], target: [0, 0, 0], fov: 37 },
        explode: 0,
        focus: 'contrast',
      },
    ],
  },

  {
    id: 'split',
    scene: 'robot',
    marker: '02',
    title: 'Two Brains',
    short: 'The split',
    beats: [
      {
        id: 'split',
        kicker: 'Why two computers',
        heading: 'The loops want opposite machines',
        body: [
          'The inner loop wants Lecture 12\'s machine: a microcontroller with a small real-time operating system or none at all, the same work in the same microseconds every time. The outer loop wants Lecture 11\'s: a large processor with an OS, caches and plenty of memory.',
          'Those requirements are not merely different, they are contradictory — everything that makes the outer machine fast on average is a source of the variance the inner one cannot tolerate. So most robots simply have both.',
        ],
        say: [
          'Which means the two loops want opposite machines.',
          'The inner one wants lecture twelve\'s. A microcontroller, with a small real-time operating system or none at all. The same work in the same microseconds every time. The outer one wants lecture eleven\'s. A large processor with an operating system, caches, and plenty of memory.',
          '[matter-of-fact] And those requirements are not merely different. They are contradictory. Everything that makes the outer machine fast on average is a source of the variance the inner one cannot tolerate.',
          '[pause] So most robots simply have both.',
        ],
        camera: { position: [1.8, 7.0, 7.2], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'split',
      },
      {
        id: 'unified',
        kicker: 'An open question',
        heading: 'Whether one chip can do both is genuinely unsettled',
        body: [
          'The obvious next move is a single processor with hardware-enforced separation: real-time cores and application cores on one die, isolated firmly enough that the clever half can never make the reliable half late.',
          'Parts like that exist and are being adopted, and the argument about whether they are trustworthy enough for the loops that move heavy things is still running. This is not a settled fact being taught — it is an open engineering question, and worth knowing as one.',
        ],
        say: [
          'Could one chip do both? That is genuinely unsettled.',
          'The obvious next move is a single processor with hardware-enforced separation. Real-time cores and application cores on one die, isolated firmly enough that the clever half can never make the reliable half late.',
          '[reflective] Parts like that exist, and are being adopted. And the argument about whether they are trustworthy enough for the loops that move heavy things is still running. So this is not a settled fact being taught. It is an open engineering question, and it is worth knowing as one.',
        ],
        camera: { position: [-1.6, 7.0, 7.2], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'unified',
      },
    ],
  },

  {
    id: 'late',
    scene: 'robot',
    marker: '03',
    title: 'Late Is Wrong',
    short: 'Deadlines',
    beats: [
      {
        id: 'deadline',
        kicker: 'The budget',
        heading: 'Finish before the line, with room to spare',
        body: [
          'The green arc is the work; the mark is when it must be done. On a normal pass it finishes early and the processor waits — deliberately idle, because idle is proof there was margin.',
          'A general-purpose machine would call that wasted capacity and find something to fill it with. Here the empty space is the safety.',
        ],
        say: [
          'So back to the deadline itself.',
          'The green arc is the work. The mark is when it has to be done. And on a normal pass it finishes early, and then the processor waits. Deliberately idle.',
          '[matter-of-fact] Because idle is proof that there was margin. A general-purpose machine would call that wasted capacity and find something to fill it with. Here, the empty space is the safety.',
        ],
        camera: { position: [0.8, 5.6, 6.0], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'deadline',
        labels: [
          { text: 'Must be done by here', part: 'robot', offset: [0.9, 0.6, -0.95], tone: 'plain' },
        ],
      },
      {
        id: 'miss',
        kicker: 'A miss',
        heading: 'And when it is late, the arm is in the wrong place',
        body: [
          'Every fifth pass runs long. Watch what happens — the arc is still growing when it crosses the mark, and the correction arrives after the world has already moved. The arm overshoots. A real controller watches for exactly this, and when passes keep arriving late it stops the arm — which is safer, and is still a failure.',
          'This is what a missed deadline looks like from outside. Not a dropped frame or a stutter: a physical thing somewhere it should not be, with whatever that implies about what it was holding.',
        ],
        say: [
          'Now watch a pass run long.',
          'The arc is still growing when it crosses the mark. The correction arrives after the world has already moved. And the arm overshoots.',
          'A real controller watches for exactly this, and when passes keep arriving late, it stops the arm. Which is safer. And is still a failure.',
          '[pause] That is what a missed deadline looks like from outside. Not a dropped frame. Not a stutter. A physical thing somewhere it should not be, with whatever that implies about what it was holding.',
        ],
        camera: { position: [0.6, 5.2, 5.8], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'miss',
      },
      {
        id: 'predictable',
        kicker: 'The trade',
        heading: 'Slower on average, and never late',
        body: [
          'So the inner loop gives up everything that produces variance — the caches that sometimes miss, the prediction that sometimes flushes, the scheduler that sometimes chooses badly. It is far slower than it could be, and that is the point.',
          'Parts I to III chased a fast average. This is the first lecture where average performance is not merely secondary but actively suspect, because an average says nothing about the worst case, and the worst case is the only one that can hurt anybody.',
        ],
        say: [
          'So the inner loop gives up everything that produces variance.',
          'The caches that sometimes miss. The prediction that sometimes flushes. The scheduler that sometimes chooses badly. It is far slower than it could be, and that is the point.',
          '[matter-of-fact] Parts one to three chased a fast average. This is the first lecture where average performance is not merely secondary but actively suspect, because an average says nothing about the worst case. And the worst case is the only one that can hurt anybody.',
          '[reflective] Three machines have now traded speed for a guarantee. The edge device, for power. The car, for safety. And the robot, for time. Next is the one that gives up nothing at all, and simply buys whatever it needs.',
        ],
        camera: { position: [0, 6.8, 7.0], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'predictable',
        aside: {
          label: 'Where this goes',
          text: 'Three lectures traded speed for a guarantee: the edge device for power, the car for safety, the robot for time. The capstone implant gives up most: a few tens of milliwatts, no swap without surgery, a person around it.',
        },
      },
    ],
  },
]
