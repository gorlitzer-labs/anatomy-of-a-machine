import type { Chapter } from './types'

/**
 * Lecture 8 — The Kernel.
 *
 * The first lecture with nothing physical to point at, and the one that had to
 * invent a grammar for it: containment rather than teardown. An inside, an
 * outside, a wall enforced by hardware rather than by agreement, and one thing
 * at the centre that only one program can hold at a time.
 *
 * Deliberately leans on Lecture 6. An interrupt was shown there as a wire that
 * takes control away from a running program without its knowledge; here that
 * same mechanism turns out to be the only reason a kernel can stay in charge of
 * a machine it has handed to somebody else.
 */
export const kernelChapters: Chapter[] = [
  {
    id: 'twoworlds',
    scene: 'kernel',
    marker: '01',
    title: 'Two Worlds',
    short: 'The wall',
    beats: [
      {
        id: 'user',
        kicker: 'Out here',
        heading: 'Programs cannot touch the machine',
        body: [
          'Six programs, running. None of them can read the disk, none can talk to the network, and none can see each other\'s memory — not on their own. They cannot even find out whether the others exist without asking.',
          'This is not a convention they have agreed to follow. It is a thing they are physically unable to do.',
        ],
        say: [
          'Lecture seven ended with a wall going up. This is what is on either side of it.',
          'Six programs, running. None of them can read the disk, none can talk to the network, and none can see each other\'s memory. Not on their own. They cannot even find out whether the others exist without asking.',
          '[matter-of-fact] And this is not a convention they have agreed to follow. It is a thing they are physically unable to do.',
        ],
        camera: { position: [0, 8.4, 8.4], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'user',
      },
      {
        id: 'wall',
        kicker: 'The boundary',
        heading: 'A line the hardware enforces',
        body: [
          'The processor has a mode bit — real ones have a few levels, but two are what matter. In one mode an instruction that touches a device or another program\'s memory simply executes; in the other, the same instruction traps and the program is stopped.',
          'That single bit is the wall. Everything an operating system does about safety rests on the fact that a program cannot flip it — because flipping it is itself a privileged instruction.',
        ],
        say: [
          {
            text: 'The processor has a mode bit.',
            zoom: 0.9,
          },
          'Real processors have a few levels of it, but two are what matter.',
          'In one mode, an instruction that touches a device or another program\'s memory simply executes. In the other, that same instruction traps, and the program is stopped.',
          {
            text: '[pause] That single bit is the wall. And everything an operating system does about safety rests on the fact that a program cannot flip it, because flipping it is itself a privileged instruction.',
            zoom: 1,
          },
          '[reflective] It had to be hardware. Isolation enforced in software is only as strong as whatever protects the enforcer, because the thing doing the enforcing runs on the same machine as the thing being enforced. Only something below both can settle it.',
        ],
        camera: { position: [3.2, 6.4, 7.4], target: [0, 0.1, 0], fov: 35 },
        explode: 0,
        focus: 'wall',
        aside: {
          label: 'Why this had to be hardware',
          text: 'Isolation enforced in software is only as strong as whatever protects the enforcer, because the thing doing the enforcing runs on the same machine as the thing being enforced. Only something below both can settle it.',
        },
      },
    ],
  },

  {
    id: 'asking',
    scene: 'kernel',
    marker: '02',
    title: 'Asking',
    short: 'Syscalls',
    beats: [
      {
        id: 'syscall',
        kicker: 'The system call',
        heading: 'The only way in is to ask',
        body: [
          'A program that wants a file does not open a file. It puts a request in a known place and executes an instruction whose entire purpose is to trap — deliberately triggering the thing that would otherwise be a crash.',
          'Watch a request reach the wall. It stops. That pause is the machine changing privilege level, and it is why a system call costs more than an ordinary function call. The crossing takes time, and it disturbs the caches on both sides; for a small request that can cost more than the work.',
        ],
        say: [
          'So how does a program ever get anything done?',
          'It asks. A program that wants a file does not open a file. It puts a request in a known place and executes an instruction whose entire purpose is to trap, deliberately triggering the thing that would otherwise be a crash.',
          '[pause] Watch a request reach the wall. It stops. That pause is the machine changing privilege level, and it is why a system call costs more than an ordinary function call. The crossing takes time, and it disturbs the caches on both sides. For a small request that can cost more than the work.',
        ],
        camera: { position: [0, 7.4, 8.0], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'syscall',
        labels: [
          { text: 'Checked here', part: 'kernel', offset: [0, 0.75, 2.15], tone: 'amber' },
        ],
      },
      {
        id: 'refuse',
        kicker: 'No',
        heading: 'And the answer can be no',
        body: [
          'The request is inspected on arrival: is this program allowed to open that file, at all, in that way? If not, it never gets in. Watch the red one — it reaches the gate and is walked straight back out.',
          'This is the whole of permissions, access control and sandboxing. Not a rule written down somewhere, but a check at a door that a program has no way around.',
        ],
        say: [
          'And the answer can be no.',
          'The request is inspected on arrival. Is this program allowed to open that file, at all, in that way? If not, it never gets in. Watch the red one. It reaches the gate and is walked straight back out.',
          '[matter-of-fact] That is the whole of permissions, access control and sandboxing. Not a rule written down somewhere, but a check at a door that a program has no way around.',
        ],
        camera: { position: [-2.0, 6.8, 7.6], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'refuse',
      },
    ],
  },

  {
    id: 'turns',
    scene: 'kernel',
    marker: '03',
    title: 'Taking Turns',
    short: 'Scheduling',
    beats: [
      {
        id: 'schedule',
        kicker: 'One core, six programs',
        heading: 'Almost everything is waiting',
        body: [
          'There is one core in the middle and six programs that all want it. Only the one holding it is lit; the other five are not running slowly, they are not running at all.',
          'Your machine feels like it does many things at once. It does a few — one per core — and each core does one thing at a time and changes its mind faster than you can notice.',
        ],
        say: [
          'Now the second thing a kernel owns. Whose turn it is.',
          'There is one core in the middle and six programs that all want it. Only the one holding it is lit. The other five are not running slowly. They are not running at all.',
          '[reflective] Your machine feels like it does many things at once. It does a few, one per core. And each core does one thing at a time, and changes its mind faster than you can notice.',
        ],
        camera: { position: [0, 8.8, 8.2], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'schedule',
      },
      {
        id: 'preempt',
        kicker: 'Preemption',
        heading: 'How the kernel gets the machine back',
        body: [
          'Here is the problem. Once a program is running, the kernel is not — so what stops a program that never gives the core up? Nothing the kernel can do from inside, because it is not executing.',
          'The answer is the timer, and it is the interrupt from Lecture 6 doing exactly what it did there. It fires, the running program is stopped mid-instruction-stream whether it likes it or not, and the kernel is back.',
        ],
        say: [
          'Which raises a problem. Once a program is running, the kernel is not.',
          'So what stops a program that never gives the core up? Nothing the kernel can do from inside, because it is not executing.',
          {
            text: '[pause] The answer is the timer. And it is the interrupt from lecture six, doing exactly what it did there. It fires, the running program is stopped mid-instruction-stream whether it likes it or not, and the kernel is back.',
            zoom: 0.9,
          },
          {
            text: '[matter-of-fact] Early personal computers relied on programs voluntarily yielding, and one badly written loop could freeze the entire machine. Preemption is not an optimisation. It is the difference between an operating system and a convention.',
            zoom: 1,
          },
        ],
        camera: { position: [0, 7.2, 7.6], target: [0, 0.1, 0], fov: 35 },
        explode: 0,
        focus: 'preempt',
        aside: {
          label: 'Why this is the whole trick',
          text: 'Early personal computers relied on programs voluntarily yielding, and one badly written loop could freeze the entire machine. Preemption is not an optimisation — it is the difference between an operating system and a convention.',
        },
      },
      {
        id: 'fair',
        kicker: 'The scheduler',
        heading: 'Deciding who is next is a value judgement',
        body: [
          'The kernel has the core back and must choose who gets it. The one that has waited longest? The one the user is looking at? The one that will finish soonest? Each answer makes a different machine.',
          'There is no correct choice, only trade-offs — which is why a server and a phone, running the same kernel, are usually tuned to schedule quite differently.',
        ],
        say: [
          'The kernel has the core back, and now it has to choose who gets it.',
          'The one that has waited longest? The one the user is looking at? The one that will finish soonest? Each answer makes a different machine.',
          '[reflective] There is no correct choice here. Only trade-offs. Which is why a server and a phone, running the same kernel, are usually tuned to schedule quite differently.',
        ],
        camera: { position: [0, 8.8, 8.2], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'fair',
      },
    ],
  },

  {
    id: 'addresses',
    scene: 'kernel',
    marker: '04',
    title: 'Every Address Is a Lie',
    short: 'Memory',
    beats: [
      {
        id: 'mmu',
        kicker: 'Translation',
        heading: 'The address a program asks for is not the address it gets',
        body: [
          'When a program reads address 4096, no such request reaches the memory. The address is intercepted and rewritten, on the way, by dedicated hardware — and the number that arrives at the memory chip is a different number entirely.',
          'Watch the colour change at the gate. That is the moment: what went in belonged to the program, and what comes out belongs to the machine.',
        ],
        say: [
          {
            text: 'And the third thing. When a program reads address four thousand and ninety-six, no such request reaches the memory.',
            zoom: 0.9,
          },
          'The address is intercepted and rewritten on the way by dedicated hardware, and the number that arrives at the memory chip is a different number entirely.',
          {
            text: '[pause] Watch the colour change at the gate. That is the moment. What went in belonged to the program. What comes out belongs to the machine.',
            zoom: 1,
          },
        ],
        camera: { position: [1.8, 6.6, 7.4], target: [0, 0, 0], fov: 35 },
        explode: 0,
        focus: 'mmu',
        labels: [
          { text: 'Rewritten in flight', part: 'kernel', offset: [1.05, 0.8, 1.95], tone: 'amber' },
        ],
      },
      {
        id: 'isolation',
        kicker: 'What it buys',
        heading: 'Two programs can hold the same address and never collide',
        body: [
          'Because every program\'s addresses are translated separately, two of them can both use address 4096 and land on completely different memory. Neither can name the other\'s — unless the kernel maps the same memory into both, which is how programs share on purpose.',
          'That is why programs cannot see each other — not a wall around the memory, but a language in which the other program\'s memory has no name.',
        ],
        say: [
          'And here is what that buys.',
          'Because every program\'s addresses are translated separately, two of them can both use address four thousand and ninety-six and land on completely different memory. Neither can name the other\'s. Unless the kernel maps the same memory into both, which is how programs share on purpose.',
          '[matter-of-fact] So programs cannot see each other. Not because of a wall around the memory, but because of a language in which the other program\'s memory has no name.',
          '[reflective] A boundary, a checkpoint, and a contended resource. Those three shapes are most of an operating system. And the next lecture is about what changes when you move that wall, putting more inside it, or less.',
        ],
        camera: { position: [0, 8.6, 8.4], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'isolation',
        aside: {
          label: 'Where this goes',
          text: 'A boundary, a checkpoint and a contended resource. Those three shapes are most of an operating system — and Lecture 9 is about what changes when you move the wall, putting more inside it or less.',
        },
      },
    ],
  },
]
