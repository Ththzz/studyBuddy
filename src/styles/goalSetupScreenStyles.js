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
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 34,
  },

  topRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },

  backIcon: {
    color: '#151A15',
    fontSize: 42,
    fontWeight: '300',
    lineHeight: 42,
  },

  stepLabel: {
    color: '#438C31',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  headerSpacer: {
    width: 44,
  },

  stepper: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 17,
    marginBottom: 28,
  },

  step: {
    flex: 1,
    height: 5,
    borderRadius: 20,
    backgroundColor: '#E2E8DF',
  },

  stepActive: {
    backgroundColor: '#76C457',
  },

  title: {
    color: '#151A15',
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  description: {
    marginTop: 12,
    color: '#697269',
    fontSize: 17,
    lineHeight: 24,
  },

  goalSummary: {
    alignItems: 'center',
    marginTop: 22,
    paddingVertical: 18,
    borderRadius: 22,
    backgroundColor: '#EAF6E4',
  },

  goalEyebrow: {
    color: '#438C31',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.4,
  },

  goalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },

  goalValue: {
    color: '#151A15',
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },

  goalUnit: {
    marginLeft: 7,
    color: '#697269',
    fontSize: 16,
    fontWeight: '700',
  },

  section: {
    marginTop: 21,
  },

  sectionLabel: {
    marginBottom: 10,
    color: '#697269',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },

  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  goalChoice: {
    width: '31.8%',
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8DF',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  goalChoiceActive: {
    borderColor: '#76C457',
    backgroundColor: '#EAF6E4',
  },

  goalChoiceText: {
    color: '#697269',
    fontSize: 14,
    fontWeight: '800',
  },

  goalChoiceTextActive: {
    color: '#438C31',
  },

  customGoalButton: {
    minHeight: 48,
    marginTop: 9,
    borderWidth: 1.5,
    borderColor: '#E2E8DF',
    borderRadius: 14,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  customGoalText: {
    color: '#438C31',
    fontSize: 16,
    fontWeight: '800',
  },

  customGoalEditor: {
    marginTop: 9,
    padding: 12,
    borderWidth: 1,
    borderColor: '#B8D5AE',
    borderRadius: 14,
    backgroundColor: '#FBFEF9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  customGoalLabel: {
    flex: 1,
    color: '#697269',
    fontSize: 13,
    fontWeight: '700',
  },

  customGoalInput: {
    width: 70,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    color: '#151A15',
    fontSize: 16,
    fontWeight: '800',
  },

  customGoalSave: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#76C457',
    alignItems: 'center',
    justifyContent: 'center',
  },

  customGoalSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  customGoalError: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: -19,
    color: '#E05252',
    fontSize: 11,
  },

  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
  },

  dayChoice: {
    width: 42,
    height: 42,
    borderWidth: 1.5,
    borderColor: '#E2E8DF',
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayChoiceActive: {
    borderColor: '#76C457',
    backgroundColor: '#76C457',
  },

  dayChoiceText: {
    color: '#697269',
    fontSize: 12,
    fontWeight: '800',
  },

  dayChoiceTextActive: {
    color: '#FFFFFF',
  },

  subjectChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  subjectChip: {
    minHeight: 40,
    paddingHorizontal: 13,
    borderWidth: 1.5,
    borderColor: '#E2E8DF',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  subjectChipActive: {
    borderColor: '#76C457',
    backgroundColor: '#EAF6E4',
  },

  subjectChipText: {
    color: '#697269',
    fontSize: 13,
    fontWeight: '700',
  },

  subjectChipTextActive: {
    color: '#438C31',
  },

  primaryButton: {
    minHeight: 54,
    marginTop: 26,
    borderRadius: 16,
    backgroundColor: '#76C457',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#76C457',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },

  pressedChoice: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },

  pressedSmall: {
    opacity: 0.6,
  },
});

export default styles;
