/* ============================================
   LLM Client Utility
   Calls Vercel API routes to keep API keys secure.
   ============================================ */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMOptions {
  messages: LLMMessage[]
  model?: string
  max_tokens?: number
  temperature?: number
  signal?: AbortSignal
}

/**
 * Non-streaming chat completion via /api/classify
 */
export async function chatComplete({
  messages,
  model,
  max_tokens = 1024,
  temperature = 0.3,
  signal
}: LLMOptions) {
  const response = await fetch('/api/classify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature
    }),
    signal
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.content as string
}

/**
 * Streaming chat completion via /api/examine
 */
export async function* chatStream({
  messages,
  model,
  max_tokens = 2048,
  temperature = 0.7,
  signal
}: LLMOptions) {
  const response = await fetch('/api/examine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature
    }),
    signal
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        
        const data = trimmed.slice(6)
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          // The proxy might return the same structure as NIM or a simplified one
          // Our api/examine.ts forwards the raw body, so it matches NIM structure
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            yield content
          }
        } catch (e) {
          // Sometimes chunks are split mid-JSON, this is handled by TextDecoder in standard SSE
          // but our simplified parser might skip it.
          console.warn('Failed to parse SSE chunk', e)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
