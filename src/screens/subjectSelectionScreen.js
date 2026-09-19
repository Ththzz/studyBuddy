import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/subjectSelectionScreenStyles'

const FALLBACK_SUBJECT = 'General Study'

function normalizeSubjects(subjects) {
  const seen = new Set()

  return (Array.isArray(subjects) ? subjects : []).reduce((result, subject) => {
    const subjectName = typeof subject === 'string'
      ? subject.trim()
      : subject && typeof subject.name === 'string'
        ? subject.name.trim()
        : ''
    const normalizedKey = subjectName.toLocaleLowerCase()

    if (subjectName && !seen.has(normalizedKey)) {
      seen.add(normalizedKey)
      result.push(subjectName)
    }

    return result
  }, [])
}

function SubjectOption({ name, selected, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.subjectOption,
        selected && styles.subjectOptionSelected,
        pressed && styles.subjectOptionPressed,
      ]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={`Choose ${name}`}
      accessibilityState={{ selected }}
    >
      <View style={[styles.subjectIcon, selected && styles.subjectIconSelected]}>
        <LineIcon
          name={selected ? 'check' : 'chart'}
          size={18}
          color={selected ? '#438C31' : '#697269'}
        />
      </View>

      <Text style={[styles.subjectName, selected && styles.subjectNameSelected]} numberOfLines={2}>
        {name}
      </Text>

      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  )
}

function EmptySubjectState({ onContinue }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <LineIcon name="chart" size={24} color="#438C31" />
      </View>
      <Text style={styles.emptyTitle}>No subjects yet</Text>
      <Text style={styles.emptyCopy}>
        You can still start a general focus session and add subjects later.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.fallbackButton, pressed && styles.buttonPressed]}
        onPress={() => onContinue(FALLBACK_SUBJECT)}
        accessibilityRole="button"
        accessibilityLabel="Continue with General Study"
      >
        <Text style={styles.fallbackButtonText}>Continue with General Study</Text>
      </Pressable>
    </View>
  )
}

export default function SubjectSelectionScreen({ subjects, onBack, onContinue }) {
  const [selectedSubjectName, setSelectedSubjectName] = useState('')
  const subjectOptions = useMemo(() => normalizeSubjects(subjects), [subjects])
  const canContinue = Boolean(selectedSubjectName)

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
        alwaysBounceVertical
        overScrollMode="always"
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <LineIcon name="back" size={22} color="#151A15" />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Start a focus session</Text>
          <Text style={styles.title}>Choose a subject</Text>
          <Text style={styles.bodyCopy}>
            Pick what you want to study and we&apos;ll keep the session connected to it.
          </Text>
        </View>

        {subjectOptions.length > 0 ? (
          <>
            <View style={styles.optionList} accessibilityRole="radiogroup">
              {subjectOptions.map((subjectName) => (
                <SubjectOption
                  key={subjectName.toLocaleLowerCase()}
                  name={subjectName}
                  selected={selectedSubjectName === subjectName}
                  onPress={() => setSelectedSubjectName(subjectName)}
                />
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.continueButton,
                !canContinue && styles.continueButtonDisabled,
                pressed && canContinue && styles.buttonPressed,
              ]}
              onPress={() => onContinue(selectedSubjectName)}
              disabled={!canContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue to timer"
              accessibilityState={{ disabled: !canContinue }}
            >
              <Text style={styles.continueButtonText}>Continue to Timer</Text>
              <View style={styles.forwardIcon}>
                <LineIcon name="back" size={18} color="#FFFFFF" />
              </View>
            </Pressable>
          </>
        ) : (
          <EmptySubjectState onContinue={onContinue} />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
