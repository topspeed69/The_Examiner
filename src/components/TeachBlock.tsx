import { Search, BookOpen, BrainCircuit, X, CheckCircle2, ChevronRight, Info, Zap, Paperclip, FolderOpen } from 'lucide-react'
import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface Props {
  concept: string
  verdict: 'shaky' | 'gap'
  teach: string
  onDismiss: () => void
}

export default function TeachBlock({ concept, verdict, teach, onDismiss }: Props) {
  const isGap = verdict === 'gap'
  const mermaidRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    console.log(`Uploaded ${file.name} for concept ${concept}`)
    alert(`File ${file.name} attached for analysis of ${concept}. The examiner will process this data upon resumption.`)
  }

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    console.log(`Uploaded folder with ${files.length} files for concept ${concept}`)
    alert(`Folder with ${files.length} files attached for analysis of ${concept}. The examiner will process this data upon resumption.`)
  }

  useEffect(() => {
    mermaid.initialize({
      theme: 'dark',
      themeVariables: {
        primaryColor: '#0ea5e9',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: isGap ? '#ef4444' : '#0ea5e9',
        lineColor: isGap ? '#ef4444' : '#0ea5e9',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        fontFamily: 'Inter',
      },
      flowchart: { curve: 'basis' },
      securityLevel: 'loose'
    })

    if (mermaidRef.current) {
      const diagram = `
        graph TD
          A[Core Logic] --> B{Validation}
          B -->|Pass| C[Execution]
          B -->|Fail| D[Correction]
          C --> E[State Update]
          D --> A
          
          style A fill:#0f172a,stroke:${isGap ? '#ef4444' : '#0ea5e9'},stroke-width:2px,color:#f8fafc
          style B fill:#0f172a,stroke:${isGap ? '#ef4444' : '#0ea5e9'},stroke-width:2px,color:#f8fafc
          style C fill:#0f172a,stroke:${isGap ? '#ef4444' : '#0ea5e9'},stroke-width:2px,color:#f8fafc
          style D fill:#0f172a,stroke:#ef4444,stroke-width:2px,color:#f8fafc
          style E fill:#0f172a,stroke:${isGap ? '#ef4444' : '#0ea5e9'},stroke-width:2px,color:#f8fafc
      `
      
      const renderDiagram = async () => {
        try {
          const { svg } = await mermaid.render('mermaid-diag-' + Math.random().toString(36).substr(2, 5), diagram)
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg
          }
        } catch (error) {
          console.error("Mermaid rendering failed:", error)
        }
      }
      renderDiagram()
    }
  }, [concept, isGap])

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-8 sm:p-12 lg:p-20 animate-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all" onClick={onDismiss} />
      
      <div className="w-full max-w-6xl glass-card bg-white/5 border-white/5 rounded-3xl flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 scale-in transition-transform">
          
          {/* Header */}
          <div className={`${isGap ? 'bg-error/10 border-error/20' : 'bg-primary/10 border-primary/20'} border-b p-8 flex justify-between items-center relative overflow-hidden`}>
             <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-30"></div>
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${isGap ? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'}`}>
                    <BrainCircuit size={20} />
                  </div>
                  <span className={`text-[10px] font-bold tracking-[0.3em] uppercase ${isGap ? 'text-error' : 'text-primary'}`}>
                    Intelligence Correction Sequence
                  </span>
                </div>
                <h2 className="text-4xl font-display font-bold text-on-surface">
                   Refining Concept: <span className={isGap ? 'text-error underline decoration-error/30' : 'text-primary underline decoration-primary/30'}>{concept}</span>
                </h2>
             </div>
             <button 
               onClick={onDismiss}
               className="p-3 rounded-2xl glass border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-all relative z-10"
             >
                <X size={24} />
             </button>
          </div>

          {/* Split Content */}
          <div className="flex flex-col lg:flex-row h-[600px] overflow-hidden">
             
             {/* Left: Explanation */}
             <div className="flex-1 flex flex-col bg-white/2 border-r border-white/5">
                <div className="bg-white/5 px-8 py-4 flex items-center gap-3 border-b border-white/5">
                   <BookOpen size={16} className="text-primary" />
                   <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">Logic Realignment</span>
                </div>
                <div className="p-10 overflow-auto flex-1 font-body text-sm leading-relaxed text-on-surface/80 scrollbar-thin">
                   {teach.split('\n').map((line, i) => {
                      if (line.includes('**')) {
                         const parts = line.split('**')
                         return (
                           <p key={i} className="mb-6 last:mb-0">
                             {parts.map((part, j) => 
                               j % 2 === 1 
                                 ? <span key={j} className={`font-bold ${isGap ? 'text-error' : 'text-primary'}`}>{part}</span> 
                                 : part
                             )}
                           </p>
                         )
                      }
                      return <p key={i} className="mb-6 last:mb-0">{line}</p>
                   })}
                   
                   {/* Simulated Code Diagnostic */}
                   <div className="mt-10 glass-card bg-black/40 border-white/5 p-6 rounded-2xl relative shadow-xl">
                      <div className="absolute -top-3 left-6 px-3 py-0.5 bg-secondary text-black rounded-full font-bold text-[9px] tracking-widest uppercase">
                         Diagnostic Output
                      </div>
                      <div className="font-code text-xs text-on-surface-variant leading-loose mt-2">
                         <span className="text-primary/40">01</span> <span className="text-primary">/// Logic Validation Trace</span><br/>
                         <span className="text-primary/40">02</span> <span className="text-white/60">Initialize context </span> <span className="text-secondary">[{concept}]</span><br/>
                         <span className="text-primary/40">03</span> <span className={`px-2 py-0.5 rounded ${isGap ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                           {isGap ? 'CRITICAL_GAP_ISOLATED' : 'SHAKY_FOUNDATION_REINFORCED'}
                         </span><br/>
                         <span className="text-primary/40">04</span> <span className="text-white/40">Status: Corrective data injected</span><br/>
                         <span className="text-primary/40">05</span> <span className="text-success flex items-center gap-2 mt-2">
                            <CheckCircle2 size={12} />
                            Mastery potential restored
                         </span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right: Schematic */}
             <div className="flex-1 flex flex-col bg-transparent">
                <div className="bg-white/5 px-8 py-4 flex items-center gap-3 border-b border-white/5">
                   <Search size={16} className="text-secondary" />
                   <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">Schematic Breakdown</span>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-12 overflow-hidden relative">
                   <div className="absolute inset-0 opacity-10" style={{ 
                      backgroundImage: `radial-gradient(var(${isGap ? '--color-error' : '--color-primary'}) 1px, transparent 1px)`,
                      backgroundSize: '32px 32px'
                   }} />
                   
                   <div className="mermaid relative z-10 w-full flex justify-center filter drop-shadow-2xl" ref={mermaidRef}></div>
                   
                   {/* Tooltip Decoration */}
                   <div className="absolute bottom-8 right-8 glass bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
                      <Info size={16} className="text-primary" />
                      <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Interactive Schematic v2.0</span>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Footer */}
          <div className="glass bg-white/5 border-t border-white/5 p-8 flex justify-between items-center relative z-10">
             <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isGap ? 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-primary shadow-[0_0_8px_rgba(14,165,233,0.6)]'}`}></div>
                <p className="text-[10px] font-bold tracking-widest text-on-surface-variant/60 uppercase leading-relaxed">
                   Acknowledge correction to resume interrogation sequence.<br/>
                   Structural integrity of the session depends on implementation.
                </p>
             </div>
             
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="glass p-3 rounded-xl text-on-surface-variant hover:text-primary transition-all flex items-center gap-2 group"
                  title="Attach File"
                >
                   <Paperclip size={18} className="group-hover:rotate-12 transition-transform" />
                </button>
                <button 
                  onClick={() => folderInputRef.current?.click()}
                  className="glass p-3 rounded-xl text-on-surface-variant hover:text-primary transition-all flex items-center gap-2 group"
                  title="Attach Folder"
                >
                   <FolderOpen size={18} className="group-hover:rotate-12 transition-transform" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={folderInputRef} 
                  onChange={handleFolderUpload} 
                  className="hidden" 
                  {...({ webkitdirectory: "", directory: "" } as any)}
                />
                
                <button 
                  onClick={onDismiss}
                  className="glass-button-primary px-10 py-4 flex items-center gap-3 group"
                >
                   <Zap size={18} className="group-hover:scale-125 transition-transform" />
                   Resume Interrogation
                   <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
      </div>
    </div>
  )
}
