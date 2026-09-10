import { StyleSheet } from 'react-native';

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F8FAF7',
    },

    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 24,
    },

    successStage: {
      width: 140,
      height: 140,
      marginBottom: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },

    successRipple: {
      position: 'absolute',
      width: 108,
      height: 108,
      borderRadius: 54,
      borderWidth: 3,
      borderColor: '#76C457',
      backgroundColor: 'transparent',
    },

    successBurst: {
      position: 'absolute',
      width: 108,
      height: 108,
      marginBottom: 0,
      borderRadius: 54,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EAF6E4',
      borderWidth: 14,
      borderColor: 'rgba(118, 196, 87, 0.12)',
    },

    successCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#76C457',
      shadowColor: '#438C31',
      shadowOffset: {
        width: 0,
        height: 7,
      },
      shadowOpacity: 0.24,
      shadowRadius: 12,
      elevation: 4,
    },

    eyebrow: {
      color: '#438C31',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 1.4,
    },

    title: {
      marginTop: 8,
      color: '#151A15',
      fontSize: 32,
      lineHeight: 38,
      fontWeight: '800',
      letterSpacing: -0.8,
      textAlign: 'center',
    },

    description: {
      marginTop: 10,
      color: '#697269',
      fontSize: 17,
      lineHeight: 25,
      textAlign: 'center',
    },

    descriptionStrong: {
      color: '#151A15',
      fontWeight: '800',
    },

    summaryCard: {
      width: '100%',
      minHeight: 76,
      marginTop: 26,
      marginBottom: 30,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1.5,
      borderColor: '#E2E8DF',
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
    },

    settingIcon: {
      width:  30,
      height: 30,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EAF6E4',
    },

    summaryCopy: {
      flex: 1,
      marginLeft: 11,
    },

    summaryTitle: {
      color: '#151A15',
      fontSize: 14,
      fontWeight: '800',
    },

    summarySubtitle: {
      marginTop: 3,
      color: '#697269',
      fontSize: 12,
    },

    summaryValue: {
      color: '#438C31',
      fontSize: 14,
      fontWeight: '800',
    },

    primaryButton: {
      width: '100%',
      minHeight: 54,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#76C457',
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
  });

  export default styles;
