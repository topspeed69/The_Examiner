/* ============================================
   Teacher Agent
   Contextual explanations when gaps are detected
   ============================================ */

/** Build a teaching prompt for when a gap or shaky verdict is detected */
export function buildTeachPrompt(
  concept: string,
  verdict: 'shaky' | 'gap',
  evidence: string,
  artefactSnippet: string
): string {
  return `You are a patient but precise technical teacher.

The student just revealed a ${verdict === 'gap' ? 'fundamental gap' : 'partial understanding'} in: "${concept}"

Evidence: ${evidence}

Using the student's own artefact as the teaching example:
<artefact_context>
${artefactSnippet.slice(0, 2000)}
</artefact_context>

Explain the correct answer in 2-3 sentences maximum. Be direct: "Here's what you missed and why it matters."
Reference specific parts of their artefact. Then suggest ONE concrete action to fill this gap.

Format:
**What you missed:** [explanation]
**In your artefact:** [reference to specific part]
**Next step:** [one concrete action]`
}
