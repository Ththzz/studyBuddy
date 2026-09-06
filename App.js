import React, { useState } from 'react'
import WelcomeScreen from './src/screens/welcomeScreen'
import SignUpScreen from './src/screens/signUpScreen'
import LoginScreen from './src/screens/loginScreen'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome')
  let screenContent

  if (currentScreen === 'signup') {
    screenContent = (
      <SignUpScreen
        onBack={() => setCurrentScreen('welcome')}
        onSignIn={() => setCurrentScreen('login')}
        onCreateAccount={(formData) => {
          console.log('Create account', formData)
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
