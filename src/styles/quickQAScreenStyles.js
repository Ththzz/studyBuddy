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
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 34,
  },

  card: {
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

  setupCard: {
    marginTop: 21,
    padding: 18,
    gap: 16,
  },

  completionHero: {
    marginTop: 18,
    padding: 22,
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#EAF6E4',
  },

  completionIcon: {
    width: 58,
    height: 58,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  completionEyebrow: { color: '#438C31', fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  completionTitle: { marginTop: 5, color: '#151A15', fontSize: 27, fontWeight: '900' },
  completionCopy: { marginTop: 5, color: '#697269', fontSize: 13, textAlign: 'center' },
  resultSaveStatus: { marginTop: 9, color: '#438C31', fontSize: 12, fontWeight: '800' },
  resultSaveError: { marginTop: 9, color: '#A73737', fontSize: 12, fontWeight: '800' },
  completionStats: { width: '100%', marginTop: 20, paddingTop: 15, flexDirection: 'row', justifyContent: 'space-evenly', borderTopWidth: 1, borderTopColor: '#CFE4C5' },
  completionStat: { alignItems: 'center', gap: 3 },
  completionStatValue: { color: '#285D20', fontSize: 21, fontWeight: '900' },
  completionStatLabel: { color: '#697269', fontSize: 11, fontWeight: '700' },
  completionStatDivider: { width: 1, backgroundColor: '#CFE4C5' },
  resultsSectionTitle: { marginTop: 22, marginBottom: 3, color: '#151A15', fontSize: 17, fontWeight: '900' },
  resultCard: { marginTop: 12, padding: 17 },
  resultCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultQuestionNumber: { color: '#697269', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  resultScore: { paddingHorizontal: 9, paddingVertical: 5, overflow: 'hidden', borderRadius: 10, fontSize: 12, fontWeight: '900' },
  resultScoreCorrect: { color: '#438C31', backgroundColor: '#EAF6E4' },
  resultScoreReview: { color: '#B66A16', backgroundColor: '#FFF0D8' },
  resultQuestion: { marginTop: 11, color: '#151A15', fontSize: 16, lineHeight: 22, fontWeight: '800' },
  resultLabel: { marginTop: 13, color: '#697269', fontSize: 11, fontWeight: '800' },
  resultAnswer: { marginTop: 4, color: '#30382F', fontSize: 13, lineHeight: 19 },
  resultFeedback: { marginTop: 10, padding: 11, color: '#4E594B', fontSize: 12, lineHeight: 18, borderRadius: 11, backgroundColor: '#F4F7F2' },

  formField: {
    gap: 7,
  },

  fieldLabel: {
    color: '#697269',
    fontSize: 13,
    fontWeight: '700',
  },

  select: {
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  selectPressed: {
    borderColor: '#76C457',
    backgroundColor: '#FCFFFB',
  },

  selectText: {
    flex: 1,
    paddingRight: 8,
    color: '#151A15',
    fontSize: 14,
  },

  segmented: {
    minHeight: 46,
    padding: 4,
    flexDirection: 'row',
    gap: 3,
    borderRadius: 12,
    backgroundColor: '#EDF1EB',
  },

  segment: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },

  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#152914',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },

  segmentTextActive: {
    color: '#438C31',
    fontWeight: '800',
  },

  choiceGrid: {
    flexDirection: 'row',
    gap: 9,
  },

  choice: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  choiceActive: {
    borderColor: '#76C457',
    backgroundColor: '#EAF6E4',
  },

  choicePressed: {
    opacity: 0.72,
  },

  choiceText: {
    color: '#697269',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  choiceTextActive: {
    color: '#438C31',
  },

  primaryButton: {
    minHeight: 50,
    marginTop: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: '#76C457',
    shadowColor: '#76C457',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 9,
    elevation: 3,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },

  emptyState: {
    marginTop: 24,
    paddingHorizontal: 18,
    paddingVertical: 30,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 60,
    height: 60,
    marginBottom: 13,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF6E4',
  },

  emptyTitle: {
    color: '#151A15',
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '800',
  },

  emptyCopy: {
    marginTop: 8,
    color: '#697269',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  questionHeader: {
    marginTop: 21,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  questionHeaderText: {
    color: '#697269',
    fontSize: 13,
    fontWeight: '700',
  },

  questionHeaderStrong: {
    color: '#151A15',
  },

  eyebrow: {
    color: '#438C31',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  progressTrack: {
    height: 7,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#E2E8DF',
  },

  progressFill: {
    width: '20%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#76C457',
  },

  questionCard: {
    marginTop: 22,
    padding: 19,
  },

  questionText: {
    marginTop: 10,
    color: '#151A15',
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
    letterSpacing: -0.25,
  },

  answerInput: {
    minHeight: 112,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 13,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 12,
    color: '#151A15',
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: '#FFFFFF',
  },

  answerInputDisabled: {
    borderColor: '#D8DDD6',
    color: '#7C847B',
    backgroundColor: '#ECEFEC',
  },

  answerMeta: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  mutedSmall: {
    color: '#697269',
    fontSize: 13,
  },

  errorText: {
    marginTop: 8,
    color: '#A73737',
    fontSize: 12,
  },

  feedbackCard: {
    marginTop: 13,
    padding: 18,
  },

  feedbackCorrect: {
    borderColor: '#B8D5AE',
    backgroundColor: '#FBFEF9',
  },

  feedbackNeedsReview: {
    borderColor: '#F1C995',
    backgroundColor: '#FFFDF8',
  },

  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  settingIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF6E4',
  },

  feedbackIconCorrect: { backgroundColor: '#EAF6E4' },

  feedbackIconNeedsReview: { backgroundColor: '#FFF0D8' },

  feedbackTitle: {
    color: '#151A15',
    fontSize: 14,
    fontWeight: '800',
  },

  feedbackCorrectText: { color: '#438C31' },

  feedbackNeedsReviewText: { color: '#B66A16' },

  feedbackScore: {
    marginTop: 1,
    color: '#697269',
    fontSize: 12,
    fontWeight: '700',
  },

  feedbackText: {
    marginTop: 13,
    color: '#697269',
    fontSize: 13,
    lineHeight: 19,
  },

  feedbackStrong: {
    color: '#438C31',
    fontWeight: '800',
  },

  suggestedAnswer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F1F8EE',
  },

  suggestedTitle: {
    color: '#151A15',
    fontSize: 13,
    fontWeight: '800',
  },

  suggestedText: {
    marginTop: 4,
    color: '#697269',
    fontSize: 13,
    lineHeight: 19,
  },

  exitButton: {
    minHeight: 40,
    marginTop: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  exitButtonPressed: {
    opacity: 0.65,
  },

  exitButtonText: {
    color: '#438C31',
    fontSize: 14,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21, 26, 21, 0.32)',
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

  confirmationButtonColumn: {
    width: '100%',
    marginTop: 22,
    gap: 10,
  },

  confirmationButton: {
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

  confirmationSaveButton: {
    backgroundColor: '#438C31',
  },

  confirmationLeaveButton: {
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

  confirmationSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  modalCard: {
    width: '100%',
    maxWidth: 390,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  modalTitle: {
    color: '#151A15',
    fontSize: 17,
    fontWeight: '800',
  },

  modalCopy: {
    marginTop: 7,
    color: '#697269',
    fontSize: 13,
    lineHeight: 19,
  },

  titleDialogInput: {
    minHeight: 50,
    marginTop: 15,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#DDE5D9',
    borderRadius: 12,
    color: '#151A15',
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },

  titleDialogActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 9,
  },

  titleDialogButton: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 11,
    backgroundColor: '#F1F4EF',
  },

  titleDialogConfirm: {
    backgroundColor: '#76C457',
  },

  titleDialogCancelText: {
    color: '#4E594B',
    fontSize: 13,
    fontWeight: '800',
  },

  titleDialogConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  librarySearch: {
    minHeight: 50,
    marginTop: 4,
    marginBottom: 3,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 13,
    color: '#151A15',
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },

  libraryPrimaryButton: {
    marginTop: 0,
  },

  librarySetCard: {
    padding: 14,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },

  librarySetHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  librarySetTitle: {
    flex: 1,
    minWidth: 0,
  },

  librarySetContent: {
    gap: 9,
  },

  librarySecondaryButton: {
    minHeight: 44,
    marginTop: 0,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE5D9',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  librarySecondaryText: {
    color: '#438C31',
    fontSize: 13,
    fontWeight: '800',
  },

  libraryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  libraryActionButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },

  libraryDeleteButton: {
    backgroundColor: '#FFF1F1',
  },

  modalOptions: {
    marginTop: 12,
    gap: 7,
  },

  modalOption: {
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 11,
    backgroundColor: '#F8FAF7',
  },

  modalOptionActive: {
    backgroundColor: '#EAF6E4',
  },

  modalOptionText: {
    flex: 1,
    color: '#273026',
    fontSize: 14,
    fontWeight: '700',
  },

  modalCancel: {
    minHeight: 42,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCancelText: {
    color: '#438C31',
    fontSize: 14,
    fontWeight: '800',
  },

})

export default styles
