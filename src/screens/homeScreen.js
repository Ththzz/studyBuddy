import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LineIcon from '../components/lineIcon';
import styles from '../styles/homeScreenStyles';

function ProgressRing() {
  return (
    <View style={styles.ring}>
      <View style={styles.ringInner}>
        <Text style={styles.ringValue}>1h 25m</Text>
        <Text style={styles.ringLabel}>of 2h goal</Text>
      </View>
    </View>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function StudyCard({ color, title, subtitle, progress, time }) {
  return (
    <View style={styles.subjectCard}>
      <View style={[styles.subjectDot, { backgroundColor: color }]} />

      <View style={styles.subjectInfo}>
        <Text style={styles.subjectTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subjectSubtitle}>{subtitle}</Text>
        <View style={styles.miniProgress}>
          <View
            style={[
              styles.miniProgressFill,
              { width: `${progress}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>

      <Text style={styles.subjectTime}>{time}</Text>
    </View>
  );
}

function QuickAction({ iconName, label, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickCard,
        pressed && styles.quickCardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.quickIcon}>
        <LineIcon name={iconName} size={18} color="#438C31" />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function NavItem({ iconName, label, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.navItem,
        pressed && styles.navItemPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <LineIcon name={iconName} size={19} color="#697269" />
      <Text style={styles.navLabel}>{label}</Text>
    </Pressable>
  );
}

function HomeNavItem({ onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.centerNav,
        pressed && styles.centerNavPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Home"
    >
      {({ pressed }) => (
        <>
          <View
            style={[
              styles.centerHomeGlow,
              pressed && styles.centerHomeGlowPressed,
            ]}
          >
            <View style={[styles.centerHome, pressed && styles.centerHomePressed]}>
              <LineIcon name="home" size={25} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.centerLabel}>Home</Text>
        </>
      )}
    </Pressable>
  );
}

export default function HomeScreen({
  userName = 'Alex',
  onNotifications,
  onStartFocus,
  onViewStudy,
  onGenerateQuiz,
  onFlashcards,
  onQuickQA,
  onAnalytics,
}) {
  const insets = useSafeAreaInsets();
  const avatarLetter = userName.trim().charAt(0).toUpperCase() || 'A';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 102 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <View style={styles.homeHeader}>
          <View>
            <Text style={styles.greeting}>Good afternoon</Text>
            <Text style={styles.greetingName}>{userName}</Text>
          </View>

          <View style={styles.homeHeadActions}>
            <Pressable
              style={({ pressed }) => [
                styles.notification,
                pressed && styles.notificationPressed,
              ]}
              onPress={onNotifications}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <LineIcon name="bell" size={19} color="#151A15" />
            </Pressable>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.eyebrow}>Today’s progress</Text>
          <ProgressRing />

          <View style={styles.leftLabel}>
            <LineIcon name="clock" size={14} color="#438C31" />
            <Text style={styles.leftLabelText}>35 min left</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              styles.homeCta,
              pressed && styles.pressed,
            ]}
            onPress={onStartFocus}
          >
            <Text style={styles.primaryButtonText}>Start Study Session</Text>
          </Pressable>

          <Text style={styles.sessionDescription}>
            Continue your Computer Networks session
          </Text>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Your snapshot</Text>
        </View>

        <View style={styles.summaryGrid}>
          <StatCard icon="🔥" value="7 days" label="Study streak" />
          <StatCard icon="◷" value="3" label="Sessions today" />
          <StatCard icon="✦" value="82%" label="Quiz average" />
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Today&apos;s study</Text>
          <Pressable
            style={({ pressed }) => pressed && styles.pressedSmall}
            onPress={onViewStudy}
          >
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>

        <View style={styles.subjectList}>
          <StudyCard
            color="#76C457"
            title="Computer Networks"
            subtitle="Focus session"
            progress={72}
            time="45 min"
          />
          <StudyCard
            color="#4D8DDF"
            title="Database"
            subtitle="Review notes"
            progress={42}
            time="25 min"
          />
          <StudyCard
            color="#F59E42"
            title="Artificial Intelligence"
            subtitle="Quick practice"
            progress={25}
            time="15 min"
          />
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
        </View>

        <View style={styles.quickGrid}>
          <QuickAction iconName="quiz" label="Generate Quiz" onPress={onGenerateQuiz} />
          <QuickAction iconName="cards" label="Flashcards" onPress={onFlashcards} />
          <QuickAction iconName="qa" label="Quick Q&A" onPress={onQuickQA} />
          <QuickAction iconName="chart" label="View Analytics" onPress={onAnalytics} />
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomNav,
          {
            minHeight: 68 + insets.bottom,
            paddingBottom: 6 + insets.bottom,
          },
        ]}
      >
        <NavItem iconName="quiz" label="Quiz" onPress={onGenerateQuiz} />
        <NavItem iconName="cards" label="Cards" onPress={onFlashcards} />
        <HomeNavItem />
        <NavItem iconName="qa" label="Q&A" onPress={onQuickQA} />
        <NavItem iconName="chart" label="Analytics" onPress={onAnalytics} />
      </View>
    </SafeAreaView>
  );
}
