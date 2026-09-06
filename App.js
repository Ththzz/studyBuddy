import React, { useState } from 'react'
import WelcomeScreen from './src/screens/welcomeScreen'
import SignUpScreen from './src/screens/signUpScreen'
import LoginScreen from './src/screens/loginScreen'
import VerificationScreen from './src/screens/verificationScreen'
import ProfileSetupScreen from './src/screens/profileSetupScreen'
import GoalSetupScreen from './src/screens/goalSetupScreen'
import HomeScreen from './src/screens/homeScreen'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [verificationEmail, setVerificationEmail] = useState('')
  const [profileName, setProfileName] = useState('Alex')
  let screenContent

  if (currentScreen === 'home') {
    screenContent = (
      <HomeScreen
        onNotifications={() => console.log('Open notifications')}
        onStartFocus={() => console.log('Start study session')}
        onViewStudy={() => console.log("View today's study")}
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
  } else if (currentScreen === 'goal') {
    screenContent = (
      <GoalSetupScreen
        onBack={() => setCurrentScreen('profile')}
        onFinish={(goalData) => {
          console.log('Goal setup complete', goalData)
          setCurrentScreen('home')
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
