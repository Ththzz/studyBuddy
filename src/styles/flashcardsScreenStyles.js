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

  eyebrow: {
    color: '#438C31',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },

  headerTitle: {
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
    paddingBottom: 34,
  },

  searchBox: {
    minHeight: 47,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },

  searchInput: {
    flex: 1,
    minHeight: 44,
    color: '#151A15',
    fontSize: 13,
  },

  clearButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },

  filterRow: {
    paddingTop: 13,
    paddingBottom: 3,
    gap: 8,
  },

  filterChip: {
    minHeight: 36,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  filterChipActive: {
    borderColor: '#B8D5AE',
    backgroundColor: '#EAF6E4',
  },

  filterChipPressed: {
    opacity: 0.72,
  },

  filterChipText: {
    color: '#697269',
    fontSize: 12,
    fontWeight: '700',
  },

  filterChipTextActive: {
    color: '#438C31',
    fontWeight: '800',
  },

  sectionHeading: {
    minHeight: 35,
    marginTop: 21,
    marginBottom: 10,
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

  sortButton: {
    minHeight: 36,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sortButtonPressed: {
    opacity: 0.65,
  },

  sortText: {
    color: '#438C31',
    fontSize: 13,
    fontWeight: '800',
  },

  deckCard: {
    minHeight: 84,
    marginBottom: 9,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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

  deckCardPressed: {
    borderColor: '#B8D5AE',
    backgroundColor: '#FCFFFB',
    transform: [{ scale: 0.99 }],
  },

  deckCover: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deckInfo: {
    flex: 1,
    minWidth: 0,
  },

  deckName: {
    color: '#151A15',
    fontSize: 14,
    fontWeight: '800',
  },

  deckSubtitle: {
    marginTop: 3,
    color: '#697269',
    fontSize: 11,
  },

  deckProgressTrack: {
    height: 5,
    marginTop: 8,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#EDF1EB',
  },

  deckProgressFill: {
    height: '100%',
    borderRadius: 20,
  },

  mastery: {
    width: 42,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },

  emptyCard: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF6E4',
  },

  emptyTitle: {
    marginTop: 12,
    color: '#151A15',
    fontSize: 16,
    fontWeight: '800',
  },

  emptyCopy: {
    maxWidth: 270,
    marginTop: 6,
    color: '#697269',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  createButton: {
    minHeight: 50,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#DCEBD5',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  createButtonText: {
    color: '#438C31',
    fontSize: 14,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
})

export default styles
