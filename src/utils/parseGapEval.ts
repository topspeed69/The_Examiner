/* ============================================
   Gap Eval Parser
   Extracts <gap_eval> JSON blocks from streamed text
   ============================================ */

import type { GapEval } from '../state/types'

/** Extract a GapEval from text containing <gap_eval> tags */
export function extractGapEval(text: string): GapEval | null {
  const match = text.match(/<gap_eval>([\s\S]*?)<\/gap_eval>/)
  if (!match) return null

  try {
    const parsed = JSON.parse(match[1].trim())

    // Validate required fields
    if (!parsed.concept || !parsed.verdict || !parsed.evidence) return null

    // Validate verdict value
    if (!['solid', 'shaky', 'gap'].includes(parsed.verdict)) return null

    return {
      concept: parsed.concept,
      verdict: parsed.verdict,
      evidence: parsed.evidence,
      teach: parsed.teach || null,
    }
  } catch {
    return null
  }
}

/** Strip <gap_eval> blocks from text for display */
export function stripGapEvalTags(text: string): string {
  return text.replace(/<gap_eval>[\s\S]*?<\/gap_eval>/g, '').trim()
}

/** Check if text contains a complete <gap_eval> block */
export function hasCompleteGapEval(text: string): boolean {
  return /<gap_eval>[\s\S]*?<\/gap_eval>/.test(text)
}
