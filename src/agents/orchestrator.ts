/* ============================================
   Orchestrator — Agent Routing & Prompt Assembly
   Selects the right specialist agent per round
   and assembles the complete system prompt.
   ============================================ */

import type { OrchestratorConfig, OrchestratorOutput, ExaminerAgent } from './types'
import type { Persona } from '../state/types'
import { codeExaminer } from './codeExaminer'
import { paperExaminer } from './paperExaminer'
import { designExaminer } from './designExaminer'
import { genericExaminer } from './genericExaminer'

/** Map artefact type → specialist agent */
const agentRegistry: Record<string, ExaminerAgent> = {
  code: codeExaminer,
  paper: paperExaminer,
  system_design: designExaminer,
  generic: genericExaminer,
}

/** Persona modifiers that adjust agent tone */
const personaModifiers: Record<Persona, string> = {
  interviewer: `Adopt the tone of a senior technical interviewer at a top tech company.
Be professional, structured, and fair. Give the candidate space to think.
If they ask for clarification, provide it briefly.`,

  professor: `Adopt the tone of a demanding but caring university professor.
You want them to truly understand, not just memorize. Use Socratic questioning.
If they struggle, guide them toward the answer with follow-up questions rather than giving it away.`,

  adversarial: `Adopt the tone of an adversarial tech lead who is skeptical of everything.
Challenge every answer. Play devil's advocate. Push back even on correct answers to see if they can defend their position.
Be intense but not cruel. Respect good answers with brief acknowledgment before pushing harder.`,
}

/** Select the correct round strategy based on round index and total rounds */
function selectRoundStrategy(agent: ExaminerAgent, currentRound: number, totalRounds: number) {
  const strategies = agent.roundStrategies
  const numStrategies = strategies.length

  // Map current round to strategy index based on ratio
  // Round 1 → strategy 0, last round → last strategy
  const ratio = (currentRound - 1) / Math.max(totalRounds - 1, 1)
  const strategyIndex = Math.min(
    Math.floor(ratio * numStrategies),
    numStrategies - 1
  )

  return strategies[strategyIndex]
}

/** Assemble the complete system prompt for a given round */
export function orchestrate(config: OrchestratorConfig): OrchestratorOutput {
  const agent = agentRegistry[config.artefactType] || genericExaminer
  const strategy = selectRoundStrategy(agent, config.currentRound, config.totalRounds)
  const persona = personaModifiers[config.persona]

  // Build gap context
  const gapContext = config.detectedGaps.length > 0
    ? `\nGaps detected so far:\n${config.detectedGaps.map(g => `- ${g.concept}: ${g.verdict}`).join('\n')}`
    : '\nNo gaps detected yet.'

  const systemPrompt = `${agent.identity}

${persona}

---

The artefact under examination is:

<artefact>
${config.artefact.slice(0, 6000)}
</artefact>

Domain: ${config.domain || 'Infer from artefact'}
Round: ${config.currentRound} of ${config.totalRounds}
Mode: ${strategy.mode}
${gapContext}

---

ROUND INSTRUCTION:
${strategy.instruction}

---

IMPORTANT — GAP EVALUATION:
After the user answers, you MUST output a structured evaluation inside <gap_eval> tags.
The evaluation must be valid JSON in this exact format:

<gap_eval>
{
  "concept": "name of the specific concept you tested",
  "verdict": "solid" | "shaky" | "gap",
  "evidence": "one sentence explaining what their answer revealed about their understanding",
  "teach": "if verdict is shaky or gap: 2-3 sentence explanation of the correct answer, referencing the artefact. if solid: null"
}
</gap_eval>

Rules for verdicts:
- "solid" = they could teach this concept to someone else
- "shaky" = partial understanding, missing key nuances
- "gap" = fundamental misunderstanding or complete inability to answer

After the <gap_eval> block, continue the conversation naturally:
- If solid: acknowledge briefly, then move to the next question or go deeper
- If shaky: point out what they missed, teach briefly, then continue
- If gap: explain the correct answer clearly, then continue

Remember: Ask ONE question at a time. Be specific. Reference the artefact directly.
Do NOT answer your own question before the user responds.`

  return {
    systemPrompt,
    activeAgentId: agent.id,
    activeAgentName: agent.name,
    roundMode: strategy.mode,
  }
}

/** Build the initial examination prompt (first question) */
export function buildFirstQuestionPrompt(): string {
  return `Begin the examination. Ask your first question based on the round instruction and the artefact provided. Remember: ask ONE specific question only.`
}
