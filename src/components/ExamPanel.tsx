import { useState, useCallback, useEffect, useRef } from 'react'
import type { ExamState, ExamAction } from '../state/types'
import { useExamStream } from '../hooks/useExamStream'
import { orchestrate, buildFirstQuestionPrompt } from '../agents/orchestrator'
import { extractGapEval, stripGapEvalTags, hasCompleteGapEval } from '../utils/parseGapEval'
import TeachBlock from './TeachBlock'
import { BrainCircuit, Send, User, AlertCircle, FileText, XCircle, GraduationCap, History, Paperclip, Terminal, Loader2, FolderOpen } from 'lucide-react'

interface Props {
  state: ExamState
  dispatch: React.Dispatch<ExamAction>
}

export default function ExamPanel({ state, dispatch }: Props) {
  const [answer, setAnswer] = useState('')
  const [lastGapTeach, setLastGapTeach] = useState<{ concept: string; verdict: 'shaky' | 'gap'; teach: string } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  
  // Refs for Artifact View upload
  const artifactFileRef = useRef<HTMLInputElement>(null)
  const artifactFolderRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setAnswer(prev => prev + (prev ? '\n\n' : '') + `[Attached File: ${file.name}]\n${content}`)
    }
    reader.readAsText(file)
  }

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    let combinedContent = `[Attached Folder Upload: ${files.length} files]\n\n`
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const text = await file.text()
      combinedContent += `--- File: ${file.webkitRelativePath || file.name} ---\n${text}\n\n`
    }
    setAnswer(prev => prev + (prev ? '\n\n' : '') + combinedContent)
  }

  const handleArtifactFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      dispatch({ type: 'SET_ARTIFACT', payload: content })
    }
    reader.readAsText(file)
  }

  const handleArtifactFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [state.streamBuffer, state.messages])

  const handleStreamComplete = useCallback((fullText: string) => {
    if (hasCompleteGapEval(fullText)) {
      const gap = extractGapEval(fullText)
      if (gap) {
        dispatch({ type: 'ADD_GAP', payload: gap })

        if (gap.verdict !== 'solid' && gap.teach) {
          setLastGapTeach({
            concept: gap.concept,
            verdict: gap.verdict,
            teach: gap.teach,
          })
        } else {
          setLastGapTeach(null)
        }
      }
    }

    if (state.currentRound >= state.rounds) {
      setTimeout(() => {
        dispatch({ type: 'FINISH_EXAM' })
      }, 2000)
    }
  }, [state.currentRound, state.rounds, dispatch])

  const { startStream } = useExamStream({
    dispatch,
    onStreamComplete: handleStreamComplete,
  })

  const orchOutput = orchestrate({
    artifact: state.artifact,
    domain: state.domain,
    artifactType: state.classification?.type || 'generic',
    persona: state.persona,
    totalRounds: state.rounds,
    currentRound: state.currentRound,
    detectedGaps: state.detectedGaps.map(g => ({ concept: g.concept, verdict: g.verdict })),
  })

  useEffect(() => {
    if (state.phase === 'EXAMINING' && state.messages.length === 0 && !state.isStreaming) {
      dispatch({ type: 'SET_ACTIVE_AGENT', payload: orchOutput.activeAgentName })
      const firstMsg = buildFirstQuestionPrompt()
      startStream(orchOutput.systemPrompt, [{ role: 'user', content: firstMsg }])
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === 'TEACHING' && !lastGapTeach) {
      const gapWithTeach = [...state.detectedGaps].reverse().find(g => g.teach && g.verdict !== 'solid')
      if (gapWithTeach) {
        setLastGapTeach({
          concept: gapWithTeach.concept,
          verdict: gapWithTeach.verdict as 'shaky' | 'gap',
          teach: gapWithTeach.teach!
        })
      } else {
        dispatch({ type: 'EXIT_TEACHING' })
      }
    }
  }, [state.phase, lastGapTeach, state.detectedGaps, dispatch])

  const handleSubmitAnswer = useCallback(() => {
    if (!answer.trim() || state.isStreaming) return

    const userAnswer = answer.trim()
    setAnswer('')
    setLastGapTeach(null)

    dispatch({ type: 'SUBMIT_ANSWER', payload: userAnswer })

    if (state.currentRound < state.rounds) {
      dispatch({ type: 'NEXT_ROUND' })

      const nextOrch = orchestrate({
        artifact: state.artifact,
        domain: state.domain,
        artifactType: state.classification?.type || 'generic',
        persona: state.persona,
        totalRounds: state.rounds,
        currentRound: state.currentRound + 1,
        detectedGaps: [...state.detectedGaps].map(g => ({ concept: g.concept, verdict: g.verdict })),
      })

      dispatch({ type: 'SET_ACTIVE_AGENT', payload: nextOrch.activeAgentName })

      const allMessages = [
        ...state.messages,
        { role: 'user' as const, content: userAnswer },
      ]

      startStream(nextOrch.systemPrompt, allMessages)
    } else {
      dispatch({ type: 'FINISH_EXAM' })
    }
  }, [answer, state, dispatch, startStream])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  const gapCount = state.detectedGaps.filter(g => g.verdict === 'gap').length
  const shakyCount = state.detectedGaps.filter(g => g.verdict === 'shaky').length
  
  const threatLevel = gapCount > 1 ? 'Adversarial' : gapCount === 1 ? 'Critical' : shakyCount > 0 ? 'Shaky' : 'Stable'
  const isTeachMode = state.phase === 'TEACHING'

  const codeLines = state.artifact.split('\n')

  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-12 animate-in">
      {/* Progress Bar Section */}
      <div className="w-full glass bg-white/5 border-b border-white/5 px-12 py-5 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-6 items-center">
             <div className="flex flex-col">
              <span className="text-[9px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-0.5">Threat Level</span>
              <span className={`text-sm font-display font-bold ${threatLevel === 'Adversarial' ? 'text-error' : threatLevel === 'Stable' ? 'text-success' : 'text-primary'}`}>{threatLevel}</span>
            </div>
            {isTeachMode && (
              <div className="flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.6)]"></div>
                <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Teach Mode Active</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-0.5">Progress</span>
            <span className="text-sm font-display font-bold text-on-surface">Iteration {state.currentRound}/{state.rounds}</span>
          </div>
        </div>
        <div className="flex w-full gap-1.5 h-1.5">
          {Array.from({ length: state.rounds }).map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-full transition-all duration-500 ${
                i < state.currentRound 
                  ? (state.detectedGaps[i]?.verdict === 'gap' ? 'bg-error shadow-[0_0_8px_rgba(248,113,113,0.4)]' : 'bg-primary shadow-[0_0_8px_rgba(56,189,248,0.4)]') 
                  : 'bg-white/10'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Split Screen View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Artifact View */}
        <section className="w-1/2 border-r border-white/5 bg-black/20 flex flex-col shadow-inner">
          <div className="h-12 bg-white/5 flex items-center px-6 justify-between border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <FileText size={14} className="text-on-surface-variant" />
              <span className="text-xs font-medium text-on-surface-variant truncate max-w-[240px]">{state.classification?.summary || 'artifact.txt'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => artifactFileRef.current?.click()}
                className="p-1 hover:bg-white/10 rounded text-on-surface-variant hover:text-primary transition-all"
                title="Update Artifact from File"
              >
                <Paperclip size={12} />
              </button>
              <button 
                onClick={() => artifactFolderRef.current?.click()}
                className="p-1 hover:bg-white/10 rounded text-on-surface-variant hover:text-primary transition-all"
                title="Update Artifact from Folder"
              >
                <FolderOpen size={12} />
              </button>
              <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                <Terminal size={10} className="text-primary" />
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase">{state.classification?.language || 'Plain Text'}</span>
              </div>
              <input type="file" ref={artifactFileRef} onChange={handleArtifactFileUpload} className="hidden" />
              <input 
                type="file" 
                ref={artifactFolderRef} 
                onChange={handleArtifactFolderUpload} 
                className="hidden" 
                {...({ webkitdirectory: "", directory: "" } as any)} 
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto font-code text-xs p-6 leading-relaxed bg-transparent scrollbar-thin">
            <div className="flex">
              <div className="text-on-surface-variant/30 text-right pr-6 select-none w-12 border-r border-white/5 mr-6 font-medium">
                {codeLines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <div className="flex-1 whitespace-pre text-on-surface/80">
                {codeLines.map((line, i) => (
                  <div key={i} className="min-h-[1.25rem] transition-colors hover:bg-white/5 rounded px-1">{line || ' '}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Socratic Thread */}
        <section className="w-1/2 bg-transparent flex flex-col relative">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 py-12 space-y-10 pb-40 scroll-smooth scrollbar-thin">
            {state.messages.map((msg, i) => (
              <div key={i} className={`flex gap-5 items-start animate-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border shadow-lg ${
                  msg.role === 'assistant' 
                    ? 'bg-primary/10 border-primary/20 text-primary' 
                    : 'bg-white/5 border-white/10 text-on-surface-variant'
                }`}>
                  {msg.role === 'assistant' ? <BrainCircuit size={20} /> : <User size={20} />}
                </div>
                <div className={`max-w-[85%] space-y-3 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    <span className={`text-[10px] font-bold tracking-[0.15em] uppercase ${msg.role === 'assistant' ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {msg.role === 'assistant' ? 'Examiner' : 'Operator'}
                    </span>
                    {msg.role === 'assistant' && i === state.messages.length - 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[8px] font-bold uppercase tracking-widest">Active Probe</span>
                    )}
                  </div>
                  <div className={`glass p-5 rounded-2xl text-sm leading-relaxed shadow-sm border-white/5 ${
                    msg.role === 'assistant' 
                      ? 'rounded-tl-none bg-white/5 text-on-surface/90' 
                      : 'rounded-tr-none bg-primary/10 text-on-surface border-primary/10'
                  }`}>
                    <MessageContent content={msg.content} />
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming Box */}
            {state.isStreaming && state.streamBuffer && (
              <div className="flex gap-5 items-start animate-in">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-primary/10 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
                  <BrainCircuit size={20} className="text-primary animate-pulse" />
                </div>
                <div className="max-w-[85%] space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold tracking-[0.15em] text-primary uppercase">Examiner</span>
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-error/10 border border-error/20">
                      <Loader2 size={10} className="text-error animate-spin" />
                      <span className="text-[8px] font-bold text-error uppercase tracking-widest">Generating Probe</span>
                    </div>
                  </div>
                  <div className="glass p-5 rounded-2xl rounded-tl-none text-sm leading-relaxed text-on-surface/90 bg-white/5 border-white/10 animate-pulse">
                    <MessageContent content={state.streamBuffer} />
                  </div>
                </div>
              </div>
            )}

            {/* Gap Detected Prompt */}
            {lastGapTeach && !state.isStreaming && !isTeachMode && (
              <div className="flex gap-5 items-start animate-in pt-4">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-error/10 border border-error/30 flex items-center justify-center shadow-lg shadow-error/10">
                  <AlertCircle size={20} className="text-error" />
                </div>
                <div className="max-w-[85%] space-y-4 w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold tracking-[0.15em] text-error uppercase">System Alert</span>
                    <span className="px-2 py-0.5 rounded-full bg-error/10 border border-error/20 text-error text-[8px] font-bold uppercase tracking-widest">Gap Detected</span>
                  </div>
                  <div className="glass bg-error/5 border border-error/10 p-6 rounded-2xl shadow-xl flex flex-col gap-5">
                    <p className="text-sm text-on-surface/90 leading-relaxed">
                      The Examiner has identified a conceptual or implementation gap regarding <span className="font-bold text-error underline decoration-error/30 underline-offset-4">{lastGapTeach.concept}</span>.
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setLastGapTeach(null)}
                        className="px-5 py-2 rounded-xl glass border border-white/10 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all"
                      >
                        Resume
                      </button>
                      <button 
                        onClick={() => dispatch({ type: 'ENTER_TEACHING' })}
                        className="glass-button-primary px-6 py-2 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 bg-error hover:bg-error/80 shadow-error/20"
                      >
                        <GraduationCap size={16} />
                        Enter Teach Mode
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gap Teach Box */}
            {lastGapTeach && !state.isStreaming && isTeachMode && (
              <TeachBlock
                concept={lastGapTeach.concept}
                verdict={lastGapTeach.verdict}
                teach={lastGapTeach.teach}
                onDismiss={() => {
                  setLastGapTeach(null)
                  dispatch({ type: 'EXIT_TEACHING' })
                }}
              />
            )}
          </div>

          {/* Input Zone */}
          <div className="absolute bottom-0 left-0 w-full p-8 bg-linear-to-t from-background via-background/95 to-transparent z-10">
            <div className="glass-card bg-white/5 border-white/10 shadow-2xl rounded-2xl overflow-hidden relative group focus-within:border-primary/30 transition-all duration-300">
              <textarea
                ref={textareaRef}
                className="w-full bg-transparent p-6 pr-20 font-body text-sm focus:outline-none resize-none h-32 text-on-surface placeholder-white/20 scrollbar-none leading-relaxed"
                placeholder="Analyze the inquiry and propose a mitigation..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={state.isStreaming || (lastGapTeach !== null && !isTeachMode)}
              />
              <button 
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || state.isStreaming || (lastGapTeach !== null && !isTeachMode)}
                className="absolute right-4 bottom-4 w-12 h-12 glass-button-primary p-0 flex items-center justify-center disabled:opacity-20 disabled:grayscale transition-all rounded-xl"
              >
                <Send size={20} className={answer.trim() && !state.isStreaming ? "translate-x-0.5 -translate-y-0.5" : ""} />
              </button>
              
              <div className="absolute bottom-4 left-6 flex gap-4 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-on-surface-variant hover:text-primary transition-colors p-1"
                  title="Upload File"
                >
                  <Paperclip size={16} />
                </button>
                <button 
                  onClick={() => folderInputRef.current?.click()}
                  className="text-on-surface-variant hover:text-primary transition-colors p-1"
                  title="Upload Folder"
                >
                  <FolderOpen size={16} />
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
                <button className="text-on-surface-variant hover:text-primary transition-colors p-1">
                  <History size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-14 flex justify-between items-center px-12 glass bg-white/5 border-t border-white/5 z-20">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => dispatch({ type: 'RESET' })}
            className="flex items-center gap-2.5 text-on-surface-variant hover:text-error transition-all group"
          >
            <XCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[10px] font-bold tracking-widest uppercase">End Session</span>
          </button>
          <button 
            onClick={() => dispatch({ type: 'ENTER_TEACHING' })}
            className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border transition-all ${
              isTeachMode 
                ? 'bg-secondary/10 border-secondary/30 text-secondary' 
                : 'border-transparent text-on-surface-variant hover:text-secondary hover:bg-white/5'
            }`}
          >
            <GraduationCap size={18} />
            <span className="text-[10px] font-bold tracking-widest uppercase">Teach Mode</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[8px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">System Status</span>
            <span className={`text-[10px] font-bold uppercase ${state.isStreaming ? 'text-error' : 'text-success'}`}>
              {state.isStreaming ? 'Diagnosing Gap' : 'Awaiting Response'}
            </span>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${state.isStreaming ? 'bg-error animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.6)]' : 'bg-success shadow-[0_0_8px_rgba(52,211,153,0.6)]'}`}></div>
        </div>
      </footer>
    </div>
  )
}

function MermaidChatBlock({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    if (ref.current && chart) {
      import('mermaid').then(mermaid => {
        mermaid.default.initialize({ theme: 'dark', startOnLoad: false })
        mermaid.default.render(id.current, chart).then(({ svg }) => {
          if (ref.current) ref.current.innerHTML = svg
        })
      })
    }
  }, [chart])

  return <div ref={ref} className="mermaid-chart py-4 flex justify-center bg-black/20 rounded-xl my-2 border border-white/5" id={id.current} />
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```mermaid\n[\s\S]*?\n```)/g)
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```mermaid')) {
          const chart = part.replace(/```mermaid\n/, '').replace(/\n```/, '')
          return <MermaidChatBlock key={i} chart={chart} />
        }
        return <div key={i} className="whitespace-pre-wrap">{stripGapEvalTags(part)}</div>
      })}
    </>
  )
}
