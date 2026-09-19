import React, { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/quizUploadScreenStyles'

const DEMO_FILES = {
  pdf: {
    name: 'Computer-Networks-notes.pdf',
    type: 'PDF',
    size: '1.8 MB',
  },
  image: {
    name: 'network-diagram.jpg',
    type: 'Image',
    size: 'Demo image',
  },
}

function OptionButton({ label, selected, onPress, accessibilityLabel }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.segment,
        selected && styles.segmentActive,
        pressed && styles.segmentPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ selected }}
    >
      <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>
        {label}
      </Text>
    </Pressable>
  )
}

export default function QuizUploadScreen({ onBack, onGenerate }) {
  const [file, setFile] = useState(null)
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState('Medium')
  const [questionType, setQuestionType] = useState('Multiple Choice')

  const chooseDemoFile = (fileType) => {
    setFile(DEMO_FILES[fileType] || DEMO_FILES.pdf)
  }

  const openFileChoice = () => {
    Alert.alert(
      file ? 'Replace study material' : 'Choose study material',
      'The native document picker will be connected in the next integration step.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Use demo PDF', onPress: () => chooseDemoFile('pdf') },
      ],
    )
  }

  const openPhotoChoice = (source) => {
    Alert.alert(
      source === 'camera' ? 'Take a photo' : 'Choose a photo',
      'Image selection is currently shown as a prototype interaction.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Use demo image', onPress: () => chooseDemoFile('image') },
      ],
    )
  }

  const handleGenerate = () => {
    if (!file) return

    onGenerate?.({
      file,
      questionCount,
      difficulty,
      questionType,
    })
  }

  const cycleQuestionType = () => {
    const types = ['Multiple Choice', 'True or False', 'Short Answer']
    const currentIndex = types.indexOf(questionType)
    setQuestionType(types[(currentIndex + 1) % types.length])
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerSide, pressed && styles.backButtonPressed]}
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <LineIcon name="back" size={22} color="#151A15" />
        </Pressable>
        <Text style={styles.headerTitle}>Generate Quiz</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces
        alwaysBounceVertical
        overScrollMode="always"
      >
        <Text style={styles.intro}>
          Turn your study materials into practice questions.
        </Text>

        {file ? (
          <View style={styles.fileMeta}>
            <View style={styles.fileIcon}>
              <LineIcon name="quiz" size={20} color="#B84B4B" />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <Text style={styles.fileDetails}>{file.type} · {file.size}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.replaceButton, pressed && styles.buttonPressed]}
              onPress={openFileChoice}
              accessibilityRole="button"
              accessibilityLabel="Replace study material"
            >
              <Text style={styles.replaceButtonText}>Replace</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.removeButton, pressed && styles.buttonPressed]}
              onPress={() => setFile(null)}
              accessibilityRole="button"
              accessibilityLabel="Remove study material"
            >
              <LineIcon name="x" size={18} color="#697269" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.uploadCard}>
            <View style={styles.uploadIcon}>
              <LineIcon name="upload" size={24} color="#438C31" />
            </View>
            <Text style={styles.uploadTitle}>Upload a study material</Text>
            <Text style={styles.uploadCopy}>
              PDF, photo, or notes. We&apos;ll use it to shape your quiz.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={openFileChoice}
              accessibilityRole="button"
              accessibilityLabel="Choose a study material file"
            >
              <LineIcon name="plus" size={17} color="#438C31" />
              <Text style={styles.secondaryButtonText}>Choose a file</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.mediaRow}>
          <Pressable
            style={({ pressed }) => [styles.mediaButton, pressed && styles.buttonPressed]}
            onPress={() => openPhotoChoice('camera')}
            accessibilityRole="button"
            accessibilityLabel="Take a photo of study material"
          >
            <Text style={styles.mediaIcon}>✦</Text>
            <Text style={styles.mediaButtonText}>Take Photo</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.mediaButton, pressed && styles.buttonPressed]}
            onPress={() => openPhotoChoice('library')}
            accessibilityRole="button"
            accessibilityLabel="Choose a photo of study material"
          >
            <LineIcon name="cards" size={16} color="#438C31" />
            <Text style={styles.mediaButtonText}>Photos</Text>
          </Pressable>
        </View>

        <View style={styles.configCard}>
          <View style={styles.configHeader}>
            <Text style={styles.configTitle}>Quiz configuration</Text>
            <Text style={styles.eyebrow}>AI assisted</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Number of questions</Text>
            <View style={styles.segmentRow}>
              {[5, 10, 20].map((value) => (
                <OptionButton
                  key={value}
                  label={String(value)}
                  selected={questionCount === value}
                  onPress={() => setQuestionCount(value)}
                  accessibilityLabel={`${value} questions`}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Difficulty</Text>
            <View style={styles.segmentRow}>
              {['Easy', 'Medium', 'Hard'].map((value) => (
                <OptionButton
                  key={value}
                  label={value}
                  selected={difficulty === value}
                  onPress={() => setDifficulty(value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldGroupLast}>
            <Text style={styles.fieldLabel}>Question type</Text>
            <Pressable
              style={({ pressed }) => [styles.selectRow, pressed && styles.selectRowPressed]}
              onPress={cycleQuestionType}
              accessibilityRole="button"
              accessibilityLabel={`Question type, ${questionType}`}
              accessibilityHint="Double tap to choose the next question type"
            >
              <Text style={styles.selectText}>{questionType}</Text>
              <LineIcon name="chevron" size={17} color="#697269" />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            !file && styles.primaryButtonDisabled,
            pressed && file && styles.buttonPressed,
          ]}
          onPress={handleGenerate}
          disabled={!file}
          accessibilityRole="button"
          accessibilityLabel="Generate quiz"
          accessibilityState={{ disabled: !file }}
        >
          <LineIcon name="spark" size={17} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Generate Quiz</Text>
        </Pressable>

        <Text style={styles.footerCopy}>
          Prototype mode — document processing and AI generation are not connected yet.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
