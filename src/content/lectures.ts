import type { Lecture } from './types'
import { chapters } from './chapters'
import { boardChapters } from './board'
import { memoryChapters } from './memory'
import { timeChapters } from './time'
import { fabChapters } from './fab'
import { ioChapters } from './io'
import { kernelChapters } from './kernel'
import { osChapters } from './os'
import { bootChapters } from './boot'
import { codeChapters } from './code'
import { phoneChapters } from './phone'
import { edgeChapters } from './edge'
import { carChapters } from './car'
import { robotChapters } from './robot'
import { datacenterChapters } from './datacenter'
import { extremesChapters } from './extremes'
import { implantChapters } from './implant'

/**
 * The course.
 *
 * Lecture 1 is written; the rest are the curriculum map (`docs/CURRICULUM.md`)
 * expressed as data so the syllabus screen can show the whole shape of the
 * course rather than only the part that happens to be finished. A planned
 * lecture carries no chapters and renders as unavailable.
 *
 * `constraint` is the spine: every lecture names what dominated its design and
 * what was traded away for it. A lecture that cannot state its trade is not
 * ready to be written.
 */
/**
 * True when every beat in a lecture carries a narration script.
 *
 * Derived from the content rather than from the rendered manifest, so the
 * syllabus needs no fetch on the first screen and cannot be wrong offline. It
 * answers "is this lecture narrated", not "has the audio been rendered" — an
 * unrendered but scripted lecture still speaks, in the browser's own voice.
 *
 * All-or-nothing on purpose. A lecture scripted three beats out of thirteen is
 * not narrated, and badging it as though it were is the kind of half-truth this
 * course keeps having to go back and fix.
 */
export const isNarrated = (lecture: Lecture) =>
  lecture.state === 'live' &&
  lecture.chapters.length > 0 &&
  lecture.chapters.every((c) => c.beats.every((b) => b.say?.length))

export const lectures: Lecture[] = [
  {
    id: 'chip',
    number: 1,
    title: 'The Chip',
    subtitle: 'From a slab you can hold down to a single switch, and back up again',
    state: 'live',
    chapters,
  },
  {
    id: 'memory',
    number: 2,
    title: 'Memory & State',
    subtitle: 'A gate that remembers, and the ladder of copies around it',
    constraint: 'Distance is time. Every memory technology is a bribe paid for a shorter walk.',
    state: 'live',
    chapters: memoryChapters,
  },
  {
    id: 'time',
    number: 3,
    title: 'Time',
    subtitle: 'Clocks, pipelines, and why clock speed stopped climbing',
    constraint: 'Light only moves so far per tick. Everything clever in a core is an attempt to not wait.',
    state: 'live',
    chapters: timeChapters,
  },
  {
    id: 'fab',
    number: 4,
    title: 'How Silicon Is Made',
    subtitle: 'Printing a circuit with light',
    constraint: 'You are printing with light at a wavelength larger than the thing you are printing.',
    state: 'live',
    chapters: fabChapters,
  },
  {
    id: 'board',
    number: 5,
    title: 'The Board',
    subtitle: 'A laptop, taken apart the way the package was',
    constraint: 'A sealed box with a fixed power and heat budget.',
    state: 'live',
    chapters: boardChapters,
  },
  {
    id: 'io',
    number: 6,
    title: 'I/O',
    subtitle: 'Interrupts, DMA, and how a machine touches the world',
    constraint: 'The world is analogue, asynchronous, and does not wait for you.',
    state: 'live',
    chapters: ioChapters,
  },
  {
    id: 'boot',
    number: 7,
    title: 'Boot',
    subtitle: 'Voltage rises, and eleven seconds later there is a prompt',
    constraint: 'At t=0 nothing is initialised, including the thing that initialises things.',
    state: 'live',
    chapters: bootChapters,
  },
  {
    id: 'kernel',
    number: 8,
    title: 'The Kernel',
    subtitle: 'Rings, syscalls, scheduling, and virtual memory',
    constraint: 'One machine, many programs, none of which trust each other.',
    state: 'live',
    chapters: kernelChapters,
  },
  {
    id: 'os',
    number: 9,
    title: 'Operating Systems',
    subtitle: 'Monolithic and micro, Linux and NT and Darwin, and the RTOS',
    constraint: 'Who decides what runs next, and can you prove it decides in time.',
    state: 'live',
    chapters: osChapters,
  },
  {
    id: 'compile',
    number: 10,
    title: 'From Code to Current',
    subtitle: 'Source, compiler, ISA, machine code, and the transistors that switch',
    constraint: 'Closes the loop back to Lecture 1. Can only be built once everything beneath it exists.',
    state: 'live',
    chapters: codeChapters,
  },
  {
    id: 'phone',
    number: 11,
    title: 'The Phone',
    subtitle: 'Nearly everything on one die, in a sealed slab with no fan',
    constraint: 'Energy per task. Traded: sustained performance, serviceability, thermal headroom.',
    state: 'live',
    chapters: phoneChapters,
  },
  {
    id: 'edge',
    number: 12,
    title: 'The Edge',
    subtitle: 'Microcontrollers, bare metal, and sub-watt budgets',
    constraint: 'Power, and no human nearby. Traded: an OS, a screen, the assumption you can reboot it.',
    state: 'live',
    chapters: edgeChapters,
  },
  {
    id: 'car',
    number: 13,
    title: 'The Car',
    subtitle: 'Zonal architecture, lockstep cores, and computers that must not fail',
    constraint: 'It must not fail, for fifteen years, in a vibrating oven. Traded: cutting-edge silicon, cost, update freedom.',
    state: 'live',
    chapters: carChapters,
  },
  {
    id: 'robot',
    number: 14,
    title: 'The Robot',
    subtitle: 'Sense, plan, act — and the deadline that cannot slip',
    constraint: 'Close a physical loop before the world moves. Traded: generality.',
    state: 'live',
    chapters: robotChapters,
  },
  {
    id: 'datacenter',
    number: 15,
    title: 'The Datacenter',
    subtitle: 'Racks, interconnect, and machines that never stop',
    constraint: 'Throughput per watt per dollar, times a hundred thousand.',
    state: 'live',
    chapters: datacenterChapters,
  },
  {
    id: 'extremes',
    number: 16,
    title: 'The Extremes',
    subtitle: 'Space, radiation, and computers that are not von Neumann',
    constraint: 'Survival. Traded: everything else, cheerfully.',
    state: 'live',
    chapters: extremesChapters,
  },
  {
    id: 'implant',
    number: 17,
    title: 'The Implant',
    subtitle: 'A computer that has to think inside a skull, on a few tens of milliwatts',
    constraint:
      'You may not heat the tissue, you may not change the battery, and you cannot get the data out.',
    state: 'live',
    chapters: implantChapters,
  },
]

export const liveLectures = lectures.filter((l) => l.state === 'live')

/**
 * The four movements of the course, used to group the syllabus.
 *
 * Parts are presentation, not navigation — the reader picks a lecture, never a
 * part — so they live here as a grouping over `lectures` rather than as another
 * level of the content tree.
 */
export const parts = [
  {
    no: 'Part I',
    name: 'Silicon',
    blurb: 'What everything is made of',
    lectures: [1, 2, 3, 4],
  },
  {
    no: 'Part II',
    name: 'The Machine',
    blurb: 'A chip becomes a computer',
    lectures: [5, 6, 7],
  },
  {
    no: 'Part III',
    name: 'Software',
    blurb: 'The layer that makes silicon useful',
    lectures: [8, 9, 10],
  },
  {
    no: 'Part IV',
    name: 'Machines for Purposes',
    blurb: 'The same primitives under different budgets',
    lectures: [11, 12, 13, 14, 15, 16, 17],
  },
]

export const lectureByNumber = (n: number) => lectures.find((l) => l.number === n)

export const indexOfLecture = (id: string) => lectures.findIndex((l) => l.id === id)
