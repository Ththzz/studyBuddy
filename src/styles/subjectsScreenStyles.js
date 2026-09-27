import { StyleSheet } from 'react-native'

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
    paddingBottom: 34,
  },

  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '800',
  },

  description: {
    marginTop: 9,
    color: '#697269',
    fontSize: 15,
    lineHeight: 22,
  },

  addCard: {
    marginTop: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#B8D5AE',
    borderRadius: 16,
    backgroundColor: '#FBFEF9',
  },

  sectionTitle: {
    color: '#151A15',
    fontSize: 15,
    fontWeight: '800',
  },

  addRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  input: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    color: '#151A15',
    fontSize: 14,
  },

  addButton: {
    minHeight: 46,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: '#76C457',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  errorText: {
    marginTop: 8,
    color: '#A73737',
    fontSize: 12,
    fontWeight: '700',
  },

  listSection: {
    marginTop: 24,
  },

  listHeader: {
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  countText: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EAF6E4',
    color: '#438C31',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },

  subjectRow: {
    minHeight: 64,
    marginBottom: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  subjectNumber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#EAF6E4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  subjectNumberText: {
    color: '#438C31',
    fontSize: 13,
    fontWeight: '800',
  },

  subjectName: {
    flex: 1,
    color: '#151A15',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },

  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editContent: {
    flex: 1,
  },

  editInput: {
    minHeight: 42,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#B8D5AE',
    borderRadius: 10,
    backgroundColor: '#FBFEF9',
    color: '#151A15',
    fontSize: 14,
  },

  editActions: {
    marginTop: 7,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },

  textAction: {
    minHeight: 34,
    paddingHorizontal: 9,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    color: '#697269',
    fontSize: 12,
    fontWeight: '800',
  },

  saveButton: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: '#76C457',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  emptyCard: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EAF6E4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 12,
    color: '#151A15',
    fontSize: 16,
    fontWeight: '800',
  },

  emptyCopy: {
    maxWidth: 280,
    marginTop: 5,
    color: '#697269',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
})

export default styles
