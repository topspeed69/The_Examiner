import { Activity, Target } from 'lucide-react'

interface Props {
  currentRound: number
  totalRounds: number
  mode: string
  agentName: string
}

export default function RoundIndicator({ currentRound, totalRounds, mode, agentName }: Props) {
  return (
    <div className="mb-10 animate-in">
      {/* Agent + Round info */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass border border-white/10 bg-primary/10 shadow-lg shadow-primary/5">
            <Activity size={12} className="text-primary animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
              {agentName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target size={12} className="text-on-surface-variant/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/60">
              Round {currentRound} <span className="opacity-30">/</span> {totalRounds}
            </span>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 text-[9px] font-bold tracking-widest text-on-surface-variant/80 uppercase">
          {mode}
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {Array.from({ length: totalRounds }, (_, i) => {
          const isActive = i === currentRound - 1
          const isCompleted = i < currentRound - 1
          
          return (
            <div
              key={i}
              className="h-1.5 flex-1 relative overflow-hidden rounded-full bg-white/5 border border-white/5"
            >
              <div
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  isCompleted 
                    ? 'bg-success/40' 
                    : isActive 
                      ? 'bg-primary shadow-[0_0_12px_rgba(14,165,233,0.4)]' 
                      : 'bg-transparent'
                }`}
                style={{
                  width: isCompleted || isActive ? '100%' : '0%',
                  transform: isActive ? 'scaleX(1)' : isCompleted ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left'
                }}
              />
              {isActive && (
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
