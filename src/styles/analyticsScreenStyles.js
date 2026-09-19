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

  headerSpacer: {
    width: 44,
    height: 44,
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

  content: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 32,
    gap: 14,
  },

  metricGrid: {
    flexDirection: 'row',
    gap: 8,
  },

  metricCard: {
    flex: 1,
    minHeight: 126,
    paddingHorizontal: 10,
    paddingVertical: 12,
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

  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF6E4',
  },

  metricValue: {
    marginTop: 11,
    color: '#151A15',
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  metricLabel: {
    marginTop: 3,
    color: '#697269',
    fontSize: 11,
    lineHeight: 15,
  },

  panel: {
    paddingHorizontal: 15,
    paddingVertical: 15,
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

  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  panelTitle: {
    color: '#151A15',
    fontSize: 15,
    fontWeight: '800',
  },

  panelHint: {
    marginTop: 4,
    color: '#697269',
    fontSize: 12,
  },

  panelValue: {
    color: '#438C31',
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  chart: {
    height: 148,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },

  chartColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },

  barTrack: {
    width: '100%',
    maxWidth: 24,
    height: 112,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#EDF1EB',
  },

  barFill: {
    width: '100%',
    minHeight: 5,
    borderRadius: 10,
    backgroundColor: '#76C457',
  },

  chartLabel: {
    color: '#697269',
    fontSize: 11,
    fontWeight: '700',
  },

  goalTrack: {
    height: 9,
    marginTop: 18,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#EDF1EB',
  },

  goalFill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#76C457',
  },

  goalFooter: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  subjectRow: {
    minHeight: 44,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  subjectRank: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF6E4',
  },

  subjectRankText: {
    color: '#438C31',
    fontSize: 12,
    fontWeight: '800',
  },

  subjectName: {
    flex: 1,
    color: '#151A15',
    fontSize: 13,
    fontWeight: '700',
  },

  subjectDuration: {
    color: '#438C31',
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  stateCard: {
    marginHorizontal: 18,
    marginTop: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 223, 0.8)',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  stateIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E5',
  },

  stateTitle: {
    marginTop: 14,
    color: '#151A15',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  stateCopy: {
    maxWidth: 300,
    marginTop: 7,
    color: '#697269',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  retryButton: {
    minHeight: 44,
    marginTop: 17,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#76C457',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  emptyCopy: {
    marginTop: 18,
    color: '#697269',
    fontSize: 13,
    lineHeight: 20,
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
})

export default styles
