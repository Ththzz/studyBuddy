import React, { useEffect, useRef, useState } from 'react'
import { AppState, Pressable, ScrollView, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'
import LineIcon from '../components/lineIcon'
import styles from '../styles/studyTimerScreenStyles'

const PRESETS = [25, 45, 60]
const TIMER_MODES = [
  { key: 'countdown', label: 'Countdown' },
  { key: 'stopwatch', label: 'Stopwatch' },
]
const RING_SIZE = 250
const STROKE_WIDTH = 10
const WHEEL_ITEM_HEIGHT = 44

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainder = safeSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

function getDurationParts(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  return {
    hours: Math.floor(safeSeconds / 3600),
    minutes: Math.floor((safeSeconds % 3600) / 60),
    seconds: safeSeconds % 60,
  }
}

function formatDurationLabel(totalSeconds) {
  const { hours, minutes, seconds } = getDurationParts(totalSeconds)

  if (hours === 0 && seconds === 0) return `${minutes} min`

  return [
    hours > 0 ? `${hours}h` : null,
    minutes > 0 ? `${minutes}m` : null,
    seconds > 0 ? `${seconds}s` : null,
  ]
    .filter(Boolean)
    .join(' ')
}

function WheelPicker({ label, value, maxValue, onChange, accessibilityLabel }) {
  const scrollRef = useRef(null)
  const [scrollValue, setScrollValue] = useState(value)
  const values = Array.from({ length: maxValue + 1 }, (_, index) => index)

  useEffect(() => {
    setScrollValue(value)
    scrollRef.current?.scrollTo({
      y: value * WHEEL_ITEM_HEIGHT,
      animated: false,
    })
  }, [value])

  const getValueFromOffset = (offset) => {
    const nextValue = Math.round(offset / WHEEL_ITEM_HEIGHT)
    return Math.max(0, Math.min(maxValue, nextValue))
  }

  const handleScroll = (event) => {
    setScrollValue(getValueFromOffset(event.nativeEvent.contentOffset.y))
  }

  const handleScrollEnd = (event) => {
    const nextValue = getValueFromOffset(event.nativeEvent.contentOffset.y)
    setScrollValue(nextValue)
    onChange(nextValue)
  }

  return (
    <View style={styles.wheelColumn}>
      <Text style={styles.wheelLabel}>{label}</Text>
      <View style={styles.wheelViewport}>
        <ScrollView
          ref={scrollRef}
          style={styles.wheelScroll}
          contentContainerStyle={styles.wheelContent}
          showsVerticalScrollIndicator={false}
          snapToInterval={WHEEL_ITEM_HEIGHT}
          decelerationRate="fast"
          scrollEventThrottle={16}
          nestedScrollEnabled
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel}
          accessibilityValue={{ min: 0, max: maxValue, now: scrollValue }}
        >
          {values.map((item) => (
            <View key={item} style={styles.wheelItem}>
              <Text style={[styles.wheelItemText, item === scrollValue && styles.wheelItemTextActive]}>
                {String(item).padStart(2, '0')}
              </Text>
            </View>
          ))}
        </ScrollView>
        <View pointerEvents="none" style={styles.wheelSelection} />
      </View>
    </View>
  )
}

function ProgressRing({ progress, showProgress = true, children }) {
  const radius = (RING_SIZE - STROKE_WIDTH) / 2
  const circumference = 2 * Math.PI * radius
  const safeProgress = Math.max(0, Math.min(progress, 100))

  return (
    <View style={styles.timerCircle} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(safeProgress) }}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={styles.timerSvg}>
        <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={radius} fill="none" stroke="#E7EEE3" strokeWidth={STROKE_WIDTH} />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          fill="none"
          stroke="#76C457"
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - safeProgress / 100)}
          rotation={-90}
          originX={RING_SIZE / 2}
          originY={RING_SIZE / 2}
          opacity={showProgress ? 1 : 0}
        />
      </Svg>
      <View style={styles.timerCircleInner}>{children}</View>
    </View>
  )
}

export default function StudyTimerScreen({
  subjectName = 'Computer Networks',
  initialMinutes = 25,
  todayStudyLabel = '0m',
  dailyGoalLabel = 'of 2h goal',
  todayRemainingLabel = '2h left',
  todayProgressPercent = 0,
  onBack,
  onFinish,
}) {
  const initialDurationSeconds = Math.max(1, Math.round(initialMinutes * 60))
  const initialParts = getDurationParts(initialDurationSeconds)
  const [timerMode, setTimerMode] = useState('countdown')
  const [selectedDurationSeconds, setSelectedDurationSeconds] = useState(initialDurationSeconds)
  const [remainingSeconds, setRemainingSeconds] = useState(initialDurationSeconds)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [customHours, setCustomHours] = useState(initialParts.hours)
  const [customMinutes, setCustomMinutes] = useState(initialParts.minutes)
  const [customSeconds, setCustomSeconds] = useState(initialParts.seconds)
  const [customError, setCustomError] = useState('')
  const timerRef = useRef({
    mode: 'countdown',
    durationSeconds: initialDurationSeconds,
    accumulatedMs: 0,
    startedAtMs: null,
    isRunning: false,
    finishSent: false,
  })
  const onFinishRef = useRef(onFinish)
  const subjectNameRef = useRef(subjectName)

  const isCountdown = timerMode === 'countdown'
  const totalSeconds = selectedDurationSeconds
  const displayedSeconds = isCountdown ? remainingSeconds : elapsedSeconds
  const isFresh = isCountdown ? remainingSeconds === totalSeconds : elapsedSeconds === 0
  const progress = totalSeconds ? (remainingSeconds / totalSeconds) * 100 : 0
  const isCustom = !PRESETS.some((minutes) => minutes * 60 === selectedDurationSeconds)
  const safeDailyProgressPercent = Number.isFinite(Number(todayProgressPercent))
    ? Math.max(0, Math.min(100, Math.round(Number(todayProgressPercent))))
    : 0

  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  useEffect(() => {
    subjectNameRef.current = subjectName
  }, [subjectName])

  const getElapsedMilliseconds = (now) => {
    const timing = timerRef.current
    const runningMilliseconds = timing.startedAtMs === null
      ? 0
      : Math.max(0, now - timing.startedAtMs)

    return Math.max(0, timing.accumulatedMs + runningMilliseconds)
  }

  const emitFinish = (durationSeconds, completed, timerModeValue) => {
    const timing = timerRef.current
    if (timing.finishSent) return false

    timing.finishSent = true
    onFinishRef.current?.({
      subjectName: subjectNameRef.current,
      durationSeconds,
      completed,
      timerMode: timerModeValue,
    })
    return true
  }

  const syncTimer = (now = Date.now()) => {
    const timing = timerRef.current
    const elapsedSecondsFromClock = Math.floor(getElapsedMilliseconds(now) / 1000)

    if (timing.mode === 'countdown') {
      const nextRemainingSeconds = Math.max(
        timing.durationSeconds - elapsedSecondsFromClock,
        0,
      )

      setRemainingSeconds((current) => (
        current === nextRemainingSeconds ? current : nextRemainingSeconds
      ))

      if (
        timing.isRunning
        && nextRemainingSeconds === 0
        && !timing.finishSent
      ) {
        timing.accumulatedMs = timing.durationSeconds * 1000
        timing.startedAtMs = null
        timing.isRunning = false
        setIsRunning(false)
        emitFinish(timing.durationSeconds, true, timing.mode)
      }
    } else {
      setElapsedSeconds((current) => (
        current === elapsedSecondsFromClock ? current : elapsedSecondsFromClock
      ))
    }
  }

  useEffect(() => {
    if (!isRunning) return undefined

    syncTimer()

    const intervalId = setInterval(() => {
      syncTimer()
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isRunning])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') syncTimer()
    })

    return () => subscription.remove()
  }, [])

  const resetTimer = (durationSeconds, nextMode = timerMode) => {
    const safeDurationSeconds = Math.max(1, Math.floor(durationSeconds))
    const timing = timerRef.current

    timing.mode = nextMode
    timing.durationSeconds = safeDurationSeconds
    timing.accumulatedMs = 0
    timing.startedAtMs = null
    timing.isRunning = false
    timing.finishSent = false

    setIsRunning(false)
    setSelectedDurationSeconds(safeDurationSeconds)
    setRemainingSeconds(safeDurationSeconds)
    setElapsedSeconds(0)
    setCustomOpen(false)
    setCustomError('')
  }

  const setDuration = (durationSeconds) => {
    resetTimer(durationSeconds)
  }

  const selectDuration = (minutes) => {
    setDuration(minutes * 60)
  }

  const switchMode = (nextMode) => {
    if (nextMode === timerMode || isRunning) return

    setTimerMode(nextMode)
    resetTimer(selectedDurationSeconds, nextMode)
  }

  const saveCustomDuration = () => {
    const durationSeconds = customHours * 3600 + customMinutes * 60 + customSeconds
    if (durationSeconds < 1) {
      setCustomError('Choose at least 1 second')
      return
    }
    setDuration(durationSeconds)
  }

  const openCustomEditor = () => {
    if (timerRef.current.isRunning) {
      pauseTimer()
    }

    const currentParts = getDurationParts(selectedDurationSeconds)
    setCustomHours(currentParts.hours)
    setCustomMinutes(currentParts.minutes)
    setCustomSeconds(currentParts.seconds)
    setCustomError('')
    setCustomOpen(true)
  }

  const closeCustomEditor = () => {
    setCustomOpen(false)
    setCustomError('')
  }

  const startTimer = () => {
    const timing = timerRef.current
    if (timing.isRunning || timing.finishSent) return

    const now = Date.now()
    timing.startedAtMs = now
    timing.isRunning = true
    setIsRunning(true)
    syncTimer(now)
  }

  const pauseTimer = () => {
    const timing = timerRef.current
    if (!timing.isRunning) return

    const now = Date.now()
    syncTimer(now)

    if (!timing.isRunning || timing.finishSent) return

    timing.accumulatedMs = getElapsedMilliseconds(now)
    timing.startedAtMs = null
    timing.isRunning = false
    setIsRunning(false)
  }

  const toggleTimer = () => {
    if (timerRef.current.isRunning) {
      pauseTimer()
    } else {
      startTimer()
    }
  }

  const finishSession = () => {
    const timing = timerRef.current
    if (timing.finishSent) return

    const now = Date.now()
    const elapsedMilliseconds = getElapsedMilliseconds(now)
    const elapsedSecondsFromClock = Math.floor(elapsedMilliseconds / 1000)
    const completed = timing.mode === 'countdown'
      && elapsedSecondsFromClock >= timing.durationSeconds
    const durationSeconds = timing.mode === 'countdown'
      ? Math.min(timing.durationSeconds, elapsedSecondsFromClock)
      : elapsedSecondsFromClock

    timing.accumulatedMs = completed
      ? timing.durationSeconds * 1000
      : elapsedMilliseconds
    timing.startedAtMs = null
    timing.isRunning = false
    setIsRunning(false)

    if (timing.mode === 'countdown') {
      setRemainingSeconds(Math.max(timing.durationSeconds - elapsedSecondsFromClock, 0))
    } else {
      setElapsedSeconds(elapsedSecondsFromClock)
    }

    emitFinish(durationSeconds, completed, timing.mode)
  }

  const status = isRunning ? 'In progress' : isFresh ? 'Ready to start' : 'Paused'
  const focusProgressStyle = [
    styles.miniProgressFill,
    { width: `${safeDailyProgressPercent}%` },
  ]
  const modeHint = isRunning
    ? 'Pause before changing timer mode.'
    : !isFresh
      ? 'Switching mode starts a new timer.'
      : isCountdown
        ? 'Set a duration and count down to zero.'
        : 'Start at zero and count up as you study.'

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topbar}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <LineIcon name="back" size={22} color="#151A15" />
          </Pressable>
          <Text style={styles.topbarTitle}>Focus session</Text>
          <View style={styles.topbarSpacer} />
        </View>

        <View style={styles.timerHero}>
          <View style={styles.modeToggleContainer}>
            <View style={styles.modeToggle} accessibilityRole="tablist">
              {TIMER_MODES.map(({ key, label }) => {
                const isActive = timerMode === key

                return (
                  <Pressable
                    key={key}
                    style={({ pressed }) => [
                      styles.modeOption,
                      isActive && styles.modeOptionActive,
                      isRunning && !isActive && styles.modeOptionDisabled,
                      pressed && styles.modeOptionPressed,
                    ]}
                    onPress={() => switchMode(key)}
                    disabled={isRunning}
                    accessibilityRole="tab"
                    accessibilityLabel={`Use ${label} mode`}
                    accessibilityState={{ selected: isActive, disabled: isRunning }}
                  >
                    <Text style={[styles.modeOptionText, isActive && styles.modeOptionTextActive]}>
                      {label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
            <Text style={styles.modeHint}>
              {modeHint}
            </Text>
          </View>

          <Text style={styles.timerLabel}>{subjectName} · Focus Session</Text>

          <ProgressRing progress={progress} showProgress={isCountdown}>
            <Text
              style={[styles.timerDisplay, displayedSeconds >= 3600 && styles.timerDisplayLong]}
              accessibilityLabel={`${isCountdown ? 'Time remaining' : 'Elapsed time'} ${formatTime(displayedSeconds)}`}
            >
              {formatTime(displayedSeconds)}
            </Text>
            <View
              style={styles.statusPill}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`Timer status: ${status}`}
            >
              {isRunning && <Text style={styles.statusDot}>●</Text>}
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </ProgressRing>

          <View style={styles.timerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                isCountdown && remainingSeconds === 0 && styles.disabledButton,
              ]}
              onPress={toggleTimer}
              disabled={isCountdown && remainingSeconds === 0}
              accessibilityRole="button"
              accessibilityLabel={isRunning ? 'Pause timer' : 'Start timer'}
            >
              <LineIcon name={isRunning ? 'pause' : 'play'} size={16} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>{isRunning ? 'Pause' : isFresh ? 'Start' : 'Resume'}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.dangerButton, pressed && styles.buttonPressed]}
              onPress={finishSession}
              accessibilityRole="button"
              accessibilityLabel="End study session"
            >
              <LineIcon name="stop" size={16} color="#E05252" />
              <Text style={styles.dangerButtonText}>End Session</Text>
            </Pressable>
          </View>

          {isCountdown ? (
            <>
              <View style={styles.presets}>
                {PRESETS.map((minutes) => (
                  <Pressable
                    key={minutes}
                    style={({ pressed }) => [styles.preset, selectedDurationSeconds === minutes * 60 && styles.presetActive, pressed && styles.presetPressed]}
                    onPress={() => selectDuration(minutes)}
                    accessibilityRole="button"
                    accessibilityLabel={`Set timer to ${minutes} minutes`}
                    accessibilityState={{ selected: selectedDurationSeconds === minutes * 60 }}
                  >
                    <Text style={[styles.presetText, selectedDurationSeconds === minutes * 60 && styles.presetTextActive]}>{minutes} min</Text>
                  </Pressable>
                ))}
                <Pressable
                  style={({ pressed }) => [styles.preset, isCustom && styles.presetActive, pressed && styles.presetPressed]}
                  onPress={openCustomEditor}
                  accessibilityRole="button"
                  accessibilityLabel="Set a custom timer duration"
                  accessibilityState={{ selected: isCustom }}
                >
                  <Text style={[styles.presetText, isCustom && styles.presetTextActive]}>{isCustom ? `Custom · ${formatDurationLabel(selectedDurationSeconds)}` : 'Custom'}</Text>
                </Pressable>
              </View>

              {customOpen && (
                <View style={styles.customEditor}>
                  <View style={styles.customHeader}>
                    <Text style={styles.customTitle}>Set a custom session</Text>
                    <Text style={styles.customRange}>Up to 23h 59m 59s</Text>
                  </View>
                  <View style={styles.wheelRow}>
                    <WheelPicker label="Hours" value={customHours} maxValue={23} onChange={setCustomHours} accessibilityLabel="Custom timer hours" />
                    <Text style={styles.wheelSeparator}>:</Text>
                    <WheelPicker label="Minutes" value={customMinutes} maxValue={59} onChange={setCustomMinutes} accessibilityLabel="Custom timer minutes" />
                    <Text style={styles.wheelSeparator}>:</Text>
                    <WheelPicker label="Seconds" value={customSeconds} maxValue={59} onChange={setCustomSeconds} accessibilityLabel="Custom timer seconds" />
                  </View>

                  <View style={styles.customActions}>
                    <Pressable style={({ pressed }) => [styles.smallPrimaryButton, pressed && styles.buttonPressed]} onPress={saveCustomDuration} accessibilityRole="button" accessibilityLabel="Save custom timer"><Text style={styles.primaryButtonText}>Set</Text></Pressable>
                    <Pressable style={({ pressed }) => [styles.smallGhostButton, pressed && styles.buttonPressed]} onPress={closeCustomEditor} accessibilityRole="button" accessibilityLabel="Cancel custom timer"><Text style={styles.ghostButtonText}>Cancel</Text></Pressable>
                  </View>
                  {customError ? <Text style={styles.customError} accessibilityLiveRegion="polite">{customError}</Text> : null}
                </View>
              )}
            </>
          ) : (
            <View style={styles.stopwatchInfo} accessible accessibilityRole="text">
              <LineIcon name="clock" size={16} color="#438C31" />
              <Text style={styles.stopwatchInfoText}>Stopwatch starts at 00:00</Text>
            </View>
          )}

          <View style={styles.focusCard}>
            <View style={styles.focusHeader}>
              <Text style={styles.focusTitle}>Today’s focus</Text>
              <Text style={styles.focusSummary}>
                {todayStudyLabel} {dailyGoalLabel}
              </Text>
            </View>
            <View style={styles.miniProgress}>
              <View style={focusProgressStyle} />
            </View>
            <View style={styles.focusFooter}>
              <Text style={styles.focusFooterText}>{todayRemainingLabel}</Text>
              <Text style={styles.focusFooterText}>{safeDailyProgressPercent}%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
