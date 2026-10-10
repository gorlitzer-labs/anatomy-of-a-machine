import { Suspense, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ChromaticAberration, ToneMapping, Noise } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { Scene } from './three/Scene'
import { Story } from './ui/Story'
import { Hud } from './ui/Hud'
import { Syllabus } from './ui/Syllabus'
import { Tooltip } from './ui/Tooltip'
import { NoteCard } from './ui/Rich'
import { SourcesPanel } from './ui/Sources'
import { Captions } from './ui/Captions'
import { useDeckInput } from './deck/useDeckInput'
import { useHashRoute } from './deck/useHashRoute'
import { useDeck } from './deck/deck'
import { useViewportLayout } from './ui/layout'

export default function App() {
  const stage = useRef<HTMLDivElement>(null)
  const view = useDeck((s) => s.view)

  useViewportLayout()
  useHashRoute()
  useDeckInput(stage)

  /**
   * Whether to draw the cheap way.
   *
   * This used to ask only whether the window was small, which meant every
   * desktop got the most expensive configuration this app can produce — full
   * device pixel ratio *and* four-times multisampling — including machines with
   * no chance of affording it. Screen size is not a proxy for capability: a
   * 2013 laptop driving an external display asks for the largest buffers in the
   * building on the weakest GPU in it.
   *
   * `hardwareConcurrency` and `deviceMemory` are coarse and `deviceMemory` is
   * Chromium-only, so this is a floor rather than a measurement — but a machine
   * reporting four cores or four gigabytes is not one to hand a 5120x2880
   * multisampled buffer to.
   */
  const light = useMemo(() => {
    const nav = navigator as Navigator & { deviceMemory?: number }
    return (
      window.matchMedia('(max-width: 820px)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      (nav.hardwareConcurrency ?? 8) <= 4 ||
      (nav.deviceMemory ?? 8) <= 4
    )
  }, [])

  const aberration = useMemo(() => new THREE.Vector2(0.0007, 0.0007), [])

  return (
    <>
      {/* The Canvas must live inside an explicitly sized wrapper. R3F measures
          the *container* to size the drawing buffer, so styling the canvas
          element itself (via `className`) stretches the picture without
          correcting the aspect ratio.

          This wrapper is also the input surface: wheel, drag and touch are
          bound to it rather than to the window, so the syllabus can scroll
          normally while a lecture treats the same gestures as navigation. */}
      <div className="stage" ref={stage} data-view={view}>
      <Canvas
        shadows
        /* Capped at 1.75 rather than 2. Every buffer in the pipeline is
           quadratic in this number, so the last quarter of a pixel ratio costs
           about a third of the memory and is not visible on a retina panel at
           reading distance. */
        dpr={[1, light ? 1.25 : 1.75]}
        /* `antialias` off, deliberately. EffectComposer resolves its own
           multisampled target, so leaving this on allocated a second MSAA
           backbuffer that nothing ever read — the whole scene is drawn through
           the composer. Paying for antialiasing twice and using one of them. */
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 3.4, 8.2], fov: 38, near: 0.1, far: 120 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.35
        }}
      >
        <color attach="background" args={['#04060b']} />
        <fog attach="fog" args={['#04060b', 12, 34]} />
        <Suspense fallback={null}>
          <Scene />
          {/* Two samples, not four. The step from 2x to 4x is the expensive
              one — it doubles the multisampled target again — and on geometry
              this large and this slow-moving it is close to invisible. */}
          <EffectComposer multisampling={light ? 0 : 2}>
            {/* No ambient occlusion, deliberately. N8AO was tried here and
                measured: at half resolution and its cheapest quality it was
                still ~3 ms a frame on an M-series GPU at 2x DPR — the largest
                single cost in the new look — and side by side the frames with
                and without it were indistinguishable at every Lecture 1 camera
                distance. The contact shadow under each subject and the key
                light's own shadows carry the grounding instead. */}
            {/* Threshold sits high on purpose: at 0.55 the brushed-metal
                highlights on the lid crossed it and the whole package bloomed
                into a milky slab. Only the emissive die blocks should glow. */}
            <Bloom
              intensity={light ? 0.45 : 0.75}
              luminanceThreshold={1}
              luminanceSmoothing={0.3}
              mipmapBlur
              radius={0.72}
            />
            {/* Tone mapping, which this app did not have.
                `onCreated` above sets ACES on the renderer, but EffectComposer
                resets the renderer to NoToneMapping when it mounts — it expects
                tone mapping as an effect — so every frame was clipped linear.
                That is why a bright emissive went to flat yellow and why values
                were tuned so carefully low. Khronos "neutral" rather than ACES:
                it leaves everything below ~0.8 untouched, so the twenty scenes
                authored against no tone mapping keep their colours, and only
                compresses the highlights that used to clip. */}
            <ToneMapping mode={ToneMappingMode.NEUTRAL} />
            <ChromaticAberration offset={aberration} />
            {/* Film grain, barely there. Its job is to break up the banding in
                the dark gradients of the backdrop and the vignette, which on an
                8-bit panel otherwise step visibly. */}
            <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.22} />
            <Vignette offset={0.3} darkness={0.68} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      </div>

      <Story />
      <Hud />
      <Tooltip />
      <NoteCard />
      <SourcesPanel />
      <Captions />
      <Syllabus />
    </>
  )
}
