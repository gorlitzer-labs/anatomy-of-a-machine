import type { Chapter } from './types'

/**
 * Lecture 6 — I/O.
 *
 * Reuses the board scene rather than building a new one, because the subject is
 * the same object seen through a different question: Lecture 5 asked what is on
 * the board, this asks how any of it reaches the world outside.
 *
 * The chapter that matters is the first one. An interrupt is the first thing in
 * the course that *takes control away* from the processor, and that idea is
 * what the kernel lecture is built on — so it gets shown concretely here,
 * against real hardware, before Part III has to talk about it in the abstract.
 */
export const ioChapters: Chapter[] = [
  {
    id: 'interrupts',
    scene: 'board',
    marker: '01',
    title: 'Interrupts',
    short: 'Interrupts',
    beats: [
      {
        id: 'polling',
        kicker: 'The naive way',
        heading: 'Asking, over and over, forever',
        body: [
          'A key has been pressed. How does the processor find out? The simplest answer is that it keeps asking — check the port, do some work, check the port again, for as long as the machine is on.',
          'It works, and it is a catastrophe. Almost every check finds nothing, so nearly all of that effort is spent discovering that there is nothing to do.',
        ],
        say: [
          'Lecture five ended on how any of this talks to the world outside. So. A key has been pressed. How does the processor find out?',
          {
            text: 'The simplest answer is that it keeps asking. Check the port, do some work, check the port again, for as long as the machine is on.',
            look: 'ports',
          },
          '[matter-of-fact] And read the panel while it does. Almost every check finds nothing, so nearly all of that effort is spent discovering that there is nothing to do. It works, and it is a catastrophe.',
        ],
        camera: { position: [-0.4, 8.6, 8.6], target: [-1.7, 0, 1.1], fov: 38 },
        explode: 0,
        focus: 'usb',
        motion: 'polling',
        readout: true,
        isolate: true,
      },
      {
        id: 'interrupt',
        kicker: 'Interrupts',
        heading: 'Let the world interrupt you instead',
        body: [
          'Give the port a wire whose only job is to say "stop". When something happens, the port raises it, and the processor drops what it was doing mid-instruction-stream to deal with it.',
          'Watch the program\'s memory traffic. It runs, the interrupt arrives, and it freezes — not slows, freezes — while the processor deals with the interrupt. Then it resumes exactly where it was.',
        ],
        say: [
          {
            text: 'So invert it. Give the port a wire whose only job is to say: stop.',
            look: 'soc',
          },
          'When something happens the port raises it, and the processor drops what it was doing mid-instruction-stream to deal with it.',
          '[pause] Watch the program\'s memory traffic. It runs, the interrupt arrives, and it freezes. Not slows. Freezes. While the processor deals with the interrupt. And then it resumes exactly where it was.',
          '[reflective] Underneath, the processor saves where it was onto a stack and jumps to a handler, and the handler saves whatever else it is going to touch. Afterwards, all of it is put back. Nothing about the interrupted program knows it happened. And that illusion is what an operating system is later built out of.',
        ],
        camera: { position: [-0.6, 8.2, 8.4], target: [-1.4, 0, 0.8], fov: 38 },
        explode: 0,
        focus: 'interrupt',
        labels: [
          { text: 'The interrupt line', part: 'pcb', offset: [-1.05, 0.65, 1.2], tone: 'violet' },
        ],
        aside: {
          label: 'What it really is',
          text: 'The processor saves where it was onto a stack and jumps to a handler, which saves whatever else it is going to touch; afterwards all of it is put back. Nothing about the interrupted program knows it happened — and that illusion is what an operating system is later built out of.',
        },
      },
      {
        id: 'cost',
        kicker: 'The cost',
        heading: 'Nothing is free, including being told',
        body: [
          'Every interrupt is a detour: save the state, jump, handle, restore, resume. On a busy network link that can arrive tens of thousands of times a second, and the saving and restoring starts to dominate.',
          'So the answer swings back. Very fast devices are often polled again, deliberately, because at high enough rates asking constantly is cheaper than being told constantly.',
        ],
        say: [
          'But nothing is free, including being told.',
          'Every interrupt is a detour. Save the state, jump, handle, restore, resume.',
          '[matter-of-fact] Watch the panel as they start arriving more often. That servicing cost is fixed, so the faster they come the larger a share of the processor it eats. And watch the verdict change.',
          '[pause] Which is why the answer swings back. Very fast devices are often polled again, deliberately, because at high enough rates asking constantly is cheaper than being told constantly.',
        ],
        camera: { position: [-0.6, 8.2, 8.4], target: [-1.4, 0, 0.8], fov: 38 },
        explode: 0,
        focus: 'interrupt',
        motion: 'cost',
        readout: true,
      },
    ],
  },

  {
    id: 'dma',
    scene: 'board',
    marker: '02',
    title: 'Getting Out of the Way',
    short: 'DMA',
    beats: [
      {
        id: 'dma',
        kicker: 'DMA',
        heading: 'Move the data without the processor touching it',
        body: [
          'Reading a file could mean the processor fetching every byte from the drive and writing it into memory itself. For a large file that is millions of pointless round trips through a part of the machine that has better things to do.',
          'So it does not. It tells a separate engine where to get the data and where to put it, and that engine moves it directly. Look at the processor while this happens — it is dark. It is not involved.',
        ],
        say: [
          'Now the second idea, and this one is about getting out of the way.',
          'Reading a file could mean the processor fetching every byte from the drive and writing it into memory itself. For a large file that is millions of pointless round trips through a part of the machine that has better things to do.',
          {
            text: '[pause] So it does not. It tells a separate engine where to get the data and where to put it, and that engine moves it directly. Look at the processor while this happens. It is dark. It is not involved.',
            look: 'soc',
          },
        ],
        camera: { position: [1.6, 7.4, 7.2], target: [1.6, 0, -0.6], fov: 36 },
        explode: 0,
        focus: 'dma',
        labels: [
          { text: 'Straight to memory', part: 'pcb', offset: [1.9, 0.7, -0.6], tone: 'amber' },
        ],
      },
      {
        id: 'together',
        kicker: 'The pair',
        heading: 'Tell me when you are done',
        body: [
          'The two ideas are built for each other. The transfer engine moves the data while the processor works on something else, and raises an interrupt when it has finished.',
          'That is the shape of nearly all modern I/O: do not ask, do not carry, and be told once at the end.',
        ],
        say: [
          'And the two ideas are built for each other.',
          'The transfer engine moves the data while the processor works on something else, and raises an interrupt when it has finished.',
          '[reflective] That is the shape of nearly all modern input and output. Do not ask. Do not carry. And be told once, at the end.',
        ],
        camera: { position: [0.8, 8.4, 8.2], target: [0.4, 0, 0], fov: 38 },
        explode: 0,
        focus: 'dma',
        /* Same object, opposite claim to the beat before it — so it needs its
           own motion. Sharing `dma`'s left the processor dark underneath a
           sentence saying it is working. */
        motion: 'together',
      },
    ],
  },

  {
    id: 'world',
    scene: 'board',
    marker: '03',
    title: 'The Outside World',
    short: 'World',
    beats: [
      {
        id: 'analogue',
        kicker: 'Sensors',
        heading: 'The world does not arrive in bits',
        body: [
          'Temperature, light, sound, the position of a finger — none of these are numbers. They are voltages, continuous and noisy, and something has to sample them and decide what number each sample was.',
          'That converter is a boundary, and it is lossy in both directions. Everything the machine knows about the world it learned from a sequence of guesses about a voltage.',
        ],
        say: [
          {
            text: 'Now out past the edge, where none of this is tidy any more.',
            look: 'ports',
          },
          'Temperature, light, sound, the position of a finger. None of these are numbers. They are voltages, continuous and noisy, and something has to sample them and decide what number each sample was.',
          '[matter-of-fact] That converter is a boundary, and it is lossy in both directions. Everything the machine knows about the world, it learned from a sequence of guesses about a voltage.',
        ],
        camera: { position: [-1.3, 8.4, 8.4], target: [-1.7, 0, 1.1], fov: 38 },
        explode: 0,
        focus: 'usb',
      },
      {
        id: 'display',
        kicker: 'The display',
        heading: 'The one output that never stops',
        body: [
          'A screen is not told what changed. It is re-sent an entire image, sixty or a hundred and twenty times a second, whether anything moved or not — because a panel does not, in general, remember what it was showing. Some laptop and phone panels now can, and the link goes quiet while the picture is still — but the instant anything moves, the changed part — often the whole frame — is sent again.',
          'That is a fixed, unrelenting bandwidth cost the machine pays the whole time it is on, and it is why the display path gets its own dedicated route off the board.',
        ],
        say: [
          'One output never stops.',
          'A screen is not told what changed. It is re-sent an entire image, sixty or a hundred and twenty times a second, whether anything moved or not, because a panel does not in general remember what it was showing.',
          '[pause] Some laptop and phone panels now can, and the link goes quiet while the picture is still. But the instant anything moves, the part that changed is sent again. And often that is the whole frame.',
          '[reflective] So it is a fixed, unrelenting bandwidth cost that the machine pays the entire time it is on. Which is why the display path gets its own dedicated route off the board.',
        ],
        camera: { position: [-0.9, 8.0, 7.8], target: [-0.9, 0, -0.8], fov: 37 },
        explode: 0,
        focus: 'display',
        isolate: true,
      },
      {
        id: 'network',
        kicker: 'The network',
        heading: 'Where the machine stops being a machine',
        body: [
          'The radio is the last edge. Past it the rules change completely: things arrive out of order, arrive twice, or never arrive, and none of that is true of anything inside the box.',
          'Everything in this lecture is the same problem at different scales — the machine is fast, orderly and certain, and the world is none of those things. All of I/O is the negotiation.',
        ],
        say: [
          {
            text: 'And the radio is the last edge.',
            look: 'wifi',
          },
          'Past it the rules change completely. Things arrive out of order, arrive twice, or never arrive at all. And none of that is true of anything inside the box.',
          '[matter-of-fact] Everything in this lecture is the same problem at different scales. The machine is fast, orderly and certain. The world is none of those things. All of input and output is that negotiation.',
          '[pause] And hold onto the interrupt in particular. It takes control away from a running program without its knowledge, which is the mechanism the whole next part of this course is built on. It is how a kernel stays in charge of a machine it has handed to somebody else.',
        ],
        camera: { position: [1.2, 8.2, 8.0], target: [1.4, 0, 0.9], fov: 38 },
        explode: 0,
        focus: 'usb',
        aside: {
          label: 'Where this goes',
          text: 'An interrupt takes control away from a running program without its knowledge. Hold onto that: it is the mechanism the whole of Part III is built on, because it is how a kernel stays in charge of a machine it has handed to someone else.',
        },
      },
    ],
  },
]
