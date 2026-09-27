import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LineIcon from '../components/lineIcon';
import styles from '../styles/homeScreenStyles';

const RING_SIZE = 188;
const RING_STROKE_WIDTH = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE_WIDTH) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const INITIAL_NOTIFICATIONS = [
  {
    id: 'focus-session',
    iconName: 'clock',
    iconColor: '#B46B24',
    iconBackground: '#FFF0D9',
    title: 'Time for a focus session',
    message: 'Keep your study goal moving today.',
    timeLabel: 'Today',
    read: false,
  },
  {
    id: 'study-streak',
    iconName: 'spark',
    iconColor: '#438C31',
    iconBackground: '#EAF6E4',
    title: 'Your study streak is growing',
    message: 'One more session keeps your momentum going.',
    timeLabel: 'Yesterday',
    read: false,
  },
  {
    id: 'review-cards',
    iconName: 'cards',
    iconColor: '#3974BC',
    iconBackground: '#E5EFFC',
    title: 'Review your flashcards',
    message: 'A quick review can strengthen today’s learning.',
    timeLabel: 'Mon',
    read: true,
  },
];

function ProgressRing({ value, label, progressPercent = 0 }) {
  const numericProgress = Number(progressPercent);
  const safeProgress = Number.isFinite(numericProgress)
    ? Math.min(100, Math.max(0, numericProgress))
    : 0;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - safeProgress / 100);

  return (
    <View
      style={styles.ring}
      accessibilityRole="progressbar"
      accessibilityLabel="Today's study goal progress"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(safeProgress),
        text: `${Math.round(safeProgress)}%`,
      }}
    >
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        style={styles.ringSvg}
        pointerEvents="none"
      >
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="#E7EEE3"
          strokeWidth={RING_STROKE_WIDTH}
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="#76C457"
          strokeWidth={RING_STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>
      <View style={styles.ringInner}>
        <Text style={styles.ringValue}>{value}</Text>
        <Text style={styles.ringLabel}>{label}</Text>
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
  todayStudyLabel = '1h 25m',
  dailyGoalLabel = 'of 2h goal',
  todayRemainingLabel = '35 min left',
  todaySessionCount = 3,
  dailyProgressPercent = 0,
  studyStreakDays = 0,
  quizAverage = null,
  todaySubjects = [],
  avatarUri = null,
  onProfile,
  onStartFocus,
  onViewStudy,
  onGenerateQuiz,
  onFlashcards,
  onQuickQA,
  onAnalytics,
}) {
  const insets = useSafeAreaInsets();
  const avatarLetter = userName.trim().charAt(0).toUpperCase() || 'A';
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isNotificationPopoverVisible, setNotificationPopoverVisible] = useState(false);
  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length;

  const markNotificationAsRead = (notificationId) => {
    setNotifications((currentNotifications) => currentNotifications.map((notification) => (
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    )));
  };

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
        bounces
        alwaysBounceVertical
        overScrollMode="always"
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
              onPress={() => setNotificationPopoverVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <LineIcon name="bell" size={19} color="#151A15" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.avatar,
                pressed && styles.avatarPressed,
              ]}
              onPress={onProfile}
              accessibilityRole="button"
              accessibilityLabel="Open profile and settings"
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.eyebrow}>Today’s progress</Text>
          <ProgressRing
            value={todayStudyLabel}
            label={dailyGoalLabel}
            progressPercent={dailyProgressPercent}
          />

          <View style={styles.leftLabel}>
            <LineIcon name="clock" size={14} color="#438C31" />
            <Text style={styles.leftLabelText}>{todayRemainingLabel}</Text>
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
            Choose a subject and start a focused session
          </Text>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Your snapshot</Text>
        </View>

        <View style={styles.summaryGrid}>
          <StatCard icon="🔥" value={`${studyStreakDays} days`} label="Study streak" />
          <StatCard icon="◷" value={String(todaySessionCount)} label="Sessions today" />
          <StatCard icon="✦" value={quizAverage === null ? '—' : `${quizAverage}%`} label="Quiz average" />
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
          {todaySubjects.length > 0 ? todaySubjects.map((subject, index) => (
            <StudyCard
              key={subject.name}
              color={['#76C457', '#4D8DDF', '#F59E42'][index % 3]}
              title={subject.name}
              subtitle={subject.subtitle}
              progress={subject.progressPercent}
              time={subject.timeLabel}
            />
          )) : (
            <View style={styles.subjectCard}>
              <View style={[styles.subjectDot, { backgroundColor: '#D8E2D4' }]} />
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectTitle}>No study sessions yet</Text>
                <Text style={styles.subjectSubtitle}>Start a study session to see today&apos;s activity.</Text>
              </View>
            </View>
          )}
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

      {isNotificationPopoverVisible ? (
        <View style={styles.notificationOverlay}>
          <Pressable
            style={styles.notificationDismissArea}
            onPress={() => setNotificationPopoverVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close notifications"
          />

          <View style={[styles.notificationPopover, { top: insets.top + 58 }]}>
            <View style={styles.notificationPopoverHeader}>
              <View style={styles.notificationPopoverHeading}>
                <Text style={styles.notificationPopoverTitle}>Notifications</Text>
                <Text style={styles.notificationPopoverSubtitle}>
                  {unreadNotificationCount > 0
                    ? `${unreadNotificationCount} unread`
                    : 'All caught up'}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.notificationClose,
                  pressed && styles.notificationClosePressed,
                ]}
                onPress={() => setNotificationPopoverVisible(false)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
              >
                <LineIcon name="x" size={16} color="#697269" />
              </Pressable>
            </View>

            <View style={styles.notificationDivider} />

            {notifications.length > 0 ? (
              <View style={styles.notificationList}>
                {notifications.map((notification) => (
                  <Pressable
                    key={notification.id}
                    style={({ pressed }) => [
                      styles.notificationItem,
                      !notification.read && styles.notificationItemUnread,
                      pressed && styles.notificationItemPressed,
                    ]}
                    onPress={() => markNotificationAsRead(notification.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${notification.title}, ${notification.read ? 'read' : 'unread'}`}
                  >
                    <View
                      style={[
                        styles.notificationItemIcon,
                        { backgroundColor: notification.iconBackground },
                      ]}
                    >
                      <LineIcon
                        name={notification.iconName}
                        size={16}
                        color={notification.iconColor}
                      />
                    </View>
                    <View style={styles.notificationItemCopy}>
                      <Text style={styles.notificationItemTitle} numberOfLines={1}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationItemMessage} numberOfLines={2}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationItemTime}>{notification.timeLabel}</Text>
                    </View>
                    {!notification.read ? <View style={styles.notificationUnreadDot} /> : null}
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={styles.notificationEmpty}>
                <Text style={styles.notificationEmptyText}>No new notifications</Text>
              </View>
            )}
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
