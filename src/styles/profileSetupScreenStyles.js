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

  form: {
    marginTop: 22,
  },

  profileUpload: {
    minHeight: 112,
    padding: 15,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#B8D5AE',
    borderRadius: 14,
    backgroundColor: '#FBFEF9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#D7EBCE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#438C31',
    fontSize: 25,
    fontWeight: '800',
  },

  uploadCopy: {
    flex: 1,
    minWidth: 0,
  },

  uploadTitle: {
    color: '#151A15',
    fontSize: 15,
    fontWeight: '800',
  },

  uploadDescription: {
    marginTop: 3,
    color: '#697269',
    fontSize: 13,
    lineHeight: 18,
  },

  uploadButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#EAF6E4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadButtonText: {
    color: '#438C31',
    fontSize: 14,
    fontWeight: '800',
  },

  fieldGroup: {
    marginTop: 20,
  },

  fieldLabel: {
    marginBottom: 8,
    color: '#697269',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  input: {
    minHeight: 56,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8DF',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    color: '#151A15',
    fontSize: 17,
  },

  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  yearChoice: {
    width: '31.8%',
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8DF',
    borderRadius: 14,
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
    fontSize: 14,
    fontWeight: '800',
  },

  yearChoiceTextActive: {
    color: '#438C31',
  },

  pressedChoice: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
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

  pressedSmall: {
    opacity: 0.6,
  },
});

export default styles;
