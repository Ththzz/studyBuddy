import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import WelcomeScreen from './src/screens/welcomeScreen'
import SignUpScreen from './src/screens/signUpScreen'
import LoginScreen from './src/screens/loginScreen'
import VerificationScreen from './src/screens/verificationScreen'
import ProfileSetupScreen from './src/screens/profileSetupScreen'
import GoalSetupScreen from './src/screens/goalSetupScreen'
import HomeScreen from './src/screens/homeScreen'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import SetupCompleteScreen from './src/screens/setupCompleteScreen'
import StudyTimerScreen from './src/screens/studyTimeScreen'
import SessionCompleteScreen from './src/screens/sessionCompleteScreen'
import StudyHistoryScreen from './src/screens/studyHistoryScreen'
import { loadStudySessions, saveStudySessions } from './src/storage/studySessionStorage'

const STORAGE_LOAD_ERROR_MESSAGE = "We couldn't load your saved study sessions. Please try again."

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
  const progressPercent = Math.min(100, Math.round((studySeconds / targetSeconds) * 100))

  return {
    sessionCount: todaySessions.length,
    studyLabel: formatStudyDuration(studySeconds),
    goalLabel: `of ${formatStudyDuration(targetSeconds)} goal`,
    remainingLabel: remainingSeconds > 0 ? `${formatStudyDuration(remainingSeconds)} left` : 'Goal reached',
    dailyGoalCompleted: studySeconds >= targetSeconds,
    progressPercent,
  }
}


export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [verificationEmail, setVerificationEmail] = useState('')
  const [profileName, setProfileName] = useState('Alex')
  const [goalData, setGoalData] = useState({
    dailyTargetMinutes: 120,
    studyDays: [0,1,2,3,4],
    subjects: [
      'Computer Networks',
      'Database',
      'Artificial Intelligence'
    ]
  })
  const [sessionResult, setSessionResult] = useState(null)
  const [studySessions, setStudySessions] = useState([])
  const [sessionsLoadState, setSessionsLoadState] = useState('loading')
  const [sessionsLoadError, setSessionsLoadError] = useState(null)
  const isSessionsMountedRef = useRef(true)

  const loadSessions = useCallback(async () => {
    setSessionsLoadState('loading')
    setSessionsLoadError(null)

    try {
      const loadResult = await loadStudySessions()

      if (!isSessionsMountedRef.current) return

      if (!loadResult?.success) {
        console.warn(
          'Study sessions could not be loaded; persistence remains disabled',
          loadResult?.error,
        )
        setSessionsLoadError(STORAGE_LOAD_ERROR_MESSAGE)
        setSessionsLoadState('error')
        return
      }

      setStudySessions(Array.isArray(loadResult.sessions) ? loadResult.sessions : [])
      setSessionsLoadError(null)
      setSessionsLoadState('ready')
    } catch (error) {
      if (!isSessionsMountedRef.current) return

      console.warn(
        'Study sessions could not be loaded; persistence remains disabled',
        error,
      )
      setSessionsLoadError(STORAGE_LOAD_ERROR_MESSAGE)
      setSessionsLoadState('error')
    }
  }, [])

  useEffect(() => {
    isSessionsMountedRef.current = true
    void loadSessions()

    return () => {
      isSessionsMountedRef.current = false
    }
  }, [loadSessions])

  useEffect(() => {
    if (sessionsLoadState !== 'ready') return
    void saveStudySessions(studySessions)
  }, [studySessions, sessionsLoadState])

  const todayMetrics = getTodayMetrics(studySessions, goalData.dailyTargetMinutes)
  const sessionsReady = sessionsLoadState === 'ready'

  const handleStartStudy = () => {
    if (sessionsReady) {
      setCurrentScreen('timer')
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

  let screenContent

  const handleSessionFinish = (newSessionResult) => {
    const session = {
      ...newSessionResult,
      id: `${Date.now()}`,
      completedAt: new Date().toISOString(),
    }
    const nextSessions = session.durationSeconds > 0
      ? [...studySessions, session]
      : studySessions
    const nextMetrics = getTodayMetrics(nextSessions, goalData.dailyTargetMinutes)

    setStudySessions(nextSessions)
    setSessionResult({
      ...session,
      dailyProgressLabel: nextMetrics.studyLabel,
      dailyGoalCompleted: nextMetrics.dailyGoalCompleted,
    })
    setCurrentScreen('session-complete')
  }

  if (currentScreen === 'study-history') {
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
  } else if (currentScreen === 'session-complete') {
    screenContent = (
      <SessionCompleteScreen
        sessionData={sessionResult}
        onDone={() => setCurrentScreen('home')}
        onStartAnother={handleStartStudy}
      />
    )} else if (currentScreen === 'timer') {
    screenContent = (
      <StudyTimerScreen
        subjectName="Computer Networks"
        initialMinutes={25}
        todayStudyLabel={todayMetrics.studyLabel}
        dailyGoalLabel={todayMetrics.goalLabel}
        todayRemainingLabel={todayMetrics.remainingLabel}
        todayProgressPercent={todayMetrics.progressPercent}
        onBack={() => setCurrentScreen('home')}
        onFinish={handleSessionFinish}
      />
    )} else if (currentScreen === 'home') {
    screenContent = (
      <HomeScreen
        todayStudyLabel={todayMetrics.studyLabel}
        dailyGoalLabel={todayMetrics.goalLabel}
        todayRemainingLabel={todayMetrics.remainingLabel}
        todaySessionCount={todayMetrics.sessionCount}
        onNotifications={() => console.log('Open notifications')}
        onStartFocus={handleStartStudy}
        onViewStudy={() => setCurrentScreen('study-history')}
        onGenerateQuiz={() => console.log('Generate quiz')}
        onFlashcards={() => console.log('Open flashcards')}
        onQuickQA={() => console.log('Open quick Q&A')}
        onAnalytics={() => console.log('Open analytics')}
      />
    )
  } else if (currentScreen === 'verification') {
    screenContent = (
      <VerificationScreen
        email={verificationEmail}
        onBack={() => setCurrentScreen('signup')}
        onVerify={(code) => {
          console.log('Verification complete', code)
          setCurrentScreen('profile')
        }}
        onResend={() => console.log('Resend verification code')}
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
        onFinish={(newGoalData) => {
          console.log('Goal setup complete', newGoalData)
          setGoalData(newGoalData)
          setCurrentScreen('complete')
        }}
      />
    )
  } else if (currentScreen === 'profile') {
    screenContent = (
      <ProfileSetupScreen
        initialName={profileName}
        onBack={() => setCurrentScreen('verification')}
        onContinue={(profileData) => {
          console.log('Profile setup complete', profileData)
          setCurrentScreen('goal')
        }}
        onUpload={() => console.log('Profile photo picker')}
      />
    )
  } else if (currentScreen === 'signup') {
    screenContent = (
      <SignUpScreen
        onBack={() => setCurrentScreen('welcome')}
        onSignIn={() => setCurrentScreen('login')}
        onCreateAccount={(formData) => {
          console.log('Create account', formData)
          setProfileName(formData.fullName || 'Alex')
          setVerificationEmail(formData.email)
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
        onLogin={({ email }) => {
          console.log('Login attempt', { email })
          setCurrentScreen('home')
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

  return (
    <SafeAreaProvider>
      {screenContent}
    </SafeAreaProvider>
  )
}
