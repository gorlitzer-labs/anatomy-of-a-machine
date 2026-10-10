import type { Chapter } from './types'

/**
 * Lecture 15 — The Datacenter.
 *
 * The opposite end of Part IV from the implant. Nothing in this building is
 * cleverer than the laptop in Lecture 5 — there is simply an enormous amount of
 * it, and the problems that matter are the ones that only exist at that
 * quantity.
 *
 * Checked (Uptime Institute Global Data Center Survey 2026): the average of
 * facilities' typical (modal) rack density is 7.8 kW excluding the few sites
 * whose typical rack is 30 kW or more (7.5 kW in 2025), and just over 11 kW
 * including them (9 kW in 2025). Only 24% of facilities have any rack at
 * 30 kW or above, about one in seven any at 50 kW or above, some above 100 kW.
 * AI clusters run 30-100 kW a rack (Schneider WP110), and air cooling runs out
 * around 20 kW a rack even with containment, so dense racks are liquid-cooled.
 * PUE, the ratio of total facility power to IT-equipment power: industry
 * average 1.52 in 2026 (Uptime), Google's fleet 1.09.
 */
export const datacenterChapters: Chapter[] = [
  {
    id: 'onenode',
    scene: 'datacenter',
    marker: '01',
    title: 'One Node',
    short: 'One node',
    beats: [
      {
        id: 'node',
        kicker: 'The unit',
        heading: 'A server is the board from Lecture 5, with more of everything',
        body: [
          'Same processor, same memory, same buses, same problem with heat. More cores, more channels, no screen, and at most a battery to ride out a power cut — but nothing here would surprise anyone who read the board lecture.',
          'That is the point worth starting from. Nothing in this building is a new kind of machine. There is just a very large number of this one.',
        ],
        say: [
          'Lecture fourteen ended on machines that gave things up to buy a guarantee. This one gives up nothing, and simply buys whatever it needs.',
          'Same processor, same memory, same buses, same problem with heat. More cores, more channels, no screen, and at most a battery to ride out a power cut. But nothing here would surprise anyone who read the board lecture.',
          '[matter-of-fact] And that is the point worth starting from. Nothing in this building is a new kind of machine. There is just a very large number of this one.',
        ],
        camera: { position: [0, 4.6, 6.0], target: [0, 0.4, 0], fov: 34 },
        explode: 0,
        focus: 'node',
      },
      {
        id: 'ecc',
        kicker: 'At this quantity',
        heading: 'Rare things become constant',
        body: [
          'Memory errors are rare enough that a laptop mostly gets away unprotected. But in Google\'s fleet about a third of machines see at least one a year, and across a hundred thousand machines that stops being unlikely and becomes a schedule.',
          'So server memory carries extra bits that let it detect and correct a flip on the fly. Watch them be caught, unnoticed above. The rarer errors it cannot correct still stop the machine, on a schedule too.',
        ],
        say: [
          'Which changes what counts as rare.',
          'Memory errors are rare enough that a laptop mostly gets away unprotected. But in Google\'s fleet, about a third of machines see at least one a year. Across a hundred thousand machines, that stops being unlikely. It becomes a schedule.',
          '[pause] So server memory carries extra bits that let it detect and correct a flip on the fly. Watch them land, and be caught. Nothing above notices. The rarer errors it cannot correct still stop the machine. And at this scale, those come on a schedule too.',
          '[reflective] And that is the general rule at this scale. Every event with a nonzero probability is happening right now, somewhere. Disks, fans, power supplies and network links are all treated the same way. Not as things that might fail, but as things that are failing, continuously, at a known rate.',
        ],
        camera: { position: [1.2, 4.4, 5.6], target: [0, 0.4, 0], fov: 34 },
        explode: 0,
        focus: 'ecc',
        aside: {
          label: 'The general rule',
          text: 'At scale, every event with a nonzero probability is happening right now, somewhere. Disks, fans, power supplies and network links are all treated the same way: not as things that might fail but as things that are failing, continuously, at a known rate.',
        },
      },
    ],
  },

  {
    id: 'many',
    scene: 'datacenter',
    marker: '02',
    title: 'Then Many',
    short: 'Scale',
    beats: [
      {
        id: 'rack',
        kicker: 'A rack',
        heading: 'Stack them until the power runs out',
        body: [
          'A rack is a column of identical nodes, and what limits how many fit is not space. It is how much electricity can be delivered to that square metre and how much heat can be taken away from it.',
          'Typical racks are modest — about eight kilowatts in 2026 across ordinary facilities, or just over eleven counting the few new sites built for dense machines. It is the machine-learning racks that strain a building: tens of kilowatts each is normal for them, and the densest now pass a hundred.',
        ],
        say: [
          'Now stack them.',
          'A rack is a column of identical nodes, and what limits how many fit is not space. It is how much electricity can be delivered to that square metre, and how much heat can be taken away from it.',
          '[matter-of-fact] Typical racks are modest, though. About eight kilowatts in twenty twenty-six, across ordinary facilities. Just over eleven, if you count the few new sites built for dense machines. It is the machine-learning racks that strain a building. Tens of kilowatts each is normal for them, and the densest now pass a hundred.',
        ],
        camera: { position: [1.4, 4.8, 5.6], target: [0, 0.5, 0], fov: 34 },
        explode: 0,
        focus: 'rack',
      },
      {
        id: 'hall',
        kicker: 'Then a hall',
        heading: 'And then the same picture, many times',
        body: [
          'Watch them arrive. There is no new idea in the room — the ninth rack is identical to the first, and that sameness is deliberate, because anything that has to be reasoned about individually does not scale.',
          'This is the opposite of every lecture in Part IV so far. The phone, the sensor, the car and the robot were all shaped by having too little of something. This is shaped by having a great deal of everything and needing it to behave as one machine.',
        ],
        say: [
          'And then the same picture, many times over.',
          {
            text: 'Watch them arrive. There is no new idea in this room. The ninth rack is identical to the first, and that sameness is deliberate, because anything that has to be reasoned about individually does not scale.',
            zoom: 0.9,
          },
          {
            text: '[reflective] Which is the opposite of every lecture in this part so far. The phone, the sensor, the car and the robot were all shaped by having too little of something. This one is shaped by having a great deal of everything, and needing it to behave as one machine.',
            zoom: 1,
          },
        ],
        camera: { position: [0, 6.8, 7.2], target: [0, 0.4, 0], fov: 37 },
        explode: 0,
        focus: 'hall',
      },
    ],
  },

  {
    id: 'splitting',
    scene: 'datacenter',
    marker: '03',
    title: 'Splitting the Work',
    short: 'The job',
    beats: [
      {
        id: 'shard',
        kicker: 'Scatter',
        heading: 'Cut the problem up and hand it out',
        body: [
          'A job too large for one machine is divided and sent out, a piece to each node. This part is cheap: the pieces are independent, they travel in parallel, and nothing has to wait for anything.',
          'If work could always be divided like this, a hundred thousand machines really would be a hundred thousand times faster.',
        ],
        say: [
          'So how do you use a hundred thousand of them?',
          'A job too large for one machine is divided and sent out. A piece to each node. And this part is cheap. The pieces are independent, they travel in parallel, and nothing has to wait for anything.',
          '[pause] If work could always be divided like this, a hundred thousand machines really would be a hundred thousand times faster.',
        ],
        camera: { position: [0, 6.4, 7.0], target: [0, 0.4, 0], fov: 36 },
        explode: 0,
        focus: 'shard',
      },
      {
        id: 'compute',
        kicker: 'Compute',
        heading: 'Everyone works at once',
        body: [
          'Every node runs the same code on its own slice, and none of them needs to know the others exist. This is the part that scales perfectly, and it is the part people mean when they say a problem is parallel.',
          'It is also, usually, not where the time goes.',
        ],
        say: [
          'And here is the part that does scale perfectly.',
          'Every node runs the same code on its own slice, and none of them needs to know the others exist. This is what people mean when they say a problem is parallel.',
          '[matter-of-fact] It is also, usually, not where the time goes.',
        ],
        camera: { position: [0, 6.6, 7.2], target: [0, 0.4, 0], fov: 36 },
        explode: 0,
        focus: 'compute',
      },
      {
        id: 'gather',
        kicker: 'Gather',
        heading: 'And then everything has to arrive in the same place',
        body: [
          'Watch the room go dark while the answers travel. Almost every node has finished and is now idle, waiting, because the result is not the pieces — it is the combination, and the combination happens somewhere specific.',
          'This step does not divide. More machines shorten the compute, not the gather, which if anything grows: one more answer to wait for, one more chance that the slowest is very slow. So the network often matters more than the processors.',
        ],
        say: [
          'Because everything has to come back.',
          'Watch the room go dark while the answers travel. Almost every node has finished, and is now idle, waiting. Because the result is not the pieces. It is the combination — and the combination happens somewhere specific.',
          '[pause] And this step does not divide. More machines shorten the compute, but not the gather. If anything it grows. One more answer to wait for, and one more chance that the slowest is very slow. Which is why the network often matters more than the processors.',
          '[reflective] It is the oldest rule in parallel computing. Whatever fraction of a job cannot be divided sets a floor on how fast it can ever go, no matter how many machines you add. Doubling the hardware halves only the parallel part. The rest becomes the whole cost.',
        ],
        camera: { position: [0, 7.0, 7.4], target: [0, 0.4, 0], fov: 37 },
        explode: 0,
        focus: 'gather',
        aside: {
          label: 'The oldest rule in parallel computing',
          text: 'Whatever fraction of a job cannot be divided sets a floor on how fast it can ever go, no matter how many machines you add. Doubling the hardware halves only the parallel part; the rest becomes the whole cost.',
        },
      },
    ],
  },

  {
    id: 'budget',
    scene: 'datacenter',
    marker: '04',
    title: 'The Real Budget',
    short: 'Power',
    beats: [
      {
        id: 'power',
        kicker: 'What it costs',
        heading: 'The building is a power supply with computers in it',
        body: [
          'At this scale the servers are still the largest cost, but what caps the room is power: how many watts the building can deliver and cool decides what can run in it, and building that capacity costs more than the electricity it carries. Every architectural decision in this room is ultimately a decision about work done per watt per dollar.',
          'The bar shows where the electricity goes. The blue part reaches the computers. The red part does not.',
        ],
        say: [
          'Now the budget, and it is not the one you would guess.',
          'At this scale the servers are still the biggest cost. But what caps the room is power. How many watts the building can deliver, and cool, decides what can run in it. And building that capacity costs more than the electricity it carries.',
          'Every architectural decision in this room is ultimately a decision about work done per watt, per dollar.',
          '[pause] The bar shows where the electricity goes. The blue part reaches the computers. The red part does not.',
        ],
        camera: { position: [0, 6.4, 7.8], target: [0, 0.3, 0.9], fov: 37 },
        explode: 0,
        focus: 'power',
      },
      {
        id: 'cooling',
        kicker: 'Cooling',
        heading: 'Air stops working, so the coolant comes to the chip',
        body: [
          'The whole course has climbed a cooling ladder. A phone had no fan and throttled. A laptop had a fan and a heat pipe. A dense rack today produces heat that moving air cannot practically remove — air runs out at around twenty kilowatts a rack — so liquid is brought to the processor itself.',
          'That is the same argument as Lecture 5\'s heat pipe, at a scale where it decides how the building is plumbed.',
        ],
        say: [
          'And this whole course has been climbing a cooling ladder.',
          'A phone had no fan and throttled. A laptop had a fan and a heat pipe. A dense rack today produces heat that moving air cannot practically remove. Air runs out at around twenty kilowatts a rack.',
          '[matter-of-fact] So liquid is brought to the processor itself. Which is the same argument as lecture five\'s heat pipe, at a scale where it decides how the building is plumbed.',
        ],
        camera: { position: [1.6, 6.0, 7.2], target: [0, 0.3, 0.6], fov: 36 },
        explode: 0,
        focus: 'cooling',
      },
      {
        id: 'pue',
        kicker: 'Overhead',
        heading: 'How much of the power never reaches a computer',
        body: [
          'Watch the red shrink. A typical enterprise room spends around a third of its electricity on everything that is not computing — cooling, conversion losses, distribution. The best hyperscale sites get that down to roughly a tenth.',
          'Same machines, same work, a third of the bill or a tenth. At this scale, the building is part of the computer.',
        ],
        say: [
          'So watch the red shrink.',
          'A typical enterprise room spends around a third of its electricity on everything that is not computing. Cooling, conversion losses, distribution. The best hyperscale sites get that down to roughly a tenth.',
          '[pause] Same machines. Same work. A third of the bill, or a tenth. At this scale the building is part of the computer.',
          '[reflective] And this is the machine with the fewest constraints in the whole course. Power, space and cooling are all purchasable. The last two lectures go the other way — to machines that have to survive where nothing can be replaced, and then to one that has a few tens of milliwatts and a person around it.',
        ],
        camera: { position: [0, 6.2, 7.8], target: [0, 0.3, 1.0], fov: 37 },
        explode: 0,
        focus: 'pue',
        aside: {
          label: 'Where this goes',
          text: 'This is the machine with the fewest constraints in the course — power, space and cooling are all purchasable. The last two lectures go the other way: to machines that must survive where nothing can be replaced, and then to one that has a few tens of milliwatts and a person around it.',
        },
      },
    ],
  },
]
