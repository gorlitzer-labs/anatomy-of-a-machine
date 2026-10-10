import type { Chapter } from './types'

/**
 * Lecture 5 — The Board.
 *
 * Lecture 1 ended holding a chip. This one asks what has to surround it before
 * that chip can do anything, and every chapter answers with the same
 * constraint: a sealed box with a fixed power budget and nowhere for heat to
 * go. Almost every design decision on a laptop board falls out of that.
 *
 * The camera language matches the package chapter deliberately — mostly
 * overhead, because a board is a map, and reading a map means looking down at
 * it.
 */
export const boardChapters: Chapter[] = [
  {
    id: 'board',
    scene: 'board',
    marker: '01',
    title: 'The Board',
    short: 'Board',
    beats: [
      {
        id: 'whole',
        kicker: 'What surrounds the chip',
        heading: 'Everything else the machine needs',
        body: [
          'Here is the rest of the computer. One processor, some memory, somewhere to keep files, a way to talk to the outside, a battery, and a fan — laid out on a single sheet of fibreglass one to one-and-a-half millimetres thick.',
          'The chip you spent the last four lectures inside is that one square in the middle. It cannot do anything at all without the rest of this.',
        ],
        say: [
          'Lecture four ended on everything that has to surround the silicon before it is a computer. This is that.',
          {
            text: 'One processor. Some memory. Somewhere to keep files. A way to talk to the outside, a battery, and a fan. All laid out on a single sheet of fibreglass, between one and one and a half millimetres thick.',
            look: 'soc',
          },
          '[pause] The chip you spent four lectures inside is that one square in the middle. And it cannot do anything at all without the rest of this.',
        ],
        camera: { position: [0, 9.4, 6.2], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: null,
        labels: [
          { text: 'Processor', part: 'soc', offset: [0, 0.85, 0], tone: 'cyan' },
          { text: 'Memory', part: 'ram', offset: [1.15, 0.75, 1.15], tone: 'violet' },
          { text: 'Storage', part: 'ssd', offset: [-0.95, 0.7, 0.1], tone: 'plain' },
          { text: 'Cooling', part: 'fins', offset: [0, 0.9, 0], tone: 'amber' },
        ],
      },
      {
        id: 'pcb',
        kicker: 'The board itself',
        heading: 'Glass cloth, epoxy, and a lot of copper',
        body: [
          'The green sheet is not a passive tray for parts to sit on. It is woven glass fibre soaked in epoxy, with sheets of copper laminated between the layers — eight, ten, sometimes more than a dozen of them stacked up.',
          'Close to half of those layers are not signals. They are solid planes of copper carrying power and ground, and they exist as much to give every signal a clean path back as to deliver current.',
        ],
        say: [
          'The green sheet is not a passive tray for parts to sit on.',
          'It is woven glass fibre soaked in epoxy, with sheets of copper laminated between the layers. Eight, ten, sometimes more than a dozen of them, stacked up.',
          '[matter-of-fact] And close to half of those layers are not signals at all. They are solid planes of copper carrying power and ground, and they exist as much to give every signal a clean path back as to deliver current.',
          '[reflective] Nothing about the material is green, by the way. That is the solder mask, and the colour is mostly convention. Nobody quite agrees how green won.',
        ],
        camera: { position: [4.0, 8.4, 8.1], target: [0.2, 0, 0], fov: 36 },
        explode: 0,
        focus: 'pcb',
        aside: {
          label: 'Why green',
          text: 'Nothing about the material is green. That is the solder mask, and the colour is mostly convention — nobody quite agrees how green won, and boards are made in black, blue and red too.',
        },
      },
      {
        id: 'traces',
        kicker: 'Traces',
        heading: 'A wire is a distance, and distance is time',
        body: [
          'Every gold line is a copper trace: a wire, etched rather than drawn. At the speeds these run, a trace is not a neutral connection between two points — it is a delay, and a length that has to be accounted for.',
          'Look at the memory bus. Some of those lines wander instead of going straight. That is not sloppiness. Those wires were lengthened on purpose so that every bit in the group arrives together.',
        ],
        say: [
          'Every gold line here is a copper trace. A wire, etched rather than drawn.',
          'At the speeds these run, a trace is not a neutral connection between two points. It is a delay, and a length that has to be accounted for.',
          {
            text: '[pause] Look at the memory bus. Some of those lines wander instead of going straight. That is not sloppiness. Those wires were lengthened on purpose, so that every bit in the group arrives together.',
            zoom: 0.88,
          },
          {
            text: '[matter-of-fact] A signal covers roughly fifteen centimetres per nanosecond in a board. A memory bus moving four point eight billion transfers a second gives each bit about two hundred picoseconds on the wire. That is about three centimetres of trace — which is why the memory sits centimetres from the processor, and not on the other side of the machine.',
            zoom: 1,
          },
        ],
        camera: { position: [0.2, 7.0, 5.5], target: [0.6, 0, 0], fov: 34 },
        explode: 0,
        focus: 'pcb',
        aside: {
          label: 'The number that governs it',
          text: 'A signal covers roughly 15 cm per nanosecond in a board. A memory bus moving 4.8 billion transfers a second gives each bit about 200 ps on the wire — about 3 cm of trace — which is why the memory sits centimetres from the processor and not on the other side of the machine.',
        },
      },
      {
        id: 'exploded',
        kicker: 'All layers',
        heading: 'The machine, apart',
        body: [
          'Cooling above, board in the middle, battery below. Three slabs, and the two that are not the computer take up most of the volume.',
          'That ratio is the whole lecture. A laptop is mostly a power supply and a heat sink with a small amount of silicon in between.',
        ],
        say: [
          'Here it is in three slabs. Cooling above, board in the middle, battery below.',
          '[pause] And the two that are not the computer take up most of the volume.',
          '[reflective] That ratio is the whole lecture. A laptop is mostly a power supply and a heat sink, with a small amount of silicon in between.',
        ],
        camera: { position: [7.4, 6.2, 8.2], target: [0, -0.2, 0], fov: 40 },
        explode: 1,
        focus: null,
        labels: [
          { text: 'Fan and fins', part: 'fins', offset: [0, 0.9, 0], tone: 'amber' },
          { text: 'Heat pipe', part: 'heatpipe', offset: [-1.4, 0.6, 0], tone: 'amber' },
          { text: 'Mainboard', part: 'pcb', offset: [2.6, 0.4, 1.6], tone: 'plain' },
          { text: 'Battery', part: 'battery', offset: [2.4, 0.55, 0.75], tone: 'violet' },
        ],
      },
    ],
  },

  {
    id: 'power',
    scene: 'board',
    marker: '02',
    title: 'Power',
    short: 'Power',
    beats: [
      {
        id: 'battery',
        kicker: 'The battery',
        heading: 'Most of the machine is chemistry',
        body: [
          'The largest single object in a laptop is not the processor or the screen. It is this: three sealed pouches of lithium chemistry, taking up more volume than every computing part combined.',
          'It supplies something around eleven or twelve volts, and it sags — the voltage drops as it drains, and again whenever the machine suddenly asks for more current.',
        ],
        say: [
          'The largest single object in a laptop is not the processor, and it is not the screen.',
          'It is this. Three sealed pouches of lithium chemistry, taking up more volume than every computing part combined.',
          '[matter-of-fact] It supplies something around eleven or twelve volts, and it sags. The voltage drops as it drains, and again whenever the machine suddenly asks for more current.',
        ],
        camera: { position: [0, 5.4, 9.0], target: [0, -1.0, 0], fov: 36 },
        explode: 0.55,
        focus: 'battery',
        isolate: false,
      },
      {
        id: 'vrm',
        kicker: 'Regulation',
        heading: 'Twelve volts in, one volt out',
        body: [
          'A processor core does not want twelve volts. It wants roughly one, held very steady, and it wants a great deal of current at that voltage. Converting between the two is the job of these blocks.',
          'The chunky metal cubes are inductors, and they are among the biggest components on the board because turning volts into amps efficiently requires storing energy in a magnetic field, and that takes physical bulk.',
        ],
        say: [
          {
            text: 'A processor core does not want twelve volts.',
            look: 'vrm',
          },
          'It wants roughly one, held very steady, and it wants a great deal of current at that voltage. Converting between the two is the job of these blocks.',
          '[pause] Those chunky metal cubes are inductors, and they are among the biggest components on the board — because turning volts into amps efficiently means storing energy in a magnetic field, and that takes physical bulk.',
          '[reflective] The regulators for a performance laptop processor are built to deliver over a hundred amps, at about a volt. That is more current than an electric kettle, through connections a few millimetres wide.',
        ],
        camera: { position: [-4.2, 5.0, 5.4], target: [-2.4, 0, 0], fov: 34 },
        explode: 0,
        focus: 'power',
        isolate: true,
        labels: [
          { text: 'Inductors', part: 'vrm', offset: [-1.35, 0.85, -1.05], tone: 'amber' },
          { text: 'To the processor', part: 'soc', offset: [-0.75, 0.9, 0.6], tone: 'cyan' },
        ],
        aside: {
          label: 'The scale of it',
          text: 'The regulators for a performance laptop processor are built to deliver over a hundred amps at about a volt. That is more current than an electric kettle, through connections a few millimetres wide.',
        },
      },
      {
        id: 'rails',
        kicker: 'Why it dominates',
        heading: 'Half the board is feeding the other half',
        body: [
          'Power flows one way only, and it takes the shortest fat path it can: connector, regulators, straight into the socket. Nothing about it is clever, and it is a large fraction of everything on the board.',
          'This is the same story as the CPU package, one level up. Half the pins on the chip were power and ground. Close to half the layers in the board are power and ground. Feeding the thing is harder than talking to it.',
        ],
        say: [
          'Watch where the power actually goes.',
          'It flows one way only, and it takes the shortest fat path it can. Connector, regulators, straight into the socket. Nothing about it is clever, and it is a large fraction of everything on this board.',
          '[matter-of-fact] Which is the same story as the processor package, one level up. Half the pins on the chip were power and ground. Close to half the layers in the board are power and ground. Feeding the thing is harder than talking to it.',
        ],
        camera: { position: [-1.6, 7.6, 6.2], target: [-1.2, 0, 0], fov: 36 },
        explode: 0,
        focus: 'power',
        isolate: true,
      },
    ],
  },

  {
    id: 'buses',
    scene: 'board',
    marker: '03',
    title: 'Buses',
    short: 'Buses',
    beats: [
      {
        id: 'ddr',
        kicker: 'DDR',
        heading: 'Wide, short, and fussy about it',
        body: [
          'The memory bus is about a hundred parallel wires, all carrying part of the same number. They travel in groups of eight, each with its own timing signal, and every wire in a group must arrive together — watch them move as a block. That lockstep is what the length-matched squiggles buy.',
          'It is short because it must be: every extra centimetre is delay that has to be matched on every other wire in the group, and matching has limits.',
          'Now watch the direction. These same wires carry both reads and writes, so the bus can only do one at a time — and it goes completely still while it turns around. That pause is why a workload that mixes reads and writes gets less out of memory than either one alone.',
        ],
        say: [
          'Now the buses, and there are two answers to the same problem here.',
          'The memory bus is about a hundred parallel wires, all carrying part of the same number. They travel in groups of eight, each with its own timing signal, and every wire in a group has to arrive together. Watch them move as a block. That lockstep is what the length-matched squiggles buy.',
          '[pause] It is short because it has to be. Every extra centimetre is delay that has to be matched on every other wire in the group, and matching has limits.',
          '[matter-of-fact] And watch the direction. These same wires carry both reads and writes, so the bus can only do one at a time, and it goes completely still while it turns around. That pause is why a workload mixing reads and writes gets less out of memory than either one alone.',
        ],
        camera: { position: [1.5, 6.6, 6.2], target: [0.1, 0, 0], fov: 33 },
        explode: 0,
        focus: 'ddr',
        isolate: true,
        labels: [
          { text: 'Same length, on purpose', part: 'pcb', offset: [0.5, 0.7, 0.9], tone: 'cyan' },
        ],
      },
      {
        id: 'pcie',
        kicker: 'PCIe',
        heading: 'Trade width for length',
        body: [
          'Storage gets four lanes — sixteen wires in all, against the memory bus\'s hundred or so — and reaches right across the board to do it. A serial link clocks data out at one end and recovers the timing at the other, so it does not need every wire to agree.',
          'That recovery is what buys the distance, and it buys something else: in each lane, each direction gets its own pair, so unlike DDR this link runs both ways at once and never has to stop and turn around. Same problem as DDR, opposite answer — width against length, one more time.',
        ],
        say: [
          {
            text: 'Now the opposite answer.',
            look: 'ssd',
          },
          'Storage gets four lanes. Sixteen wires in all, against the memory bus\'s hundred or so. And it reaches right across the board to do it. A serial link clocks data out at one end and recovers the timing at the other, so it does not need every wire to agree.',
          '[pause] That recovery is what buys the distance. And it buys something else. In each lane, each direction gets its own pair, so unlike the memory bus this link runs both ways at once and never has to stop and turn around.',
          '[reflective] Same problem as the memory bus, opposite answer. Width against length, one more time.',
        ],
        camera: { position: [1.4, 6.8, 6.6], target: [2.0, 0, -0.8], fov: 34 },
        explode: 0,
        focus: 'pcie',
        isolate: true,
      },
      {
        id: 'usb',
        kicker: 'USB and radio',
        heading: 'The edge of the machine',
        body: [
          'Out to the ports, where a person can reach, and out to the radio, where the machine stops being a machine and starts being a network.',
          'Most of these are slow by the standards of everything else here — a Wi-Fi radio moves a gigabit or two a second, where the memory bus moves hundreds of them — and it rarely matters: they only have to keep up with whatever is on the other end, and a keyboard, a network or a person is far slower than the silicon.',
        ],
        say: [
          {
            text: 'And out here is where the machine stops being a machine.',
            look: 'ports',
          },
          'Out to the ports, where a person can reach. And out to the radio, where it starts being a network.',
          '[matter-of-fact] Most of these are slow by the standards of everything else here. A Wi-Fi radio moves a gigabit or two a second, where the memory bus moves hundreds of them. And it rarely matters. They only have to keep up with whatever is on the other end, and a keyboard, a network or a person is far slower than the silicon.',
        ],
        camera: { position: [-1.3, 8.4, 8.4], target: [-1.7, 0, 1.1], fov: 38 },
        explode: 0,
        focus: 'usb',
        isolate: true,
        labels: [
          { text: 'Ports', part: 'ports', offset: [-1.1, 0.7, 2.7], tone: 'amber' },
          { text: 'Radio', part: 'wifi', offset: [-2.4, 0.75, 0.9], tone: 'violet' },
        ],
      },
    ],
  },

  {
    id: 'thermal',
    scene: 'board',
    marker: '04',
    title: 'Heat',
    short: 'Heat',
    beats: [
      {
        id: 'pipe',
        kicker: 'The heat pipe',
        heading: 'A phase-change engine with no moving parts',
        body: [
          'The copper tube is not a solid rod conducting heat along its length. It is sealed, nearly empty, and holds a small amount of fluid. At the hot end that fluid boils; at the cold end it condenses and wicks back.',
          'Boiling something absorbs far more energy than merely warming it, which is why a thin tube like this moves heat many times better than solid copper of the same size, and does it with nothing that can wear out.',
        ],
        say: [
          {
            text: 'That copper tube is not a solid rod conducting heat along its length.',
            look: 'heatpipe',
          },
          'It is sealed, nearly empty, and holds a small amount of fluid. At the hot end that fluid boils. At the cold end it condenses, and wicks back.',
          '[pause] Boiling something absorbs far more energy than merely warming it, which is why a thin tube like this moves heat many times better than solid copper of the same size. And it does it with nothing that can wear out.',
        ],
        camera: { position: [1.0, 4.4, 5.4], target: [1.0, 0.5, 0], fov: 34 },
        explode: 0,
        focus: 'cooling',
        labels: [
          { text: 'Hot end — on the die', part: 'heatpipe', offset: [-0.15, 0.9, 1.55], tone: 'amber' },
          { text: 'Cold end — the fins', part: 'fins', offset: [0, 0.9, 0], tone: 'cyan' },
        ],
      },
      {
        id: 'fan',
        kicker: 'The fan',
        heading: 'Getting it out of a sealed box',
        body: [
          'Heat arrives at the fins and stops there, because the fins are surrounded by air that is already warm. Something has to keep replacing that air, and the only thing that can do it quickly is a fan.',
          'This is the only moving part on the board, and it exists solely because the box is closed. Nothing else here moves at all.',
        ],
        say: [
          {
            text: 'Heat arrives at the fins and stops there, because the fins are surrounded by air that is already warm.',
            look: 'fan',
          },
          'Something has to keep replacing that air, and the only thing that can do it quickly is a fan.',
          '[matter-of-fact] This is the only moving part on the board, and it exists solely because the box is closed. Nothing else here moves at all.',
          '[reflective] Which is a tradeoff you can hear. A thinner laptop has a thinner fan, which moves less air, which means less heat can leave, which means the processor has to slow down sooner. Thinness is paid for in sustained performance.',
        ],
        camera: { position: [3.6, 4.0, 4.6], target: [3.2, 0.4, 0], fov: 34 },
        explode: 0,
        focus: 'cooling',
        aside: {
          label: 'The tradeoff you can hear',
          text: 'A thinner laptop has a thinner fan, which moves less air, which means less heat can leave, which means the processor has to slow down sooner. Thinness is paid for in sustained performance.',
        },
      },
      {
        id: 'budget',
        kicker: 'The constraint',
        heading: 'The box is sealed, and that decides everything',
        body: [
          'Add up the lecture. The battery sets how much energy exists. The regulators set how much of it reaches the chip. The pipe and the fan set how much heat can leave. Whichever of those runs out first is the machine\'s real limit.',
          'It is almost never the silicon. A laptop processor is usually capable of more than its chassis can feed or cool, and the number on the box is a cooling number wearing a performance number\'s clothes.',
        ],
        say: [
          'So add up the lecture.',
          'The battery sets how much energy exists. The regulators set how much of it reaches the chip. The pipe and the fan set how much heat can leave. And whichever of those runs out first is the machine\'s real limit.',
          '[pause] It is almost never the silicon. A laptop processor is usually capable of more than its chassis can feed or cool, and the number on the box is a cooling number wearing a performance number\'s clothes.',
          '[reflective] What this lecture has not explained is how any of it talks to the world outside. That is next.',
        ],
        camera: { position: [0, 10.2, 7.4], target: [0, 0, 0], fov: 38 },
        explode: 0.25,
        focus: null,
        aside: {
          label: 'Where this goes next',
          text: 'Every machine in Part IV is this same sum with different numbers. A phone deletes the fan. A car adds fifteen years and a vibrating oven. An implant gets a few tens of milliwatts and no way to change the battery.',
        },
      },
    ],
  },
]
