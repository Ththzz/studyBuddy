import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },

  transitionHost: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#F8FAF7',
  },

  flex: {
    flex: 1,
  },

  header: {
    minHeight: 68,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  headerSide: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerSidePressed: {
    backgroundColor: '#EAF6E4',
  },

  headerCopy: {
    flex: 1,
  },

  headerTitle: {
    marginTop: 0,
    color: '#151A15',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 34,
  },

  progressHeader: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  progressLabel: {
    marginTop: 0,
    color: '#151A15',
    fontSize: 14,
    fontWeight: '800',
  },

  progressPercent: {
    color: '#438C31',
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  progressTrack: {
    height: 7,
    marginTop: 11,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#E5ECE2',
  },

  progressFill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#70B55D',
  },

  card: {
    marginTop: 24,
    borderRadius: 24,
    shadowColor: '#152914',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },

  cardPressable: {
    width: '100%',
    borderRadius: 24,
  },

  cardPressed: {
    transform: [{ scale: 0.99 }],
  },

  flipContainer: {
    minHeight: 295,
  },

  cardFace: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backfaceVisibility: 'hidden',
  },

  cardSurface: {
    minHeight: 295,
    padding: 22,
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: '#DDE7D9',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },

  cardSurfaceFlipped: {
    borderColor: '#B8D5AE',
    backgroundColor: '#F2FAEE',
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  cardNumber: {
    color: '#8A9388',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  cardNumberAnswer: {
    color: '#438C31',
  },

  cardContent: {
    color: '#151A15',
    fontSize: 23,
    lineHeight: 32,
    fontWeight: '800',
    textAlign: 'center',
  },

  cardContentArea: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ratingRow: {
    marginTop: 28,
    flexDirection: 'row',
    gap: 10,
  },

  ratingButton: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 15,
  },

  learningButton: {
    borderColor: '#F2D8BE',
    backgroundColor: '#FFF8F1',
  },

  knownButton: {
    borderColor: '#C5DFBC',
    backgroundColor: '#F0F8EC',
  },

  ratingButtonDisabled: {
    borderColor: '#E2E8DF',
    backgroundColor: '#F3F5F2',
  },

  ratingButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },

  ratingButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },

  learningButtonText: {
    color: '#C8772A',
  },

  knownButtonText: {
    color: '#438C31',
  },

  ratingButtonTextDisabled: {
    color: '#A8B0A8',
  },

  emptyState: {
    marginTop: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  emptyTitle: {
    color: '#151A15',
    fontSize: 16,
    fontWeight: '800',
  },

  emptyCopy: {
    marginTop: 6,
    color: '#697269',
    fontSize: 12,
  },

  completionContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 34,
    alignItems: 'center',
  },

  completionIcon: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
    backgroundColor: '#EAF6E4',
  },

  completionTitle: {
    marginTop: 22,
    color: '#151A15',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },

  resultCard: {
    width: '100%',
    marginTop: 28,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#152914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  resultItem: {
    flex: 1,
    alignItems: 'center',
  },

  resultValue: {
    color: '#438C31',
    fontSize: 25,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  learningValue: {
    color: '#C8772A',
  },

  resultLabel: {
    marginTop: 4,
    color: '#697269',
    fontSize: 11,
    textAlign: 'center',
  },

  resultDivider: {
    width: 1,
    height: 44,
    backgroundColor: '#E2E8DF',
  },

  primaryButton: {
    width: '100%',
    minHeight: 52,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#438C31',
  },

  primaryButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  secondaryButton: {
    minHeight: 48,
    marginTop: 7,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  secondaryButtonPressed: {
    opacity: 0.65,
  },

  secondaryButtonText: {
    color: '#8A8A8A',
    fontSize: 13,
    fontWeight: '800',
  },

  confirmationOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  confirmationBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(21, 26, 21, 0.42)',
  },

  confirmationCard: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#152914',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },

  confirmationIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#EAF6E4',
  },

  confirmationTitle: {
    marginTop: 16,
    color: '#151A15',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    textAlign: 'center',
  },

  confirmationCopy: {
    marginTop: 6,
    color: '#697269',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  confirmationButtonRow: {
    width: '100%',
    marginTop: 22,
    flexDirection: 'row',
    gap: 10,
  },

  confirmationButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },

  confirmationCancelButton: {
    borderWidth: 1,
    borderColor: '#DDE7D9',
    backgroundColor: '#F8FAF7',
  },

  confirmationStopButton: {
    backgroundColor: '#C65C52',
  },

  confirmationButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },

  confirmationCancelText: {
    color: '#438C31',
    fontSize: 13,
    fontWeight: '800',
  },

  confirmationStopText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
})

export default styles
