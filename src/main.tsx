import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { startTracking } from './lib/track'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Reader analytics — production host only, opt-out with ?notrack. See docs/ANALYTICS.md.
startTracking()

// Stale anchors and orphaned sources fail silently at runtime by design, so
// the dev build says so out loud. Dynamic, so none of it ships.
if (import.meta.env.DEV)
  void import('./content/checkRefs').then(({ checkRefs }) => {
    const problems = checkRefs()
    if (problems.length) console.warn(`references: ${problems.length} problem(s)\n` + problems.join('\n'))
  })
