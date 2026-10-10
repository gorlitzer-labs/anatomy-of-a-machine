/**
 * The words in the copy that need a definition.
 *
 * `glossary.ts` names the object under the pointer; this defines the word
 * under the eye. Different registers, same voice: a reader who stops on
 * "lockstep" wants one plain sentence and to carry on, not a paragraph.
 *
 * Matched automatically against beat copy, so no body string carries markup
 * and adding a term here underlines it everywhere it appears. `forms` are the
 * exact, case-sensitive spellings the copy uses — "OR" the gate, never "or"
 * the word — and each term is underlined once per chapter, where the reader
 * first meets it: "core" dotted on every card of the chip lecture, including
 * the card that explains cores, reads as a warning rather than an offer.
 */
export type JargonEntry = {
  term: string
  /** Exact surface spellings, case-sensitive, as they appear in the copy. */
  forms: string[]
  /** One or two sentences, no jargon that is not glossed in the same breath. */
  line: string
  /**
   * Only underline it in these lectures. For words the course uses in more
   * than one sense — "gate" is a transistor terminal in the chip lecture and a
   * metaphor in the kernel one — a definition in the wrong lecture is worse
   * than none.
   */
  lectures?: string[]
}

export const jargon: Record<string, JargonEntry> = {
  activations: {
    term: 'Activations',
    forms: ['activations'],
    line: 'The values flowing through a neural network as it works: the input data, and each layer’s intermediate results on the way to the answer.',
  },
  address: {
    term: 'Address',
    forms: ['address', 'addresses'],
    line: 'A number naming one location in memory, like a house number. Programs read and write memory by giving addresses.',
  },
  'address-translation': {
    term: 'Address translation',
    forms: ['address translation'],
    line: 'Hardware rewriting every address a program uses into a real memory location, so each program gets its own private map of memory.',
  },
  amp: {
    term: 'Amp',
    forms: ['amps', 'amp', 'milliamps', 'microamps', 'microamp'],
    line: 'The unit of electric current. A milliamp is a thousandth of one and a microamp a millionth — the scale a sleeping sensor lives at.',
  },
  analogue: {
    term: 'Analogue',
    forms: ['analogue'],
    line: 'Continuous, like a dial rather than a counter: a voltage that can take any value, not just high or low.',
  },
  'and-gate': {
    term: 'AND gate',
    forms: ['AND'],
    line: 'Answers 1 only when both inputs are 1. This is how a machine expresses a requirement: proceed only if this and that.',
  },
  asic: {
    term: 'ASIC (application-specific integrated circuit)',
    forms: ['ASIC'],
    line: 'A chip designed to do one particular job, its circuit fixed at the factory. Faster and more efficient than anything programmable, but it can never be changed.',
  },
  bandwidth: {
    term: 'Bandwidth',
    forms: ['bandwidth'],
    line: 'How much data a connection can carry each second. Think of a road’s width, not its speed limit: it says nothing about how long each trip takes.',
  },
  binary: {
    term: 'Binary',
    forms: ['binary'],
    line: 'Counting with only two digits, 0 and 1. Each position is worth twice the one to its right, so 10 in binary means two.',
  },
  bit: {
    term: 'Bit',
    forms: ['bit', 'bits'],
    line: 'A single binary digit: one 0 or one 1. The smallest unit of information, and physically just a voltage that is either high or low.',
  },
  'bit-lines': {
    term: 'Bit lines',
    forms: ['bit lines'],
    line: 'The wires running along a column of memory cells, carrying a bit into or out of whichever cell in that column is selected.',
  },
  bootloader: {
    term: 'Bootloader',
    forms: ['bootloader', 'loader'],
    line: 'A small program whose only job is to load the operating system’s kernel into memory and start it running.',
  },
  branch: {
    term: 'Branch',
    forms: ['branch', 'branchy', 'conditional jump'],
    line: 'A point where a program chooses what to do next — an “if”. The processor cannot know which instructions come after it until the condition is worked out.',
  },
  'branch-prediction': {
    term: 'Branch prediction',
    forms: ['branch prediction', 'prediction', 'predictors'],
    line: 'The processor guessing which way an upcoming decision in the program will go, so it can carry on working instead of waiting to find out. Modern predictors are usually right.',
  },
  bsd: {
    term: 'BSD',
    forms: ['BSD'],
    line: 'A Unix operating system from the University of California, Berkeley, developed from the late 1970s. Much of it lives on inside macOS.',
  },
  bus: {
    term: 'Bus',
    forms: ['bus', 'buses'],
    line: 'A shared set of wires that several parts use to send data to one another, rather than every part having its own wire to every other.',
  },
  cache: {
    term: 'Cache',
    forms: ['cache', 'caches'],
    line: 'A small, fast memory built into the chip beside the cores, holding copies of recently used data so the core rarely has to make the long trip to main memory.',
  },
  capacitance: {
    term: 'Capacitance',
    forms: ['capacitance'],
    line: 'How much charge a wire or transistor must be filled with before its voltage changes. Filling and emptying it on every switch is what costs a chip its power.',
  },
  capacitor: {
    term: 'Capacitor',
    forms: ['capacitor', 'capacitors'],
    line: 'A component that stores a small amount of electric charge, like a tiny bucket, and can release it far faster than a battery can.',
  },
  chiplets: {
    term: 'Chiplets',
    forms: ['chiplets'],
    line: 'Several small dies packaged together to act as one large chip. A small die is far less likely to catch a defect, so fewer are thrown away.',
  },
  clock: {
    term: 'Clock',
    forms: ['clock', 'clocks', 'clocked'],
    line: 'A signal that flips on and off at a fixed rate, billions of times a second. Every part of the chip moves one step on each tick, so everything stays in order.',
  },
  'clock-cycle': {
    term: 'Clock cycle',
    forms: ['cycles'],
    line: 'One tick of the processor’s clock. At four gigahertz a cycle lasts a quarter of a nanosecond, and a core does roughly one step of work in each.',
  },
  'clock-edge': {
    term: 'Clock edge',
    forms: ['clock edge'],
    line: 'The instant the clock signal switches. Flip-flops take their new values on it, so every change in the machine happens on the edge rather than in between.',
  },
  compiler: {
    term: 'Compiler',
    forms: ['compiler', 'compiled'],
    line: 'The program that translates what a person wrote into the processor’s own instructions — and picks, among many correct translations, a fast one.',
  },
  'complementary-transistors': {
    term: 'Complementary transistors',
    forms: ['complementary transistors'],
    line: 'A matched pair of transistors of opposite types: when one switches on, the other switches off. Chips are built from such pairs because it wastes very little power.',
  },
  contention: {
    term: 'Contention',
    forms: ['contention', 'contended'],
    line: 'Several parties wanting the same thing — a wire, a processor — at the same moment. Something has to decide who goes first.',
  },
  'control-loop': {
    term: 'Control loop',
    forms: ['control loop'],
    line: 'A cycle that measures something, compares it with what it should be and adjusts — over and over, many times a second.',
  },
  converter: {
    term: 'Analogue-to-digital converter',
    forms: ['converter'],
    line: 'A circuit that measures a voltage and turns it into a number the processor can use. Every sensor reading passes through one.',
  },
  core: {
    term: 'Core',
    forms: ['core', 'cores'],
    line: 'A complete processor within the chip: it reads instructions and carries them out independently of the others. Eight cores can run eight things at genuinely the same moment.',
    lectures: ['chip', 'memory', 'time', 'kernel', 'phone', 'robot', 'datacenter'],
  },
  cpu: {
    term: 'CPU (central processing unit)',
    forms: ['CPU'],
    line: 'The general-purpose processor: the chip that reads a program’s instructions one after another and carries them out. Built to run anything, rather than to run one thing well.',
  },
  crystal: {
    term: 'Crystal',
    forms: ['crystal'],
    line: 'A solid whose atoms sit in one perfectly regular, repeating pattern throughout. Chips need silicon in this form so electricity behaves the same everywhere in it.',
  },
  current: {
    term: 'Current',
    forms: ['current', 'Current'],
    line: 'The flow of electric charge, measured in amps. Voltage is the push; current is how much actually moves.',
  },
  datasheet: {
    term: 'Datasheet',
    forms: ['datasheet'],
    line: 'The manufacturer’s specification document for a part, listing figures such as how much current it draws in each mode.',
  },
  ddr: {
    term: 'DDR (double data rate)',
    forms: ['DDR', 'DDR5'],
    line: 'The standard way main memory talks to the processor, moving data on both the rise and the fall of each clock tick. DDR5 is the fifth generation.',
  },
  'deep-ultraviolet': {
    term: 'Deep ultraviolet (DUV)',
    forms: ['deep ultraviolet'],
    line: 'Ultraviolet light at 193 nanometres, beyond what the eye can see. It printed chips for decades, stretched by clever tricks to features far smaller than its own wavelength.',
  },
  die: {
    term: 'Die',
    forms: ['die', 'dies'],
    line: 'The chip itself: a thin slice of silicon, smaller than a postage stamp, with the circuits printed on its surface. Everything else in the package powers it, wires it or cools it.',
  },
  'dilution-refrigerator': {
    term: 'Dilution refrigerator',
    forms: ['dilution refrigerator'],
    line: 'A refrigerator that reaches thousandths of a degree above absolute zero by mixing two forms of liquid helium.',
  },
  dma: {
    term: 'DMA (direct memory access)',
    forms: ['DMA'],
    line: 'A separate engine that copies data between a device and memory by itself, so the processor does not have to carry every byte and can get on with other work.',
  },
  dram: {
    term: 'DRAM (dynamic RAM)',
    forms: ['DRAM'],
    line: 'Memory where each bit is charge on a tiny capacitor behind one transistor. Dense and cheap, but the charge leaks, so it must be constantly refreshed. Main memory is DRAM.',
  },
  driver: {
    term: 'Driver',
    forms: ['driver', 'drivers'],
    line: 'The code that knows how to operate one particular piece of hardware, such as a disk or a network card, on behalf of the operating system.',
  },
  'duty-cycle': {
    term: 'Duty cycle',
    forms: ['duty cycle'],
    line: 'The fraction of time a device is awake and working. Its average power depends far more on this than on how little it draws while asleep.',
  },
  ecc: {
    term: 'ECC (error-correcting code) memory',
    forms: ['error-correcting memory', 'error correction'],
    line: 'Memory that stores a few extra check bits alongside the data, so a single flipped bit can be spotted and repaired automatically as it is read.',
  },
  'edge-computing': {
    term: 'Edge computing',
    forms: ['edge device', 'edge design', 'at the edge'],
    line: 'Computing done out where the data is collected — in a sensor, a doorbell, a field — rather than sending everything off to distant servers.',
  },
  'efficiency-cores': {
    term: 'Efficiency cores',
    forms: ['efficiency cores'],
    line: 'Small, slow cores that do the same work for a fraction of the energy. Almost everything a phone does all day runs on them.',
  },
  'electric-field': {
    term: 'Electric field',
    forms: ['electric field'],
    line: 'The invisible push a voltage exerts on charged particles nearby, even through an insulator. It is how a gate controls a transistor without touching it.',
  },
  euv: {
    term: 'EUV (extreme ultraviolet)',
    forms: ['extreme ultraviolet'],
    line: 'Light at 13.5 nanometres, about fourteen times shorter than deep ultraviolet. Air and glass absorb it, so it travels through a vacuum, steered by mirrors.',
  },
  'exposure-field': {
    term: 'Field (exposure)',
    forms: ['the field', 'one field'],
    line: 'The patch of wafer printed in one pass of light through the mask — usually a few chips’ worth. The machine prints one, steps along, and prints the next.',
    lectures: ['fab'],
  },
  feature: {
    term: 'Feature',
    forms: ['features', 'a feature'],
    line: 'One of the smallest shapes printed on a chip: a transistor’s gate, a thin wire, or the gap between two of them.',
  },
  filesystem: {
    term: 'Filesystem',
    forms: ['filesystem'],
    line: 'The part of the system that organises storage into named files and folders, and keeps track of where each one’s data actually sits.',
  },
  firmware: {
    term: 'Firmware',
    forms: ['firmware'],
    line: 'Software stored permanently in the machine itself, usually in a flash chip on the board. It is among the first code to run at power-on, and prepares the hardware for everything else.',
  },
  'fixed-function': {
    term: 'Fixed-function',
    forms: ['fixed-function'],
    line: 'Built to do exactly one job, wired that way at the factory. It cannot be told to do anything else, and in exchange does that job faster and on less power.',
  },
  flash: {
    term: 'Flash memory',
    forms: ['Flash', 'flash'],
    line: 'Memory that keeps its data with the power off, by trapping charge in a pocket sealed in insulator. Used for storage; slower than RAM, and it wears out with writing.',
    lectures: ['memory', 'boot', 'extremes'],
  },
  'flip-flop': {
    term: 'Flip-flop',
    forms: ['flip-flop'],
    line: 'Two latches paired so the stored value can change only on a tick of the clock. The basic one-bit memory element of every clocked chip.',
  },
  flush: {
    term: 'Pipeline flush',
    forms: ['flushes'],
    line: 'Throwing away all the half-finished work in the pipeline — usually because a branch was guessed wrongly — and starting again from the right place.',
  },
  fpga: {
    term: 'FPGA (field-programmable gate array)',
    forms: ['FPGA'],
    line: 'A chip made of many small configurable blocks and switchable wiring. Load one configuration and it becomes a particular circuit; load another and it becomes a different one.',
  },
  frequency: {
    term: 'Frequency',
    forms: ['frequency'],
    line: 'How often something repeats each second. For a chip, its clock rate, measured in gigahertz.',
  },
  'function-call': {
    term: 'Function call',
    forms: ['function call'],
    line: 'A program jumping to another part of itself to run a routine and come back. Cheap, because it never leaves the program.',
  },
  'general-purpose': {
    term: 'General-purpose',
    forms: ['general-purpose'],
    line: 'Able to run any program at all, rather than built for one task. The flexibility costs speed and power compared with a dedicated circuit.',
  },
  ghz: {
    term: 'GHz (gigahertz)',
    forms: ['GHz', 'gigahertz', 'megahertz'],
    line: 'Billions of ticks per second — the rate a clock runs at. A 4 GHz chip ticks four billion times a second; megahertz means millions.',
  },
  governors: {
    term: 'Governors',
    forms: ['governors'],
    line: 'The software that watches temperature and workload and sets the clock speed and voltage to match.',
  },
  gpu: {
    term: 'GPU (graphics processing unit)',
    forms: ['GPU'],
    line: 'A chip with hundreds or thousands of small, simple cores, driven in groups that each apply one instruction to every lane at once. Built for graphics, now used for any work that splits into many identical pieces.',
  },
  handler: {
    term: 'Handler',
    forms: ['handler'],
    line: 'The small piece of code that runs in response to an interrupt, deals with the device, and then hands control back.',
  },
  'hard-real-time': {
    term: 'Hard real-time',
    forms: ['hard real-time'],
    line: 'Real-time where missing a single deadline counts as a failure, not a slowdown — a brake, a pacemaker, a robot arm.',
  },
  harness: {
    term: 'Wiring harness',
    forms: ['harness'],
    line: 'The bundle of wires that runs through a car, connecting all its electronic units to one another and to what they control.',
  },
  hbm: {
    term: 'HBM (high-bandwidth memory)',
    forms: ['HBM'],
    line: 'DRAM chips stacked into a tower and placed right beside the processor, joined by thousands of very short wires. The same memory with a far wider path: many more values per trip, though no shorter a wait for any one of them.',
  },
  'heat-capacity': {
    term: 'Heat capacity',
    forms: ['heat capacity'],
    line: 'How much heat something can soak up before its temperature rises. A phone borrows against it during a burst of work, then has to cool down.',
  },
  'heat-pipe': {
    term: 'Heat pipe',
    forms: ['heat pipe'],
    line: 'A sealed, nearly empty copper tube holding a little fluid. It boils at the hot end and condenses at the cold end, moving heat far better than solid copper.',
  },
  'heat-sink': {
    term: 'Heat sink',
    forms: ['heat sink'],
    line: 'A block of metal, usually finned, that draws heat away from a hot part and hands it on to the surrounding air.',
  },
  'heavy-ion': {
    term: 'Heavy ion',
    forms: ['heavy ion'],
    line: 'The nucleus of a heavy atom, stripped of most or all of its electrons and travelling from space at enormous speed. It leaves a dense trail of charge through anything it crosses.',
  },
  inductors: {
    term: 'Inductors',
    forms: ['inductors'],
    line: 'Coils of wire that store energy in a magnetic field. Regulators use them to convert voltage smoothly, and storing enough energy takes physical bulk.',
  },
  inference: {
    term: 'Inference',
    forms: ['inference'],
    line: 'Running a trained neural network to get an answer — recognising what is in an image, say — as opposed to training it.',
  },
  instruction: {
    term: 'Instruction',
    forms: ['instruction', 'instructions'],
    line: 'One basic command a processor understands, such as “add these two numbers” or “fetch that value from memory”. A program is a long list of them.',
  },
  holes: {
    term: 'Holes',
    forms: ['holes'],
    line: 'Gaps where an electron is missing from the crystal. They drift like positive charges, and half the transistors in a chip conduct with them rather than with electrons.',
    lectures: ['compile'],
  },
  'instruction-set': {
    term: 'Instruction set',
    forms: ['instruction set'],
    line: 'The fixed list of instructions a family of processors understands, and the bit pattern for each. A program built for it runs on any chip that honours it.',
  },
  interrupt: {
    term: 'Interrupt',
    forms: ['interrupt', 'interrupted'],
    line: 'A signal from a device that makes the processor drop what it is doing, deal with the event, then carry on exactly where it left off.',
  },
  inverter: {
    term: 'Inverter',
    forms: ['inverter', 'inverters'],
    line: 'The NOT gate built from transistors: a circuit whose output is always the opposite of its input. Two transistors are enough to make one.',
  },
  io: {
    term: 'I/O (input/output)',
    forms: ['I/O'],
    line: 'Everything that moves data between the computer and the outside world — keyboards, screens, disks, networks and sensors.',
  },
  kernel: {
    term: 'Kernel',
    forms: ['kernel', 'kernels'],
    line: 'The core of the operating system: the one program with full control of the hardware, which decides what every other program is allowed to do.',
  },
  l1: {
    term: 'L1 cache',
    forms: ['L1'],
    line: 'The first and smallest level of cache, right beside each core. Only tens of kilobytes, but the fastest memory a core can reach.',
  },
  lane: {
    term: 'Lane',
    forms: ['lane', 'lanes'],
    line: 'One of the many side-by-side slots in a GPU, each applying the shared instruction to its own piece of data.',
    lectures: ['chip'],
  },
  'pcie-lane': {
    term: 'Lane (PCIe)',
    forms: ['four lanes'],
    line: 'One PCIe connection: a pair of wires carrying data out and another pair carrying data back, both at once. A drive usually gets four of them.',
    lectures: ['board'],
  },
  latch: {
    term: 'Latch',
    forms: ['latch'],
    line: 'The simplest memory circuit: two gates feeding back into each other so the output holds itself in place. It keeps one bit for as long as it has power.',
  },
  'latch-up': {
    term: 'Latch-up',
    forms: ['latch-up'],
    line: 'A fault where a particle strike switches on an unintended path through the chip, letting a large, potentially destructive current flow until the power is cut.',
  },
  latency: {
    term: 'Latency',
    forms: ['latency'],
    line: 'Delay: how long you wait between asking for something and getting it. Different from bandwidth, which is how much arrives once it starts.',
  },
  leakage: {
    term: 'Leakage',
    forms: ['leakage'],
    line: 'Current that trickles through a transistor even when it is switched off. Negligible in large old transistors; a serious drain in tiny modern ones.',
  },
  lockstep: {
    term: 'Lockstep',
    forms: ['lockstep'],
    line: 'Moving in exact unison, every part taking the same step at the same instant. In a car it means two cores running identical instructions so their answers can be compared.',
  },
  logarithmic: {
    term: 'Logarithmic scale',
    forms: ['logarithmic'],
    line: 'A scale where each equal step multiplies rather than adds — one step is ten times, the next a hundred. It fits an enormous range onto one picture.',
  },
  'logic-gate': {
    term: 'Logic gate',
    forms: ['gates', 'any gate'],
    line: 'A small circuit of a few transistors that takes 1s and 0s in and gives one answer out — AND, OR, NOT and the like. Everything a computer does is built from them.',
    lectures: ['chip', 'memory', 'compile'],
  },
  mach: {
    term: 'Mach',
    forms: ['Mach'],
    line: 'An experimental small-kernel design from Carnegie Mellon University in the 1980s. The kernel at the centre of macOS is built partly on it, alongside BSD.',
  },
  'machine-learning': {
    term: 'Machine learning',
    forms: ['machine-learning'],
    line: 'Software that learns patterns from vast amounts of example data instead of following rules written by hand. Training it takes enormous amounts of arithmetic.',
  },
  mask: {
    term: 'Mask',
    forms: ['mask'],
    line: 'A stencil carrying the pattern for one layer of the chip. Light shone through it copies the whole pattern in one pass, rather than drawing it line by line.',
    lectures: ['fab'],
  },
  matrix: {
    term: 'Matrix',
    forms: ['matrix', 'matrices'],
    line: 'A grid of numbers. Multiplying large grids together is most of the arithmetic inside a neural network.',
  },
  'memory-controller': {
    term: 'Memory controller',
    forms: ['memory controller', 'the controller'],
    line: 'The circuit that manages main memory on the processor’s behalf: it sends reads and writes, keeps the timing, and schedules the refreshes DRAM needs.',
  },
  microcontroller: {
    term: 'Microcontroller',
    forms: ['microcontroller'],
    line: 'A whole small computer on one cheap chip — processor, memory, storage and connections to sensors — built to run one program reliably on very little power.',
  },
  microsecond: {
    term: 'Microsecond',
    forms: ['microseconds', 'µs'],
    line: 'A millionth of a second — a thousand nanoseconds.',
  },
  millikelvin: {
    term: 'Millikelvin',
    forms: ['millikelvin'],
    line: 'Thousandths of a degree above absolute zero, the coldest anything can be. Ten millikelvin is hundreds of times colder than deep space.',
  },
  milliwatt: {
    term: 'Milliwatt',
    forms: ['milliwatts'],
    line: 'A thousandth of a watt. A phone working hard draws thousands of them; the chip in this implant draws about twenty-five.',
  },
  modem: {
    term: 'Modem',
    forms: ['modem'],
    line: 'The phone’s mobile-network radio, with its own processors and software. It keeps working whenever the phone is connected, even with the screen off.',
  },
  modules: {
    term: 'Kernel modules',
    forms: ['modules'],
    line: 'Pieces of kernel code, such as drivers, that can be loaded or removed while the system is running.',
  },
  monolithic: {
    term: 'Monolithic kernel',
    forms: ['monolithic'],
    line: 'A design where the filesystem, drivers and networking all run inside the kernel. Fast, but one faulty part can bring down the whole machine.',
  },
  mxu: {
    term: 'MXU (matrix multiply unit)',
    forms: ['MXU'],
    line: 'Google’s name for a dedicated block that multiplies matrices — the same idea as Nvidia’s tensor cores.',
  },
  nanometre: {
    term: 'Nanometre (nm)',
    forms: ['nanometre', 'nanometres', 'nm'],
    line: 'A billionth of a metre. A human hair is tens of thousands of nanometres wide; one nanometre is only a few atoms across.',
  },
  nanosecond: {
    term: 'Nanosecond',
    forms: ['nanosecond', 'nanoseconds'],
    line: 'A billionth of a second. Light travels about thirty centimetres in one.',
  },
  'network-stack': {
    term: 'Network stack',
    forms: ['network stack'],
    line: 'The layers of software that turn a program’s data into network packets and back, handling addressing, ordering and resending.',
  },
  'neural-network': {
    term: 'Neural network',
    forms: ['neural network'],
    line: 'A kind of program that learns from examples instead of being written by hand: layers of simple arithmetic whose numbers are tuned until the answers come out right.',
  },
  'neural-unit': {
    term: 'Neural unit',
    forms: ['neural unit'],
    line: 'A phone’s built-in block for running neural networks, on a fraction of the power a general-purpose core would need.',
  },
  neuron: {
    term: 'Neuron',
    forms: ['neuron', 'neurons'],
    line: 'A nerve cell. Neurons signal to one another with brief electrical pulses called spikes.',
  },
  node: {
    term: 'Node',
    forms: ['node', 'nodes'],
    line: 'One server in the building: essentially the laptop board from Lecture 5 in a metal box, with no screen and no keyboard.',
    lectures: ['datacenter'],
  },
  'nor-gate': {
    term: 'NOR gate',
    forms: ['NOR'],
    line: 'An OR with its answer flipped: it outputs 1 only when both inputs are 0. Two of them feeding each other is the smallest circuit that can remember.',
  },
  npu: {
    term: 'NPU / TPU (neural / tensor processing unit)',
    forms: ['NPU', 'TPU'],
    line: 'A chip or block built only to run neural networks, which mostly means multiplying matrices. Google’s is the TPU. Very efficient at that one job, useless for anything else.',
  },
  'operating-system': {
    term: 'Operating system (OS)',
    forms: ['operating system', 'operating systems', 'OS'],
    line: 'The software that runs the machine on behalf of every other program: it shares out the processor and memory, keeps programs apart and controls the hardware.',
  },
  package: {
    term: 'Package',
    forms: ['package'],
    line: 'The die plus everything wrapped around it — lid, fibreglass base and contacts — so a fragile sliver of silicon can be handled, powered and plugged into a board.',
  },
  parallelism: {
    term: 'Parallelism',
    forms: ['parallelism', 'parallel'],
    line: 'Doing many pieces of work at the same time on separate hardware. It only helps if the job can be split into pieces that do not depend on each other.',
    lectures: ['time', 'datacenter'],
  },
  pipeline: {
    term: 'Pipeline',
    forms: ['pipeline', 'pipelines', 'Pipelining'],
    line: 'Splitting each instruction into stages so several are worked on at once, like an assembly line. Each still takes as long, but one finishes every tick.',
    lectures: ['time', 'boot', 'compile', 'extremes'],
  },
  pitch: {
    term: 'Pitch',
    forms: ['pitch'],
    line: 'The repeat distance between neighbouring features — from the centre of one cell or wire to the centre of the next.',
  },
  polling: {
    term: 'Polling',
    forms: ['polled'],
    line: 'Checking a device over and over to see whether it has anything to report, rather than waiting to be told.',
  },
  port: {
    term: 'Port',
    forms: ['port', 'ports'],
    line: 'A connection point between the computer and a device. Outside, it is a socket you plug into; inside, the processor reads and writes it much like a memory location.',
  },
  'power-and-ground': {
    term: 'Power and ground',
    forms: ['power and ground'],
    line: 'The two sides of the supply. Power is the wire held at the working voltage; ground is the zero-volt return path the current flows back along.',
  },
  preemption: {
    term: 'Preemption',
    forms: ['Preemption'],
    line: 'The kernel forcibly pausing a running program, using a timer interrupt, so another can have the processor — whether the program cooperates or not.',
  },
  prefetch: {
    term: 'Prefetch',
    forms: ['prefetch'],
    line: 'Fetching data into cache before the program asks for it, based on a guess about what it will need next.',
  },
  'prime-cores': {
    term: 'Prime cores',
    forms: ['prime cores'],
    line: 'The biggest, fastest cores in a phone. Expensive to run, so they wake for a burst after you touch the screen and sleep the rest of the time.',
  },
  privilege: {
    term: 'Privilege',
    forms: ['privilege', 'privileged'],
    line: 'Permission to use the instructions that control the hardware directly. Only the kernel has it; ordinary programs have to ask the kernel instead.',
  },
  'process-node': {
    term: 'Process node',
    forms: ['process node', 'advanced node', 'Node names'],
    line: 'A generation of chip-making technology, named with a number like “3 nm”. The number once measured a real feature; now it is a label for the generation.',
  },
  qubit: {
    term: 'Qubit',
    forms: ['qubit'],
    line: 'A quantum bit, the basic unit of a quantum computer. Until measured it is not simply 0 or 1; measuring it forces one ordinary answer out.',
  },
  rack: {
    term: 'Rack',
    forms: ['rack', 'racks'],
    line: 'A tall metal frame holding a column of servers one above another, sharing power and cooling.',
  },
  rad: {
    term: 'Rad',
    forms: ['rads'],
    line: 'A unit of absorbed radiation. A few hundred rads at once can kill a person; hardened chips are rated for hundreds of thousands to a million.',
  },
  rad750: {
    term: 'RAD750',
    forms: ['RAD750'],
    line: 'A radiation-hardened processor built for spacecraft, based on the PowerPC 750. Slow by modern standards and very hard to upset.',
  },
  'radiation-hardening': {
    term: 'Radiation hardening',
    forms: ['hardening', 'Hardened'],
    line: 'Designing and building chips to keep working under radiation — special manufacturing processes, larger features, circuits built to resist upsets — at a large cost in speed and price.',
  },
  ram: {
    term: 'RAM (main memory)',
    forms: ['RAM', 'main memory', 'Main memory'],
    line: 'The computer’s working memory: separate chips holding the programs and data in use right now. Far larger than cache, far slower to reach, and it forgets everything when the power goes.',
  },
  'real-time': {
    term: 'Real-time',
    forms: ['real-time', 'Real-time'],
    line: 'Guaranteed to finish within a fixed time, every time. It is about never being late, not about being fast.',
  },
  'recording-channel': {
    term: 'Channel',
    forms: ['channel', 'channels'],
    line: 'One recording site’s signal, read out and handled as a separate stream of numbers.',
    lectures: ['implant'],
  },
  'recording-sites': {
    term: 'Recording sites',
    forms: ['recording sites'],
    line: 'Tiny electrodes along each thread, each picking up the electrical activity of a few nearby neurons.',
  },
  redundancy: {
    term: 'Redundancy',
    forms: ['Redundancy', 'triplicated'],
    line: 'Having spare copies of a part so the system survives one of them failing. Triplicated means three copies, with a vote on the answer.',
  },
  refresh: {
    term: 'Refresh',
    forms: ['refresh'],
    line: 'Reading every DRAM cell and writing it straight back, before its leaking charge fades too far to tell a 1 from a 0.',
  },
  reset: {
    term: 'Reset',
    forms: ['reset'],
    line: 'A state in which the processor is held still with every internal value forced to a known setting, so it starts from a chosen state rather than whatever it powered up holding.',
  },
  sandboxing: {
    term: 'Sandboxing',
    forms: ['sandboxing'],
    line: 'Running a program with strict limits on what it can reach, so if it misbehaves it cannot touch anything outside its box.',
  },
  scheduler: {
    term: 'Scheduler',
    forms: ['scheduler', 'schedulers', 'scheduling'],
    line: 'Whatever decides what runs next. Inside a core it orders instructions; in an operating system it decides which program gets the processor, and for how long.',
  },
  scrubbing: {
    term: 'Scrubbing',
    forms: ['scrubbed'],
    line: 'Continuously reading memory, correcting any flipped bits and writing it back, so errors are cleaned away before they pile up.',
  },
  sectors: {
    term: 'Sectors',
    forms: ['sectors'],
    line: 'The fixed-size blocks a disk is divided into. On an older PC the very first one held the code that starts loading an operating system.',
  },
  'serial-link': {
    term: 'Serial link',
    forms: ['serial link'],
    line: 'A connection that sends data one bit after another down a single pair of wires, very fast, rather than many bits side by side on many wires.',
  },
  server: {
    term: 'Server',
    forms: ['server'],
    line: 'A computer that runs out of sight, doing work for other machines over a network rather than for a person sitting at it.',
  },
  'single-event-upset': {
    term: 'Single event upset',
    forms: ['upset', 'upsets'],
    line: 'A stored bit flipped by a passing particle. Nothing is damaged; the value is simply wrong until something writes it again.',
  },
  socket: {
    term: 'Socket',
    forms: ['socket', 'sockets'],
    line: 'A bed of spring contacts on the board that presses against a chip’s contacts, so the chip can be fitted and removed without soldering.',
  },
  'solder-mask': {
    term: 'Solder mask',
    forms: ['solder mask'],
    line: 'The thin coloured coating over a circuit board that protects the copper and stops solder spreading where it should not.',
  },
  'source-code': {
    term: 'Source code',
    forms: ['source'],
    line: 'The program as a person wrote it, in human-readable text, before it is turned into the instructions a processor runs.',
    lectures: ['os'],
  },
  sparsity: {
    term: 'Sparsity',
    forms: ['sparsity'],
    line: 'Most of the values being zero, or most of the parts idle, at any moment. A design that skips the idle parts does far less work.',
  },
  'speculative-execution': {
    term: 'Speculative execution',
    forms: ['speculative', 'speculation'],
    line: 'Doing work before knowing whether it is needed, based on a guess, and throwing it away if the guess was wrong. On average far faster than waiting.',
  },
  spectre: {
    term: 'Spectre',
    forms: ['Spectre'],
    line: 'A family of attacks, made public in 2018, that read secrets out of work a processor guessed at and then threw away. The answer is discarded, but the cache still remembers what was touched, and timing reveals it.',
    lectures: ['compile'],
  },
  spike: {
    term: 'Spike',
    forms: ['spike', 'spikes'],
    line: 'The brief electrical pulse a neuron gives off when it fires, lasting about a millisecond. What matters is mostly when they happen, not their shape.',
  },
  sram: {
    term: 'SRAM (static RAM)',
    forms: ['SRAM'],
    line: 'Memory where each bit is held by six transistors locked in a loop. Fast and needs no refreshing, but bulky — which is why it is used for caches.',
  },
  stack: {
    term: 'Stack',
    forms: ['onto a stack'],
    line: 'An area of memory where the processor notes what it was doing, piled up like plates, so it can pick up exactly where it left off afterwards.',
  },
  stall: {
    term: 'Stall',
    forms: ['stall', 'stalls'],
    line: 'A pause in which a processor can do no useful work because it is waiting — usually for data from memory, or for a result not yet worked out.',
  },
  superconducting: {
    term: 'Superconducting',
    forms: ['Superconducting'],
    line: 'Cooled until electricity flows with no resistance at all. Many quantum chips are built from such circuits, which only behave this way near absolute zero.',
  },
  'system-call': {
    term: 'System call',
    forms: ['system call'],
    line: 'The only way through the wall: a program stops, hands over what it wants, and the kernel decides. Every file read and packet sent goes through one.',
  },
  'systolic-array': {
    term: 'Systolic array',
    forms: ['systolic array'],
    line: 'A grid of identical multiply-and-add cells that pass numbers to their neighbours in a steady rhythm, like a heartbeat. Data flows through; nothing fetches instructions.',
  },
  'tensor-cores': {
    term: 'Tensor cores',
    forms: ['tensor cores'],
    line: 'Small fixed units inside a GPU that multiply a block of numbers (a small matrix) in a single step — the arithmetic machine learning is mostly made of.',
  },
  'thermal-interface': {
    term: 'Thermal interface',
    forms: ['thermal interface'],
    line: 'The paste or solder between die and lid. Two flat metal surfaces touch only at a few high points, and trapped air insulates — this fills the gaps.',
  },
  throttling: {
    term: 'Throttling',
    forms: ['throttling', 'throttled', 'throttles'],
    line: 'Deliberately lowering the clock speed to cut heat when a chip gets too hot. The machine keeps working, only more slowly.',
  },
  throughput: {
    term: 'Throughput',
    forms: ['throughput'],
    line: 'How much work gets done per second overall. A system can have high throughput and still keep an individual task waiting.',
  },
  'total-dose': {
    term: 'Total dose',
    forms: ['total dose'],
    line: 'The radiation a part absorbs over its whole life. Enough of it slowly degrades transistors until they stop working.',
  },
  transistor: {
    term: 'Transistor',
    forms: ['transistor', 'transistors', 'field-effect transistor'],
    line: 'An electrically controlled switch with no moving parts. A voltage on its gate turns a current on or off; billions of them make up a modern chip.',
  },
  'transistor-gate': {
    term: 'Gate (of a transistor)',
    forms: ['the gate', 'a gate'],
    line: 'The transistor’s control terminal. It never touches the silicon beneath; a voltage on it projects an electric field that switches the current on or off.',
    lectures: ['chip', 'memory', 'compile'],
  },
  trap: {
    term: 'Trap',
    forms: ['trap', 'traps'],
    line: 'The processor stopping a program and handing control to the kernel — because the program tried something forbidden, or asked for help on purpose.',
  },
  tunnel: {
    term: 'Tunnelling',
    forms: ['tunnel'],
    line: 'A quantum effect: through a barrier only a few atoms thick, electrons can simply turn up on the other side, although everyday physics says they should be blocked.',
  },
  'user-space': {
    term: 'User space',
    forms: ['user space'],
    line: 'Everything outside the kernel, where ordinary programs run without direct access to the hardware.',
  },
  variance: {
    term: 'Variance',
    forms: ['variance'],
    line: 'How much the time a task takes differs from one run to the next. A real-time system needs it as close to zero as possible.',
  },
  voltage: {
    term: 'Voltage',
    forms: ['voltage', 'voltages', 'volt', 'volts'],
    line: 'Electrical pressure: how hard a supply pushes charge around a circuit. Measured in volts; a modern core runs on roughly one.',
  },
  'voltage-regulator': {
    term: 'Voltage regulator',
    forms: ['regulators'],
    line: 'A circuit that converts one supply voltage into another and holds it steady whatever the load — here, the battery’s twelve-ish volts down to a core’s one.',
  },
  wafer: {
    term: 'Wafer',
    forms: ['wafer', 'wafers'],
    line: 'A thin, polished disc sliced from a single crystal of silicon, on which many chips are printed at once before being cut apart.',
  },
  wavelength: {
    term: 'Wavelength',
    forms: ['wavelength'],
    line: 'The distance between successive peaks of a light wave. It sets the finest detail light can print: the shorter the wavelength, the smaller the features.',
  },
  weights: {
    term: 'Weights',
    forms: ['Weights'],
    line: 'The learned numbers inside a neural network — the result of training it. Running the network means multiplying incoming data by them.',
  },
  'xor-gate': {
    term: 'XOR gate (exclusive OR)',
    forms: ['XOR'],
    line: 'Answers 1 only when its two inputs disagree. Two 1s give 0 — which is exactly 1 + 1 in binary, with the 1 carried.',
  },
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')

const byForm = new Map<string, string>()
for (const [key, entry] of Object.entries(jargon))
  for (const form of entry.forms) byForm.set(form, key)

/**
 * One regex over every form, longest first so "direct memory access" wins
 * over "memory". The lookarounds stand in for `\b`, which treats "I/O" and
 * "DDR5" badly and would match "RAM" inside "SRAM".
 */
const pattern = byForm.size
  ? new RegExp(
      `(?<![\\w/-])(${[...byForm.keys()]
        .sort((a, b) => b.length - a.length)
        .map(escape)
        .join('|')})(?![\\w/-])`,
      'g',
    )
  : null

export type JargonHit = { start: number; end: number; key: string }

/** Every jargon match in `text`, first occurrence of each term only. */
export function findJargon(
  text: string,
  seen: Set<string>,
  lecture: string,
  allow?: Set<string>,
): JargonHit[] {
  if (!pattern) return []
  const hits: JargonHit[] = []
  for (const m of text.matchAll(pattern)) {
    const key = byForm.get(m[0])
    if (!key || seen.has(key)) continue
    const only = jargon[key].lectures
    if (only && !only.includes(lecture)) continue
    if (allow && !allow.has(key)) continue
    seen.add(key)
    hits.push({ start: m.index, end: m.index + m[0].length, key })
  }
  return hits
}

/**
 * Which terms each beat underlines: those not already underlined earlier in
 * the same chapter. A chapter rather than a lecture, because the rail and the
 * chapter strip let a reader land at the start of any chapter.
 */
export function planJargon(
  lecture: string,
  chapters: { beats: { id: string; body: string[]; aside?: { text: string } }[] }[],
): Map<string, Set<string>> {
  const plan = new Map<string, Set<string>>()
  for (const chapter of chapters) {
    const seen = new Set<string>()
    for (const beat of chapter.beats) {
      const mine = new Set<string>()
      for (const text of [...beat.body, beat.aside?.text ?? ''])
        for (const hit of findJargon(text, seen, lecture)) mine.add(hit.key)
      plan.set(beat.id, mine)
    }
  }
  return plan
}
