import type { Chapter } from './types'

/**
 * Lecture 3 — Time.
 *
 * Lecture 2 ended on "distance is time". This one makes that the whole story:
 * light only moves so far per tick, so everything clever in a processor is an
 * attempt to not wait — and the last chapter is what happened when that
 * attempt hit a wall made of physics.
 *
 * Dates and figures checked rather than recalled: Dennard scaling broke down
 * in the mid-2000s when supply voltage stopped falling with feature size (Hennessy
 * and Patterson: slowing from 2007, near nothing by 2012), Intel cancelled a
 * 4 GHz Pentium 4 in October 2004 — officially to move people to dual-core,
 * widely read as heat — and top boost clocks have crept only from 3.8 GHz to
 * about 6 GHz since.
 */
export const timeChapters: Chapter[] = [
  {
    id: 'clock',
    scene: 'pipeline',
    marker: '01',
    title: 'The Clock',
    short: 'Clock',
    beats: [
      {
        id: 'clock',
        kicker: 'The beat',
        heading: 'One shared drum, and nothing moves between beats',
        body: [
          'A flip-flop only takes a new value on a clock edge. Wire millions of them to the same signal and the whole machine becomes a thing that changes in steps rather than continuously.',
          'That is the clock: not a speed, a *permission*. Everything holds still, the edge arrives, everything moves at once, and it holds still again.',
        ],
        say: [
          'Lecture two ended on a promise. Distance is time. [pause] This is where that becomes the whole story.',
          'A flip-flop only takes a new value on a clock edge. Wire millions of them to the same signal, and the whole machine becomes a thing that changes in steps, rather than continuously.',
          '[matter-of-fact] So a clock is not a speed. It is a permission. Everything holds still, the edge arrives, everything moves at once, and then it holds still again.',
          '[reflective] And why have one shared drum at all? Because the alternative is every part deciding for itself when its input is ready, and making sure a million such decisions never disagree is much harder to design and to check than making everyone wait. Clockless chips have been built. They are just rare.',
        ],
        camera: { position: [0.0, 9.18, 11.22], target: [0, 0, -0.5], fov: 34 },
        explode: 0,
        focus: 'clock',
        labels: [
          { text: 'The edge', part: 'pipeline', offset: [1.6, 0.7, -1.55], tone: 'amber' },
        ],
        aside: {
          label: 'Why a shared clock at all',
          text: 'Because the alternative is every part deciding for itself when its input is ready, and making sure a million such decisions never disagree is much harder to design and to verify than making everyone wait for a drum. Clockless chips have been built and shipped; they are just rare.',
        },
      },
      {
        id: 'stages',
        kicker: 'One instruction',
        heading: 'Five things have to happen, in order',
        body: [
          'Fetch the instruction. Decode what it means. Execute it. Reach memory if it needs to. Write the answer back. Each step needs the one before it to have finished.',
          'Do them one instruction at a time and four fifths of the machine is idle at every moment — which is exactly what the next chapter refuses to accept.',
        ],
        say: [
          'Every instruction goes through the same five steps.',
          'Fetch it. Decode what it means. Execute it. Reach memory, if it needs to. Write the answer back. And each step needs the one before it to have finished.',
          '[pause] Now count what is idle. Do them one instruction at a time, and four fifths of the machine is doing nothing at any given moment. Which is exactly what the next chapter refuses to accept.',
        ],
        camera: { position: [0.0, 8.5, 10.2], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'stages',
        labels: [
          { text: 'Fetch', part: 'pipeline', offset: [-1.95, 0.5, -1.35], tone: 'cyan' },
          { text: 'Write back', part: 'pipeline', offset: [2.3, 0.5, -1.25], tone: 'cyan' },
        ],
      },
    ],
  },

  {
    id: 'pipelining',
    scene: 'pipeline',
    marker: '02',
    title: 'Pipelining',
    short: 'Pipeline',
    beats: [
      {
        id: 'overlap',
        kicker: 'Overlap',
        heading: 'Start the next one before this one finishes',
        body: [
          'Nothing says the fetch unit has to sit idle while the execute unit works. Hand it the next instruction immediately, and the one after that to the stage behind, until every stage is busy on a different instruction.',
          'Any single instruction still takes five ticks, but one finishes every tick instead of every fifth — up to five times the work from the same silicon. Real pipelines get less, because stages are never perfectly even and some ticks are lost to waiting.',
        ],
        say: [
          'Nothing says the fetch unit has to sit and wait while the execute unit works.',
          {
            text: 'So hand it the next instruction immediately. And the one after that to the stage behind. Until every stage is busy, each on a different instruction.',
            zoom: 0.9,
          },
          '[pause] Any single instruction still takes five ticks. But now one finishes every tick, instead of every fifth. Up to five times the work out of the same silicon. In practice a little less, because the stages are never perfectly even, and some ticks are lost to waiting.',
          {
            text: '[matter-of-fact] Be careful what that means, though. Pipelining does not make one instruction faster. It makes instructions arrive more often. A washing machine and a tumble dryer together do not wash any faster. You just get a load out every hour instead of every two.',
            zoom: 1,
          },
        ],
        camera: { position: [0.0, 8.84, 10.54], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'overlap',
        aside: {
          label: 'Latency and throughput are different things',
          text: 'Pipelining does not make one instruction faster. It makes instructions arrive more often. A washing machine and a tumble dryer together do not wash any faster; you get a load out every hour instead of every two.',
        },
      },
      {
        id: 'hazard',
        kicker: 'Stalls',
        heading: 'A hole travelling down the pipe',
        body: [
          'Now the catch. If an instruction needs a result the one just ahead of it has not produced yet, it may have to wait. Usually the hardware passes the result straight across the moment it exists, but a value still on its way back from memory arrives too late. Then the instruction cannot start, and neither can anything behind it. The pipeline inserts a bubble — an empty slot — and lets it move along.',
          'Watch the gaps. Every one of them is a tick where a stage did no work, and the machine cannot get that tick back.',
        ],
        say: [
          'Now the catch.',
          'If an instruction needs a result that the one just ahead of it has not produced yet, it may have to wait.',
          'Usually, the hardware passes the result straight across the moment it exists. But a value still on its way back from memory arrives too late. Then the instruction cannot start. And neither can anything behind it. The pipeline slips in an empty slot, called a bubble.',
          '[pause] Watch the gaps. Every one of them is a tick where a stage did no work, and the machine never gets that tick back.',
        ],
        camera: { position: [0.68, 8.5, 9.86], target: [0, 0, 0], fov: 34 },
        explode: 0,
        focus: 'hazard',
        labels: [
          { text: 'A wasted tick', part: 'pipeline', offset: [0, 0.6, 1.15], tone: 'amber' },
        ],
      },
      {
        id: 'branch',
        kicker: 'Branches',
        heading: 'Which instruction comes next?',
        body: [
          'A conditional jump is worse than a stall, because the machine does not know what to fetch next until the condition has been evaluated — several stages later.',
          'Waiting would empty the pipeline every time a program made a decision, and programs make decisions constantly. So processors do not wait.',
        ],
        say: [
          'A conditional jump is worse than a stall.',
          'Because the machine does not know what to fetch next until the condition has been evaluated, and that happens several stages later.',
          '[reflective] Waiting would empty the pipeline every time a program made a decision. And programs make decisions constantly. So processors do not wait.',
        ],
        camera: { position: [-1.36, 8.84, 9.86], target: [-0.4, 0, 0], fov: 34 },
        explode: 0,
        focus: 'branch',
      },
    ],
  },

  {
    id: 'guessing',
    scene: 'pipeline',
    marker: '03',
    title: 'Guessing',
    short: 'Guessing',
    beats: [
      {
        id: 'speculation',
        kicker: 'Speculation',
        heading: 'Guess, run ahead, and be ready to throw it away',
        body: [
          'The processor predicts which way the branch will go and carries on as if it were certain. The violet instructions are that guess: real work, executing, on an assumption.',
          'When the branch resolves and the guess was wrong, every speculative instruction is discarded. Watch them vanish. All that work happened and none of it counted.',
        ],
        say: [
          'Instead, it guesses.',
          'The processor predicts which way the branch will go and carries straight on, as if it were certain. Those violet instructions are the guess. Real work, executing, on an assumption.',
          '[pause] Then the branch resolves. And when the guess was wrong, every speculative instruction is discarded. Watch them vanish. All of that work happened, and none of it counted.',
          '[matter-of-fact] Which sounds reckless, until you look at the alternative. Modern predictors are right well over nine times in ten. Even so, a deep modern core can throw away around a fifth of the instructions it runs. That is a real cost, in time and in energy. But the alternative is emptying the pipeline at every if statement, and that costs far more.',
        ],
        camera: { position: [1.02, 9.18, 10.2], target: [0.2, 0, 0], fov: 34 },
        explode: 0,
        focus: 'speculation',
        labels: [
          { text: 'Executing on a guess', part: 'pipeline', offset: [0.6, 0.65, 1.15], tone: 'violet' },
        ],
        aside: {
          label: 'Why it is worth it',
          text: 'Modern predictors are right well over nine times in ten, and even so a deep modern core can discard around a fifth of the instructions it executes — a real cost in energy. It is still far cheaper than the alternative, which is emptying the pipeline at every if statement.',
        },
      },
      {
        id: 'depth',
        kicker: 'The cost of depth',
        heading: 'Deeper pipelines throw away more',
        body: [
          'A short pipeline could resolve a branch a stage or two after issuing it, so a wrong guess cost almost nothing. Split the work into more, shorter stages and each stage can run faster — which was about half of how clock speeds climbed; faster transistors were the other half.',
          'But the deeper the pipeline, the longer until the branch resolves, and the more speculative work is in flight to be thrown away when it does. Speed bought at one end is paid for at the other.',
        ],
        say: [
          {
            text: 'So why not split the work into more stages, each of them shorter?',
            zoom: 0.9,
          },
          'Each stage can then run faster. That was about half of how clock speeds climbed for two decades. Faster transistors were the other half.',
          {
            text: '[pause] But the deeper the pipeline, the longer it takes for a branch to resolve, and the more speculative work is in flight to be thrown away when it does. Speed bought at one end is paid for at the other.',
            zoom: 1,
          },
        ],
        camera: { position: [0.0, 10.2, 11.22], target: [0, 0, 0], fov: 36 },
        explode: 0,
        focus: 'speculation',
      },
    ],
  },

  {
    id: 'wall',
    scene: 'pipeline',
    marker: '04',
    title: 'The Wall',
    short: 'The wall',
    beats: [
      {
        id: 'wall',
        kicker: 'Power',
        heading: 'Speed costs power faster than it delivers speed',
        body: [
          'The power a chip burns switching goes as the share of it that switches, times its capacitance, times voltage squared, times frequency. Frequency is linear — but for decades, pushing frequency meant pushing voltage too, and that term is squared.',
          'So the bars do not climb, they bend away. The red line is roughly what a package and a fan can remove; above it is a processor nobody can ship.',
        ],
        say: [
          'And then it stopped. Here is why.',
          'The power a chip burns switching goes as how much of it is switching, times its capacitance, times its voltage squared, times its frequency. Frequency is linear. But for decades, pushing frequency meant pushing voltage too. And that term is squared.',
          '[pause] So the bars do not climb. They bend away. That red line is roughly what a package and a fan can remove, and above it is a processor nobody can ship.',
          '[matter-of-fact] The rule that made it work was called Dennard scaling. Shrink a transistor, and you could drop its voltage too. It broke down in the mid two thousands, when voltage stopped falling and leakage stopped being negligible. Intel cancelled a four gigahertz part in two thousand and four, largely over this. Since then, top clock speeds have crept from under four gigahertz to about six.',
        ],
        camera: { position: [0.0, 7.14, 12.58], target: [0, 1.1, 0], fov: 36 },
        explode: 0,
        focus: 'wall',
        readout: true,
        aside: {
          label: 'What broke, and when',
          text: 'Dennard scaling — the rule that shrinking a transistor let you drop its voltage too — broke down in the mid-2000s, when voltage stopped falling and leakage stopped being negligible. Intel cancelled a 4 GHz part in 2004, largely over this; since then top boost clocks have crept only from 3.8 GHz to about 6.2 GHz.',
        },
      },
      {
        id: 'cores',
        kicker: 'The answer',
        heading: 'If not faster, wider',
        body: [
          'Two cores at three gigahertz, at the lower voltage a slower clock allows, burn far less than one at six. So every processor since grew sideways.',
          'It also moved the problem onto you. A faster clock sped up every program ever written; more cores only help programs that can be split — and most of the interesting ones cannot be, entirely.',
        ],
        say: [
          'So if you cannot go faster, you go wider.',
          '[matter-of-fact] And read the numbers here, because they are the entire argument. Two cores at three gigahertz, against one core at six. The same work on paper, if the work splits perfectly in two. Now look at the power. The slower cores can run at a lower voltage, and the voltage term punishes the fast one that hard.',
          '[pause] That arithmetic is why every processor since has grown sideways instead of upward.',
          '[reflective] And it quietly moved the problem onto you. A faster clock sped up every program ever written. More cores only help the programs that can be split, and most of the interesting ones cannot be. Not entirely.',
          'That is the last thing this part of the course had to explain. [pause] What is left is how the pattern gets onto the crystal in the first place.',
        ],
        camera: { position: [0.0, 7.82, 13.26], target: [0, 1.0, 0], fov: 38 },
        explode: 0,
        focus: 'cores',
        readout: true,
        aside: {
          label: 'Where this goes',
          text: 'More cores is not automatically faster. This is why they exist anyway: not because parallelism was desirable, but because frequency was no longer available.',
        },
      },
    ],
  },
]
