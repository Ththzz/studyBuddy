import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/flashcardsScreenStyles'

function FilterChip({ label, selected, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.filterChip,
        selected && styles.filterChipActive,
        pressed && styles.filterChipPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Filter by ${label}`}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  )
}

function DeckCard({ deck, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.deckCard, pressed && styles.deckCardPressed]}
      onPress={() => onPress(deck)}
      accessibilityRole="button"
      accessibilityLabel={`${deck.name}, ${deck.mastery}% mastered, ${deck.subtitle}`}
    >
      <View style={[styles.deckCover, { backgroundColor: deck.coverColor }]}>
        <LineIcon name="cards" size={21} color={deck.color} />
      </View>
      <View style={styles.deckInfo}>
        <Text style={styles.deckName} numberOfLines={1}>{deck.name}</Text>
        <Text style={styles.deckSubtitle}>{deck.subtitle}</Text>
        <View
          style={styles.deckProgressTrack}
          accessibilityRole="progressbar"
          accessibilityLabel={`${deck.name} mastery`}
          accessibilityValue={{ min: 0, max: 100, now: deck.mastery, text: `${deck.mastery}%` }}
        >
          <View style={[styles.deckProgressFill, { width: `${deck.mastery}%`, backgroundColor: deck.color }]} />
        </View>
      </View>
      <Text style={[styles.mastery, { color: deck.color }]}>{deck.mastery}%</Text>
      <LineIcon name="chevron" size={18} color="#697269" />
    </Pressable>
  )
}

export default function FlashcardsScreen({
  decks = [],
  loadState = 'ready',
  loadError = null,
  onRetry,
  onBack,
  onStudyDeck,
  onCreateDeck,
}) {
  const [query, setQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All decks')
  const [sortMode, setSortMode] = useState('recent')
  const filters = useMemo(() => [
    'All decks',
    ...Array.from(new Set(decks.map((deck) => deck.name).filter((name) => name && name !== 'All decks'))),
  ], [decks])

  const filteredDecks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const nextDecks = decks.filter((deck) => {
      const matchesQuery = !normalizedQuery || deck.name.toLowerCase().includes(normalizedQuery)
      const matchesSubject = subjectFilter === 'All decks' || deck.name === subjectFilter

      return matchesQuery && matchesSubject
    })

    if (sortMode === 'mastery') {
      return [...nextDecks].sort((left, right) => right.mastery - left.mastery)
    }

    if (sortMode === 'name') {
      return [...nextDecks].sort((left, right) => left.name.localeCompare(right.name))
    }

    return [...nextDecks].sort((left, right) => (
      new Date(right.latestReviewedAt || right.createdAt || 0).getTime()
      - new Date(left.latestReviewedAt || left.createdAt || 0).getTime()
    ))
  }, [decks, query, sortMode, subjectFilter])

  const handleSort = () => {
    setSortMode((currentMode) => {
      if (currentMode === 'recent') return 'mastery'
      if (currentMode === 'mastery') return 'name'
      return 'recent'
    })
  }

  const sortLabel = sortMode === 'mastery'
    ? 'Mastery'
    : sortMode === 'name'
      ? 'Name'
      : 'Recent'

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />

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
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Remember more</Text>
          <Text style={styles.headerTitle}>Flashcards</Text>
        </View>
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
        <View style={styles.searchBox}>
          <LineIcon name="search" size={18} color="#697269" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search your decks"
            placeholderTextColor="#8A9388"
            accessibilityLabel="Search flashcard decks"
            returnKeyType="search"
          />
          {query ? (
            <Pressable
              style={styles.clearButton}
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear deck search"
            >
              <LineIcon name="x" size={16} color="#697269" />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              selected={subjectFilter === filter}
              onPress={() => setSubjectFilter(filter)}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Your decks</Text>
          <Pressable
            style={({ pressed }) => [styles.sortButton, pressed && styles.sortButtonPressed]}
            onPress={handleSort}
            accessibilityRole="button"
            accessibilityLabel={`Sort flashcard decks by ${sortLabel}`}
            accessibilityHint="Tap to switch between Recent, Mastery, and Name"
          >
            <Text style={styles.sortText}>{sortLabel}</Text>
          </Pressable>
        </View>

        {loadState === 'loading' ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Loading your decks</Text>
            <Text style={styles.emptyCopy}>Your saved flashcards will appear here.</Text>
          </View>
        ) : loadState === 'error' ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Could not load decks</Text>
            <Text style={styles.emptyCopy}>{loadError || 'Check your connection and try again.'}</Text>
            <Pressable
              style={({ pressed }) => [styles.createButton, pressed && styles.buttonPressed]}
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading flashcard decks"
            >
              <Text style={styles.createButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : filteredDecks.length > 0 ? filteredDecks.map((deck) => (
          <DeckCard key={deck.id} deck={deck} onPress={onStudyDeck} />
        )) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <LineIcon name="cards" size={24} color="#438C31" />
            </View>
            <Text style={styles.emptyTitle}>{decks.length === 0 ? 'No flashcard decks yet' : 'No decks found'}</Text>
            <Text style={styles.emptyCopy}>
              {decks.length === 0
                ? 'Generate cards from your notes or create a deck to get started.'
                : 'Try another search or create a new deck from your notes.'}
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.createButton, pressed && styles.buttonPressed]}
          onPress={onCreateDeck}
          accessibilityRole="button"
          accessibilityLabel="Create flashcard deck"
        >
          <LineIcon name="plus" size={17} color="#438C31" />
          <Text style={styles.createButtonText}>Create Flashcards</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
