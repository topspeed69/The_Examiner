/* ============================================
   Agent Type Definitions
   ============================================ */

import type { ArtifactType, Persona } from '../state/types'

/** Strategy for a specific round of examination */
export interface RoundStrategy {
  mode: string
  instruction: string
}

/** An examination agent with identity, skills, and round strategies */
export interface ExaminerAgent {
  id: string
  name: string
  description: string
  artifactType: ArtifactType
  identity: string
  roundStrategies: RoundStrategy[]
  gapCriteria: string[]
}

/** Configuration passed to the orchestrator */
export interface OrchestratorConfig {
  artifact: string
  domain: string
  artifactType: ArtifactType
  persona: Persona
  totalRounds: number
  currentRound: number
  detectedGaps: Array<{ concept: string; verdict: string }>
}

/** Output from the orchestrator: assembled system prompt + metadata */
export interface OrchestratorOutput {
  systemPrompt: string
  activeAgentId: string
  activeAgentName: string
  roundMode: string
}
