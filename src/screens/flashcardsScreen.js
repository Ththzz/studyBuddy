import React, { useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/flashcardsScreenStyles'

const DECKS = [
  {
    id: 'computer-networks',
    name: 'Computer Networks',
    subtitle: '32 cards · Last studied today',
    mastery: 72,
    color: '#76C457',
    coverColor: '#EAF6E4',
  },
  {
    id: 'database',
    name: 'Database essentials',
    subtitle: '24 cards · Last studied yesterday',
    mastery: 48,
    color: '#4D8DDF',
    coverColor: '#E5EFFC',
  },
  {
    id: 'ai-foundations',
    name: 'AI foundations',
    subtitle: '18 cards · Last studied Monday',
    mastery: 91,
    color: '#F59E42',
    coverColor: '#FFF0D9',
  },
]

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

export default function FlashcardsScreen({ onBack, onStudyDeck, onCreateDeck }) {
  const [query, setQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All decks')

  const filteredDecks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return DECKS.filter((deck) => {
      const matchesQuery = !normalizedQuery || deck.name.toLowerCase().includes(normalizedQuery)
      const matchesSubject = subjectFilter === 'All decks'
        || (subjectFilter === 'Computer Networks' && deck.id === 'computer-networks')
        || (subjectFilter === 'Database' && deck.id === 'database')

      return matchesQuery && matchesSubject
    })
  }, [query, subjectFilter])

  const handleSort = () => {
    Alert.alert('Sort decks', 'Deck sorting will be connected in the next step.', [{ text: 'OK' }])
  }

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
          {['All decks', 'Computer Networks', 'Database'].map((filter) => (
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
            accessibilityLabel="Sort flashcard decks"
          >
            <Text style={styles.sortText}>Sort</Text>
          </Pressable>
        </View>

        {filteredDecks.length > 0 ? filteredDecks.map((deck) => (
          <DeckCard key={deck.id} deck={deck} onPress={onStudyDeck} />
        )) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <LineIcon name="cards" size={24} color="#438C31" />
            </View>
            <Text style={styles.emptyTitle}>No decks found</Text>
            <Text style={styles.emptyCopy}>Try another search or create a new deck from your notes.</Text>
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
