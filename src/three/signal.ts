import { create } from 'zustand'

export type GateKind = 'not' | 'and' | 'or' | 'xor'
/** `halfadder` is not a gate — it is an XOR and an AND sharing two inputs. */
export type TruthKind = GateKind | 'halfadder'

export const GATE_OPS: Record<GateKind, (a: number, b: number) => number> = {
  not: (a) => (a ? 0 : 1),
  and: (a, b) => (a && b ? 1 : 0),
  or: (a, b) => (a || b ? 1 : 0),
  xor: (a, b) => (a !== b ? 1 : 0),
}

/** Seconds each row of a truth table is held. Slow enough to read. */
export const STEP_PERIOD = 1.9

/**
 * Which truth-table row is showing right now.
 *
 * Everything derives from one integer tick so the 3D scene and the DOM table
 * cannot drift apart: the scene computes it from its own clock, the DOM reads
 * the same number out of the store, and both map it to a row the same way.
 */
export function tickAt(elapsed: number) {
  return Math.floor(elapsed / STEP_PERIOD)
}

/** A single-input gate only has two rows, so it cycles twice as fast. */
export function rowFor(kind: TruthKind, tick: number) {
  return kind === 'not' ? tick % 2 : tick % 4
}

export function inputsFor(kind: TruthKind, tick: number) {
  const row = rowFor(kind, tick)
  if (kind === 'not') return { a: row, b: 0, row }
  return { a: (row >> 1) & 1, b: row & 1, row }
}

/** Output(s) for a given kind and row. */
export function outputsFor(kind: TruthKind, tick: number) {
  const { a, b } = inputsFor(kind, tick)
  if (kind === 'halfadder') {
    return { sum: GATE_OPS.xor(a, b), carry: GATE_OPS.and(a, b) }
  }
  return { out: GATE_OPS[kind](a, b) }
}

type SignalStore = {
  tick: number
  setTick: (t: number) => void
}

/**
 * Ticks about every two seconds, so unlike the scroll values this is cheap
 * enough to live in React and drive the DOM truth table directly.
 */
export const useSignalStore = create<SignalStore>((set) => ({
  tick: 0,
  setTick: (tick) => set((s) => (s.tick === tick ? s : { ...s, tick })),
}))
