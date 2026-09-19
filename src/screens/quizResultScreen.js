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

function getResultMessage(accuracy) {
  if (accuracy >= 80) return 'You’re getting sharper.'
  if (accuracy >= 50) return 'Good progress. Keep going.'
  return 'Every question is a chance to improve.'
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
      >
        <View style={styles.resultHero}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{score} / {totalQuestions}</Text>
            <Text style={styles.scoreLabel}>Correct answers</Text>
          </View>
          <Text style={styles.resultTitle}>{getResultMessage(accuracy)}</Text>
          <Text style={styles.resultCopy}>{subjectName} · {durationLabel}</Text>
        </View>

        <View style={styles.statGrid}>
          <StatCard label="Correct answers" value={String(score)} iconName="check" />
          <StatCard label="Incorrect answers" value={String(incorrect)} iconName="x" tone="red" />
          <StatCard label="Time taken" value={durationLabel} iconName="clock" />
          <StatCard label="Accuracy" value={`${accuracy}%`} iconName="chart" />
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <LineIcon name="chart" size={17} color="#438C31" />
          </View>
          <View style={styles.insightCopy}>
            <Text style={styles.insightTitle}>{fileName}</Text>
            <Text style={styles.insightText}>
              Review the explanations and try another round when you’re ready.
            </Text>
          </View>
        </View>

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
        <Pressable
          style={({ pressed }) => [styles.textButton, pressed && styles.buttonPressed]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <Text style={styles.textButtonText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
