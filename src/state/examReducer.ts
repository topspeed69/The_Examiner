import type { ExamState, ExamAction } from './types'

export const initialState: ExamState = {
  phase: 'IDLE',
  artefact: '',
  domain: '',
  classification: null,
  rounds: 5,
  persona: 'interviewer',
  activeAgent: '',
  currentRound: 0,
  messages: [],
  detectedGaps: [],
  streamBuffer: '',
  isStreaming: false,
  gapMap: null,
  error: null,
}

export function examReducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case 'SET_ARTEFACT':
      return { ...state, artefact: action.payload }

    case 'SET_DOMAIN':
      return { ...state, domain: action.payload }

    case 'SET_ROUNDS':
      return { ...state, rounds: action.payload }

    case 'SET_PERSONA':
      return { ...state, persona: action.payload }

    case 'START_CLASSIFY':
      return { ...state, phase: 'CLASSIFYING', error: null }

    case 'SET_CLASSIFICATION':
      return { ...state, classification: action.payload, phase: 'IDLE' }

    case 'BEGIN_EXAM':
      return {
        ...state,
        phase: 'EXAMINING',
        currentRound: 1,
        messages: [],
        detectedGaps: [],
        streamBuffer: '',
        gapMap: null,
        error: null,
      }

    case 'SET_ACTIVE_AGENT':
      return { ...state, activeAgent: action.payload }

    case 'APPEND_STREAM':
      return { ...state, streamBuffer: state.streamBuffer + action.payload }

    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload }

    case 'FINISH_RESPONSE':
      return {
        ...state,
        messages: [
          ...state.messages,
          { role: 'assistant', content: action.payload },
        ],
        streamBuffer: '',
        isStreaming: false,
      }

    case 'SUBMIT_ANSWER':
      return {
        ...state,
        messages: [
          ...state.messages,
          { role: 'user', content: action.payload },
        ],
      }

    case 'ADD_GAP':
      return {
        ...state,
        detectedGaps: [...state.detectedGaps, action.payload],
      }

    case 'ENTER_TEACHING':
      return { ...state, phase: 'TEACHING' }

    case 'EXIT_TEACHING':
      return { ...state, phase: 'EXAMINING' }

    case 'NEXT_ROUND':
      return { ...state, currentRound: state.currentRound + 1, streamBuffer: '' }

    case 'FINISH_EXAM':
      return { ...state, phase: 'GAP_MAP', isStreaming: false }

    case 'SET_GAP_MAP':
      return { ...state, gapMap: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isStreaming: false }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}
