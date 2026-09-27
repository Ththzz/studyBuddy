import { supabase } from './supabaseClient'

const DEFAULT_DAILY_TARGET_MINUTES = 120
const DEFAULT_STUDY_DAYS = [0, 1, 2, 3, 4]

function requireUserId(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('A signed-in user is required to save study preferences.')
  }

  return userId
}

function normalizeStudyDays(studyDays) {
  if (!Array.isArray(studyDays)) {
    throw new Error('Study days must be a list.')
  }

  return [...new Set(studyDays.map((day) => Number(day)))].sort((left, right) => left - right)
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
}

function toDatabaseDayOfWeek(mondayFirstDay) {
  // The screens use Monday=0 through Sunday=6; PostgreSQL DOW uses Sunday=0.
  return (mondayFirstDay + 1) % 7
}

function toScreenDayOfWeek(databaseDay) {
  return (Number(databaseDay) + 6) % 7
}

function normalizeSubjects(subjects) {
  if (!Array.isArray(subjects)) {
    throw new Error('Subjects must be a list.')
  }

  const seen = new Set()
  return subjects.reduce((result, subject) => {
    const name = typeof subject === 'string' ? subject.trim() : ''
    if (!name || name.length > 60) {
      throw new Error('Subject names must contain 1 to 60 characters.')
    }

    const key = name.toLocaleLowerCase()
    if (seen.has(key)) {
      throw new Error('Subject names must be unique.')
    }

    seen.add(key)
    result.push(name)
    return result
  }, [])
}

async function ensureGoalRow(userId, dailyTargetMinutes) {
  const numericTarget = Number(dailyTargetMinutes)
  if (!Number.isInteger(numericTarget) || numericTarget < 1 || numericTarget > 600) {
    throw new Error('Daily study time must be a whole number from 1 to 600 minutes.')
  }

  const { data, error } = await supabase
    .from('study_goals')
    .upsert({
      user_id: userId,
      daily_target_minutes: numericTarget,
    }, { onConflict: 'user_id' })
    .select('id, daily_target_minutes')
    .single()

  if (error) throw error
  return data
}

async function saveStudyGoalPreferencesAtomically({ userId, dailyTargetMinutes, studyDays }) {
  const safeUserId = requireUserId(userId)
  const numericTarget = dailyTargetMinutes == null ? null : Number(dailyTargetMinutes)
  if (
    numericTarget !== null
    && (!Number.isInteger(numericTarget) || numericTarget < 1 || numericTarget > 600)
  ) {
    throw new Error('Daily study time must be a whole number from 1 to 600 minutes.')
  }

  const requestedDays = normalizeStudyDays(studyDays).map(toDatabaseDayOfWeek)
  const { error } = await supabase.rpc('save_study_goal_preferences', {
    p_user_id: safeUserId,
    p_daily_target_minutes: numericTarget,
    p_study_days: requestedDays,
  })

  if (error) throw error
  return loadStudyPreferences(safeUserId)
}

export async function loadStudyPreferences(userId) {
  const safeUserId = requireUserId(userId)
  const { data: goal, error: goalError } = await supabase
    .from('study_goals')
    .select('id, daily_target_minutes')
    .eq('user_id', safeUserId)
    .maybeSingle()

  if (goalError) throw goalError

  let studyDays = [...DEFAULT_STUDY_DAYS]
  if (goal) {
    const { data: dayRows, error: daysError } = await supabase
      .from('study_goal_days')
      .select('day_of_week')
      .eq('goal_id', goal.id)
      .order('day_of_week')

    if (daysError) throw daysError
    studyDays = (dayRows || [])
      .map((row) => toScreenDayOfWeek(row.day_of_week))
      .sort((left, right) => left - right)
  }

  const { data: subjectRows, error: subjectsError } = await supabase
    .from('subjects')
    .select('name')
    .eq('user_id', safeUserId)
    .order('created_at', { ascending: true })

  if (subjectsError) throw subjectsError

  return {
    dailyTargetMinutes: goal ? Number(goal.daily_target_minutes) : DEFAULT_DAILY_TARGET_MINUTES,
    studyDays,
    subjects: (subjectRows || []).map((row) => row.name),
    hasStudyGoal: Boolean(goal),
  }
}

export async function saveDailyTarget({ userId, dailyTargetMinutes }) {
  const safeUserId = requireUserId(userId)
  const goal = await ensureGoalRow(safeUserId, dailyTargetMinutes)

  return Number(goal.daily_target_minutes)
}

export async function saveStudyDays({ userId, dailyTargetMinutes, studyDays }) {
  return saveStudyGoalPreferencesAtomically({ userId, dailyTargetMinutes, studyDays })
}

export async function saveStudyGoalPreferences({ userId, dailyTargetMinutes, studyDays }) {
  return saveStudyGoalPreferencesAtomically({ userId, dailyTargetMinutes, studyDays })
}

export async function saveSubjects({ userId, previousSubjects, nextSubjects }) {
  const safeUserId = requireUserId(userId)
  const oldNames = normalizeSubjects(previousSubjects)
  const newNames = normalizeSubjects(nextSubjects)

  const { data, error } = await supabase.rpc('replace_user_subjects', {
    p_user_id: safeUserId,
    p_previous_subjects: oldNames,
    p_next_subjects: newNames,
  })

  if (error) throw error
  if (!Array.isArray(data) || data.some((name) => typeof name !== 'string')) {
    throw new Error('The saved subject list could not be confirmed. Please try again.')
  }

  return data
}
