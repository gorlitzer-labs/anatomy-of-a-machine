import type { Chapter } from './types'

/**
 * Lecture 4 — How Silicon Is Made.
 *
 * Closes Part I. Lecture 1 opened by taking a chip apart; this asks how the
 * thing got made in the first place, and answers with the one fact that governs
 * everything else: you are printing with light at a wavelength larger than the
 * features you are printing.
 *
 * Figures checked rather than recalled. EUV runs at 13.5 nm, roughly a
 * fourteenth of the 193 nm deep-ultraviolet light that came before it and still
 * does most layers; immersion stretched that 193 nm light down as far as the
 * 7 nm node. A "3 nm" part has a contacted gate pitch around 45 nm and a metal
 * pitch near 23 nm; the name once tracked gate length and metal half-pitch, and
 * the two came apart from it in the mid-1990s (IEEE Spectrum, 2020).
 */
export const fabChapters: Chapter[] = [
  {
    id: 'wafer',
    scene: 'fab',
    marker: '01',
    title: 'The Wafer',
    short: 'Wafer',
    beats: [
      {
        id: 'wafer',
        kicker: 'Where it starts',
        heading: 'One crystal, sliced thin',
        body: [
          'Sand becomes silicon, silicon becomes a single cylindrical crystal grown from a seed, and that crystal is sliced into discs and polished until they are flatter than almost anything else people manufacture.',
          'Nothing has been printed yet. This is the blank — and the notch cut into its edge is there so a machine can tell which way round the crystal is. Older, smaller wafers had a flat ground along one side instead.',
        ],
        say: [
          'Lecture three left one question open. How does the pattern get onto the crystal in the first place?',
          'It starts here. Sand becomes silicon. Silicon becomes a single cylindrical crystal, grown from a seed. And that crystal is sliced into discs, and polished until they are flatter than almost anything else people manufacture.',
          '[pause] Nothing has been printed yet. This is the blank. And that notch cut into its edge is there so a machine can tell which way round the crystal is.',
        ],
        camera: { position: [0, 7.6, 7.6], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'wafer',
      },
      {
        id: 'dies',
        kicker: 'The grid',
        heading: 'Every chip on the wafer is the same chip',
        body: [
          'One wafer carries many copies of one design, tiled edge to edge. They are printed together, tested together, and only separated at the very end.',
          'Notice the edge. A round wafer and rectangular chips do not tile cleanly, so a ring of partial dies around the rim is printed along with the rest and can never become a working chip.',
        ],
        say: [
          'One wafer carries many copies of one design, tiled edge to edge.',
          'They are printed together, tested together, and only separated at the very end.',
          '[matter-of-fact] And look at the edge. A round wafer and rectangular chips do not tile cleanly, so a ring of partial dies around the rim gets printed along with the rest, and can never become a working chip.',
        ],
        camera: { position: [0, 8.4, 6.8], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'dies',
      },
    ],
  },

  {
    id: 'printing',
    scene: 'fab',
    marker: '02',
    title: 'Printing With Light',
    short: 'Printing',
    beats: [
      {
        id: 'expose',
        kicker: 'Exposure',
        heading: 'The pattern does not get drawn — it arrives',
        body: [
          'Coat the wafer in a chemical that changes when light hits it. Put a mask above it carrying the pattern. Shine the light through. Wherever light landed, the chemical is now different, and a wash removes one kind and leaves the other.',
          'Nothing draws the lines one at a time. The mask carries every feature in the field, and a modern machine copies them all in one pass — sweeping a narrow slit of light across the field in a fraction of a second.',
        ],
        say: [
          'Now the printing itself. And it is not what you would expect.',
          'Coat the wafer in a chemical that changes when light hits it. Put a mask above it carrying the pattern. Shine the light through. Wherever light landed the chemical is now different, and a wash removes one kind and leaves the other.',
          '[reflective] Nothing draws the lines one at a time. The mask carries every feature in the field, and a modern machine copies them all in one pass, sweeping a narrow slit of light across the field in a fraction of a second.',
        ],
        camera: { position: [0, 6.6, 7.2], target: [0, 0.5, 0], fov: 34 },
        explode: 0,
        focus: 'expose',
        labels: [
          { text: 'The mask', part: 'fab', offset: [1.5, 1.5, 0], tone: 'plain' },
        ],
      },
      {
        id: 'stepper',
        kicker: 'Step and scan',
        heading: 'Then do it again, and again, and again',
        body: [
          'One exposure covers one field, not the whole wafer. So the machine steps: expose, move, expose, move — across the entire disc, landing each layer on the one beneath within a nanometre or two.',
          'A leading-edge wafer spends around three months in the fab, and comes back to this machine dozens of times before it is finished.',
        ],
        say: [
          'But one exposure covers one field. Not the whole wafer.',
          {
            text: 'So the machine steps. Expose, move, expose, move, across the entire disc, landing each layer on the one beneath within a nanometre or two.',
            zoom: 0.9,
          },
          {
            text: '[pause] A leading-edge wafer spends around three months in the fab. And it comes back to this machine dozens of times before it is finished.',
            zoom: 1,
          },
        ],
        camera: { position: [0, 8.8, 7.2], target: [0, 0.2, 0], fov: 36 },
        explode: 0,
        focus: 'stepper',
      },
      {
        id: 'euv',
        kicker: 'Wavelength',
        heading: 'Smaller than the light',
        body: [
          'Light cannot easily print finer than its wavelength, and for years that meant 193 nm deep ultraviolet; water between lens and wafer stretched it to the 7 nm generation.',
          'Then came extreme ultraviolet: 13.5 nm, from laser-struck droplets of molten tin. Air and glass absorb it, so the optics are mirrors in a vacuum — and only one company builds the machines, which decides who makes leading-edge chips.',
        ],
        say: [
          'And here is the constraint the whole industry ran into.',
          'You cannot easily print something finer than the wavelength of the light doing the printing. For years that light was deep ultraviolet, at a hundred and ninety-three nanometres, while the features being drawn kept shrinking past it.',
          '[matter-of-fact] Read the panel. That is the wavelength, against the size of the feature. And the answer to whether it can resolve them is no. By a wide margin.',
          'The industry pushed that light far past where it should have worked, including by putting water between the lens and the wafer, and got it down to the seven nanometre generation.',
          {
            text: '[pause] Beyond that, it needed something else entirely.',
            variant: 'b',
          },
          'Thirteen point five nanometres. Extreme ultraviolet, about a fourteenth of the wavelength, produced by hitting droplets of molten tin with a laser inside a vacuum. Now look at the answer.',
          '[reflective] And that is why this one step decides who can make leading-edge chips at all. Extreme ultraviolet is absorbed by air, and by glass, so the whole optical path has to be mirrors in a vacuum. Only one company in the world builds the machines.',
        ],
        camera: { position: [0.8, 6.0, 6.8], target: [0, 0.6, 0], fov: 34 },
        explode: 0,
        focus: 'euv',
        toggle: {
          label: 'Light source',
          a: '193 nm (ArF)',
          b: '13.5 nm (EUV)',
        },
        readout: true,
      },
    ],
  },

  {
    id: 'layers',
    scene: 'fab',
    marker: '03',
    title: 'Layer on Layer',
    short: 'Layers',
    beats: [
      {
        id: 'layers',
        kicker: 'The stack',
        heading: 'A chip is dozens of prints, aligned',
        body: [
          'One exposure gives you one layer. A finished chip is a stack of them: the transistors at the bottom, and above them layer after layer of metal wiring connecting everything to everything.',
          'The blue layers here are the transistors. Everything gold above them is wiring — and there is far more wiring than there is transistor, which is Lecture 1\'s point about distance, arriving from the manufacturing side.',
        ],
        say: [
          'One exposure gives you one layer.',
          {
            text: 'A finished chip is a stack of them. The transistors at the bottom, and above them layer after layer of metal wiring, connecting everything to everything.',
            zoom: 0.9,
          },
          {
            text: '[matter-of-fact] The blue layers here are the transistors. Everything gold above them is wiring, and there is far more wiring than there is transistor. Which is lecture one\'s point about distance, arriving from the manufacturing side.',
            zoom: 1,
          },
          '[pause] And every layer has to line up with the one beneath it to within a small fraction of a feature. A leading-edge chip takes around eighty prints, and every one of them is another chance to be slightly out.',
        ],
        camera: { position: [5.4, 5.4, 7.6], target: [0, 0.7, 0], fov: 34 },
        explode: 0,
        focus: 'layers',
        aside: {
          label: 'Alignment',
          text: 'Every layer must line up with the one beneath it to within a small fraction of a feature. A leading-edge chip takes around eighty prints — the twelve drawn here are a sketch — and every one is another chance to be slightly out.',
        },
      },
    ],
  },

  {
    id: 'yield',
    scene: 'fab',
    marker: '04',
    title: 'Yield',
    short: 'Yield',
    beats: [
      {
        id: 'yield',
        kicker: 'Defects',
        heading: 'Some of them do not work',
        body: [
          'A speck of dust, a mask flaw, a layer slightly out of alignment — and that die is dead. The red ones here failed.',
          'Yield is simply the fraction that survived, and it dominates the economics. The wafer costs what it costs whether ten chips or ninety come off it.',
        ],
        say: [
          'And some of them simply do not work.',
          'A speck of dust. A flaw in the mask. A layer slightly out of alignment. That die is dead, and the red ones here failed.',
          '[matter-of-fact] Yield is just the fraction that survived, and it dominates the economics, because the wafer costs what it costs whether ten chips come off it or ninety.',
          '[reflective] It is also why big chips are expensive out of all proportion. Defects are scattered across the wafer, so double the die area and each die catches twice as many, on average. Fewer of the big dies come out clean, so each good one costs nearly three times as much, not twice. That is much of the argument for chiplets.',
        ],
        camera: { position: [0, 8.6, 6.6], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'yield',
        aside: {
          label: 'Why big chips are expensive',
          text: 'Defects are scattered across the wafer. Double the die area and each die catches twice as many on average, so fewer come out clean — in the simplest model, 75% becomes about 56%. Each good chip then costs nearly three times as much, not twice. That is much of the argument for chiplets.',
        },
      },
      {
        id: 'bins',
        kicker: 'Binning',
        heading: 'The survivors are not all equal either',
        body: [
          'Test every die that works and they will not match. Some run at a higher clock, some need more voltage, some have one faulty core out of eight.',
          'So they are sorted. The best become the expensive part, the ones with a dead core get it switched off and are sold as a smaller model, and the rest fill in between. Often the cheap chip and the expensive chip are the same design off the same wafer.',
        ],
        say: [
          'And the ones that work are not all equal either.',
          'Test every die that survived and they will not match. Some run at a higher clock. Some need more voltage. Some have one faulty core out of eight.',
          '[pause] So they are sorted. The best become the expensive part. The ones with a dead core get it switched off and are sold as a smaller model. And the rest fill in between.',
          '[reflective] Which means the cheap chip and the expensive chip are very often the same design, off the same wafer.',
        ],
        camera: { position: [0, 8.6, 6.6], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'bins',
      },
      {
        id: 'node',
        kicker: 'What "3 nm" means',
        heading: 'The number on the box is a name, not a measurement',
        body: [
          'Node names once tracked gate length and half the pitch of the finest wiring. They came apart in the mid-1990s, when gates were shrunk faster than everything else: a 130 nm process already had gates nearer 70.',
          'A part sold as "3 nm" has gates spaced about 45 nanometres apart and its finest wires at a pitch of about 23. Nothing on it measures three. The progress is real — density, speed and power all improved. The number is marketing.',
        ],
        say: [
          'One last thing, about the number on the box.',
          'Node names once tracked real dimensions. The length of the transistor gate, and half the pitch of the finest wiring. They came apart in the mid nineteen nineties, when gates were shrunk faster than everything else. A hundred and thirty nanometre process already had gates nearer seventy.',
          '[matter-of-fact] A part sold as three nanometres has gates spaced about forty-five nanometres apart, and its finest wires at a pitch of about twenty-three. Nothing on it measures three. The progress is real. Density, speed and power all improved. The number is marketing.',
          '[pause] And that closes the first part of this course. You now have the whole of the silicon. What a switch is, how switches decide and remember, what makes them take turns, and how the pattern gets onto the crystal.',
          '[reflective] What is left is everything that has to surround it, before any of that is a computer.',
        ],
        camera: { position: [0, 9.2, 7.4], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'node',
        aside: {
          label: 'Closing Part I',
          text: 'You now have the whole of the silicon: what a switch is, how switches decide and remember, what makes them take turns, and how the pattern gets onto the crystal. Part II asks what must surround it to make a computer.',
        },
      },
    ],
  },
]
