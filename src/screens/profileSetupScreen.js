import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/profileSetupScreenStyles';

const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Other'];

function FormField({ label, value, placeholder, onChangeText }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#A4ACA4"
        onChangeText={onChangeText}
        autoCapitalize="words"
      />
    </View>
  );
}

export default function ProfileSetupScreen({
  initialName = 'Alex',
  onBack,
  onContinue,
  onUpload,
}) {
  const [fullName, setFullName] = useState(initialName);
  const [university, setUniversity] = useState('PSU');
  const [major, setMajor] = useState('Computer Science');
  const [year, setYear] = useState('Year 2');
  const [hasPhoto, setHasPhoto] = useState(false);

  const handleUpload = () => {
    setHasPhoto(true);
    onUpload?.();
  };

  const handleContinue = () => {
    onContinue?.({
      fullName: fullName.trim(),
      university: university.trim(),
      major: major.trim(),
      year,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

            <Text style={styles.stepLabel}>STEP 2 OF 4</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.stepper}>
            <View style={[styles.step, styles.stepActive]} />
            <View style={[styles.step, styles.stepActive]} />
            <View style={styles.step} />
            <View style={styles.step} />
          </View>

          <Text style={styles.title}>Tell us about yourself</Text>

          <Text style={styles.description}>
            This helps Study Buddy personalize your study experience.
          </Text>

          <View style={styles.form}>
            <View style={styles.profileUpload}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {hasPhoto ? '✓' : fullName.trim().charAt(0).toUpperCase() || 'A'}
                </Text>
              </View>

              <View style={styles.uploadCopy}>
                <Text style={styles.uploadTitle}>Profile picture</Text>
                <Text style={styles.uploadDescription}>
                  {hasPhoto ? 'Ready to use' : 'Optional — make it yours'}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.uploadButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleUpload}
              >
                <Text style={styles.uploadButtonText}>
                  {hasPhoto ? 'Change' : 'Upload'}
                </Text>
              </Pressable>
            </View>

            <FormField
              label="Full name"
              value={fullName}
              placeholder="Alex"
              onChangeText={setFullName}
            />

            <FormField
              label="University / School"
              value={university}
              placeholder="Your university"
              onChangeText={setUniversity}
            />

            <FormField
              label="Major / Field of study"
              value={major}
              placeholder="Computer Science"
              onChangeText={setMajor}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Current year</Text>

              <View style={styles.yearGrid}>
                {YEAR_OPTIONS.map((option) => {
                  const isActive = year === option;

                  return (
                    <Pressable
                      key={option}
                      style={({ pressed }) => [
                        styles.yearChoice,
                        isActive && styles.yearChoiceActive,
                        pressed && styles.pressedChoice,
                      ]}
                      onPress={() => setYear(option)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text
                        style={[
                          styles.yearChoiceText,
                          isActive && styles.yearChoiceTextActive,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
              onPress={handleContinue}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
