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

  backButtonPressed: {
    backgroundColor: '#EAF6E4',
  },

  headerTitle: {
    flex: 1,
    color: '#151A15',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 2,
    paddingBottom: 34,
  },

  uploadCard: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#B8D5AE',
    borderRadius: 16,
    backgroundColor: '#FBFEF9',
  },

  uploadIcon: {
    width: 48,
    height: 48,
    marginBottom: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF6E4',
  },

  uploadTitle: {
    color: '#151A15',
    fontSize: 16,
    fontWeight: '800',
  },

  uploadCopy: {
    maxWidth: 280,
    marginTop: 5,
    color: '#697269',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  secondaryButton: {
    minHeight: 46,
    marginTop: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCEBD5',
  },

  mediaButtonDisabled: {
    opacity: 0.55,
  },

  secondaryButtonText: {
    color: '#438C31',
    fontSize: 13,
    fontWeight: '800',
  },

  fileMeta: {
    minHeight: 72,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  fileIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
  },

  fileInfo: {
    flex: 1,
    minWidth: 0,
  },

  fileName: {
    color: '#151A15',
    fontSize: 13,
    fontWeight: '800',
  },

  fileDetails: {
    marginTop: 3,
    color: '#697269',
    fontSize: 11,
  },

  replaceButton: {
    minHeight: 36,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  replaceButtonText: {
    color: '#438C31',
    fontSize: 12,
    fontWeight: '800',
  },

  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },

  mediaRow: {
    marginTop: 9,
    flexDirection: 'row',
    gap: 8,
  },

  mediaButton: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: '#DCEBD5',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  mediaIcon: {
    color: '#438C31',
    fontSize: 16,
    fontWeight: '800',
  },

  mediaButtonText: {
    color: '#438C31',
    fontSize: 12,
    fontWeight: '800',
  },

  configCard: {
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 223, 0.8)',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#152914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  configTitle: {
    color: '#151A15',
    fontSize: 15,
    fontWeight: '800',
  },

  eyebrow: {
    color: '#438C31',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  fieldGroup: {
    marginTop: 19,
  },

  fieldGroupLast: {
    marginTop: 19,
  },

  fieldLabel: {
    marginBottom: 8,
    color: '#697269',
    fontSize: 12,
    fontWeight: '700',
  },

  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },

  segment: {
    flex: 1,
    minHeight: 43,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 11,
    backgroundColor: '#FBFCFA',
  },

  segmentActive: {
    borderColor: '#B8D5AE',
    backgroundColor: '#EAF6E4',
  },

  segmentPressed: {
    opacity: 0.72,
  },

  segmentText: {
    color: '#697269',
    fontSize: 12,
    fontWeight: '700',
  },

  segmentTextActive: {
    color: '#438C31',
    fontWeight: '800',
  },

  selectRow: {
    minHeight: 46,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 11,
    backgroundColor: '#FBFCFA',
  },

  selectRowPressed: {
    backgroundColor: '#EAF6E4',
  },

  selectText: {
    color: '#151A15',
    fontSize: 13,
    fontWeight: '700',
  },

  questionTypeOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 17, 0.32)',
  },

  questionTypeScrim: {
    ...StyleSheet.absoluteFillObject,
  },

  questionTypeSheet: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
  },

  questionTypeHandle: {
    width: 38,
    height: 4,
    alignSelf: 'center',
    marginBottom: 18,
    borderRadius: 2,
    backgroundColor: '#D9DFD7',
  },

  questionTypeTitle: {
    color: '#151A15',
    fontSize: 18,
    fontWeight: '800',
  },

  questionTypeSubtitle: {
    marginTop: 5,
    color: '#697269',
    fontSize: 12,
    lineHeight: 18,
  },

  questionTypeOptions: {
    gap: 8,
    marginTop: 18,
  },

  questionTypeOption: {
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 13,
    backgroundColor: '#FBFCFA',
  },

  questionTypeOptionSelected: {
    borderColor: '#B8D5AE',
    backgroundColor: '#F3FAF0',
  },

  questionTypeOptionPressed: {
    opacity: 0.72,
  },

  questionTypeOptionCopy: {
    flex: 1,
  },

  questionTypeOptionLabel: {
    color: '#151A15',
    fontSize: 14,
    fontWeight: '800',
  },

  questionTypeOptionDescription: {
    marginTop: 3,
    color: '#697269',
    fontSize: 11,
  },

  questionTypeCancel: {
    minHeight: 46,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F1F4EF',
  },

  questionTypeCancelText: {
    color: '#394239',
    fontSize: 13,
    fontWeight: '800',
  },

  primaryButton: {
    minHeight: 50,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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

  generationError: {
    marginTop: 10,
    paddingHorizontal: 12,
    color: '#A73737',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },


  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
})

export default styles
