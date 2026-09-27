import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import LineIcon from '../components/lineIcon'
import styles from '../styles/quickQAScreenStyles'

export default function QaLibraryScreen({
  sets = [],
  resultSet,
  resultSaveState = 'idle',
  canSaveResult = false,
  shouldOpenSaveTitleDialog = false,
  onSaveTitleDialogOpened,
  onSaveResult,
  onBack,
  onOpen,
  onResults,
  onResultBack,
  onRenameSet,
  onDeleteSet,
}) {
  const [searchText, setSearchText] = useState('')
  const [titleDialogMode, setTitleDialogMode] = useState(null)
  const [editingSet, setEditingSet] = useState(null)
  const [titleDraft, setTitleDraft] = useState('')
  const [titleError, setTitleError] = useState('')
  const [isSubmittingTitle, setIsSubmittingTitle] = useState(false)
  const [deletingSetId, setDeletingSetId] = useState(null)

  const librarySets = Array.isArray(sets) ? sets.filter((set) => set?.setType === 'qa') : []
  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredSets = normalizedSearch
    ? librarySets.filter((set) => String(set.title || '').toLowerCase().includes(normalizedSearch))
    : librarySets

  const closeTitleDialog = () => {
    if (isSubmittingTitle) return
    setTitleDialogMode(null)
    setEditingSet(null)
    setTitleError('')
  }

  const openTitleDialog = (mode, set = null) => {
    const title = mode === 'save' ? resultSet?.title : set?.title
    setEditingSet(set)
    setTitleDraft(String(title || '').slice(0, 120))
    setTitleError('')
    setTitleDialogMode(mode)
  }

  useEffect(() => {
    if (!shouldOpenSaveTitleDialog || !resultSet || titleDialogMode) return
    openTitleDialog('save')
    onSaveTitleDialogOpened?.()
  }, [shouldOpenSaveTitleDialog, resultSet, titleDialogMode, onSaveTitleDialogOpened])

  const submitTitle = async () => {
    const safeTitle = titleDraft.trim()
    if (!safeTitle) {
      setTitleError('Enter a name for this Q&A set.')
      return
    }
    if (Array.from(safeTitle).length > 120) {
      setTitleError('Use 120 characters or fewer.')
      return
    }

    setIsSubmittingTitle(true)
    setTitleError('')
    try {
      const saved = titleDialogMode === 'save'
        ? await onSaveResult?.(safeTitle)
        : await onRenameSet?.(editingSet, safeTitle)
      if (saved === false) throw new Error('The signed-in account changed. Please try again.')
      setTitleDialogMode(null)
      setEditingSet(null)
    } catch (error) {
      setTitleError(error instanceof Error ? error.message : 'Could not save this name. Please try again.')
    } finally {
      setIsSubmittingTitle(false)
    }
  }

  const confirmDelete = (set) => {
    if (deletingSetId) return
    Alert.alert(
      'Delete this Q&A set?',
      `“${set.title}” and its saved answers will be deleted. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingSetId(set.id)
            try {
              const deleted = await onDeleteSet?.(set)
              if (deleted === false) throw new Error('The signed-in account changed. Please try again.')
            } catch (error) {
              Alert.alert('Could not delete Q&A', error instanceof Error ? error.message : 'Please try again.')
            } finally {
              setDeletingSetId(null)
            }
          },
        },
      ],
    )
  }

  const titleDialog = (
    <Modal
      visible={Boolean(titleDialogMode)}
      transparent
      animationType="fade"
      onRequestClose={closeTitleDialog}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {titleDialogMode === 'rename' ? 'Rename Q&A set' : 'Name your Q&A set'}
          </Text>
          <Text style={styles.modalCopy}>
            {titleDialogMode === 'rename'
              ? 'Choose a name you can find later.'
              : 'Save this practice set to My Q&A with a name.'}
          </Text>
          <TextInput
            accessibilityLabel="Q&A set name"
            autoCapitalize="sentences"
            maxLength={120}
            onChangeText={(value) => {
              setTitleDraft(value)
              if (titleError) setTitleError('')
            }}
            onSubmitEditing={submitTitle}
            placeholder="Set name"
            placeholderTextColor="#899187"
            returnKeyType="done"
            style={styles.titleDialogInput}
            value={titleDraft}
          />
          {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
          <View style={styles.titleDialogActions}>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmittingTitle}
              onPress={closeTitleDialog}
              style={({ pressed }) => [styles.titleDialogButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.titleDialogCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmittingTitle, busy: isSubmittingTitle }}
              disabled={isSubmittingTitle}
              onPress={submitTitle}
              style={({ pressed }) => [styles.titleDialogButton, styles.titleDialogConfirm, pressed && styles.buttonPressed]}
            >
              {isSubmittingTitle ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
              <Text style={styles.titleDialogConfirmText}>
                {isSubmittingTitle ? 'Saving…' : (titleDialogMode === 'rename' ? 'Save name' : 'Save')}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )

  if (resultSet) {
    const questions = Array.isArray(resultSet.questions) ? resultSet.questions : []
    const attempts = Array.isArray(resultSet.attempts) ? resultSet.attempts : []
    const seenQuestionIds = new Set()
    const latestAttempts = attempts.filter((attempt) => {
      if (seenQuestionIds.has(attempt.question_id)) return false
      seenQuestionIds.add(attempt.question_id)
      return true
    })
    const scoredAttempts = latestAttempts.filter((attempt) => Number.isFinite(Number(attempt.score)))
    const averageScore = scoredAttempts.length
      ? Math.round(scoredAttempts.reduce((total, attempt) => total + Number(attempt.score), 0) / scoredAttempts.length)
      : null

    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Pressable style={styles.headerSide} onPress={onResultBack} accessibilityRole="button" accessibilityLabel="Back to My Q&A">
            <LineIcon name="back" size={22} color="#151A15" />
          </Pressable>
          <Text style={styles.headerTitle}>Q&amp;A Results</Text>
          <View style={styles.headerSide} />
        </View>
        <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
          <View style={styles.completionHero}>
            <View style={styles.completionIcon}><LineIcon name="check" size={27} color="#438C31" /></View>
            <Text style={styles.completionEyebrow}>PRACTICE COMPLETE</Text>
            <Text style={styles.completionTitle}>Nice work!</Text>
            <Text style={styles.completionCopy}>{resultSet.title}</Text>
            {resultSaveState === 'saving' ? <Text style={styles.resultSaveStatus}>Saving to My Q&amp;A…</Text> : null}
            {resultSaveState === 'saved' ? <Text style={styles.resultSaveStatus}>Saved to My Q&amp;A</Text> : null}
            {resultSaveState === 'error' ? <Text style={styles.resultSaveError}>Could not save this set yet.</Text> : null}
            <View style={styles.completionStats}>
              <View style={styles.completionStat}>
                <Text style={styles.completionStatValue}>{latestAttempts.length}/{questions.length}</Text>
                <Text style={styles.completionStatLabel}>Answered</Text>
              </View>
              <View style={styles.completionStatDivider} />
              <View style={styles.completionStat}>
                <Text style={styles.completionStatValue}>{averageScore === null ? '—' : `${averageScore}%`}</Text>
                <Text style={styles.completionStatLabel}>Average score</Text>
              </View>
            </View>
          </View>
          {canSaveResult && resultSaveState !== 'saved' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: resultSaveState === 'saving' }}
              disabled={resultSaveState === 'saving'}
              onPress={() => openTitleDialog('save')}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.primaryButtonText}>
                {resultSaveState === 'error' ? 'Try saving again' : 'Save to My Q&A'}
              </Text>
            </Pressable>
          ) : null}
          <Text style={styles.resultsSectionTitle}>Your answers</Text>
          {latestAttempts.length ? latestAttempts.map((attempt, index) => {
            const question = questions.find((item) => item.id === attempt.question_id)
            const score = Number(attempt.score)
            const isCorrect = Number.isFinite(score) && score >= 70
            return (
              <View key={attempt.id || `${attempt.question_id}-${index}`} style={[styles.card, styles.resultCard]}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultQuestionNumber}>QUESTION {index + 1}</Text>
                  <Text style={[styles.resultScore, isCorrect ? styles.resultScoreCorrect : styles.resultScoreReview]}>
                    {Number.isFinite(score) ? `${score}%` : 'Done'}
                  </Text>
                </View>
                <Text style={styles.resultQuestion}>{question?.prompt || 'Question'}</Text>
                <Text style={styles.resultLabel}>Your answer</Text>
                <Text style={styles.resultAnswer}>{attempt.answer_text || 'No answer recorded'}</Text>
                {attempt.feedback ? <Text style={styles.resultFeedback}>{attempt.feedback}</Text> : null}
              </View>
            )
          }) : (
            <View style={[styles.card, styles.emptyState]}>
              <Text style={styles.emptyTitle}>No results yet</Text>
              <Text style={styles.emptyCopy}>Complete a question to see its result here.</Text>
            </View>
          )}
        </ScrollView>
        {titleDialog}
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable style={styles.headerSide} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to home">
          <LineIcon name="back" size={22} color="#151A15" />
        </Pressable>
        <Text style={styles.headerTitle}>My Q&amp;A</Text>
        <View style={styles.headerSide} />
      </View>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextInput
          accessibilityLabel="Search saved Q&A by name"
          autoCapitalize="none"
          onChangeText={setSearchText}
          placeholder="Search Q&A by name"
          placeholderTextColor="#899187"
          returnKeyType="search"
          style={styles.librarySearch}
          value={searchText}
        />
        {filteredSets.length ? filteredSets.map((set) => (
          <View key={set.id} style={[styles.card, styles.setupCard, styles.librarySetCard]}>
            <View style={styles.librarySetHeading}>
              <Text style={[styles.emptyTitle, styles.librarySetTitle]} numberOfLines={2}>{set.title}</Text>
              <View style={styles.libraryActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Rename ${set.title}`}
                  onPress={() => openTitleDialog('rename', set)}
                  style={({ pressed }) => [styles.libraryActionButton, pressed && styles.buttonPressed]}
                >
                  <LineIcon name="edit" size={18} color="#D29B00" />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${set.title}`}
                  accessibilityState={{ disabled: deletingSetId === set.id }}
                  disabled={deletingSetId === set.id}
                  onPress={() => confirmDelete(set)}
                  style={({ pressed }) => [styles.libraryActionButton, styles.libraryDeleteButton, pressed && styles.buttonPressed]}
                >
                  {deletingSetId === set.id ? <ActivityIndicator size="small" color="#A73737" /> : null}
                  {deletingSetId === set.id ? null : <LineIcon name="trash" size={18} color="#A73737" />}
                </Pressable>
              </View>
            </View>
            <View style={styles.librarySetContent}>
              <Text style={styles.emptyCopy}>{set.answeredCount} of {set.questions.length} answered</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => onOpen?.(set, 'resume')}
                style={({ pressed }) => [styles.primaryButton, styles.libraryPrimaryButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.primaryButtonText}>{set.answeredCount < set.questions.length ? 'Resume' : 'Start again'}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => onResults?.(set)}
                style={({ pressed }) => [styles.librarySecondaryButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.librarySecondaryText}>View results</Text>
              </Pressable>
            </View>
          </View>
        )) : (
          <View style={[styles.card, styles.emptyState]}>
            <Text style={styles.emptyTitle}>
              {normalizedSearch ? 'No matching Q&A sets' : 'No saved Q&A yet'}
            </Text>
            <Text style={styles.emptyCopy}>
              {normalizedSearch
                ? 'Try another name or clear your search.'
                : 'Save a generated practice set to find it here.'}
            </Text>
            {normalizedSearch ? (
              <Pressable onPress={() => setSearchText('')} style={({ pressed }) => [styles.librarySecondaryButton, pressed && styles.buttonPressed]}>
                <Text style={styles.librarySecondaryText}>Clear search</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>
      {titleDialog}
    </SafeAreaView>
  )
}
