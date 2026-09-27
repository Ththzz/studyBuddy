import React, { useState } from 'react'
import {
  Alert,
  Image,
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
import styles from '../styles/profileSettingsScreenStyles'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const GOAL_OPTIONS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hours', minutes: 90 },
  { label: '2 hours', minutes: 120 },
  { label: '3 hours', minutes: 180 },
]

function formatGoal(minutes = 0) {
  const safeMinutes = Number.isFinite(Number(minutes)) ? Math.max(0, Number(minutes)) : 0
  const hours = Math.floor(safeMinutes / 60)
  const remainingMinutes = safeMinutes % 60

  if (hours > 0) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hour${hours === 1 ? '' : 's'}`
  }

  return `${safeMinutes} min`
}

function SettingRow({
  iconName,
  title,
  subtitle,
  value,
  onPress,
  trailing,
  danger = false,
  isLast = false,
  showChevron = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        isLast && styles.settingRowLast,
        pressed && onPress && styles.settingRowPressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
    >
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <LineIcon name={iconName} size={16} color={danger ? '#A73737' : '#438C31'} />
      </View>

      <View style={styles.settingCopy}>
        <Text style={[styles.settingTitle, danger && styles.settingDangerText]}>{title}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>

      {trailing || (value ? <Text style={styles.settingValue}>{value}</Text> : null)}
      {onPress && showChevron ? <LineIcon name="chevron" size={18} color="#A6AFA5" /> : null}
    </Pressable>
  )
}

function SettingsSection({ title, children }) {
  return (
    <View style={styles.settingsGroup}>
      <Text style={styles.settingsGroupTitle}>{title}</Text>
      <View style={styles.settingsCard}>{children}</View>
    </View>
  )
}

function EditorActions({ onCancel, onSave, disabled = false }) {
  return (
    <View style={styles.editorActions}>
      <Pressable
        style={({ pressed }) => [styles.editorCancel, pressed && styles.pressedSmall]}
        onPress={onCancel}
        disabled={disabled}
      >
        <Text style={styles.editorCancelText}>Cancel</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.editorSave, pressed && styles.pressed]}
        onPress={onSave}
        disabled={disabled}
      >
        <Text style={styles.editorSaveText}>{disabled ? 'Saving…' : 'Save changes'}</Text>
      </Pressable>
    </View>
  )
}

export default function ProfileSettingsScreen({
  profile = {},
  dailyTargetMinutes = 120,
  studyDays = [],
  subjects = [],
  notificationsEnabled = true,
  onBack,
  onEditProfile,
  onOpenSubjects,
  onGoalChange,
  onStudyDaysChange,
  onNotificationsChange,
  onSignOut,
}) {
  const currentProfile = {
    fullName: profile.fullName || 'Alex',
    university: profile.university || 'PSU',
    major: profile.major || 'Computer Science',
    year: profile.year || 'Year 2',
  }
  const [activeEditor, setActiveEditor] = useState(null)
  const [goalDraft, setGoalDraft] = useState(String(dailyTargetMinutes))
  const [daysDraft, setDaysDraft] = useState(studyDays)
  const [editorError, setEditorError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const openEditor = (editor) => {
    setEditorError('')

    if (editor === 'goal') setGoalDraft(String(dailyTargetMinutes))
    if (editor === 'days') setDaysDraft(studyDays)

    setActiveEditor(editor)
  }

  const closeEditor = () => {
    setEditorError('')
    setActiveEditor(null)
  }

  const saveGoal = async () => {
    if (isSaving) return
    const minutes = Number(goalDraft)

    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600) {
      setEditorError('Use a whole number from 1 to 600 minutes.')
      return
    }

    setIsSaving(true)
    try {
      const saved = await onGoalChange?.(minutes)
      if (saved === false) {
        setEditorError('Could not save this goal. Please try again.')
        return
      }

      closeEditor()
    } catch (error) {
      setEditorError(error?.message || 'Could not save this goal. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const saveDays = async () => {
    if (isSaving) return
    if (daysDraft.length === 0) {
      setEditorError('Choose at least one study day.')
      return
    }

    setIsSaving(true)
    try {
      const saved = await onStudyDaysChange?.([...daysDraft].sort())
      if (saved === false) {
        setEditorError('Could not save these study days. Please try again.')
        return
      }

      closeEditor()
    } catch (error) {
      setEditorError(error?.message || 'Could not save these study days. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleDay = (index) => {
    setDaysDraft((currentDays) => (
      currentDays.includes(index)
        ? currentDays.filter((day) => day !== index)
        : [...currentDays, index]
    ))
    setEditorError('')
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
              accessibilityLabel="Back to home"
            >
              <LineIcon name="back" size={22} color="#151A15" />
            </Pressable>
            <Text style={styles.headerTitle}>Profile & Settings</Text>
            <View style={styles.headerSide} />
          </View>

          <View style={styles.profileHeroCard}>
            <View style={styles.profileHero}>
              <View style={styles.profileAvatar}>
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={styles.profileAvatarImage} />
                ) : (
                  <Text style={styles.profileAvatarText}>
                    {currentProfile.fullName.trim().charAt(0).toUpperCase() || 'A'}
                  </Text>
                )}
              </View>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{currentProfile.fullName}</Text>
              </View>

              <View style={styles.profileMetaGrid}>
                <View style={styles.profileMetaCard}>
                  <Text style={styles.profileMetaLabel}>University</Text>
                  <Text style={styles.profileMetaValue} numberOfLines={2}>
                    {currentProfile.university}
                  </Text>
                </View>
                <View style={styles.profileMetaCard}>
                  <Text style={styles.profileMetaLabel}>Major</Text>
                  <Text style={styles.profileMetaValue} numberOfLines={2}>
                    {currentProfile.major}
                  </Text>
                </View>
                <View style={styles.profileMetaCard}>
                  <Text style={styles.profileMetaLabel}>Year</Text>
                  <Text style={styles.profileMetaValue} numberOfLines={2}>
                    {currentProfile.year.replace('Year ', '')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <SettingsSection title="Study preferences">
            <SettingRow
              iconName="clock"
              title="Daily study goal"
              subtitle="How much time you want to focus"
              value={formatGoal(dailyTargetMinutes)}
              onPress={() => openEditor('goal')}
            />
            <SettingRow
              iconName="check"
              title="Study days"
              subtitle="Keep your rhythm consistent"
              value={`${studyDays.length} days`}
              onPress={() => openEditor('days')}
            />
            <SettingRow
              iconName="cards"
              title="Main subjects"
              subtitle={`${subjects.length} subjects created`}
              onPress={onOpenSubjects}
              isLast
            />
          </SettingsSection>

          {activeEditor === 'goal' ? (
            <View style={styles.editorPanel}>
              <Text style={styles.editorTitle}>Edit daily study goal</Text>
              <View style={styles.goalGrid}>
                {GOAL_OPTIONS.map((option) => {
                  const isActive = Number(goalDraft) === option.minutes

                  return (
                    <Pressable
                      key={option.minutes}
                      style={({ pressed }) => [
                        styles.choice,
                        isActive && styles.choiceActive,
                        pressed && styles.choicePressed,
                      ]}
                      onPress={() => {
                        setGoalDraft(String(option.minutes))
                        setEditorError('')
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text style={[styles.choiceText, isActive && styles.choiceTextActive]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
              <Text style={styles.editorLabel}>Custom minutes</Text>
              <TextInput
                style={styles.editorInput}
                value={goalDraft}
                onChangeText={(value) => {
                  setGoalDraft(value.replace(/[^0-9]/g, ''))
                  setEditorError('')
                }}
                keyboardType="number-pad"
                maxLength={3}
                inputMode="numeric"
                placeholder="120"
                placeholderTextColor="#A4ACA4"
              />
              {editorError ? <Text style={styles.editorError}>{editorError}</Text> : null}
              <EditorActions onCancel={closeEditor} onSave={saveGoal} disabled={isSaving} />
            </View>
          ) : null}

          {activeEditor === 'days' ? (
            <View style={styles.editorPanel}>
              <Text style={styles.editorTitle}>Choose study days</Text>
              <View style={styles.daysGrid}>
                {DAY_LABELS.map((label, index) => {
                  const isActive = daysDraft.includes(index)

                  return (
                    <Pressable
                      key={`${label}-${index}`}
                      style={({ pressed }) => [
                        styles.dayChoice,
                        isActive && styles.dayChoiceActive,
                        pressed && styles.choicePressed,
                      ]}
                      onPress={() => toggleDay(index)}
                      accessibilityRole="button"
                      accessibilityLabel={`Day ${index + 1}`}
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text style={[styles.dayChoiceText, isActive && styles.dayChoiceTextActive]}>
                        {label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
              {editorError ? <Text style={styles.editorError}>{editorError}</Text> : null}
              <EditorActions onCancel={closeEditor} onSave={saveDays} disabled={isSaving} />
            </View>
          ) : null}

          <SettingsSection title="Account settings">
            <SettingRow
              iconName="user"
              title="Edit profile"
              subtitle="Update your name and study details"
              onPress={onEditProfile}
            />
            <SettingRow
              iconName="settings"
              title="Change password"
              subtitle="Password changes are not available yet"
              onPress={() => Alert.alert(
                'Change password',
                'Password changes are not available in this version yet.',
                [{ text: 'OK' }],
              )}
            />
            <SettingRow
              iconName="bell"
              title="Notifications"
              subtitle="Study reminders and wins"
              value={notificationsEnabled ? 'On' : 'Off'}
              onPress={() => onNotificationsChange?.(!notificationsEnabled)}
              showChevron={false}
              accessibilityState={{ checked: notificationsEnabled }}
              trailing={(
                <View style={[styles.switchTrack, notificationsEnabled && styles.switchTrackActive]}>
                  <View style={[styles.switchThumb, notificationsEnabled && styles.switchThumbActive]} />
                </View>
              )}
            />
            <SettingRow
              iconName="spark"
              title="Appearance"
              subtitle="Follows your device settings"
              value="System"
              onPress={() => Alert.alert(
                'Appearance',
                'Appearance settings will be connected in a later step.',
                [{ text: 'OK' }],
              )}
            />
            <SettingRow
              iconName="settings"
              title="Privacy"
              subtitle="Data controls will be added in a later version"
              onPress={() => Alert.alert(
                'Privacy',
                'Privacy settings will be connected in a later version.',
                [{ text: 'OK' }],
              )}
            />
            <SettingRow
              iconName="back"
              title="Sign out"
              subtitle="Return to the welcome screen"
              onPress={() => Alert.alert(
                'Sign out',
                'Do you want to return to the welcome screen?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign out', style: 'destructive', onPress: onSignOut },
                ],
              )}
              danger
              isLast
              showChevron={false}
            />
          </SettingsSection>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
