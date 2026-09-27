import React, { useEffect, useRef, useState } from 'react';
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
import styles from '../styles/verificationScreenStyles';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const RESEND_COOLDOWN_MS = RESEND_COOLDOWN_SECONDS * 1000;

export default function VerificationScreen({
  email,
  onBack,
  onVerify,
  onResend,
}) {
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [errorMessage, setErrorMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldownUntil, setResendCooldownUntil] = useState(null);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  const isVerifyingRef = useRef(false);
  const isResendingRef = useRef(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!resendCooldownUntil) {
      setResendCooldownSeconds(0);
      return undefined;
    }

    const updateCooldown = () => {
      const remainingMs = resendCooldownUntil - Date.now();
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      setResendCooldownSeconds(remainingSeconds);

      if (remainingMs <= 0) {
        setResendCooldownUntil(null);
      }
    };

    updateCooldown();
    const intervalId = setInterval(updateCooldown, 250);

    return () => clearInterval(intervalId);
  }, [resendCooldownUntil]);

  const updateDigit = (value, index) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setDigits(nextDigits);
    setErrorMessage('');
    setResendMessage('');

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (
      nativeEvent.key === 'Backspace' &&
      !digits[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (isVerifyingRef.current || isResendingRef.current) return;

    const code = digits.join('');

    if (code.length !== CODE_LENGTH) {
      setErrorMessage('Enter the 6-digit code to continue.');
      return;
    }

    isVerifyingRef.current = true;
    setIsVerifying(true);

    try {
      await onVerify?.(code);
    } catch (error) {
      setErrorMessage(
        error?.message || 'Verification failed. Please try again.',
      );
    } finally {
      isVerifyingRef.current = false;
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (
      isResendingRef.current ||
      isVerifyingRef.current ||
      (resendCooldownUntil && resendCooldownUntil > Date.now())
    ) {
      return;
    }

    isResendingRef.current = true;
    setIsResending(true);
    setErrorMessage('');
    setResendMessage('');

    try {
      const result = await onResend?.();
      const returnedError = typeof result === 'string'
        ? result
        : result === false
          ? 'Could not resend code. Please try again.'
          : result instanceof Error
            ? result
            : result?.error || (result?.success === false ? 'Could not resend code. Please try again.' : null);

      if (returnedError) {
        const message = typeof returnedError === 'string'
          ? returnedError
          : returnedError?.message;
        setErrorMessage(message || 'Could not resend code. Please try again.');
        return;
      }

      setDigits(Array(CODE_LENGTH).fill(''));
      setResendMessage('A new code is on its way.');
      setResendCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
      setResendCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      inputRefs.current[0]?.focus();
    } catch (error) {
      setErrorMessage(error?.message || 'Could not resend code. Please try again.');
    } finally {
      isResendingRef.current = false;
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressedSmall,
              ]}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>

            <Text style={styles.stepLabel}>STEP 1 OF 4</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.authContent}>
            <View style={styles.successBurst}>
              <Text style={styles.successBurstText}>@</Text>
            </View>

            <Text style={styles.title}>Verify your account</Text>

            <Text style={styles.description}>
              We sent a verification code to your email. Enter it below to
              continue.
            </Text>

            {email ? <Text style={styles.emailHint}>{email}</Text> : null}

            <View style={styles.form}>
              <View style={styles.otpRow}>
                {digits.map((digit, index) => (
                  <TextInput
                    key={`otp-${index}`}
                    ref={(input) => {
                      inputRefs.current[index] = input;
                    }}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                    ]}
                    value={digit}
                    onChangeText={(value) => updateDigit(value, index)}
                    onKeyPress={(event) => handleKeyPress(event, index)}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    textAlign="center"
                    accessibilityLabel={`Code digit ${index + 1}`}
                  />
                ))}
              </View>

              <Text style={styles.errorText} accessibilityRole="alert">
                {errorMessage}
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
                disabled={isVerifying || isResending}
                onPress={() => { void handleVerify(); }}
              >
                <Text style={styles.primaryButtonText}>Verify</Text>
              </Pressable>
            </View>

            <View style={styles.resendRow}>
              <Text style={styles.resendPrompt}>Didn’t get it?</Text>
              <Pressable
                style={({ pressed }) => [
                  pressed && styles.pressedLink,
                  (isResending || isVerifying || resendCooldownSeconds > 0) &&
                    styles.disabledResendLink,
                ]}
                disabled={
                  isResending || isVerifying || resendCooldownSeconds > 0
                }
                onPress={() => { void handleResend(); }}
              >
                <Text style={styles.resendLink}>
                  {resendCooldownSeconds > 0
                    ? `Resend Code (${resendCooldownSeconds}s)`
                    : 'Resend Code'}
                </Text>
              </Pressable>
            </View>

            {resendMessage ? (
              <Text style={styles.resendMessage}>{resendMessage}</Text>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
