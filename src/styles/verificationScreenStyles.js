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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 32,
  },

  topRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  headerSpacer: {
    width: 44,
  },

  authContent: {
    flex: 1,
    paddingTop: 28,
  },

  successBurst: {
    width: 70,
    height: 70,
    marginBottom: 22,
    borderWidth: 8,
    borderColor: 'rgba(118, 196, 87, 0.12)',
    borderRadius: 35,
    backgroundColor: '#EAF6E4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  successBurstText: {
    color: '#438C31',
    fontSize: 30,
    fontWeight: '800',
  },

  title: {
    color: '#151A15',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
  },

  description: {
    maxWidth: 350,
    marginTop: 12,
    color: '#697269',
    fontSize: 15,
    lineHeight: 22,
  },

  emailHint: {
    marginTop: 7,
    color: '#438C31',
    fontSize: 13,
    fontWeight: '700',
  },

  form: {
    marginTop: 27,
  },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  otpInput: {
    width: 48,
    height: 54,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    color: '#151A15',
    fontSize: 21,
    fontWeight: '800',
  },

  otpInputFilled: {
    borderColor: '#76C457',
    backgroundColor: '#FBFEF9',
  },

  errorText: {
    minHeight: 18,
    marginTop: 8,
    color: '#E05252',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },

  primaryButton: {
    minHeight: 50,
    marginTop: 10,
    borderRadius: 14,
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

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 17,
  },

  resendPrompt: {
    color: '#697269',
    fontSize: 13,
  },

  resendLink: {
    marginLeft: 5,
    paddingVertical: 4,
    color: '#438C31',
    fontSize: 13,
    fontWeight: '800',
  },

  resendMessage: {
    marginTop: 8,
    color: '#438C31',
    fontSize: 12,
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },

  pressedSmall: {
    opacity: 0.6,
  },

  pressedLink: {
    opacity: 0.55,
    transform: [{ scale: 0.96 }],
  },
});

export default styles;
