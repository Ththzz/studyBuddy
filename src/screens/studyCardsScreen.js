import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/studyCardsScreenStyles'

function getCardsForDeck(deck) {
  return Array.isArray(deck?.cards) ? deck.cards : []
}

function CardFace({ card, cardNumber, total, flipped, animatedStyle }) {
  return (
    <Animated.View style={[styles.cardSurface, styles.cardFace, flipped && styles.cardSurfaceFlipped, animatedStyle]}>
      <View style={styles.cardTopRow}>
        <Text style={[styles.cardNumber, flipped && styles.cardNumberAnswer]}>
          {flipped ? 'Answer' : 'Question'} {cardNumber} / {total}
        </Text>
      </View>

      <View style={styles.cardContentArea}>
        <Text style={styles.cardContent}>{flipped ? card.answer : card.question}</Text>
      </View>
    </Animated.View>
  )
}

function Flashcard({ card, cardNumber, total, flipped, onPress }) {
  const rotation = useRef(new Animated.Value(flipped ? 1 : 0)).current
  const cardTransition = useRef(new Animated.Value(1)).current
  const hasMountedRef = useRef(false)
  const previousCardIdRef = useRef(card.id)

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return undefined
    }

    rotation.stopAnimation()
    const animation = Animated.timing(rotation, {
      toValue: flipped ? 1 : 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      isInteraction: false,
    })

    animation.start()

    return () => animation.stop()
  }, [flipped, rotation])

  useLayoutEffect(() => {
    if (previousCardIdRef.current === card.id) return undefined

    previousCardIdRef.current = card.id
    rotation.stopAnimation()
    rotation.setValue(0)
    cardTransition.setValue(0)

    const animation = Animated.timing(cardTransition, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      isInteraction: false,
    })

    animation.start()

    return () => animation.stop()
  }, [card.id, cardTransition, rotation])

  const frontRotation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })
  const backRotation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  })
  const cardOpacity = cardTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })
  const cardTranslateX = cardTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  })

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: cardOpacity,
          transform: [{ translateX: cardTranslateX }],
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [styles.cardPressable, pressed && styles.cardPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Card ${cardNumber} of ${total}: ${flipped ? card.answer : card.question}`}
        accessibilityHint="Activate to switch card sides"
      >
        <View style={styles.flipContainer}>
          <CardFace
            card={card}
            cardNumber={cardNumber}
            total={total}
            flipped={false}
            animatedStyle={{
              transform: [{ perspective: 1000 }, { rotateY: frontRotation }],
            }}
          />
          <CardFace
            card={card}
            cardNumber={cardNumber}
            total={total}
            flipped
            animatedStyle={{
              transform: [{ perspective: 1000 }, { rotateY: backRotation }],
            }}
          />
        </View>
      </Pressable>
    </Animated.View>
  )
}

function RatingButton({ label, iconName, tone, disabled, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.ratingButton,
        tone === 'known' ? styles.knownButton : styles.learningButton,
        disabled && styles.ratingButtonDisabled,
        pressed && !disabled && styles.ratingButtonPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
    >
      <LineIcon
        name={iconName}
        size={17}
        color={disabled ? '#A8B0A8' : tone === 'known' ? '#438C31' : '#C8772A'}
      />
      <Text
        style={[
          styles.ratingButtonText,
          tone === 'known' ? styles.knownButtonText : styles.learningButtonText,
          disabled && styles.ratingButtonTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

function CompletionView({ knownCount, learningCount, onRestart, onBack, canSave, onSave }) {
  const total = knownCount + learningCount
  const accuracy = total > 0 ? Math.round((knownCount / total) * 100) : 0

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.completionContent}
      showsVerticalScrollIndicator={false}
      bounces
      alwaysBounceVertical
      overScrollMode="always"
    >
      <View style={styles.completionIcon}>
        <LineIcon name="check" size={30} color="#438C31" />
      </View>
      <Text style={styles.completionTitle}>Nice work!</Text>

      <View style={styles.resultCard}>
        <View style={styles.resultItem}>
          <Text style={styles.resultValue}>{accuracy}%</Text>
          <Text style={styles.resultLabel}>mastered this round</Text>
        </View>
        <View style={styles.resultDivider} />
        <View style={styles.resultItem}>
          <Text style={[styles.resultValue, styles.learningValue]}>{learningCount}</Text>
          <Text style={styles.resultLabel}>to review again</Text>
        </View>
      </View>

      {canSave ? (
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={onSave}
          accessibilityRole="button"
          accessibilityLabel="Save this flashcard deck with a name"
        >
          <Text style={styles.primaryButtonText}>Save with title</Text>
        </Pressable>
      ) : null}
      <Pressable
        style={({ pressed }) => [canSave ? styles.secondaryPrimaryButton : styles.primaryButton, pressed && styles.primaryButtonPressed]}
        onPress={onRestart}
        accessibilityRole="button"
        accessibilityLabel="Study this deck again"
      >
        <Text style={canSave ? styles.secondaryPrimaryButtonText : styles.primaryButtonText}>Study Again</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back to flashcards"
      >
        <LineIcon name="back" size={17} color="#8A8A8A" />
        <Text style={styles.secondaryButtonText}>Back to Flashcards</Text>
      </Pressable>
    </ScrollView>
  )
}

function StopStudyModal({ visible, isTemporaryDeck, canSaveProgress, onCancel, onSave, onConfirm }) {
  const isResumedDeck = !isTemporaryDeck && canSaveProgress
  const canSave = isTemporaryDeck
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.confirmationOverlay}>
        <Pressable style={styles.confirmationBackdrop} onPress={onCancel} />
        <View style={styles.confirmationCard} accessibilityViewIsModal>
          <View style={styles.confirmationIcon}>
            <LineIcon name="pause" size={23} color="#438C31" />
          </View>
          <Text style={styles.confirmationTitle}>
            {isTemporaryDeck ? 'Save this deck first?' : isResumedDeck ? 'Your progress is saved' : 'Stop this session?'}
          </Text>
          <Text style={styles.confirmationCopy}>
            {isTemporaryDeck
              ? 'Save it with a name if you would like to find it later.'
              : isResumedDeck ? 'You can continue from this card later.' : 'Your progress will be lost.'}
          </Text>

          <View style={canSave || isResumedDeck ? styles.confirmationButtonColumn : styles.confirmationButtonRow}>
            {canSave ? (
              <Pressable
                style={({ pressed }) => [styles.confirmationButton, styles.confirmationSaveButton, pressed && styles.confirmationButtonPressed]}
                onPress={onSave}
                accessibilityRole="button"
              >
                <Text style={styles.confirmationStopText}>Save &amp; leave</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={({ pressed }) => [
                styles.confirmationButton,
                styles.confirmationCancelButton,
                pressed && styles.confirmationButtonPressed,
              ]}
              onPress={onCancel}
              accessibilityRole="button"
            >
              <Text style={styles.confirmationCancelText}>Keep studying</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.confirmationButton,
                isResumedDeck ? styles.confirmationSaveButton : styles.confirmationStopButton,
                pressed && styles.confirmationButtonPressed,
              ]}
              onPress={onConfirm}
              accessibilityRole="button"
            >
              <Text style={styles.confirmationStopText}>
                {isTemporaryDeck ? 'Leave without saving' : isResumedDeck ? 'Return to Flashcards' : 'Stop'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

function SaveDeckModal({ visible, defaultTitle, isSaving, error, onClose, onSave }) {
  const [title, setTitle] = useState(defaultTitle)

  useEffect(() => {
    if (visible) setTitle(defaultTitle)
  }, [defaultTitle, visible])

  const submit = () => {
    const trimmedTitle = title.trim()
    if (trimmedTitle) onSave(trimmedTitle)
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.confirmationOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.confirmationBackdrop} onPress={isSaving ? undefined : onClose} />
        <View style={styles.confirmationCard} accessibilityViewIsModal>
          <Text style={styles.confirmationTitle}>Name your flashcard deck</Text>
          <Text style={styles.confirmationCopy}>Save this deck to Flashcards with a name.</Text>
          <TextInput
            autoCapitalize="sentences"
            autoFocus
            editable={!isSaving}
            maxLength={120}
            onChangeText={setTitle}
            onSubmitEditing={submit}
            placeholder="Deck name"
            placeholderTextColor="#899187"
            returnKeyType="done"
            style={styles.titleInput}
            value={title}
            accessibilityLabel="Flashcard deck name"
          />
          {error ? <Text style={styles.saveErrorText}>{error}</Text> : null}
          <View style={styles.confirmationButtonRow}>
            <Pressable style={({ pressed }) => [styles.confirmationButton, styles.confirmationCancelButton, pressed && !isSaving && styles.confirmationButtonPressed]} disabled={isSaving} onPress={onClose} accessibilityRole="button">
              <Text style={styles.confirmationCancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.confirmationButton, styles.confirmationSaveButton, pressed && !isSaving && styles.confirmationButtonPressed]} disabled={isSaving || !title.trim()} onPress={submit} accessibilityRole="button" accessibilityState={{ disabled: isSaving || !title.trim(), busy: isSaving }}>
              {isSaving ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
              <Text style={styles.confirmationStopText}>{isSaving ? 'Saving…' : 'Save deck'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

function getRestoredProgress(cards, checkpoint) {
  const reviews = Array.isArray(checkpoint?.reviews) ? checkpoint.reviews : []
  const validCardIds = new Set(cards.map((card) => card.id))
  const ratings = reviews.reduce((result, review) => {
    if (!validCardIds.has(review.cardId)) return result
    if (review.rating !== 'known' && review.rating !== 'learning') return result
    result[review.cardId] = { rating: review.rating, reviewedAt: review.reviewedAt }
    return result
  }, {})
  const nextUnreviewedIndex = cards.findIndex((card) => !ratings[card.id])
  return { ratings, nextUnreviewedIndex }
}

export default function StudyCardsScreen({ deck, onBack, onReview, onSaveTemporaryDeck, onSaveProgress, onClearProgress }) {
  const { width: screenWidth } = useWindowDimensions()
  const deckName = deck?.name || 'Flashcards'
  const cards = useMemo(() => getCardsForDeck(deck), [deck])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [ratings, setRatings] = useState({})
  const [isSavingReview, setIsSavingReview] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showStopModal, setShowStopModal] = useState(false)
  const [showSaveDeckModal, setShowSaveDeckModal] = useState(false)
  const [isSavingDeck, setIsSavingDeck] = useState(false)
  const [saveDeckError, setSaveDeckError] = useState('')
  const completionTransition = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const restoredProgress = getRestoredProgress(cards, deck?.resumeCheckpoint)
    setCurrentIndex(Math.max(0, restoredProgress.nextUnreviewedIndex))
    setFlipped(false)
    setRatings(restoredProgress.ratings)
    setIsComplete(cards.length > 0 && restoredProgress.nextUnreviewedIndex < 0)
  }, [deck?.id, deck?.resumeCheckpoint])

  useLayoutEffect(() => {
    completionTransition.stopAnimation()

    if (!isComplete) {
      completionTransition.setValue(0)
      return undefined
    }

    completionTransition.setValue(0)

    const animation = Animated.timing(completionTransition, {
      toValue: 1,
      duration: 190,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      isInteraction: false,
    })

    animation.start()

    return () => animation.stop()
  }, [completionTransition, isComplete])

  const currentCard = cards[currentIndex]
  const isTemporaryDeck = deck?.isTemporary === true
  const canSaveProgress = !isTemporaryDeck && Boolean(deck?.resumeCheckpoint)
  const ratedCount = Object.keys(ratings).length
  const knownCount = Object.values(ratings).filter((review) => review.rating === 'known').length
  const learningCount = Object.values(ratings).filter((review) => review.rating === 'learning').length
  const progressPercent = cards.length > 0 ? Math.round((ratedCount / cards.length) * 100) : 0

  const handleRating = async (rating) => {
    if (!flipped || !currentCard || isSavingReview) return

    const reviewedAt = new Date().toISOString()
    setIsSavingReview(true)
    try {
      if (!isTemporaryDeck) {
        const saved = await onReview?.({
          flashcardId: currentCard.id,
          confidence: rating === 'known' ? 3 : 0,
          reviewedAt,
        })
        if (saved === false) return
      }
    } catch (error) {
      Alert.alert('Review not saved', error?.message || 'Check your connection and try again.')
      return
    } finally {
      setIsSavingReview(false)
    }

    setRatings((previousRatings) => ({
      ...previousRatings,
      [currentCard.id]: { rating, reviewedAt },
    }))

    if (currentIndex >= cards.length - 1) {
      setIsComplete(true)
      if (isTemporaryDeck) setShowSaveDeckModal(true)
      if (canSaveProgress) {
        void onClearProgress?.().catch((error) => console.warn('Flashcard progress could not be cleared', error))
      }
      return
    }

    setCurrentIndex((previousIndex) => previousIndex + 1)
    setFlipped(false)
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setFlipped(false)
    setRatings({})
    setIsComplete(false)
    if (canSaveProgress) {
      void onClearProgress?.().catch((error) => console.warn('Flashcard progress could not be cleared', error))
    }
  }

  const openSaveDeckModal = () => {
    setShowStopModal(false)
    setSaveDeckError('')
    setShowSaveDeckModal(true)
  }

  const handleSaveDeck = async (title) => {
    if (!isTemporaryDeck || isSavingDeck) return

    setIsSavingDeck(true)
    setSaveDeckError('')
    try {
      const reviews = Object.entries(ratings).map(([cardId, review]) => ({
        cardId,
        confidence: review.rating === 'known' ? 3 : 0,
        reviewedAt: review.reviewedAt,
      }))
      const saved = await onSaveTemporaryDeck?.({ title, reviews })
      if (saved === false) return
      setShowSaveDeckModal(false)
      setShowStopModal(false)
      onBack()
    } catch (error) {
      setSaveDeckError(error?.message || 'The deck could not be saved. Please try again.')
    } finally {
      setIsSavingDeck(false)
    }
  }

  const handleSaveProgress = async () => {
    if (!canSaveProgress) return

    try {
      const reviews = Object.entries(ratings).map(([cardId, review]) => ({
        cardId,
        rating: review.rating,
        reviewedAt: review.reviewedAt,
      }))
      const saved = await onSaveProgress?.({ reviews })
      if (saved === false) return
      setShowStopModal(false)
      onBack()
    } catch (error) {
      Alert.alert('Progress not saved', error?.message || 'Check your connection and try again.')
    }
  }

  const handleBackPress = () => {
    if (isComplete || cards.length === 0) {
      onBack()
      return
    }

    setShowStopModal(true)
  }

  const handleStopConfirm = async () => {
    if (canSaveProgress) {
      await handleSaveProgress()
      return
    }
    setShowStopModal(false)
    onBack()
  }

  const handleCompletionBack = () => {
    if (canSaveProgress) {
      void onClearProgress?.().catch((error) => console.warn('Flashcard progress could not be cleared', error))
    }
    onBack()
  }

  const completionTranslateX = completionTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [screenWidth, 0],
  })

  return (
    <View style={styles.transitionHost}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerSide, pressed && styles.headerSidePressed]}
          onPress={handleBackPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back to flashcards"
        >
          <LineIcon name="back" size={22} color="#151A15" />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle} numberOfLines={1}>{deckName}</Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      {isComplete ? (
        <Animated.View style={[styles.flex, { transform: [{ translateX: completionTranslateX }] }]}>
          <CompletionView
            knownCount={knownCount}
            learningCount={learningCount}
            onRestart={handleRestart}
            onBack={handleCompletionBack}
            canSave={isTemporaryDeck}
            onSave={openSaveDeckModal}
          />
        </Animated.View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces
          alwaysBounceVertical
          overScrollMode="always"
        >
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>{ratedCount} of {cards.length} reviewed</Text>
            </View>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityLabel="Flashcard study progress"
            accessibilityValue={{ min: 0, max: 100, now: progressPercent, text: `${progressPercent}%` }}
          >
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          {currentCard ? (
            <>
              <Flashcard
                card={currentCard}
                cardNumber={currentIndex + 1}
                total={cards.length}
                flipped={flipped}
                onPress={() => setFlipped((previousFlipped) => !previousFlipped)}
              />

              <View style={styles.ratingRow}>
                <RatingButton
                  label="Still learning"
                  iconName="x"
                  tone="learning"
                  disabled={!flipped || isSavingReview}
                  onPress={() => handleRating('learning')}
                />
                <RatingButton
                  label="I know this"
                  iconName="check"
                  tone="known"
                  disabled={!flipped || isSavingReview}
                  onPress={() => handleRating('known')}
                />
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No cards available</Text>
              <Text style={styles.emptyCopy}>Go back and choose another deck.</Text>
            </View>
          )}
        </ScrollView>
      )}
      </SafeAreaView>
      <StopStudyModal
        visible={showStopModal}
        isTemporaryDeck={isTemporaryDeck}
        canSaveProgress={canSaveProgress}
        onCancel={() => setShowStopModal(false)}
        onSave={isTemporaryDeck ? openSaveDeckModal : handleSaveProgress}
        onConfirm={handleStopConfirm}
      />
      <SaveDeckModal
        visible={showSaveDeckModal}
        defaultTitle={deckName}
        isSaving={isSavingDeck}
        error={saveDeckError}
        onClose={() => { if (!isSavingDeck) setShowSaveDeckModal(false) }}
        onSave={handleSaveDeck}
      />
    </View>
  )
}
