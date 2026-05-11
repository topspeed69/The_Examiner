/* ============================================
   RoundIndicator — Progress + Active Agent Label
   ============================================ */

interface Props {
  currentRound: number
  totalRounds: number
  mode: string
  agentName: string
}

export default function RoundIndicator({ currentRound, totalRounds, mode, agentName }: Props) {
  return (
    <div className="mb-8 animate-slide-down">
      {/* Agent + Round info */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="bg-accent-examiner/10 border border-accent-examiner/20 px-2.5 py-1 text-[0.6rem] text-accent-examiner"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            {agentName}
          </span>
          <span
            className="text-[0.65rem] uppercase tracking-[0.2em] text-text-muted"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            Round {currentRound} of {totalRounds}
          </span>
        </div>
        <span
          className="text-[0.6rem] uppercase tracking-[0.15em] text-accent-examiner/70"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          {mode}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {Array.from({ length: totalRounds }, (_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 transition-all duration-500 ${
              i < currentRound
                ? 'bg-accent-examiner'
                : i === currentRound - 1
                  ? 'bg-accent-examiner animate-pulse-glow'
                  : 'bg-border-subtle'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
