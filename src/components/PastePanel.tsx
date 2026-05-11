/* ============================================
   PastePanel — Artefact Input + Session Config
   ============================================ */

import { useState, useCallback } from 'react'
import type { ExamState, ExamAction, Persona } from '../state/types'
import { buildClassifierPrompt, parseClassification } from '../agents/classifier'

interface Props {
  state: ExamState
  dispatch: React.Dispatch<ExamAction>
}

const PERSONA_OPTIONS: Array<{ id: Persona; label: string; desc: string; icon: string }> = [
  { id: 'interviewer', label: 'Interviewer', desc: 'Senior tech interviewer — structured & fair', icon: '⎔' },
  { id: 'professor', label: 'Professor', desc: 'Socratic professor — guides with questions', icon: '◈' },
  { id: 'adversarial', label: 'Tech Lead', desc: 'Adversarial tech lead — challenges everything', icon: '⬡' },
]

const ROUND_OPTIONS = [3, 5, 10]

export default function PastePanel({ state, dispatch }: Props) {
  const [isClassifying, setIsClassifying] = useState(false)
  const tokenEstimate = Math.ceil(state.artefact.length / 4)
  const isTooLong = tokenEstimate > 6000

  const handleClassifyAndBegin = useCallback(async () => {
    if (!state.artefact.trim()) return

    setIsClassifying(true)
    dispatch({ type: 'START_CLASSIFY' })

    try {
      const prompt = buildClassifierPrompt(state.artefact, state.domain)

      const response = await fetch('/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        }),
      })

      if (!response.ok) throw new Error('Classification failed')

      const data = await response.json()
      const classification = parseClassification(data.content)

      if (classification) {
        dispatch({ type: 'SET_CLASSIFICATION', payload: classification })
      } else {
        // Fallback: set generic classification
        dispatch({
          type: 'SET_CLASSIFICATION',
          payload: {
            type: 'generic',
            concepts: [],
            complexity: 'intermediate',
            summary: 'Artefact classification unavailable',
          },
        })
      }
    } catch {
      dispatch({
        type: 'SET_CLASSIFICATION',
        payload: {
          type: 'generic',
          concepts: [],
          complexity: 'intermediate',
          summary: 'Classification skipped — using generic examiner',
        },
      })
    } finally {
      setIsClassifying(false)
    }
  }, [state.artefact, state.domain, dispatch])

  const handleBeginExam = useCallback(() => {
    dispatch({ type: 'BEGIN_EXAM' })
  }, [dispatch])

  const isReady = state.artefact.trim().length > 0 && !isTooLong
  const hasClassification = state.classification !== null

  return (
    <div className="animate-fade-in space-y-8">
      {/* Artefact Input */}
      <section>
        <label
          className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-text-muted"
          style={{ fontFamily: 'var(--font-label)' }}
          htmlFor="artefact-input"
        >
          Paste your artefact
        </label>
        <textarea
          id="artefact-input"
          className="exam-textarea w-full rounded-none p-5"
          rows={14}
          placeholder="Paste your code, paper excerpt, or system design here..."
          value={state.artefact}
          onChange={(e) => dispatch({ type: 'SET_ARTEFACT', payload: e.target.value })}
          spellCheck={false}
        />
        <div className="mt-2 flex items-center justify-between text-[0.65rem]" style={{ fontFamily: 'var(--font-label)' }}>
          <span className={`${isTooLong ? 'text-accent-gap' : 'text-text-muted'}`}>
            ~{tokenEstimate.toLocaleString()} tokens
          </span>
          {isTooLong && (
            <span className="text-accent-gap">
              ⚠ Artefact too large — will be truncated to ~6k tokens
            </span>
          )}
        </div>
      </section>

      {/* Domain Hint */}
      <section>
        <label
          className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-text-muted"
          style={{ fontFamily: 'var(--font-label)' }}
          htmlFor="domain-input"
        >
          Domain hint <span className="text-text-muted/50">(optional)</span>
        </label>
        <input
          id="domain-input"
          type="text"
          className="exam-textarea w-full rounded-none px-4 py-3 text-sm"
          placeholder="e.g. FastAPI backend, ML paper, React app, distributed systems..."
          value={state.domain}
          onChange={(e) => dispatch({ type: 'SET_DOMAIN', payload: e.target.value })}
        />
      </section>

      {/* Round Count */}
      <section>
        <label
          className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-text-muted"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Examination rounds
        </label>
        <div className="flex gap-3">
          {ROUND_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => dispatch({ type: 'SET_ROUNDS', payload: n })}
              className={`
                px-6 py-3 text-sm transition-all duration-200
                border cursor-pointer
                ${state.rounds === n
                  ? 'border-accent-examiner bg-accent-examiner/10 text-accent-examiner'
                  : 'border-border-subtle text-text-secondary hover:border-border-active hover:text-text-primary'
                }
              `}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* Persona Selection */}
      <section>
        <label
          className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-text-muted"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Examiner persona
        </label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {PERSONA_OPTIONS.map((p) => (
            <button
              key={p.id}
              onClick={() => dispatch({ type: 'SET_PERSONA', payload: p.id })}
              className={`
                glass-card cursor-pointer p-5 text-left transition-all duration-200
                ${state.persona === p.id
                  ? 'border-accent-examiner bg-accent-examiner/5'
                  : ''
                }
              `}
            >
              <div className="mb-2 text-2xl">{p.icon}</div>
              <div
                className="mb-1 text-sm font-medium text-text-primary"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                {p.label}
              </div>
              <div className="text-xs text-text-muted">{p.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Classification Result */}
      {hasClassification && state.classification && (
        <section className="animate-slide-up">
          <div className="glass-card border-accent-classifier/30 p-5">
            <div
              className="mb-2 text-[0.65rem] uppercase tracking-[0.25em] text-accent-classifier"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              ◎ Artefact classified
            </div>
            <div className="mb-3 text-sm text-text-primary">{state.classification.summary}</div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-accent-classifier/10 px-2 py-1 text-[0.65rem] text-accent-classifier border border-accent-classifier/20">
                {state.classification.type}
              </span>
              {state.classification.language && (
                <span className="bg-elevated px-2 py-1 text-[0.65rem] text-text-secondary border border-border-subtle">
                  {state.classification.language}
                </span>
              )}
              {state.classification.framework && (
                <span className="bg-elevated px-2 py-1 text-[0.65rem] text-text-secondary border border-border-subtle">
                  {state.classification.framework}
                </span>
              )}
              <span className="bg-elevated px-2 py-1 text-[0.65rem] text-text-secondary border border-border-subtle">
                {state.classification.complexity}
              </span>
            </div>
            {state.classification.concepts.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {state.classification.concepts.map((c, i) => (
                  <span key={i} className="text-[0.6rem] text-text-muted">
                    {c}{i < state.classification!.concepts.length - 1 ? ' ·' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Action Buttons */}
      <section className="flex gap-4 pt-4">
        {!hasClassification ? (
          <button
            className="btn-primary"
            onClick={handleClassifyAndBegin}
            disabled={!isReady || isClassifying}
          >
            {isClassifying ? (
              <span className="flex items-center gap-3">
                <span className="inline-block h-3 w-3 animate-spin border border-void border-t-transparent" style={{ borderRadius: '50%' }} />
                Classifying artefact...
              </span>
            ) : (
              'Analyze & Configure'
            )}
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={handleBeginExam}
            disabled={!isReady}
          >
            Begin Examination →
          </button>
        )}
      </section>

      {state.error && (
        <div className="mt-4 border border-accent-gap/30 bg-accent-gap/5 p-4 text-sm text-accent-gap">
          {state.error}
        </div>
      )}
    </div>
  )
}
