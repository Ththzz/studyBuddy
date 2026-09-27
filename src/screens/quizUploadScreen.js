import React, { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import { pickStudyDocument, pickStudyPhoto } from '../utils/studyMaterialPicker'
import styles from '../styles/quizUploadScreenStyles'

const QUESTION_TYPES = [
  {
    label: 'Multiple Choice',
    description: 'Practice with answer options',
  },
  {
    label: 'Flashcards',
    description: 'Review question and answer pairs',
  },
  {
    label: 'Q&A',
    description: 'Practice writing short answers',
  },
]

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
  const [outputLanguage, setOutputLanguage] = useState('English')
  const [questionType, setQuestionType] = useState('Multiple Choice')
  const [isPicking, setIsPicking] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState('')
  const [isQuestionTypePickerOpen, setIsQuestionTypePickerOpen] = useState(false)

  const openFileChoice = async () => {
    if (isPicking) return

    setIsPicking(true)
    const nextFile = await pickStudyDocument()
    if (nextFile) setFile(nextFile)
    setIsPicking(false)
  }

  const openPhotoChoice = async (source) => {
    if (isPicking) return

    setIsPicking(true)
    const nextFile = await pickStudyPhoto(source)
    if (nextFile) setFile(nextFile)
    setIsPicking(false)
  }

  const handleGenerate = async () => {
    if (!file || isGenerating) return

    setGenerationError('')
    setIsGenerating(true)
    try {
      await onGenerate?.({
        file,
        questionCount,
        difficulty,
        outputLanguage,
        questionType,
      })
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Could not generate study content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateButtonLabel = questionType === 'Flashcards'
    ? 'Generate Flashcards'
    : questionType === 'Q&A'
      ? 'Generate Q&A'
      : 'Generate Quiz'

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
        {file ? (
          <View style={styles.fileMeta}>
            <View style={styles.fileIcon}>
              <LineIcon
                name={file.type === 'Image' ? 'cards' : 'quiz'}
                size={20}
                color={file.type === 'Image' ? '#438C31' : '#B84B4B'}
              />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <Text style={styles.fileDetails}>{file.type} · {file.size}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.replaceButton, pressed && styles.buttonPressed]}
              onPress={openFileChoice}
              disabled={isPicking}
              accessibilityRole="button"
              accessibilityLabel="Replace study material"
              accessibilityState={{ disabled: isPicking }}
            >
              {isPicking ? <ActivityIndicator size="small" color="#438C31" /> : <Text style={styles.replaceButtonText}>Replace</Text>}
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
              PDF, DOCX, TXT, or a photo. We&apos;ll use it to build your study set.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={openFileChoice}
              disabled={isPicking}
              accessibilityRole="button"
              accessibilityLabel="Choose a study material file"
              accessibilityState={{ disabled: isPicking }}
            >
              {isPicking ? (
                <ActivityIndicator size="small" color="#438C31" />
              ) : (
                <>
                  <LineIcon name="plus" size={17} color="#438C31" />
                  <Text style={styles.secondaryButtonText}>Choose a file</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        <View style={styles.mediaRow}>
          <Pressable
            style={({ pressed }) => [styles.mediaButton, isPicking && styles.mediaButtonDisabled, pressed && !isPicking && styles.buttonPressed]}
            onPress={() => openPhotoChoice('camera')}
            disabled={isPicking}
            accessibilityRole="button"
            accessibilityLabel="Take a photo of study material"
          >
            <Text style={styles.mediaIcon}>✦</Text>
            <Text style={styles.mediaButtonText}>Take Photo</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.mediaButton, isPicking && styles.mediaButtonDisabled, pressed && !isPicking && styles.buttonPressed]}
            onPress={() => openPhotoChoice('library')}
            disabled={isPicking}
            accessibilityRole="button"
            accessibilityLabel="Choose a photo of study material"
          >
            <LineIcon name="cards" size={16} color="#438C31" />
            <Text style={styles.mediaButtonText}>Photos</Text>
          </Pressable>
        </View>

        <View style={styles.configCard}>
          <View style={styles.configHeader}>
            <Text style={styles.configTitle}>
              {questionType === 'Flashcards' ? 'Flashcard configuration' : questionType === 'Q&A' ? 'Q&A configuration' : 'Quiz configuration'}
            </Text>
            <Text style={styles.eyebrow}>AI assisted</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {questionType === 'Flashcards' ? 'Number of cards' : 'Number of questions'}
            </Text>
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

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Question language</Text>
            <View style={styles.segmentRow}>
              {['English', 'Thai'].map((value) => (
                <OptionButton
                  key={value}
                  label={value}
                  selected={outputLanguage === value}
                  onPress={() => setOutputLanguage(value)}
                  accessibilityLabel={`Generate in ${value}`}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldGroupLast}>
            <Text style={styles.fieldLabel}>Question type</Text>
            <Pressable
              style={({ pressed }) => [styles.selectRow, pressed && styles.selectRowPressed]}
              onPress={() => setIsQuestionTypePickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`Question type, ${questionType}`}
              accessibilityHint="Opens the question type options"
              accessibilityState={{ expanded: isQuestionTypePickerOpen }}
            >
              <Text style={styles.selectText}>{questionType}</Text>
              <LineIcon name="chevron" size={17} color="#697269" />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            (!file || isGenerating) && styles.primaryButtonDisabled,
            pressed && file && !isGenerating && styles.buttonPressed,
          ]}
          onPress={handleGenerate}
          disabled={!file || isGenerating}
          accessibilityRole="button"
          accessibilityLabel={isGenerating ? 'Generating study content' : generateButtonLabel}
          accessibilityState={{ disabled: !file || isGenerating, busy: isGenerating }}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <LineIcon name="spark" size={17} color="#FFFFFF" />
          )}
          <Text style={styles.primaryButtonText}>{isGenerating ? 'Generating…' : generateButtonLabel}</Text>
        </Pressable>
        {generationError ? <Text style={styles.generationError}>{generationError}</Text> : null}

      </ScrollView>

      <Modal
        visible={isQuestionTypePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsQuestionTypePickerOpen(false)}
      >
        <View style={styles.questionTypeOverlay}>
          <Pressable
            style={styles.questionTypeScrim}
            onPress={() => setIsQuestionTypePickerOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close question type options"
          />
          <View style={styles.questionTypeSheet}>
            <View style={styles.questionTypeHandle} />
            <Text style={styles.questionTypeTitle}>Question type</Text>
            <Text style={styles.questionTypeSubtitle}>
              Choose what to make from your study material.
            </Text>

            <View style={styles.questionTypeOptions}>
              {QUESTION_TYPES.map((option) => {
                const isSelected = questionType === option.label

                return (
                  <Pressable
                    key={option.label}
                    style={({ pressed }) => [
                      styles.questionTypeOption,
                      isSelected && styles.questionTypeOptionSelected,
                      pressed && styles.questionTypeOptionPressed,
                    ]}
                    onPress={() => {
                      setQuestionType(option.label)
                      setIsQuestionTypePickerOpen(false)
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.questionTypeOptionCopy}>
                      <Text style={styles.questionTypeOptionLabel}>{option.label}</Text>
                      <Text style={styles.questionTypeOptionDescription}>
                        {option.description}
                      </Text>
                    </View>
                    {isSelected ? <LineIcon name="check" size={19} color="#438C31" /> : null}
                  </Pressable>
                )
              })}
            </View>

            <Pressable
              style={({ pressed }) => [styles.questionTypeCancel, pressed && styles.buttonPressed]}
              onPress={() => setIsQuestionTypePickerOpen(false)}
              accessibilityRole="button"
            >
              <Text style={styles.questionTypeCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
