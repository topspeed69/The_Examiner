import './index.css'
import { useReducer } from 'react'
import { examReducer, initialState } from './state/examReducer'
import PastePanel from './components/PastePanel'
import ExamPanel from './components/ExamPanel'
import GapMapPanel from './components/GapMapPanel'

function App() {
  const [state, dispatch] = useReducer(examReducer, initialState)

  return (
    <div className="relative min-h-screen bg-void">
      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        {/* Header */}
        <header className="mb-12 flex items-end justify-between border-b border-border-subtle pb-6">
          <div>
            <h1
              className="text-5xl tracking-tight text-text-primary md:text-6xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The Examiner
            </h1>
            <p
              className="mt-2 text-[0.65rem] uppercase tracking-[0.35em] text-text-muted"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              Multi-agent Socratic interrogation
            </p>
          </div>

          {state.phase !== 'IDLE' && state.phase !== 'CLASSIFYING' && (
            <button
              className="btn-secondary"
              onClick={() => dispatch({ type: 'RESET' })}
            >
              New Session
            </button>
          )}
        </header>

        {/* Phase Router */}
        {(state.phase === 'IDLE' || state.phase === 'CLASSIFYING') && (
          <PastePanel state={state} dispatch={dispatch} />
        )}

        {(state.phase === 'EXAMINING' || state.phase === 'TEACHING') && (
          <ExamPanel state={state} dispatch={dispatch} />
        )}

        {state.phase === 'GAP_MAP' && (
          <GapMapPanel state={state} dispatch={dispatch} />
        )}
      </main>
    </div>
  )
}

export default App
