import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  Text,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/studyHistoryScreenStyles'

function toSafeDurationSeconds(value) {
  let numericValue

  try {
    numericValue = Number(value)
  } catch (error) {
    return 0
  }

  if (!Number.isFinite(numericValue)) return 0

  return Math.max(0, Math.floor(numericValue))
}

function formatDuration(totalSeconds = 0) {
  const safeSeconds = toSafeDurationSeconds(totalSeconds)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60
  const parts = [
    hours > 0 ? `${hours}h` : null,
    minutes > 0 ? `${minutes}m` : null,
    seconds > 0 ? `${seconds}s` : null,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' ') : '0 sec'
}

function getValidDate(value) {
  if (value === null || value === undefined || value === '') return null

  try {
    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? null : date
  } catch (error) {
    return null
  }
}

function getDateKey(date) {
  if (!date) return 'unknown'

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function getDayLabel(date) {
  if (!date) return 'Date unavailable'

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (getDateKey(date) === getDateKey(today)) return 'Today'
  if (getDateKey(date) === getDateKey(yesterday)) return 'Yesterday'

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getTimeLabel(date) {
  if (!date) return 'Time unavailable'

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function normalizeCompletionStatus(value) {
  if (value === true || value === 'true' || value === 1) return 'completed'
  if (value === false || value === 'false' || value === 0) return 'ended-early'

  return 'unavailable'
}

function normalizeSession(session, sourceIndex) {
  const source = session && typeof session === 'object' ? session : {}
  const completedAt = getValidDate(source.completedAt)
  const timerMode = String(source.timerMode).toLowerCase() === 'stopwatch'
    ? 'stopwatch'
    : 'countdown'
  const sourceId = typeof source.id === 'string' || typeof source.id === 'number'
    ? source.id
    : 'item'

  return {
    key: `study-session-${String(sourceId)}-${sourceIndex}`,
    subjectName: typeof source.subjectName === 'string' && source.subjectName.trim()
      ? source.subjectName.trim()
      : 'Study session',
    durationSeconds: toSafeDurationSeconds(source.durationSeconds),
    completedAt,
    sortTimestamp: completedAt ? completedAt.getTime() : Number.NEGATIVE_INFINITY,
    dateKey: getDateKey(completedAt),
    dateLabel: getDayLabel(completedAt),
    timeLabel: getTimeLabel(completedAt),
    timerMode,
    completionStatus: normalizeCompletionStatus(source.completed),
  }
}

function buildSections(sessions) {
  const normalizedSessions = (Array.isArray(sessions) ? sessions : [])
    .map(normalizeSession)
    .sort((first, second) => {
      if (second.sortTimestamp !== first.sortTimestamp) {
        return second.sortTimestamp - first.sortTimestamp
      }

      return first.key.localeCompare(second.key)
    })

  const sectionMap = new Map()

  normalizedSessions.forEach((session) => {
    if (!sectionMap.has(session.dateKey)) {
      sectionMap.set(session.dateKey, {
        key: session.dateKey,
        title: session.dateLabel,
        data: [],
      })
    }

    sectionMap.get(session.dateKey).data.push(session)
  })

  return {
    sessions: normalizedSessions,
    sections: Array.from(sectionMap.values()),
  }
}

function SummaryCard({ totalDurationLabel, sessionCount }) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Your study activity</Text>
        <LineIcon name="chart" size={18} color="#438C31" />
      </View>

      <View style={styles.summaryMetrics}>
        <View style={styles.summaryMetric}>
          <Text style={styles.summaryValue}>{totalDurationLabel}</Text>
          <Text style={styles.summaryLabel}>Total study time</Text>
        </View>

        <View style={[styles.summaryMetric, styles.summaryMetricBorder]}>
          <Text style={styles.summaryValue}>{sessionCount}</Text>
          <Text style={styles.summaryLabel}>Sessions</Text>
        </View>
      </View>
    </View>
  )
}

function SessionRow({ session }) {
  const modeLabel = session.timerMode === 'stopwatch' ? 'Stopwatch' : 'Countdown'
  const statusPresentation = session.timerMode === 'stopwatch'
    ? {
      label: 'Stopped',
      icon: 'stop',
      color: '#B46B24',
      metaStyle: styles.endedMeta,
      textStyle: styles.endedText,
    }
    : session.completionStatus === 'completed'
      ? {
        label: 'Completed',
        icon: 'check',
        color: '#438C31',
        metaStyle: styles.completedMeta,
        textStyle: styles.completedText,
      }
      : session.completionStatus === 'ended-early'
        ? {
          label: 'Ended early',
          icon: 'stop',
          color: '#B46B24',
          metaStyle: styles.endedMeta,
          textStyle: styles.endedText,
        }
        : {
          label: 'Status unavailable',
          icon: 'clock',
          color: '#697269',
          metaStyle: null,
          textStyle: null,
        }

  return (
    <View
      style={styles.sessionCard}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${session.subjectName}, ${formatDuration(session.durationSeconds)}, ${session.timeLabel}, ${modeLabel}, ${statusPresentation.label}`}
    >
      <View style={styles.sessionCardTop}>
        <View style={styles.sessionHeading}>
          <View style={styles.subjectTitleRow}>
            <View style={styles.subjectDot} />
            <Text style={styles.sessionSubject} numberOfLines={2}>
              {session.subjectName}
            </Text>
          </View>
          <Text style={styles.sessionTime}>{session.timeLabel}</Text>
        </View>

        <Text style={styles.sessionDuration}>
          {formatDuration(session.durationSeconds)}
        </Text>
      </View>

      <View style={styles.sessionMetaRow}>
        <View style={styles.metaItem}>
          <LineIcon name="clock" size={14} color="#697269" />
          <Text style={styles.metaText}>{modeLabel}</Text>
        </View>

        <View style={[styles.metaItem, statusPresentation.metaStyle]}>
          <LineIcon name={statusPresentation.icon} size={14} color={statusPresentation.color} />
          <Text style={[styles.metaText, statusPresentation.textStyle]}>
            {statusPresentation.label}
          </Text>
        </View>
      </View>
    </View>
  )
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <LineIcon name="clock" size={24} color="#438C31" />
      </View>
      <Text style={styles.emptyTitle}>No study sessions yet</Text>
      <Text style={styles.emptyCopy}>
        Complete a focus session and your study history will appear here.
      </Text>
    </View>
  )
}

function LoadingState() {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator size="small" color="#76C457" />
      <Text style={styles.loadingText}>Loading study history...</Text>
    </View>
  )
}

function StorageErrorState({ errorMessage, onRetry }) {
  return (
    <View style={styles.errorState}>
      <View style={[styles.emptyIcon, styles.errorIcon]}>
        <LineIcon name="clock" size={24} color="#B46B24" />
      </View>
      <Text style={styles.errorTitle}>Unable to load study history</Text>
      <Text style={styles.errorCopy}>
        {errorMessage || "We couldn't load your saved study sessions. Please try again."}
        {' Your saved sessions were not cleared.'}
      </Text>
      <Pressable
        style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Try loading study history again"
      >
        <LineIcon name="clock" size={16} color="#FFFFFF" />
        <Text style={styles.retryButtonText}>Try again</Text>
      </Pressable>
    </View>
  )
}

export default function StudyHistoryScreen({
  sessions = [],
  sessionsReady = false,
  sessionsLoadState = 'loading',
  sessionsLoadError = null,
  onRetry,
  onBack,
}) {
  const { sessions: normalizedSessions, sections } = buildSections(sessions)
  const totalDurationSeconds = normalizedSessions.reduce(
    (total, session) => total + session.durationSeconds,
    0,
  )

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
          <Text style={styles.eyebrow}>Study activity</Text>
          <Text style={styles.title}>Study History</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {sessionsLoadState === 'error' ? (
        <StorageErrorState errorMessage={sessionsLoadError} onRetry={onRetry} />
      ) : sessionsReady ? (
        <SectionList
          sections={sections}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => item.key}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionCount}>
                {section.data.length} {section.data.length === 1 ? 'session' : 'sessions'}
              </Text>
            </View>
          )}
          renderItem={({ item }) => <SessionRow session={item} />}
          ListHeaderComponent={(
            <SummaryCard
              totalDurationLabel={formatDuration(totalDurationSeconds)}
              sessionCount={normalizedSessions.length}
            />
          )}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <LoadingState />
      )}
    </SafeAreaView>
  )
}
