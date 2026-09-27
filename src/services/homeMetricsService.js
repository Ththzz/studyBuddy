import { supabase } from './supabaseClient'

const QUIZ_ATTEMPT_PAGE_SIZE = 500

function requireUserId(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('A signed-in user is required to load home metrics.')
  }

  return userId.trim()
}

async function requireCurrentUser(userId) {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user || data.user.id !== userId) {
    throw new Error('The signed-in account changed before home metrics could be loaded.')
  }
}

function safeSeconds(value) {
  const seconds = Number(value)
  return Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
}

function localDateKey(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatDuration(totalSeconds) {
  const seconds = safeSeconds(totalSeconds)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  if (minutes > 0) return `${minutes} min`
  return seconds > 0 ? `${seconds}s` : '0 min'
}

function getTodayKey() {
  return localDateKey(new Date())
}

export function buildHomeStudyMetrics(sessions, dailyTargetMinutes) {
  const targetSeconds = Math.max(60, Math.floor(Number(dailyTargetMinutes) * 60) || 60)
  const totalsByDay = new Map()
  const todayBySubject = new Map()
  const todayKey = getTodayKey()

  ;(Array.isArray(sessions) ? sessions : []).forEach((session) => {
    const dateKey = localDateKey(session?.completedAt)
    const seconds = safeSeconds(session?.durationSeconds)
    if (!dateKey || seconds <= 0) return

    totalsByDay.set(dateKey, (totalsByDay.get(dateKey) || 0) + seconds)
    if (dateKey !== todayKey) return

    const subjectName = typeof session?.subjectName === 'string' && session.subjectName.trim()
      ? session.subjectName.trim()
      : 'General Study'
    const current = todayBySubject.get(subjectName) || { seconds: 0, sessions: 0 }
    todayBySubject.set(subjectName, {
      seconds: current.seconds + seconds,
      sessions: current.sessions + 1,
    })
  })

  let streakDays = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  // A streak remains visible during an unfinished day. At the next local
  // midnight, the previous day becomes the first day checked and a missed
  // goal correctly resets the streak.
  const currentDayKey = localDateKey(cursor)
  if ((totalsByDay.get(currentDayKey) || 0) < targetSeconds) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (true) {
    const key = localDateKey(cursor)
    if (!key || (totalsByDay.get(key) || 0) < targetSeconds) break
    streakDays += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  const todaySubjects = Array.from(todayBySubject.entries())
    .map(([name, value]) => ({
      name,
      seconds: value.seconds,
      sessionCount: value.sessions,
      timeLabel: formatDuration(value.seconds),
      subtitle: value.sessions === 1 ? '1 study session' : `${value.sessions} study sessions`,
      progressPercent: Math.min(100, Math.round((value.seconds / targetSeconds) * 100)),
    }))
    .sort((left, right) => right.seconds - left.seconds || left.name.localeCompare(right.name))

  return { streakDays, todaySubjects }
}

export async function loadQuizAverageForUser(userId) {
  const safeUserId = requireUserId(userId)
  await requireCurrentUser(safeUserId)

  let offset = 0
  let scoreTotal = 0
  let scoreCount = 0

  while (true) {
    const { data, error, count } = await supabase
      .from('quiz_attempts')
      .select('score', { count: 'exact' })
      .eq('user_id', safeUserId)
      .order('completed_at', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + QUIZ_ATTEMPT_PAGE_SIZE - 1)

    if (error) throw error
    if (!Number.isInteger(count) || count < 0) {
      throw new Error('The total number of quiz attempts could not be confirmed.')
    }

    const page = data || []
    page.forEach((attempt) => {
      const score = Number(attempt.score)
      if (Number.isFinite(score)) {
        scoreTotal += score
        scoreCount += 1
      }
    })

    offset += page.length
    if (offset >= count) break
    if (page.length === 0) throw new Error('Quiz attempts could not be fully loaded. Please try again.')
  }

  await requireCurrentUser(safeUserId)
  return scoreCount > 0 ? Math.round(scoreTotal / scoreCount) : null
}
