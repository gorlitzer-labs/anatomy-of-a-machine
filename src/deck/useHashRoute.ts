import { useEffect } from 'react'
import { indexOfLecture, lectures } from '../content/lectures'
import { stepsFor, useDeck } from './deck'

/**
 * Two-way sync between the deck position and the URL fragment.
 *
 * `#/chip/12` is a specific beat of a specific lecture. Worth having because a
 * course is the kind of thing people link each other into halfway through, and
 * because it makes checking a single beat's camera framing a page load instead
 * of thirteen clicks.
 *
 * Writes use `replaceState` rather than assigning `location.hash`: assignment
 * pushes a history entry per step, which would turn the browser back button
 * into a second, worse step-backward control.
 */
export function useHashRoute() {
  useEffect(() => {
    const read = () => {
      const raw = window.location.hash.replace(/^#\/?/, '')
      const store = useDeck.getState()
      if (!raw) {
        if (store.view !== 'syllabus') store.exit()
        return
      }
      const [id, step] = raw.split('/')
      const lecture = indexOfLecture(id)
      if (lecture < 0 || !stepsFor(lecture).length) {
        store.exit()
        return
      }
      const index = Number.parseInt(step ?? '0', 10)
      store.enter(lecture, Number.isFinite(index) ? index : 0)
    }

    read()
    window.addEventListener('hashchange', read)

    const unsubscribe = useDeck.subscribe((state) => {
      const next =
        state.view === 'syllabus' ? '' : `#/${lectures[state.lecture]?.id}/${state.index}`
      if (window.location.hash === next) return
      window.history.replaceState(null, '', next || window.location.pathname)
    })

    return () => {
      window.removeEventListener('hashchange', read)
      unsubscribe()
    }
  }, [])
}
