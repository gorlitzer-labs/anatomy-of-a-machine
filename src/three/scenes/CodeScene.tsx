import { useMemo, useRef } from 'react'
import { useSceneFrame } from '../layers'
import * as THREE from 'three'
import { Part } from '../Part'
import { useNamer } from '../naming'
import { updateDriver } from '../driver'
import { setEmissive } from '../emissive'
import { publishReadout } from '../readout'
import { damp } from '../../lib/math'
import {
  benchMap,
  byteTop,
  instructionTop,
  rackPanel,
  roundedBox,
  sourceTop,
  tiled,
  topFaced,
  type RackArt,
} from '../surfaces'

/**
 * One line of source, falling.
 *
 * The motion is expansion, and it is the only thing this scene needs to say:
 * every step down the ladder is more numerous and less clever than the step
 * above it. One statement becomes a handful of instructions, which become a
 * few dozen bytes, which become a couple of hundred bits — and nothing along
 * the way understands what the line was for.
 *
 * Deliberately blocks rather than text. Rendering source code would invite the
 * reader to read it, and the point is not what the program says; it is what
 * happens to it.
 */

/**
 * Four levels, each wider and finer-grained than the one above.
 *
 * The counts are one statement's worth, all the way down, and they are
 * arithmetically consistent with each other: one line becomes nine
 * instructions, nine four-byte instructions are thirty-six bytes, and
 * thirty-six bytes are 288 bits.
 *
 * Nine is this example, not a law — the count depends on the instruction set,
 * the compiler and its optimisation level. Four bytes each assumes a fixed
 * 32-bit encoding (RISC-V's base set, or 64-bit Arm); x86-64 instructions run
 * from 1 to 15 bytes, so the same line would give a different bit count there.
 * The readout says so rather than leaving the reader to assume it is universal.
 *
 * They used to be 4 / 9 / 22 / 56 with a quarter of each lit, which was
 * impossible in three separate ways at once: 22 bytes cannot be 56 bits (it is
 * 176); a quarter of a nine-block tier is two blocks, not the "nine
 * instructions" the copy states; and 14 lit bit-blocks is not "a couple of
 * hundred ones and zeros". This is a scene whose only job is to carry an
 * expansion ratio, and the ratio on screen was not the ratio in the copy.
 *
 * With one statement at the top the whole of every tier belongs to it, so the
 * sentence can be read straight off the screen.
 */
const TIERS = [
  { id: 'source', y: 1.55, count: 1, w: 1.5, h: 0.2, d: 0.62, colour: '#4fd8ff', face: sourceTop },
  { id: 'asm', y: 0.85, count: 9, w: 0.46, h: 0.16, d: 0.62, colour: '#a06bff', face: instructionTop },
  { id: 'bytes', y: 0.18, count: 36, w: 0.108, h: 0.13, d: 0.62, colour: '#ffab40', face: byteTop },
  { id: 'bits', y: -0.5, count: 288, w: 0.0095, h: 0.1, d: 0.2, colour: '#6ee7a8', glow: 0.8, perByte: 8, lift: 0.04 },
]

/* Narrower than it was (5.4). At 5.4 the rows ran under the copy card on the
   left and into the chapter rail on the right on every beat of the chapter,
   and the rack round them needs room of its own. */
const SPAN = 4.4
const cellX = (i: number, n: number) => (n === 1 ? 0 : (i / (n - 1) - 0.5) * SPAN)

/* The bit row is 288 blocks of a few pixels each. Spread evenly, with bloom
   filling the gaps, it read as one solid bar under copy that asks the reader
   to count it. So the bits sit in eights, each eight under the byte it
   encodes, with a scribe of dark between bytes, and glow a little less. */
const BYTES = 36
const BIT_PITCH = 0.0135
function blockX(tier: (typeof TIERS)[number], i: number) {
  const per = 'perByte' in tier ? tier.perByte : undefined
  if (!per) return cellX(i, tier.count)
  const bit = i % per
  return cellX(Math.floor(i / per), BYTES) + (bit - (per - 1) / 2) * BIT_PITCH
}

/** Which statement is descending, and how far it has got. */
const FALL = 6.5

/*
 * Which of the 288 bits are set. Illustrative and fixed, so the row looks the
 * same on every load: which bits are ones is not the lesson, how many places
 * there are is. A bit is a switch, so a set one stands forward in its housing
 * and a clear one back — the row reads as ones and zeros without a digit on
 * screen, and nothing about it moves.
 */
const BIT_SET = (() => {
  let s = 20250925
  return Array.from({ length: TIERS[3].count }, () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647 < 0.5
  })
})()
const TOGGLE_THROW = 0.045
/** How much of a toggle sits below the bottom of its bit, inside the housing. */
const TOGGLE_SEAT = 0.1

/*
 * The rack: a plinth, two posts, a shelf under each level, and a back panel
 * between the posts. Every level stands on its shelf — the tiers used to hang
 * at four heights in the void, and a ladder you cannot see the rungs of does
 * not read as a ladder.
 */
const SHELF_T = 0.05
const POST = 0.1
const POST_X = SPAN / 2 + 0.36
const FLOOR = TIERS[3].y - TIERS[3].h / 2
const TOP = 1.8
const BACK = -0.46
const SHELF = { z: -0.01, d: 0.86 }
const PLINTH = { h: 0.12, z: 0.05, d: 1.1, w: POST_X * 2 + 0.5 }
const HOUSING = { w: 0.118, h: 0.06, d: 0.46 }

/** Where a tier's shelf top is: the bottom of its blocks. */
const shelfTop = (ti: number) => TIERS[ti].y - TIERS[ti].h / 2

/**
 * The fan-out, parent to child, in panel space — drawn from the same table and
 * the same `blockX` the blocks are placed with, so the routing cannot disagree
 * with what it connects. A comb under each parent: down, along a bus, down
 * into each child.
 */
function rackArt(): RackArt {
  const w = POST_X * 2 + POST
  const h = TOP - FLOOR
  const routes: RackArt['routes'] = []
  for (let ti = 0; ti < TIERS.length - 1; ti++) {
    const parent = TIERS[ti]
    const child = TIERS[ti + 1]
    const from = shelfTop(ti) - SHELF_T - FLOOR
    const to = (ti + 1 === TIERS.length - 1 ? FLOOR + HOUSING.h : child.y + child.h / 2) - FLOOR + 0.01
    const per = child.count / parent.count
    const fine = ti + 1 === TIERS.length - 1
    // Bits sit directly under their byte, so their fan is a splay, not a comb.
    const bus = fine ? from - (from - to) * 0.35 : from - (from - to) * 0.45
    const width = fine ? 0.004 : ti === 0 ? 0.016 : 0.01
    for (let p = 0; p < parent.count; p++) {
      const px = blockX(parent, p)
      for (let c = p * per; c < (p + 1) * per; c++) {
        const cx = blockX(child, c)
        const points: Array<[number, number]> = fine
          ? [[px, from], [px, bus], [cx, to + (bus - to) * 0.4], [cx, to]]
          : [[px, from], [px, bus], [cx, bus], [cx, to]]
        routes.push({ points, width })
      }
    }
  }
  return { w, h, routes }
}

export function CodeScene() {
  return (
    <Part id="code" tags={['source', 'compile', 'expand', 'machine', 'isa']} position={[0, 0, 0]}>
      <Rack />
      {TIERS.map((tier, ti) => (
        <Tier key={tier.id} index={ti} />
      ))}
    </Part>
  )
}

/**
 * The frame the ladder stands in. The same anodised finish and grid pitch as
 * every bench in the course, steel posts like the pipeline's clock stands, and
 * never lit — the only light in this scene is the statement's descent.
 *
 * Unnamed on purpose: it is the furniture, and the nearest hit wins.
 */
function Rack() {
  const art = useMemo(rackArt, [])
  const panel = useMemo(() => rackPanel(art), [art])
  const shelf = useMemo(() => tiled(benchMap(), (POST_X * 2 - POST) / 0.5, SHELF.d / 0.5), [])
  const plinth = useMemo(() => tiled(benchMap(), PLINTH.w / 0.5, PLINTH.d / 0.5), [])
  const height = TOP - FLOOR
  return (
    <group>
      <mesh position={[0, FLOOR - PLINTH.h / 2, PLINTH.z]} receiveShadow geometry={roundedBox(PLINTH.w, PLINTH.h, PLINTH.d, 0.05)}>
        <meshStandardMaterial color="#ffffff" map={plinth} roughness={0.62} metalness={0.35} />
      </mesh>

      {/* The back panel, with the family tree routed into its face. */}
      <mesh position={[0, FLOOR + height / 2, BACK]} receiveShadow geometry={roundedBox(art.w, height, 0.04, 0.015)}>
        <meshStandardMaterial color="#0c1119" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, FLOOR + height / 2, BACK + 0.021]} receiveShadow>
        <planeGeometry args={[art.w - 0.03, height - 0.03]} />
        <meshStandardMaterial color="#ffffff" map={panel} roughness={0.58} metalness={0.35} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * POST_X, FLOOR + height / 2, BACK + 0.04]}
          castShadow
          receiveShadow
          geometry={roundedBox(POST, height, POST, 0.025)}
        >
          <meshStandardMaterial color="#232a33" roughness={0.3} metalness={0.9} />
        </mesh>
      ))}

      {/* A shelf under every level but the last, which stands on the plinth. */}
      {TIERS.slice(0, -1).map((tier, ti) => (
        <group key={tier.id} position={[0, shelfTop(ti) - SHELF_T / 2, SHELF.z]}>
          <mesh castShadow receiveShadow geometry={roundedBox(POST_X * 2 - POST, SHELF_T, SHELF.d, 0.018)}>
            <meshStandardMaterial color="#ffffff" map={shelf} roughness={0.62} metalness={0.35} />
          </mesh>
          {/* A bright machined nose, so each rung catches a line of light. */}
          <mesh position={[0, 0, SHELF.d / 2 - 0.006]} geometry={roundedBox(POST_X * 2 - POST - 0.02, SHELF_T * 0.7, 0.014, 0.006)}>
            <meshStandardMaterial color="#3a4654" roughness={0.26} metalness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Tier({ index }: { index: number }) {
  const tier = TIERS[index]
  const named = useNamer('code')
  const group = useRef<THREE.Group>(null!)
  const levels = useRef<number[]>(Array.from({ length: tier.count }, () => 0))
  const base = useMemo(() => new THREE.Color(tier.colour), [tier.colour])

  useSceneFrame((state, dt) => {
    const d = updateDriver(state.clock.elapsedTime)
    const focus = d.motion ?? ''
    const t = state.clock.elapsedTime

    /* One statement, and its descent reaches each level in turn. Every block of
       every tier belongs to it, so what the reader counts is the whole row:
       one line, nine instructions, thirty-six bytes, 288 bits. */
    const cycle = t % FALL
    const which = Math.floor(t / FALL) % TIERS[0].count
    // Levels below the top arrive a beat later each.
    const arrivesAt = 0.6 + index * 0.9
    const reached = cycle > arrivesAt
    const lit = focus === 'compile' || focus === 'expand' || focus === 'machine' || focus === 'isa'

    const per = tier.count / TIERS[0].count
    const from = Math.round(which * per)
    const to = Math.round((which + 1) * per)

    group.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial
      const inRun = i >= from && i < to
      const want = lit && reached && inRun ? 1 : 0
      levels.current[i] = damp(levels.current[i], want, 7, dt)
      const v = levels.current[i]
      mat.color.copy(base).multiplyScalar(0.16 + v * 0.2)
      setEmissive(mat, 0.1 + v * 1.5 * (('glow' in tier ? tier.glow : undefined) ?? 1))
      // The descending run also lifts slightly, so the eye can follow it down.
      // Bits rise less: they are switches, and a full lift stood them clear of
      // their housings, where the bloom ran the row together into one smear.
      mesh.position.y = v * (('lift' in tier ? tier.lift : undefined) ?? 0.09)
    })

    if (index === TIERS.length - 1 && lit) {
      publishReadout('code', d.scene, [
        { label: 'One statement', value: '1 line' },
        { label: 'Instructions', value: '9, in this example' },
        { label: 'Encoding', value: '32 bits each, as on RISC-V or Arm' },
        { label: 'Bytes', value: '36' },
        { label: 'Bits', value: '288', key: true },
      ])
    }
  })

  const bits = 'perByte' in tier
  const face = 'face' in tier ? tier.face?.() : undefined
  const geometry = useMemo(
    () =>
      bits
        ? /* A toggle is longer than what shows of it: the rest is seated in the
             housing, so the lift that marks the descending run raises it
             rather than pulling it clean out. */
          roundedBox(tier.w, tier.h + TOGGLE_SEAT, tier.d, 0.003).clone().translate(0, -TOGGLE_SEAT / 2, 0)
        : topFaced(tier.w, tier.h, tier.d, Math.min(0.04, tier.w * 0.2)),
    [bits, tier],
  )

  return (
    <group position={[0, tier.y, 0]}>
      {/* Only lit blocks go in here: the frame loop above walks these children. */}
      <group ref={group}>
        {Array.from({ length: tier.count }, (_, i) => (
          <mesh
            key={i}
            position={[blockX(tier, i), 0, bits ? (BIT_SET[i] ? TOGGLE_THROW : -TOGGLE_THROW) : 0]}
            castShadow
            geometry={geometry}
            {...named(`code:${tier.id}`)}
          >
            {/* Each level's face says what it is — a line of tokens, an
                instruction word's fields, a byte's eight places — under the
                same clear lacquer as the pipeline's instructions. The colour
                is still which level it is. */}
            <meshPhysicalMaterial
              color={tier.colour}
              emissive={tier.colour}
              emissiveMap={face}
              emissiveIntensity={0.1}
              roughness={bits ? 0.4 : 0.32}
              metalness={0.3}
              clearcoat={bits ? 0.2 : 0.6}
              clearcoatRoughness={0.15}
            />
          </mesh>
        ))}
      </group>
      {/* A bit is a switch: every eight of them sit in a housing, under the
          byte they spell. */}
      {bits && (
        <group>
          {Array.from({ length: BYTES }, (_, b) => (
            <mesh
              key={b}
              position={[blockX(TIERS[2], b), FLOOR + HOUSING.h / 2 - tier.y, 0]}
              castShadow
              receiveShadow
              geometry={roundedBox(HOUSING.w, HOUSING.h, HOUSING.d, 0.012)}
              {...named(`code:${tier.id}`)}
            >
              <meshPhysicalMaterial color="#141a22" roughness={0.42} metalness={0.2} clearcoat={0.4} clearcoatRoughness={0.3} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}
