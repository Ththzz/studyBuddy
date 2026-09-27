import { supabase } from './supabaseClient'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ALLOWED_OPTION_KEYS = new Set(['A', 'B', 'C', 'D'])
const ALLOWED_ANSWER_COUNTS = new Set([5, 10, 20])

/** Create an idempotency key for one quiz session. It is not an auth secret. */
export function createQuizAttemptId() {
  const cryptoApi = globalThis.crypto
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID()

  const bytes = new Uint8Array(16)
  if (typeof cryptoApi?.getRandomValues === 'function') {
    cryptoApi.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function requireUserId(userId) {
  if (typeof userId !== 'string' || !UUID_PATTERN.test(userId.trim())) {
    throw new Error('A signed-in user is required to save quiz results.')
  }

  return userId.trim()
}

function requireTimestamp(value, label) {
  if (typeof value !== 'string') {
    throw new Error(`${label} must be a valid timestamp.`)
  }

  const timestamp = new Date(value)
  if (Number.isNaN(timestamp.getTime())) {
    throw new Error(`${label} must be a valid timestamp.`)
  }

  return timestamp.toISOString()
}

async function requireCurrentUser(userId) {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error

  if (!data.user || data.user.id !== userId) {
    throw new Error('The signed-in account changed before this quiz result could be saved.')
  }
}

function normalizeAnswers(answers) {
  if (!Array.isArray(answers) || !ALLOWED_ANSWER_COUNTS.has(answers.length)) {
    throw new Error('Quiz answers must include every question in the saved set.')
  }

  const seenQuestionIds = new Set()
  return answers.map((answer, index) => {
    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
      throw new Error(`Quiz answer ${index + 1} is invalid.`)
    }

    const questionId = typeof answer.questionId === 'string' ? answer.questionId.trim() : ''
    const selectedOptionKey = typeof answer.selectedOptionKey === 'string'
      ? answer.selectedOptionKey.trim().toUpperCase()
      : ''

    if (!UUID_PATTERN.test(questionId)) {
      throw new Error(`Quiz answer ${index + 1} is missing its saved question ID.`)
    }
    if (!ALLOWED_OPTION_KEYS.has(selectedOptionKey)) {
      throw new Error(`Quiz answer ${index + 1} must use an A-D option key.`)
    }
    if (seenQuestionIds.has(questionId)) {
      throw new Error('Quiz answers cannot contain a question more than once.')
    }

    seenQuestionIds.add(questionId)
    return {
      question_id: questionId,
      selected_option_key: selectedOptionKey,
      answered_at: requireTimestamp(answer.answeredAt, `Quiz answer ${index + 1} time`),
    }
  })
}

/** Save a finished multiple-choice attempt and its answers in one database RPC. */
export async function saveQuizAttemptForUser(userId, {
  attemptId,
  studySetId,
  startedAt,
  completedAt,
  answers,
} = {}) {
  const safeUserId = requireUserId(userId)
  const safeAttemptId = typeof attemptId === 'string' ? attemptId.trim() : ''
  if (!UUID_PATTERN.test(safeAttemptId)) {
    throw new Error('The quiz attempt ID is missing or invalid.')
  }

  const safeStudySetId = typeof studySetId === 'string' ? studySetId.trim() : ''
  if (!UUID_PATTERN.test(safeStudySetId)) {
    throw new Error('The saved quiz set ID is missing or invalid.')
  }

  const safeStartedAt = requireTimestamp(startedAt, 'Quiz start time')
  const safeCompletedAt = requireTimestamp(completedAt, 'Quiz completion time')
  if (new Date(safeCompletedAt).getTime() < new Date(safeStartedAt).getTime()) {
    throw new Error('Quiz completion time cannot be before its start time.')
  }

  const safeAnswers = normalizeAnswers(answers)
  await requireCurrentUser(safeUserId)

  const { data, error } = await supabase.rpc('save_quiz_attempt', {
    p_attempt_id: safeAttemptId,
    p_user_id: safeUserId,
    p_study_set_id: safeStudySetId,
    p_started_at: safeStartedAt,
    p_completed_at: safeCompletedAt,
    p_answers: safeAnswers,
  })

  if (error) throw error
  if (typeof data !== 'string' || !UUID_PATTERN.test(data)) {
    throw new Error('The quiz result could not be confirmed as saved.')
  }

  return data
}
