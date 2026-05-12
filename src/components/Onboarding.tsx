import React, { useState } from 'react'
import type { ExamAction } from '../state/types'
import { ArrowLeft, ArrowRight, Terminal, BrainCircuit, GraduationCap, BarChart3, CheckCircle2 } from 'lucide-react'

interface OnboardingProps {
  dispatch: React.Dispatch<ExamAction>
}

const Onboarding: React.FC<OnboardingProps> = ({ dispatch }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const finish = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' })
  }

  return (
    <div className="flex-grow flex flex-col justify-start md:justify-center items-center px-6 md:px-12 max-w-5xl mx-auto w-full py-8 md:py-12 overflow-y-auto">
      {/* Briefing Container */}
      <div className="w-full glass-card overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
        {/* Progress Bar Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/5">
          <div className="flex gap-12">
            <StepHeader step={1} current={currentStep} label="Interrogation" sub="Phase 01" />
            <StepHeader step={2} current={currentStep} label="Teach Mode" sub="Phase 02" />
            <StepHeader step={3} current={currentStep} label="Gap Mapping" sub="Phase 03" />
          </div>
          <div className="hidden md:flex items-center gap-3 text-primary/60">
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase">Briefing in Progress</span>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.6)]"></span>
          </div>
        </div>

        <div className="p-8 md:p-14 min-h-[400px] md:min-h-[450px] flex flex-col">
          {/* Step 1: Interrogation */}
          {currentStep === 1 && (
            <div className="animate-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-6">
                    <BrainCircuit className="text-primary w-6 h-6" />
                  </div>
                  <h2 className="text-4xl font-display font-bold text-on-surface mb-6 leading-tight">Objective: Dismantle Your Assumptions.</h2>
                  <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
                    Interrogation is the entry point. You provide your logic—code, architectural drafts, or papers. The Examiner does not explain; it queries.
                  </p>
                  <div className="glass bg-black/40 p-5 rounded-xl border-l-4 border-primary font-code text-sm text-on-surface/90">
                    <div className="flex items-center gap-2 mb-2 text-primary/70">
                      <Terminal size={14} />
                      <span className="font-bold tracking-tighter">EXAMINER_INIT</span>
                    </div>
                    <span className="text-primary">$ EXAMINE --input artifact.v1</span><br />
                    <span className="text-on-surface-variant opacity-60">&gt; Analyzing structural integrity...</span><br />
                    <span className="text-on-surface-variant opacity-60">&gt; Generating recursive Socratic probes...</span>
                  </div>
                </div>
                <div className="glass bg-white/5 border border-white/10 aspect-square rounded-2xl flex flex-col p-8 relative overflow-hidden group shadow-inner">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] pointer-events-none"></div>
                  <div className="flex-grow flex flex-col justify-center space-y-5 font-code text-sm relative z-10">
                    <div className="glass bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm transition-transform hover:scale-[1.02] duration-500">"How does this function handle a null-pointer inheritance in a race condition?"</div>
                    <div className="glass bg-primary/10 p-4 rounded-xl border border-primary/20 self-end w-4/5 text-primary font-medium">"It relies on the global lock."</div>
                    <div className="glass bg-white/5 p-4 rounded-xl border border-primary/30 shadow-lg shadow-primary/5">"Is reliance on a global lock a design choice or a failure of concurrency abstraction?"</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Teach Mode */}
          {currentStep === 2 && (
            <div className="animate-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="order-2 md:order-1 glass bg-white/5 border border-white/10 aspect-square rounded-2xl p-10 relative flex flex-col items-center justify-center group shadow-inner">
                   <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 mb-8">
                    <GraduationCap className="text-secondary w-7 h-7" />
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full relative mb-12 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-1/2 h-full bg-secondary shadow-[0_0_20px_rgba(129,140,248,0.5)]"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold tracking-[0.15em] text-on-surface uppercase mb-3">Cognitive Gap Detection</p>
                    <p className="text-on-surface-variant text-sm max-w-[280px] leading-relaxed">Mapping missing neural links between 'Requirement' and 'Implementation'.</p>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h2 className="text-4xl font-display font-bold text-secondary mb-6 leading-tight">Phase II: Bridging the Void.</h2>
                  <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
                    Teach Mode activates once a fundamental gap is isolated. It doesn't give answers—it provides the missing context necessary for you to arrive at the solution yourself.
                  </p>
                  <div className="space-y-4">
                    <BenefitItem icon={<CheckCircle2 className="text-secondary" size={20} />} text="Dynamic Concept Synthesis" />
                    <BenefitItem icon={<CheckCircle2 className="text-secondary" size={20} />} text="Structural Analogy Injection" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Gap Map */}
          {currentStep === 3 && (
            <div className="animate-in flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 mb-8 shadow-xl shadow-accent/10">
                <BarChart3 className="text-accent w-8 h-8" />
              </div>
              <h2 className="text-4xl font-display font-bold text-on-surface mb-6 leading-tight">Mastery Quantification.</h2>
              <p className="text-lg text-on-surface-variant mb-12 leading-relaxed">
                The Gap Map is your final dossier. It visualizes the topography of your understanding, marking 'Stable Logic' in teal and 'Structural Leaks' in crimson.
              </p>
              
              <div className="grid grid-cols-3 gap-6 w-full h-40 mb-10">
                <Bar height="h-[85%]" color="bg-primary/40 border-primary/40" />
                <Bar height="h-[35%]" color="bg-error/40 border-error/40" />
                <Bar height="h-full" color="bg-primary/60 border-primary/60" />
              </div>
              
              <p className="text-[10px] font-bold tracking-[0.3em] text-on-surface-variant uppercase bg-white/5 px-4 py-2 rounded-full border border-white/5">Final Mastery Telemetry</p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 md:mt-auto flex justify-between items-center pt-8 border-t border-white/5">
            <button
              className="px-6 py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface flex items-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/5"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft size={18} />
              <span className="font-bold text-xs tracking-widest uppercase">Back</span>
            </button>
            
            <div className="flex gap-2.5">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep === i ? 'bg-primary w-6' : 'bg-white/10'}`}></div>
              ))}
            </div>

            {currentStep < totalSteps ? (
              <button
                className="glass-button-primary flex items-center gap-3 px-10"
                onClick={nextStep}
              >
                <span className="font-bold text-xs tracking-widest uppercase">Next Phase</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                className="glass-button-primary flex items-center gap-3 px-10 shadow-primary/30"
                onClick={finish}
              >
                <span className="font-bold text-xs tracking-widest uppercase">Commence Examination</span>
                <Terminal size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepHeader({ step, current, label, sub }: { step: number, current: number, label: string, sub: string }) {
  const active = current === step
  const completed = current > step
  return (
    <div className={`flex flex-col transition-all duration-300 ${active ? 'opacity-100 translate-y-0' : completed ? 'opacity-50' : 'opacity-30'}`}>
      <span className={`text-[9px] font-bold tracking-[0.2em] uppercase mb-1 ${active ? 'text-primary' : 'text-on-surface-variant'}`}>{sub}</span>
      <span className={`text-sm font-display font-bold ${active ? 'text-on-surface' : 'text-on-surface-variant'}`}>{label}</span>
      {active && <div className="h-0.5 w-full bg-primary mt-2 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)]"></div>}
    </div>
  )
}

function BenefitItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="transition-transform group-hover:scale-110 duration-300">{icon}</div>
      <span className="text-on-surface font-medium transition-colors group-hover:text-primary">{text}</span>
    </div>
  )
}

function Bar({ height, color }: { height: string, color: string }) {
  return (
    <div className="bg-white/5 border border-white/5 h-full flex items-end p-2 rounded-xl overflow-hidden group">
      <div className={`w-full ${height} ${color} rounded-lg transition-all duration-1000 ease-out group-hover:brightness-125 border-b-0`}></div>
    </div>
  )
}

export default Onboarding
