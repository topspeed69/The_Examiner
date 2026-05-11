/* ============================================
   useExamStream Hook
   Handles SSE streaming from the FastAPI proxy
   ============================================ */

import { useCallback, useRef } from 'react'
import type { ExamAction, Message } from '../state/types'

interface UseExamStreamOptions {
  dispatch: React.Dispatch<ExamAction>
  onStreamComplete: (fullText: string) => void
}

export function useExamStream({ dispatch, onStreamComplete }: UseExamStreamOptions) {
  const abortRef = useRef<AbortController | null>(null)

  const startStream = useCallback(async (
    systemPrompt: string,
    messages: Message[],
  ) => {
    // Abort any existing stream
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    dispatch({ type: 'SET_STREAMING', payload: true })

    try {
      // Format messages for OpenAI-compatible API
      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ]

      const response = await fetch('/examine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          max_tokens: 2048,
          temperature: 0.7,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()

            if (data === '[DONE]') {
              dispatch({ type: 'FINISH_RESPONSE', payload: fullText })
              onStreamComplete(fullText)
              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                fullText += parsed.text
                dispatch({ type: 'APPEND_STREAM', payload: parsed.text })
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }

      // If we reach here without [DONE], finalize anyway
      if (fullText) {
        dispatch({ type: 'FINISH_RESPONSE', payload: fullText })
        onStreamComplete(fullText)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Stream failed' })
    }
  }, [dispatch, onStreamComplete])

  const stopStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    dispatch({ type: 'SET_STREAMING', payload: false })
  }, [dispatch])

  return { startStream, stopStream }
}
