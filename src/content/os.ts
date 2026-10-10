import type { Chapter } from './types'

/**
 * Lecture 9 — Operating Systems.
 *
 * Extends the kernel scene rather than building a new one, because the subject
 * genuinely is the same arrangement with the wall in a different place. Lecture
 * 8 established a boundary, a checkpoint and a contended resource; this asks
 * what changes when you move the boundary — what goes inside it, what stays
 * out, and what each crossing costs.
 *
 * The RTOS chapter is the hinge into Part IV. It is the first time the course
 * treats *lateness* as a failure rather than as slowness, which is the idea a
 * car and a robot are both built around.
 */
export const osChapters: Chapter[] = [
  {
    id: 'wallplace',
    scene: 'kernel',
    marker: '01',
    title: 'Where the Wall Goes',
    short: 'The wall',
    beats: [
      {
        id: 'monolith',
        kicker: 'Monolithic',
        heading: 'Put everything inside',
        body: [
          'A filesystem, a driver, a network stack. They all need privilege, so the simplest answer is to run them inside the wall, as part of the kernel itself.',
          'A request crosses once, gets everything it needs, and comes back. This is Linux, and it is fast for exactly that reason.',
        ],
        say: [
          'Lecture eight ended on a wall, and on the question of where to put it. Here are the two answers.',
          'A filesystem, a driver, a network stack. They all need privilege, so the simplest answer is to run them inside the wall, as part of the kernel itself.',
          '[matter-of-fact] Watch the panel. One crossing. A request goes in, gets everything it needs, and comes back out. This is Linux, and it is fast for exactly that reason.',
        ],
        camera: { position: [0, 8.2, 8.2], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'monolith',
        readout: true,
        labels: [
          { text: 'Services, inside', part: 'kernel', offset: [1.35, 0.7, 0.9], tone: 'plain' },
        ],
      },
      {
        id: 'micro',
        kicker: 'Microkernel',
        heading: 'Or put almost nothing inside',
        body: [
          'The opposite: keep the bare minimum privileged, and push filesystem, drivers and network out among the programs, each behind its own boundary.',
          'Watch a request cross in, come back out to reach a service, and return the same way, checked at every boundary. The path is the cost.',
        ],
        say: [
          'Now the opposite answer.',
          'Keep only the bare minimum privileged, and push the filesystem, the drivers and the network back out with the ordinary programs. Each behind its own boundary.',
          '[pause] And watch the crossings count now. A request crosses in, comes back out to reach a service, and returns the same way. Checked at every boundary.',
          '[reflective] The path is the cost.',
          '[matter-of-fact] Though how much it costs depends on how it is built. In the nineteen-nineties, Jochen Liedtke showed that much of the early microkernels\' slowness came from overloading the kernel and from how it was implemented, not from the idea itself.',
        ],
        camera: { position: [0, 9.0, 9.0], target: [0, 0, 0], fov: 38 },
        explode: 0,
        focus: 'micro',
        readout: true,
        labels: [
          { text: 'Services, outside', part: 'kernel', offset: [1.9, 0.7, 1.9], tone: 'plain' },
        ],
        aside: {
          label: 'Not a fixed price',
          text: 'In the 1990s Jochen Liedtke showed that much of early microkernels\' slowness came from overloading the kernel and from its implementation, not from the idea itself.',
        },
      },
      {
        id: 'trade',
        kicker: 'The trade',
        heading: 'Crash-proof, or fast',
        body: [
          'A driver inside the wall that goes wrong takes the machine with it, because it *is* the machine. The same driver outside can crash and be restarted while everything else keeps running.',
          'That safety is bought with crossings, and crossings are the expensive thing: the usual trade.',
        ],
        say: [
          'So which one is right? Neither. And that is the point.',
          'A driver inside the wall that goes wrong takes the machine with it, because it is the machine. The same driver outside can crash and be restarted while everything else keeps running.',
          '[matter-of-fact] That safety is bought with crossings, and crossings are the expensive thing. Which is the same bargain as every other lecture in this course. Give something up, get something back.',
          '[reflective] And the argument never ended, because the systems people actually run are hybrids. Linux is monolithic but loads drivers as modules, and has pushed some of them out into user space. Windows and macOS are both organised around a small core, but most of what surrounds it still runs inside the wall. Nobody won, because the trade is real in both directions.',
        ],
        camera: { position: [0, 9.0, 9.0], target: [0, 0, 0], fov: 38 },
        explode: 0,
        focus: 'trade',
        readout: true,
        aside: {
          label: 'Why the argument never ended',
          text: 'Nobody won; real systems are hybrids. Linux is monolithic but loads drivers as modules and has pushed some of them into user space; Windows and macOS are both organised around a small core, but most of what surrounds it still runs inside the wall.',
        },
      },
    ],
  },

  {
    id: 'families',
    scene: 'kernel',
    marker: '02',
    title: 'Families',
    short: 'Families',
    beats: [
      {
        id: 'families',
        kicker: 'Three answers',
        heading: 'Linux, Windows, macOS — the same shapes, placed differently',
        body: [
          'Linux is monolithic with loadable modules. Windows NT was built as separate modules around a small core, most of them inside the wall from the start, then moved graphics inside too, for speed. macOS puts a BSD layer on top of a Mach-derived core, and runs both inside the same wall.',
          'None of them is the diagram from a textbook. Each is a set of decisions about what was worth the crossing, made at different times under different pressures.',
        ],
        say: [
          'Three families, and none of them is a clean diagram.',
          'Linux is monolithic, with loadable modules. Windows N T was built as separate modules around a small core, most of them inside the wall from the start, and then moved graphics inside too, for speed. And macOS puts a B S D layer on top of a Mach-derived core, and runs both inside the same wall.',
          '[pause] Each one is a set of decisions about what was worth the crossing, made at different times, under different pressures.',
        ],
        camera: { position: [1.8, 7.6, 8.2], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'families',
      },
      {
        id: 'posix',
        kicker: 'The interface',
        heading: 'What a program actually depends on',
        body: [
          'A program does not depend on how the kernel is arranged. It depends on the set of calls it can make — open, read, write, and a few hundred more — and those have been broadly stable for decades.',
          'That is why the same source can build on machines whose insides are nothing alike. The wall hides the arrangement, which was always the point of having one.',
        ],
        say: [
          'But a program does not depend on any of that.',
          'It depends on the set of calls it can make. Open, read, write, and a few hundred more. And those have been broadly stable for decades.',
          '[reflective] Which is why the same source can build on machines whose insides are nothing alike. The wall hides the arrangement, and that was always the point of having one.',
        ],
        camera: { position: [0, 8.2, 8.2], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'posix',
      },
    ],
  },

  {
    id: 'deadlines',
    scene: 'kernel',
    marker: '03',
    title: 'Deadlines',
    short: 'Real time',
    beats: [
      {
        id: 'rtos',
        kicker: 'Real time',
        heading: 'Not fast — on time',
        body: [
          'Everything so far has been scheduled to be quick on average. A real-time system is judged differently: there is a line, and the work must be finished before it, every time.',
          '"Real-time" does not mean fast. Against a 60-millisecond deadline, a system that always responds in 50 milliseconds is real-time; one that usually takes 1 millisecond and occasionally takes 100 is not.',
        ],
        say: [
          'Now a different question entirely. Not how fast, but when.',
          'Everything so far has been scheduled to be quick on average. A real-time system is judged differently. There is a line, and the work has to be finished before it. Every time.',
          '[matter-of-fact] And real-time does not mean fast. Say the deadline is sixty milliseconds. A system that always responds in fifty is real-time. One that usually takes one millisecond, and occasionally takes a hundred, is not.',
        ],
        camera: { position: [0, 9.4, 9.4], target: [0, 0, 0], fov: 38 },
        explode: 0,
        focus: 'rtos',
        readout: true,
        labels: [
          { text: 'The deadline', part: 'kernel', offset: [2.6, 0.7, -1.9], tone: 'plain' },
        ],
      },
      {
        id: 'hard',
        kicker: 'Missing it',
        heading: 'Late is wrong',
        body: [
          'Watch the third pass. The work does not finish before the line, and in a hard real-time system that is not a slow frame — it is a failure, indistinguishable from producing the wrong answer.',
          'A correct brake force delivered late is a failure.',
        ],
        say: [
          'Watch the third pass, and watch the result field.',
          'The work does not finish before the line. And in a hard real-time system that is not a slow frame. It is a failure, indistinguishable from producing the wrong answer.',
          '[pause] A brake controller that computes the correct force too late has not been slow. It has failed.',
          '[reflective] And guaranteeing a worst case means giving up most of what makes an average fast. Caches that sometimes miss, prediction that sometimes flushes, schedulers that sometimes pick badly. Predictability is bought with throughput.',
        ],
        camera: { position: [0, 9.4, 9.4], target: [0, 0, 0], fov: 38 },
        explode: 0,
        focus: 'hard',
        readout: true,
        aside: {
          label: 'What it costs',
          text: 'Guaranteeing a worst case means giving up most of what makes an average fast: caches that sometimes miss, branch prediction that sometimes flushes, schedulers that sometimes pick badly. Predictability is bought with throughput.',
        },
      },
      {
        id: 'embedded',
        kicker: 'Where it lives',
        heading: 'Most computers are not the ones you think of',
        body: [
          'Most computers are small controllers inside things nobody calls a computer — a motor controller, a door lock, an insulin pump, dozens of separate units in a car. The operating systems they run, when they run one at all, are mostly small real-time kernels.',
          'They have no screen, no filesystem worth the name, and often no way to be updated. What many of them have is a guarantee about time.',
        ],
        say: [
          'And most computers are not the ones you think of.',
          'Most of them are small controllers, inside things nobody calls a computer. A motor controller. A door lock. An insulin pump. Dozens of separate units in a car. And the operating systems they run, when they run one at all, are mostly small real-time kernels.',
          '[matter-of-fact] They have no screen, no filesystem worth the name, and often no way to be updated. What many of them have is a guarantee about time.',
          '[pause] That is the operating system, whole. And what is left of this part of the course is one line of code, taken all the way down to the current that runs it.',
        ],
        camera: { position: [0, 9.8, 9.4], target: [0, 0, 0], fov: 38 },
        explode: 0,
        focus: 'embedded',
        aside: {
          label: 'Where this goes',
          text: 'Part IV is these guarantees taken seriously. A car needs one because a person is inside it; a robot needs one because it is holding something; an implant needs one because nobody can open it up to fix it.',
        },
      },
    ],
  },
]
