import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Alert, Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Asset } from 'expo-asset'
import * as SplashScreen from 'expo-splash-screen'
import WelcomeScreen from './src/screens/welcomeScreen'
import SignUpScreen from './src/screens/signUpScreen'
import LoginScreen from './src/screens/loginScreen'
import VerificationScreen from './src/screens/verificationScreen'
import ProfileSetupScreen from './src/screens/profileSetupScreen'
import GoalSetupScreen from './src/screens/goalSetupScreen'
import HomeScreen from './src/screens/homeScreen'
import EditProfileScreen from './src/screens/editProfileScreen'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import SetupCompleteScreen from './src/screens/setupCompleteScreen'
import StudyTimerScreen from './src/screens/studyTimeScreen'
import SessionCompleteScreen from './src/screens/sessionCompleteScreen'
import StudyHistoryScreen from './src/screens/studyHistoryScreen'
import SubjectSelectionScreen from './src/screens/subjectSelectionScreen'
import AnalyticsScreen from './src/screens/analyticsScreen'
import ProfileSettingsScreen from './src/screens/profileSettingsScreen'
import SubjectsScreen from './src/screens/subjectsScreen'
import QuickQAScreen from './src/screens/quickQAScreen'
import QaLibraryScreen from './src/screens/qaLibraryScreen'
import QuizUploadScreen from './src/screens/quizUploadScreen'
import QuizSessionScreen from './src/screens/quizSessionScreen'
import QuizResultScreen from './src/screens/quizResultScreen'
import FlashcardsScreen from './src/screens/flashcardsScreen'
import StudyCardsScreen from './src/screens/studyCardsScreen'
import CreateFlashcardsScreen from './src/screens/createFlashcardsScreen'
import { generateStudyContent } from './src/services/studyAiClient'
import {
  deleteQaStudySetForUser,
  loadQaStudySetForUser,
  loadStudySetsForUser,
  renameQaStudySetForUser,
  saveFlashcardReviewForUser,
  saveManualFlashcardDeckForUser,
  saveStudySetForUser,
} from './src/services/studySetService'
import { saveQuizAttemptForUser } from './src/services/quizAttemptService'
import { loadQaAttemptsForUser, saveQaAttemptForUser, saveQaAttemptsForUser } from './src/services/qaAttemptService'
import { buildHomeStudyMetrics, loadQuizAverageForUser } from './src/services/homeMetricsService'
import { getAvatarSignedUrl, isLocalAvatarUri, uploadAvatar } from './src/services/avatarStorage'
import { loadProfile, markOnboardingCompleted, saveProfile } from './src/services/profileService'
import {
  createStudySessionDraft,
  importLegacyStudySessionsForUser,
  loadStudySessionsForUser,
  saveStudySessionForUser,
} from './src/services/studySessionService'
import {
  loadStudyPreferences,
  saveDailyTarget,
  saveStudyDays,
  saveStudyGoalPreferences,
  saveSubjects,
} from './src/services/studyPreferencesService'
import { supabase } from './src/services/supabaseClient'
import { isValidEmail, isValidFullName, isValidPassword } from './src/utils/authValidation'

const STORAGE_LOAD_ERROR_MESSAGE = "We couldn't load your saved study sessions. Please try again."
const FLASHCARD_LOAD_ERROR_MESSAGE = "We couldn't load your saved flashcard decks. Please try again."
const SAVED_FLASHCARD_LOAD_ERROR_MESSAGE = 'Your deck was saved, but your saved decks could not be loaded. Tap Try again to show it.'
const FLASHCARD_PROGRESS_KEY_PREFIX = '@studybuddy/flashcard-progress'
const WELCOME_LOGO_ASSET = require('./assets/logo-welcome-crisp.png')

SplashScreen.preventAutoHideAsync().catch(() => {})

function flashcardProgressKey(userId, studySetId) {
  return `${FLASHCARD_PROGRESS_KEY_PREFIX}:${userId}:${studySetId}`
}

function normalizeFlashcardCheckpoint(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  if (!Array.isArray(value.reviews)) return null

  const reviews = value.reviews.reduce((result, review) => {
    if (!review || typeof review !== 'object') return result
    const cardId = typeof review.cardId === 'string' ? review.cardId.trim() : ''
    const rating = review.rating === 'known' || review.rating === 'learning' ? review.rating : null
    const reviewedAt = typeof review.reviewedAt === 'string' && !Number.isNaN(new Date(review.reviewedAt).getTime())
      ? new Date(review.reviewedAt).toISOString()
      : null
    if (cardId && rating && reviewedAt) result.push({ cardId, rating, reviewedAt })
    return result
  }, [])

  return { reviews }
}

const styles = StyleSheet.create({
  transitionHost: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#F8FAF7',
  },
  screenTransition: {
    flex: 1,
  },
})

function formatStudyDuration(totalSeconds = 0) {
  let numericSeconds

  try {
    numericSeconds = Number(totalSeconds)
  } catch (error) {
    numericSeconds = 0
  }

  const safeSeconds = Number.isFinite(numericSeconds)
    ? Math.max(0, Math.floor(numericSeconds))
    : 0
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return seconds > 0 ? `${seconds}s` : '0m'
}

function toSafeDurationSeconds(value) {
  let numericValue

  try {
    numericValue = Number(value)
  } catch (error) {
    return 0
  }

  return Number.isFinite(numericValue) ? Math.max(0, Math.floor(numericValue)) : 0
}

function isSessionRecord(session) {
  return session !== null && typeof session === 'object' && !Array.isArray(session)
}

function isToday(dateValue) {
  const isSupportedDateValue = typeof dateValue === 'string'
    || typeof dateValue === 'number'
    || dateValue instanceof Date

  if (!isSupportedDateValue || dateValue === '') return false

  try {
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return false

    const today = new Date()

    return date.toDateString() === today.toDateString()
  } catch (error) {
    return false
  }
}

function getTodayMetrics(sessions, dailyTargetMinutes) {
  const safeSessions = Array.isArray(sessions) ? sessions : []
  const todaySessions = safeSessions.filter(
    (session) => isSessionRecord(session) && isToday(session.completedAt),
  )
  const studySeconds = todaySessions.reduce(
    (total, session) => total + toSafeDurationSeconds(session.durationSeconds),
    0,
  )
  const numericTargetMinutes = Number(dailyTargetMinutes)
  const targetSeconds = Number.isFinite(numericTargetMinutes)
    ? Math.max(1, Math.floor(numericTargetMinutes * 60))
    : 1
  const remainingSeconds = Math.max(0, targetSeconds - studySeconds)
  const progressPercent = Math.min(100, Math.floor((studySeconds / targetSeconds) * 100))

  return {
    sessionCount: todaySessions.length,
    studySeconds,
    targetSeconds,
    studyLabel: formatStudyDuration(studySeconds),
    goalLabel: `of ${formatStudyDuration(targetSeconds)} goal`,
    remainingLabel: remainingSeconds > 0 ? `${formatStudyDuration(remainingSeconds)} left` : 'Goal reached',
    dailyGoalCompleted: studySeconds >= targetSeconds,
    progressPercent,
  }
}

function createDefaultProfile(fullName = 'Alex') {
  return {
    fullName,
    university: 'PSU',
    major: 'Computer Science',
    year: 'Year 2',
    avatarUri: null,
    avatarPath: null,
    onboardingCompletedAt: null,
    isProfileComplete: false,
  }
}

function getAuthenticatedProfileName(user) {
  const fullName = user?.user_metadata?.full_name

  return typeof fullName === 'string' && fullName.trim()
    ? fullName.trim()
    : 'Alex'
}

function getAuthenticatedDestination(restoredData) {
  if (!restoredData?.profile?.isProfileComplete) return 'profile'
  if (!restoredData.profile.onboardingCompletedAt || restoredData.goal?.hasStudyGoal !== true) {
    return 'goal'
  }

  return 'home'
}

function formatFlashcardLastStudied(reviewedAt) {
  if (!reviewedAt) return 'Not studied yet'

  const reviewedDate = new Date(reviewedAt)
  if (Number.isNaN(reviewedDate.getTime())) return 'Not studied yet'

  const today = new Date()
  if (reviewedDate.toDateString() === today.toDateString()) return 'Last studied today'

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (reviewedDate.toDateString() === yesterday.toDateString()) return 'Last studied yesterday'

  return `Last studied ${reviewedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function getFlashcardDeckMastery(cards) {
  if (!Array.isArray(cards) || cards.length === 0) return 0

  return Math.round(
    cards.reduce((total, card) => total + (Number(card.confidence) || 0), 0)
      / (cards.length * 3)
      * 100,
  )
}

function toFlashcardDeck(studySet, ownerUserId) {
  const cards = Array.isArray(studySet.cards) ? studySet.cards : []
  const latestReviewedAt = studySet.latestReviewedAt || null

  return {
    id: String(studySet.id),
    studySetId: String(studySet.id),
    ownerUserId,
    name: studySet.deckName || studySet.title,
    subtitle: `${cards.length} cards · ${formatFlashcardLastStudied(latestReviewedAt)}`,
    mastery: Number.isFinite(Number(studySet.mastery))
      ? Number(studySet.mastery)
      : getFlashcardDeckMastery(cards),
    color: '#7A66D8',
    coverColor: '#EFEAFE',
    createdAt: studySet.createdAt || null,
    latestReviewedAt,
    cards,
  }
}


export default function App() {
  const { width: screenWidth } = useWindowDimensions()
  const [isAppReady, setIsAppReady] = useState(false)
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [verificationEmail, setVerificationEmail] = useState('')
  const [authenticatedUser, setAuthenticatedUser] = useState(null)
  const [profileName, setProfileName] = useState('Alex')
  const [profileData, setProfileData] = useState(() => createDefaultProfile())
  const [goalData, setGoalData] = useState({
    dailyTargetMinutes: 120,
    studyDays: [0,1,2,3,4],
    subjects: [],
    hasStudyGoal: false,
  })
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [sessionResult, setSessionResult] = useState(null)
  const [studySessions, setStudySessions] = useState([])
  const [sessionsLoadState, setSessionsLoadState] = useState('loading')
  const [sessionsLoadError, setSessionsLoadError] = useState(null)
  const [selectedSubjectName, setSelectedSubjectName] = useState('')
  const [subjectSelectionReturnScreen, setSubjectSelectionReturnScreen] = useState('home')
  const [subjectsReturnScreen, setSubjectsReturnScreen] = useState('profile-settings')
  const [quizConfig, setQuizConfig] = useState(null)
  const [quizResult, setQuizResult] = useState(null)
  const [quizReviewResult, setQuizReviewResult] = useState(null)
  const [quizResultSaveState, setQuizResultSaveState] = useState('idle')
  const [quizResultSaveError, setQuizResultSaveError] = useState('')
  const [pendingQuizSave, setPendingQuizSave] = useState(null)
  const [selectedFlashcardDeck, setSelectedFlashcardDeck] = useState(null)
  const [flashcardDecks, setFlashcardDecks] = useState([])
  const [flashcardDecksLoadState, setFlashcardDecksLoadState] = useState('loading')
  const [flashcardDecksLoadError, setFlashcardDecksLoadError] = useState(null)
  const [quickQASession, setQuickQASession] = useState(null)
  const [qaLibrarySets, setQaLibrarySets] = useState([])
  const [qaResultSet, setQaResultSet] = useState(null)
  const [qaResultSaveState, setQaResultSaveState] = useState('idle')
  const [qaResultTitleDialogRequested, setQaResultTitleDialogRequested] = useState(false)
  const [homeMetrics, setHomeMetrics] = useState({ streakDays: 0, todaySubjects: [], quizAverage: null })
  const screenTransition = useRef(new Animated.Value(1)).current
  const hasAnimatedScreenRef = useRef(false)
  const isSessionsMountedRef = useRef(true)
  const isFlashcardDecksMountedRef = useRef(true)
  const authenticatedUserIdRef = useRef(null)
  const authLifecycleGenerationRef = useRef(0)
  const studySessionsOwnerGenerationRef = useRef(0)
  const flashcardDecksOwnerGenerationRef = useRef(0)
  const flashcardDecksLoadGenerationRef = useRef(0)
  const quizResultSaveAttemptIdRef = useRef(null)
  const flashcardDeckNeedsLoadRef = useRef(false)
  const flashcardSavedStudySetIdsRef = useRef(new Set())
  const savedQaRecoveryRef = useRef(null)
  const pendingTemporaryQaSetRef = useRef(null)
  const homeMetricsGenerationRef = useRef(0)
  const profileLoadGenerationRef = useRef(0)
  const profileRestorePromiseRef = useRef(null)
  const goalDataLoadGenerationRef = useRef(0)
  const goalDataMutationGenerationRef = useRef(0)
  const goalDataOwnerUserIdRef = useRef(null)
  const goalDataLoadStateRef = useRef('idle')
  const goalDataLoadPromiseRef = useRef(null)

  const loadAuthenticatedGoalData = useCallback((userId) => {
    const loadGeneration = ++goalDataLoadGenerationRef.current
    const mutationGeneration = goalDataMutationGenerationRef.current
    goalDataOwnerUserIdRef.current = userId
    goalDataLoadStateRef.current = 'loading'

    const promise = loadStudyPreferences(userId)
      .then((savedGoalData) => {
        if (
          authenticatedUserIdRef.current !== userId
          || goalDataOwnerUserIdRef.current !== userId
          || goalDataLoadGenerationRef.current !== loadGeneration
          || goalDataMutationGenerationRef.current !== mutationGeneration
        ) {
          return null
        }

        setGoalData(savedGoalData)
        goalDataLoadStateRef.current = 'ready'
        return savedGoalData
      })
      .catch((error) => {
        if (
          authenticatedUserIdRef.current === userId
          && goalDataOwnerUserIdRef.current === userId
          && goalDataLoadGenerationRef.current === loadGeneration
          && goalDataMutationGenerationRef.current === mutationGeneration
        ) {
          console.warn('Unable to load saved study preferences', error.message)
          goalDataLoadStateRef.current = 'error'
        }

        return null
      })

    goalDataLoadPromiseRef.current = { userId, promise }
    return promise
  }, [])

  const ensureGoalPreferencesLoaded = useCallback(async (userId) => {
    if (!userId) return false

    if (
      goalDataOwnerUserIdRef.current === userId
      && goalDataLoadStateRef.current === 'ready'
    ) {
      return true
    }

    const currentLoad = goalDataLoadPromiseRef.current
    if (
      goalDataOwnerUserIdRef.current === userId
      && goalDataLoadStateRef.current === 'loading'
      && currentLoad?.userId === userId
    ) {
      return Boolean(await currentLoad.promise)
    }

    return Boolean(await loadAuthenticatedGoalData(userId))
  }, [loadAuthenticatedGoalData])

  const refreshGoalDataAfterSaveError = useCallback(async (userId) => {
    try {
      const savedGoalData = await loadStudyPreferences(userId)
      if (authenticatedUserIdRef.current !== userId) return

      goalDataLoadGenerationRef.current += 1
      goalDataMutationGenerationRef.current += 1
      goalDataOwnerUserIdRef.current = userId
      goalDataLoadStateRef.current = 'ready'
      setGoalData(savedGoalData)
    } catch (refreshError) {
      console.warn('Unable to refresh study preferences after a save error', refreshError.message)
    }
  }, [])

  const handleGoalDataSaveError = useCallback(async (userId, title, error) => {
    if (authenticatedUserIdRef.current === userId) {
      await refreshGoalDataAfterSaveError(userId)
      Alert.alert(title, error?.message || 'Please try again.')
    }

    return false
  }, [refreshGoalDataAfterSaveError])

  const persistDailyTarget = useCallback(async (dailyTargetMinutes) => {
    const userId = authenticatedUserIdRef.current
    if (!userId) {
      Alert.alert('Could not save study goal', 'Please sign in again and try once more.')
      return false
    }

    try {
      if (!(await ensureGoalPreferencesLoaded(userId))) {
        Alert.alert('Study preferences unavailable', 'Please try again after your saved study preferences load.')
        return false
      }

      if (authenticatedUserIdRef.current !== userId) return false
      const persistedTarget = await saveDailyTarget({ userId, dailyTargetMinutes })
      if (authenticatedUserIdRef.current !== userId) return false

      goalDataLoadGenerationRef.current += 1
      goalDataMutationGenerationRef.current += 1
      goalDataOwnerUserIdRef.current = userId
      goalDataLoadStateRef.current = 'ready'
      setGoalData((currentGoalData) => ({
        ...currentGoalData,
        dailyTargetMinutes: persistedTarget,
        hasStudyGoal: true,
      }))
      return true
    } catch (error) {
      return handleGoalDataSaveError(userId, 'Could not save study goal', error)
    }
  }, [ensureGoalPreferencesLoaded, handleGoalDataSaveError])

  const persistStudyDays = useCallback(async (studyDays) => {
    const userId = authenticatedUserIdRef.current
    if (!userId) {
      Alert.alert('Could not save study days', 'Please sign in again and try once more.')
      return false
    }

    try {
      if (!(await ensureGoalPreferencesLoaded(userId))) {
        Alert.alert('Study preferences unavailable', 'Please try again after your saved study preferences load.')
        return false
      }

      if (authenticatedUserIdRef.current !== userId) return false
      const savedGoalData = await saveStudyDays({ userId, studyDays })
      if (authenticatedUserIdRef.current !== userId) return false

      goalDataLoadGenerationRef.current += 1
      goalDataMutationGenerationRef.current += 1
      goalDataOwnerUserIdRef.current = userId
      goalDataLoadStateRef.current = 'ready'
      setGoalData(savedGoalData)
      return true
    } catch (error) {
      return handleGoalDataSaveError(userId, 'Could not save study days', error)
    }
  }, [ensureGoalPreferencesLoaded, handleGoalDataSaveError])

  const persistSubjects = useCallback(async (nextSubjects) => {
    const userId = authenticatedUserIdRef.current
    if (!userId) {
      Alert.alert('Could not save subjects', 'Please sign in again and try once more.')
      return false
    }

    try {
      if (!(await ensureGoalPreferencesLoaded(userId))) {
        Alert.alert('Study preferences unavailable', 'Please try again after your saved study preferences load.')
        return false
      }

      if (authenticatedUserIdRef.current !== userId) return false
      const savedSubjects = await saveSubjects({
        userId,
        previousSubjects: goalData.subjects,
        nextSubjects,
      })
      if (authenticatedUserIdRef.current !== userId) return false

      goalDataLoadGenerationRef.current += 1
      goalDataMutationGenerationRef.current += 1
      goalDataOwnerUserIdRef.current = userId
      goalDataLoadStateRef.current = 'ready'
      setGoalData((currentGoalData) => ({
        ...currentGoalData,
        subjects: savedSubjects,
      }))
      return true
    } catch (error) {
      return handleGoalDataSaveError(userId, 'Could not save subjects', error)
    }
  }, [ensureGoalPreferencesLoaded, goalData.subjects, handleGoalDataSaveError])

  const persistOnboardingGoal = useCallback(async (newGoalData) => {
    const userId = authenticatedUserIdRef.current
    if (!userId) {
      Alert.alert('Could not save study goal', 'Please sign in again and try once more.')
      return false
    }

    try {
      const savedGoalData = await saveStudyGoalPreferences({
        userId,
        dailyTargetMinutes: newGoalData.dailyTargetMinutes,
        studyDays: newGoalData.studyDays,
      })
      if (authenticatedUserIdRef.current !== userId) return false

      const completedProfile = await markOnboardingCompleted(userId)
      if (authenticatedUserIdRef.current !== userId) return false

      goalDataLoadGenerationRef.current += 1
      goalDataMutationGenerationRef.current += 1
      goalDataOwnerUserIdRef.current = userId
      goalDataLoadStateRef.current = 'ready'
      setGoalData(savedGoalData)
      setProfileData((currentProfileData) => ({
        ...currentProfileData,
        ...completedProfile,
      }))
      profileRestorePromiseRef.current = {
        userId,
        promise: Promise.resolve({ userId, profile: completedProfile, goal: savedGoalData }),
      }
      return true
    } catch (error) {
      return handleGoalDataSaveError(userId, 'Could not save study goal', error)
    }
  }, [handleGoalDataSaveError])

  const restoreAuthenticatedProfile = useCallback((user) => {
    const userId = user?.id ?? null
    const currentRestore = profileRestorePromiseRef.current
    if (userId && currentRestore?.userId === userId) return currentRestore.promise

    if (authenticatedUserIdRef.current !== userId) {
      savedQaRecoveryRef.current = null
      pendingTemporaryQaSetRef.current = null
      setQuickQASession(null)
    }

    const loadGeneration = ++profileLoadGenerationRef.current
    const fullName = getAuthenticatedProfileName(user)
    const legacyAvatarPath = user?.user_metadata?.avatar_path || null

    studySessionsOwnerGenerationRef.current += 1
    flashcardDecksOwnerGenerationRef.current += 1
    flashcardDecksLoadGenerationRef.current += 1
    flashcardDeckNeedsLoadRef.current = false
    flashcardSavedStudySetIdsRef.current = new Set()
    setStudySessions([])
    setHomeMetrics({ streakDays: 0, todaySubjects: [], quizAverage: null })
    setSessionsLoadError(null)
    setSessionsLoadState(userId ? 'loading' : 'idle')
    setFlashcardDecks([])
    setQaLibrarySets([])
    setQaResultSet(null)
    setFlashcardDecksLoadError(null)
    setFlashcardDecksLoadState(userId ? 'loading' : 'idle')
    setSelectedFlashcardDeck(null)
    authenticatedUserIdRef.current = userId
    setAuthenticatedUser(user ?? null)
    setProfileName(fullName)
    setProfileData({
      ...createDefaultProfile(fullName),
      avatarPath: legacyAvatarPath,
    })
    goalDataLoadGenerationRef.current += 1
    goalDataMutationGenerationRef.current += 1
    goalDataOwnerUserIdRef.current = userId
    goalDataLoadStateRef.current = userId ? 'loading' : 'idle'
    goalDataLoadPromiseRef.current = null
    setGoalData({
      dailyTargetMinutes: 120,
      studyDays: [0, 1, 2, 3, 4],
      subjects: [],
      hasStudyGoal: false,
    })

    if (!userId) {
      profileRestorePromiseRef.current = null
      return Promise.resolve(null)
    }

    const goalLoadPromise = loadAuthenticatedGoalData(userId)

    const isCurrentProfileLoad = () => (
      authenticatedUserIdRef.current === userId
      && profileLoadGenerationRef.current === loadGeneration
    )

    const profileLoadPromise = loadProfile(userId)
      .then(async (savedProfile) => {
        if (!isCurrentProfileLoad()) return { success: false, profile: null }

        const avatarPath = savedProfile
          ? savedProfile.avatarPath
          : legacyAvatarPath
        let avatarUri = null

        if (avatarPath) {
          try {
            avatarUri = await getAvatarSignedUrl(avatarPath)
          } catch (error) {
            console.warn('Unable to load profile image', error.message)
          }
        }

        if (!isCurrentProfileLoad()) return { success: false, profile: null }

        const profileToShow = savedProfile || {
          ...createDefaultProfile(fullName),
          avatarPath: legacyAvatarPath,
        }

        setProfileName(profileToShow.fullName)
        setProfileData((currentProfileData) => ({
          ...currentProfileData,
          ...profileToShow,
          avatarPath,
          avatarUri,
        }))
        return { success: true, profile: savedProfile }
      })
      .catch(async (error) => {
        if (!isCurrentProfileLoad()) return { success: false, profile: null }

        console.warn('Unable to load saved profile', error.message)

        if (legacyAvatarPath) {
          try {
            const avatarUri = await getAvatarSignedUrl(legacyAvatarPath)
            if (isCurrentProfileLoad()) {
              setProfileData((currentProfileData) => ({
                ...currentProfileData,
                avatarUri,
              }))
            }
          } catch (avatarError) {
            console.warn('Unable to load profile image', avatarError.message)
          }
        }

        return { success: false, profile: null }
      })

    const restorePromise = Promise.all([profileLoadPromise, goalLoadPromise])
      .then(([profileResult, savedGoalData]) => {
        if (!isCurrentProfileLoad() || !profileResult.success || !savedGoalData) return null

        return {
          userId,
          profile: profileResult.profile,
          goal: savedGoalData,
        }
      })

    profileRestorePromiseRef.current = { userId, promise: restorePromise }
    void restorePromise.then((restoredData) => {
      if (!restoredData && profileRestorePromiseRef.current?.promise === restorePromise) {
        profileRestorePromiseRef.current = null
      }
    })

    return restorePromise
  }, [loadAuthenticatedGoalData])

  const resetProfile = useCallback(() => {
    profileLoadGenerationRef.current += 1
    goalDataLoadGenerationRef.current += 1
    goalDataMutationGenerationRef.current += 1
    studySessionsOwnerGenerationRef.current += 1
    flashcardDecksOwnerGenerationRef.current += 1
    flashcardDecksLoadGenerationRef.current += 1
    flashcardDeckNeedsLoadRef.current = false
    flashcardSavedStudySetIdsRef.current = new Set()
    savedQaRecoveryRef.current = null
    pendingTemporaryQaSetRef.current = null
    homeMetricsGenerationRef.current += 1
    authenticatedUserIdRef.current = null
    goalDataOwnerUserIdRef.current = null
    goalDataLoadStateRef.current = 'idle'
    goalDataLoadPromiseRef.current = null
    profileRestorePromiseRef.current = null
    setStudySessions([])
    setHomeMetrics({ streakDays: 0, todaySubjects: [], quizAverage: null })
    setSessionsLoadError(null)
    setSessionsLoadState('idle')
    setFlashcardDecks([])
    setQaLibrarySets([])
    setQaResultSet(null)
    setFlashcardDecksLoadError(null)
    setFlashcardDecksLoadState('idle')
    setSelectedFlashcardDeck(null)
    setQuickQASession(null)
    setAuthenticatedUser(null)
    setProfileName('Alex')
    setProfileData(createDefaultProfile())
    setGoalData({
      dailyTargetMinutes: 120,
      studyDays: [0, 1, 2, 3, 4],
      subjects: [],
      hasStudyGoal: false,
    })
  }, [])

  const saveAuthenticatedProfile = useCallback(async (nextProfileData) => {
    const submittedUserId = authenticatedUserIdRef.current
    const fullName = nextProfileData.fullName?.trim()

    if (!fullName) {
      Alert.alert('Full name is required', 'Enter your full name before continuing.')
      return { success: false }
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      Alert.alert('Could not save profile', userError?.message || 'Please sign in again and try once more.')
      return { success: false }
    }

    const currentUser = userData.user
    if (
      (submittedUserId && submittedUserId !== currentUser.id)
      || (authenticatedUserIdRef.current && authenticatedUserIdRef.current !== currentUser.id)
    ) {
      return { success: false }
    }

    let avatarPath = nextProfileData.avatarPath === undefined
      ? profileData.avatarPath ?? null
      : nextProfileData.avatarPath
    let avatarUri = nextProfileData.avatarUri || null

    try {
      if (isLocalAvatarUri(avatarUri)) {
        avatarPath = await uploadAvatar({
          userId: currentUser.id,
          localUri: avatarUri,
        })
        avatarUri = await getAvatarSignedUrl(avatarPath)
      }
    } catch (error) {
      Alert.alert('Could not upload profile image', error.message || 'Please choose the image again.')
      return { success: false }
    }

    if (
      (submittedUserId && submittedUserId !== currentUser.id)
      || (authenticatedUserIdRef.current && authenticatedUserIdRef.current !== currentUser.id)
    ) {
      return { success: false }
    }

    let persistedProfile
    try {
      persistedProfile = await saveProfile({
        userId: currentUser.id,
        profile: {
          ...nextProfileData,
          fullName,
          avatarPath,
          onboardingCompletedAt: nextProfileData.onboardingCompletedAt
            ?? profileData.onboardingCompletedAt
            ?? null,
        },
      })
    } catch (error) {
      Alert.alert('Could not save profile', error.message || 'Please sign in again and try once more.')
      return { success: false }
    }

    if (
      (submittedUserId && submittedUserId !== currentUser.id)
      || (authenticatedUserIdRef.current && authenticatedUserIdRef.current !== currentUser.id)
    ) {
      return { success: false }
    }

    profileLoadGenerationRef.current += 1
    const savedProfile = {
      ...nextProfileData,
      ...persistedProfile,
      avatarUri,
    }

    const savedGoalData = goalDataOwnerUserIdRef.current === currentUser.id
      && goalDataLoadStateRef.current === 'ready'
      ? goalData
      : null
    profileRestorePromiseRef.current = {
      userId: currentUser.id,
      promise: Promise.resolve({ userId: currentUser.id, profile: savedProfile, goal: savedGoalData }),
    }

    setAuthenticatedUser(currentUser)
    authenticatedUserIdRef.current = currentUser.id
    setProfileName(savedProfile.fullName)
    setProfileData(savedProfile)

    return { success: true }
  }, [goalData, profileData.avatarPath])

  useEffect(() => {
    let isMounted = true

    const preloadWelcomeLogo = async () => {
      try {
        await Asset.loadAsync(WELCOME_LOGO_ASSET)
      } catch (error) {
        console.warn('Welcome logo could not be preloaded', error)
      } finally {
        if (isMounted) setIsAppReady(true)
      }
    }

    void preloadWelcomeLogo()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isAppReady) return
    void SplashScreen.hideAsync()
  }, [isAppReady])

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      const authLifecycleGeneration = authLifecycleGenerationRef.current
      const { data, error } = await supabase.auth.getSession()
      if (!isMounted || authLifecycleGenerationRef.current !== authLifecycleGeneration) return

      if (error) {
        console.warn('Unable to restore Supabase session', error.message)
        return
      }

      if (data.session) {
        const restoringUserId = data.session.user.id
        const restoredData = await restoreAuthenticatedProfile(data.session.user)
        if (
          !isMounted
          || authLifecycleGenerationRef.current !== authLifecycleGeneration
          || authenticatedUserIdRef.current !== restoringUserId
          || !restoredData
        ) return
        setCurrentScreen(getAuthenticatedDestination(restoredData))
      }
    }

    void restoreSession()

    const { data: authSubscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        authLifecycleGenerationRef.current += 1
        savedQaRecoveryRef.current = null
        pendingTemporaryQaSetRef.current = null
        setQuickQASession(null)
      }

      if (session) {
        const signInGeneration = authLifecycleGenerationRef.current
        const signInUserId = session.user.id
        const restorePromise = restoreAuthenticatedProfile(session.user)

        if (event === 'SIGNED_IN') {
          void restorePromise.then((restoredData) => {
            if (
              !isMounted
              || !restoredData
              || authLifecycleGenerationRef.current !== signInGeneration
              || authenticatedUserIdRef.current !== signInUserId
            ) return

            setCurrentScreen(getAuthenticatedDestination(restoredData))
          })
        }
      }

      if (event === 'SIGNED_OUT' || !session) {
        resetProfile()
        setCurrentScreen('welcome')
      }
    })

    return () => {
      isMounted = false
      authSubscription.subscription.unsubscribe()
    }
  }, [resetProfile, restoreAuthenticatedProfile])

  const loadSessions = useCallback(async () => {
    const userId = authenticatedUserIdRef.current
    const ownerGeneration = studySessionsOwnerGenerationRef.current

    if (!userId) {
      setStudySessions([])
      setSessionsLoadError(null)
      setSessionsLoadState('idle')
      return false
    }

    setSessionsLoadState('loading')
    setSessionsLoadError(null)

    const isCurrentOwner = () => (
      isSessionsMountedRef.current
      && authenticatedUserIdRef.current === userId
      && studySessionsOwnerGenerationRef.current === ownerGeneration
    )

    try {
      await importLegacyStudySessionsForUser(userId)
      if (!isCurrentOwner()) return false

      const sessions = await loadStudySessionsForUser(userId)
      if (!isCurrentOwner()) return false

      setStudySessions(Array.isArray(sessions) ? sessions : [])
      setSessionsLoadError(null)
      setSessionsLoadState('ready')
      return true
    } catch (error) {
      if (!isCurrentOwner()) return false

      console.warn('Study sessions could not be loaded', error)
      setSessionsLoadError(STORAGE_LOAD_ERROR_MESSAGE)
      setSessionsLoadState('error')
      return false
    }
  }, [])

  const loadHomeMetrics = useCallback(async () => {
    const userId = authenticatedUserIdRef.current
    const authGeneration = authLifecycleGenerationRef.current
    const loadGeneration = ++homeMetricsGenerationRef.current
    const studyMetrics = buildHomeStudyMetrics(studySessions, goalData.dailyTargetMinutes)

    if (!userId || sessionsLoadState !== 'ready') {
      setHomeMetrics({ ...studyMetrics, quizAverage: null })
      return
    }

    setHomeMetrics((currentMetrics) => ({
      ...studyMetrics,
      quizAverage: currentMetrics.quizAverage,
    }))

    try {
      const quizAverage = await loadQuizAverageForUser(userId)
      if (
        authenticatedUserIdRef.current !== userId
        || authLifecycleGenerationRef.current !== authGeneration
        || homeMetricsGenerationRef.current !== loadGeneration
      ) return

      setHomeMetrics({ ...studyMetrics, quizAverage })
    } catch (error) {
      if (
        authenticatedUserIdRef.current !== userId
        || authLifecycleGenerationRef.current !== authGeneration
        || homeMetricsGenerationRef.current !== loadGeneration
      ) return

      console.warn('Quiz metrics could not be loaded', error.message)
      setHomeMetrics({ ...studyMetrics, quizAverage: null })
    }
  }, [goalData.dailyTargetMinutes, sessionsLoadState, studySessions])

  const rememberSavedFlashcardDeck = (studySetId) => {
    if (typeof studySetId !== 'string' || !studySetId.trim()) return

    flashcardSavedStudySetIdsRef.current.add(studySetId.trim())
    flashcardDeckNeedsLoadRef.current = true
    flashcardDecksLoadGenerationRef.current += 1
  }

  const applyLoadedFlashcardStudySets = useCallback((studySets, userId) => {
    const decks = studySets
      .filter((studySet) => studySet.setType === 'flashcards')
      .map((studySet) => toFlashcardDeck(studySet, userId))
    const loadedStudySetIds = new Set(decks.map((deck) => deck.studySetId))
    const missingSavedDeck = Array.from(flashcardSavedStudySetIdsRef.current)
      .some((studySetId) => !loadedStudySetIds.has(studySetId))

    setFlashcardDecks(decks)
    if (missingSavedDeck) {
      flashcardDeckNeedsLoadRef.current = true
      setFlashcardDecksLoadError(SAVED_FLASHCARD_LOAD_ERROR_MESSAGE)
      setFlashcardDecksLoadState('error')
      setCurrentScreen('flashcards')
      return false
    }

    flashcardSavedStudySetIdsRef.current.clear()
    flashcardDeckNeedsLoadRef.current = false
    setFlashcardDecksLoadError(null)
    setFlashcardDecksLoadState('ready')
    return true
  }, [])

  const loadFlashcardDecks = useCallback(async () => {
    const userId = authenticatedUserIdRef.current
    const ownerGeneration = flashcardDecksOwnerGenerationRef.current

    if (!userId) {
      setFlashcardDecks([])
      setFlashcardDecksLoadError(null)
      setFlashcardDecksLoadState('idle')
      setSelectedFlashcardDeck(null)
      return false
    }

    const loadGeneration = ++flashcardDecksLoadGenerationRef.current
    setFlashcardDecksLoadState('loading')
    setFlashcardDecksLoadError(null)

    const isCurrentOwner = () => (
      isFlashcardDecksMountedRef.current
      && authenticatedUserIdRef.current === userId
      && flashcardDecksOwnerGenerationRef.current === ownerGeneration
      && flashcardDecksLoadGenerationRef.current === loadGeneration
    )

    try {
      const studySets = await loadStudySetsForUser(userId)
      if (!isCurrentOwner()) return false

      return applyLoadedFlashcardStudySets(studySets, userId)
    } catch (error) {
      if (!isCurrentOwner()) return false

      console.warn('Flashcard decks could not be loaded', error)
      setFlashcardDecksLoadError(
        flashcardDeckNeedsLoadRef.current
          ? SAVED_FLASHCARD_LOAD_ERROR_MESSAGE
          : FLASHCARD_LOAD_ERROR_MESSAGE,
      )
      setFlashcardDecksLoadState('error')
      return false
    }
  }, [applyLoadedFlashcardStudySets])

  useEffect(() => {
    isSessionsMountedRef.current = true
    void loadSessions()

    return () => {
      isSessionsMountedRef.current = false
    }
  }, [authenticatedUser?.id, profileData.id, loadSessions])

  useEffect(() => {
    isFlashcardDecksMountedRef.current = true
    void loadFlashcardDecks()

    return () => {
      isFlashcardDecksMountedRef.current = false
    }
  }, [authenticatedUser?.id, loadFlashcardDecks])

  useEffect(() => {
    void loadHomeMetrics()
  }, [loadHomeMetrics])

  useLayoutEffect(() => {
    if (!hasAnimatedScreenRef.current) {
      hasAnimatedScreenRef.current = true
      return undefined
    }

    screenTransition.stopAnimation()
    screenTransition.setValue(0)

    const animation = Animated.timing(screenTransition, {
      toValue: 1,
      duration: 190,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      isInteraction: false,
    })

    animation.start()

    return () => animation.stop()
  }, [currentScreen, screenTransition])

  const todayMetrics = getTodayMetrics(studySessions, goalData.dailyTargetMinutes)
  const sessionsReady = sessionsLoadState === 'ready'

  const handleStartStudy = async (returnScreen = 'home') => {
    if (!(await ensureGoalPreferencesLoaded(authenticatedUserIdRef.current))) {
      Alert.alert('Study preferences unavailable', 'Please try again after your saved study preferences load.')
      return
    }

    if (sessionsReady) {
      setSelectedSubjectName('')
      setSubjectSelectionReturnScreen(returnScreen)
      setCurrentScreen('subject-selection')
      return
    }

    const isLoading = sessionsLoadState === 'loading'

    Alert.alert(
      isLoading ? 'Study history is loading' : 'Study history unavailable',
      isLoading
        ? 'Please wait until your study history finishes loading before starting a new session.'
        : `${STORAGE_LOAD_ERROR_MESSAGE} Open Study History and tap Try again before starting a new session.`,
      isLoading
        ? [{ text: 'OK' }]
        : [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open History', onPress: () => setCurrentScreen('study-history') },
        ],
    )
  }

  const handleSubjectContinue = (subjectName) => {
    const safeSubjectName = typeof subjectName === 'string' ? subjectName.trim() : ''
    if (!safeSubjectName || !sessionsReady) return

    setSelectedSubjectName(safeSubjectName)
    setCurrentScreen('timer')
  }

  const showSavedFlashcardLoadError = (studySetId) => {
    rememberSavedFlashcardDeck(studySetId)
    flashcardDeckNeedsLoadRef.current = true
    flashcardDecksLoadGenerationRef.current += 1
    setFlashcardDecksLoadError(SAVED_FLASHCARD_LOAD_ERROR_MESSAGE)
    setFlashcardDecksLoadState('error')
    setCurrentScreen('flashcards')
  }

  const loadFlashcardCheckpoint = async (userId, studySetId) => {
    const rawCheckpoint = await AsyncStorage.getItem(flashcardProgressKey(userId, studySetId))
    if (!rawCheckpoint) return null

    try {
      return normalizeFlashcardCheckpoint(JSON.parse(rawCheckpoint))
    } catch (error) {
      console.warn('Flashcard progress checkpoint could not be read', error)
      return null
    }
  }

  const saveFlashcardCheckpoint = async (userId, studySetId, reviews) => {
    const checkpoint = normalizeFlashcardCheckpoint({ reviews })
    if (!checkpoint) throw new Error('Flashcard progress could not be prepared for saving.')
    await AsyncStorage.setItem(flashcardProgressKey(userId, studySetId), JSON.stringify(checkpoint))
  }

  const clearFlashcardCheckpoint = async (userId, studySetId) => {
    await AsyncStorage.removeItem(flashcardProgressKey(userId, studySetId))
  }

  const saveQuizResultInBackground = async (saveContext) => {
    const { result, userId, authLifecycleGeneration, studySetId } = saveContext || {}
    const attemptId = result?.attemptId
    if (!attemptId || !userId || !studySetId) return false

    quizResultSaveAttemptIdRef.current = attemptId
    setQuizResultSaveState('saving')
    setQuizResultSaveError('')

    try {
      await saveQuizAttemptForUser(userId, {
        attemptId,
        studySetId,
        startedAt: result.startedAt,
        completedAt: result.completedAt,
        answers: result.answers,
      })

      if (
        quizResultSaveAttemptIdRef.current !== attemptId
        || authenticatedUserIdRef.current !== userId
        || authLifecycleGenerationRef.current !== authLifecycleGeneration
      ) return false

      setQuizResultSaveState('saved')
      setPendingQuizSave(null)
      return true
    } catch (error) {
      if (
        quizResultSaveAttemptIdRef.current !== attemptId
        || authenticatedUserIdRef.current !== userId
        || authLifecycleGenerationRef.current !== authLifecycleGeneration
      ) return false

      setQuizResultSaveState('error')
      setQuizResultSaveError(error?.message || 'Your answers could not be saved. Check your connection and try again.')
      return false
    }
  }

  let screenContent

  const handleSessionFinish = async (newSessionResult, existingSession = null, ownerContext = null) => {
    const session = existingSession || createStudySessionDraft({
      ...newSessionResult,
      completedAt: new Date().toISOString(),
    })
    const sessionOwner = ownerContext || {
      userId: authenticatedUserIdRef.current,
      ownerGeneration: studySessionsOwnerGenerationRef.current,
    }
    const isCurrentOwner = () => (
      isSessionsMountedRef.current
      && authenticatedUserIdRef.current === sessionOwner.userId
      && studySessionsOwnerGenerationRef.current === sessionOwner.ownerGeneration
    )

    if (!isCurrentOwner()) return

    const completeSession = (persistedSession = null, includeUnpersistedSession = false) => {
      const nextSessions = persistedSession
        ? (studySessions.some((item) => item.id === persistedSession.id)
          ? studySessions
          : [...studySessions, persistedSession])
        : studySessions
      const metricSessions = persistedSession
        ? nextSessions
        : (includeUnpersistedSession ? [...studySessions, session] : studySessions)
      const nextMetrics = getTodayMetrics(metricSessions, goalData.dailyTargetMinutes)

      if (persistedSession) setStudySessions(nextSessions)
      setSessionResult({
        ...(persistedSession || session),
        dailyProgressLabel: nextMetrics.studyLabel,
        dailyGoalCompleted: nextMetrics.dailyGoalCompleted,
      })
      setCurrentScreen('session-complete')
    }

    if (session.durationSeconds <= 0) {
      completeSession()
      return
    }

    if (!sessionOwner.userId) {
      Alert.alert('Session not saved', 'Sign in again before saving this study session.')
      return
    }

    try {
      const persistedSession = await saveStudySessionForUser(sessionOwner.userId, session)
      if (!isCurrentOwner()) return
      completeSession(persistedSession)
    } catch (error) {
      if (!isCurrentOwner()) return

      console.warn('Study session could not be saved', error)
      Alert.alert(
        'Study session not saved',
        'Your study history was not updated. Check your connection and try again.',
        [
          {
            text: 'Try again',
            onPress: () => {
              void handleSessionFinish(newSessionResult, session, sessionOwner)
            },
          },
          {
            text: 'Finish without saving',
            style: 'cancel',
            onPress: () => {
              if (isCurrentOwner()) completeSession(null, true)
            },
          },
        ],
      )
    }
  }

  const createQuickQaSessionId = () => {
    const cryptoUuid = globalThis.crypto?.randomUUID?.()
    if (typeof cryptoUuid === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cryptoUuid)) {
      return cryptoUuid
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
      const randomNibble = Math.floor(Math.random() * 16)
      const value = character === 'x' ? randomNibble : ((randomNibble & 0x3) | 0x8)
      return value.toString(16)
    })
  }

  const isCurrentQuickQASession = (session) => Boolean(
    session?.ownerUserId
    && session?.sessionId
    && quickQASession?.sessionId === session.sessionId
    && authenticatedUserIdRef.current === session.ownerUserId
    && authLifecycleGenerationRef.current === session.authLifecycleGeneration
  )

  const createQaResultPreview = (session) => {
    const questions = session.questions || []
    const attempts = (session.attempts || []).map((attempt) => {
      const question = session.isSaved
        ? questions.find((item) => item.id === (attempt.question_id || attempt.questionId))
        : questions[attempt.questionIndex]
      return {
        question_id: question?.id || attempt.question_id || attempt.questionId,
        answer_text: attempt.answer_text || attempt.answerText || '',
        score: attempt.score,
        feedback: attempt.feedback || '',
        answered_at: attempt.answered_at || attempt.answeredAt,
      }
    }).filter((attempt) => attempt.question_id)

    return {
      id: session.studySetId || `temporary-${session.sessionId}`,
      title: session.title || session.generated?.deckName || session.generated?.subjectName || questions[0]?.subject || session.sourceFileName || 'Q&A Practice',
      questions,
      attempts,
      answeredCount: new Set(attempts.map((attempt) => attempt.question_id)).size,
    }
  }

  const saveTemporaryQaSession = async (session, title = null) => {
    if (!isCurrentQuickQASession(session) || session.isSaved) return false

    const pending = pendingTemporaryQaSetRef.current
    let studySetId = pending?.ownerUserId === session.ownerUserId
      && pending?.authLifecycleGeneration === session.authLifecycleGeneration
      && pending?.sessionId === session.sessionId
      ? pending.studySetId
      : null

    if (!studySetId) {
      studySetId = await saveStudySetForUser(session.ownerUserId, {
        generated: session.generated,
        questionCount: session.questionCount,
        difficulty: session.difficulty,
        sourceFileName: session.sourceFileName,
        title,
        idempotencyKey: session.sessionId,
      })
      pendingTemporaryQaSetRef.current = {
        ownerUserId: session.ownerUserId,
        authLifecycleGeneration: session.authLifecycleGeneration,
        sessionId: session.sessionId,
        studySetId,
        title,
      }
    } else if (title != null) {
      const renamedSet = await renameQaStudySetForUser(session.ownerUserId, studySetId, title)
      if (!isCurrentQuickQASession(session)) return false
      pendingTemporaryQaSetRef.current = { ...pending, title: renamedSet.title }
    }
    if (!isCurrentQuickQASession(session)) return false

    const savedSet = await loadQaStudySetForUser(session.ownerUserId, studySetId)
    if (!isCurrentQuickQASession(session)) return false
    if (!savedSet || !Array.isArray(savedSet.questions) || savedSet.questions.length !== session.questionCount) {
      throw new Error('Your Q&A set was saved, but its questions could not be loaded.')
    }

    const attemptsToSave = []
    for (const attempt of session.attempts) {
      const question = savedSet.questions[attempt.questionIndex]
      if (!question?.id) throw new Error('A saved Q&A question is missing its ID.')
      attemptsToSave.push({ ...attempt, questionId: question.id })
    }
    await saveQaAttemptsForUser(session.ownerUserId, attemptsToSave)
    if (!isCurrentQuickQASession(session)) return false

    setQuickQASession({ ...session, isSaved: true, studySetId, title: savedSet.title, questions: savedSet.questions })
    if (pendingTemporaryQaSetRef.current?.sessionId === session.sessionId) {
      pendingTemporaryQaSetRef.current = null
    }
    const resultAttempts = attemptsToSave.map((attempt) => ({
      question_id: attempt.questionId,
      answer_text: attempt.answerText,
      score: attempt.score,
      feedback: attempt.feedback,
      answered_at: attempt.answeredAt,
    }))
    return {
      ...savedSet,
      attempts: resultAttempts,
      answeredCount: new Set(resultAttempts.map((attempt) => attempt.question_id)).size,
    }
  }

  const loadQaLibrary = async () => {
    const userId = authenticatedUserIdRef.current
    if (!userId) return []
    const sets = (await loadStudySetsForUser(userId)).filter((set) => set.setType === 'qa')
    const questionIds = sets.flatMap((set) => set.questions.map((question) => question.id))
    const attempts = await loadQaAttemptsForUser(userId, questionIds)
    const result = sets.map((set) => {
      const setQuestionIds = new Set(set.questions.map((question) => question.id))
      const setAttempts = attempts.filter((attempt) => setQuestionIds.has(attempt.question_id))
      return { ...set, attempts: setAttempts, answeredCount: new Set(setAttempts.map((attempt) => attempt.question_id)).size }
    })
    if (authenticatedUserIdRef.current === userId) setQaLibrarySets(result)
    return result
  }

  const renameQaLibrarySet = async (set, title) => {
    const userId = authenticatedUserIdRef.current
    const authLifecycleGeneration = authLifecycleGenerationRef.current
    if (!userId || set?.setType !== 'qa') {
      throw new Error('Only a saved Q&A set can be renamed.')
    }

    const renamedSet = await renameQaStudySetForUser(userId, set.id, title)
    if (authenticatedUserIdRef.current !== userId
      || authLifecycleGenerationRef.current !== authLifecycleGeneration) return false

    setQaLibrarySets((currentSets) => currentSets.map((currentSet) => (
      currentSet.id === renamedSet.id
        ? {
          ...currentSet,
          title: renamedSet.title,
          subjectName: renamedSet.title,
          questions: currentSet.questions.map((question) => ({ ...question, subject: renamedSet.title })),
        }
        : currentSet
    )))
    return true
  }

  const deleteQaLibrarySet = async (set) => {
    const userId = authenticatedUserIdRef.current
    const authLifecycleGeneration = authLifecycleGenerationRef.current
    if (!userId || set?.setType !== 'qa') {
      throw new Error('Only a saved Q&A set can be deleted.')
    }

    const deletedStudySetId = await deleteQaStudySetForUser(userId, set.id)
    if (authenticatedUserIdRef.current !== userId
      || authLifecycleGenerationRef.current !== authLifecycleGeneration) return false

    setQaLibrarySets((currentSets) => currentSets.filter((currentSet) => currentSet.id !== deletedStudySetId))
    return true
  }

  const isCurrentSavedQaRecovery = (recovery) => Boolean(
    recovery
    && savedQaRecoveryRef.current === recovery
    && authenticatedUserIdRef.current === recovery.ownerUserId
    && authLifecycleGenerationRef.current === recovery.authLifecycleGeneration
  )

  const clearSavedQaRecovery = (recovery) => {
    if (savedQaRecoveryRef.current === recovery) savedQaRecoveryRef.current = null
  }

  const showSavedQaRecoveryAlert = (recovery) => {
    Alert.alert(
      'Your Q&A set is saved',
      'The saved questions could not be loaded. Retry loading uses this saved set and will not call AI or create another set.',
      [
        {
          text: 'Retry loading',
          onPress: () => { void retrySavedQaSet(recovery) },
        },
        {
          text: 'Generate a new set',
          onPress: () => clearSavedQaRecovery(recovery),
        },
        { text: 'Later', style: 'cancel' },
      ],
    )
  }

  const retrySavedQaSet = async (recovery) => {
    if (!isCurrentSavedQaRecovery(recovery)) return false

    try {
      const savedStudySets = await loadStudySetsForUser(recovery.ownerUserId)
      if (!isCurrentSavedQaRecovery(recovery)) return false

      const savedStudySet = savedStudySets.find(
        (studySet) => studySet.id === recovery.studySetId && studySet.setType === 'qa',
      )
      if (
        !savedStudySet
        || !Array.isArray(savedStudySet.questions)
        || savedStudySet.questions.length !== recovery.questionCount
        || savedStudySet.questions.some((question) => typeof question.id !== 'string' || !question.id)
      ) {
        throw new Error('The saved Q&A set is missing one or more question IDs.')
      }

      if (!isCurrentSavedQaRecovery(recovery)) return false

      setQuickQASession({
        studySetId: recovery.studySetId,
        ownerUserId: recovery.ownerUserId,
        authLifecycleGeneration: recovery.authLifecycleGeneration,
        sessionId: createQuickQaSessionId(),
        isSaved: true,
        questionCount: recovery.questionCount,
        difficulty: recovery.difficulty,
        sourceFileName: recovery.sourceFileName,
        questions: savedStudySet.questions,
      })
      clearSavedQaRecovery(recovery)
      setCurrentScreen('quick-qa')
      return true
    } catch (error) {
      if (!isCurrentSavedQaRecovery(recovery)) return false

      console.warn('Saved Q&A questions could not be loaded', error)
      showSavedQaRecoveryAlert(recovery)
      return false
    }
  }

  if (currentScreen === 'quiz-upload') {
    screenContent = (
      <QuizUploadScreen
        onBack={() => setCurrentScreen('home')}
        onGenerate={async (nextQuizConfig) => {
          const savedQaRecovery = savedQaRecoveryRef.current
          if (savedQaRecovery && !isCurrentSavedQaRecovery(savedQaRecovery)) {
            savedQaRecoveryRef.current = null
          } else if (savedQaRecovery) {
            clearSavedQaRecovery(savedQaRecovery)
          }

          const qaOwnerUserId = authenticatedUserIdRef.current
          const qaAuthLifecycleGeneration = authLifecycleGenerationRef.current
          const flashcardOwnerUserId = authenticatedUserIdRef.current
          const flashcardAuthLifecycleGeneration = authLifecycleGenerationRef.current
          const generated = await generateStudyContent(nextQuizConfig)

          if (generated.type !== nextQuizConfig.questionType) {
            throw new Error('The AI server returned a different question type. Please try again.')
          }

          if (nextQuizConfig.questionType === 'Multiple Choice') {
            const userId = authenticatedUserIdRef.current
            if (!userId) {
              throw new Error('Please sign in again before saving this quiz.')
            }

            const studySetId = await saveStudySetForUser(userId, {
              generated,
              questionCount: nextQuizConfig.questionCount,
              difficulty: nextQuizConfig.difficulty,
              sourceFileName: nextQuizConfig.file?.name ?? null,
            })

            if (authenticatedUserIdRef.current !== userId) {
              throw new Error('The signed-in account changed before this quiz could be opened.')
            }

            const savedStudySets = await loadStudySetsForUser(userId)
            const savedQuiz = savedStudySets.find((studySet) => studySet.id === studySetId)
            if (!savedQuiz || savedQuiz.setType !== 'multiple_choice') {
              throw new Error('The saved quiz questions could not be loaded. Please try again.')
            }

            if (authenticatedUserIdRef.current !== userId) {
              throw new Error('The signed-in account changed before this quiz could be opened.')
            }

            setQuizConfig({
              ...nextQuizConfig,
              ownerUserId: userId,
              studySetId,
              subjectName: savedQuiz.subjectName,
              questions: savedQuiz.questions,
            })
            setQuizResult(null)
            setCurrentScreen('quiz-session')
            return
          }

          if (nextQuizConfig.questionType === 'Flashcards') {
            const userId = flashcardOwnerUserId
            if (!userId || authenticatedUserIdRef.current !== userId || authLifecycleGenerationRef.current !== flashcardAuthLifecycleGeneration) {
              throw new Error('Please sign in again before starting these flashcards.')
            }

            const sessionId = createQuickQaSessionId()
            const cards = Array.isArray(generated.cards) ? generated.cards.map((card, index) => ({
              id: `temporary-${sessionId}-${index}`,
              question: card.question,
              answer: card.answer,
            })) : []
            setSelectedFlashcardDeck({
              id: `temporary-${sessionId}`,
              sessionId,
              ownerUserId: userId,
              authLifecycleGeneration: flashcardAuthLifecycleGeneration,
              isTemporary: true,
              generated,
              questionCount: nextQuizConfig.questionCount,
              difficulty: nextQuizConfig.difficulty,
              sourceFileName: nextQuizConfig.file?.name ?? null,
              name: generated.deckName || generated.subjectName || nextQuizConfig.file?.name || 'Flashcards',
              cards,
            })
            setCurrentScreen('study-cards')
            return
          }

          const userId = qaOwnerUserId
          if (!userId || authenticatedUserIdRef.current !== userId || authLifecycleGenerationRef.current !== qaAuthLifecycleGeneration) {
            throw new Error('Please sign in again before starting these Q&A questions.')
          }

          // Generated Q&A stays temporary until the learner explicitly saves it.
          pendingTemporaryQaSetRef.current = null
          setQuickQASession({
            ownerUserId: userId,
            authLifecycleGeneration: qaAuthLifecycleGeneration,
            sessionId: createQuickQaSessionId(),
            generated,
            questionCount: nextQuizConfig.questionCount,
            difficulty: nextQuizConfig.difficulty,
            sourceFileName: nextQuizConfig.file?.name ?? null,
            questions: generated.questions,
            attempts: [],
            isSaved: false,
          })
          setCurrentScreen('quick-qa')
        }}
      />
    )
  } else if (currentScreen === 'create-flashcards') {
    screenContent = (
      <CreateFlashcardsScreen
        onBack={() => setCurrentScreen('flashcards')}
        onSave={async ({ name, cards }) => {
          const userId = authenticatedUserIdRef.current
          const authLifecycleGeneration = authLifecycleGenerationRef.current
          const ownerGeneration = flashcardDecksOwnerGenerationRef.current
          if (!userId) throw new Error('Please sign in again before saving this deck.')

          const isCurrentOwner = () => (
            authenticatedUserIdRef.current === userId
            && authLifecycleGenerationRef.current === authLifecycleGeneration
            && flashcardDecksOwnerGenerationRef.current === ownerGeneration
          )

          const studySetId = await saveManualFlashcardDeckForUser(userId, { title: name, cards })
          if (!isCurrentOwner()) return { saved: true }
          rememberSavedFlashcardDeck(studySetId)

          try {
            if (!isCurrentOwner()) return { saved: true }

            const savedStudySets = await loadStudySetsForUser(userId)
            if (!isCurrentOwner()) return { saved: true }
            if (!applyLoadedFlashcardStudySets(savedStudySets, userId)) return { saved: true }

            const savedStudySet = savedStudySets.find(
              (studySet) => studySet.id === studySetId && studySet.setType === 'flashcards',
            )
            if (!savedStudySet) {
              showSavedFlashcardLoadError(studySetId)
              return { saved: true }
            }

            flashcardDecksLoadGenerationRef.current += 1
            setCurrentScreen('flashcards')
            return { saved: true }
          } catch (error) {
            if (!isCurrentOwner()) return { saved: true }
            console.warn('Manual flashcards were saved but could not be reloaded', error)
            showSavedFlashcardLoadError(studySetId)
            return { saved: true }
          }
        }}
      />
    )
  } else if (currentScreen === 'study-cards') {
    screenContent = (
      <StudyCardsScreen
        deck={selectedFlashcardDeck}
        onBack={() => setCurrentScreen('flashcards')}
        onSaveTemporaryDeck={async ({ title, reviews }) => {
          const deck = selectedFlashcardDeck
          const userId = authenticatedUserIdRef.current
          const ownerGeneration = flashcardDecksOwnerGenerationRef.current
          if (!deck?.isTemporary || !deck.sessionId || deck.ownerUserId !== userId) {
            throw new Error('This flashcard session is no longer available to save.')
          }

          const isCurrentOwner = () => (
            authenticatedUserIdRef.current === userId
            && authLifecycleGenerationRef.current === deck.authLifecycleGeneration
            && flashcardDecksOwnerGenerationRef.current === ownerGeneration
          )

          const studySetId = await saveStudySetForUser(userId, {
            generated: deck.generated,
            questionCount: deck.questionCount,
            difficulty: deck.difficulty,
            sourceFileName: deck.sourceFileName,
            title,
            idempotencyKey: deck.sessionId,
          })
          if (!isCurrentOwner()) return false

          const savedStudySets = await loadStudySetsForUser(userId)
          if (!isCurrentOwner()) return false
          const savedStudySet = savedStudySets.find(
            (studySet) => studySet.id === studySetId && studySet.setType === 'flashcards',
          )
          if (!savedStudySet || savedStudySet.cards.length !== deck.cards.length) {
            throw new Error('Your deck was saved, but its cards could not be loaded. Please try saving again.')
          }

          const savedSourceCardIds = new Set(deck.savedReviewSourceCardIds || [])
          for (const review of reviews) {
            if (savedSourceCardIds.has(review.cardId)) continue

            const sourceCardIndex = deck.cards.findIndex((card) => card.id === review.cardId)
            const savedCard = savedStudySet.cards[sourceCardIndex]
            if (sourceCardIndex < 0 || !savedCard?.id) {
              throw new Error('A saved flashcard could not be matched to its review.')
            }

            await saveFlashcardReviewForUser(userId, {
              flashcardId: savedCard.id,
              confidence: review.confidence,
              reviewedAt: review.reviewedAt,
            })
            if (!isCurrentOwner()) return false

            savedSourceCardIds.add(review.cardId)
            setSelectedFlashcardDeck((currentDeck) => (
              currentDeck?.sessionId === deck.sessionId
                ? { ...currentDeck, savedReviewSourceCardIds: [...savedSourceCardIds] }
                : currentDeck
            ))
          }

          const savedReviews = reviews.map((review) => {
            const sourceCardIndex = deck.cards.findIndex((card) => card.id === review.cardId)
            const savedCard = savedStudySet.cards[sourceCardIndex]
            if (sourceCardIndex < 0 || !savedCard?.id) {
              throw new Error('A saved flashcard could not be matched to its progress.')
            }
            return {
              cardId: savedCard.id,
              rating: review.confidence === 3 ? 'known' : 'learning',
              reviewedAt: review.reviewedAt,
            }
          })

          if (savedReviews.length < savedStudySet.cards.length) {
            await saveFlashcardCheckpoint(userId, studySetId, savedReviews)
          } else {
            await clearFlashcardCheckpoint(userId, studySetId)
          }
          if (!isCurrentOwner()) return false

          rememberSavedFlashcardDeck(studySetId)
          try {
            const refreshedStudySets = await loadStudySetsForUser(userId)
            if (!isCurrentOwner()) return false
            if (!applyLoadedFlashcardStudySets(refreshedStudySets, userId)) return true
            return true
          } catch (error) {
            if (!isCurrentOwner()) return false
            console.warn('Generated flashcards were saved but could not be reloaded', error)
            showSavedFlashcardLoadError(studySetId)
            return true
          }
        }}
        onSaveProgress={async ({ reviews }) => {
          const deck = selectedFlashcardDeck
          const userId = authenticatedUserIdRef.current
          if (!deck?.studySetId || deck.ownerUserId !== userId || !deck.resumeCheckpoint) return false

          await saveFlashcardCheckpoint(userId, deck.studySetId, reviews)
          return authenticatedUserIdRef.current === userId
        }}
        onClearProgress={async () => {
          const deck = selectedFlashcardDeck
          const userId = authenticatedUserIdRef.current
          if (!deck?.studySetId || deck.ownerUserId !== userId || !deck.resumeCheckpoint) return false

          await clearFlashcardCheckpoint(userId, deck.studySetId)
          return authenticatedUserIdRef.current === userId
        }}
        onReview={async ({ flashcardId, confidence, reviewedAt }) => {
          const deck = selectedFlashcardDeck
          const userId = authenticatedUserIdRef.current
          const authLifecycleGeneration = authLifecycleGenerationRef.current
          const ownerGeneration = flashcardDecksOwnerGenerationRef.current
          if (!userId || deck?.ownerUserId !== userId) return false

          const isCurrentOwner = () => (
            authenticatedUserIdRef.current === userId
            && authLifecycleGenerationRef.current === authLifecycleGeneration
            && flashcardDecksOwnerGenerationRef.current === ownerGeneration
          )

          let savedReview
          try {
            savedReview = await saveFlashcardReviewForUser(userId, {
              flashcardId,
              confidence,
              reviewedAt,
            })
          } catch (error) {
            if (!isCurrentOwner()) return false
            throw error
          }
          if (!isCurrentOwner()) return false

          const nextCards = (deck.cards || []).map((card) => (
            card.id === flashcardId
              ? { ...card, confidence: savedReview.confidence, reviewedAt: savedReview.reviewedAt }
              : card
          ))
          const updatedDeck = {
            ...deck,
            cards: nextCards,
            mastery: getFlashcardDeckMastery(nextCards),
            latestReviewedAt: savedReview.reviewedAt,
            subtitle: `${nextCards.length} cards · ${formatFlashcardLastStudied(savedReview.reviewedAt)}`,
          }

          setFlashcardDecks((currentDecks) => currentDecks.map((currentDeck) => (
            currentDeck.id === deck.id ? updatedDeck : currentDeck
          )))
          setSelectedFlashcardDeck(updatedDeck)
          return true
        }}
      />
    )
  } else if (currentScreen === 'flashcards') {
    screenContent = (
      <FlashcardsScreen
        decks={flashcardDecks}
        loadState={flashcardDecksLoadState}
        loadError={flashcardDecksLoadError}
        onRetry={() => { void loadFlashcardDecks() }}
        onBack={() => setCurrentScreen('home')}
        onStudyDeck={async (deck) => {
          if (deck.ownerUserId !== authenticatedUserIdRef.current) return
          const userId = deck.ownerUserId
          let resumeCheckpoint = null
          try {
            resumeCheckpoint = await loadFlashcardCheckpoint(userId, deck.studySetId)
          } catch (error) {
            console.warn('Flashcard progress checkpoint could not be loaded', error)
          }
          if (authenticatedUserIdRef.current !== userId) return
          setSelectedFlashcardDeck(resumeCheckpoint ? { ...deck, resumeCheckpoint } : deck)
          setCurrentScreen('study-cards')
        }}
        onCreateDeck={() => setCurrentScreen('create-flashcards')}
      />
    )
  } else if (currentScreen === 'quiz-session') {
    screenContent = (
      <QuizSessionScreen
        config={quizConfig}
        reviewResult={quizReviewResult}
        onExit={() => setCurrentScreen('home')}
        onReviewDone={() => setCurrentScreen('quiz-result')}
        onComplete={(result) => {
          const userId = quizConfig?.ownerUserId
          const authLifecycleGeneration = authLifecycleGenerationRef.current
          if (!userId || authenticatedUserIdRef.current !== userId) {
            Alert.alert(
              'Quiz result not saved',
              'The signed-in account changed. Please return to Home and generate the quiz again.',
            )
            return false
          }

          setQuizReviewResult(null)
          setQuizResult(result)
          setCurrentScreen('quiz-result')

          const saveContext = {
            result,
            userId,
            authLifecycleGeneration,
            studySetId: quizConfig.studySetId,
          }
          setPendingQuizSave(saveContext)
          void saveQuizResultInBackground(saveContext)

          return true
        }}
      />
    )
  } else if (currentScreen === 'quiz-result') {
    screenContent = (
      <QuizResultScreen
        result={quizResult}
        config={quizConfig}
        saveState={quizResultSaveState}
        saveError={quizResultSaveError}
        onRetrySave={() => {
          if (pendingQuizSave && quizResultSaveState !== 'saving') {
            void saveQuizResultInBackground(pendingQuizSave)
          }
        }}
        onReviewAnswers={() => {
          setQuizReviewResult(quizResult)
          setCurrentScreen('quiz-session')
        }}
        onTryAgain={() => {
          setQuizReviewResult(null)
          setCurrentScreen('quiz-session')
        }}
        onBack={() => setCurrentScreen('home')}
      />
    )
  } else if (currentScreen === 'subject-selection') {
    screenContent = (
      <SubjectSelectionScreen
        subjects={goalData.subjects}
        onBack={() => setCurrentScreen(subjectSelectionReturnScreen)}
        onContinue={handleSubjectContinue}
        onCreateSubject={async () => {
          if (!(await ensureGoalPreferencesLoaded(authenticatedUserIdRef.current))) {
            Alert.alert('Study preferences unavailable', 'Please try again after your saved study preferences load.')
            return
          }
          setSubjectsReturnScreen('subject-selection')
          setCurrentScreen('subjects')
        }}
      />
    )
  } else if (currentScreen === 'study-history') {
    screenContent = (
      <StudyHistoryScreen
        sessions={studySessions}
        sessionsReady={sessionsReady}
        sessionsLoadState={sessionsLoadState}
        sessionsLoadError={sessionsLoadError}
        onRetry={loadSessions}
        onBack={() => setCurrentScreen('home')}
      />
    )
  } else if (currentScreen === 'analytics') {
    screenContent = (
      <AnalyticsScreen
        sessions={studySessions}
        sessionsLoadState={sessionsLoadState}
        sessionsLoadError={sessionsLoadError}
        dailyTargetMinutes={goalData.dailyTargetMinutes}
        todayMetrics={todayMetrics}
        onRetry={loadSessions}
        onBack={() => setCurrentScreen('home')}
      />
    )
  } else if (currentScreen === 'profile-settings') {
    screenContent = (
      <ProfileSettingsScreen
        profile={profileData}
        dailyTargetMinutes={goalData.dailyTargetMinutes}
        studyDays={goalData.studyDays}
        subjects={goalData.subjects}
        notificationsEnabled={notificationsEnabled}
        onBack={() => setCurrentScreen('home')}
        onEditProfile={() => setCurrentScreen('edit-profile')}
        onOpenSubjects={async () => {
          if (!(await ensureGoalPreferencesLoaded(authenticatedUserIdRef.current))) {
            Alert.alert('Study preferences unavailable', 'Please try again after your saved study preferences load.')
            return
          }
          setSubjectsReturnScreen('profile-settings')
          setCurrentScreen('subjects')
        }}
        onGoalChange={persistDailyTarget}
        onStudyDaysChange={persistStudyDays}
        onNotificationsChange={setNotificationsEnabled}
        onSignOut={async () => {
          const { error } = await supabase.auth.signOut({ scope: 'local' })
          if (error) {
            Alert.alert('Could not sign out', error.message)
            return
          }
          resetProfile()
          setCurrentScreen('welcome')
        }}
      />
    )
  } else if (currentScreen === 'subjects') {
    screenContent = (
      <SubjectsScreen
        subjects={goalData.subjects}
        onBack={() => setCurrentScreen(subjectsReturnScreen)}
        onChange={persistSubjects}
      />
    )
  } else if (currentScreen === 'edit-profile') {
    screenContent = (
      <EditProfileScreen
        profile={profileData}
        onBack={() => setCurrentScreen('profile-settings')}
        onSave={async (nextProfileData) => {
          const result = await saveAuthenticatedProfile(nextProfileData)
          if (!result.success) return

          setCurrentScreen('profile-settings')
        }}
      />
    )
  } else if (currentScreen === 'qa-library') {
    screenContent = <QaLibraryScreen sets={qaLibrarySets} resultSet={qaResultSet} resultSaveState={qaResultSaveState} canSaveResult={Boolean(quickQASession && !quickQASession.isSaved)} shouldOpenSaveTitleDialog={qaResultTitleDialogRequested} onSaveTitleDialogOpened={() => setQaResultTitleDialogRequested(false)} onSaveResult={async (title) => {
      const session = quickQASession
      if (!session || session.isSaved || !isCurrentQuickQASession(session)) {
        throw new Error('This Q&A session is no longer available to save.')
      }

      setQaResultSaveState('saving')
      try {
        const savedResultSet = await saveTemporaryQaSession(session, title)
        if (!savedResultSet || !isCurrentQuickQASession(session)) {
          throw new Error('Could not confirm that your Q&A was saved.')
        }

        setQaResultSet(savedResultSet)
        setQaLibrarySets((currentSets) => [
          savedResultSet,
          ...currentSets.filter((currentSet) => currentSet.id !== savedResultSet.id),
        ])
        setQaResultSaveState('saved')
        return true
      } catch (error) {
        if (isCurrentQuickQASession(session)) setQaResultSaveState('error')
        throw error
      }
    }} onRenameSet={renameQaLibrarySet} onDeleteSet={deleteQaLibrarySet} onBack={() => { setQaResultSet(null); setQaResultTitleDialogRequested(false); setCurrentScreen('home') }} onResultBack={() => { setQaResultSet(null); setQaResultTitleDialogRequested(false); void loadQaLibrary().catch((error) => Alert.alert('Could not load Q&A', error.message || 'Please try again.')) }} onResults={(set) => { setQaResultSaveState('idle'); setQaResultTitleDialogRequested(false); setQaResultSet(set) }} onOpen={(set, mode) => {
      const answeredIds = new Set(set.attempts.map((attempt) => attempt.question_id))
      const firstUnanswered = set.questions.findIndex((question) => !answeredIds.has(question.id))
      setQuickQASession({ ownerUserId: authenticatedUserIdRef.current, authLifecycleGeneration: authLifecycleGenerationRef.current, sessionId: createQuickQaSessionId(), isSaved: true, studySetId: set.id, title: set.title, questions: set.questions, attempts: set.attempts, resumeIndex: mode === 'resume' && firstUnanswered >= 0 ? firstUnanswered : 0 })
      setQaResultSaveState('saved')
      setCurrentScreen('quick-qa')
    }} />
  } else if (currentScreen === 'quick-qa') {
    screenContent = (
      <QuickQAScreen
        subjects={goalData.subjects}
        generatedQuestions={quickQASession?.questions}
        initialQuestionIndex={Math.max(0, quickQASession?.resumeIndex || 0)}
        isSessionCurrent={() => isCurrentQuickQASession(quickQASession)}
        onSaveAttempt={quickQASession?.isSaved ? async (attempt) => {
          const session = quickQASession
          if (!isCurrentQuickQASession(session)) return false

          if (!session.isSaved) return false

          try {
            await saveQaAttemptForUser(session.ownerUserId, attempt)
            setQuickQASession((currentSession) => {
              if (!isCurrentQuickQASession(currentSession) || currentSession?.studySetId !== session.studySetId) return currentSession
              const attempts = currentSession.attempts.filter((item) => item.question_id !== attempt.questionId)
              return { ...currentSession, attempts: [...attempts, { ...attempt, question_id: attempt.questionId }] }
            })
            return isCurrentQuickQASession(session)
          } catch (error) {
            if (!isCurrentQuickQASession(session)) return false
            throw error
          }
        } : undefined}
        onRecordAttempt={(attempt) => {
          const session = quickQASession
          if (!isCurrentQuickQASession(session) || session.isSaved) return false

          setQuickQASession((currentSession) => {
            if (!isCurrentQuickQASession(currentSession)) return currentSession
            const attempts = currentSession.attempts.filter((item) => item.questionIndex !== attempt.questionIndex)
            return { ...currentSession, attempts: [...attempts, attempt] }
          })
          return true
        }}
        onFinish={() => {
          const session = quickQASession
          if (!session) return setCurrentScreen('home')
          const resultPreview = createQaResultPreview(session)
          setQaResultSet(resultPreview)
          if (session.isSaved) {
            setQaResultSaveState('saved')
            setCurrentScreen('qa-library')
            return
          }
          setQaResultSaveState('idle')
          setCurrentScreen('qa-library')
        }}
        isSavedSession={Boolean(quickQASession?.isSaved)}
        onBack={() => setCurrentScreen('home')}
        onExitSaved={() => {
          const session = quickQASession
          if (!session?.isSaved) return setCurrentScreen('home')
          setQaResultSet(null)
          void loadQaLibrary().finally(() => setCurrentScreen('qa-library'))
        }}
        onExitSave={() => {
          const session = quickQASession
          if (!session || session.isSaved) return
          setQaResultSet(createQaResultPreview(session))
          setQaResultSaveState('idle')
          setQaResultTitleDialogRequested(true)
          setCurrentScreen('qa-library')
        }}
        onExitDiscard={() => {
          const session = quickQASession
          if (pendingTemporaryQaSetRef.current?.sessionId === session?.sessionId) {
            pendingTemporaryQaSetRef.current = null
          }
          setQuickQASession(null)
          setCurrentScreen('home')
        }}
      />
    )
  } else if (currentScreen === 'session-complete') {
    screenContent = (
      <SessionCompleteScreen
        sessionData={sessionResult}
        onDone={() => setCurrentScreen('home')}
        onStartAnother={() => handleStartStudy('session-complete')}
      />
    )} else if (currentScreen === 'timer') {
    screenContent = (
      <StudyTimerScreen
        subjectName={selectedSubjectName || 'General Study'}
        initialMinutes={25}
        todayStudySeconds={todayMetrics.studySeconds}
        dailyTargetSeconds={todayMetrics.targetSeconds}
        onBack={() => setCurrentScreen('home')}
        onFinish={handleSessionFinish}
      />
    )} else if (currentScreen === 'home') {
    screenContent = (
      <HomeScreen
        userName={profileData.fullName || profileName}
        avatarUri={profileData.avatarUri}
        todayStudyLabel={todayMetrics.studyLabel}
        dailyGoalLabel={todayMetrics.goalLabel}
        todayRemainingLabel={todayMetrics.remainingLabel}
        todaySessionCount={todayMetrics.sessionCount}
        dailyProgressPercent={todayMetrics.progressPercent}
        studyStreakDays={homeMetrics.streakDays}
        quizAverage={homeMetrics.quizAverage}
        todaySubjects={homeMetrics.todaySubjects}
        onProfile={async () => {
          if (!(await ensureGoalPreferencesLoaded(authenticatedUserIdRef.current))) {
            Alert.alert('Study preferences unavailable', 'Please try again after your saved study preferences load.')
            return
          }
          setCurrentScreen('profile-settings')
        }}
        onStartFocus={() => handleStartStudy('home')}
        onViewStudy={() => setCurrentScreen('study-history')}
        onGenerateQuiz={() => setCurrentScreen('quiz-upload')}
        onFlashcards={() => setCurrentScreen('flashcards')}
        onQuickQA={async () => { try { await loadQaLibrary(); setCurrentScreen('qa-library') } catch (error) { Alert.alert('Could not load Q&A', error.message || 'Please try again.') } }}
        onAnalytics={() => setCurrentScreen('analytics')}
      />
    )
  } else if (currentScreen === 'verification') {
    screenContent = (
      <VerificationScreen
        email={verificationEmail}
        onBack={() => setCurrentScreen('signup')}
        onVerify={async (code) => {
          const { error } = await supabase.auth.verifyOtp({
            email: verificationEmail,
            token: code,
            type: 'signup',
          })

          if (error) {
            throw error
          }

          setCurrentScreen('profile')
        }}
        onResend={async () => {
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email: verificationEmail,
          })

          if (error) return { success: false, error }
          return { success: true }
        }}
      />
    )
  } else if (currentScreen == 'complete'){
    screenContent = (
      <SetupCompleteScreen
        dailyTargetMinutes={goalData.dailyTargetMinutes}
        onStartStudying={() => setCurrentScreen('home')}
      />
    )

  } else if (currentScreen === 'goal') {
    screenContent = (
      <GoalSetupScreen
        onBack={() => setCurrentScreen('profile')}
        onFinish={async (newGoalData) => {
          const saved = await persistOnboardingGoal(newGoalData)
          if (!saved) return
          setCurrentScreen('complete')
        }}
      />
    )
  } else if (currentScreen === 'profile') {
    screenContent = (
      <ProfileSetupScreen
        initialName={profileName}
        initialAvatarUri={profileData.avatarUri}
        onBack={() => setCurrentScreen('verification')}
        onContinue={async (nextProfileData) => {
          console.log('Profile setup complete', nextProfileData)
          const result = await saveAuthenticatedProfile(nextProfileData)
          if (!result.success) return

          setCurrentScreen('goal')
        }}
        onUpload={(avatarUri) => {
          profileLoadGenerationRef.current += 1
          setProfileData((currentProfileData) => ({
            ...currentProfileData,
            avatarUri,
          }))
        }}
      />
    )
  } else if (currentScreen === 'signup') {
    screenContent = (
      <SignUpScreen
        onBack={() => setCurrentScreen('welcome')}
        onSignIn={() => setCurrentScreen('login')}
        onCreateAccount={async (formData) => {
          const fullName = formData.fullName.trim()
          const email = formData.email.trim().toLowerCase()

          if (!isValidFullName(fullName) || !isValidEmail(email) || !formData.password) {
            Alert.alert('Complete your details', 'Enter your full name, email, and password.')
            return
          }
          if (!isValidPassword(formData.password)) {
            Alert.alert(
              'Choose a stronger password',
              'Your password must be at least 8 characters and include at least 1 special character.',
            )
            return
          }
          if (formData.password !== formData.confirmPassword) {
            Alert.alert('Passwords do not match', 'Enter the same password in both fields.')
            return
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password: formData.password,
            options: { data: { full_name: fullName } },
          })

          if (error) {
            Alert.alert('Could not create account', error.message)
            return
          }

          if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
            Alert.alert(
              'ไม่สามารถสร้างบัญชีได้',
              'ไม่สามารถสร้างบัญชีด้วยอีเมลนี้ได้ โปรดเข้าสู่ระบบหรือใช้อีเมลอื่น',
            )
            return
          }

          setProfileName(fullName)
          setProfileData((currentProfileData) => ({
            ...currentProfileData,
            fullName,
          }))
          setVerificationEmail(email)
          setCurrentScreen('verification')
        }}
        onContinueWithApple={() => console.log('Continue with Apple')}
        onContinueWithGoogle={() => console.log('Continue with Google')}
      />
    )
  } else if (currentScreen === 'login') {
    screenContent = (
      <LoginScreen
        onBack={() => setCurrentScreen('welcome')}
        onSignUp={() => setCurrentScreen('signup')}
        onLogin={async ({ email, password }) => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          })

          if (error) {
            if ([
              'invalid_credentials',
              'email_address_invalid',
              'validation_failed',
              'weak_password',
            ].includes(error.code)) {
              Alert.alert(
                'เข้าสู่ระบบไม่สำเร็จ',
                'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
              )
              return
            }

            Alert.alert('Could not sign in', error.message)
            return
          }

          if (!data?.user?.id) {
            Alert.alert('Could not sign in', 'The signed-in account could not be loaded. Please try again.')
            return
          }

          const loginUserId = data.user.id
          const loginLifecycleGeneration = authLifecycleGenerationRef.current
          const restoredData = await restoreAuthenticatedProfile(data.user)

          if (
            authLifecycleGenerationRef.current !== loginLifecycleGeneration
            || authenticatedUserIdRef.current !== loginUserId
          ) return

          if (!restoredData) {
            Alert.alert('Could not load account setup', 'Check your connection and try signing in again.')
            return
          }

          setCurrentScreen(getAuthenticatedDestination(restoredData))
        }}
        onForgotPassword={() => console.log('Forgot password')}
        onContinueWithApple={() => console.log('Continue with Apple')}
        onContinueWithGoogle={() => console.log('Continue with Google')}
      />
    )
  } else {
    screenContent = (
      <WelcomeScreen
        onGetStarted={() => setCurrentScreen('signup')}
        onLogin={() => setCurrentScreen('login')}
      />
    )
  }

  const screenTranslateX = screenTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [screenWidth, 0],
  })

  if (!isAppReady) return null

  return (
    <SafeAreaProvider>
      <View style={styles.transitionHost}>
        <Animated.View
          style={[
            styles.screenTransition,
            { transform: [{ translateX: screenTranslateX }] },
          ]}
        >
          {screenContent}
        </Animated.View>
      </View>
    </SafeAreaProvider>
  )
}
