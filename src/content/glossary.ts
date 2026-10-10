/**
 * What each piece of geometry actually is.
 *
 * The copy panel explains the *idea* of a beat; this explains the object under
 * the cursor. They are deliberately different registers — a reader who is
 * hovering has already stopped reading and started pointing, and wants a name
 * and one fact, not another paragraph.
 *
 * Keyed by `Part` id, so anything addressable by the focus system is also
 * addressable by the pointer.
 */
export type GlossaryEntry = {
  term: string
  /** One or two sentences. No jargon that is not glossed in the same breath. */
  line: string
  /** Optional hard number or comparison. Rendered in mono, below the line. */
  fact?: string
  tone?: 'cyan' | 'amber' | 'violet' | 'plain'
}

export const glossary: Record<string, GlossaryEntry> = {
  /* ---- the package ---- */
  ihs: {
    term: 'Integrated heat spreader',
    line: 'A nickel-plated copper lid. It does no computing — its whole job is to take heat out of a few very hot square centimetres and spread it over a surface big enough for a cooler to grab.',
    fact: 'Up to ~250 W through an area smaller than a stamp',
    tone: 'plain',
  },
  tim: {
    term: 'Thermal interface material',
    line: 'The paste or solder between die and lid. Two flat metal surfaces still touch only at a few high points, and trapped air is a superb insulator — this fills the gaps.',
    tone: 'plain',
  },
  die: {
    term: 'The die',
    line: 'A single crystal of silicon with billions of switches printed onto its surface in layers. This is the only part of the package that computes; everything else feeds it, wires it, or cools it.',
    tone: 'cyan',
  },
  substrate: {
    term: 'Substrate',
    line: 'The green fibreglass board under the die. A dense stack of copper layers that fans the die’s microscopic pads out to contacts big enough for a socket to touch.',
    tone: 'plain',
  },
  capacitors: {
    term: 'Decoupling capacitors',
    line: 'Tiny local reservoirs of charge. When a billion transistors switch at once the supply voltage would sag before the power supply could react, so these sit close and cover the first few nanoseconds.',
    tone: 'plain',
  },
  pads: {
    term: 'Contacts',
    line: 'Over a thousand on a modern chip. At least half of them are not signals at all — they carry power and ground.',
    fact: 'Roughly half the pins do nothing but deliver current',
    tone: 'amber',
  },
  socket: {
    term: 'Socket',
    line: 'A bed of spring contacts that presses against the chip’s pads. It has to make a thousand reliable connections with enough force to hold, and little enough to not crack the package.',
    tone: 'plain',
  },

  /* ---- the transistor ---- */
  gate: {
    term: 'Gate',
    line: 'The control terminal. It never touches the silicon beneath it — it works purely by the electric field it projects through a thin insulator.',
    tone: 'amber',
  },
  oxide: {
    term: 'Gate oxide',
    line: 'The insulating layer between gate and channel. Thin enough that the field passes straight through, thick enough that few electrons can. Since 2007 it has been hafnium oxide rather than plain glass, which at this thickness leaked too much.',
    fact: 'A nanometre or two — a handful of atoms',
    tone: 'plain',
  },
  source: {
    term: 'Source',
    line: 'Where the current comes from. One of the two terminals the channel connects when the switch is on.',
    tone: 'cyan',
  },
  drain: {
    term: 'Drain',
    line: 'Where the current goes. Separated from the source by silicon that does not normally conduct — that gap is the switch.',
    tone: 'cyan',
  },
  channel: {
    term: 'Channel',
    line: 'Not a physical structure. Put a voltage on the gate and its field drags electrons into a thin conducting layer here; remove it and the layer evaporates. That appearing and vanishing is the switch turning on and off.',
    tone: 'cyan',
  },
  bulk: {
    term: 'Silicon bulk',
    line: 'The body of the crystal the whole device is built into. Normally insulating between source and drain, which is exactly why the gate has something to switch.',
    tone: 'plain',
  },
  contacts: {
    term: 'Contacts',
    line: 'Metal plugs joining the transistor’s terminals up to the wiring layers above. A modern chip stacks a dozen or more such layers over the transistors.',
    tone: 'plain',
  },

  /* ---- logic ---- */
  not: {
    term: 'NOT gate',
    line: 'An inverter. One input, and it answers the opposite. The circle on the nose is the notation for “and then flip it”.',
    tone: 'cyan',
  },
  and: {
    term: 'AND gate',
    line: 'Answers 1 only when both inputs are 1. This is how a machine expresses a requirement: proceed only if this and that.',
    tone: 'cyan',
  },
  or: {
    term: 'OR gate',
    line: 'Answers 1 when at least one input is 1. Only stays dark when both are 0.',
    tone: 'cyan',
  },
  xor: {
    term: 'XOR gate',
    line: 'Answers 1 only when its inputs disagree. Two 1s cancel back to 0 — which is not a quirk, it is 1 + 1 = 0 carry the 1.',
    fact: 'Addition without the carry',
    tone: 'violet',
  },
  halfadder: {
    term: 'Half adder',
    line: 'An XOR and an AND fed the same two inputs. The XOR gives the sum bit, the AND catches the carry. Binary addition, complete, in two gates.',
    tone: 'cyan',
  },
  ripple: {
    term: 'Ripple-carry adder',
    line: 'One adder per bit, chained. Each stage has to wait for the carry from the stage before it, so the answer arrives one bit at a time, lowest bit first, rather than all at once.',
    fact: 'Most of chip design is refusing to wait for this',
    tone: 'amber',
  },

  /* ---- the board ---- */
  pcb: {
    term: 'Mainboard',
    line: 'Woven glass fibre in epoxy, with sheets of copper laminated between the layers. Close to half of those layers carry power and ground rather than signals.',
    fact: 'Often 8–12 layers, 1–1.5 mm thick',
    tone: 'plain',
  },
  soc: {
    term: 'Processor',
    line: 'The chip from Lecture 1, in its natural habitat. On a laptop the die is usually left bare so the cooler can press straight onto the silicon.',
    tone: 'cyan',
  },
  ram: {
    term: 'Memory',
    line: 'Working memory, placed as close to the processor as the layout allows. Its distance from the chip is a design constraint, not an accident of packaging.',
    tone: 'violet',
  },
  vrm: {
    term: 'Voltage regulators',
    line: 'Convert the battery’s twelve-ish volts down to the roughly one volt a core wants, at very high current. The metal cubes are inductors — bulky because storing energy in a magnetic field takes physical size.',
    fact: 'Built for 100 A or more at about 1 V, in a performance laptop',
    tone: 'amber',
  },
  ssd: {
    term: 'Storage',
    line: 'Flash memory and a controller. Reaches the processor over four lanes — sixteen wires — instead of the memory bus’s hundred-odd, and can sit right across the board because of it.',
    tone: 'plain',
  },
  wifi: {
    term: 'Radio',
    line: 'Under a metal shield can, because a radio has to be kept away from everything else on the board — and everything else kept away from it.',
    tone: 'violet',
  },
  ports: {
    term: 'Ports',
    line: 'The edge of the machine, where a person can reach. Most are slow by the standards of this board, and it rarely matters: they only have to keep up with whatever is plugged in.',
    tone: 'amber',
  },
  connectors: {
    term: 'Connectors',
    line: 'Where the display ribbon and the battery attach. Everything that is not on this board arrives through one of these.',
    tone: 'plain',
  },
  battery: {
    term: 'Battery',
    line: 'Three sealed pouches of lithium chemistry, taking up more volume than every computing part combined. Supplies eleven or twelve volts, and sags as it drains.',
    fact: 'The largest single object in the machine',
    tone: 'violet',
  },
  heatpipe: {
    term: 'Heat pipe',
    line: 'A sealed, nearly empty copper tube holding a little fluid. It boils at the hot end and condenses at the cold end, which moves heat far better than solid copper and has nothing that can wear out.',
    tone: 'amber',
  },
  fins: {
    term: 'Fin stack',
    line: 'Where the heat finally meets air. Thin plates because what matters is surface area, not metal.',
    tone: 'cyan',
  },
  cell: {
    term: 'Memory cell',
    line: 'One bit, held. The schematic changes with the beat — a loop of gates, six transistors, or one transistor and a capacitor — and the part count is the whole argument.',
    tone: 'cyan',
  },
  ladder: {
    term: 'The memory hierarchy',
    line: 'Every place a processor can go for a value, laid out so position is latency and block size is capacity. Close things are small; vast things are far.',
    fact: 'The axis is logarithmic',
    tone: 'violet',
  },

  pipeline: {
    term: 'The pipeline',
    line: 'Five stages, each working on a different instruction at the same time. Any one instruction still takes five ticks; the difference is that one finishes every tick instead of every fifth.',
    fact: 'Throughput, not latency',
    tone: 'cyan',
  },

  fab: {
    term: 'The wafer',
    line: 'One crystal of silicon, sliced and polished, carrying many copies of the same chip. They are printed together, tested together, and separated only at the end.',
    fact: 'A round wafer wastes its rim on partial dies',
    tone: 'cyan',
  },

  fan: {
    term: 'Fan',
    line: 'The only moving part on the board, and it exists solely because the box is closed. Fins alone would just warm the air around themselves and stop.',
    fact: 'A thinner fan moves less air, so the chip slows sooner',
    tone: 'amber',
  },
}

/**
 * Roles inside the architectures scene.
 *
 * That chapter is one instanced mesh rather than named parts — 256 blocks that
 * re-tile between architectures — so hovering resolves to what a block *is*
 * doing in the current layout, not to a fixed id.
 */
export const roleGlossary: Record<string, GlossaryEntry> = {
  core: {
    term: 'Core',
    line: 'A complete worker: it reads instructions and carries them out, independently of every other core on the die.',
    tone: 'cyan',
  },
  cache: {
    term: 'Cache',
    line: 'Memory built from the same silicon, kept close because distance costs time. A few dozen kilobytes beside each core, tens of megabytes shared.',
    tone: 'violet',
  },
  io: {
    term: 'I/O',
    line: 'The edge of the die, where signals leave for memory, other chips and the outside world.',
    tone: 'amber',
  },
  logic: {
    term: 'Lookup table',
    line: 'A configurable block that can be told to behave as any small gate. Change the configuration and the chip becomes a different circuit.',
    tone: 'plain',
  },
  mac: {
    term: 'Multiply–accumulate cell',
    line: 'Holds one weight, multiplies whatever arrives by it and hands the result to its neighbour. Nothing in the grid fetches or decides — data just flows through.',
    tone: 'violet',
  },
  mem: {
    term: 'Memory pool',
    line: 'Storage shared by everything on the die, so work does not have to be copied across a bus to move between units.',
    tone: 'violet',
  },
  /* ---- L17, the implant ---- */
  'implant:thread': {
    term: 'An electrode thread',
    line: 'Thinner than a hair, carrying many recording sites down its length. It listens to the voltage near a few neurons; everything else this chapter does is deciding what of that is worth sending.',
    tone: 'cyan',
  },
  'implant:soc': {
    term: 'The implanted chip',
    line: 'Amplifiers, digitisers and the processing, sealed for a lifetime with no way to change the battery. It computes inside the head because it cannot afford to send the raw signal out.',
    fact: '~25 mW, a large share of its whole heat allowance',
    tone: 'cyan',
  },
  'implant:skull': {
    term: 'The way out',
    line: 'The constriction. Far more signal arrives than can ever leave through it, which is why the computing has to happen on the inside — this is a bandwidth wall, not a wiring problem.',
    fact: '200 Mb/s in, about 1 Mb/s out',
    tone: 'amber',
  },
  'implant:draw': {
    term: 'What it is drawing',
    line: 'Power, which here is heat, which here is tissue temperature. It climbs with activity and is clamped rather than allowed to cross the line — a limit, not a target.',
    tone: 'violet',
  },
  'implant:cap': {
    term: 'The ceiling',
    line: 'The heat limit. The rule is written in temperature, not watts, so what it allows in milliwatts depends on the device and where it sits. Nothing above this line is a design decision; it is simply not allowed to happen.',
    fact: '≤2 °C above body temperature; ~1 °C in practice',
    tone: 'amber',
  },

  /* ---- L16, the extremes ---- */
  'extremes:unit': {
    term: 'A processing unit',
    line: 'One module, alone, with nobody within fifty million kilometres who could reset it. Everything about this chapter follows from there being no engineer.',
    tone: 'plain',
  },
  'extremes:bit': {
    term: 'A memory cell',
    line: 'One stored bit. Nothing is wrong with the silicon holding it — a particle deposited enough charge to flip the value, and the value is simply now the other one.',
    fact: 'Soft: the cell still works, the number does not',
    tone: 'cyan',
  },
  'extremes:neuron': {
    term: 'A neuron',
    line: 'Same cell, no clock. It does nothing at all until something arrives, and it is dark the rest of the time — which is the whole of the efficiency claim.',
    fact: 'Event-driven: no tick, no work',
    tone: 'violet',
  },
  'extremes:qubit': {
    term: 'A qubit',
    line: 'Not yet either value, and the picture’s weakest metaphor — which is why the beat rests on what happens when you look at it rather than on this.',
    fact: 'Definite only once measured',
    tone: 'violet',
  },
  'extremes:voter': {
    term: 'The voter',
    line: 'Three units compute the same thing and this takes the majority answer. It flashes at the moment of an overruling — each flash is one error that never reached the rest of the machine.',
    fact: 'Two out of three wins',
    tone: 'cyan',
  },
  'extremes:particle': {
    term: 'A particle strike',
    line: 'A heavy ion through the die. On Earth the atmosphere stops almost all of these; in orbit nothing does, and the damage arrives at a rate you design around rather than hope against.',
    tone: 'amber',
  },

  /* ---- L15, the datacentre ---- */
  'dc:hall': {
    term: 'The hall',
    line: 'The unit of construction at this scale is not the machine, it is the room — and the room is designed around getting power in and heat out, not around the computers.',
    tone: 'plain',
  },
  'dc:node': {
    term: 'A node',
    line: 'One server: the board from Lecture 5, in a chassis, with no screen and no keyboard. Everything else in this chapter is what happens when you need more than one.',
    tone: 'cyan',
  },
  'dc:peer': {
    term: 'Another node',
    line: 'Identical to the first, and that is the point. Scale here is repetition rather than a bigger machine — which is why the interesting problem moves to the wires between them.',
    fact: 'Identical, replaceable, and expected to fail',
    tone: 'cyan',
  },
  'dc:compute': {
    term: 'Power that computes',
    line: 'The share of the room’s electricity that actually reaches the computers — processors, memory, storage and network. This is the only part anybody wanted to buy.',
    tone: 'cyan',
  },
  'dc:overhead': {
    term: 'Everything else',
    line: 'Cooling, conversion losses, distribution, lighting. In an ordinary machine room this is a third of the bill before a single instruction has run.',
    fact: 'PUE 1.6 → 37% overhead; 1.1 → 9%',
    tone: 'amber',
  },

  /* ---- L14, the robot ---- */
  'robot:bench': {
    term: 'One frame, two clocks',
    line: 'Both loops are drawn at their true relative rates. Everything the chapter argues is visible in the gap between them.',
    tone: 'plain',
  },
  'robot:control': {
    term: 'The control loop',
    line: 'Read the sensors, work out a correction, drive the motors — a thousand times a second. It is not clever and it must never be late.',
    fact: '1 kHz · every millisecond',
    tone: 'cyan',
  },
  'robot:controlwork': {
    term: 'One control cycle',
    line: 'A single pass round the fast loop. It has a millisecond to finish, and finishing early buys nothing — this is a schedule, not a race.',
    tone: 'cyan',
  },
  'robot:perception': {
    term: 'The perception loop',
    line: 'Look at the world and work out what is in it. Thousands of times more computation per pass, and it runs at a fraction of the rate — which is exactly why it cannot be allowed to hold up the fast loop.',
    fact: '~30 Hz · thirty times a second',
    tone: 'violet',
  },
  'robot:perceptionwork': {
    term: 'One perception pass',
    line: 'A camera frame turned into a belief about the world. It can afford to be late in a way the control loop cannot, because the machine already knows how to keep itself upright without it.',
    tone: 'violet',
  },
  'robot:work': {
    term: 'The work in this cycle',
    line: 'How much of the period this pass has used. On a normal pass it stops short and waits; on a late one it is still growing when it crosses the mark.',
    tone: 'plain',
  },
  'robot:deadline': {
    term: 'The deadline',
    line: 'When the cycle must be finished. Crossing it is not slowness — the correction arrives for a world that has already moved, and the machine acts on a past that is no longer true.',
    fact: 'A missed deadline is a wrong answer, not a slow one',
    tone: 'amber',
  },
  'robot:joint': {
    term: 'The joint',
    line: 'Where all of this arrives: a motor, and a number telling it what to do next. Everything upstream exists to produce that number on time.',
    tone: 'plain',
  },
  'robot:arm': {
    term: 'The arm',
    line: 'The part with mass and momentum. It is the reason the deadlines are hard — physics does not wait for a late thread, and a limb that acts on stale information is already in the wrong place.',
    tone: 'plain',
  },

  /* ---- L13, the car ---- (the units name themselves from the priority table) */
  'car:body': {
    term: 'The vehicle',
    line: 'Not one computer but a network of them, wired together and expected to agree. The interesting engineering here is almost all about the wiring and the agreeing.',
    tone: 'plain',
  },
  'car:lead': {
    term: 'Lockstep core',
    line: 'One of two cores executing the identical instruction stream on the identical data, cycle for cycle. It is not doing half the work — it is doing all of it, twice.',
    tone: 'cyan',
  },
  'car:shadow': {
    term: 'The checker core',
    line: 'The second copy. It computes nothing new, and buys nothing but certainty: for a fault to pass unnoticed it now has to corrupt both copies in exactly the same way.',
    fact: 'Twice the silicon, none of the throughput',
    tone: 'cyan',
  },
  'car:comparator': {
    term: 'The comparator',
    line: 'Watches both cores every cycle. Green while they agree; the instant they do not it raises a fault — and note what it does *not* know: which of the two was right.',
    fact: 'Detects, cannot correct',
    tone: 'amber',
  },

  /* ---- L12, the edge ---- */
  'edge:die': {
    term: 'The microcontroller',
    line: 'A whole computer on one small die — processor, memory, storage and peripherals — costing well under a dollar. There are far more of these in the world than there are of anything else in this course.',
    fact: 'Tens of billions shipped a year',
    tone: 'cyan',
  },
  'edge:core': {
    term: 'The core',
    line: 'A few tens of megahertz, usually no cache, little or no branch prediction, and often no operating system. It is asleep almost all the time, and that is the design working rather than the design failing.',
    fact: 'Awake for a fraction of a percent of its life',
    tone: 'cyan',
  },
  'edge:flash': {
    term: 'Flash',
    line: 'The program, usually stored on the same chip. There is no disk to load from and nothing to boot — at reset the processor simply starts executing out of here.',
    tone: 'violet',
  },
  'edge:sram': {
    term: 'SRAM',
    line: 'All the memory there is, and it is measured in kilobytes. Every buffer the program will ever have is decided when it is written, because there is nothing to allocate from.',
    fact: 'Kilobytes, not gigabytes',
    tone: 'violet',
  },
  'edge:timer': {
    term: 'The timer',
    line: 'The only thing still running while the rest of the chip is off. Everything else is dark and drawing nanoamps; this counts, and eventually wakes them.',
    fact: 'The one block that never sleeps',
    tone: 'amber',
  },
  'edge:radio': {
    term: 'The radio',
    line: 'By far the most expensive thing this device does. Sending a packet costs orders of magnitude more energy than computing the number in it, which is why so much of the work happens here rather than in a datacentre.',
    fact: 'Transmitting dwarfs computing',
    tone: 'amber',
  },
  'edge:sensor': {
    term: 'The sensor',
    line: 'Why the device exists. Everything else on the die is in service of reading this occasionally and deciding whether the answer is worth telling anyone about.',
    tone: 'plain',
  },
  'edge:duty': {
    term: 'The duty cycle',
    line: 'One period of the device’s life, lit where it is awake. The dark stretch is not the device waiting to be useful — it *is* the design, and it is what makes a coin cell last a decade.',
    fact: 'Awake under 1% of the time',
    tone: 'cyan',
  },

  /* ---- L11, the phone ---- */
  'phone:die': {
    term: 'The SoC',
    line: 'Everything from Lecture 5’s board, minus the sockets, the slots and the fan, gathered into one package because there is no room for anything else — most of it on one piece of silicon, with the memory stacked on top.',
    fact: 'One package instead of a board',
    tone: 'cyan',
  },
  'phone:prime': {
    term: 'Prime core',
    line: 'The big core. Fast, wide, and expensive to run — it exists for the half-second after you touch the screen, and it is a liability every other second.',
    fact: 'Fastest, and the first thing to be turned off',
    tone: 'cyan',
  },
  'phone:little': {
    term: 'Efficiency core',
    line: 'A smaller, slower core that does the same work for a fraction of the energy. Almost everything a phone does all day runs here and never wakes the big ones at all.',
    fact: 'Same instruction set, different bargain',
    tone: 'cyan',
  },
  'phone:gpu': {
    term: 'GPU',
    line: 'Thousands of lanes stepping together. It draws the screen, and on this die it is one of the largest single things competing for the same few watts as everything else.',
    tone: 'violet',
  },
  'phone:npu': {
    term: 'Neural engine',
    line: 'Fixed-function multiply–accumulate, built for one shape of arithmetic. It cannot be told to do anything else, and in exchange it does that job on a fraction of the power a core would need.',
    tone: 'violet',
  },
  'phone:isp': {
    term: 'Image signal processor',
    line: 'The block between the camera sensor and the photograph. Most of what makes a phone camera good happens here, in silicon, not in the lens.',
    tone: 'plain',
  },
  'phone:modem': {
    term: 'Modem',
    line: 'The radio. It has its own processors and its own firmware, and it is doing work whenever the phone is on a network — including while the screen is off and everything else is dark.',
    tone: 'amber',
  },
  'phone:mem': {
    term: 'Memory interface',
    line: 'The path to DRAM, which on a phone is usually stacked directly on top of this package. Short, wide, and shared by every block on the die.',
    tone: 'violet',
  },
  'phone:heat': {
    term: 'Case temperature',
    line: 'What the outside of the phone is doing, not what the silicon can take. The chip would happily run hotter; the hand holding it is the constraint.',
    tone: 'amber',
  },
  'phone:sustained': {
    term: 'What it can shed',
    line: 'The power a sealed slab with no fan can lose continuously. Everything to the right of this line is borrowed against the phone’s own thermal mass and has to be paid back.',
    fact: 'Very roughly 3–5 W, whatever the processor',
    tone: 'plain',
  },
  'phone:toohot': {
    term: 'Too hot to hold',
    line: 'Where the clock comes down whether the work is finished or not. A phone’s peak numbers are all sprints; this line is why none of them are sustainable.',
    tone: 'amber',
  },

  /* ---- L10, source to current ---- */
  'code:source': {
    term: 'One statement',
    line: 'A line of source. It is the only level here written for a human, and the only level at which anything on screen knows what the program was *for*.',
    fact: '1 line',
    tone: 'cyan',
  },
  'code:asm': {
    term: 'An instruction',
    line: 'One of the operations the processor actually has. The statement above became nine of them, and not one of them knows about the other eight.',
    fact: '9 instructions per statement, here',
    tone: 'violet',
  },
  'code:bytes': {
    term: 'A byte of machine code',
    line: 'The instruction as it is stored: a number. Nothing distinguishes it from a byte of anything else except where the processor was told to look.',
    fact: '9 instructions × 4 bytes = 36',
    tone: 'amber',
  },
  'code:bits': {
    term: 'A bit',
    line: 'The bottom. A voltage on a wire, high or low, switched by the transistor from the first lecture — and this is the entire content of the statement you started with.',
    fact: '36 bytes = 288 bits',
    tone: 'plain',
  },

  /* ---- L7, boot ---- */
  'boot:rail': {
    term: 'The supply rail',
    line: 'Voltage coming up, and nothing else may happen until it has. A processor fed a rising supply does not run slowly — it runs wrongly, which is why the logic is held in reset until this is steady.',
    fact: 'The first thing that has to be true',
    tone: 'amber',
  },
  'boot:reset': {
    term: 'Reset',
    line: 'Every register forced to a known value, so the machine starts from a state somebody chose rather than from whatever the silicon happened to power up holding.',
    tone: 'plain',
  },
  'boot:firmware': {
    term: 'Firmware',
    line: 'On a classic PC, the first code that runs, and it is already on the board — the processor comes out of reset fetching from a fixed address, so something has to be there before any disk exists.',
    fact: 'A chip on the board, not a file on a drive',
    tone: 'cyan',
  },
  'boot:post': {
    term: 'Self-test',
    line: 'Firmware checking that there is memory, that it answers, and that the parts it expects are present. Everything after this point assumes the machine works.',
    tone: 'plain',
  },
  'boot:find': {
    term: 'Finding a disk',
    line: 'Enumerating what is attached and deciding which of it might be bootable. This is the step that turns a pile of hardware into a list of choices.',
    tone: 'plain',
  },
  'boot:loader': {
    term: 'The bootloader',
    line: 'A small program whose only job is to load a bigger one. It exists because firmware knows about disks and partitions, and knows nothing at all about operating systems.',
    tone: 'violet',
  },
  'boot:kernel': {
    term: 'The kernel',
    line: 'The last handoff. From here the machine is running the arrangement of Lecture 8 — a wall, and everything else outside it — and nothing hands control back.',
    fact: 'Boot is the one thing in this course that ends',
    tone: 'cyan',
  },
  'boot:wall': {
    term: 'The wall going up',
    line: 'The first thing a kernel does is put a boundary between itself and everything else. Deliberately the same shape as the kernel chapter, because it is the same wall.',
    tone: 'cyan',
  },

  /* ---- L8/L9, the kernel ---- */
  'kernel:space': {
    term: 'Kernel space',
    line: 'The ground inside the wall, where code can touch the hardware directly. Nothing outside gets in here by walking — it has to ask, at a gate, and be checked.',
    tone: 'cyan',
  },
  'kernel:wall': {
    term: 'The wall',
    line: 'A boundary the processor itself enforces, not one the programs agree to respect. That distinction is the whole subject: a rule a program could choose to ignore is not protection.',
    fact: 'Enforced in silicon, not in software',
    tone: 'amber',
  },
  'kernel:gate': {
    term: 'A system call',
    line: 'The only way through. A program stops, hands over what it wants, and the kernel decides — every file read, every packet sent, every byte of memory asked for comes through a gate like this one.',
    fact: 'The crossing itself costs, which is why chapters later count them',
    tone: 'amber',
  },
  'kernel:core': {
    term: 'The core',
    line: 'One processor, and only one program can be running on it at a time. Everything the scheduler does exists because this is a single seat and there are always more programs than seats.',
    tone: 'cyan',
  },
  'kernel:process': {
    term: 'A process',
    line: 'A running program, outside the wall, unable to reach anything directly. It is lit while it has a request in flight — most of the time, for most programs, it is simply waiting.',
    fact: 'Waiting is the normal state',
    tone: 'violet',
  },
  'kernel:service': {
    term: 'A kernel service',
    line: 'A filesystem, a network stack, a driver. Which side of the wall it sits on is the argument between a monolithic kernel and a microkernel — same code, different address space.',
    tone: 'violet',
  },
  'kernel:boundary': {
    term: 'Its own boundary',
    line: 'Outside the wall each service gets a boundary of its own. That is exactly what makes a crash survivable and exactly what makes every request to it cost another crossing.',
    fact: 'Safety and crossings are the same trade',
    tone: 'amber',
  },
  'kernel:period': {
    term: 'The period',
    line: 'How often the real-time task has to run. Miss one and the machine has not slowed down — it has failed, which is a different kind of wrong from being slow.',
    tone: 'plain',
  },
  'kernel:deadline': {
    term: 'The deadline',
    line: 'The line the work has to be finished before. A general-purpose scheduler is judged on averages; this one is judged on its worst case, and only the worst case.',
    fact: 'Late is wrong, not slow',
    tone: 'amber',
  },
  'kernel:task': {
    term: 'The real-time task',
    line: 'The one piece of work with a hard time bound. Everything else on the machine can be made to wait for it — that is what "real-time" buys and what it costs.',
    tone: 'cyan',
  },

  /* ---- L4, the wafer ---- */
  'fab:wafer': {
    term: 'The wafer',
    line: 'One crystal of silicon, sliced and polished flat to within a few atoms. Every chip on it is printed at the same time, tested at the same time, and separated only at the very end.',
    fact: '300 mm across, and about as flat as anything humans make',
    tone: 'cyan',
  },
  'fab:flat': {
    term: 'The flat',
    line: 'A notch or a straight edge ground into the disc so the crystal’s orientation is known and a machine can tell which way round the wafer is.',
    tone: 'plain',
  },
  'fab:die': {
    term: 'A die',
    line: 'One chip, still attached to its neighbours. Nothing distinguishes it from the one beside it yet — that happens at test, after everything has been printed.',
    tone: 'plain',
  },
  'fab:edge': {
    term: 'An edge die',
    line: 'Part of a chip, cut off by the round rim. It is printed along with everything else, so the processing stays even right to the edge, but it can never become a working chip.',
    fact: 'A round wafer wastes its rim',
    tone: 'plain',
  },
  'fab:good': {
    term: 'A working die',
    line: 'Passed test. It is only known to be good after the whole wafer has been printed, which is why yield is measured at the end and paid for at the beginning.',
    tone: 'cyan',
  },
  'fab:dead': {
    term: 'A dead die',
    line: 'One defect in the wrong place is enough. It cost exactly as much to make as the ones beside it, and that is the entire economics of this chapter: you pay per wafer and sell per die.',
    fact: 'Bigger dies catch more defects — area is the risk',
    tone: 'amber',
  },
  'fab:bin': {
    term: 'A binned die',
    line: 'The same design, sorted by what it turned out to be able to do. Chips that clock lower or have a bad core are sold as a lesser model rather than thrown away.',
    fact: 'Most product lines are one design, graded',
    tone: 'violet',
  },
  'fab:mask': {
    term: 'The mask',
    line: 'A stencil carrying the pattern for an entire field at once. Lithography does not draw — a slit of light sweeps across the mask and copies every feature in one pass, and then the machine does it again somewhere else.',
    tone: 'cyan',
  },
  'fab:beam': {
    term: 'The exposure',
    line: 'Light through the mask, focused down onto resist. One sweep of a narrow slit prints every feature in the field in a single pass, which is why a chip with billions of transistors takes no longer to expose than one with a thousand.',
    tone: 'cyan',
  },
  'fab:spot': {
    term: 'The light’s spot',
    line: 'Drawn to scale against the features underneath. At 193 nm it covers several of them at once and cannot tell them apart; at 13.5 nm it sits inside one.',
    fact: '193 nm → 13.5 nm is a fourteen-fold cut',
    tone: 'violet',
  },
  'fab:device': {
    term: 'The device layers',
    line: 'The transistors themselves, at the very bottom. Everything above them is wiring — this is the only part of the stack that switches.',
    tone: 'cyan',
  },
  'fab:metal': {
    term: 'A metal layer',
    line: 'Wiring. A modern chip has more than a dozen of these stacked above the transistors, each aligned to the last within a nanometre or two, and most of the printing is spent on them rather than on the switches.',
    fact: 'More layers of wiring than of device',
    tone: 'amber',
  },

  /* ---- L3, the pipeline ---- */
  'pipeline:fetch': {
    term: 'Fetch',
    line: 'Go and get the next instruction from memory. It is an address, a request, and a wait — which is why the first thing every processor grows is a cache in front of this stage.',
    tone: 'cyan',
  },
  'pipeline:decode': {
    term: 'Decode',
    line: 'Work out what the instruction actually says: which operation, which registers, which constant. On a big processor this stage alone is several stages.',
    tone: 'cyan',
  },
  'pipeline:execute': {
    term: 'Execute',
    line: 'The arithmetic. This is the adder from the last chapter, and on most instructions it is the only stage doing anything you would call computing.',
    tone: 'cyan',
  },
  'pipeline:memory': {
    term: 'Memory',
    line: 'Loads and stores talk to the outside here. Everything else walks through the stage doing nothing, because a pipeline moves in lockstep and cannot let one instruction skip ahead.',
    tone: 'violet',
  },
  'pipeline:writeback': {
    term: 'Write back',
    line: 'Put the answer in a register. Until this happens the result does not exist as far as the next instruction is concerned — which is exactly what a hazard is about.',
    tone: 'cyan',
  },
  'pipeline:clock': {
    term: 'The clock',
    line: 'The metronome every stage moves on. It is deliberately a snap rather than a swell: nothing in the machine happens gradually, it happens on an edge.',
    fact: 'One edge, everything advances at once',
    tone: 'amber',
  },
  'pipeline:instruction': {
    term: 'An instruction',
    line: 'One instruction, occupying one stage. It still takes five ticks to get all the way through — the pipeline does not make any single one faster, it just stops the other four stages standing idle.',
    fact: 'Throughput, not latency',
    tone: 'cyan',
  },
  'pipeline:bar': {
    term: 'Power at this clock',
    line: 'Switching power climbs faster than frequency does, because going faster also needs more voltage and the voltage term is squared. Doubling the clock costs far more than double.',
    tone: 'plain',
  },
  'pipeline:overbudget': {
    term: 'Past the budget',
    line: 'A clock speed that works in silicon and not in a box. The chip would be fine; the heat has nowhere to go.',
    fact: 'This is why processors stopped getting faster and started getting wider',
    tone: 'amber',
  },
  'pipeline:limit': {
    term: 'The cooling budget',
    line: 'What a real cooler can actually carry away. Everything above this line is a processor nobody can ship, however well it simulates.',
    tone: 'amber',
  },

  /* ---- L2, the ladder ---- (the tiers themselves name themselves, from the
     same table the scene is laid out from — see `TIER_ENTRIES`) */
  'ladder:core': {
    term: 'The core',
    line: 'Everything on this axis is measured as a walk from here. While a request is out the core has nothing to do — which is why it goes dark on the beats about the far tiers and stays lit on the near ones.',
    fact: 'Waiting is the default, not the exception',
    tone: 'cyan',
  },
  'ladder:gpu': {
    term: 'The second processor',
    line: 'A GPU, or any other engine sharing the same pool. It reaches main memory directly rather than being handed a copy, which is the step this beat deletes.',
    fact: 'No copy means no copy to wait for',
    tone: 'violet',
  },
  'ladder:stack': {
    term: 'Stacked memory',
    line: 'The same DRAM, built upward and set right beside the processor. The short wires let a thousand of them run side by side, so stacking buys width; a single trip takes as long as ever.',
    fact: 'A wider road, not a shorter one',
    tone: 'violet',
  },
  'ladder:wear': {
    term: 'Worn-out cells',
    line: 'Flash wears out as it is written, and these are gone for good. Nothing else in this lecture degrades — memory forgets, but storage dies.',
    fact: 'The count only ever goes up',
    tone: 'amber',
  },

  /* ---- L2, one bit held four ways ---- */
  'cell:nor': {
    term: 'NOR gate',
    line: 'An OR with the answer flipped: it outputs 1 only when both inputs are 0. Two of them, each feeding the other’s input, is the smallest circuit that can remember anything.',
    fact: 'The bubble on the nose is the “and then flip it”',
    tone: 'cyan',
  },
  'cell:and': {
    term: 'AND gate',
    line: 'Passes a 1 only when both inputs are 1. In a flip-flop it is the gate that decides whether the clock is letting anything through right now.',
    tone: 'plain',
  },
  'cell:or': {
    term: 'OR gate',
    line: 'Outputs 1 if either input is 1. Paired with its twin and wired back to back, it is half of the loop that holds the stored bit.',
    tone: 'plain',
  },
  'cell:transistor': {
    term: 'Transistor',
    line: 'One switch of the six that make an SRAM cell. Four hold the bit in a loop that fights to stay where it is; the cost of that stability is counted here, in parts.',
    fact: 'Six transistors per bit',
    tone: 'cyan',
  },
  'cell:access': {
    term: 'Access transistor',
    line: 'The gate onto the bit line. It opens only while this row’s word line is asserted, which is the only window in which the cell can be read or written at all.',
    tone: 'amber',
  },
  'cell:capacitor': {
    term: 'Storage capacitor',
    line: 'A bucket of charge, and the entire memory of a DRAM cell. Charge leaks away, so the value has to be read and written back about thirty times a second just to survive.',
    fact: 'Every cell, every 32 ms in DDR5',
    tone: 'violet',
  },
  'cell:sramcell': {
    term: 'SRAM cell',
    line: 'Six transistors holding one bit. Fast, needs no refreshing, and takes this much silicon — which is why you get megabytes of it and not gigabytes.',
    fact: 'Drawn at its real pitch against the DRAM beside it',
    tone: 'cyan',
  },
  'cell:dramcell': {
    term: 'DRAM cell',
    line: 'One transistor and one capacitor holding one bit. Slower and forgetful, and small enough that the same square of silicon holds many times more of them.',
    fact: 'Nine of these to one SRAM cell, in the same area',
    tone: 'violet',
  },

  fixed: {
    term: 'Fixed-function block',
    line: 'A circuit built to do exactly one job, wired that way at the factory. It cannot be told to do anything else, and in exchange it does that job faster and on less power than any programmable unit could.',
    fact: 'The shapes are the specification',
    tone: 'amber',
  },
}
