import * as THREE from 'three'

/**
 * A phone system-on-chip, and the heat it cannot get rid of.
 *
 * The whole lecture is one gap, and it is a measured one: a phone can shed
 * roughly 3-5 W continuously through its case, while heavy work asks for
 * 6-10 W and more. A flagship SoC can therefore always produce more heat than
 * the phone it lives in can lose — so peak performance is by definition
 * temporary, and the interesting engineering is entirely about what to do when
 * that runs out.
 *
 * The other measured thing worth carrying: the limit is *skin* temperature, not
 * junction temperature. The chip could take more. Your hand could not.
 */

export type Role = 'prime' | 'little' | 'gpu' | 'npu' | 'isp' | 'modem' | 'mem'

export type Block = {
  id: string
  role: Role
  x: number
  z: number
  w: number
  d: number
}

export const C: Record<Role, THREE.Color> = {
  prime: new THREE.Color('#4fd8ff'),
  little: new THREE.Color('#7fe9ff'),
  gpu: new THREE.Color('#a06bff'),
  npu: new THREE.Color('#ff7ad9'),
  isp: new THREE.Color('#6ee7a8'),
  modem: new THREE.Color('#ffab40'),
  mem: new THREE.Color('#c08bff'),
}

/**
 * One die, and nearly everything the machine is.
 *
 * Deliberately laid out to be compared with Lecture 5's board: the same
 * functions, minus the sockets, the slots, the connectors and the fan, all
 * printed together because there is no room for anything else.
 */
/* Every block keeps clear of its neighbours. The small cores used to run into
   the GPU and the modem into the memory, and a lit core growing taller made
   the collision obvious. `window.__overlaps(0.06, 'mesh')` in the dev build
   reports any pair that interpenetrates. */
export const BLOCKS: Block[] = [
  // Two prime cores: large, fast, and rarely on.
  { id: 'prime0', role: 'prime', x: -1.55, z: -0.95, w: 0.92, d: 0.92 },
  { id: 'prime1', role: 'prime', x: -1.55, z: 0.15, w: 0.92, d: 0.92 },
  // Efficiency cores: small, slow, and almost always on.
  ...[0, 1, 2, 3].map((i) => ({
    id: `little${i}`,
    role: 'little' as Role,
    x: -0.78 + (i % 2) * 0.5,
    z: -0.95 + Math.floor(i / 2) * 0.5,
    w: 0.42,
    d: 0.42,
  })),
  { id: 'gpu', role: 'gpu', x: 0.72, z: -0.62, w: 1.35, d: 1.5 },
  { id: 'npu', role: 'npu', x: 2.0, z: -0.9, w: 0.85, d: 0.95 },
  { id: 'isp', role: 'isp', x: 2.0, z: 0.22, w: 0.85, d: 0.62 },
  { id: 'modem', role: 'modem', x: 1.2, z: 0.9, w: 1.9, d: 0.6 },
  { id: 'mem', role: 'mem', x: -1.05, z: 1.35, w: 2.4, d: 0.72 },
]

export const DIE = { w: 5.2, d: 3.6 }

/**
 * The package substrate the die is soldered to, under the die's underside at
 * y = -0.12. A quarter of a unit proud of the die all round, which is room for
 * the capacitor ring and no more: the gauge sits in front of it on the heat
 * beats, and the die already runs under the copy card on its left.
 */
export const PKG = { w: DIE.w + 0.5, d: DIE.d + 0.5, h: 0.1, y: -0.17 }

/* ------------------------------------------------------------------ */
/* Thermal                                                             */
/* ------------------------------------------------------------------ */

/**
 * The bar is watts. All of it, only watts.
 *
 * It used to be one unlabelled axis carrying two different quantities: the copy
 * called the green mark "what it can shed continuously — very roughly three to
 * five watts" (power) while the right-hand end was "too hot to hold" and the
 * aside gave 43-48 °C (temperature). A reader could not tell what the bar
 * measured, and the code called the quantity `heat` while `SUSTAINED` was
 * documented as a share of *demand*.
 *
 * Power is the honest choice, because power is what the design controls and
 * temperature is what results. The scale is 0-10 W: a phone sheds roughly
 * 3-5 W continuously, and heavy work asks for 6-10 W.
 */
export const WATTS_MAX = 10
export const SHED_MIN_W = 3
export const SHED_MAX_W = 5

/** Sustained dissipation a phone case can manage, as a share of the scale. */
export const SUSTAINED = 0.45

export const THERMAL_CYCLE = 24

export type Thermal = {
  /** 0..1 how hard the machine is being asked to work. */
  load: number
  /** 0..1 of the 0-10 W scale: how much power the machine is asking for. */
  heat: number
  /** The same figure in watts, which is what the copy states. */
  watts: number
  throttled: boolean
  /** Clock multiplier. Everything in the scene animates at this rate. */
  clock: number
}

/**
 * Heat over one demo cycle: a heavy task, then idle.
 *
 * A pure function of time rather than an integrator, so the beat is
 * reproducible — a reader stepping back and forward sees the same run, and the
 * moment of throttling always lands in the same place.
 */
export function thermalAt(t: number): Thermal {
  const c = t % THERMAL_CYCLE
  const busy = c < 15
  const heat = busy ? Math.min(1, c / 10) : Math.max(0, 1 - (c - 15) / 7)
  const throttled = heat > 0.72
  /* Once the case is at its limit the only remaining control is the clock, so
     it comes down — and everything in the scene slows with it, because that is
     precisely what the reader is meant to notice. */
  const clock = throttled ? Math.max(0.42, 1 - (heat - 0.72) * 2.0) : 1
  return { load: busy ? 1 : 0, heat, watts: heat * WATTS_MAX, throttled, clock }
}

/**
 * Whether a block is powered at all.
 *
 * Power gating is the one motion in this scene that no earlier lecture has:
 * a block that is not needed is not dimmed, it is *off*, disconnected from the
 * supply entirely and drawing nothing. Most of this die is off most of the
 * time, which is the only way the power budget works at all.
 */
export function powered(block: Block, t: number, focus: string): boolean {
  const th = thermalAt(t)
  const beat = (t * th.clock) % 12

  if (focus === 'gating' || focus === 'dark') {
    switch (block.role) {
      case 'little':
        return true // the phone is never fully asleep
      case 'prime':
        return beat > 3 && beat < 5.5
      case 'gpu':
        return beat > 1 && beat < 4
      case 'npu':
        return beat > 6.5 && beat < 8
      case 'isp':
        return beat > 8.5 && beat < 10
      case 'modem':
        return beat % 4 < 1.2
      case 'mem':
        return true
    }
  }

  if (focus === 'little' || focus === 'prime' || focus === 'scheduler') {
    if (block.role === 'little') return true
    if (block.role === 'prime') return beat % 6 < 1.8
    return block.role === 'mem'
  }

  return true
}
