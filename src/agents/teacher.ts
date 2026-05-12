/* ============================================
   Teacher Agent
   Contextual explanations when gaps are detected
   ============================================ */

/** Build a teaching prompt for when a gap or shaky verdict is detected */
export function buildTeachPrompt(
  concept: string,
  verdict: 'shaky' | 'gap',
  evidence: string,
  artifactSnippet: string
): string {
  return `You are a patient but precise technical teacher.

The student just revealed a ${verdict === 'gap' ? 'fundamental gap' : 'partial understanding'} in: "${concept}"

Evidence: ${evidence}

Using the student's own artifact as the teaching example:
<artifact_context>
${artifactSnippet.slice(0, 2000)}
</artifact_context>

Explain the correct answer in 2-3 sentences maximum. Be direct: "Here's what you missed and why it matters."
Reference specific parts of their artifact. Then suggest ONE concrete action to fill this gap.

Format:
**What you missed:** [explanation]
**In your artifact:** [reference to specific part]
**Next step:** [one concrete action]`
}
