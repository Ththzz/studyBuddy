import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/loginScreenStyles';

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#AEB8AE"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

export default function LoginScreen({
  onBack,
  onSignUp,
  onLogin,
  onForgotPassword,
  onContinueWithApple,
  onContinueWithGoogle,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    onLogin?.({ email, password });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={onBack}
              accessibilityLabel="Go back"
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>

            <Text style={styles.headerTitle}>WELCOME BACK</Text>
          </View>

          <Text style={styles.title}>Pick up where you left off.</Text>

          <Text style={styles.description}>
            Your next focused session is waiting.
          </Text>

          <View style={styles.form}>
            <FormField
              label="Email"
              placeholder="alex@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormField
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Pressable
              style={({ pressed }) => [
                styles.forgotButton,
                pressed && styles.pressedLink,
              ]}
              onPress={onForgotPassword}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
              onPress={handleLogin}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.pressed,
              ]}
              onPress={onContinueWithApple}
            >
              <Text style={styles.appleIcon}></Text>
              <Text style={styles.socialText}>Continue with Apple</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.pressed,
              ]}
              onPress={onContinueWithGoogle}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.socialText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don’t have an account?</Text>

              <Pressable
                style={({ pressed }) => pressed && styles.pressedLink}
                onPress={onSignUp}
              >
                <Text style={styles.footerLink}> Create Account</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
