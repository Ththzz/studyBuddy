import React, { useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/createFlashcardsScreenStyles'

function createEmptyCard(id) {
  return { id: `new-card-${id}`, question: '', answer: '' }
}

export default function CreateFlashcardsScreen({ onBack, onSave }) {
  const [deckName, setDeckName] = useState('')
  const [cards, setCards] = useState([createEmptyCard(1)])
  const nextCardIdRef = useRef(2)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [hasSavedDeck, setHasSavedDeck] = useState(false)

  const updateCard = (cardId, field, value) => {
    setCards((currentCards) => currentCards.map((card) => (
      card.id === cardId ? { ...card, [field]: value } : card
    )))
    setError('')
  }

  const addCard = () => {
    const nextCardId = nextCardIdRef.current
    nextCardIdRef.current += 1
    setCards((currentCards) => [...currentCards, createEmptyCard(nextCardId)])
    setError('')
  }

  const removeCard = (cardId) => {
    setCards((currentCards) => currentCards.filter((card) => card.id !== cardId))
    setError('')
  }

  const saveDeck = async () => {
    if (isSaving || hasSavedDeck) return

    const trimmedName = deckName.trim()
    const normalizedCards = cards
      .map((card, index) => ({
        ...card,
        cardNumber: index + 1,
        question: card.question.trim(),
        answer: card.answer.trim(),
      }))
    const incompleteCard = normalizedCards.find((card) => (
      (card.question || card.answer) && !(card.question && card.answer)
    ))
    const completeCards = normalizedCards.filter((card) => card.question && card.answer)

    if (!trimmedName) {
      setError('Enter a deck name first.')
      return
    }

    if (incompleteCard) {
      setError(`Complete both fields for Card ${incompleteCard.cardNumber}, or remove it.`)
      return
    }

    if (completeCards.length === 0) {
      setError('Add at least one question and answer.')
      return
    }

    setIsSaving(true)
    try {
      const result = await onSave?.({
        name: trimmedName,
        cards: completeCards.map(({ cardNumber, ...card }) => card),
      })
      if (result?.saved === true) setHasSavedDeck(true)
    } catch (saveError) {
      setError(saveError?.message || 'The deck could not be saved. Please try again.')
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
              accessibilityLabel="Back to flashcards"
            >
              <LineIcon name="back" size={22} color="#151A15" />
            </Pressable>
            <Text style={styles.headerTitle}>Create flashcards</Text>
            <View style={styles.headerSide} />
          </View>

          <Text style={styles.description}>
            Add your own questions and answers to build a deck.
          </Text>

          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Deck name</Text>
            <TextInput
              style={styles.input}
              value={deckName}
              onChangeText={(value) => {
                setDeckName(value)
                setError('')
              }}
              placeholder="e.g. Network security review"
              placeholderTextColor="#A4ACA4"
              autoCapitalize="words"
              maxLength={60}
              accessibilityLabel="Flashcard deck name"
            />
          </View>

          <View style={styles.cardsHeader}>
            <Text style={styles.sectionTitle}>Cards</Text>
            <Text style={styles.cardCount}>{cards.length}</Text>
          </View>

          {cards.map((card, index) => (
            <View key={card.id} style={styles.cardForm}>
              <View style={styles.cardFormHeader}>
                <Text style={styles.cardNumber}>Card {index + 1}</Text>
                {cards.length > 1 ? (
                  <Pressable
                    style={({ pressed }) => [styles.removeCardButton, pressed && styles.buttonPressed]}
                    onPress={() => removeCard(card.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove card ${index + 1}`}
                  >
                    <LineIcon name="trash" size={16} color="#A73737" />
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.fieldLabel}>Question</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={card.question}
                onChangeText={(value) => updateCard(card.id, 'question', value)}
                placeholder="Write the question"
                placeholderTextColor="#A4ACA4"
                multiline
                textAlignVertical="top"
                maxLength={280}
                accessibilityLabel={`Question for card ${index + 1}`}
              />

              <Text style={styles.fieldLabel}>Answer</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={card.answer}
                onChangeText={(value) => updateCard(card.id, 'answer', value)}
                placeholder="Write the answer"
                placeholderTextColor="#A4ACA4"
                multiline
                textAlignVertical="top"
                maxLength={500}
                accessibilityLabel={`Answer for card ${index + 1}`}
              />
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [styles.addCardButton, pressed && styles.buttonPressed]}
            onPress={addCard}
            accessibilityRole="button"
            accessibilityLabel="Add another flashcard"
          >
            <LineIcon name="plus" size={17} color="#438C31" />
            <Text style={styles.addCardText}>Add another card</Text>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [styles.saveButton, pressed && styles.buttonPressed]}
            onPress={saveDeck}
            disabled={isSaving || hasSavedDeck}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving || hasSavedDeck, busy: isSaving }}
            accessibilityLabel={hasSavedDeck ? 'Flashcard deck saved' : 'Save flashcard deck'}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving…' : hasSavedDeck ? 'Deck saved' : 'Save deck'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
