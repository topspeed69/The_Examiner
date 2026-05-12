/* ============================================
   The Examiner — Type Definitions
   ============================================ */

export type Phase = 'ONBOARDING' | 'IDLE' | 'CLASSIFYING' | 'EXAMINING' | 'TEACHING' | 'GAP_MAP' | 'ARCHIVE'

export type Verdict = 'solid' | 'shaky' | 'gap'

export type Persona = 'interviewer' | 'professor' | 'adversarial'

export type ArtifactType = 'code' | 'paper' | 'system_design' | 'generic'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface GapEval {
  concept: string
  verdict: Verdict
  evidence: string
  teach: string | null
}

export interface Classification {
  type: ArtifactType
  language?: string
  framework?: string
  field?: string
  concepts: string[]
  complexity: 'beginner' | 'intermediate' | 'advanced'
  summary: string
}

export interface GapMapData {
  summary: string
  concepts: Array<{
    name: string
    verdict: Verdict
    explanation: string
    next_action: string
  }>
  strongest_area: string
  critical_gap: string
}

export interface ExamState {
  phase: Phase
  artifact: string
  domain: string
  classification: Classification | null
  rounds: number
  persona: Persona
  activeAgent: string
  currentRound: number
  messages: Message[]
  detectedGaps: GapEval[]
  streamBuffer: string
  isStreaming: boolean
  gapMap: GapMapData | null
  error: string | null
}

export type ExamAction =
  | { type: 'SET_ARTIFACT'; payload: string }
  | { type: 'SET_DOMAIN'; payload: string }
  | { type: 'SET_ROUNDS'; payload: number }
  | { type: 'SET_PERSONA'; payload: Persona }
  | { type: 'START_CLASSIFY' }
  | { type: 'SET_CLASSIFICATION'; payload: Classification }
  | { type: 'BEGIN_EXAM' }
  | { type: 'SET_ACTIVE_AGENT'; payload: string }
  | { type: 'APPEND_STREAM'; payload: string }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'FINISH_RESPONSE'; payload: string }
  | { type: 'SUBMIT_ANSWER'; payload: string }
  | { type: 'ADD_GAP'; payload: GapEval }
  | { type: 'ENTER_TEACHING' }
  | { type: 'EXIT_TEACHING' }
  | { type: 'NEXT_ROUND' }
  | { type: 'FINISH_EXAM' }
  | { type: 'SET_GAP_MAP'; payload: GapMapData }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_PHASE'; payload: Phase }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET' }
