/* ============================================
   Gap Analyst Agent
   Synthesizes per-round evaluations into final gap map
   ============================================ */

import type { GapEval } from '../state/types'

/** Build the final gap map synthesis prompt */
export function buildGapMapPrompt(
  detectedGaps: GapEval[],
  concepts: string[],
  artifactSummary: string
): string {
  const gapSummary = detectedGaps.map((g, i) => 
    `Round ${i + 1}: concept="${g.concept}", verdict="${g.verdict}", evidence="${g.evidence}"`
  ).join('\n')

  const untestedConcepts = concepts.filter(
    c => !detectedGaps.some(g => g.concept.toLowerCase().includes(c.toLowerCase()))
  )

  return `You are an assessment specialist producing a final gap analysis.

The examination is complete. Here are the results from each round:

${gapSummary}

Artifact summary: ${artifactSummary}
Key concepts in the artifact: ${concepts.join(', ')}
${untestedConcepts.length > 0 ? `Untested concepts: ${untestedConcepts.join(', ')}` : ''}

Produce a final gap map as JSON. Be honest — do not soften verdicts.
A "solid" means they could teach this concept. A "gap" means they'd fail a whiteboard question on it.

Return ONLY valid JSON in this exact format:
{
  "summary": "2-sentence overall assessment of the candidate's understanding",
  "concepts": [
    {
      "name": "concept name",
      "verdict": "solid" | "shaky" | "gap",
      "explanation": "1-2 sentence explanation of their understanding level",
      "next_action": "specific actionable recommendation — e.g., 'Read Chapter 5 of DDIA on partitioning', 'Implement a retry mechanism with exponential backoff', 'Review the CAP theorem trade-offs in your design'"
    }
  ],
  "strongest_area": "the concept/area where they showed deepest understanding",
  "critical_gap": "the most important gap that needs immediate attention"
}

Rules:
- Include ALL tested concepts from the examination rounds
- Include untested concepts with verdict "untested" if any exist
- next_action must be CONCRETE — not "study more" or "read about X"
- strongest_area and critical_gap should be specific concept names
- Be rigorous. This gap map is the primary output of the tool.`
}
