import './index.css'
import { useReducer } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { examReducer, initialState } from './state/examReducer'
import Onboarding from './components/Onboarding'
import PastePanel from './components/PastePanel'
import ExamPanel from './components/ExamPanel'
import GapMapPanel from './components/GapMapPanel'
import Sidebar from './components/Sidebar'

import ArchivePanel from './components/ArchivePanel'
import { usePersistence } from './hooks/usePersistence'

function App() {
  const [state, dispatch] = useReducer(examReducer, initialState)
  
  // Sync state to local storage
  usePersistence(state)

  return (
    <>
      <div className="font-body text-on-background selection:bg-primary/30 selection:text-primary min-h-screen flex flex-col md:flex-row antialiased overflow-hidden">
        
        {state.phase !== 'ONBOARDING' && <Sidebar state={state} dispatch={dispatch} />}

        {/* Main Canvas */}
        <div className={`flex-grow flex flex-col ${state.phase !== 'ONBOARDING' ? 'md:ml-64' : ''} h-screen overflow-hidden relative`}>
          {/* Subtle decorative element */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none"></div>
          {/* Dynamic Panel Content */}
          {state.phase === 'ONBOARDING' && (
            <Onboarding dispatch={dispatch} />
          )}

          {(state.phase === 'IDLE' || state.phase === 'CLASSIFYING') && (
            <PastePanel state={state} dispatch={dispatch} />
          )}

          {(state.phase === 'EXAMINING' || state.phase === 'TEACHING') && (
            <ExamPanel state={state} dispatch={dispatch} />
          )}

          {state.phase === 'GAP_MAP' && (
            <GapMapPanel state={state} dispatch={dispatch} />
          )}

          {state.phase === 'ARCHIVE' && (
            <ArchivePanel dispatch={dispatch} />
          )}
        </div>

      </div>
      <Analytics />
    </>
  )
}

export default App
