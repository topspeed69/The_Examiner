import type { ExamState, ExamAction } from '../state/types'
import { Shield, GraduationCap, BarChart3, History, Plus, LifeBuoy, Settings, BrainCircuit } from 'lucide-react'

interface Props {
  state: ExamState
  dispatch: React.Dispatch<ExamAction>
}

export default function Sidebar({ state, dispatch }: Props) {
  const isInterrogate = state.phase === 'IDLE' || state.phase === 'CLASSIFYING' || state.phase === 'EXAMINING'
  const isTeach = state.phase === 'TEACHING'
  const isReport = state.phase === 'GAP_MAP'
  const isArchive = state.phase === 'ARCHIVE'

  const navigate = (phase: any) => {
    dispatch({ type: 'SET_PHASE', payload: phase })
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-40 glass border-r border-white/5 flex flex-col py-8 gap-4 hidden md:flex">
      {/* Brand Section */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner shadow-primary/10">
            <BrainCircuit className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold tracking-tight text-on-surface">The Examiner</h1>
            <p className="text-[10px] tracking-[0.15em] uppercase text-primary/60 font-semibold">Socratic Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5">
        <NavItem 
          icon={<Shield size={20} />} 
          label="Interrogate" 
          active={isInterrogate} 
          onClick={() => navigate('IDLE')} 
        />
        <NavItem 
          icon={<GraduationCap size={20} />} 
          label="Teach" 
          active={isTeach} 
          onClick={() => navigate('TEACHING')} 
        />
        <NavItem 
          icon={<BarChart3 size={20} />} 
          label="Reports" 
          active={isReport} 
          onClick={() => navigate('GAP_MAP')} 
        />
        <NavItem 
          icon={<History size={20} />} 
          label="History" 
          active={isArchive} 
          onClick={() => navigate('ARCHIVE')} 
        />
      </nav>

      {/* Action Section */}
      <div className="px-4 mb-4">
        <button 
          onClick={() => dispatch({ type: 'RESET' })}
          className="w-full py-2.5 px-4 glass bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 rounded-xl flex items-center justify-center gap-2 text-on-surface font-medium transition-all group active:scale-[0.98]"
        >
          <Plus size={18} className="text-primary group-hover:rotate-90 transition-transform duration-300" />
          <span>New Session</span>
        </button>
      </div>

      {/* Footer Section */}
      <div className="px-4 border-t border-white/5 pt-4 space-y-1">
        <FooterItem icon={<LifeBuoy size={16} />} label="Support" />
        <FooterItem icon={<Settings size={16} />} label="Settings" />
      </div>
    </aside>
  )
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
        active 
          ? 'text-on-surface bg-white/10 border border-white/10 shadow-sm' 
          : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
      }`}
    >
      <span className={`${active ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'} transition-colors`}>
        {icon}
      </span>
      <span className={`text-sm font-medium ${active ? 'text-on-surface' : ''}`}>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.6)]"></div>}
    </button>
  )
}

function FooterItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface text-sm transition-all rounded-lg hover:bg-white/5">
      {icon}
      <span>{label}</span>
    </button>
  )
}
