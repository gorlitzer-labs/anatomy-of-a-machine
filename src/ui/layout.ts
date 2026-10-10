import { useEffect } from 'react'
import { create } from 'zustand'

/**
 * The two layouts, defined once.
 *
 * There are only two, and they differ in *where the model lives*:
 *
 *   wide     the model fills the frame and the copy floats over its left third
 *   compact  the model gets a guaranteed band across the top and the copy sits
 *            in a sheet below it
 *
 * The band fraction is needed by three separate things — the CSS that sizes the
 * sheet, the camera rig that decides where to aim, and the tooltip that pins
 * itself to the bottom of the band. Previously each would have carried its own
 * copy of the number and they would have drifted the first time one was tuned.
 * It is declared here, and the CSS reads it as a custom property written from
 * this module.
 */

export const COMPACT_MAX_PX = 820

/** Share of the viewport height given to the model on compact layouts. */
export const MODEL_BAND = 0.46

/**
 * And what it gets when the copy sheet is collapsed.
 *
 * The sheet's own CSS has always said that collapsing it "hands the model the
 * whole screen", and it never did: `--band` was a constant, so the sheet slid
 * away and left dead space where it had been. The model stayed exactly as
 * cropped as before, which on a phone is very cropped — a transistor with its
 * gate pillars cut off at the header and its base cut off at the strip.
 *
 * Leaves room for the peek and the step controls beneath it.
 */
export const MODEL_BAND_TALL = 0.8

/** How much of the sheet stays on screen when the reader collapses it. */
export const SHEET_PEEK = 0.13

/**
 * How much of the width the copy column takes on a wide layout.
 *
 * The card is a fixed 480 px inside a `clamp(1.5rem, 6vw, 7rem)` gutter, so its
 * share of the viewport *grows as the window narrows* — 39% at 1440 px but 48%
 * at 1133 px, which is an iPad Mini in landscape. The camera rig used to push
 * the model right by a fixed fraction tuned against the wide case, so on
 * narrower windows the model drifted back under the copy and callouts on its
 * left edge landed on the card.
 *
 * Verified against measurement: this returns 0.393 at 1440 px and 0.484 at
 * 1133 px, and the browser reports 0.393 and 0.484.
 */
export const CARD_PX = 480
const GUTTER_MIN = 24
const GUTTER_MAX = 112

export function copyRightFraction(vw: number) {
  const gutter = Math.min(GUTTER_MAX, Math.max(GUTTER_MIN, vw * 0.06))
  return Math.min(0.62, (gutter + CARD_PX) / vw)
}

/** The share the model's fixed offset was originally tuned against. */
export const REFERENCE_COPY = 0.393

/**
 * Mutable mirror for `useFrame` code, which must not subscribe to a store.
 *
 * `bandCentre` is where the middle of the model's visible area sits in
 * normalised device coordinates: 0 when the model owns the frame, positive when
 * it has been pushed into a band across the top.
 *
 * `copyRight` is how far across the frame the copy column reaches, so the rig
 * can push the model clear of it by an amount that responds to the window
 * rather than to one screen it was tuned on.
 */
export const layout = {
  compact: false,
  bandCentre: 0,
  copyRight: REFERENCE_COPY,
}

type LayoutStore = {
  compact: boolean
  /** Only meaningful on compact: whether the copy sheet is open. */
  sheetOpen: boolean
  setCompact: (compact: boolean) => void
  setSheetOpen: (open: boolean) => void
  toggleSheet: () => void
}

export const useLayout = create<LayoutStore>((set) => ({
  compact: false,
  sheetOpen: true,
  setCompact: (compact) => set((s) => (s.compact === compact ? s : { ...s, compact })),
  setSheetOpen: (sheetOpen) => set((s) => (s.sheetOpen === sheetOpen ? s : { ...s, sheetOpen })),
  toggleSheet: () => set((s) => ({ ...s, sheetOpen: !s.sheetOpen })),
}))

/**
 * Measures the viewport and publishes the layout, in both directions.
 *
 * NDC runs +1 at the top of the frame to -1 at the bottom, so a band occupying
 * the top `MODEL_BAND` of the screen has its centre at `1 - MODEL_BAND`.
 */
export function useViewportLayout() {
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--sheet-peek', String(SHEET_PEEK))

    /* One place decides how tall the band is, and everything that cares reads
       it from here — the CSS through `--band`, the camera rig through
       `bandCentre`, the caption and the pinned card through the same variable.
       They cannot disagree about where the model ends. */
    const publish = (compact: boolean, sheetOpen: boolean) => {
      const band = compact && !sheetOpen ? MODEL_BAND_TALL : MODEL_BAND
      root.style.setProperty('--band', String(band))
      layout.compact = compact
      layout.bandCentre = compact ? 1 - band : 0
      layout.copyRight = compact ? 0 : copyRightFraction(window.innerWidth)
    }

    const apply = () => {
      const compact = window.innerWidth <= COMPACT_MAX_PX
      useLayout.getState().setCompact(compact)
      // Opening the sheet is the right default every time the layout changes:
      // arriving on a phone with the copy hidden would look like a broken page.
      if (compact) useLayout.getState().setSheetOpen(true)
      publish(compact, useLayout.getState().sheetOpen)
    }

    apply()
    const unsubscribe = useLayout.subscribe((s) => publish(s.compact, s.sheetOpen))
    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
    return () => {
      unsubscribe()
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
    }
  }, [])
}
