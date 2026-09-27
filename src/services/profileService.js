import { supabase } from './supabaseClient'

const PROFILE_COLUMNS = 'id, full_name, university, major, academic_year, avatar_path, onboarding_completed_at'

function normalizeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function toAcademicYear(year) {
  const match = typeof year === 'string' ? year.match(/^Year\s+([1-6])$/) : null
  return match ? Number(match[1]) : null
}

function toYearLabel(academicYear) {
  const numericYear = Number(academicYear)
  return Number.isInteger(numericYear) && numericYear >= 1 && numericYear <= 6
    ? `Year ${numericYear}`
    : 'Year 2'
}

function normalizeAvatarPath(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function mapProfileRow(row) {
  if (!row) return null

  const fullName = normalizeText(row.full_name)
  const university = normalizeText(row.university)
  const major = normalizeText(row.major)
  const academicYear = Number(row.academic_year)
  const hasAcademicYear = Number.isInteger(academicYear) && academicYear >= 1 && academicYear <= 6

  return {
    id: row.id,
    fullName: fullName || 'Alex',
    university: university || 'PSU',
    major: major || 'Computer Science',
    year: toYearLabel(row.academic_year),
    avatarPath: normalizeAvatarPath(row.avatar_path),
    onboardingCompletedAt: row.onboarding_completed_at || null,
    isProfileComplete: Boolean(fullName && university && major && hasAcademicYear),
  }
}

export async function loadProfile(userId) {
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  return mapProfileRow(data)
}

export async function saveProfile({ userId, profile }) {
  if (!userId) throw new Error('A signed-in user is required to save a profile.')

  const fullName = normalizeText(profile?.fullName)
  if (!fullName) throw new Error('Full name is required.')

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: fullName,
      university: normalizeText(profile?.university) || null,
      major: normalizeText(profile?.major) || null,
      academic_year: toAcademicYear(profile?.year),
      avatar_path: normalizeAvatarPath(profile?.avatarPath),
      onboarding_completed_at: profile?.onboardingCompletedAt || null,
    }, { onConflict: 'id' })
    .select(PROFILE_COLUMNS)
    .single()

  if (error) throw error

  return mapProfileRow(data)
}

export async function markOnboardingCompleted(userId) {
  if (!userId) throw new Error('A signed-in user is required to finish onboarding.')

  const { data, error } = await supabase
    .from('profiles')
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single()

  if (error) throw error

  return mapProfileRow(data)
}
