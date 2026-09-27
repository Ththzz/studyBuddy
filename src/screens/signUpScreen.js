import React, { useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
  } from 'react-native';
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/signUpScreenStyles';
import {
  isValidEmail,
  isValidFullName,
  isValidPassword,
} from '../utils/authValidation';

  function FormField({
    label,
    placeholder,
    value,
    onChangeText,
    onBlur,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
  }) {
    return (
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>

        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder={placeholder}
          placeholderTextColor="#AEB8AE"
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          accessibilityHint={error || undefined}
        />
        {error ? (
          <Text style={styles.fieldError} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </View>
    );
  }

  export default function SignUpScreen({
    onBack,
    onSignIn,
    onCreateAccount,
    onContinueWithApple,
    onContinueWithGoogle,
  }) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] =
    useState('');
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [hasAttemptedCreate, setHasAttemptedCreate] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});
    const isCreatingAccountRef = useRef(false);

    const shouldShowError = (fieldName) =>
      hasAttemptedCreate || touchedFields[fieldName];

    const fullNameError = shouldShowError('fullName') &&
      !isValidFullName(fullName)
      ? 'Full name can contain letters and spaces only.'
      : '';
    const emailError = shouldShowError('email') && !isValidEmail(email)
      ? 'Enter a valid email address.'
      : '';
    const passwordError = shouldShowError('password') &&
      !isValidPassword(password)
      ? 'Password must be at least 8 characters and include at least 1 special character.'
      : '';
    const confirmPasswordError = shouldShowError('confirmPassword')
      ? !confirmPassword
        ? 'Please repeat your password.'
        : confirmPassword !== password
          ? 'Passwords do not match.'
          : ''
      : '';

    const handleCreateAccount = async () => {
      if (isCreatingAccountRef.current) return;

      setHasAttemptedCreate(true);

      if (
        !isValidFullName(fullName) ||
        !isValidEmail(email) ||
        !isValidPassword(password) ||
        !confirmPassword ||
        confirmPassword !== password
      ) {
        return;
      }

      isCreatingAccountRef.current = true;
      setIsCreatingAccount(true);

      try {
        await onCreateAccount?.({
          fullName,
          email,
          password,
          confirmPassword,
        });
      } catch (error) {
        Alert.alert(
          'Could not create account',
          error?.message || 'Something went wrong. Please try again.',
        );
      } finally {
        isCreatingAccountRef.current = false;
        setIsCreatingAccount(false);
      }
    };

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' :
          undefined}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces
            alwaysBounceVertical
            overScrollMode="always"
          >
            <View style={styles.header}>
              <Pressable
                style={styles.backButton}
                onPress={onBack}
                accessibilityLabel="Go back"
              >
                <Text style={styles.backIcon}>‹</Text>
              </Pressable>

              <Text style={styles.headerTitle}>CREATE
              ACCOUNT</Text>
            </View>

            <Text style={styles.title}>Start your study
            rhythm.</Text>

            <Text style={styles.description}>
              Create an account and we’ll help you make
              progress that sticks.
            </Text>

            <View style={styles.form}>
              <FormField
                label="Full name"
                placeholder="Alex Morgan"
                value={fullName}
                onChangeText={(value) => {
                  setFullName(value);
                  setTouchedFields((current) => ({
                    ...current,
                    fullName: true,
                  }));
                }}
                onBlur={() => setTouchedFields((current) => ({
                  ...current,
                  fullName: true,
                }))}
                error={fullNameError}
                autoCapitalize="words"
              />

              <FormField
                label="Email"
                placeholder="alex@example.com"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setTouchedFields((current) => ({
                    ...current,
                    email: true,
                  }));
                }}
                onBlur={() => setTouchedFields((current) => ({
                  ...current,
                  email: true,
                }))}
                error={emailError}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FormField
                label="Password"
                placeholder="At least 8 characters"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setTouchedFields((current) => ({
                    ...current,
                    password: true,
                  }));
                }}
                onBlur={() => setTouchedFields((current) => ({
                  ...current,
                  password: true,
                }))}
                error={passwordError}
                secureTextEntry
                autoCapitalize="none"
              />

              <FormField
                label="Confirm password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  setTouchedFields((current) => ({
                    ...current,
                    confirmPassword: true,
                  }));
                }}
                onBlur={() => setTouchedFields((current) => ({
                  ...current,
                  confirmPassword: true,
                }))}
                error={confirmPasswordError}
                secureTextEntry
                autoCapitalize="none"
              />

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
                disabled={isCreatingAccount}
                onPress={() => { void handleCreateAccount(); }}
              >
                <Text style={styles.primaryButtonText}
                >Create Account</Text>
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or
                continue with</Text>
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
                <Text style={styles.socialText}
                >Continue with Apple</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.socialButton,
                  pressed && styles.pressed,
                ]}
                onPress={onContinueWithGoogle}
              >
                <Text style={styles.googleIcon}>G</
                Text>
                <Text style={styles.socialText}
                >Continue with Google</Text>
              </Pressable>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Already have an account?
                </Text>

                <Pressable onPress={onSignIn}>
                  <Text style={styles.footerLink}> Sign
                  in</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
