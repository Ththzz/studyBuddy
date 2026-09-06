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
    paddingTop: 24,
    paddingBottom: 32,
  },

  header: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButton: {
    position: 'absolute',
    left: 0,
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

  headerTitle: {
    color: '#438C31',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  title: {
    marginTop: 48,
    color: '#151A15',
    fontSize: 34,
    lineHeight: 40,
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
    marginTop: 42,
  },

  fieldGroup: {
    marginBottom: 18,
  },

  label: {
    color: '#697269',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },

  input: {
    height: 56,
    marginTop: 8,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#DDE5D9',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    color: '#151A15',
    fontSize: 17,
  },

  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginTop: -8,
    marginBottom: 24,
  },

  forgotText: {
    color: '#438C31',
    fontSize: 16,
    fontWeight: '800',
  },

  primaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#76C457',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#438C31',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 3,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDE5D9',
  },

  dividerText: {
    marginHorizontal: 12,
    color: '#A4AEA4',
    fontSize: 16,
  },

  socialButton: {
    height: 55,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#DDE5D9',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  appleIcon: {
    width: 30,
    color: '#151A15',
    fontSize: 25,
    textAlign: 'center',
  },

  googleIcon: {
    width: 30,
    color: '#151A15',
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
  },

  socialText: {
    marginLeft: 8,
    color: '#151A15',
    fontSize: 17,
    fontWeight: '800',
  },

  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  footerText: {
    color: '#697269',
    fontSize: 16,
  },

  footerLink: {
    color: '#438C31',
    fontSize: 16,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  pressedLink: {
    opacity: 0.55,
    transform: [{ scale: 0.96 }],
  },
});

export default styles;

