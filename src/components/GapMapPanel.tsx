/* ============================================
   GapMapPanel — Final Gap Analysis Report
   ============================================ */

import { useEffect, useState, useCallback } from 'react'
import type { ExamState, ExamAction, GapMapData } from '../state/types'
import { buildGapMapPrompt } from '../agents/gapAnalyst'
import ConceptCard from './ConceptCard'

interface Props {
  state: ExamState
  dispatch: React.Dispatch<ExamAction>
}

export default function GapMapPanel({ state, dispatch }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [rawFallback, setRawFallback] = useState<string | null>(null)

  const generateGapMap = useCallback(async () => {
    if (state.gapMap || isGenerating) return

    setIsGenerating(true)

    try {
      const prompt = buildGapMapPrompt(
        state.detectedGaps,
        state.classification?.concepts || [],
        state.classification?.summary || 'Unknown artefact',
      )

      const response = await fetch('/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2048,
        }),
      })

      if (!response.ok) throw new Error('Gap map generation failed')

      const data = await response.json()
      const content = data.content

      // Try to parse JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed: GapMapData = JSON.parse(jsonMatch[0])
        dispatch({ type: 'SET_GAP_MAP', payload: parsed })
      } else {
        setRawFallback(content)
      }
    } catch {
      // Fallback: build gap map from detected gaps
      if (state.detectedGaps.length > 0) {
        const fallbackMap: GapMapData = {
          summary: `Examined ${state.detectedGaps.length} concepts. Analysis generated from examination data.`,
          concepts: state.detectedGaps.map(g => ({
            name: g.concept,
            verdict: g.verdict,
            explanation: g.evidence,
            next_action: g.teach || 'Review this concept in depth.',
          })),
          strongest_area: state.detectedGaps.find(g => g.verdict === 'solid')?.concept || 'N/A',
          critical_gap: state.detectedGaps.find(g => g.verdict === 'gap')?.concept || 'N/A',
        }
        dispatch({ type: 'SET_GAP_MAP', payload: fallbackMap })
      } else {
        setRawFallback('Unable to generate gap map. No examination data available.')
      }
    } finally {
      setIsGenerating(false)
    }
  }, [state.gapMap, state.detectedGaps, state.classification, dispatch, isGenerating])

  useEffect(() => {
    generateGapMap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Loading state
  if (isGenerating || (!state.gapMap && !rawFallback)) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="mb-6 h-8 w-8 animate-spin border-2 border-accent-examiner border-t-transparent" style={{ borderRadius: '50%' }} />
        <p
          className="text-sm text-text-muted"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Synthesizing gap analysis...
        </p>
      </div>
    )
  }

  // Raw fallback
  if (rawFallback) {
    return (
      <div className="animate-fade-in">
        <h2
          className="mb-6 text-3xl text-text-primary"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Gap Analysis
        </h2>
        <div className="glass-card p-6 text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
          {rawFallback}
        </div>
        <button
          className="btn-primary mt-8"
          onClick={() => dispatch({ type: 'RESET' })}
        >
          Start New Examination
        </button>
      </div>
    )
  }

  const gapMap = state.gapMap!
  const solidCount = gapMap.concepts.filter(c => c.verdict === 'solid').length
  const shakyCount = gapMap.concepts.filter(c => c.verdict === 'shaky').length
  const gapCount = gapMap.concepts.filter(c => c.verdict === 'gap').length

  return (
    <div className="animate-fade-in space-y-8">
      {/* Summary Banner */}
      <section className="animate-slide-up border-b border-border-subtle pb-8">
        <h2
          className="mb-4 text-3xl tracking-tight text-text-primary md:text-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Gap Map
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
          {gapMap.summary}
        </p>

        {/* Verdict Stats */}
        <div className="mt-6 flex gap-6">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-accent-solid" />
            <span className="text-xs text-text-muted" style={{ fontFamily: 'var(--font-label)' }}>
              {solidCount} Solid
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-accent-shaky" />
            <span className="text-xs text-text-muted" style={{ fontFamily: 'var(--font-label)' }}>
              {shakyCount} Shaky
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-accent-gap" />
            <span className="text-xs text-text-muted" style={{ fontFamily: 'var(--font-label)' }}>
              {gapCount} Gap
            </span>
          </div>
        </div>
      </section>

      {/* Concept Grid */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {gapMap.concepts.map((concept, i) => (
          <ConceptCard
            key={i}
            name={concept.name}
            verdict={concept.verdict}
            explanation={concept.explanation}
            nextAction={concept.next_action}
            delay={i}
          />
        ))}
      </section>

      {/* Footer Stats */}
      <section className="border-t border-border-subtle pt-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {gapMap.strongest_area && gapMap.strongest_area !== 'N/A' && (
            <div className="verdict-bg-solid p-5">
              <div
                className="mb-1 text-[0.6rem] uppercase tracking-[0.2em] text-accent-solid/70"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                Strongest Area
              </div>
              <div className="text-sm text-text-primary">{gapMap.strongest_area}</div>
            </div>
          )}
          {gapMap.critical_gap && gapMap.critical_gap !== 'N/A' && (
            <div className="verdict-bg-gap p-5">
              <div
                className="mb-1 text-[0.6rem] uppercase tracking-[0.2em] text-accent-gap/70"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                Critical Gap
              </div>
              <div className="text-sm text-text-primary">{gapMap.critical_gap}</div>
            </div>
          )}
        </div>

        <button
          className="btn-primary mt-8"
          onClick={() => dispatch({ type: 'RESET' })}
        >
          Start New Examination
        </button>
      </section>
    </div>
  )
}
