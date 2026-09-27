import React, { useState } from 'react'
import {
  ActivityIndicator,
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
import { pickProfileImage } from '../utils/profileImagePicker'
import styles from '../styles/editProfileScreenStyles'

const YEAR_OPTIONS = [
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Year 5',
  'Year 6',
]

function Field({ label, value, placeholder, onChangeText }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#A4ACA4"
        onChangeText={onChangeText}
        autoCapitalize="words"
      />
    </View>
  )
}

export default function EditProfileScreen({ profile = {}, onBack, onSave }) {
  const [fullName, setFullName] = useState(profile.fullName || 'Alex')
  const [university, setUniversity] = useState(profile.university || 'PSU')
  const [major, setMajor] = useState(profile.major || 'Computer Science')
  const [year, setYear] = useState(profile.year || 'Year 2')
  const [avatarUri, setAvatarUri] = useState(profile.avatarUri || null)
  const [isPicking, setIsPicking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handlePickImage = async () => {
    if (isPicking) return

    setIsPicking(true)
    const nextAvatarUri = await pickProfileImage()
    if (nextAvatarUri) setAvatarUri(nextAvatarUri)
    setIsPicking(false)
  }

  const handleSave = async () => {
    if (isSaving) return

    setIsSaving(true)
    try {
      await onSave?.({
        ...profile,
        fullName: fullName.trim() || 'Alex',
        university: university.trim() || 'PSU',
        major: major.trim() || 'Computer Science',
        year,
        avatarUri,
      })
    } finally {
      setIsSaving(false)
    }
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
            <Text style={styles.headerTitle}>Edit profile</Text>
            <View style={styles.headerSide} />
          </View>

          <Text style={styles.description}>
            Keep your study profile up to date.
          </Text>

          <View style={styles.photoCard}>
            <View style={styles.avatar}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {fullName.trim().charAt(0).toUpperCase() || 'A'}
                </Text>
              )}
            </View>

            <View style={styles.photoCopy}>
              <Text style={styles.photoTitle}>Profile picture</Text>
              <Text style={styles.photoDescription}>
                {avatarUri ? 'Photo selected' : 'Add a photo so your profile feels like yours.'}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.uploadButton,
                isPicking && styles.uploadButtonDisabled,
                pressed && !isPicking && styles.pressed,
              ]}
              onPress={handlePickImage}
              disabled={isPicking}
              accessibilityRole="button"
              accessibilityLabel={avatarUri ? 'Change profile picture' : 'Upload profile picture'}
              accessibilityState={{ disabled: isPicking }}
            >
              {isPicking ? (
                <ActivityIndicator size="small" color="#438C31" />
              ) : (
                <Text style={styles.uploadButtonText}>{avatarUri ? 'Change' : 'Upload'}</Text>
              )}
            </Pressable>
          </View>

          <Field
            label="Full name"
            value={fullName}
            placeholder="Alex"
            onChangeText={setFullName}
          />
          <Field
            label="University / School"
            value={university}
            placeholder="Your university"
            onChangeText={setUniversity}
          />
          <Field
            label="Major / Field of study"
            value={major}
            placeholder="Computer Science"
            onChangeText={setMajor}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Current year</Text>
            <View style={styles.yearGrid}>
              {YEAR_OPTIONS.map((option) => {
                const isActive = year === option

                return (
                  <Pressable
                    key={option}
                    style={({ pressed }) => [
                      styles.yearChoice,
                      isActive && styles.yearChoiceActive,
                      pressed && styles.pressedChoice,
                    ]}
                    onPress={() => setYear(option)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text style={[styles.yearChoiceText, isActive && styles.yearChoiceTextActive]}>
                      {option}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.saveButton, isSaving && { opacity: 0.65 }, pressed && !isSaving && styles.pressed]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Save profile changes"
            accessibilityState={{ disabled: isSaving }}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save changes</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
