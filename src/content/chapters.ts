import type { Chapter } from './types'

/**
 * The whole site is this array.
 *
 * Adding a chapter = adding an entry here plus (if it needs new geometry) one
 * scene component registered in `three/scenes/index.ts`. Camera moves, copy,
 * explosion state and the chapter rail all derive from this data.
 */
export const chapters: Chapter[] = [
  {
    id: 'package',
    scene: 'cpu',
    marker: '01',
    title: 'The Package',
    short: 'Package',
    beats: [
      {
        id: 'whole',
        kicker: 'What you actually hold',
        heading: 'A slab of metal hiding a fingernail of glass',
        body: [
          'This is a desktop processor as it ships: a square of green fibreglass with a metal lid soldered on top and a thousand gold contacts underneath.',
          'Almost none of it does any computing. The lid is a heat sink. The board is wiring. The part that thinks is a sliver of silicon in the middle, smaller than a postage stamp.',
        ],
        say: [
          '[curious] Seventeen lectures, one machine. We start here, with the part you could actually hold. So before we take anything apart, just look at it.',
          {
            text: 'A square of green fibreglass. A metal lid soldered on top. A thousand gold contacts underneath.',
            orbit: [0.28, 0.1],
          },
          {
            text: '[pause] Now here\'s the part that surprises people. Almost NONE of this computes. The lid is a heat sink. The board is wiring. And the thing that actually thinks is a sliver of silicon buried in the middle, smaller than a postage stamp.',
            orbit: [0, 0],
          },
        ],
        camera: { position: [0, 4.2, 12.4], target: [0, 0.05, 0], fov: 34 },
        explode: 0,
        focus: null,
      },
      {
        id: 'lid',
        kicker: 'Layer 1',
        heading: 'The lid is a radiator, not a shield',
        body: [
          'The integrated heat spreader is a nickel-plated copper plate. Its job is to take heat out of a few hot square centimetres and spread it across a much larger flat surface that a cooler can grab onto.',
          'A modern chip can dump 250 watts through an area smaller than a stamp. That is a heat flux higher than a kitchen hotplate.',
        ],
        say: [
          {
            text: '[curious] So why does a computer start with a lump of metal? Because this is the part that decides everything else.',
          },
          'It\'s called the integrated heat spreader. Nickel-plated copper. Its job is to take heat out of a few furiously hot square centimetres, and spread it wide enough for a cooler to grab onto.',
          'And it has to. A modern chip can push two hundred and fifty watts through an area smaller than a stamp. [pause] That is a higher heat flux than a kitchen hotplate.',
          {
            text: '[reflective] A desktop chip is only rated to run up to about a hundred degrees. So every performance number you have ever seen? It\'s really a cooling number in disguise.',
            voice: 'aside',
          },
        ],
        camera: { position: [5.6, 4.4, 8.6], target: [0, 0.45, 0], fov: 36 },
        explode: 0.45,
        focus: 'ihs',
        aside: {
          label: 'Why it matters',
          text: 'A desktop chip is only rated to run up to about 100°C. Every performance number you have ever seen is really a cooling number in disguise.',
        },
      },
      {
        id: 'die',
        kicker: 'Layer 2',
        heading: 'The die — this is the computer',
        body: [
          'Underneath is the die: a single crystal of silicon with billions of switches printed onto its surface in layers, like a photographic negative developed dozens of times over.',
          'Everything else in the package exists to feed this rectangle power, carry its signals out, and take its heat away.',
        ],
        say: [
          {
            text: '[awe] Lift that off. And here it is. The die.',
          },
          'One single crystal of silicon, with billions of switches printed onto its surface in layers, like a photographic negative developed dozens of times over.',
          '[matter-of-fact] And notice the proportions, because they matter. Everything else in this package works FOR this rectangle. Feed it power, carry its signals out, take its heat away.',
        ],
        camera: { position: [3.4, 3.4, 7.0], target: [0, 0.35, 0], fov: 32 },
        explode: 0.72,
        focus: 'die',
      },
      {
        id: 'substrate',
        kicker: 'Layer 3',
        heading: 'The board underneath is a road network',
        body: [
          'The green substrate fans the die\'s microscopic pads out to contacts big enough for a socket to touch. It is a dense stack of copper layers, some carrying signals, most carrying power.',
          'Under it sit the contacts — over a thousand on a modern chip, and at least half of them are just power and ground.',
        ],
        say: [
          {
            text: 'Underneath, the green board. This one looks boring, so watch what it\'s actually doing.',
          },
          'It fans the die\'s microscopic pads out to contacts big enough for a socket to touch. A dense stack of copper layers, some carrying signals, most carrying power.',
          {
            text: '[pause] Now count the contacts. Over a thousand on a modern chip. And at least half of them are nothing but power and ground.',
            look: 'pads',
          },
          {
            text: 'Which gives you a rule of thumb worth keeping. Roughly HALF the pins on a processor do nothing but deliver current. [reflective] Feeding this thing is harder than talking to it.',
            voice: 'aside',
          },
        ],
        camera: { position: [0, -2.4, 9.0], target: [0, -0.25, 0], fov: 36 },
        explode: 0.9,
        focus: 'substrate',
        aside: {
          label: 'Rule of thumb',
          text: 'Roughly half of the pins on a CPU do nothing but deliver current. Feeding the chip is harder than talking to it.',
        },
      },
      {
        id: 'exploded',
        kicker: 'All layers',
        heading: 'The whole stack, apart',
        body: [
          'Lid, thermal interface, die, capacitors, substrate, contacts, socket. Seven layers, and only one of them computes.',
          'A cooler bolts on above all of this. It is bigger than everything you see here put together.',
        ],
        say: [
          'So let\'s lay the whole thing out, side by side.',
          {
            text: 'Lid. Thermal paste. The die. Capacitors, substrate, contacts, socket.',
            orbit: [0.3, -0.16],
          },
          {
            text: '[pause] Seven layers. And only ONE of them computes. Everything else is plumbing. Heat out, power in, signals across.',
            orbit: [0, 0],
          },
          'And a cooler bolts on above all of it, bigger than everything you can see here put together.',
        ],
        // Frames the separated stack, which spans roughly y = -2.3 to y = 3.
        camera: { position: [8.6, 3.4, 8.6], target: [0, 0.35, 0], fov: 40 },
        explode: 1,
        focus: null,
        labels: [
          { text: 'Heat spreader', part: 'ihs', offset: [2.5, 0.2, 0], tone: 'plain' },
          { text: 'Thermal paste', part: 'tim', offset: [2.4, 0.1, 0], tone: 'plain' },
          { text: 'Die — the computer', part: 'die', offset: [2.6, 0.1, 0], tone: 'cyan' },
          { text: 'Substrate', part: 'substrate', offset: [2.4, 0.1, 0], tone: 'plain' },
          { text: 'Contacts', part: 'pads', offset: [2.4, 0, 0], tone: 'amber' },
          { text: 'Socket', part: 'socket', offset: [2.6, 0, 0], tone: 'plain' },
        ],
      },
    ],
  },

  {
    id: 'die',
    scene: 'cpu',
    marker: '02',
    title: 'Inside the Die',
    short: 'The die',
    beats: [
      {
        id: 'floorplan',
        kicker: 'Floorplan',
        heading: 'A city seen from orbit',
        body: [
          'Zoom into the die surface and the randomness resolves into blocks. Repeated rectangles are cores. The large regular grey areas are cache — memory built from the same silicon.',
          'Layout is not cosmetic. Two blocks that need to talk constantly are placed next to each other, because distance costs time.',
        ],
        say: [
          'Now let\'s go closer. Much closer.',
          'Zoom into the surface of the die, and what looked like random texture resolves into blocks.',
          {
            text: 'These repeated rectangles? Those are the cores.',
          },
          {
            text: 'And this large, regular grey area is cache. Memory, built out of the same silicon.',
          },
          '[matter-of-fact] None of this layout is decoration. Two blocks that need to talk constantly get placed next to each other. [pause] Because distance costs time. Hold onto that one, it explains the rest of the lecture.',
        ],
        camera: { position: [0, 3.4, 3.0], target: [0, 0.3, 0], fov: 34 },
        explode: 0,
        focus: 'die',
        isolate: true,
        labels: [
          { text: 'Cores', part: 'die', offset: [-0.15, 0.5, -1.05], tone: 'cyan' },
          { text: 'Shared cache', part: 'die', offset: [0.85, 0.42, 0.5], tone: 'plain' },
          { text: 'I/O', part: 'die', offset: [1.35, 0.35, -0.95], tone: 'amber' },
        ],
      },
      {
        id: 'cores',
        kicker: 'Cores',
        heading: 'Each core is a complete worker',
        body: [
          'A core is an independent machine that reads instructions and carries them out. Eight cores means eight instruction streams genuinely running at the same moment.',
          'This is why more cores does not automatically mean faster. If your work cannot be split into independent pieces, seven of them sit idle.',
        ],
        say: [
          {
            text: 'So what IS a core? It\'s a complete machine on its own. It reads instructions, and it carries them out.',
          },
          'Eight cores means eight streams of instructions genuinely running at the same moment.',
          '[reflective] Which is exactly why more cores doesn\'t automatically mean faster. If your work can\'t be split into independent pieces, seven of them just sit there.',
        ],
        camera: { position: [-1.5, 2.2, 2.9], target: [-0.35, 0.25, 0], fov: 34 },
        explode: 0,
        focus: 'core',
        isolate: true,
      },
      {
        id: 'cache',
        kicker: 'Cache',
        heading: 'Memory is a distance problem',
        body: [
          'Main memory sits centimetres away. At these speeds that round trip costs the core hundreds of wasted cycles — long enough to have executed hundreds of instructions instead.',
          'So the chip keeps ladders of progressively larger, slower copies close by: a few dozen kilobytes right beside the core, tens of megabytes shared across the die.',
        ],
        say: [
          {
            text: 'Here\'s a problem you would never guess this chip had.',
          },
          'Main memory sits centimetres away. At these speeds, that round trip costs the core hundreds of wasted cycles. Long enough to have run hundreds of instructions instead.',
          'So the chip cheats. It hoards copies. A few dozen kilobytes right beside the core, tens of megabytes shared across the die, every rung larger and slower than the one before it.',
          {
            text: '[pause] And the numbers are brutal. The nearest cache answers in about ONE nanosecond. Main memory takes eighty. [slowly] If the first is a step across the room, the second is a walk across town.',
            voice: 'aside',
          },
        ],
        camera: { position: [1.6, 1.7, 2.3], target: [0.3, 0.3, 0], fov: 33 },
        explode: 0,
        focus: 'cache',
        isolate: true,
        aside: {
          label: 'The numbers',
          text: 'L1 hit: ~1 nanosecond. Main memory: ~80 nanoseconds. If L1 were a step across the room, RAM would be a walk across town.',
        },
      },
      {
        id: 'cycle',
        kicker: 'The loop',
        heading: 'Fetch, decode, execute — billions of times a second',
        body: [
          'Every core runs the same basic loop. Fetch the next instruction from memory. Decode what it means. Execute it in the arithmetic unit, reaching out to memory if it needs to. Write the answer back.',
          'A 4 GHz chip runs that clock four billion times per second, and a big modern core keeps hundreds of instructions in flight inside the loop at once so that as little as possible sits idle.',
        ],
        say: [
          {
            text: 'Every core, however clever it looks, runs the same small loop. Over and over.',
          },
          'Fetch the next instruction. Decode what it means. Execute it, reaching out to memory if it needs to. Write the answer back.',
          '[pause] That is the whole loop. And a four gigahertz chip runs that clock four BILLION times a second. A big modern core keeps HUNDREDS of instructions in flight inside it at once, so that as little as possible sits idle.',
        ],
        camera: { position: [0, 2.3, 2.9], target: [0, 0.3, 0], fov: 35 },
        explode: 0,
        focus: 'core',
        isolate: true,
      },
    ],
  },

  {
    id: 'transistor',
    scene: 'mosfet',
    marker: '03',
    title: 'Down to the Switch',
    short: 'Transistor',
    beats: [
      {
        id: 'arrive',
        kicker: 'Zoom ×10,000,000',
        heading: 'The bottom of the stack',
        body: [
          'Keep magnifying a core and the blocks dissolve into wires, and the wires end at this: a single field-effect transistor. A switch with no moving parts.',
          'There are billions of these on the die you were just looking at. This one is drawn a hundred million times larger than life.',
        ],
        say: [
          'Keep going. Keep magnifying.',
          'The blocks dissolve into wires. And the wires end, here.',
          {
            text: '[awe] One single field-effect transistor. A switch with no moving parts. There are billions of these on the die you were just looking at. This one is drawn about a hundred million times larger than life.',
            orbit: [0.26, 0.08],
          },
        ],
        camera: { position: [0, 3.0, 7.8], target: [0, 0.0, 0], fov: 34 },
        explode: 0,
        focus: null,
      },
      {
        id: 'parts',
        kicker: 'Anatomy',
        heading: 'Source, drain, and a gate that never touches',
        body: [
          'Current wants to run from the source terminal to the drain terminal. Between them sits plain silicon that does not normally conduct — the circuit is broken.',
          'Above that gap sits the gate, separated by an insulating layer only a few atoms thick. The gate never touches the silicon. It works purely by the field it projects.',
        ],
        say: [
          {
            text: 'Let me name the pieces, because the whole trick is in how they\'re arranged. Current wants to run from this terminal, the source,',
            look: 'source',
          },
          {
            text: 'to this one. The drain.',
            look: 'drain',
          },
          {
            text: 'But between them sits plain silicon that doesn\'t normally conduct. [pause] So as it stands, the circuit is broken. Nothing flows.',
            look: 'bulk',
          },
          {
            text: 'And above that gap sits the gate.',
          },
          {
            text: '[matter-of-fact] Now here\'s the part worth stopping on. The gate NEVER touches the silicon. It\'s separated by an insulating layer a few atoms thick. It works purely by the field it projects downwards.',
            look: 'oxide',
          },
        ],
        camera: { position: [5.6, 3.2, 6.6], target: [0, 0.35, 0], fov: 34 },
        explode: 0.55,
        focus: 'gate',
        labels: [
          { text: 'Gate', part: 'gate', offset: [0, 0.5, 0], tone: 'amber' },
          { text: 'Insulator', part: 'oxide', offset: [1.5, 0.2, 1.2], tone: 'plain' },
          { text: 'Source', part: 'source', offset: [0.5, 0.5, -1.4], tone: 'cyan' },
          { text: 'Drain', part: 'drain', offset: [0.4, 0.5, 1.3], tone: 'cyan' },
          { text: 'Silicon bulk', part: 'bulk', offset: [1.9, -0.15, 1.15], tone: 'plain' },
        ],
      },
      {
        id: 'switching',
        kicker: 'How it switches',
        heading: 'Voltage on the gate builds a bridge',
        body: [
          'Put a voltage on the gate and its electric field drags electrons up out of the silicon into a thin layer directly beneath it. That layer is a conducting channel, and current flows: the switch is on.',
          'Remove the voltage, the channel evaporates, the gap is insulating again: the switch is off. No moving parts, no wear, and it can happen billions of times per second.',
        ],
        say: [
          {
            text: 'So watch what happens when we switch it on.',
          },
          'Put a voltage on the gate. Its field reaches down and drags electrons up out of the silicon into a thin layer right underneath it. That layer is a channel, and current flows. [pause] The switch is on.',
          'Take the voltage away, the channel evaporates, and the gap insulates again. The switch is off.',
          '[reflective] Nothing moved. Nothing wore out. And it can happen billions of times a second.',
          {
            text: '[pause] One scale check, because it\'s easy to skim past. That insulating layer is only a nanometre or two thick. A handful of atoms. Ordinary glass that thin already lets electrons tunnel straight through. So since two thousand and seven, it has been made of hafnium oxide instead. That grips the channel just as hard while being physically thicker, and it leaks far less.',
            voice: 'aside',
            look: 'oxide',
          },
        ],
        // The gate sits directly over the channel and hides it completely when
        // assembled. Lifting the gate stack slightly is the only way to see the
        // thing this beat is about, and it matches the exploded language used
        // in the rest of the piece.
        camera: { position: [1.6, 2.6, 6.6], target: [0, 0.15, 0], fov: 34 },
        explode: 0.26,
        focus: 'channel',
        labels: [
          { text: 'Channel forms here', part: 'channel', offset: [0, 0.5, 1.25], tone: 'cyan' },
        ],
        aside: {
          label: 'Scale check',
          text: 'The insulating layer under the gate is only a nanometre or two thick — a handful of atoms. Ordinary glass (silicon dioxide) that thin already lets electrons tunnel straight through, so since 2007 it has been made of hafnium oxide, which grips the channel just as hard while being physically thicker, and leaks far less.',
        },
      },
      {
        id: 'logic',
        kicker: 'From switch to thought',
        heading: 'Two of these make a decision',
        body: [
          'Wire two complementary transistors in series and you get an inverter: in goes 1, out comes 0. That is the smallest thing that can be said to decide anything.',
          'Wire a few more together and you get gates — the parts that combine two answers into one. That is the next rung, and you can watch them switch.',
        ],
        say: [
          'One switch on its own can\'t decide anything. So put two of them together.',
          'Wire two complementary transistors in series, and you get an inverter. In goes a one, out comes a zero. [pause] That is the smallest thing that can be said to decide anything.',
          'Wire a few more, and you get gates. The parts that take two answers and combine them into one. That\'s the next rung up, and you can watch them switch.',
        ],
        camera: { position: [0, 4.4, 8.4], target: [0, 1.0, 0], fov: 40 },
        explode: 0.25,
        focus: null,
        motion: 'logic',
        readout: true,
      },
    ],
  },

  {
    id: 'gates',
    scene: 'gates',
    marker: '04',
    title: 'Logic Gates',
    short: 'Gates',
    beats: [
      {
        id: 'not',
        kicker: 'NOT',
        heading: 'The simplest possible opinion',
        body: [
          'An inverter takes one input and gives back the opposite. Feed it a 1 and it answers 0. That is all it does, and everything else is built out of it.',
          'The little circle on the nose is the notation for "and then flip it". You will see it again on other gates.',
        ],
        say: [
          {
            text: 'Start with the simplest opinion a machine can hold.',
          },
          'An inverter takes one input and hands back the opposite. Feed it a one, it answers zero. That\'s all it does, and everything else is built out of it.',
          'Watch the table. Two rows. It just alternates.',
          '[matter-of-fact] And see that little circle on the nose of the symbol? That is notation for, and then flip it. You\'ll meet that circle again, so keep it.',
        ],
        camera: { position: [-5.2, 5.4, 7.2], target: [-5.2, 0, 0], fov: 32 },
        explode: 0,
        focus: 'not',
        truth: 'not',
        labels: [
          { text: 'In', part: 'not', offset: [-1.3, 0.5, -1.15], tone: 'cyan' },
          { text: 'Out', part: 'not', offset: [0.85, 0.6, 1.55], tone: 'cyan' },
        ],
      },
      {
        id: 'and',
        kicker: 'AND',
        heading: 'Both, or nothing',
        body: [
          'AND takes two inputs and only answers 1 when both of them are 1. Any other combination and it stays dark.',
          'This is how a machine expresses a requirement: proceed only if this is true and that is true.',
        ],
        say: [
          {
            text: 'Now give it two inputs. AND only answers one when BOTH of them are one.',
          },
          'Any other combination, and it stays dark.',
          'Follow the four rows as they cycle. [pause] Only the last one lights up.',
          '[reflective] This is how a machine expresses a requirement. Proceed only if this is true, and that is true.',
        ],
        camera: { position: [-1.75, 5.4, 7.2], target: [-1.75, 0, 0], fov: 32 },
        explode: 0,
        focus: 'and',
        truth: 'and',
        labels: [
          { text: 'A', part: 'and', offset: [-1.35, 0.5, -1.2], tone: 'cyan' },
          { text: 'B', part: 'and', offset: [-0.65, 0.6, 1.6], tone: 'cyan' },
          { text: 'A AND B', part: 'and', offset: [0.75, 0.6, 1.6], tone: 'cyan' },
        ],
      },
      {
        id: 'or',
        kicker: 'OR',
        heading: 'Either will do',
        body: [
          'OR answers 1 when at least one input is 1. It only stays dark when both inputs are 0.',
          'Between AND and OR you can already express most conditions you would write in words: this and that, this or that, not this.',
        ],
        say: [
          {
            text: 'OR is the generous one. It answers one when at LEAST one input is one.',
          },
          'It only stays dark when both are zero. That very first row.',
          '[matter-of-fact] And stop for a moment, because you can already do something real. Between AND and OR, you can express most of the conditions you would ever write out in words. This and that. This or that. Not this.',
        ],
        camera: { position: [1.75, 5.4, 7.2], target: [1.75, 0, 0], fov: 32 },
        explode: 0,
        focus: 'or',
        truth: 'or',
        labels: [
          { text: 'A', part: 'or', offset: [-1.35, 0.5, -1.2], tone: 'cyan' },
          { text: 'B', part: 'or', offset: [-0.65, 0.6, 1.6], tone: 'cyan' },
          { text: 'A OR B', part: 'or', offset: [0.75, 0.6, 1.6], tone: 'cyan' },
        ],
      },
      {
        id: 'xor',
        kicker: 'XOR',
        heading: 'The one that can count',
        body: [
          'XOR answers 1 only when its inputs disagree. Two 1s cancel back to 0, which looks like a quirk until you notice what it is doing.',
          'Look at the bottom row: 1 and 1 gives 0. That is not a failure. That is 1 + 1 = 0, carry the 1.',
        ],
        say: [
          {
            text: 'XOR is the strange one. It answers one only when its inputs disagree.',
          },
          'Two ones cancel back to zero. Which looks like a bug, until you see what it\'s actually doing.',
          '[pause] Watch the bottom row. One and one gives zero. [slowly] That is not a failure. That is one plus one equals zero, carry the one.',
          '[awe] XOR is addition, without the carry. Pair it with an AND to catch that carry, and you have built arithmetic out of switches.',
        ],
        camera: { position: [5.2, 5.4, 7.2], target: [5.2, 0, 0], fov: 32 },
        explode: 0,
        focus: 'xor',
        truth: 'xor',
        aside: {
          label: 'Why it matters',
          text: 'XOR is addition without the carry. Pair it with an AND that catches the carry and you have built arithmetic.',
        },
        labels: [
          { text: 'A', part: 'xor', offset: [-1.35, 0.5, -1.2], tone: 'cyan' },
          { text: 'B', part: 'xor', offset: [-0.65, 0.6, 1.6], tone: 'cyan' },
          { text: 'A XOR B', part: 'xor', offset: [0.75, 0.6, 1.6], tone: 'cyan' },
        ],
      },
      {
        id: 'bench',
        kicker: 'Four gates',
        heading: 'This is the whole vocabulary',
        body: [
          'NOT, AND, OR, XOR. Every program you have ever run, every image you have ever seen, reduces to arrangements of these four decisions repeated at enormous scale.',
          'There is nothing else to add. From here it is only a question of how many, and how they are wired.',
        ],
        say: [
          'So let\'s take stock. This is the whole vocabulary. Four gates.',
          {
            text: 'NOT. The opposite.',
            look: 'not',
          },
          {
            text: 'AND. Both, or nothing.',
            look: 'and',
          },
          {
            text: 'OR. Either will do.',
            look: 'or',
          },
          {
            text: 'XOR. The one that disagrees.',
            look: 'xor',
          },
          '[pause] Every program you have ever run. Every image you have ever seen. All of it reduces to arrangements of these four decisions, repeated at enormous scale.',
          '[matter-of-fact] And there is nothing else to add. From here it is only a question of how many, and how they are wired together.',
        ],
        camera: { position: [0, 12.5, 14.5], target: [0, 0, 0], fov: 38 },
        explode: 0,
        focus: null,
      },
    ],
  },

  {
    id: 'adder',
    scene: 'adder',
    marker: '05',
    title: 'Arithmetic',
    short: 'Adding',
    beats: [
      {
        id: 'halfadder',
        kicker: 'The half adder',
        heading: 'Two gates that can add',
        body: [
          'Feed the same two inputs into an XOR and an AND at once. The XOR gives you the sum bit. The AND gives you the carry.',
          'That is binary addition, complete, in two gates. Watch both outputs as the inputs cycle.',
        ],
        say: [
          {
            text: 'So let\'s actually build something with them.',
          },
          'Feed the same two inputs into an XOR and an AND at the same time. The XOR gives you the sum. The AND gives you the carry.',
          '[pause] And that is binary addition. Complete. In two gates.',
          'Watch both outputs as the inputs cycle through all four combinations.',
        ],
        camera: { position: [0, 10.5, 11.8], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'halfadder',
        truth: 'halfadder',
        labels: [
          { text: 'A', part: 'halfadder', offset: [-1.3, 0.8, -3.2], tone: 'cyan' },
          { text: 'B', part: 'halfadder', offset: [-1.1, 0.9, 3.3], tone: 'cyan' },
          { text: 'Sum', part: 'halfadder', offset: [2.8, 0.7, -2.9], tone: 'cyan' },
          { text: 'Carry', part: 'halfadder', offset: [2.8, 0.7, 2.9], tone: 'amber' },
        ],
      },
      {
        id: 'onePlusOne',
        kicker: '1 + 1',
        heading: 'Where the carry comes from',
        body: [
          'When both inputs are 1, the XOR goes dark and the AND lights up. The sum bit is 0 and the carry is 1.',
          'Written out, that is 1 + 1 = 10 in binary. The machine did not learn to count. Two gates disagreeing produced it.',
        ],
        say: [
          {
            text: 'Here\'s the moment I want you to catch. When both inputs are one, the XOR goes dark, and the AND lights up.',
          },
          'Sum is zero. Carry is one.',
          '[slowly] Written out, that is one plus one equals one-zero, in binary. [pause] Nothing here learned to count. Two gates disagreeing produced it.',
          {
            text: '[matter-of-fact] A full adder takes one more input, so it can accept a carry coming in as well as send one out. That costs three more gates.',
            voice: 'aside',
          },
        ],
        camera: { position: [4.4, 6.8, 8.2], target: [1.2, 0, 0.4], fov: 34 },
        explode: 0,
        focus: 'halfadder',
        truth: 'halfadder',
        aside: {
          label: 'Note',
          text: 'A full adder adds one more input so it can accept a carry coming in as well as send one out. That is three gates more.',
        },
      },
      {
        id: 'ripple',
        kicker: 'Carrying',
        heading: 'The carry has to travel',
        body: [
          'Chain adders together, one per bit, and each stage has to wait for the carry from the stage before it. The answer arrives one bit at a time, right to left, just as you carry on paper, rather than all at once.',
          'That wait is real time, and it is one of the reasons a wider number costs more than a narrower one. Most of chip design is refusing to wait for this.',
        ],
        say: [
          {
            text: 'Now chain them together. One adder per bit.',
          },
          'And here is the cost. Every stage has to wait for the carry from the stage before it. So the answer arrives one bit at a time, right to left, just like carrying on paper. Not all at once.',
          '[pause] That wait is real time. It is one of the reasons a wider number costs more than a narrower one.',
          '[reflective] And most of chip design, from here on, is one long argument about refusing to wait for this.',
        ],
        camera: { position: [0, 11.2, 25.8], target: [0, 0, 9], fov: 38 },
        explode: 0,
        focus: 'ripple',
      },
    ],
  },

  {
    id: 'fabric',
    scene: 'fabric',
    marker: '06',
    title: 'Ways to Arrange Switches',
    short: 'Units',
    beats: [
      {
        id: 'fpga',
        kicker: 'FPGA',
        heading: 'A chip you wire yourself',
        body: [
          'You just built an adder out of gates. This is the chip you would build it on. Every block here is a small lookup table that can be told to behave as any gate, and the channels between them are switches deciding what connects to what.',
          'You are not writing a program for it. You are describing a circuit, and the chip becomes that circuit. Watch the wiring: every few seconds it rearranges itself into a different machine.',
        ],
        say: [
          'You just built an adder out of gates. So this is the chip you would build it on.',
          {
            text: 'Every block here is a small lookup table that can be told to behave as any gate. And the channels between them are switches, deciding what connects to what.',
            zoom: 0.88,
          },
          '[matter-of-fact] Which means you are not writing a program for this. You are describing a circuit, and the chip becomes that circuit.',
          {
            text: 'Watch the wiring. Every few seconds it rearranges itself into a different machine.',
            zoom: 1,
          },
          {
            text: '[pause] And here is the trade, the first of five times you will see it. Configurable means slower and hungrier than fixed silicon doing the same job. You buy flexibility with efficiency.',
            voice: 'aside',
          },
        ],
        camera: { position: [0, 10.6, 5.6], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'fpga',
        labels: [
          { text: 'Lookup tables', part: 'fabric', offset: [1.5, 0.7, -2.4], tone: 'cyan' },
        ],
        aside: {
          label: 'The trade',
          text: 'Configurable means slower and hungrier than fixed silicon doing the same job. You buy flexibility with efficiency — and everything after this beat is someone deciding how much of it to sell back.',
        },
      },
      {
        id: 'asic',
        kicker: 'ASIC',
        heading: 'Now freeze the wiring',
        body: [
          'Stop letting the circuit change. Etch it into silicon exactly as drawn and you have an ASIC: blocks of different shapes in a fixed order, because the shapes are the specification. Data enters one end and leaves the other.',
          'Nothing here fetches an instruction, because there are no instructions. There is no scheduler, so nothing ever stalls. It is faster and cooler than the FPGA doing the identical job — and it can never do any other job as long as it exists.',
        ],
        say: [
          'So what happens if we stop letting it change?',
          'Etch the circuit into silicon exactly as drawn, and you have an ASIC. Blocks of different shapes in a fixed order, because the shapes ARE the specification. Data goes in one end, and comes out the other.',
          '[matter-of-fact] Nothing here fetches an instruction, because there are no instructions. There is no scheduler, so nothing ever stalls.',
          '[pause] It is faster and cooler than the FPGA doing the identical job. And it can never do any other job, for as long as it exists.',
          {
            text: '[reflective] You have met these, by the way. The chip decoding video in your television. The radio in your car key. A great deal of the silicon around you is fixed-function. General-purpose processors are only part of the story.',
            voice: 'aside',
          },
        ],
        camera: { position: [0, 10.6, 5.6], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'asic',
        /* All three sit in the middle third of the frame. The copy card owns the
           left, the chapter rail owns the right, and callouts placed at the ends
           of the pipeline landed under both. */
        labels: [
          { text: 'Fixed pipeline', part: 'fabric', offset: [0.3, 0.9, -1.3], tone: 'amber' },
          { text: 'Local memory', part: 'fabric', offset: [0.6, 0.6, 2.15], tone: 'violet' },
          { text: 'I/O edge', part: 'fabric', offset: [1.5, 0.5, -2.35], tone: 'plain' },
        ],
        aside: {
          label: 'Where you have met one',
          text: 'The chip that decodes video in your TV. The radio in your car key. A great deal of the silicon around you is fixed-function — general-purpose processors are only part of the story.',
        },
      },
      {
        id: 'cpu',
        kicker: 'CPU',
        heading: 'An ASIC whose one job is obeying a list',
        body: [
          'Here is the trick that gets universality back. Build fixed silicon, but make its one frozen job "read a list of instructions and do what they say". Now the list can be anything, and one piece of hardware can be every machine.',
          'It costs enormously. Most of this die is not arithmetic — it is cache, prediction and scheduling, all of it spent on keeping a handful of cores fed with a sequence nobody could predict in advance.',
        ],
        say: [
          'So how do we get universality back? [pause] Here is the trick.',
          'Build fixed silicon. But make its one frozen job THIS. Read a list of instructions, and do what they say. [pause] Suddenly the list can be anything. And one piece of hardware can be every machine.',
          '[matter-of-fact] It costs enormously. Most of this die is not arithmetic at all. It is cache, prediction and scheduling, all of it spent keeping a handful of cores fed with a sequence nobody could predict in advance.',
          {
            text: 'Watch the packets. See them pause, mid-trip? That is a stall. The core waiting on memory it could not predict it would need.',
            zoom: 0.85,
          },
          {
            text: '[reflective] The ASIC never does this. And never gets to run anything else.',
            voice: 'aside',
            zoom: 1,
          },
        ],
        camera: { position: [0, 10.6, 5.6], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'cpu',
        labels: [
          { text: 'Cores', part: 'fabric', offset: [1.3, 0.7, -2.4], tone: 'cyan' },
          { text: 'Cache', part: 'fabric', offset: [1.6, 0.6, 0.85], tone: 'plain' },
        ],
        aside: {
          label: 'Watch the motion',
          text: 'The packets pause mid-trip. That pause is a stall — the core waiting on memory it could not predict it would need. The ASIC never does this, and never gets to run anything else.',
        },
      },
      {
        id: 'gpu',
        kicker: 'GPU',
        heading: 'The same trick, a thousand lanes wide',
        body: [
          'Same area, spent differently. Hundreds of small cores replace a handful of large ones, and nearly all the logic that made the CPU clever is thrown away to pay for them.',
          'They move in lockstep, in groups: one instruction applied to every lane of a group at once (Nvidia\'s groups are 32 lanes wide). Each bar sweeping across is one group, and the groups keep their own time — that is what the machine does.',
        ],
        say: [
          'Now take the same silicon area, and spend it completely differently.',
          'Hundreds of small cores replace a handful of large ones. And nearly all the logic that made the processor clever gets thrown away to pay for them.',
          '[matter-of-fact] Because they move in lockstep, in groups. One instruction, applied to every lane of a group at once. On an Nvidia chip, a group is thirty-two lanes.',
          '[pause] Each bar sweeping across is one group. And the groups keep their own time, independently of each other. That IS what the machine does.',
          {
            text: '[reflective] And here is the catch. If the lanes need to do different things, they take turns. A graphics processor running branchy code can idle most of itself.',
            voice: 'aside',
          },
        ],
        camera: { position: [0, 10.6, 5.6], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'gpu',
        aside: {
          label: 'The catch',
          text: 'If the lanes need to do different things, they take turns. A GPU running branchy code can idle most of itself.',
        },
      },
      {
        id: 'tensor',
        kicker: 'GPU — tensor cores',
        heading: 'Weld a fixed unit into a programmable one',
        body: [
          'The bright tiles are tensor cores: fixed units that multiply a small matrix in one instruction, dropped in among ordinary lanes. Nvidia calls them tensor cores; Google calls its equivalent an MXU.',
          'This is a hedge, and an honest one. The chip around them is still a programmable GPU, so you get the matrix unit without giving up the ability to run anything else.',
        ],
        say: [
          {
            text: 'Now look at the bright tiles. Those are tensor cores.',
            zoom: 0.85,
          },
          'Fixed units that multiply a small matrix in a single instruction, dropped in among ordinary lanes. Nvidia calls them tensor cores. Google calls its version an M X U.',
          {
            text: '[matter-of-fact] And this is a hedge, an honest one. The chip around them is still a programmable graphics processor. So you get the matrix unit without giving up the ability to run anything else.',
            zoom: 1,
          },
        ],
        camera: { position: [0, 10.6, 5.6], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'tensor',
        labels: [
          { text: 'Tensor cores', part: 'fabric', offset: [1.3, 0.7, -2.5], tone: 'violet' },
          { text: 'Ordinary lanes', part: 'fabric', offset: [1.4, 0.6, 0.6], tone: 'cyan' },
        ],
      },
      {
        id: 'npu',
        kicker: 'NPU / TPU',
        heading: 'All the way back to fixed function',
        body: [
          'Remove the general-purpose part entirely, one more time. An NPU or TPU is an ASIC again — the same bargain as three beats ago, now struck for exactly one job: multiplying matrices.',
          'This is a systolic array. Weights are loaded in from one edge and then held in place; activations march in from the other, and every cell multiplies whatever arrives by the weight it holds and hands the result to its neighbour. Inside the array, nothing fetches and nothing decides.',
        ],
        say: [
          'And now we go all the way back. Take the general-purpose part out entirely.',
          'An N P U, or a T P U, is an ASIC again. The same bargain as three beats ago, struck for exactly one job. [pause] Multiplying matrices.',
          {
            text: 'This is a systolic array. Weights are loaded in from one edge, and then held in place. Activations march in from the other. And every cell multiplies whatever arrives by the weight it holds, and hands the result to its neighbour.',
            zoom: 0.85,
          },
          {
            text: '[matter-of-fact] Inside the array, nothing fetches. Nothing decides.',
            zoom: 1,
          },
          {
            text: '[reflective] And it is worth it. A T P U cannot run your operating system, and was never meant to. Give up everything else, and the same silicon area does one job on a fraction of the power.',
            voice: 'aside',
          },
        ],
        camera: { position: [0, 10.6, 5.6], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'npu',
        labels: [
          { text: 'Weights in', part: 'fabric', offset: [0.1, 0.7, -2.2], tone: 'violet' },
          { text: 'Activations in', part: 'fabric', offset: [-1.5, 0.7, 3.1], tone: 'cyan' },
        ],
        aside: {
          label: 'Why it is worth it',
          text: 'A TPU cannot run your operating system. It was never meant to. Give up everything else and the same silicon area does one job on a fraction of the power.',
        },
      },
      {
        id: 'spectrum',
        kicker: 'One trade, four times',
        heading: 'The same silicon, rearranged',
        body: [
          'Watch the die cycle. Nothing is being added or removed — the same area is retiled five ways, and every step along the line trades the ability to do anything for speed at one thing.',
          'FPGA: you wire it. ASIC: the wiring is frozen. CPU: the frozen job is obeying a list, and universality comes back at enormous cost. GPU: that trick, a thousand lanes wide. NPU: back to frozen, for one job.',
        ],
        say: [
          'So watch the die cycle one more time. And notice what is NOT happening.',
          'Nothing is being added. Nothing is being removed. The same area, retiled five ways. [pause] And every step along that line trades the ability to do anything, for speed at one thing.',
          '[matter-of-fact] FPGA, you wire it. ASIC, the wiring is frozen. CPU, the frozen job is obeying a list. GPU, that same trick, a thousand lanes wide. NPU, back to frozen, for one job.',
          '[reflective] Which leaves the question every machine has to answer. How much of, it could do anything, am I willing to sell? [pause] And what do I get back?',
          'Every chapter after this one is that same question, asked by a phone, a car, a robot, and an implant. [pause] But first, the thing this machine still cannot do. It decides. It does not yet remember.',
        ],
        // Pulled back and squared up: this beat is about the whole die changing,
        // not about any block on it.
        camera: { position: [0, 12.8, 6.6], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'cycle',
        aside: {
          label: 'The question every machine asks',
          text: 'How much of "it could do anything" am I willing to sell, and what do I get back? Every chapter after this one is that question asked by a phone, a car, a robot and an implant.',
        },
      },
    ],
  },
]

export const totalBeats = chapters.reduce((n, c) => n + c.beats.length, 0)
