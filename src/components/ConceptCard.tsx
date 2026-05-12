import type { Verdict } from '../state/types'
import { ShieldCheck, AlertTriangle, HelpCircle, ChevronRight, Zap } from 'lucide-react'

interface Props {
  name: string
  verdict: Verdict | string
  explanation: string
  nextAction: string
  delay: number
}

export default function ConceptCard({ name, verdict, explanation, nextAction, delay }: Props) {
  const verdictConfig = {
    solid: {
      accentClass: 'text-success',
      bgClass: 'bg-success/5 border-success/20',
      icon: <ShieldCheck size={14} />,
      label: 'Verified',
    },
    shaky: {
      accentClass: 'text-primary',
      bgClass: 'bg-primary/5 border-primary/20',
      icon: <HelpCircle size={14} />,
      label: 'Shaky',
    },
    gap: {
      accentClass: 'text-error',
      bgClass: 'bg-error/5 border-error/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
      icon: <AlertTriangle size={14} />,
      label: 'Gap Detected',
    },
  }

  const config = verdictConfig[verdict as Verdict] || verdictConfig.gap

  return (
    <div
      className={`glass-card p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 ${config.bgClass} animate-in`}
      style={{ animationDelay: `${delay * 0.05}s` }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <h3 className="text-sm font-display font-bold text-on-surface leading-tight">{name}</h3>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/5 bg-black/20 ${config.accentClass}`}
        >
          {config.icon}
          {config.label}
        </div>
      </div>

      {/* Explanation */}
      <p className="mb-5 text-xs font-medium leading-relaxed text-on-surface-variant/80 italic border-l-2 border-white/5 pl-4">
        "{explanation}"
      </p>

      {/* Next Action */}
      {nextAction && (
        <div className="pt-4 border-t border-white/5 group">
          <div className="flex items-center gap-2 mb-1.5 opacity-50">
            <Zap size={10} className="text-primary" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Recommended Vector</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary group-hover:text-on-surface transition-colors">
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            <span>{nextAction}</span>
          </div>
        </div>
      )}
    </div>
  )
}
