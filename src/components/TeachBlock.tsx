/* ============================================
   TeachBlock — Gap/Shaky Teaching Card
   ============================================ */

interface Props {
  concept: string
  verdict: 'shaky' | 'gap'
  teach: string
}

export default function TeachBlock({ concept, verdict, teach }: Props) {
  const isGap = verdict === 'gap'

  return (
    <div
      className={`animate-slide-up ml-4 ${isGap ? 'verdict-bg-gap' : 'verdict-bg-shaky'} p-5`}
    >
      <div className="mb-2 flex items-center gap-3">
        <span
          className={`
            px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.2em]
            ${isGap
              ? 'bg-accent-gap/15 text-accent-gap border border-accent-gap/30'
              : 'bg-accent-shaky/15 text-accent-shaky border border-accent-shaky/30'
            }
          `}
          style={{ fontFamily: 'var(--font-label)' }}
        >
          {isGap ? '◆ Gap Detected' : '◇ Shaky'}
        </span>
        <span className="text-xs font-medium text-text-primary">{concept}</span>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">
        {teach}
      </p>
    </div>
  )
}
