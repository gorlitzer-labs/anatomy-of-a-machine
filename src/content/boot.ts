import type { Chapter } from './types'

/**
 * Lecture 7 — Boot.
 *
 * Closes Part II, and it is the only lecture in the course whose scene runs to
 * an end and stops. Everything else is a steady state; this happens once, in
 * order, and never again.
 *
 * It is also the bridge into Part III, which is why the last chapter ends with
 * the wall from Lecture 8 going up. The handoff is not the end of this lecture
 * so much as the first instant of that one.
 */
export const bootChapters: Chapter[] = [
  {
    id: 'cold',
    scene: 'boot',
    marker: '01',
    title: 'Cold',
    short: 'Cold',
    beats: [
      {
        id: 'cold',
        kicker: 'Before anything',
        heading: 'A machine with power off is not paused — it is nothing',
        body: [
          'There is no program waiting, no state held anywhere that matters, and nothing in memory. Every flip-flop in the previous lectures forgets the instant the supply goes, and almost every one of them is in a random state the instant it returns.',
          'So the problem is not "start the software". The problem is that at t=0 nothing is initialised, including the things whose job is to initialise things.',
        ],
        say: [
          'Part three starts with the machine switched off. Not asleep. Off.',
          'There is no program waiting, no state held anywhere that matters, and nothing in memory. Every flip-flop from the last six lectures forgets the instant the supply goes, and almost every one of them is in a random state the instant it returns.',
          '[pause] So the problem is not, start the software. The problem is that at time zero nothing is initialised. Including the things whose job it is to initialise things.',
        ],
        camera: { position: [0, 5.4, 7.4], target: [0, 0, 0], fov: 35 },
        explode: 0,
        focus: 'cold',
      },
      {
        id: 'rail',
        kicker: 'Power-on reset',
        heading: 'Hold everything still until the voltage is up',
        body: [
          'Watch the rail fill before anything else moves. A supply does not snap to its value; it ramps, and a processor fed a rising voltage does not run slowly — it runs wrongly, because its logic thresholds are not where they should be.',
          'So the whole machine is held in reset until a circuit whose only job is watching the voltage decides it is stable. Only then is anything allowed to execute.',
        ],
        say: [
          {
            text: 'Watch the rail fill before anything else moves.',
            zoom: 0.9,
          },
          'A supply does not snap to its value. It ramps. And a processor fed a rising voltage does not run slowly. It runs wrongly, because its logic thresholds are not where they should be.',
          {
            text: '[pause] So the whole machine is held in reset until a circuit whose only job is watching the voltage decides it is stable. Only then is anything allowed to execute.',
            zoom: 1,
          },
          '[reflective] And that cannot be software, because software is exactly the thing that is not yet allowed to run. A small analogue circuit holds the reset line, and releases it. That is the first decision the machine makes.',
        ],
        camera: { position: [-1.6, 4.6, 6.6], target: [-1.4, 0, 0.4], fov: 34 },
        explode: 0,
        focus: 'rail',
        labels: [
          { text: 'The supply', part: 'boot', offset: [0, 0.45, 1.6], tone: 'amber' },
        ],
        aside: {
          label: 'Why this is hardware',
          text: 'It cannot be software, because software is exactly the thing that is not yet allowed to run. A small analogue circuit holds the reset line and releases it, and that is the first decision the machine makes.',
        },
      },
    ],
  },

  {
    id: 'firmware',
    scene: 'boot',
    marker: '02',
    title: 'The First Instruction',
    short: 'Firmware',
    beats: [
      {
        id: 'firmware',
        kicker: 'Where it starts',
        heading: 'The address is wired in',
        body: [
          'When reset releases, the processor fetches from a fixed address it was built knowing. Nothing chose it, nothing configured it — it is a property of the silicon, and it has to be, because there is nothing running that could decide.',
          'On a classic PC, what lives there is firmware: code in a flash chip on the board itself, which exists to bring up enough of the machine that ordinary software becomes possible.',
        ],
        say: [
          'When reset releases, the processor fetches from a fixed address that it was built knowing.',
          'Nothing chose it. Nothing configured it. It is a property of the silicon, and it has to be, because there is nothing running that could decide.',
          '[matter-of-fact] On a classic P C, what lives at that address is firmware. Code in a flash chip on the board itself, which exists to bring up enough of the machine that ordinary software becomes possible.',
          '[reflective] On many newer machines, something else has already run by then. An A M D processor has a small security core that starts from its own boot ROM, sets up the memory, and only then lets the main cores out of reset. An iPhone starts from a boot ROM that was laid down in the chip when it was made, and can never be changed.',
        ],
        camera: { position: [-0.6, 4.8, 6.6], target: [-0.6, 0.1, 0], fov: 34 },
        explode: 0,
        focus: 'firmware',
        aside: {
          label: 'Not always first',
          text: 'On many newer machines something else has already run by then. An AMD processor has a small security core that starts from its own boot ROM, sets up the memory, and only then lets the main cores out of reset. An iPhone starts from a boot ROM laid down in the chip when it was made, which can never be changed.',
        },
      },
      {
        id: 'post',
        kicker: 'Self-test',
        heading: 'Find out what this machine even is',
        body: [
          'The firmware does not know what it is running on. How much memory is fitted, at what speed, in which slots; what is attached; whether any of it answers. So it asks, and configures the memory controller before memory can be used at all.',
          'This is the part you used to see as a slow count on a black screen, and most of it still happens — it is simply no longer shown to you.',
        ],
        say: [
          'And the firmware does not know what it is running on.',
          'How much memory is fitted, at what speed, in which slots. What is attached. Whether any of it answers. So it asks, and it configures the memory controller before memory can be used at all.',
          '[reflective] This is the part you used to see as a slow count on a black screen. Most of it still happens. It is simply no longer shown to you.',
        ],
        camera: { position: [0, 5.2, 6.8], target: [0, 0.1, 0], fov: 35 },
        explode: 0,
        focus: 'post',
      },
      {
        id: 'find',
        kicker: 'Something to run',
        heading: 'Look for a disk with an operating system on it',
        body: [
          'Now it goes shopping. It walks a list of places an operating system might live — this drive, then that one, then the network — and looks on each for something it recognises: on an older PC, a boot sector, the very first of the disk\'s sectors and just 512 bytes long; on a modern one, a named loader file in a small partition set aside for it.',
          'The thing it is looking for is small on purpose: just enough code to load something bigger.',
        ],
        say: [
          'Now it goes shopping.',
          'It walks a list of places an operating system might live. This drive, then that one, then the network. And on each it looks for something it recognises.',
          'On an older P C, that was a boot sector. The very first of the disk\'s sectors, just five hundred and twelve bytes long. On a modern one, it is a named loader file, in a small partition set aside for it.',
          '[pause] And the thing it is looking for is small on purpose. Just enough code to load something bigger.',
        ],
        camera: { position: [0.8, 5.0, 6.6], target: [0.6, 0.1, 0], fov: 34 },
        explode: 0,
        focus: 'find',
      },
    ],
  },

  {
    id: 'handoff',
    scene: 'boot',
    marker: '03',
    title: 'The Handoff',
    short: 'Handoff',
    beats: [
      {
        id: 'loader',
        kicker: 'The bootloader',
        heading: 'A program whose only job is to load a better one',
        body: [
          'The bootloader is deliberately small. It reads the kernel off the disk into memory, sets up just enough for it to start, and then jumps into it.',
          'That is a chain of increasingly capable programs, each one loading the next: firmware, then a loader — on an older PC itself two steps, the first only a few hundred bytes — then a kernel. Nothing in that chain could have started itself.',
        ],
        say: [
          'The bootloader is deliberately small.',
          'It reads the kernel off the disk into memory, sets up just enough for it to start, and then jumps into it.',
          '[matter-of-fact] Which makes this a chain of increasingly capable programs, each one loading the next. Firmware, then a loader, then a kernel. On an older P C the loader was itself two steps, and the first was only a few hundred bytes. And nothing in that chain could have started itself.',
        ],
        camera: { position: [1.8, 5.2, 7.0], target: [0.9, 0.1, 0], fov: 35 },
        explode: 0,
        focus: 'loader',
      },
      {
        id: 'kernel',
        kicker: 'The wall goes up',
        heading: 'And then it stops being the same kind of machine',
        body: [
          'The kernel takes over, and almost the first thing it does is raise the boundary that Lecture 8 is about — take charge of address translation with its own page tables, drop everything else to a lower privilege, and refuse to let anything past without asking.',
          'Watch the wall rise. Before it, code could touch anything. After it, nothing can. That transition happens once per boot and is never undone while the machine is up.',
        ],
        say: [
          {
            text: 'The kernel takes over. And almost the first thing it does is raise a wall, which is what the next lecture is entirely about.',
            zoom: 0.9,
          },
          'Take charge of address translation, with its own page tables. Drop everything else to a lower privilege. And refuse to let anything past without asking.',
          {
            text: '[pause] Watch it rise. Before it, code could touch anything. After it, nothing can. And that transition happens once per boot, and is never undone while the machine is up.',
            zoom: 1,
          },
        ],
        camera: { position: [2.4, 5.4, 7.4], target: [1.1, 0.2, 0], fov: 36 },
        explode: 0,
        focus: 'kernel',
        labels: [
          { text: 'Privilege drops here', part: 'boot', offset: [1.9, 0.9, 1.35], tone: 'cyan' },
        ],
      },
      {
        id: 'done',
        kicker: 'Running',
        heading: 'Eleven seconds, and none of it repeats',
        body: [
          'The sequence has run and stopped. Every other scene in this course loops, because every other subject is a steady state — a bus carries traffic, a pipeline runs instructions, a scheduler takes turns. This one happens once.',
          'Everything Part III describes is what the machine does *after* this point. Everything Parts I and II described is what had to be true before it could.',
        ],
        say: [
          'The sequence has run, and stopped.',
          '[matter-of-fact] Every other scene in this course loops, because every other subject is a steady state. A bus carries traffic. A pipeline runs instructions. A scheduler takes turns. This one happens once.',
          '[pause] A voltage watcher releases reset. Reset lets the processor fetch a wired-in address. That address holds firmware. Firmware finds a disk. The disk holds a loader. The loader holds a kernel. And the kernel raises a wall.',
          '[reflective] Remove any link in that and there is no computer. Only a warm rectangle. Everything from here on is what the machine does after this point, starting with the wall itself.',
        ],
        camera: { position: [0, 6.2, 7.8], target: [0, 0.1, 0], fov: 37 },
        explode: 0,
        focus: 'handoff',
        aside: {
          label: 'The chain, whole',
          text: 'A voltage watcher releases reset. Reset lets the processor fetch a wired-in address. That address holds firmware. Firmware finds a disk. The disk holds a loader. The loader holds a kernel. The kernel raises a wall. Remove any link and there is no computer, only a warm rectangle.',
        },
      },
    ],
  },
]
