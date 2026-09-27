import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/quizResultScreenStyles'

function toSafeNumber(value, fallback = 0) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? Math.max(0, Math.floor(numericValue)) : fallback
}

function formatDuration(totalSeconds) {
  const safeSeconds = toSafeNumber(totalSeconds)
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60

  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, '0')}s`
  return `${seconds}s`
}

function StatCard({ label, value, iconName, tone = 'green' }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, tone === 'red' && styles.statIconRed]}>
        <LineIcon name={iconName} size={17} color={tone === 'red' ? '#C45858' : '#438C31'} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export default function QuizResultScreen({
  result = {},
  config = {},
  saveState = 'idle',
  saveError,
  onRetrySave,
  onReviewAnswers,
  onTryAgain,
  onBack,
}) {
  const totalQuestions = Math.max(1, toSafeNumber(result.totalQuestions, 10))
  const score = Math.min(totalQuestions, toSafeNumber(result.score))
  const incorrect = Math.max(0, totalQuestions - score)
  const accuracy = Math.round((score / totalQuestions) * 100)
  const durationLabel = formatDuration(result.durationSeconds)
  const subjectName = result.subjectName || 'Computer Networks'
  const fileName = config.file?.name || 'Study material'

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerSide, pressed && styles.headerSidePressed]}
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <LineIcon name="back" size={22} color="#151A15" />
        </Pressable>
        <Text style={styles.headerTitle}>Quiz Result</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
        alwaysBounceVertical
        overScrollMode="always"
      >
        <View style={styles.resultHero}>
          <Text style={styles.quizName} numberOfLines={2}>{fileName}</Text>
          <Text style={styles.scoreSummary}>{score} / {totalQuestions}</Text>
          <Text style={styles.scoreLabel}>Correct answers</Text>
          <Text style={styles.resultCopy}>{subjectName} · {durationLabel}</Text>
        </View>

        <View style={styles.statGrid}>
          <StatCard label="Correct answers" value={String(score)} iconName="check" />
          <StatCard label="Incorrect answers" value={String(incorrect)} iconName="x" tone="red" />
          <StatCard label="Time taken" value={durationLabel} iconName="clock" />
          <StatCard label="Accuracy" value={`${accuracy}%`} iconName="chart" />
        </View>

        {saveState === 'error' ? (
          <View style={styles.saveErrorCard}>
            <Text style={styles.saveErrorTitle}>Quiz result not saved</Text>
            <Text style={styles.saveErrorCopy}>{saveError}</Text>
            <Pressable
              style={({ pressed }) => [styles.retrySaveButton, pressed && styles.buttonPressed]}
              onPress={onRetrySave}
              accessibilityRole="button"
              accessibilityLabel="Retry saving quiz result"
            >
              <Text style={styles.retrySaveButtonText}>Retry save</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={onReviewAnswers}
          accessibilityRole="button"
          accessibilityLabel="Review quiz answers"
        >
          <Text style={styles.primaryButtonText}>Review Answers</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={onTryAgain}
          accessibilityRole="button"
          accessibilityLabel="Try the quiz again"
        >
          <Text style={styles.secondaryButtonText}>Try Again</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
