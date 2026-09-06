import React, { useState } from 'react';
import {
  Keyboard,
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
import LineIcon from '../components/lineIcon';
import styles from '../styles/goalSetupScreenStyles';

const GOAL_OPTIONS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hours', minutes: 90 },
  { label: '2 hours', minutes: 120 },
  { label: '3 hours', minutes: 180 },
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const SUBJECTS = [
  'Computer Networks',
  'Database',
  'Artificial Intelligence',
  'Software Engineering',
];

function formatGoal(minutes) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  return `${minutes} min`;
}

export default function GoalSetupScreen({ onBack, onFinish }) {
  const [goalMinutes, setGoalMinutes] = useState(120);
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4]);
  const [selectedSubjects, setSelectedSubjects] = useState([
    'Computer Networks',
    'Database',
    'Artificial Intelligence',
  ]);
  const [customGoalOpen, setCustomGoalOpen] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState('120');
  const [customGoalError, setCustomGoalError] = useState('');

  const toggleDay = (index) => {
    setSelectedDays((currentDays) =>
      currentDays.includes(index)
        ? currentDays.filter((day) => day !== index)
        : [...currentDays, index].sort(),
    );
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects((currentSubjects) =>
      currentSubjects.includes(subject)
        ? currentSubjects.filter((item) => item !== subject)
        : [...currentSubjects, subject],
    );
  };

  const handleCustomGoal = () => {
    const minutes = Number(customGoalInput);

    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600) {
      setCustomGoalError('Choose a whole number from 1 to 600 minutes.');
      return;
    }

    setGoalMinutes(minutes);
    setCustomGoalOpen(false);
    setCustomGoalError('');
    Keyboard.dismiss();
  };

  const handleFinish = () => {
    onFinish?.({
      dailyTargetMinutes: goalMinutes,
      studyDays: selectedDays,
      subjects: selectedSubjects,
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

            <Text style={styles.stepLabel}>STEP 3 OF 4</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.stepper}>
            <View style={[styles.step, styles.stepActive]} />
            <View style={[styles.step, styles.stepActive]} />
            <View style={[styles.step, styles.stepActive]} />
            <View style={styles.step} />
          </View>

          <Text style={styles.title}>Set your study goal</Text>

          <Text style={styles.description}>
            Choose how much time you’d like to study each day.
          </Text>

          <View style={styles.goalSummary}>
            <Text style={styles.goalEyebrow}>YOUR GOAL</Text>
            <View style={styles.goalValueRow}>
              <Text style={styles.goalValue}>{formatGoal(goalMinutes)}</Text>
              <Text style={styles.goalUnit}>/ day</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Daily study time</Text>

            <View style={styles.goalGrid}>
              {GOAL_OPTIONS.map((option) => {
                const isActive = goalMinutes === option.minutes;

                return (
                  <Pressable
                    key={option.minutes}
                    style={({ pressed }) => [
                      styles.goalChoice,
                      isActive && styles.goalChoiceActive,
                      pressed && styles.pressedChoice,
                    ]}
                    onPress={() => {
                      setGoalMinutes(option.minutes);
                      setCustomGoalOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text
                      style={[
                        styles.goalChoiceText,
                        isActive && styles.goalChoiceTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.customGoalButton,
                pressed && styles.pressedChoice,
              ]}
              onPress={() => {
                setCustomGoalOpen((current) => !current);
                setCustomGoalError('');
              }}
            >
              <Text style={styles.customGoalText}>Custom Goal</Text>
            </Pressable>

            {customGoalOpen ? (
              <View style={styles.customGoalEditor}>
                <Text style={styles.customGoalLabel}>Minutes</Text>
                <TextInput
                  style={styles.customGoalInput}
                  value={customGoalInput}
                  onChangeText={(value) => {
                    setCustomGoalInput(value.replace(/[^0-9]/g, ''));
                    setCustomGoalError('');
                  }}
                  keyboardType="number-pad"
                  maxLength={3}
                  inputMode="numeric"
                  textAlign="center"
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.customGoalSave,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleCustomGoal}
                >
                  <Text style={styles.customGoalSaveText}>Set</Text>
                </Pressable>
                {customGoalError ? (
                  <Text style={styles.customGoalError}>{customGoalError}</Text>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Study days</Text>

            <View style={styles.dayRow}>
              {DAYS.map((day, index) => {
                const isActive = selectedDays.includes(index);

                return (
                  <Pressable
                    key={`${day}-${index}`}
                    style={({ pressed }) => [
                      styles.dayChoice,
                      isActive && styles.dayChoiceActive,
                      pressed && styles.pressedChoice,
                    ]}
                    onPress={() => toggleDay(index)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text
                      style={[
                        styles.dayChoiceText,
                        isActive && styles.dayChoiceTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Main subjects</Text>

            <View style={styles.subjectChips}>
              {SUBJECTS.map((subject) => {
                const isActive = selectedSubjects.includes(subject);

                return (
                  <Pressable
                    key={subject}
                    style={({ pressed }) => [
                      styles.subjectChip,
                      isActive && styles.subjectChipActive,
                      pressed && styles.pressedChoice,
                    ]}
                    onPress={() => toggleSubject(subject)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    {isActive ? (
                      <LineIcon name="check" size={14} color="#438C31" />
                    ) : null}
                    <Text
                      style={[
                        styles.subjectChipText,
                        isActive && styles.subjectChipTextActive,
                      ]}
                    >
                      {subject}
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
            onPress={handleFinish}
          >
            <Text style={styles.primaryButtonText}>Finish Setup</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
