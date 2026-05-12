/* ============================================
   useExamStream Hook
   Handles SSE streaming from the FastAPI proxy
   ============================================ */

import { useCallback, useRef } from 'react'
import type { ExamAction, Message } from '../state/types'
import { chatStream } from '../lib/llm'

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
      // Format messages for LLM utility
      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ]

      let fullText = ''
      
      const stream = chatStream({
        messages: apiMessages,
        max_tokens: 2048,
        temperature: 0.7,
        signal: controller.signal
      })

      for await (const chunk of stream) {
        fullText += chunk
        dispatch({ type: 'APPEND_STREAM', payload: chunk })
      }

      dispatch({ type: 'FINISH_RESPONSE', payload: fullText })
      onStreamComplete(fullText)

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Stream error:', err)
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
