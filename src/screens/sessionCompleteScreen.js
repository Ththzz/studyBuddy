import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/sessionCompleteScreenStyles'

function formatDuration(totalSeconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  const parts = [
    hours > 0 ? `${hours}h` : null,
    minutes > 0 ? `${minutes}m` : null,
    seconds > 0 ? `${seconds}s` : null,
  ].filter(Boolean)

  if (parts.length > 0) {
    if (hours === 0 && seconds === 0) return `${minutes} min`
    return parts.join(' ')
  }

  return '0 sec'
}

export default function SessionCompleteScreen({
  sessionData,
  onDone,
  onStartAnother,
  onTakeBreak,
}) {
  const subjectName = sessionData?.subjectName || 'Study session'
  const durationLabel = formatDuration(sessionData?.durationSeconds)
  const completed = sessionData?.completed
  const dailyGoalCompleted = sessionData?.dailyGoalCompleted === true
  const dailyProgressLabel = sessionData?.dailyProgressLabel || '2h 10m'

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.completeScreen}>
          <View style={styles.successBurst}>
            <LineIcon name="check" size={47} color="#438C31" />
          </View>

          <Text style={styles.eyebrow}>Focus session finished</Text>

          <Text style={styles.title}>Session Complete</Text>

          <Text style={styles.bodyCopy}>
            {completed
              ? `Nice work. You protected your focus for another ${durationLabel}.`
              : `You focused for ${durationLabel}. Every minute counts.`}
          </Text>

          <View style={styles.summaryCard}>
            <View style={styles.metricRow}>
              <View style={styles.metricLabel}>
                <Text style={styles.metricTitle}>Time studied</Text>
                <Text style={styles.metricHint}>{subjectName}</Text>
              </View>
  
              <Text style={styles.metricScore}>{durationLabel}</Text>
            </View>
  
            <View style={[styles.metricRow, styles.metricRowBorder]}>
              <View style={styles.metricLabel}>
                <Text style={styles.metricTitle}>Daily progress</Text>
                <Text style={styles.metricHint}>Before → after</Text>
              </View>
  
              <Text style={styles.metricScore}>{dailyProgressLabel}</Text>
            </View>
  
            <View style={[styles.goalCard, !dailyGoalCompleted && styles.goalCardNeutral]}>
              <LineIcon
                name={dailyGoalCompleted ? 'check' : 'clock'}
                size={16}
                color={dailyGoalCompleted ? '#438C31' : '#697269'}
              />
              <Text style={[styles.goalCardText, !dailyGoalCompleted && styles.goalCardTextNeutral]}>
                {dailyGoalCompleted ? 'Daily Goal Completed' : 'Daily Goal Progress'}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onTakeBreak || onDone}
              accessibilityRole="button"
              accessibilityLabel="Take a break"
            >
              <Text style={styles.secondaryButtonText}>Take a Break</Text>
            </Pressable>
  
            <Pressable
              style={({ pressed }) => [
                styles.ghostButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onStartAnother}
              accessibilityRole="button"
              accessibilityLabel="Start another session"
            >
              <Text style={styles.ghostButtonText}>Start Another Session</Text>
            </Pressable>
  
            <Pressable
              style={({ pressed }) => [
                styles.textButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onDone}
              accessibilityRole="button"
              accessibilityLabel="Back to home"
            >
              <Text style={styles.textButtonText}>Back to Home</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
