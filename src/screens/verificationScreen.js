import React, { useRef, useState } from 'react';
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

export default function VerificationScreen({
  email,
  onBack,
  onVerify,
  onResend,
}) {
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [errorMessage, setErrorMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const inputRefs = useRef([]);

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

  const handleVerify = () => {
    const code = digits.join('');

    if (code.length !== CODE_LENGTH) {
      setErrorMessage('Enter the 6-digit code to continue.');
      return;
    }

    if (code === '000000') {
      setErrorMessage('That code is invalid. Try again.');
      return;
    }

    if (code === '999999') {
      setErrorMessage('This code has expired. Resend a new one.');
      return;
    }

    onVerify?.(code);
  };

  const handleResend = () => {
    setDigits(Array(CODE_LENGTH).fill(''));
    setErrorMessage('');
    setResendMessage('A new code is on its way.');
    inputRefs.current[0]?.focus();
    onResend?.();
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
                onPress={handleVerify}
              >
                <Text style={styles.primaryButtonText}>Verify</Text>
              </Pressable>
            </View>

            <View style={styles.resendRow}>
              <Text style={styles.resendPrompt}>Didn’t get it?</Text>
              <Pressable
                style={({ pressed }) => pressed && styles.pressedLink}
                onPress={handleResend}
              >
                <Text style={styles.resendLink}>Resend Code</Text>
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
