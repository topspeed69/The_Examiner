import { useState, useCallback, useRef } from 'react'
import type { ExamState, ExamAction, Persona } from '../state/types'
import { chatComplete } from '../lib/llm'
import { buildClassifierPrompt, parseClassification } from '../agents/classifier'
import { Terminal, Shield, Sparkles, Activity, Layers, Cpu, Send, Info, Paperclip, FolderOpen, CheckCircle2 } from 'lucide-react'

interface Props {
  state: ExamState
  dispatch: React.Dispatch<ExamAction>
}

const PERSONA_OPTIONS: Array<{ id: Persona; label: string; desc: string; icon: React.ReactNode }> = [
  { id: 'interviewer', label: 'Standard Interview', desc: 'Baseline evaluation protocols.', icon: <Shield size={16} /> },
  { id: 'professor', label: 'Socratic Inquiry', desc: 'Deep conceptual probing.', icon: <Sparkles size={16} /> },
  { id: 'adversarial', label: 'Aggressive Interrogation', desc: 'Stress-test all assumptions.', icon: <Activity size={16} /> },
]

export default function PastePanel({ state, dispatch }: Props) {
  const [isClassifying, setIsClassifying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      dispatch({ type: 'SET_ARTIFACT', payload: content })
    }
    reader.readAsText(file)
  }

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    let combinedContent = ""
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const text = await file.text()
      combinedContent += `--- File: ${file.webkitRelativePath || file.name} ---\n${text}\n\n`
    }
    dispatch({ type: 'SET_ARTIFACT', payload: combinedContent })
  }
  const tokenEstimate = Math.ceil(state.artifact.length / 4)
  const isTooLong = tokenEstimate > 6000

  const handleClassifyAndBegin = useCallback(async () => {
    if (!state.artifact.trim()) return

    setIsClassifying(true)
    dispatch({ type: 'START_CLASSIFY' })

    try {
      const prompt = buildClassifierPrompt(state.artifact, state.domain)

      const content = await chatComplete({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.3
      })

      const classification = parseClassification(content)

      if (classification) {
        dispatch({ type: 'SET_CLASSIFICATION', payload: classification })
      } else {
        dispatch({
          type: 'SET_CLASSIFICATION',
          payload: {
            type: 'generic',
            concepts: [],
            complexity: 'intermediate',
            summary: 'Artifact classification unavailable',
          },
        })
      }
    } catch {
      dispatch({
        type: 'SET_CLASSIFICATION',
        payload: {
          type: 'generic',
          concepts: [],
          complexity: 'intermediate',
          summary: 'Classification skipped — using generic examiner',
        },
      })
    } finally {
      setIsClassifying(false)
      dispatch({ type: 'BEGIN_EXAM' })
    }
  }, [state.artifact, state.domain, dispatch])

  const isReady = state.artifact.trim().length > 0 && !isTooLong

  return (
    <div className="flex-grow flex flex-col xl:flex-row gap-8 w-full h-full pb-24 md:pb-0 animate-in pt-12 px-8 md:px-12">
      
      {/* Left Content Area (Input) */}
      <div className="flex-grow flex flex-col h-full gap-6 xl:w-2/3">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold text-on-surface tracking-tight mb-1">Entry Portal</h1>
            <p className="text-on-surface-variant text-sm">Submit your architectural logic or code for evaluation.</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full border text-[10px] font-bold tracking-[0.1em] uppercase transition-all duration-500 ${
            isClassifying ? 'text-primary border-primary bg-primary/10 animate-pulse' : 
            isReady ? 'text-success border-success/30 bg-success/10' : 
            'text-on-surface-variant border-white/10 bg-white/5'
          }`}>
            {isClassifying ? 'Initializing System' : isReady ? 'Artifact Secured' : 'Awaiting Input'}
          </div>
        </div>
        
        <div className="relative flex-grow flex flex-col glass-card min-h-[400px] border-white/10 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-3">
            <div className="flex items-center gap-3">
              <Terminal size={16} className="text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Artifact Data Stream</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-primary transition-all"
                title="Upload File"
              >
                <Paperclip size={14} />
              </button>
              <button 
                onClick={() => folderInputRef.current?.click()}
                className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-primary transition-all"
                title="Upload Folder"
              >
                <FolderOpen size={14} />
              </button>
              <div className="w-2 h-2 rounded-full bg-white/10 ml-2"></div>
              <div className="w-2 h-2 rounded-full bg-white/10"></div>
              <div className="w-2 h-2 rounded-full bg-primary/40 shadow-[0_0_8px_rgba(56,189,248,0.4)]"></div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <input 
                type="file" 
                ref={folderInputRef} 
                onChange={handleFolderUpload} 
                className="hidden" 
                {...({ webkitdirectory: "", directory: "" } as any)} 
              />
            </div>
          </div>
          <textarea 
            className="flex-grow w-full bg-transparent text-on-surface font-code text-sm p-8 resize-none focus:outline-none placeholder-white/10 leading-relaxed scrollbar-thin" 
            placeholder={`// Paste your code, design docs, or logs here...\n// The Examiner will analyze conceptual integrity.\n// No size limit for local processing.`}
            spellCheck="false"
            value={state.artifact}
            onChange={(e) => dispatch({ type: 'SET_ARTIFACT', payload: e.target.value })}
          />
          {/* Subtle cursor indicator when empty */}
          {!state.artifact && <div className="absolute top-[84px] left-[32px] w-1.5 h-5 bg-primary/40 animate-pulse pointer-events-none rounded-full"></div>}
          
          <div className="px-6 py-3 border-t border-white/5 flex justify-between items-center text-[10px] font-medium text-on-surface-variant/40">
            <span>READY FOR SOCRATIC PROCESSING</span>
            <span>{state.artifact.length} CHARACTERS</span>
          </div>
        </div>
        
        <button 
          onClick={handleClassifyAndBegin}
          disabled={!isReady || isClassifying}
          className={`group glass-button-primary py-5 text-sm font-bold uppercase tracking-[0.2em] flex justify-center items-center gap-4 shadow-xl ${
            !isReady || isClassifying ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:shadow-primary/30 active:scale-[0.99]'
          }`}
        >
          <span>{isClassifying ? 'Synchronizing Protocols...' : 'Initiate Examination'}</span>
          {!isClassifying && <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
        </button>
      </div>

      {/* Right Sidebar (Status) */}
      <aside className="xl:w-1/3 flex flex-col gap-6 shrink-0 h-full">
        
        {/* Operator Status */}
        <div className="glass-card border-white/10 p-1">
          <div className="px-5 py-3 border-b border-white/5 bg-white/5 rounded-t-xl flex items-center gap-2">
            <Activity size={14} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface">System Diagnostics</span>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <DiagnosticRow label="Operator" value="Ready" status="online" />
            <DiagnosticRow label="System" value={isClassifying ? "Busy" : "Idle"} status={isClassifying ? "busy" : "idle"} />
            <DiagnosticRow label="Uplink" value="Stable" status="online" />
          </div>
        </div>

        {/* Context Info */}
        <div className="glass-card border-white/10 flex-grow flex flex-col">
          <div className="px-5 py-3 border-b border-white/5 bg-white/5 rounded-t-xl flex items-center gap-2">
            <Layers size={14} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface">Exam Parameters</span>
          </div>
          <div className="p-6 space-y-8 flex-grow">
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <Shield size={12} /> Analysis Mode
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PERSONA_OPTIONS.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => dispatch({ type: 'SET_PERSONA', payload: p.id })}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left group ${
                      state.persona === p.id 
                        ? 'bg-primary/10 border-primary/30 text-on-surface' 
                        : 'bg-white/5 border-white/5 text-on-surface-variant hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <div className={`transition-colors ${state.persona === p.id ? 'text-primary' : 'group-hover:text-on-surface'}`}>
                      {p.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{p.label}</div>
                    </div>
                    {state.persona === p.id && <CheckCircle2 size={14} className="ml-auto text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <Cpu size={12} /> Depth Complexity
              </label>
              <select 
                className="w-full glass-input bg-white/5 text-xs font-bold text-on-surface py-3"
                value={state.rounds}
                onChange={(e) => dispatch({ type: 'SET_ROUNDS', payload: Number(e.target.value) })}
              >
                <option value={3} className="bg-surface">3 Rounds - Quick Audit</option>
                <option value={5} className="bg-surface">5 Rounds - Standard Exam</option>
                <option value={10} className="bg-surface">10 Rounds - Deep Interrogation</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <Info size={12} /> Target Context
              </label>
              <input 
                className="w-full glass-input text-xs font-bold text-primary placeholder:text-white/10 py-3"
                placeholder="AUTO-DETECT DOMAIN..."
                value={state.domain}
                onChange={(e) => dispatch({ type: 'SET_DOMAIN', payload: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Visual filler */}
        <div className="glass-card border-white/5 bg-black/40 p-5 overflow-hidden h-36 hidden xl:block relative group">
          <div className="font-code text-[10px] text-primary/40 whitespace-pre leading-relaxed group-hover:text-primary/60 transition-colors duration-500">
            &gt; SYSTEM_READY_FOR_DATA<br/>
            &gt; MEMORY_ALLOCATED: 1024MB<br/>
            <span className={isReady ? 'text-primary font-bold' : ''}>
              &gt; {isReady ? 'ARTIFACT_BUFFER_STABLE' : 'WAITING_FOR_STREAM...'}
            </span><br/>
            &gt; AGENT_LOADED: {state.persona.toUpperCase()}<br/>
            &gt; UPLINK_ENCRYPTED: AES-256
          </div>
          <div className="absolute bottom-4 right-4 flex gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse delay-150"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse delay-300"></div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function DiagnosticRow({ label, value, status }: { label: string, value: string, status: 'online' | 'busy' | 'idle' }) {
  const statusColor = {
    online: 'bg-success shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    busy: 'bg-warning shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    idle: 'bg-on-surface-variant'
  }[status]
  
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2.5">
        <span className={`text-[10px] font-bold uppercase ${status === 'online' ? 'text-success' : status === 'busy' ? 'text-warning' : 'text-on-surface-variant'}`}>{value}</span>
        <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
      </div>
    </div>
  )
}


