import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import LineIcon from '../components/lineIcon'
import styles from '../styles/studyCardsScreenStyles'

const CARD_SETS = {
  'computer-networks': [
    {
      id: 'dns',
      question: 'What does DNS do?',
      answer: 'DNS translates a human-readable domain name, such as example.com, into an IP address that devices can use to connect.',
    },
    {
      id: 'osi-transport',
      question: 'Which OSI layer is responsible for end-to-end delivery?',
      answer: 'The Transport layer (Layer 4) manages end-to-end delivery, reliability, flow control, and segmentation.',
    },
    {
      id: 'tcp-udp',
      question: 'What is the main difference between TCP and UDP?',
      answer: 'TCP is connection-oriented and prioritizes reliable, ordered delivery. UDP is connectionless and prioritizes lower overhead and speed.',
    },
    {
      id: 'private-ip',
      question: 'Why are private IP addresses used in a local network?',
      answer: 'Private IP addresses let devices communicate inside a local network without each device needing a globally routable public address.',
    },
    {
      id: 'https',
      question: 'What does HTTPS add to HTTP?',
      answer: 'HTTPS uses TLS to encrypt the connection and help verify the identity of the server.',
    },
  ],
  database: [
    {
      id: 'primary-key',
      question: 'What is the purpose of a primary key?',
      answer: 'A primary key uniquely identifies each row in a table and prevents duplicate or missing identifiers.',
    },
    {
      id: 'normalization',
      question: 'What problem does database normalization help reduce?',
      answer: 'Normalization reduces duplicated data and prevents update, insert, and delete anomalies.',
    },
    {
      id: 'sql-join',
      question: 'What does an INNER JOIN return?',
      answer: 'It returns only the rows where the join condition matches in both tables.',
    },
    {
      id: 'database-index',
      question: 'Why would a database use an index?',
      answer: 'An index helps the database find rows faster, although it adds storage cost and can make writes slightly slower.',
    },
    {
      id: 'acid',
      question: 'What does ACID describe in a transaction?',
      answer: 'ACID describes Atomicity, Consistency, Isolation, and Durability—the properties that make transactions reliable.',
    },
  ],
  'ai-foundations': [
    {
      id: 'supervised-learning',
      question: 'What is supervised learning?',
      answer: 'Supervised learning trains a model with labelled examples so it can learn to predict labels for new inputs.',
    },
    {
      id: 'overfitting',
      question: 'What is overfitting?',
      answer: 'Overfitting happens when a model memorizes training data too closely and performs poorly on unseen data.',
    },
    {
      id: 'feature',
      question: 'What is a feature in machine learning?',
      answer: 'A feature is an input variable or measurable property used by a model to make a prediction.',
    },
    {
      id: 'validation-set',
      question: 'Why use a validation set?',
      answer: 'A validation set helps compare model choices and tune settings without using the final test data.',
    },
    {
      id: 'precision',
      question: 'What does precision measure?',
      answer: 'Precision measures how many of the items predicted as positive were actually positive.',
    },
  ],
}

function getCardsForDeck(deckId) {
  return CARD_SETS[deckId] || CARD_SETS['computer-networks']
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

function CompletionView({ knownCount, learningCount, onRestart, onBack }) {
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

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        onPress={onRestart}
        accessibilityRole="button"
        accessibilityLabel="Study this deck again"
      >
        <Text style={styles.primaryButtonText}>Study Again</Text>
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

function StopStudyModal({ visible, onCancel, onConfirm }) {
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
          <Text style={styles.confirmationTitle}>Stop this session?</Text>
          <Text style={styles.confirmationCopy}>Your progress will be lost.</Text>

          <View style={styles.confirmationButtonRow}>
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
                styles.confirmationStopButton,
                pressed && styles.confirmationButtonPressed,
              ]}
              onPress={onConfirm}
              accessibilityRole="button"
            >
              <Text style={styles.confirmationStopText}>Stop</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default function StudyCardsScreen({ deck, onBack }) {
  const { width: screenWidth } = useWindowDimensions()
  const deckName = deck?.name || 'Flashcards'
  const cards = useMemo(() => getCardsForDeck(deck?.id), [deck?.id])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [ratings, setRatings] = useState({})
  const [isComplete, setIsComplete] = useState(false)
  const [showStopModal, setShowStopModal] = useState(false)
  const completionTransition = useRef(new Animated.Value(0)).current

  useEffect(() => {
    setCurrentIndex(0)
    setFlipped(false)
    setRatings({})
    setIsComplete(false)
  }, [deck?.id])

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
  const ratedCount = Object.keys(ratings).length
  const knownCount = Object.values(ratings).filter((rating) => rating === 'known').length
  const learningCount = Object.values(ratings).filter((rating) => rating === 'learning').length
  const progressPercent = cards.length > 0 ? Math.round((ratedCount / cards.length) * 100) : 0

  const handleRating = (rating) => {
    if (!flipped || !currentCard) return

    setRatings((previousRatings) => ({
      ...previousRatings,
      [currentCard.id]: rating,
    }))

    if (currentIndex >= cards.length - 1) {
      setIsComplete(true)
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
  }

  const handleBackPress = () => {
    if (isComplete || cards.length === 0) {
      onBack()
      return
    }

    setShowStopModal(true)
  }

  const handleStopConfirm = () => {
    setShowStopModal(false)
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
            onBack={onBack}
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
                  disabled={!flipped}
                  onPress={() => handleRating('learning')}
                />
                <RatingButton
                  label="I know this"
                  iconName="check"
                  tone="known"
                  disabled={!flipped}
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
        onCancel={() => setShowStopModal(false)}
        onConfirm={handleStopConfirm}
      />
    </View>
  )
}
