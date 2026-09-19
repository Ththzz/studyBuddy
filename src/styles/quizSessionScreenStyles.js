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
    gap: 10,
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
    color: '#151A15',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
  },

  headerSubject: {
    flex: 1,
    color: '#697269',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 34,
  },

  questionHeader: {
    minHeight: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  questionCount: {
    color: '#697269',
    fontSize: 13,
    fontWeight: '700',
  },

  questionCountStrong: {
    color: '#151A15',
    fontWeight: '800',
  },

  practiceLabel: {
    color: '#438C31',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  progressTrack: {
    height: 7,
    marginTop: 9,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#E2E8DF',
  },

  progressFill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#76C457',
  },

  questionCard: {
    marginTop: 22,
    padding: 19,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 223, 0.8)',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#152914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  subjectEyebrow: {
    color: '#438C31',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },

  questionTitle: {
    marginTop: 10,
    color: '#151A15',
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.25,
  },

  answerList: {
    marginTop: 18,
    gap: 10,
  },

  answerButton: {
    minHeight: 58,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },

  answerButtonSelected: {
    borderColor: '#76C457',
    backgroundColor: '#F7FCF4',
  },

  answerButtonCorrect: {
    borderColor: '#A9D79A',
    backgroundColor: '#F2FAEF',
  },

  answerButtonIncorrect: {
    borderColor: '#E5A4A4',
    backgroundColor: '#FFF7F7',
  },

  answerButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },

  answerKey: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F4EF',
  },

  answerKeyCorrect: {
    backgroundColor: '#D7EBCF',
  },

  answerKeyIncorrect: {
    backgroundColor: '#F7DADA',
  },

  answerKeyText: {
    color: '#697269',
    fontSize: 12,
    fontWeight: '800',
  },

  answerText: {
    flex: 1,
    color: '#151A15',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },

  explanation: {
    marginTop: 15,
    padding: 13,
    borderWidth: 1,
    borderRadius: 13,
  },

  explanationCorrect: {
    borderColor: '#B8D5AE',
    backgroundColor: '#F7FCF4',
  },

  explanationIncorrect: {
    borderColor: '#E7B5B5',
    backgroundColor: '#FFF8F8',
  },

  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  explanationTitle: {
    color: '#438C31',
    fontSize: 13,
    fontWeight: '800',
  },

  explanationTitleIncorrect: {
    color: '#C45858',
  },

  explanationCopy: {
    marginTop: 8,
    color: '#697269',
    fontSize: 12,
    lineHeight: 18,
  },

  primaryButton: {
    minHeight: 50,
    marginTop: 16,
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

  primaryButtonDisabled: {
    backgroundColor: '#B8C8B1',
    shadowOpacity: 0,
    elevation: 0,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  exitButton: {
    minHeight: 44,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  exitButtonText: {
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
