import React, { useMemo } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/analyticsScreenStyles'

function toSafeDurationSeconds(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return 0

  return Math.max(0, Math.floor(numericValue))
}

function formatDuration(totalSeconds = 0) {
  const safeSeconds = toSafeDurationSeconds(totalSeconds)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return seconds > 0 ? `${seconds}s` : '0m'
}

function getValidDate(value) {
  if (value === null || value === undefined || value === '') return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function getWeeklyActivity(sessions) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))

    return {
      key: getDateKey(date),
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      seconds: 0,
      count: 0,
    }
  })
  const dayMap = new Map(days.map((day) => [day.key, day]))

  ;(Array.isArray(sessions) ? sessions : []).forEach((session) => {
    if (!session || typeof session !== 'object' || Array.isArray(session)) return

    const date = getValidDate(session.completedAt)
    const durationSeconds = toSafeDurationSeconds(session.durationSeconds)
    if (!date || durationSeconds <= 0) return

    const day = dayMap.get(getDateKey(date))
    if (!day) return

    day.seconds += durationSeconds
    day.count += 1
  })

  return days
}

function getSubjectBreakdown(sessions) {
  const subjectMap = new Map()

  ;(Array.isArray(sessions) ? sessions : []).forEach((session) => {
    if (!session || typeof session !== 'object' || Array.isArray(session)) return

    const subjectName = typeof session.subjectName === 'string' && session.subjectName.trim()
      ? session.subjectName.trim()
      : 'General Study'
    const durationSeconds = toSafeDurationSeconds(session.durationSeconds)
    if (durationSeconds <= 0) return

    subjectMap.set(subjectName, (subjectMap.get(subjectName) || 0) + durationSeconds)
  })

  return Array.from(subjectMap.entries())
    .map(([name, seconds]) => ({ name, seconds }))
    .sort((first, second) => second.seconds - first.seconds)
    .slice(0, 5)
}

function MetricCard({ iconName, value, label }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <LineIcon name={iconName} size={17} color="#438C31" />
      </View>
      <Text style={styles.metricValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  )
}

function LoadingState() {
  return (
    <View style={styles.stateCard}>
      <ActivityIndicator size="small" color="#76C457" />
      <Text style={styles.stateTitle}>Loading analytics...</Text>
      <Text style={styles.stateCopy}>Your study activity is being prepared.</Text>
    </View>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>
        <LineIcon name="clock" size={22} color="#B46B24" />
      </View>
      <Text style={styles.stateTitle}>Analytics unavailable</Text>
      <Text style={styles.stateCopy}>{message || 'We could not load your study activity.'}</Text>
      <Pressable
        style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Try loading analytics again"
      >
        <Text style={styles.retryButtonText}>Try again</Text>
      </Pressable>
    </View>
  )
}

function WeeklyActivity({ days }) {
  const maxSeconds = Math.max(...days.map((day) => day.seconds), 1)
  const totalSeconds = days.reduce((total, day) => total + day.seconds, 0)

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Weekly activity</Text>
          <Text style={styles.panelHint}>Last 7 days</Text>
        </View>
        <Text style={styles.panelValue}>{formatDuration(totalSeconds)}</Text>
      </View>

      <View style={styles.chart}>
        {days.map((day) => (
          <View key={day.key} style={styles.chartColumn}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { height: `${Math.max(8, (day.seconds / maxSeconds) * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.chartLabel}>{day.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function DailyGoal({ todayMetrics, dailyTargetMinutes }) {
  const safeDailyTargetMinutes = Number(dailyTargetMinutes)
  const hasDailyTarget = Number.isFinite(safeDailyTargetMinutes) && safeDailyTargetMinutes > 0
  const progress = Math.min(100, Math.max(0, todayMetrics.progressPercent || 0))

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Today&apos;s goal</Text>
          <Text style={styles.panelHint}>{todayMetrics.remainingLabel}</Text>
        </View>
        <Text style={styles.panelValue}>{todayMetrics.studyLabel}</Text>
      </View>

      <View style={styles.goalTrack}>
        <View style={[styles.goalFill, { width: `${progress}%` }]} />
      </View>
      <View style={styles.goalFooter}>
        <Text style={styles.panelHint}>{hasDailyTarget ? todayMetrics.goalLabel : 'Daily goal not set'}</Text>
        <Text style={styles.panelHint}>{progress}%</Text>
      </View>
    </View>
  )
}

function SubjectBreakdown({ subjects }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Focus by subject</Text>
          <Text style={styles.panelHint}>Your top study areas</Text>
        </View>
        <LineIcon name="chart" size={18} color="#438C31" />
      </View>

      {subjects.length > 0 ? subjects.map((subject, index) => (
        <View key={subject.name} style={styles.subjectRow}>
          <View style={styles.subjectRank}>
            <Text style={styles.subjectRankText}>{index + 1}</Text>
          </View>
          <Text style={styles.subjectName} numberOfLines={1}>{subject.name}</Text>
          <Text style={styles.subjectDuration}>{formatDuration(subject.seconds)}</Text>
        </View>
      )) : (
        <Text style={styles.emptyCopy}>Complete a session to see your subject breakdown.</Text>
      )}
    </View>
  )
}

export default function AnalyticsScreen({
  sessions = [],
  sessionsLoadState = 'loading',
  sessionsLoadError,
  dailyTargetMinutes = 120,
  todayMetrics,
  onRetry,
  onBack,
}) {
  const weeklyActivity = useMemo(() => getWeeklyActivity(sessions), [sessions])
  const subjectBreakdown = useMemo(() => getSubjectBreakdown(sessions), [sessions])
  const validSessions = (Array.isArray(sessions) ? sessions : []).filter(
    (session) => session && typeof session === 'object' && !Array.isArray(session),
  )
  const totalSeconds = validSessions.reduce(
    (total, session) => total + toSafeDurationSeconds(session.durationSeconds),
    0,
  )
  const averageSeconds = validSessions.length > 0 ? totalSeconds / validSessions.length : 0

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <LineIcon name="back" size={22} color="#151A15" />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Your progress</Text>
          <Text style={styles.title}>Analytics</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {sessionsLoadState === 'loading' ? <LoadingState /> : null}
      {sessionsLoadState === 'error' ? (
        <ErrorState message={sessionsLoadError} onRetry={onRetry} />
      ) : null}
      {sessionsLoadState === 'ready' ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.metricGrid}>
            <MetricCard iconName="clock" value={formatDuration(totalSeconds)} label="Total focus" />
            <MetricCard iconName="check" value={String(validSessions.length)} label="Sessions" />
            <MetricCard iconName="chart" value={formatDuration(averageSeconds)} label="Average session" />
          </View>

          <WeeklyActivity days={weeklyActivity} />
          <DailyGoal todayMetrics={todayMetrics} dailyTargetMinutes={dailyTargetMinutes} />
          <SubjectBreakdown subjects={subjectBreakdown} />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  )
}
