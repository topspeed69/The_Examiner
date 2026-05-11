/* ============================================
   ExamPanel — Active Examination View
   ============================================ */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { ExamState, ExamAction } from '../state/types'
import { useExamStream } from '../hooks/useExamStream'
import { orchestrate, buildFirstQuestionPrompt } from '../agents/orchestrator'
import { extractGapEval, stripGapEvalTags, hasCompleteGapEval } from '../utils/parseGapEval'
import RoundIndicator from './RoundIndicator'
import TeachBlock from './TeachBlock'

interface Props {
  state: ExamState
  dispatch: React.Dispatch<ExamAction>
}

export default function ExamPanel({ state, dispatch }: Props) {
  const [answer, setAnswer] = useState('')
  const [lastGapTeach, setLastGapTeach] = useState<{ concept: string; verdict: 'shaky' | 'gap'; teach: string } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [state.streamBuffer, state.messages])

  const handleStreamComplete = useCallback((fullText: string) => {
    // Parse gap eval from completed response
    if (hasCompleteGapEval(fullText)) {
      const gap = extractGapEval(fullText)
      if (gap) {
        dispatch({ type: 'ADD_GAP', payload: gap })

        if (gap.verdict !== 'solid' && gap.teach) {
          setLastGapTeach({
            concept: gap.concept,
            verdict: gap.verdict,
            teach: gap.teach,
          })
        } else {
          setLastGapTeach(null)
        }
      }
    }

    // Check if this was the last round
    if (state.currentRound >= state.rounds) {
      // Delay slightly to let the user read the last response
      setTimeout(() => {
        dispatch({ type: 'FINISH_EXAM' })
      }, 2000)
    }
  }, [state.currentRound, state.rounds, dispatch])

  const { startStream, stopStream } = useExamStream({
    dispatch,
    onStreamComplete: handleStreamComplete,
  })

  // Get orchestrator output for current round
  const orchOutput = orchestrate({
    artefact: state.artefact,
    domain: state.domain,
    artefactType: state.classification?.type || 'generic',
    persona: state.persona,
    totalRounds: state.rounds,
    currentRound: state.currentRound,
    detectedGaps: state.detectedGaps.map(g => ({ concept: g.concept, verdict: g.verdict })),
  })

  // Start first question when exam begins
  useEffect(() => {
    if (state.phase === 'EXAMINING' && state.messages.length === 0 && !state.isStreaming) {
      dispatch({ type: 'SET_ACTIVE_AGENT', payload: orchOutput.activeAgentName })
      const firstMsg = buildFirstQuestionPrompt()
      startStream(orchOutput.systemPrompt, [{ role: 'user', content: firstMsg }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  const handleSubmitAnswer = useCallback(() => {
    if (!answer.trim() || state.isStreaming) return

    const userAnswer = answer.trim()
    setAnswer('')
    setLastGapTeach(null)

    dispatch({ type: 'SUBMIT_ANSWER', payload: userAnswer })

    // Check if more rounds
    if (state.currentRound < state.rounds) {
      dispatch({ type: 'NEXT_ROUND' })

      // Get new orchestrator output for next round
      const nextOrch = orchestrate({
        artefact: state.artefact,
        domain: state.domain,
        artefactType: state.classification?.type || 'generic',
        persona: state.persona,
        totalRounds: state.rounds,
        currentRound: state.currentRound + 1,
        detectedGaps: [...state.detectedGaps].map(g => ({ concept: g.concept, verdict: g.verdict })),
      })

      dispatch({ type: 'SET_ACTIVE_AGENT', payload: nextOrch.activeAgentName })

      // Build message history including user's answer
      const allMessages = [
        ...state.messages,
        { role: 'user' as const, content: userAnswer },
      ]

      startStream(nextOrch.systemPrompt, allMessages)
    } else {
      // Last round — finalize after current response
      dispatch({ type: 'FINISH_EXAM' })
    }
  }, [answer, state, dispatch, startStream])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  const handleEarlyExit = useCallback(() => {
    stopStream()
    dispatch({ type: 'FINISH_EXAM' })
  }, [stopStream, dispatch])

  return (
    <div className="animate-fade-in">
      {/* Round Indicator */}
      <RoundIndicator
        currentRound={state.currentRound}
        totalRounds={state.rounds}
        mode={orchOutput.roundMode}
        agentName={state.activeAgent || orchOutput.activeAgentName}
      />

      {/* Conversation Area */}
      <div
        ref={scrollRef}
        className="mb-6 max-h-[55vh] space-y-6 overflow-y-auto pr-2"
      >
        {/* Rendered messages */}
        {state.messages.map((msg, i) => (
          <div
            key={i}
            className={`animate-slide-up ${msg.role === 'assistant' ? '' : 'ml-8'}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {msg.role === 'assistant' ? (
              <div className="border-l-2 border-accent-examiner/30 pl-5">
                <div
                  className="mb-1 text-[0.6rem] uppercase tracking-[0.2em] text-accent-examiner/60"
                  style={{ fontFamily: 'var(--font-label)' }}
                >
                  Examiner
                </div>
                <div
                  className="text-[0.95rem] leading-relaxed text-text-primary"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {stripGapEvalTags(msg.content)}
                </div>
              </div>
            ) : (
              <div className="border-l-2 border-text-muted/20 pl-5">
                <div
                  className="mb-1 text-[0.6rem] uppercase tracking-[0.2em] text-text-muted"
                  style={{ fontFamily: 'var(--font-label)' }}
                >
                  You
                </div>
                <div className="text-sm leading-relaxed text-text-secondary">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Streaming buffer */}
        {state.isStreaming && state.streamBuffer && (
          <div className="border-l-2 border-accent-examiner/30 pl-5">
            <div
              className="mb-1 text-[0.6rem] uppercase tracking-[0.2em] text-accent-examiner/60"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              Examiner
            </div>
            <div
              className="animate-stream-cursor text-[0.95rem] leading-relaxed text-text-primary"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {stripGapEvalTags(state.streamBuffer)}
            </div>
          </div>
        )}

        {/* Streaming loading indicator */}
        {state.isStreaming && !state.streamBuffer && (
          <div className="border-l-2 border-accent-examiner/30 pl-5">
            <div className="flex items-center gap-2 text-sm text-accent-examiner/60">
              <span className="inline-block h-1.5 w-1.5 animate-pulse-glow bg-accent-examiner" style={{ borderRadius: '50%' }} />
              Examiner is thinking...
            </div>
          </div>
        )}

        {/* Teach Block */}
        {lastGapTeach && !state.isStreaming && (
          <TeachBlock
            concept={lastGapTeach.concept}
            verdict={lastGapTeach.verdict}
            teach={lastGapTeach.teach}
          />
        )}
      </div>

      {/* Answer Input */}
      {!state.isStreaming && state.currentRound <= state.rounds && state.phase !== 'GAP_MAP' && (
        <div className="border-t border-border-subtle pt-5">
          <textarea
            ref={textareaRef}
            className="exam-textarea w-full rounded-none p-4 text-sm"
            rows={4}
            placeholder="Type your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={state.isStreaming}
            autoFocus
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[0.6rem] text-text-muted" style={{ fontFamily: 'var(--font-label)' }}>
              Ctrl+Enter to submit
            </span>
            <div className="flex gap-3">
              <button
                className="btn-secondary text-[0.6rem]"
                onClick={handleEarlyExit}
              >
                End Early → Gap Map
              </button>
              <button
                className="btn-primary py-2.5 px-6 text-[0.65rem]"
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || state.isStreaming}
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {state.error && (
        <div className="mt-4 border border-accent-gap/30 bg-accent-gap/5 p-4 text-sm text-accent-gap">
          {state.error}
        </div>
      )}
    </div>
  )
}
