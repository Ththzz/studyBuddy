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

  formCard: {
    marginTop: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  fieldLabel: {
    marginBottom: 8,
    color: '#697269',
    fontSize: 12,
    fontWeight: '800',
  },

  input: {
    minHeight: 46,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 12,
    backgroundColor: '#FBFCFA',
    color: '#151A15',
    fontSize: 14,
  },

  cardsHeader: {
    marginTop: 24,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#151A15',
    fontSize: 19,
    fontWeight: '800',
  },

  cardCount: {
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

  cardForm: {
    marginBottom: 9,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  cardFormHeader: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardNumber: {
    color: '#438C31',
    fontSize: 13,
    fontWeight: '800',
  },

  removeCardButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  multilineInput: {
    minHeight: 76,
    paddingTop: 12,
    paddingBottom: 12,
  },

  addCardButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: '#DCEBD5',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },

  addCardText: {
    color: '#438C31',
    fontSize: 13,
    fontWeight: '800',
  },

  errorText: {
    marginTop: 10,
    color: '#A73737',
    fontSize: 12,
    fontWeight: '700',
  },

  saveButton: {
    minHeight: 52,
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

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
})

export default styles
