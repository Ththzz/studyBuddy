import React, { use, useState } from "react";
import {
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

    const handleCreateAccount = () => {
      onCreateAccount?.({
        fullName,
        email,
        password,
        confirmPassword,
      });
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
            bounces={false}
            alwaysBounceVertical={false}
            overScrollMode="never"
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
                onChangeText={setFullName}
                autoCapitalize="words"
              />

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
                placeholder="At least 8 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <FormField
                label="Confirm password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleCreateAccount}
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
