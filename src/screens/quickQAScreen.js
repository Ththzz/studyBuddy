import React, { useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/quickQAScreenStyles'
import { evaluateStudyAnswer } from '../services/studyAiClient'

const DEFAULT_SUBJECTS = ['General Study']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const QUESTION_STYLES = ['Short Answer', 'Concept Check', 'Mixed']
const QUESTION_TEXT = 'What is the main difference between a router and a switch?'
const REFERENCE_ANSWER = 'Routers connect different networks and choose paths for packets. Switches connect devices within the same local network.'

function normalizeSubjects(subjects) {
  const source = Array.isArray(subjects) && subjects.length > 0
    ? subjects
    : DEFAULT_SUBJECTS

  return source.reduce((result, subject) => {
    const name = typeof subject === 'string'
      ? subject.trim()
      : subject && typeof subject.name === 'string'
        ? subject.name.trim()
        : ''

    if (name && !result.includes(name)) result.push(name)
    return result
  }, [])
}

function ChoiceButton({ label, selected, onPress, style, activeStyle, activeTextStyle }) {
  return (
    <Pressable
      style={({ pressed }) => [
        style,
        selected && (activeStyle || styles.choiceActive),
        pressed && styles.choicePressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.choiceText, selected && (activeTextStyle || styles.choiceTextActive)]}>
        {label}
      </Text>
    </Pressable>
  )
}

function SubjectPicker({ visible, subjects, selectedSubject, onSelect, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Choose a subject</Text>
          <View style={styles.modalOptions}>
            {subjects.map((subject) => (
              <Pressable
                key={subject}
                style={({ pressed }) => [
                  styles.modalOption,
                  selectedSubject === subject && styles.modalOptionActive,
                  pressed && styles.choicePressed,
                ]}
                onPress={() => {
                  onSelect(subject)
                  onClose()
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedSubject === subject }}
              >
                <Text style={styles.modalOptionText}>{subject}</Text>
                {selectedSubject === subject ? (
                  <LineIcon name="check" size={18} color="#438C31" />
                ) : null}
              </Pressable>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [styles.modalCancel, pressed && styles.choicePressed]}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

function ExitPracticeModal({ visible, isSavedSession, onCancel, onSave, onLeave }) {
  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.confirmationOverlay}>
        <Pressable style={styles.confirmationBackdrop} onPress={onCancel} />
        <View style={styles.confirmationCard} accessibilityViewIsModal>
          <View style={styles.confirmationIcon}>
            <LineIcon name="pause" size={23} color="#438C31" />
          </View>
          <Text style={styles.confirmationTitle}>
            {isSavedSession ? 'Your progress is saved' : 'Save this practice first?'}
          </Text>
          <Text style={styles.confirmationCopy}>
            {isSavedSession
              ? 'You can continue from this question later.'
              : 'Save it with a name if you would like to continue later.'}
          </Text>
          <View style={styles.confirmationButtonColumn}>
            <Pressable
              style={({ pressed }) => [styles.confirmationButton, styles.confirmationCancelButton, pressed && styles.confirmationButtonPressed]}
              onPress={onCancel}
              accessibilityRole="button"
            >
              <Text style={styles.confirmationCancelText}>Keep practicing</Text>
            </Pressable>
            {isSavedSession ? null : (
              <Pressable
                style={({ pressed }) => [styles.confirmationButton, styles.confirmationSaveButton, pressed && styles.confirmationButtonPressed]}
                onPress={onSave}
                accessibilityRole="button"
              >
                <Text style={styles.confirmationSaveText}>Save &amp; leave</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.confirmationButton, isSavedSession ? styles.confirmationSaveButton : styles.confirmationLeaveButton, pressed && styles.confirmationButtonPressed]}
              onPress={onLeave}
              accessibilityRole="button"
            >
              <Text style={styles.confirmationSaveText}>
                {isSavedSession ? 'Return to My Q&A' : 'Leave without saving'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

function SetupView({
  selectedSubject,
  difficulty,
  questionStyle,
  onSubjectPress,
  onDifficultyChange,
  onQuestionStyleChange,
  onStart,
}) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      bounces
      alwaysBounceVertical
      overScrollMode="always"
    >
      <View style={[styles.card, styles.setupCard]}>
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Subject</Text>
          <Pressable
            style={({ pressed }) => [styles.select, pressed && styles.selectPressed]}
            onPress={onSubjectPress}
            accessibilityRole="button"
            accessibilityLabel={`Subject: ${selectedSubject}`}
          >
            <Text style={styles.selectText} numberOfLines={1}>{selectedSubject}</Text>
            <LineIcon name="chevron" size={18} color="#A6AFA5" />
          </Pressable>
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Difficulty</Text>
          <View style={styles.segmented} accessibilityRole="tablist">
            {DIFFICULTIES.map((item) => (
              <ChoiceButton
                key={item}
                label={item}
                selected={difficulty === item}
                onPress={() => onDifficultyChange(item)}
                style={styles.segment}
                activeStyle={styles.segmentActive}
                activeTextStyle={styles.segmentTextActive}
              />
            ))}
          </View>
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Question style</Text>
          <View style={styles.choiceGrid}>
            {QUESTION_STYLES.map((item) => (
              <ChoiceButton
                key={item}
                label={item}
                selected={questionStyle === item}
                onPress={() => onQuestionStyleChange(item)}
                style={styles.choice}
              />
            ))}
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel="Start practice"
      >
        <Text style={styles.primaryButtonText}>Start Practice</Text>
      </Pressable>

      <View style={[styles.card, styles.emptyState]}>
        <View style={styles.emptyIcon}>
          <LineIcon name="qa" size={25} color="#438C31" />
        </View>
        <Text style={styles.emptyTitle}>Learn out loud</Text>
        <Text style={styles.emptyCopy}>
          Short answers make tricky concepts easier to spot.
        </Text>
      </View>
    </ScrollView>
  )
}

function PracticeView({
  selectedSubject,
  difficulty,
  answer,
  feedback,
  error,
  questionText,
  referenceAnswer,
  questionNumber,
  totalQuestions,
  progressPercent,
  isGeneratedSession,
  isChecking,
  hasPendingAttempt,
  isLastQuestion,
  onAnswerChange,
  onCheckAnswer,
  onNextQuestion,
}) {
  const score = typeof feedback?.score === 'number' ? feedback.score : null
  const isCorrect = score !== null && score >= 70
  const feedbackCopy = typeof feedback?.feedback === 'string'
    ? feedback.feedback.trim().slice(0, 180)
    : 'Review the suggested answer and try the next question.'
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces
      alwaysBounceVertical
      overScrollMode="always"
    >
      <View style={styles.questionHeader}>
        <Text style={styles.questionHeaderText}>
          {isGeneratedSession ? 'Question' : 'Concept check'}{' '}
          <Text style={styles.questionHeaderStrong}>{questionNumber} of {totalQuestions}</Text>
        </Text>
        <Text style={styles.eyebrow}>{difficulty}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={[styles.card, styles.questionCard]}>
        <Text style={styles.eyebrow}>{selectedSubject}</Text>
        <Text style={styles.questionText}>{questionText}</Text>
        <TextInput
          style={[styles.answerInput, (feedback || isChecking || hasPendingAttempt) && styles.answerInputDisabled]}
          value={answer}
          onChangeText={onAnswerChange}
          placeholder="Write your answer in a few sentences..."
          placeholderTextColor="#ABB3AA"
          multiline
          maxLength={280}
          textAlignVertical="top"
          accessibilityLabel="Write your answer"
          editable={!feedback && !isChecking && !hasPendingAttempt}
        />
        <View style={styles.answerMeta}>
          <Text style={styles.mutedSmall}>Take your best guess</Text>
          <Text style={styles.mutedSmall}>{answer.length} / 280</Text>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {feedback ? (
        <View style={[styles.card, styles.feedbackCard, isCorrect ? styles.feedbackCorrect : styles.feedbackNeedsReview]}>
          <View style={styles.feedbackHeader}>
            <View style={[styles.settingIcon, isCorrect ? styles.feedbackIconCorrect : styles.feedbackIconNeedsReview]}>
              <LineIcon name="spark" size={17} color={isCorrect ? '#438C31' : '#B66A16'} />
            </View>
            <View><Text style={[styles.feedbackTitle, isCorrect ? styles.feedbackCorrectText : styles.feedbackNeedsReviewText]}>{isCorrect ? 'Correct' : 'Needs review'}</Text><Text style={styles.feedbackScore}>{score === null ? 'AI feedback' : `${score}%`}</Text></View>
          </View>
          <Text style={styles.feedbackText}>{feedbackCopy}</Text>
          <View style={styles.suggestedAnswer}>
            <Text style={styles.suggestedTitle}>Suggested answer</Text>
            <Text style={styles.suggestedText}>
              {typeof feedback === 'object' && feedback.suggestedAnswer
                ? feedback.suggestedAnswer
                : referenceAnswer}
            </Text>
          </View>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={onCheckAnswer}
          accessibilityRole="button"
          accessibilityLabel={hasPendingAttempt ? 'Retry saving answer' : 'Check answer'}
          accessibilityState={{ disabled: isChecking, busy: isChecking }}
          disabled={isChecking}
        >
          {isChecking ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
          <Text style={styles.primaryButtonText}>
            {isChecking ? (hasPendingAttempt ? 'Saving…' : 'Checking…') : (hasPendingAttempt ? 'Retry Save' : 'Check Answer')}
          </Text>
        </Pressable>
      )}

      {feedback && onNextQuestion ? (
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={onNextQuestion}
          accessibilityRole="button"
          accessibilityLabel={isLastQuestion ? 'Finish Q&A' : 'Go to the next question'}
        >
          <Text style={styles.primaryButtonText}>{isLastQuestion ? 'Finish Q&A' : 'Next Question'}</Text>
        </Pressable>
      ) : null}

    </ScrollView>
  )
}

export default function QuickQAScreen({
  subjects,
  generatedQuestions,
  initialQuestionIndex = 0,
  isSessionCurrent,
  onSaveAttempt,
  onRecordAttempt,
  onBack,
  onFinish,
  isSavedSession = false,
  onExitSaved,
  onExitSave,
  onExitDiscard,
}) {
  const generatedQuestionList = Array.isArray(generatedQuestions) ? generatedQuestions : []
  const isGeneratedSession = generatedQuestionList.length > 0
  const subjectOptions = useMemo(() => normalizeSubjects(subjects), [subjects])
  const [mode, setMode] = useState(isGeneratedSession ? 'active' : 'setup')
  const [questionIndex, setQuestionIndex] = useState(Math.max(0, initialQuestionIndex))
  const [selectedSubject, setSelectedSubject] = useState(
    generatedQuestionList[0]?.subject || subjectOptions[0] || DEFAULT_SUBJECTS[0],
  )
  const [difficulty, setDifficulty] = useState('Medium')
  const [questionStyle, setQuestionStyle] = useState('Concept Check')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [pendingAttempt, setPendingAttempt] = useState(null)
  const [subjectPickerOpen, setSubjectPickerOpen] = useState(false)
  const [exitModalVisible, setExitModalVisible] = useState(false)
  const pendingAttemptRef = useRef(null)
  const checkInFlightRef = useRef(false)
  const activeQuestion = generatedQuestionList[questionIndex]
  const activeQuestionText = activeQuestion?.prompt || QUESTION_TEXT
  const activeReferenceAnswer = activeQuestion?.sampleAnswer || REFERENCE_ANSWER
  const totalQuestions = isGeneratedSession ? generatedQuestionList.length : 1
  const questionNumber = isGeneratedSession ? questionIndex + 1 : 1
  const progressPercent = Math.min(100, (questionNumber / totalQuestions) * 100)

  const startPractice = () => {
    pendingAttemptRef.current = null
    setPendingAttempt(null)
    setAnswer('')
    setFeedback(null)
    setError('')
    setQuestionIndex(0)
    setMode('active')
  }

  const handleAnswerChange = (value) => {
    if (pendingAttemptRef.current || feedback) return
    setAnswer(value)
    setFeedback(null)
    if (error) setError('')
  }

  const checkAnswer = async () => {
    if (checkInFlightRef.current) return

    const isCurrentSession = () => (
      !isGeneratedSession
      || (typeof isSessionCurrent === 'function' && isSessionCurrent())
    )
    if (!isCurrentSession()) return

    if (!pendingAttemptRef.current && !answer.trim()) {
      setError('Write a short answer first.')
      return
    }

    setError('')
    checkInFlightRef.current = true
    setIsChecking(true)
    const answeredAt = new Date().toISOString()
    try {
      let attempt = pendingAttemptRef.current
      if (!attempt) {
        const answerText = answer.trim()
        const evaluation = await evaluateStudyAnswer({
          subjectName: activeQuestion?.subject || selectedSubject,
          question: activeQuestionText,
          referenceAnswer: activeReferenceAnswer,
          userAnswer: answerText,
        })
        if (!isCurrentSession()) return

        if (!isGeneratedSession) {
          setFeedback(evaluation)
          return
        }

        attempt = {
          questionId: activeQuestion?.id || null,
          questionIndex,
          answerText,
          score: evaluation.score,
          feedback: evaluation.feedback,
          answeredAt,
          evaluation,
        }
      }

      if (!isGeneratedSession) return
      try {
        const saved = typeof onSaveAttempt === 'function'
          ? await onSaveAttempt(attempt)
          : await onRecordAttempt?.(attempt)
        if (saved === false || !isCurrentSession()) return
      } catch (saveError) {
        if (!isCurrentSession()) return
        pendingAttemptRef.current = attempt
        setPendingAttempt(attempt)
        const message = saveError instanceof Error ? saveError.message : 'Please check your connection and try again.'
        setError(`Your answer was checked, but the result could not be saved. ${message}`)
        return
      }

      if (!isCurrentSession()) return
      pendingAttemptRef.current = null
      setPendingAttempt(null)
      setFeedback(attempt.evaluation)
    } catch (evaluationError) {
      if (!isCurrentSession()) return
      setError(evaluationError instanceof Error ? evaluationError.message : 'Could not check your answer. Please try again.')
    } finally {
      checkInFlightRef.current = false
      if (isCurrentSession()) setIsChecking(false)
    }
  }

  const goToNextQuestion = () => {
    if (questionIndex + 1 >= generatedQuestionList.length) {
      onFinish?.()
      return
    }

    setQuestionIndex((currentIndex) => currentIndex + 1)
    pendingAttemptRef.current = null
    setPendingAttempt(null)
    setAnswer('')
    setFeedback(null)
    setError('')
  }

  const requestExit = () => {
    if (!isGeneratedSession) {
      onBack?.()
      return
    }
    setExitModalVisible(true)
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerSide, pressed && styles.headerSidePressed]}
          onPress={requestExit}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <LineIcon name="back" size={22} color="#151A15" />
        </Pressable>
        <Text style={styles.headerTitle}>Quick Q&amp;A</Text>
        <View style={styles.headerSide} />
      </View>

      {mode === 'setup' ? (
        <SetupView
          selectedSubject={selectedSubject}
          difficulty={difficulty}
          questionStyle={questionStyle}
          onSubjectPress={() => setSubjectPickerOpen(true)}
          onDifficultyChange={setDifficulty}
          onQuestionStyleChange={setQuestionStyle}
          onStart={startPractice}
        />
      ) : (
        <PracticeView
          selectedSubject={activeQuestion?.subject || selectedSubject}
          difficulty={difficulty}
          answer={answer}
          feedback={feedback}
          error={error}
          questionText={activeQuestionText}
          referenceAnswer={activeReferenceAnswer}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          progressPercent={progressPercent}
          isGeneratedSession={isGeneratedSession}
          isChecking={isChecking}
          hasPendingAttempt={Boolean(pendingAttempt)}
          isLastQuestion={isGeneratedSession && questionIndex + 1 >= generatedQuestionList.length}
          onAnswerChange={handleAnswerChange}
          onCheckAnswer={checkAnswer}
          onNextQuestion={isGeneratedSession ? goToNextQuestion : null}
        />
      )}

      <SubjectPicker
        visible={subjectPickerOpen}
        subjects={subjectOptions}
        selectedSubject={selectedSubject}
        onSelect={setSelectedSubject}
        onClose={() => setSubjectPickerOpen(false)}
      />
      <ExitPracticeModal
        visible={exitModalVisible}
        isSavedSession={isSavedSession}
        onCancel={() => setExitModalVisible(false)}
        onSave={() => {
          setExitModalVisible(false)
          onExitSave?.()
        }}
        onLeave={() => {
          setExitModalVisible(false)
          if (isSavedSession) onExitSaved?.()
          else onExitDiscard?.()
        }}
      />
    </SafeAreaView>
  )
}
