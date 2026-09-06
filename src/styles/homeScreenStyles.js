import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },

  flex: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },

  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 3,
    marginBottom: 18,
  },

  greeting: {
    color: '#697269',
    fontSize: 14,
  },

  greetingName: {
    marginTop: 3,
    color: '#151A15',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  homeHeadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  notification: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationPressed: {
    backgroundColor: '#EAF6E4',
    transform: [{ scale: 0.96 }],
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D7EBCE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#438C31',
    fontSize: 23,
    fontWeight: '800',
  },

  progressCard: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 223, 0.8)',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#152914',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  eyebrow: {
    marginBottom: 9,
    color: '#438C31',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },

  ring: {
    width: 188,
    height: 188,
    marginBottom: 13,
    borderWidth: 12,
    borderColor: '#76C457',
    borderLeftColor: '#E7EEE3',
    borderRadius: 94,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringInner: {
    width: '100%',
    height: '100%',
    borderRadius: 94,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringValue: {
    color: '#151A15',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },

  ringLabel: {
    marginTop: 2,
    color: '#697269',
    fontSize: 13,
  },

  leftLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#EAF6E4',
  },

  leftLabelText: {
    color: '#438C31',
    fontSize: 14,
    fontWeight: '800',
  },

  primaryButton: {
    minHeight: 50,
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#76C457',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#76C457',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },

  homeCta: {
    marginTop: 16,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  sessionDescription: {
    marginTop: 9,
    color: '#697269',
    fontSize: 13,
  },

  sectionHeading: {
    minHeight: 34,
    marginHorizontal: 3,
    marginTop: 24,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#151A15',
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '800',
  },

  sectionLink: {
    color: '#438C31',
    fontSize: 13,
    fontWeight: '800',
  },

  summaryGrid: {
    flexDirection: 'row',
    gap: 9,
  },

  summaryCard: {
    flex: 1,
    minHeight: 93,
    paddingHorizontal: 11,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 223, 0.8)',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#152914',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  summaryIcon: {
    color: '#151A15',
    fontSize: 18,
  },

  summaryValue: {
    marginTop: 7,
    color: '#151A15',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },

  summaryLabel: {
    marginTop: 2,
    color: '#697269',
    fontSize: 11,
    lineHeight: 15,
  },

  subjectList: {
    gap: 9,
  },

  subjectCard: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 223, 0.8)',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    shadowColor: '#152914',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  subjectDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  subjectInfo: {
    flex: 1,
    minWidth: 0,
  },

  subjectTitle: {
    color: '#151A15',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },

  subjectSubtitle: {
    marginTop: 3,
    color: '#697269',
    fontSize: 12,
    lineHeight: 16,
  },

  subjectTime: {
    color: '#151A15',
    fontSize: 13,
    fontWeight: '800',
  },

  miniProgress: {
    height: 5,
    width: '100%',
    marginTop: 8,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#EDF1EB',
  },

  miniProgressFill: {
    height: '100%',
    borderRadius: 20,
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  quickCard: {
    minHeight: 72,
    width: '48.5%',
    padding: 13,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  quickCardPressed: {
    borderColor: '#76C457',
    backgroundColor: '#FCFFFB',
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EAF6E4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickLabel: {
    flex: 1,
    color: '#151A15',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },

  bottomNav: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    minHeight: 68,
    paddingHorizontal: 11,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    shadowColor: '#173116',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },

  navItem: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  navItemPressed: {
    borderRadius: 12,
    backgroundColor: '#EAF6E4',
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },

  navLabel: {
    color: '#697269',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
  },

  centerNav: {
    position: 'relative',
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  centerNavPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },

  centerHome: {
    width: 54,
    height: 54,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    borderRadius: 27,
    backgroundColor: '#76C457',
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerHomePressed: {
    backgroundColor: '#438C31',
  },

  centerHomeGlow: {
    position: 'absolute',
    top: -32,
    width: 66,
    height: 66,
    borderWidth: 4,
    borderColor: 'rgba(118, 196, 87, 0.14)',
    borderRadius: 33,
    backgroundColor: '#EAF6E4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#336F2D',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 5,
  },

  centerHomeGlowPressed: {
    backgroundColor: '#D7EBCE',
  },

  centerLabel: {
    color: '#438C31',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },

  pressedSmall: {
    opacity: 0.6,
  },
});

export default styles;
