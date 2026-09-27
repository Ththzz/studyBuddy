import { supabase } from './supabaseClient'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const QA_ATTEMPT_COLUMNS = 'id,user_id,question_id,answer_text,score,feedback,answered_at'

function requireUuid(value, label) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!UUID_PATTERN.test(normalized)) throw new Error(`${label} is missing or invalid.`)
  return normalized
}

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must not be empty.`)
  return value.trim()
}

function requireTimestamp(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error('The Q&A answer time is invalid.')
  return date.toISOString()
}

async function requireCurrentUser(userId) {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user || data.user.id !== userId) {
    throw new Error('The signed-in account changed before this Q&A attempt could be saved.')
  }
}

function sameAttempt(row, attempt) {
  return row.user_id === attempt.user_id
    && row.question_id === attempt.question_id
    && row.answer_text === attempt.answer_text
    && Number(row.score) === attempt.score
    && row.feedback === attempt.feedback
    && new Date(row.answered_at).getTime() === new Date(attempt.answered_at).getTime()
}

function returnSavedAttempt(row, attempt) {
  if (!sameAttempt(row, attempt)) {
    const error = new Error('This Q&A answer time is already saved with different attempt data.')
    error.code = 'QA_ATTEMPT_CONFLICT'
    throw error
  }

  return {
    id: String(row.id),
    questionId: String(row.question_id),
    answeredAt: row.answered_at,
  }
}

function normalizeAttempt(userId, { questionId, answerText, score, feedback, answeredAt = new Date().toISOString() } = {}) {
  const attempt = {
    user_id: requireUuid(userId, 'A signed-in user'),
    question_id: requireUuid(questionId, 'The saved Q&A question ID'),
    answer_text: requireText(answerText, 'The Q&A answer'),
    score: typeof score === 'number' ? score : Number.NaN,
    feedback: requireText(feedback, 'Q&A feedback'),
    answered_at: requireTimestamp(answeredAt),
  }
  if (!Number.isFinite(attempt.score) || attempt.score < 0 || attempt.score > 100) {
    throw new Error('The Q&A score must be between 0 and 100.')
  }
  return attempt
}

function attemptKey(attempt) {
  return `${attempt.question_id}:${new Date(attempt.answered_at).getTime()}`
}

async function findExistingAttempt(attempt) {
  const { data, error } = await supabase
    .from('qa_attempts')
    .select(QA_ATTEMPT_COLUMNS)
    .eq('user_id', attempt.user_id)
    .eq('question_id', attempt.question_id)
    .eq('answered_at', attempt.answered_at)
    .maybeSingle()

  if (error) throw error
  return data
}

/** Save one generated Q&A answer, safely recognizing retries of the same check. */
export async function saveQaAttemptForUser(userId, {
  questionId,
  answerText,
  score,
  feedback,
  answeredAt = new Date().toISOString(),
} = {}) {
  const attempt = normalizeAttempt(userId, { questionId, answerText, score, feedback, answeredAt })

  await requireCurrentUser(attempt.user_id)
  const { data, error } = await supabase
    .from('qa_attempts')
    .upsert(attempt, {
      onConflict: 'user_id,question_id,answered_at',
      ignoreDuplicates: true,
    })
    .select(QA_ATTEMPT_COLUMNS)
    .maybeSingle()

  if (error) {
    // A response can be lost after the insert commits. Confirm by the unique
    // identity so a retry remains safe without weakening conflict checks.
    try {
      const savedAfterError = await findExistingAttempt(attempt)
      if (savedAfterError) {
        const saved = returnSavedAttempt(savedAfterError, attempt)
        await requireCurrentUser(attempt.user_id)
        return saved
      }
    } catch (confirmationError) {
      if (confirmationError?.code === 'QA_ATTEMPT_CONFLICT') throw confirmationError
    }

    throw error
  }

  // `ignoreDuplicates` returns no row when another request already inserted
  // this identity. Read it back and reject if its payload differs.
  const savedRow = data || await findExistingAttempt(attempt)
  if (!savedRow) throw new Error('The Q&A attempt could not be confirmed as saved.')

  const saved = returnSavedAttempt(savedRow, attempt)
  await requireCurrentUser(attempt.user_id)
  return saved
}

/** Save several generated Q&A answers in one request when a set is saved. */
export async function saveQaAttemptsForUser(userId, values = []) {
  const safeUserId = requireUuid(userId, 'A signed-in user')
  if (!Array.isArray(values)) throw new Error('Q&A attempts must be a list.')
  if (!values.length) return []
  const attempts = values.map((value) => normalizeAttempt(safeUserId, value))
  if (new Set(attempts.map(attemptKey)).size !== attempts.length) {
    throw new Error('This Q&A contains duplicate answer records.')
  }

  await requireCurrentUser(safeUserId)
  const { data, error } = await supabase
    .from('qa_attempts')
    .upsert(attempts, {
      onConflict: 'user_id,question_id,answered_at',
      ignoreDuplicates: true,
    })
    .select(QA_ATTEMPT_COLUMNS)

  let rows = data || []
  if (error || rows.length !== attempts.length) {
    const { data: existingRows, error: lookupError } = await supabase
      .from('qa_attempts')
      .select(QA_ATTEMPT_COLUMNS)
      .eq('user_id', safeUserId)
      .in('question_id', [...new Set(attempts.map((attempt) => attempt.question_id))])
      .in('answered_at', [...new Set(attempts.map((attempt) => attempt.answered_at))])
    if (lookupError) throw error || lookupError
    rows = existingRows || []
  }

  const rowsByKey = new Map(rows.map((row) => [attemptKey(row), row]))
  const saved = attempts.map((attempt) => {
    const row = rowsByKey.get(attemptKey(attempt))
    if (!row) throw error || new Error('A Q&A attempt could not be confirmed as saved.')
    return returnSavedAttempt(row, attempt)
  })
  await requireCurrentUser(safeUserId)
  return saved
}

export async function loadQaAttemptsForUser(userId, questionIds) {
  const safeUserId = requireUuid(userId, 'A signed-in user')
  if (!Array.isArray(questionIds) || questionIds.length === 0) return []
  await requireCurrentUser(safeUserId)
  const { data, error } = await supabase
    .from('qa_attempts')
    .select(QA_ATTEMPT_COLUMNS)
    .eq('user_id', safeUserId)
    .in('question_id', questionIds)
    .order('answered_at', { ascending: false })
  if (error) throw error
  return data || []
}
