import { useEffect } from 'react'
import type { ExamState } from '../state/types'

export function usePersistence(state: ExamState) {
  useEffect(() => {
    // We only archive if the exam is finished and we have a gap map
    if (state.phase === 'GAP_MAP' && state.gapMap) {
      const history = JSON.parse(localStorage.getItem('examiner_history') || '[]')
      
      // Check if this session is already archived (by summary and timestamp ideally, but summary+concept count works as proxy)
      const sessionID = `${state.classification?.summary || 'Session'}-${state.gapMap.concepts.length}`
      const isAlreadyArchived = history.some((h: any) => h.id === sessionID)

      if (!isAlreadyArchived) {
        const newEntry = {
          id: sessionID,
          timestamp: new Date().toISOString(),
          subject: state.classification?.summary || state.domain || 'Unknown Analysis',
          mastery: Math.round((state.gapMap.concepts.filter(c => c.verdict === 'solid').length / state.gapMap.concepts.length) * 100),
          gaps: state.gapMap.concepts.filter(c => c.verdict === 'gap').length,
          gapMap: state.gapMap,
          artifact: state.artifact
        }
        
        localStorage.setItem('examiner_history', JSON.stringify([newEntry, ...history].slice(0, 50)))
      }
    }
  }, [state.phase, state.gapMap, state.classification, state.domain, state.artifact])
}
