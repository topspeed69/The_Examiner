import { useEffect, useState, useCallback } from 'react'
import type { ExamState, ExamAction, GapMapData } from '../state/types'
import { chatComplete } from '../lib/llm'
import { buildGapMapPrompt } from '../agents/gapAnalyst'
import { 
  BarChart3, 
  Download, 
  Plus, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  Cpu, 
  Database, 
  ArrowUpRight, 
  Target,
  FileSearch,
  Zap,
} from 'lucide-react'

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
        state.classification?.summary || 'Unknown artifact',
      )

      const content = await chatComplete({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature: 0.3
      })

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed: GapMapData = JSON.parse(jsonMatch[0])
        dispatch({ type: 'SET_GAP_MAP', payload: parsed })
      } else {
        setRawFallback(content)
      }
    } catch (err) {
      console.error('Gap analysis failed:', err)
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
  }, [generateGapMap])

  if (isGenerating || (!state.gapMap && !rawFallback)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background pt-12 animate-in">
        <div className="relative w-24 h-24 mb-10">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Cpu size={32} className="text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-display font-bold text-on-surface mb-2">Synthesizing Intelligence</h3>
          <p className="text-[10px] font-bold tracking-[0.3em] text-primary/60 uppercase animate-pulse">
            Processing Mastery Telemetry...
          </p>
        </div>
      </div>
    )
  }

  const gapMap = state.gapMap!
  const scoredConcepts = gapMap?.concepts || []
  const gapCount = scoredConcepts.filter(c => c.verdict === 'gap').length
  const shakyCount = scoredConcepts.filter(c => c.verdict === 'shaky').length
  const solidCount = scoredConcepts.filter(c => c.verdict === 'solid').length
  
  const overallMastery = scoredConcepts.length > 0 ? Math.round((solidCount / scoredConcepts.length) * 100) : 0
  const errorProbability = scoredConcepts.length > 0 ? Math.round(((gapCount + shakyCount * 0.5) / scoredConcepts.length) * 100) : 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-12 animate-in">
      {/* Report Header */}
      <div className="w-full glass bg-white/5 border-b border-white/5 px-20 py-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BarChart3 size={240} />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                <Activity size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-on-surface">Final Gap Analysis</h1>
                <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mt-1">Intelligence Report v3.1</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-on-surface-variant/60 font-medium">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-primary/60" />
                <span>Subject: {state.classification?.summary || 'Untitled Analysis'}</span>
              </div>
              <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                <ShieldCheck size={14} className="text-primary/60" />
                <span>Generated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="glass-card bg-white/5 border-white/10 px-8 py-3 rounded-xl text-[11px] font-bold tracking-widest uppercase text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-all flex items-center gap-3">
              <Download size={16} />
              Export Dossier
            </button>
            <button 
              onClick={() => dispatch({ type: 'RESET' })}
              className="glass-button-primary px-8 py-3 flex items-center gap-3 shadow-primary/20"
            >
              <Plus size={18} />
              New Interrogation
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-20 space-y-12 scrollbar-thin">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card bg-white/5 border-white/5 p-8 rounded-3xl shadow-xl group hover:border-primary/20 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">Logical Integrity</span>
              <div className={`p-2 rounded-lg ${overallMastery > 70 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className={`text-5xl font-display font-bold ${overallMastery > 70 ? 'text-success' : overallMastery > 40 ? 'text-primary' : 'text-error'}`}>
                {overallMastery > 70 ? 'High' : overallMastery > 40 ? 'Nominal' : 'Critical'}
              </span>
            </div>
            <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-4">Confidence Spectrum</p>
          </div>
          
          <div className="glass-card bg-white/5 border-white/5 p-8 rounded-3xl shadow-xl group hover:border-primary/20 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">System Mastery</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Target size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-display font-bold text-primary">{overallMastery}%</span>
            </div>
            <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-4">Verified Technical Nodes</p>
          </div>

          <div className="glass-card bg-white/5 border-white/5 p-8 rounded-3xl shadow-xl group hover:border-error/20 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">Error Probability</span>
              <div className="p-2 rounded-lg bg-error/10 text-error">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-display font-bold text-error">{errorProbability}%</span>
            </div>
            <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-4">Logical Vulnerabilities</p>
          </div>
        </div>

        {/* Detailed Vector Analysis */}
        <div className="glass-card bg-white/5 border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="text-xl font-display font-bold text-on-surface flex items-center gap-3">
              <FileSearch size={20} className="text-secondary" />
              Detailed Vector Analysis
            </h2>
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/20 border border-white/5">
              <Database size={12} className="text-on-surface-variant" />
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">{scoredConcepts.length} Nodes Indexed</span>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black/20 text-left">
                  <th className="px-10 py-5 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Vector_ID</th>
                  <th className="px-10 py-5 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Concept_Node</th>
                  <th className="px-10 py-5 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Status</th>
                  <th className="px-10 py-5 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase text-center">Mastery</th>
                  <th className="px-10 py-5 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Logical_Evidence</th>
                  <th className="px-10 py-5 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scoredConcepts.map((c, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-all group">
                    <td className="px-10 py-6 font-code text-[11px] text-on-surface-variant/40">VEC-{String(i + 1).padStart(3, '0')}</td>
                    <td className="px-10 py-6 font-display font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{c.name}</td>
                    <td className="px-10 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border transition-all ${
                        c.verdict === 'solid' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : c.verdict === 'shaky' 
                            ? 'bg-primary/10 text-primary border-primary/20' 
                            : 'bg-error/10 text-error border-error/20 shadow-[0_0_8px_rgba(248,113,113,0.2)]'
                      }`}>
                        {c.verdict === 'solid' ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
                        {c.verdict === 'solid' ? 'VERIFIED' : c.verdict === 'shaky' ? 'SHAKY' : 'GAP_DETECTED'}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                       <div className="flex items-center justify-center gap-2">
                         <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                           <div className={`h-full rounded-full ${c.verdict === 'solid' ? 'bg-success' : c.verdict === 'shaky' ? 'bg-primary' : 'bg-error'}`} style={{ width: c.verdict === 'solid' ? '100%' : c.verdict === 'shaky' ? '50%' : '15%' }}></div>
                         </div>
                       </div>
                    </td>
                    <td className="px-10 py-6 text-xs text-on-surface-variant/80 font-medium max-w-md leading-relaxed">{c.explanation}</td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <Zap size={14} className="group-hover:animate-bounce" />
                        <span className="line-clamp-1">{c.next_action || 'N/A'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-black/20 flex items-center justify-center">
            <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase flex items-center gap-3">
              <ArrowUpRight size={12} />
              End of Vector Readout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
