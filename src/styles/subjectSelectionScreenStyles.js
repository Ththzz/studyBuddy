import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonPressed: {
    backgroundColor: '#EAF6E4',
  },

  headerSpacer: {
    flex: 1,
  },

  hero: {
    marginTop: 34,
  },

  eyebrow: {
    color: '#438C31',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  title: {
    marginTop: 8,
    color: '#151A15',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.6,
  },

  bodyCopy: {
    maxWidth: 330,
    marginTop: 10,
    color: '#697269',
    fontSize: 15,
    lineHeight: 23,
  },

  optionList: {
    marginTop: 28,
    gap: 10,
  },

  subjectOption: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  subjectOptionSelected: {
    borderColor: '#76C457',
    backgroundColor: '#F4FBF0',
  },

  subjectOptionPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },

  subjectIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F4EF',
  },

  subjectIconSelected: {
    backgroundColor: '#EAF6E4',
  },

  subjectName: {
    flex: 1,
    color: '#151A15',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },

  subjectNameSelected: {
    color: '#438C31',
    fontWeight: '800',
  },

  radio: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#B8C4B4',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: '#438C31',
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#438C31',
  },

  continueButton: {
    minHeight: 52,
    marginTop: 24,
    paddingHorizontal: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    backgroundColor: '#76C457',
    shadowColor: '#76C457',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },

  continueButtonDisabled: {
    backgroundColor: '#B9CBB3',
    shadowOpacity: 0,
    elevation: 0,
  },

  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  forwardIcon: {
    transform: [{ rotate: '180deg' }],
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },

  emptyState: {
    marginTop: 32,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF6E4',
  },

  emptyTitle: {
    marginTop: 16,
    color: '#151A15',
    fontSize: 18,
    fontWeight: '800',
  },

  emptyCopy: {
    marginTop: 8,
    color: '#697269',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  fallbackButton: {
    minHeight: 46,
    marginTop: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#76C457',
  },

  fallbackButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
})

export default styles
