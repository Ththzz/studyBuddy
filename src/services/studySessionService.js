import AsyncStorage from '@react-native-async-storage/async-storage'
import { withStudySessionStorageLock } from '../storage/studySessionStorage'
import { supabase } from './supabaseClient'

const STUDY_SESSION_COLUMNS = 'id, subject_name, timer_mode, duration_seconds, completed, completed_at'
const STUDY_SESSIONS_PAGE_SIZE = 500
const LEGACY_STUDY_SESSIONS_KEY = '@studybuddy/study-sessions'
const LEGACY_MIGRATION_OWNER_KEY = '@studybuddy/study-sessions-migration-owner'
const LEGACY_MIGRATION_DEVICE_ID_KEY = '@studybuddy/study-sessions-migration-device-id'

function requireUserId(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('A signed-in user is required to access study sessions.')
  }

  return userId
}

async function requireCurrentUser(userId) {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error

  if (!data.user || data.user.id !== userId) {
    throw new Error('The signed-in account changed before these study sessions could be accessed.')
  }
}

function toAppStudySession(row) {
  return {
    id: String(row.id),
    subjectName: row.subject_name,
    durationSeconds: Number(row.duration_seconds),
    completed: row.completed === true,
    timerMode: row.timer_mode,
    completedAt: row.completed_at,
  }
}

function quotePostgrestFilterValue(value) {
  const escapedValue = String(value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')

  return `"${escapedValue}"`
}

function createStudySessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const randomValue = Math.floor(Math.random() * 16)
    const value = character === 'x' ? randomValue : ((randomValue & 0x3) | 0x8)
    return value.toString(16)
  })
}

export function createStudySessionDraft(session) {
  return {
    ...session,
    id: createStudySessionId(),
  }
}

function normalizeLegacyStudySessions(storedValue) {
  let sessions
  try {
    sessions = JSON.parse(storedValue)
  } catch {
    throw new Error('The study history stored on this device is unreadable and was kept in place.')
  }

  if (!Array.isArray(sessions)) {
    throw new Error('The study history stored on this device is invalid and was kept in place.')
  }

  const legacyIdOccurrences = new Map()

  return sessions.map((session, index) => {
    const subjectName = typeof session?.subjectName === 'string'
      ? session.subjectName.trim()
      : ''
    const sourceId = typeof session?.id === 'string' || typeof session?.id === 'number'
      ? String(session.id).trim()
      : ''
    const baseLegacyId = sourceId ? `stored:${sourceId}` : `index:${index}`
    const occurrence = legacyIdOccurrences.get(baseLegacyId) || 0
    const legacyId = occurrence === 0 ? baseLegacyId : `${baseLegacyId}#${occurrence}`
    const durationSeconds = Number(session?.durationSeconds)
    const completedAt = new Date(session?.completedAt)

    legacyIdOccurrences.set(baseLegacyId, occurrence + 1)

    if (!subjectName || subjectName.length > 60) {
      throw new Error('A saved study session has an invalid subject name; the local history was kept.')
    }
    if (legacyId.length > 256) {
      throw new Error('A saved study session has an invalid ID; the local history was kept.')
    }
    if (!Number.isInteger(durationSeconds) || durationSeconds < 0) {
      throw new Error('A saved study session has an invalid duration; the local history was kept.')
    }
    if (session?.timerMode !== 'countdown' && session?.timerMode !== 'stopwatch') {
      throw new Error('A saved study session has an invalid timer mode; the local history was kept.')
    }
    if (typeof session?.completed !== 'boolean') {
      throw new Error('A saved study session has an invalid completion state; the local history was kept.')
    }
    if (typeof session.completedAt !== 'string' || Number.isNaN(completedAt.getTime())) {
      throw new Error('A saved study session has an invalid completion time; the local history was kept.')
    }

    return {
      legacyId,
      subjectName,
      durationSeconds,
      completed: session.completed,
      timerMode: session.timerMode,
      completedAt: completedAt.toISOString(),
    }
  })
}

async function getLegacyMigrationDeviceId() {
  const storedId = await AsyncStorage.getItem(LEGACY_MIGRATION_DEVICE_ID_KEY)
  const hasValidUuid = typeof storedId === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(storedId)

  if (hasValidUuid) return storedId

  const newId = createStudySessionId()
  await AsyncStorage.setItem(LEGACY_MIGRATION_DEVICE_ID_KEY, newId)
  return newId
}

async function importLegacyStudySessionsWhileLocked(safeUserId) {
  const storedValue = await AsyncStorage.getItem(LEGACY_STUDY_SESSIONS_KEY)
  if (storedValue === null) {
    return { importedCount: 0, skippedForDifferentAccount: false }
  }

  const reservedOwner = await AsyncStorage.getItem(LEGACY_MIGRATION_OWNER_KEY)
  if (reservedOwner && reservedOwner !== safeUserId) {
    return { importedCount: 0, skippedForDifferentAccount: true }
  }

  const legacySessions = normalizeLegacyStudySessions(storedValue)
  const migrationId = await getLegacyMigrationDeviceId()

  if (!reservedOwner) {
    await AsyncStorage.setItem(LEGACY_MIGRATION_OWNER_KEY, safeUserId)
  }

  await requireCurrentUser(safeUserId)

  const { data, error } = await supabase.rpc('import_legacy_study_sessions', {
    p_user_id: safeUserId,
    p_migration_id: migrationId,
    p_sessions: legacySessions,
  })

  if (error) throw error

  const importedCount = Number(data)
  if (!Number.isInteger(importedCount) || importedCount < 0) {
    throw new Error('The study history import could not be confirmed. Please try again.')
  }

  // A zero count can mean the server already has a receipt for this payload;
  // keep the local copy unless this request confirms rows were imported.
  // All readers and writers share the lock, so a concurrent save runs after
  // removal and writes its newer snapshot back.
  if (
    importedCount > 0
    && await AsyncStorage.getItem(LEGACY_STUDY_SESSIONS_KEY) === storedValue
  ) {
    await AsyncStorage.removeItem(LEGACY_STUDY_SESSIONS_KEY)
  }

  return { importedCount, skippedForDifferentAccount: false }
}

export function importLegacyStudySessionsForUser(userId) {
  const safeUserId = requireUserId(userId)
  return withStudySessionStorageLock(() => importLegacyStudySessionsWhileLocked(safeUserId))
}

export async function loadStudySessionsForUser(userId) {
  const safeUserId = requireUserId(userId)
  await requireCurrentUser(safeUserId)

  const rows = []
  const seenSessionIds = new Set()
  let cursor = null

  while (true) {
    let query = supabase
      .from('study_sessions')
      .select(STUDY_SESSION_COLUMNS)
      .eq('user_id', safeUserId)
      .order('completed_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(STUDY_SESSIONS_PAGE_SIZE)

    if (cursor) {
      // Preserve the database timestamp string so cursor comparisons retain
      // PostgreSQL precision, including fractional seconds beyond milliseconds.
      const quotedCompletedAt = quotePostgrestFilterValue(cursor.completedAt)
      query = query.or(
        `completed_at.lt.${quotedCompletedAt},and(completed_at.eq.${quotedCompletedAt},id.lt.${cursor.id})`,
      )
    }

    const { data, error } = await query

    if (error) throw error

    const page = data || []
    if (page.length === 0) break

    for (const row of page) {
      const sessionId = String(row.id)
      if (!seenSessionIds.has(sessionId)) {
        rows.push(row)
        seenSessionIds.add(sessionId)
      }
    }

    if (page.length < STUDY_SESSIONS_PAGE_SIZE) break

    const lastRow = page[page.length - 1]
    if (typeof lastRow.completed_at !== 'string' || !lastRow.completed_at || !lastRow.id) {
      throw new Error('A study session is missing the fields required to continue loading history.')
    }

    cursor = {
      completedAt: lastRow.completed_at,
      id: String(lastRow.id),
    }
  }

  return rows.map(toAppStudySession)
}

export async function saveStudySessionForUser(userId, session) {
  const safeUserId = requireUserId(userId)
  if (!session || typeof session !== 'object' || Array.isArray(session)) {
    throw new Error('Study session data is invalid.')
  }

  await requireCurrentUser(safeUserId)

  const subjectName = typeof session?.subjectName === 'string'
    ? session.subjectName.trim()
    : ''
  const durationSeconds = Number(session?.durationSeconds)
  const timerMode = session?.timerMode
  const completedAtValue = session.completedAt
  const completedAt = new Date(completedAtValue)

  if (!subjectName || subjectName.length > 60) {
    throw new Error('Study session subject must contain 1 to 60 characters.')
  }
  if (!Number.isInteger(durationSeconds) || durationSeconds < 0) {
    throw new Error('Study session duration must be a non-negative number of seconds.')
  }
  if (timerMode !== 'countdown' && timerMode !== 'stopwatch') {
    throw new Error('Study session timer mode is invalid.')
  }
  if (typeof session.completed !== 'boolean') {
    throw new Error('Study session completion status is invalid.')
  }
  const hasValidUuid = typeof session.id === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(session.id)
  if (!hasValidUuid) {
    throw new Error('Study session ID is invalid.')
  }
  if (typeof completedAtValue !== 'string' || !completedAtValue.trim() || Number.isNaN(completedAt.getTime())) {
    throw new Error('Study session completion time is invalid.')
  }

  const { data, error } = await supabase
    .from('study_sessions')
    .upsert({
      id: session.id,
      user_id: safeUserId,
      subject_id: null,
      subject_name: subjectName,
      timer_mode: timerMode,
      duration_seconds: durationSeconds,
      completed: session.completed,
      completed_at: completedAt.toISOString(),
    }, { onConflict: 'id' })
    .select(STUDY_SESSION_COLUMNS)
    .single()

  if (error) throw error
  return toAppStudySession(data)
}
