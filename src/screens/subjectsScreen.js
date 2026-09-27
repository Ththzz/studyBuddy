import React, { useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/subjectsScreenStyles'

function normalizeSubjects(subjects) {
  const seen = new Set()

  return (Array.isArray(subjects) ? subjects : []).reduce((result, subject) => {
    const name = typeof subject === 'string'
      ? subject.trim()
      : subject && typeof subject.name === 'string'
        ? subject.name.trim()
        : ''
    const key = name.toLocaleLowerCase()

    if (name && !seen.has(key)) {
      seen.add(key)
      result.push(name)
    }

    return result
  }, [])
}

export default function SubjectsScreen({ subjects = [], onBack, onChange }) {
  const [subjectList, setSubjectList] = useState(() => normalizeSubjects(subjects))
  const [newSubject, setNewSubject] = useState('')
  const [editingSubject, setEditingSubject] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setSubjectList(normalizeSubjects(subjects))
  }, [subjects])

  const commitSubjects = async (nextSubjects) => {
    if (isSaving) return false

    setIsSaving(true)
    try {
      const saved = await onChange?.(nextSubjects)
      if (saved === false) {
        setError('Could not save your subjects. Please try again.')
        return false
      }

      setSubjectList(nextSubjects)
      setError('')
      return true
    } catch (saveError) {
      setError(saveError?.message || 'Could not save your subjects. Please try again.')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const isDuplicate = (name, ignoredName = null) => {
    const normalizedName = name.toLocaleLowerCase()
    const normalizedIgnoredName = ignoredName?.toLocaleLowerCase()

    return subjectList.some((subject) => (
      subject.toLocaleLowerCase() === normalizedName
      && subject.toLocaleLowerCase() !== normalizedIgnoredName
    ))
  }

  const addSubject = async () => {
    if (isSaving) return
    const name = newSubject.trim()

    if (!name) {
      setError('Enter a subject name first.')
      return
    }

    if (isDuplicate(name)) {
      setError('This subject already exists.')
      return
    }

    const saved = await commitSubjects([...subjectList, name])
    if (!saved) return
    setNewSubject('')
    setError('')
  }

  const startEditing = (subject) => {
    setEditingSubject(subject)
    setEditingValue(subject)
    setError('')
  }

  const cancelEditing = () => {
    setEditingSubject(null)
    setEditingValue('')
    setError('')
  }

  const saveEditing = async () => {
    if (isSaving) return
    const name = editingValue.trim()

    if (!name) {
      setError('Enter a subject name first.')
      return
    }

    if (isDuplicate(name, editingSubject)) {
      setError('This subject already exists.')
      return
    }

    const saved = await commitSubjects(subjectList.map((subject) => (
      subject === editingSubject ? name : subject
    )))
    if (!saved) return
    cancelEditing()
  }

  const deleteSubject = (subject) => {
    Alert.alert(
      'Delete subject?',
      `Remove ${subject} from your study list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (isSaving) return
            const saved = await commitSubjects(subjectList.filter((item) => item !== subject))
            if (!saved) return
            if (editingSubject === subject) cancelEditing()
          },
        },
      ],
    )
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces
          alwaysBounceVertical
          overScrollMode="always"
        >
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [styles.headerSide, pressed && styles.headerSidePressed]}
              onPress={onBack}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Back to profile settings"
            >
              <LineIcon name="back" size={22} color="#151A15" />
            </Pressable>
            <Text style={styles.headerTitle}>My subjects</Text>
            <View style={styles.headerSide} />
          </View>

          <Text style={styles.description}>
            Create the subjects you want to use across your study tools.
          </Text>

          <View style={styles.addCard}>
            <Text style={styles.sectionTitle}>Add a subject</Text>
            <View style={styles.addRow}>
              <TextInput
                style={styles.input}
                value={newSubject}
                onChangeText={(value) => {
                  setNewSubject(value)
                  setError('')
                }}
                onSubmitEditing={addSubject}
                placeholder="e.g. Computer Networks"
                placeholderTextColor="#A4ACA4"
                autoCapitalize="words"
                returnKeyType="done"
                maxLength={60}
                accessibilityLabel="New subject name"
              />
              <Pressable
                style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
                onPress={addSubject}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Add subject"
              >
                <LineIcon name="plus" size={17} color="#FFFFFF" />
                <Text style={styles.addButtonText}>{isSaving ? 'Saving' : 'Add'}</Text>
              </Pressable>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Your subjects</Text>
              <Text style={styles.countText}>{subjectList.length}</Text>
            </View>

            {subjectList.length > 0 ? subjectList.map((subject, index) => (
              <View key={subject.toLocaleLowerCase()} style={styles.subjectRow}>
                <View style={styles.subjectNumber}>
                  <Text style={styles.subjectNumberText}>{index + 1}</Text>
                </View>

                {editingSubject === subject ? (
                  <View style={styles.editContent}>
                    <TextInput
                      style={styles.editInput}
                      value={editingValue}
                      onChangeText={(value) => {
                        setEditingValue(value)
                        setError('')
                      }}
                      editable={!isSaving}
                      autoCapitalize="words"
                      maxLength={60}
                      accessibilityLabel={`Edit ${subject}`}
                    />
                    <View style={styles.editActions}>
                      <Pressable
                        style={({ pressed }) => [styles.textAction, pressed && styles.buttonPressed]}
                        onPress={cancelEditing}
                        disabled={isSaving}
                        accessibilityRole="button"
                        accessibilityLabel={`Cancel editing ${subject}`}
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [styles.saveButton, pressed && styles.buttonPressed]}
                        onPress={saveEditing}
                        disabled={isSaving}
                        accessibilityRole="button"
                        accessibilityLabel={`Save ${subject}`}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.subjectName} numberOfLines={2}>{subject}</Text>
                    <View style={styles.rowActions}>
                      <Pressable
                        style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressed]}
                        onPress={() => startEditing(subject)}
                        disabled={isSaving}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${subject}`}
                      >
                        <LineIcon name="edit" size={17} color="#438C31" />
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressed]}
                        onPress={() => deleteSubject(subject)}
                        disabled={isSaving}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${subject}`}
                      >
                        <LineIcon name="trash" size={17} color="#A73737" />
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            )) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <LineIcon name="cards" size={24} color="#438C31" />
                </View>
                <Text style={styles.emptyTitle}>No subjects yet</Text>
                <Text style={styles.emptyCopy}>
                  Add your first subject above to use it in Focus, Quiz, and Quick Q&amp;A.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
