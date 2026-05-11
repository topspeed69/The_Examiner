/* ============================================
   ConceptCard — Per-Concept Verdict Card
   ============================================ */

import type { Verdict } from '../state/types'

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
      borderClass: 'verdict-bg-solid',
      badgeClass: 'bg-accent-solid/15 text-accent-solid border border-accent-solid/30',
      label: '✓ Solid',
    },
    shaky: {
      borderClass: 'verdict-bg-shaky',
      badgeClass: 'bg-accent-shaky/15 text-accent-shaky border border-accent-shaky/30',
      label: '◇ Shaky',
    },
    gap: {
      borderClass: 'verdict-bg-gap',
      badgeClass: 'bg-accent-gap/15 text-accent-gap border border-accent-gap/30',
      label: '◆ Gap',
    },
  }

  const config = verdictConfig[verdict as Verdict] || verdictConfig.gap

  return (
    <div
      className={`animate-slide-up ${config.borderClass} p-5 transition-all duration-200 hover:translate-y-[-2px]`}
      style={{ animationDelay: `${delay * 0.08}s`, opacity: 0 }}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-medium text-text-primary">{name}</h3>
        <span
          className={`${config.badgeClass} px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.15em] whitespace-nowrap`}
          style={{ fontFamily: 'var(--font-label)' }}
        >
          {config.label}
        </span>
      </div>

      {/* Explanation */}
      <p className="mb-4 text-xs leading-relaxed text-text-secondary">
        {explanation}
      </p>

      {/* Next Action */}
      {nextAction && (
        <div className="border-t border-border-subtle pt-3">
          <div
            className="mb-1 text-[0.55rem] uppercase tracking-[0.15em] text-text-muted"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            Next step
          </div>
          <p className="text-xs text-text-primary/80">
            → {nextAction}
          </p>
        </div>
      )}
    </div>
  )
}
