import { useState, useEffect } from 'react'
import type { ExamAction } from '../state/types'
import { 
  Calendar, 
  Fingerprint, 
  History, 
  School, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  Terminal, 
  MessageSquare, 
  ArrowUpRight, 
  PlusCircle, 
  Trash2,
  Clock,
  ArrowLeft,
  Award,
  Zap,
  Target
} from 'lucide-react'

interface ArchiveEntry {
  id: string
  timestamp: string
  subject: string
  mastery: number
  gaps: number
  gapMap: any
  artifact: string
}

interface Props {
  dispatch: React.Dispatch<ExamAction>
}

export default function ArchivePanel({ dispatch }: Props) {
  const [history, setHistory] = useState<ArchiveEntry[]>([])
  const [selectedSession, setSelectedSession] = useState<ArchiveEntry | null>(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('examiner_history') || '[]')
    setHistory(stored)
  }, [])

  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const diff = now.getTime() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (mins > 0) return `${mins}m ago`
    return 'Just now'
  }

  const clearHistory = () => {
    if (confirm('Are you sure you want to purge all technical intelligence?')) {
      localStorage.setItem('examiner_history', '[]')
      setHistory([])
      setSelectedSession(null)
    }
  }

  if (selectedSession) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-background relative z-10 animate-in">
        {/* Header */}
        <header className="h-24 glass bg-white/5 border-b border-white/5 px-12 flex items-center justify-between sticky top-0 z-30 shadow-2xl">
          <div className="flex flex-col">
            <h2 className="text-2xl font-display font-bold text-on-surface flex items-center gap-3">
              <button 
                onClick={() => setSelectedSession(null)}
                className="p-2 rounded-xl hover:bg-white/5 transition-colors text-on-surface-variant hover:text-on-surface"
              >
                <ArrowLeft size={20} />
              </button>
              Intelligence Summary: <span className="text-primary">{selectedSession.subject}</span>
            </h2>
            <div className="flex items-center gap-6 mt-1.5 ml-12">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-on-surface-variant/60 uppercase">
                <Fingerprint size={12} className="text-primary/60" />
                <span>{selectedSession.id}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-on-surface-variant/60 uppercase">
                <Calendar size={12} className="text-primary/60" />
                <span>{new Date(selectedSession.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={() => {
                dispatch({ type: 'SET_PHASE', payload: 'EXAMINING' })
              }}
              className="glass-button-primary px-8 py-3 flex items-center gap-3 shadow-primary/20"
            >
              <History size={18} />
              Resume Interrogation
            </button>
          </div>
        </header>
        
        {/* Main Report View */}
        <div className="flex-1 overflow-auto p-12 space-y-12 max-w-[1400px] mx-auto w-full pb-40 scrollbar-thin">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Conceptual Ownership */}
            <div className="lg:col-span-4 glass-card bg-white/5 border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden h-[420px] shadow-2xl">
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-50"></div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.25em] mb-10 relative z-10">Conceptual Ownership</p>
              
              <div className="relative w-56 h-56 flex items-center justify-center z-10">
                <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                  <circle className="text-white/5" cx="112" cy="112" fill="transparent" r="96" stroke="currentColor" strokeWidth="12"></circle>
                  <circle 
                    className="text-primary" 
                    cx="112" 
                    cy="112" 
                    fill="transparent" 
                    r="96" 
                    stroke="currentColor" 
                    strokeWidth="12"
                    strokeDasharray="603" 
                    strokeDashoffset={603 - (603 * selectedSession.mastery) / 100} 
                    strokeLinecap="round" 
                    style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-7xl font-display font-bold text-on-surface">{selectedSession.mastery}<span className="text-3xl text-primary/60">%</span></span>
                  <div className="px-3 py-1 bg-success/10 border border-success/20 rounded-full flex items-center gap-1.5 mt-4">
                    <ArrowUpRight size={12} className="text-success" />
                    <span className="text-[10px] font-bold text-success">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Gaps */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 h-[420px]">
              {/* Core Strengths */}
              <div className="glass-card bg-success/5 border-success/10 rounded-3xl p-10 overflow-y-auto shadow-xl scrollbar-none">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-[10px] font-bold text-success uppercase tracking-[0.25em] flex items-center gap-2.5">
                    <Award size={16} className="text-success" /> 
                    Identified Strengths
                  </p>
                  <span className="text-xs font-bold text-success/60">{selectedSession.gapMap?.concepts?.filter((c: any) => c.verdict === 'solid').length || 0} Nodes</span>
                </div>
                <ul className="space-y-8">
                  {selectedSession.gapMap?.concepts?.filter((c: any) => c.verdict === 'solid').map((c: any, i: number) => (
                    <li key={i} className="flex items-start gap-5 group">
                      <div className="w-8 h-8 rounded-xl bg-success/10 border border-success/20 flex-shrink-0 flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform">
                        <Zap size={14} className="text-success" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface group-hover:text-success transition-colors">{c.name}</p>
                        <p className="text-xs text-on-surface-variant/70 mt-2 leading-relaxed">{c.explanation}</p>
                      </div>
                    </li>
                  ))}
                  {(!selectedSession.gapMap?.concepts || selectedSession.gapMap.concepts.filter((c: any) => c.verdict === 'solid').length === 0) && (
                     <div className="flex flex-col items-center justify-center h-40 opacity-30">
                        <Target size={32} className="mb-4" />
                        <p className="text-xs font-medium italic">No solid concepts verified.</p>
                     </div>
                  )}
                </ul>
              </div>

              {/* Knowledge Gaps */}
              <div className="glass-card bg-error/5 border-error/10 rounded-3xl p-10 overflow-y-auto shadow-xl scrollbar-none">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-[10px] font-bold text-error uppercase tracking-[0.25em] flex items-center gap-2.5">
                    <AlertTriangle size={16} className="text-error" /> 
                    Knowledge Gaps
                  </p>
                  <span className="text-xs font-bold text-error/60">{selectedSession.gapMap?.concepts?.filter((c: any) => c.verdict !== 'solid').length || 0} Critical</span>
                </div>
                <ul className="space-y-8">
                  {selectedSession.gapMap?.concepts?.filter((c: any) => c.verdict !== 'solid').map((c: any, i: number) => (
                    <li key={i} className="flex items-start gap-5 group">
                      <div className="w-8 h-8 rounded-xl bg-error/10 border border-error/20 flex-shrink-0 flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform">
                        <AlertTriangle size={14} className="text-error" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface group-hover:text-error transition-colors">{c.name}</p>
                        <p className="text-xs text-on-surface-variant/70 mt-2 leading-relaxed">{c.explanation}</p>
                      </div>
                    </li>
                  ))}
                   {(!selectedSession.gapMap?.concepts || selectedSession.gapMap.concepts.filter((c: any) => c.verdict !== 'solid').length === 0) && (
                     <div className="flex flex-col items-center justify-center h-40 opacity-30">
                        <ShieldCheck size={32} className="mb-4" />
                        <p className="text-xs font-medium italic">No critical gaps identified.</p>
                     </div>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Secondary Content Row */}
          <div className="pt-8 border-t border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-bold text-on-surface flex items-center gap-3">
                <Terminal size={20} className="text-primary" />
                Forensic Logs & Transcript
              </h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[500px]">
              
              {/* Code Viewer */}
              <div className="lg:col-span-7 glass-card bg-black/40 border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                <div className="h-12 border-b border-white/5 px-6 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-3">
                    <Terminal size={14} className="text-primary" />
                    <span className="text-[10px] font-bold tracking-widest text-on-surface uppercase">Source Artifact</span>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-8 font-code text-xs leading-relaxed bg-transparent scrollbar-thin">
                  <div className="flex">
                    <div className="text-on-surface-variant/20 select-none text-right pr-6 border-r border-white/5 mr-6 font-medium w-10">
                      {selectedSession.artifact.split('\n').map((_, i) => (
                        <div key={i}>{String(i + 1).padStart(2, '0')}</div>
                      ))}
                    </div>
                    <div className="flex-1 text-on-surface/70 whitespace-pre">
                      {selectedSession.artifact}
                    </div>
                  </div>
                </div>
              </div>

              {/* The Grill Transcript */}
              <div className="lg:col-span-5 glass-card bg-white/5 border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                <div className="h-12 border-b border-white/5 px-6 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={14} className="text-secondary" />
                    <span className="text-[10px] font-bold tracking-widest text-on-surface uppercase">Intelligence Transcript</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
                  {selectedSession.gapMap?.concepts?.map((c: any, i: number) => (
                    <div key={i} className="space-y-6">
                      {/* Examiner Question */}
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                          <ShieldCheck size={14} className="text-primary" />
                        </div>
                        <div className="flex-1 glass bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                          <p className="text-[13px] leading-relaxed text-on-surface/80">Can you walk me through your understanding of <span className="text-primary font-bold">{c.name}</span>?</p>
                        </div>
                      </div>
                      {/* Operator Answer */}
                      <div className="flex gap-4 flex-row-reverse">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/10 shadow-lg">
                          <History size={14} className="text-on-surface-variant" />
                        </div>
                        <div className="flex-1 glass bg-primary/5 p-4 rounded-2xl rounded-tr-none border border-primary/10">
                          <p className="text-[13px] leading-relaxed text-on-surface/80 italic">{c.explanation}</p>
                        </div>
                      </div>
                      {/* Gap Flag */}
                      {c.verdict !== 'solid' && (
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-xl bg-error/10 flex-shrink-0 flex items-center justify-center border border-error/20 shadow-lg shadow-error/5">
                            <AlertTriangle size={14} className="text-error" />
                          </div>
                          <div className="flex-1 glass bg-error/5 p-4 rounded-2xl rounded-tl-none border border-error/10">
                            <span className="text-[9px] font-bold text-error tracking-[0.2em] uppercase block mb-2">Gap Isolated</span>
                            <p className="text-[13px] leading-relaxed text-on-surface/90">{c.next_action}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!selectedSession.gapMap?.concepts || selectedSession.gapMap.concepts.length === 0) && (
                     <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                        <Clock size={48} className="mb-4" />
                        <p className="text-sm font-medium">No session logs recorded.</p>
                     </div>
                  )}
                </div>
                <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase flex items-center gap-2">
                    <History size={10} />
                    Immutable intelligence record
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-12 bg-background animate-in">
      {/* Archive Header */}
      <div className="w-full px-20 py-16">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-display font-bold text-on-background mb-6 tracking-tight">Intelligence <span className="text-primary underline decoration-primary/20 underline-offset-8">Archive</span></h1>
          <p className="text-xl font-medium text-on-surface-variant/80 leading-relaxed">
            Explore and retrieve technical intelligence from past interrogations. Systematically cataloging cognitive gaps since deployment.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-20 pb-32 scrollbar-thin">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {history.map((entry, i) => {
            const masteryColor = entry.mastery > 70 ? 'text-success' : entry.mastery > 40 ? 'text-primary' : 'text-error'
            const borderColor = entry.mastery > 70 ? 'group-hover:border-success/30' : entry.mastery > 40 ? 'group-hover:border-primary/30' : 'group-hover:border-error/30'
            const gradientClass = i % 3 === 0 ? 'from-primary/20' : i % 3 === 1 ? 'from-secondary/20' : 'from-error/20'

            return (
              <div 
                key={entry.id} 
                className={`group glass-card bg-white/5 border-white/5 rounded-3xl flex flex-col transition-all duration-500 cursor-pointer overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 border-transparent ${borderColor}`}
                onClick={() => setSelectedSession(entry)}
              >
                {/* Visual Header */}
                <div className={`h-40 w-full bg-linear-to-b ${gradientClass} to-transparent p-8 flex justify-between items-start`}>
                  <div className="flex flex-col gap-2">
                    <span className="px-4 py-1.5 glass bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-bold tracking-widest text-on-surface border border-white/10 shadow-lg">
                      {entry.gapMap?.concepts?.[0]?.name?.toUpperCase() || 'UNCLASSIFIED'}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock size={12} className="text-on-surface-variant/60" />
                      <span className="text-[10px] font-bold tracking-widest text-on-surface-variant/60 uppercase">
                        {getRelativeTime(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className={`w-14 h-14 glass rounded-2xl flex items-center justify-center border border-white/10 shadow-xl ${masteryColor}`}>
                    <span className="text-lg font-display font-bold">{entry.mastery}%</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-display font-bold text-on-surface mb-4 group-hover:text-primary transition-colors line-clamp-2">
                    {entry.subject}
                  </h3>
                  <p className="text-sm font-medium text-on-surface-variant/70 mb-10 line-clamp-3 leading-relaxed">
                    Automated analysis of cognitive integrity. Isolated {entry.gaps} critical gaps across {entry.gapMap?.concepts?.length || 0} technical nodes.
                  </p>

                  <div className="mt-auto flex justify-between items-center pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full animate-pulse ${entry.mastery > 70 ? 'bg-success shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-error shadow-[0_0_8px_rgba(248,113,113,0.6)]'}`}></div>
                       <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${masteryColor}`}>
                        {entry.mastery > 70 ? 'High Mastery' : 'Critical Review'}
                       </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                      <ChevronRight size={18} className="text-on-surface group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Record New Session Card */}
          <div 
            onClick={() => dispatch({ type: 'RESET' })}
            className="group glass-card bg-transparent border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center min-h-[460px] transition-all duration-500 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-500 shadow-xl">
              <PlusCircle size={32} className="text-on-surface-variant group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-2xl font-display font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">Record New Session</h3>
            <p className="text-sm font-medium text-on-surface-variant/60 text-center px-12 leading-relaxed">
              Initiate a fresh technical interrogation sequence to expand the intelligence archive.
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-20 flex justify-center pb-12">
             <button 
                onClick={clearHistory}
                className="group flex items-center gap-3 px-6 py-3 rounded-2xl glass border border-white/5 text-error font-bold text-xs tracking-widest uppercase hover:bg-error/10 hover:border-error/20 transition-all duration-300 opacity-40 hover:opacity-100"
              >
                <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                Purge Local Intelligence
              </button>
          </div>
        )}
      </div>
    </div>
  )
}
