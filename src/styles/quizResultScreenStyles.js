import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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

  headerTitle: {
    flex: 1,
    color: '#151A15',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    textAlign: 'center',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 34,
  },

  resultHero: {
    alignItems: 'center',
  },

  quizName: {
    color: '#151A15',
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '800',
    textAlign: 'center',
  },

  scoreSummary: {
    color: '#438C31',
    marginTop: 18,
    fontSize: 36,
    lineHeight: 43,
    fontWeight: '800',
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },

  scoreLabel: {
    marginTop: 2,
    color: '#697269',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },

  resultCopy: {
    marginTop: 12,
    color: '#697269',
    fontSize: 13,
  },

  statGrid: {
    marginTop: 23,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  statCard: {
    width: '48.5%',
    minHeight: 108,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 223, 0.8)',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#152914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF6E4',
  },

  statIconRed: {
    backgroundColor: '#FFF0F0',
  },

  statValue: {
    marginTop: 10,
    color: '#151A15',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  statLabel: {
    marginTop: 3,
    color: '#697269',
    fontSize: 11,
  },

  saveErrorCard: {
    marginTop: 13,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7B5B5',
    borderRadius: 15,
    backgroundColor: '#FFF8F8',
  },

  saveErrorTitle: {
    color: '#C45858',
    fontSize: 14,
    fontWeight: '800',
  },

  saveErrorCopy: {
    marginTop: 5,
    color: '#697269',
    fontSize: 12,
    lineHeight: 18,
  },

  retrySaveButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    marginTop: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#C45858',
  },

  retrySaveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  primaryButton: {
    minHeight: 50,
    marginTop: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#76C457',
    shadowColor: '#76C457',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  secondaryButton: {
    minHeight: 50,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCEBD5',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  secondaryButtonText: {
    color: '#438C31',
    fontSize: 14,
    fontWeight: '800',
  },

  textButton: {
    minHeight: 44,
    marginTop: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textButtonText: {
    color: '#438C31',
    fontSize: 13,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
})

export default styles
