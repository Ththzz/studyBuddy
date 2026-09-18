import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF7',
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

  headerCopy: {
    flex: 1,
  },

  eyebrow: {
    color: '#438C31',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  title: {
    marginTop: 3,
    color: '#151A15',
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  headerSpacer: {
    width: 44,
    height: 44,
  },

  list: {
    flex: 1,
  },

  listContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 32,
  },

  summaryCard: {
    marginTop: 4,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 14,
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

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryTitle: {
    color: '#151A15',
    fontSize: 14,
    fontWeight: '800',
  },

  summaryMetrics: {
    marginTop: 14,
    flexDirection: 'row',
  },

  summaryMetric: {
    flex: 1,
  },

  summaryMetricBorder: {
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#EDF1EB',
  },

  summaryValue: {
    color: '#438C31',
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  summaryLabel: {
    marginTop: 3,
    color: '#697269',
    fontSize: 12,
  },

  sectionHeader: {
    minHeight: 35,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#151A15',
    fontSize: 17,
    fontWeight: '800',
  },

  sectionCount: {
    color: '#697269',
    fontSize: 12,
    fontWeight: '700',
  },

  sessionCard: {
    marginBottom: 9,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 223, 0.8)',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#152914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  sessionCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  sessionHeading: {
    flex: 1,
    minWidth: 0,
  },

  subjectTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },

  subjectDot: {
    width: 9,
    height: 9,
    marginTop: 5,
    borderRadius: 5,
    backgroundColor: '#76C457',
  },

  sessionSubject: {
    flex: 1,
    color: '#151A15',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },

  sessionTime: {
    marginTop: 6,
    marginLeft: 18,
    color: '#697269',
    fontSize: 12,
  },

  sessionDuration: {
    maxWidth: 105,
    marginLeft: 12,
    color: '#151A15',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },

  sessionMetaRow: {
    marginTop: 13,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  metaItem: {
    minHeight: 28,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    backgroundColor: '#F4F6F2',
  },

  completedMeta: {
    backgroundColor: '#EAF6E4',
  },

  endedMeta: {
    backgroundColor: '#FFF5E9',
  },

  metaText: {
    color: '#697269',
    fontSize: 11,
    fontWeight: '800',
  },

  completedText: {
    color: '#438C31',
  },

  endedText: {
    color: '#B46B24',
  },

  emptyState: {
    flex: 1,
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    marginBottom: 14,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF6E4',
  },

  emptyTitle: {
    color: '#151A15',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyCopy: {
    maxWidth: 290,
    marginTop: 8,
    color: '#697269',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  loadingText: {
    color: '#697269',
    fontSize: 13,
  },

  errorState: {
    flex: 1,
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  errorIcon: {
    backgroundColor: '#FFF5E9',
  },

  errorTitle: {
    color: '#151A15',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  errorCopy: {
    maxWidth: 310,
    marginTop: 8,
    color: '#697269',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  retryButton: {
    minHeight: 44,
    marginTop: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 12,
    backgroundColor: '#438C31',
  },

  retryButtonPressed: {
    backgroundColor: '#347326',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
})

export default styles
