import type { Chapter } from './types'

/**
 * Lecture 17 — The Implant.
 *
 * The capstone, and it earns that by being the only machine in the course to
 * which every previous constraint applies at once: the phone's sealed thermal
 * budget, the microcontroller's energy budget, the rover's you-cannot-repair-
 * it, the car's it-must-not-fail, the datacenter's move-the-computation-to-the-
 * data. Nothing here is a new idea. What is new is that the heat sink is a
 * person.
 *
 * The lecture is built around two ceilings because the reader has by now seen
 * fifteen budgets and should recognise the shape immediately — and then find
 * that this one cannot be renegotiated. A phone can get a bigger battery, a
 * server a bigger cooler, a car a bigger harness. Tissue does not have a
 * higher-end option.
 *
 * The final chapter deliberately does not introduce anything. It re-reads the
 * same object through every lecture that came before it, which is the argument
 * the whole course has been making: these are the same primitives every time,
 * and only the budget changes.
 */
export const implantChapters: Chapter[] = [
  {
    id: 'inside',
    scene: 'implant',
    marker: '01',
    title: 'A Computer Inside a Person',
    short: 'Inside',
    beats: [
      {
        id: 'sealed',
        kicker: 'Where it lives',
        heading: 'Every constraint in this course, on one object',
        body: [
          'It cannot be plugged in, opened, cooled by a fan, rebooted by a person who is annoyed with it, or replaced without surgery. It has to keep working for years, and while it works it sits in salt water at body temperature.',
          'Nothing about it is a new kind of computer. It is the microcontroller from Lecture 12 under the rover\'s repair constraint from Lecture 16, inside the phone\'s sealed thermal budget from Lecture 11.',
        ],
        say: [
          'Lecture sixteen ended on a sentence. The constraint decides the machine. This is the last machine, and it has the tightest constraints in the course.',
          'It cannot be plugged in, opened, cooled by a fan, rebooted by a person who is annoyed with it, or replaced without surgery. It has to keep working for years. And while it works, it sits in salt water, at body temperature.',
          '[matter-of-fact] And nothing about it is a new kind of computer. It is the microcontroller from lecture twelve, under the rover\'s repair constraint from lecture sixteen, inside the phone\'s sealed thermal budget from lecture eleven.',
          '[reflective] Three rules. You may not heat the tissue. You may not change the battery. And you cannot get the data out. Everything else follows from those.',
        ],
        camera: { position: [0.7, 3.3, 7.9], target: [0.3, 0.45, 0], fov: 38 },
        explode: 0,
        focus: 'sealed',
        aside: {
          label: 'The trade, stated',
          text: 'You may not heat the tissue, you may not change the battery, and you cannot get the data out. Everything else follows from those three.',
        },
      },
      {
        id: 'array',
        kicker: 'The array',
        heading: 'A thousand electrodes on sixty-four threads',
        body: [
          'The threads are finer than a human hair and are placed by a robot, because a hand is not steady enough and the thing being avoided is a blood vessel. Between them they carry 1,024 recording sites, so about a thousand channels in total.',
          'Every one of them is listening to the voltage near a few neurons, for as long as it stays put: in the first person to receive one, a number of threads pulled back out of the brain within weeks. All sixty-four threads are drawn here; almost nothing else in this lecture is shown at its real scale.',
        ],
        say: [
          'A thousand electrodes, on sixty-four threads.',
          'The threads are finer than a human hair, and they are placed by a robot, because a hand is not steady enough and the thing being avoided is a blood vessel. Between them they carry one thousand and twenty-four recording sites. So about a thousand channels in total.',
          '[pause] And every one of them is listening to the voltage near a few neurons, for as long as it stays put. In the first person to receive one, a number of threads pulled back out of the brain within weeks.',
          'All sixty-four threads are drawn here. Almost nothing else in this lecture is shown at its real scale.',
        ],
        camera: { position: [1.7, 2.7, 7.5], target: [0.3, 0.2, 0], fov: 37 },
        explode: 0,
        focus: 'array',
        labels: [{ text: '64 threads, ~1024 sites', part: 'implant', offset: [0, -1.05, 1.5], tone: 'cyan' }],
      },
    ],
  },

  {
    id: 'heat',
    scene: 'implant',
    marker: '02',
    title: 'The First Ceiling',
    short: 'Heat',
    beats: [
      {
        id: 'warm',
        kicker: 'Heat',
        heading: 'Every joule it spends ends up in a brain',
        body: [
          'Lecture 5 established that all the energy a computer uses becomes heat. That was a cooling problem. Here it is a safety limit, and it is written in degrees, not watts: the standard for active implants lets no outer surface run more than 2 °C above body temperature, and designers working on the brain aim for no more than about one degree. What that allows depends on the device and where it sits — published estimates run from about fifteen milliwatts for a small implant in the cortex to around seventy for a larger unit set into the skull.',
          'The recording chip in a device like this draws about twenty-five milliwatts. Look at where that sits on the bar. That is a large share of the whole allowance, not a small slice of it — this is not a modest device with headroom.',
        ],
        say: [
          'Now the first ceiling.',
          'Lecture five established that all the energy a computer uses becomes heat. That was a cooling problem. Here it is a safety limit. And it is written in degrees, not watts. The standard for implants lets no outer surface run more than two degrees above body temperature, and designers working on the brain aim for no more than about one degree.',
          'How much power that allows depends on the device, and where it sits. Published estimates run from about fifteen milliwatts, for a small implant in the cortex, to around seventy, for a larger unit set into the skull.',
          '[matter-of-fact] And the recording chip in a device like this draws about twenty-five. Look at where that sits on the bar. That is a large share of the whole allowance, not a small slice of it. This is not a modest device with headroom.',
        ],
        camera: { position: [2.1, 3.1, 7.7], target: [0.85, 0.6, 0], fov: 38 },
        explode: 0,
        focus: 'warm',
        labels: [{ text: 'A degree or two, and no more', part: 'implant', offset: [2.35, 1.95, 0.35], tone: 'amber' }],
      },
      {
        id: 'budget',
        kicker: 'The budget',
        heading: 'Ask it for more and the answer is no',
        body: [
          'Watch the bar as the demand climbs. More channels, better detection, a smarter decoder — every one of them is a real feature somebody wants, and every one is paid for out of the same few tens of milliwatts.',
          'It reaches the line and stops. Not because the design is cautious, but because there is nothing on the other side of that line except a warmer brain.',
        ],
        say: [
          'So watch the bar as the demand climbs.',
          'More channels. Better detection. A smarter decoder. Every one of them is a real feature that somebody wants, and every one is paid for out of the same few tens of milliwatts.',
          '[pause] It reaches the line, and it stops. Not because the design is cautious, but because there is nothing on the other side of that line except a warmer brain.',
          '[reflective] And notice that this is the same shape you have now seen fifteen times. A phone throttles. A laptop spins a fan faster. A datacenter brings liquid to the chip. A car derates. Every machine in this part meets a thermal wall, and every one of them has somewhere to go. This one does not.',
        ],
        camera: { position: [2.3, 3.3, 7.9], target: [0.95, 0.65, 0], fov: 38 },
        explode: 0,
        focus: 'budget',
        aside: {
          label: 'The same shape, fifteen times',
          text: 'A phone throttles, a laptop spins a fan faster, a datacenter brings liquid to the chip, a car derates. Every machine in Part IV meets a thermal wall and every one of them has somewhere to go. This one does not.',
        },
      },
      {
        id: 'nofan',
        kicker: 'No way out',
        heading: 'You cannot cool your way past it',
        body: [
          'The phone in Lecture 11 had no fan either, and it survived by being intermittent — sprint, get hot, slow down, cool against the case and the air. That escape needs somewhere for the heat to go.',
          'Here the case is a person and the air is blood. The device is not thermally limited in the sense of running slower than it could; it is limited in the sense that the limit is a property of the patient.',
        ],
        say: [
          'And you cannot cool your way past it.',
          'The phone in lecture eleven had no fan either, and it survived by being intermittent. Sprint, get hot, slow down, cool against the case and the air. But that escape needs somewhere for the heat to go.',
          '[matter-of-fact] Here the case is a person, and the air is blood. So this device is not thermally limited in the sense of running slower than it could. It is limited in the sense that the limit is a property of the patient.',
        ],
        camera: { position: [1.5, 3.1, 7.7], target: [0.5, 0.5, 0], fov: 38 },
        explode: 0,
        focus: 'nofan',
      },
    ],
  },

  {
    id: 'funnel',
    scene: 'implant',
    marker: '03',
    title: 'The Second Ceiling',
    short: 'The funnel',
    beats: [
      {
        id: 'raw',
        kicker: 'What arrives',
        heading: 'Two hundred megabits a second, off a thing the size of a coin',
        body: [
          'To see a spike you have to sample fast and finely — roughly two hundred kilobits per second per channel. A thousand channels of that is about two hundred megabits per second arriving at the processor, continuously, forever.',
          'Watch the threads. That is the signal the array actually hears, and at this point none of it has gone anywhere.',
        ],
        say: [
          'Now the second ceiling. And it is worse.',
          'To see a spike you have to sample fast, and finely. Roughly two hundred kilobits per second, per channel. A thousand channels of that is about two hundred megabits per second, arriving at the processor. Continuously. Forever.',
          '[pause] Watch the threads. That is the signal the array actually hears. And at this point, none of it has gone anywhere.',
        ],
        camera: { position: [1.7, 2.7, 7.5], target: [0.3, 0.15, 0], fov: 37 },
        explode: 0,
        focus: 'raw',
      },
      {
        id: 'pipe',
        kicker: 'What can leave',
        heading: 'And a radio that carries about one',
        body: [
          'The only way out is a low-energy radio, and it has to fit inside the same heat allowance as everything else — Neuralink\'s own brief allows the compression and the radio together less than ten milliwatts. A radio was already the most expensive thing in the microcontroller of Lecture 12, and this one cannot be turned up.',
          'Watch the boundary. Almost everything arrives and does not leave. This is not a queue that will drain; it is two hundred times more signal than the pipe can ever carry.',
        ],
        say: [
          'And the way out carries about one.',
          'The only exit is a low-energy radio, and it has to fit inside the same heat allowance as everything else. Neuralink\'s own brief allows the compression and the radio together less than ten milliwatts.',
          'A radio was already the most expensive thing in the microcontroller of lecture twelve, and this one cannot be turned up.',
          '[matter-of-fact] Watch the boundary. Almost everything arrives, and does not leave. This is not a queue that will drain. It is two hundred times more signal than the pipe can ever carry.',
        ],
        camera: { position: [1.9, 3.1, 7.7], target: [0.3, 0.55, 0], fov: 38 },
        explode: 0,
        focus: 'pipe',
        labels: [{ text: 'It stops here', part: 'implant', offset: [1.5, 1.45, 0.9], tone: 'violet' }],
      },
      {
        id: 'spikes',
        kicker: 'The answer',
        heading: 'Do not send the signal — send what it meant',
        body: [
          'A neuron firing is an event. The waveform is how you detect it, but downstream only needs *that it happened, and when*. So the chip sends only the spikes. The gap was about two hundred to one, and the chip\'s own spike detector can cut what it sends by up to 1,250 times.',
          'Watch the array now. Most threads are dark, because most neurons are not firing at any instant — and the same narrow pipe that was hopeless a moment ago is now carrying everything of value.',
        ],
        say: [
          'So do not send the signal. Send what it meant.',
          'A neuron firing is an event. The waveform is how you detect it, but downstream only needs that it happened, and when. So the chip finds the spikes, and sends only those. The gap was about two hundred to one, and this more than closes it. The chip\'s own spike detector can cut what it sends by up to twelve hundred and fifty times.',
          '[pause] Watch the array now. Most threads are dark, because most neurons are not firing at any instant. And the same narrow pipe that was hopeless a moment ago is now carrying everything of value.',
          '[reflective] Though the constriction on screen is about fifty to one, not two hundred. Drawn faithfully, one packet would leave for every two hundred that arrived, and that is a still picture.',
        ],
        camera: { position: [1.7, 2.9, 7.5], target: [0.3, 0.35, 0], fov: 37 },
        explode: 0,
        focus: 'spikes',
        aside: {
          label: 'Compressed on screen',
          text: 'Drawn faithfully, one packet would leave for every two hundred that arrived, which is a still picture. The constriction on screen is about fifty to one — as far as it can be pushed and still show anything leaving.',
        },
      },
      {
        id: 'inside',
        kicker: 'The conclusion',
        heading: 'Which is why the computing has to happen in the skull',
        body: [
          'The processing is not inside because inside is convenient. It is inside because the reduction has to happen on the expensive side of the bottleneck — once the data has failed to get out, no amount of computing elsewhere can recover it.',
          'You have seen this exact argument twice. The datacenter moves computation to the data because moving the data costs more. The sensor in Lecture 12 computes locally because its radio dominates its energy budget. Here it arrives from biology, and gives the same answer.',
        ],
        say: [
          'Which is why the computing has to happen in the skull.',
          'The processing is not inside because inside is convenient. It is inside because the reduction has to happen on the expensive side of the bottleneck. Once the data has failed to get out, no amount of computing elsewhere can recover it.',
          '[matter-of-fact] And you have seen this exact argument twice already. The datacenter moves computation to the data, because moving the data costs more. The sensor in lecture twelve computes locally, because its radio dominates its energy budget. Here it arrives from biology, and gives the same answer.',
        ],
        camera: { position: [1.3, 3.3, 7.9], target: [0.4, 0.45, 0], fov: 38 },
        explode: 0,
        focus: 'inside',
      },
    ],
  },

  {
    id: 'whole',
    scene: 'implant',
    marker: '04',
    title: 'Everything, At Once',
    short: 'The whole',
    beats: [
      {
        id: 'everything',
        kicker: 'The course',
        heading: 'Nothing here is new',
        body: [
          'Switches that are either on or off. A gate that remembers. A clock that decides when to look. A ladder of memory arranged by distance. A boundary the hardware enforces. A deadline that must not slip. A budget that decides the shape of everything above it.',
          'This device is those seven ideas under the tightest budget in the course. It is not a more advanced computer than the one in Lecture 1. It is the same computer, allowed far less.',
        ],
        say: [
          'So. Nothing here is new.',
          'Switches that are either on or off. A gate that remembers. A clock that decides when to look. A ladder of memory arranged by distance. A boundary the hardware enforces. A deadline that must not slip. And a budget that decides the shape of everything above it.',
          '[pause] This device is those seven ideas, under the tightest budget in the course. It is not a more advanced computer than the one in lecture one. It is the same computer, allowed far less.',
          '[reflective] Every lecture named what dominated its design, and what was traded for it. Read those seventeen sentences in order and you have the whole argument. The primitives never changed. The budget was always the thing doing the deciding.',
        ],
        camera: { position: [1.9, 3.7, 8.3], target: [0.4, 0.45, 0], fov: 40 },
        explode: 0,
        focus: 'everything',
        aside: {
          label: 'The spine',
          text: 'Every lecture named what dominated its design and what was traded for it. Read those seventeen sentences in order and you have the whole argument: the primitives never changed, and the budget was always the thing doing the deciding.',
        },
      },
      {
        id: 'end',
        kicker: 'The end',
        heading: 'A machine is an argument about what to give up',
        body: [
          'There is no best computer, and there was never going to be one. There is a rover that gave up thirty years of speed to survive, a phone that gave up sustained performance to stay silent, a datacenter that gave up nothing except money, and this, which gave up almost everything to be allowed inside a person at all.',
          'You now know what all of them are made of, and — more usefully — why none of them could have been made any other way.',
        ],
        say: [
          'Which leaves one thing to say.',
          'There is no best computer. And there was never going to be one.',
          '[pause] There is a rover that gave up thirty years of speed to survive. A phone that gave up sustained performance to stay silent. A datacenter that gave up nothing except money. And this, which gave up almost everything to be allowed inside a person at all.',
          '[reflective] You now know what all of them are made of. And, more usefully, why none of them could have been made any other way.',
        ],
        camera: { position: [0, 3.9, 8.7], target: [0, 0.4, 0], fov: 40 },
        explode: 0,
        focus: 'everything',
      },
    ],
  },
]
