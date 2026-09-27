import React, { useMemo, useRef, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import { createQuizAttemptId } from '../services/quizAttemptService'
import styles from '../styles/quizSessionScreenStyles'

const QUESTION_BANK = [
  {
    subject: 'Computer Networks',
    prompt: 'Which OSI layer is responsible for routing packets between networks?',
    answers: [
      ['A', 'Data Link Layer'],
      ['B', 'Network Layer'],
      ['C', 'Transport Layer'],
      ['D', 'Application Layer'],
    ],
    correctKey: 'B',
    explanation: 'The Network Layer handles logical addressing and routing packets between different networks.',
  },
  {
    subject: 'Computer Networks',
    prompt: 'Which device connects multiple devices within the same local network?',
    answers: [
      ['A', 'Switch'],
      ['B', 'Router'],
      ['C', 'Modem'],
      ['D', 'Repeater'],
    ],
    correctKey: 'A',
    explanation: 'A switch forwards frames between devices on the same local network using MAC addresses.',
  },
  {
    subject: 'Computer Networks',
    prompt: 'What does IP stand for in computer networking?',
    answers: [
      ['A', 'Internet Process'],
      ['B', 'Internal Protocol'],
      ['C', 'Internet Protocol'],
      ['D', 'Information Port'],
    ],
    correctKey: 'C',
    explanation: 'IP stands for Internet Protocol, which provides addressing and routing for network packets.',
  },
]

function getSafeQuestionCount(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return 10

  return Math.max(1, Math.floor(numericValue))
}

export default function QuizSessionScreen({
  config = {},
  reviewResult = null,
  onExit,
  onReviewDone,
  onComplete,
}) {
  const hasGeneratedQuestions = Array.isArray(config.questions) && config.questions.length > 0
  const questions = hasGeneratedQuestions ? config.questions : QUESTION_BANK
  const isReviewMode = Boolean(reviewResult)
  const totalQuestions = hasGeneratedQuestions
    ? questions.length
    : getSafeQuestionCount(config.questionCount)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [selectedKey, setSelectedKey] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const startedAtRef = useRef(Date.now())
  const answerRecordsRef = useRef([])
  const isCompletingRef = useRef(false)
  const completionResultRef = useRef(null)
  const attemptIdRef = useRef(null)
  if (!attemptIdRef.current) attemptIdRef.current = createQuizAttemptId()

  const question = useMemo(
    () => questions[(questionNumber - 1) % questions.length],
    [questionNumber, questions],
  )
  const reviewAnswersByQuestionId = useMemo(() => new Map(
    (Array.isArray(reviewResult?.answers) ? reviewResult.answers : []).map((answer) => [
      answer.questionId,
      answer.selectedOptionKey,
    ]),
  ), [reviewResult])
  const activeSelectedKey = isReviewMode
    ? reviewAnswersByQuestionId.get(question.id) || null
    : selectedKey
  const isSubmitted = isReviewMode || submitted
  const isCorrect = isSubmitted && activeSelectedKey === question.correctKey
  const progressPercent = Math.min(100, (questionNumber / totalQuestions) * 100)

  const submitAnswer = () => {
    if (isReviewMode || !selectedKey || submitted) return

    answerRecordsRef.current = [
      ...answerRecordsRef.current,
      {
        questionId: question.id,
        selectedOptionKey: selectedKey,
        answeredAt: new Date().toISOString(),
      },
    ]
    setSubmitted(true)
  }

  const goToNextQuestion = async () => {
    if (isReviewMode) {
      if (questionNumber >= totalQuestions) {
        onReviewDone?.()
        return
      }
      setQuestionNumber((currentQuestion) => currentQuestion + 1)
      return
    }

    if (isCompletingRef.current) return

    const nextScore = score + (isCorrect ? 1 : 0)

    if (questionNumber >= totalQuestions) {
      if (!completionResultRef.current) {
        const completedAt = Date.now()
        completionResultRef.current = {
          attemptId: attemptIdRef.current,
          score: nextScore,
          totalQuestions,
          subjectName: question.subject || config.subjectName || 'Study material',
          durationSeconds: Math.max(1, Math.round((completedAt - startedAtRef.current) / 1000)),
          startedAt: new Date(startedAtRef.current).toISOString(),
          completedAt: new Date(completedAt).toISOString(),
          answers: answerRecordsRef.current,
        }
      }

      isCompletingRef.current = true
      setIsCompleting(true)

      try {
        const didComplete = await onComplete?.(completionResultRef.current)

        if (didComplete === false) {
          isCompletingRef.current = false
          setIsCompleting(false)
        }
      } catch (error) {
        isCompletingRef.current = false
        setIsCompleting(false)
        Alert.alert(
          'Quiz result not saved',
          error?.message || 'Your answers are still on screen. Please try saving the result again.',
        )
      }
      return
    }

    setScore(nextScore)
    setQuestionNumber((currentQuestion) => currentQuestion + 1)
    setSelectedKey(null)
    setSubmitted(false)
  }

  const handleExit = () => {
    if (isReviewMode) {
      onReviewDone?.()
      return
    }

    Alert.alert(
      'Exit quiz?',
      'Your current answer will not be saved.',
      [
        { text: 'Keep studying', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: onExit },
      ],
    )
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerSide, pressed && styles.headerSidePressed]}
          onPress={handleExit}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Exit quiz"
        >
          <LineIcon name="back" size={22} color="#151A15" />
        </Pressable>
        <Text style={styles.headerTitle}>Quiz</Text>
        <Text style={styles.headerSubject} numberOfLines={1}>
          {question.subject || config.subjectName || 'Study material'}
        </Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
        alwaysBounceVertical
        overScrollMode="always"
      >
        <View style={styles.questionHeader}>
          <Text style={styles.questionCount}>
            Question <Text style={styles.questionCountStrong}>{questionNumber}</Text> of {totalQuestions}
          </Text>
          <Text style={styles.practiceLabel}>{isReviewMode ? 'Review mode' : 'Practice mode'}</Text>
        </View>

        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityLabel="Quiz progress"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.round(progressPercent),
            text: `${questionNumber} of ${totalQuestions} questions`,
          }}
        >
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.subjectEyebrow}>{question.subject}</Text>
          <Text style={styles.questionTitle}>{question.prompt}</Text>

          <View style={styles.answerList}>
            {question.answers.map(([key, answer]) => {
              const isSelected = activeSelectedKey === key
              const isCorrectAnswer = isSubmitted && key === question.correctKey
              const isIncorrectAnswer = isSubmitted && isSelected && !isCorrect

              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.answerButton,
                    isSelected && styles.answerButtonSelected,
                    isCorrectAnswer && styles.answerButtonCorrect,
                    isIncorrectAnswer && styles.answerButtonIncorrect,
                    pressed && !isSubmitted && styles.answerButtonPressed,
                  ]}
                  onPress={() => setSelectedKey(key)}
                  disabled={isSubmitted}
                  accessibilityRole="button"
                  accessibilityLabel={`Answer ${key}: ${answer}`}
                  accessibilityState={{ selected: isSelected, disabled: isSubmitted }}
                >
                  <View style={[
                    styles.answerKey,
                    isCorrectAnswer && styles.answerKeyCorrect,
                    isIncorrectAnswer && styles.answerKeyIncorrect,
                  ]}>
                    <Text style={styles.answerKeyText}>{key}</Text>
                  </View>
                  <Text style={styles.answerText}>{answer}</Text>
                  {isCorrectAnswer ? <LineIcon name="check" size={18} color="#438C31" /> : null}
                  {isIncorrectAnswer ? <LineIcon name="x" size={18} color="#C45858" /> : null}
                </Pressable>
              )
            })}
          </View>

          {isSubmitted ? (
            <View style={[styles.explanation, isCorrect ? styles.explanationCorrect : styles.explanationIncorrect]}>
              <View style={styles.explanationHeader}>
                <LineIcon
                  name={isCorrect ? 'check' : 'x'}
                  size={17}
                  color={isCorrect ? '#438C31' : '#C45858'}
                />
                <Text style={[styles.explanationTitle, !isCorrect && styles.explanationTitleIncorrect]}>
                  {isCorrect ? 'Correct!' : 'Not quite'}
                </Text>
              </View>
              <Text style={styles.explanationCopy}>{question.explanation}</Text>
            </View>
          ) : null}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            !isReviewMode && !selectedKey && styles.primaryButtonDisabled,
            !isReviewMode && isCompleting && styles.primaryButtonDisabled,
            pressed && (isReviewMode || (selectedKey && !isCompleting)) && styles.buttonPressed,
          ]}
          onPress={isReviewMode ? goToNextQuestion : (submitted ? goToNextQuestion : submitAnswer)}
          disabled={!isReviewMode && (!selectedKey || isCompleting)}
          accessibilityRole="button"
          accessibilityLabel={isCompleting
            ? 'Saving quiz results'
            : isReviewMode
              ? (questionNumber >= totalQuestions ? 'Back to quiz result' : 'Next answer')
              : submitted
              ? (questionNumber >= totalQuestions ? 'See quiz results' : 'Next question')
              : 'Check answer'}
          accessibilityState={{ disabled: !isReviewMode && (!selectedKey || isCompleting) }}
        >
          <Text style={styles.primaryButtonText}>
            {isCompleting
              ? 'Saving...'
              : isReviewMode
                ? (questionNumber >= totalQuestions ? 'Back to Result' : 'Next Answer')
                : submitted
                ? (questionNumber >= totalQuestions ? 'See Results' : 'Next Question')
                : 'Check Answer'}
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  )
}
