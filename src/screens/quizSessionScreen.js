import React, { useMemo, useRef, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
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
  onExit,
  onComplete,
}) {
  const totalQuestions = getSafeQuestionCount(config.questionCount)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [selectedKey, setSelectedKey] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const startedAtRef = useRef(Date.now())

  const question = useMemo(
    () => QUESTION_BANK[(questionNumber - 1) % QUESTION_BANK.length],
    [questionNumber],
  )
  const isCorrect = submitted && selectedKey === question.correctKey
  const progressPercent = Math.min(100, (questionNumber / totalQuestions) * 100)

  const submitAnswer = () => {
    if (!selectedKey || submitted) return

    setSubmitted(true)
  }

  const goToNextQuestion = () => {
    const nextScore = score + (isCorrect ? 1 : 0)
    setScore(nextScore)

    if (questionNumber >= totalQuestions) {
      onComplete?.({
        score: nextScore,
        totalQuestions,
        subjectName: question.subject,
        durationSeconds: Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
      })
      return
    }

    setQuestionNumber((currentQuestion) => currentQuestion + 1)
    setSelectedKey(null)
    setSubmitted(false)
  }

  const handleExit = () => {
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
          {question.subject}
        </Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionHeader}>
          <Text style={styles.questionCount}>
            Question <Text style={styles.questionCountStrong}>{questionNumber}</Text> of {totalQuestions}
          </Text>
          <Text style={styles.practiceLabel}>Practice mode</Text>
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
              const isSelected = selectedKey === key
              const isCorrectAnswer = submitted && key === question.correctKey
              const isIncorrectAnswer = submitted && isSelected && !isCorrect

              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.answerButton,
                    isSelected && styles.answerButtonSelected,
                    isCorrectAnswer && styles.answerButtonCorrect,
                    isIncorrectAnswer && styles.answerButtonIncorrect,
                    pressed && !submitted && styles.answerButtonPressed,
                  ]}
                  onPress={() => setSelectedKey(key)}
                  disabled={submitted}
                  accessibilityRole="button"
                  accessibilityLabel={`Answer ${key}: ${answer}`}
                  accessibilityState={{ selected: isSelected, disabled: submitted }}
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

          {submitted ? (
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
            !selectedKey && styles.primaryButtonDisabled,
            pressed && selectedKey && styles.buttonPressed,
          ]}
          onPress={submitted ? goToNextQuestion : submitAnswer}
          disabled={!selectedKey}
          accessibilityRole="button"
          accessibilityLabel={submitted
            ? (questionNumber >= totalQuestions ? 'See quiz results' : 'Next question')
            : 'Check answer'}
          accessibilityState={{ disabled: !selectedKey }}
        >
          <Text style={styles.primaryButtonText}>
            {submitted
              ? (questionNumber >= totalQuestions ? 'See Results' : 'Next Question')
              : 'Check Answer'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.exitButton, pressed && styles.buttonPressed]}
          onPress={handleExit}
          accessibilityRole="button"
          accessibilityLabel="Exit quiz"
        >
          <Text style={styles.exitButtonText}>Exit Quiz</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
