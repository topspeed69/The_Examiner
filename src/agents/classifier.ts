/* ============================================
   Artefact Classifier Agent
   Analyzes pasted artefact and returns metadata
   ============================================ */

import type { Classification } from '../state/types'

/** Build the classification prompt for the LLM */
export function buildClassifierPrompt(artefact: string, domainHint: string): string {
  return `You are an artefact classifier. Analyze the following artefact and return a JSON classification.

The artefact is:
<artefact>
${artefact.slice(0, 6000)}
</artefact>

${domainHint ? `Domain hint from user: "${domainHint}"` : 'No domain hint provided — infer from content.'}

Return ONLY valid JSON in this exact format, nothing else:
{
  "type": "code" | "paper" | "system_design" | "generic",
  "language": "python/typescript/java/etc or null",
  "framework": "fastapi/react/pytorch/etc or null",
  "field": "ML/distributed-systems/web-dev/etc or null",
  "concepts": ["concept1", "concept2", "concept3", "concept4", "concept5"],
  "complexity": "beginner" | "intermediate" | "advanced",
  "summary": "one-line summary of what this artefact is"
}

Rules:
- "type" must be exactly one of: "code", "paper", "system_design", "generic"
- "concepts" should list 5-8 key technical concepts present in the artefact
- Be specific with concepts — "dependency injection" not just "design patterns"
- "complexity" is about the sophistication of the artefact itself, not the topic`
}

/** Parse the classifier response into a Classification object */
export function parseClassification(response: string): Classification | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (!parsed.type || !parsed.concepts || !parsed.summary) return null

    return {
      type: parsed.type,
      language: parsed.language || undefined,
      framework: parsed.framework || undefined,
      field: parsed.field || undefined,
      concepts: Array.isArray(parsed.concepts) ? parsed.concepts : [],
      complexity: parsed.complexity || 'intermediate',
      summary: parsed.summary,
    }
  } catch {
    return null
  }
}
