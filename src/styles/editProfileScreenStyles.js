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
    paddingHorizontal: 24,
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
    marginTop: 12,
    color: '#697269',
    fontSize: 15,
    lineHeight: 22,
  },

  photoCard: {
    minHeight: 112,
    marginTop: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#B8D5AE',
    borderRadius: 16,
    backgroundColor: '#FBFEF9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#D7EBCE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarText: {
    color: '#438C31',
    fontSize: 28,
    fontWeight: '800',
  },

  photoCopy: {
    flex: 1,
    minWidth: 0,
  },

  photoTitle: {
    color: '#151A15',
    fontSize: 14,
    fontWeight: '800',
  },

  photoDescription: {
    marginTop: 3,
    color: '#697269',
    fontSize: 12,
    lineHeight: 17,
  },

  uploadButton: {
    minHeight: 40,
    minWidth: 66,
    paddingHorizontal: 12,
    borderRadius: 11,
    backgroundColor: '#EAF6E4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadButtonDisabled: {
    opacity: 0.65,
  },

  uploadButtonText: {
    color: '#438C31',
    fontSize: 12,
    fontWeight: '800',
  },

  fieldGroup: {
    marginTop: 20,
  },

  fieldLabel: {
    marginBottom: 8,
    color: '#697269',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },

  input: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    color: '#151A15',
    fontSize: 16,
  },

  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },

  yearChoice: {
    width: '31.8%',
    minHeight: 45,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  yearChoiceActive: {
    borderColor: '#76C457',
    backgroundColor: '#EAF6E4',
  },

  yearChoiceText: {
    color: '#697269',
    fontSize: 12,
    fontWeight: '800',
  },

  yearChoiceTextActive: {
    color: '#438C31',
  },

  saveButton: {
    minHeight: 54,
    marginTop: 28,
    borderRadius: 15,
    backgroundColor: '#76C457',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#76C457',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
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
})

export default styles
