import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F8FAF7',
    },
  
    container: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 52,
      paddingBottom: 28,
    },
  
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 24,
    },
  
    logo: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: '#76C457',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  
      // เงาสำหรับ iOS
      shadowColor: '#152914',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 5,
  
      // เงาสำหรับ Android
      elevation: 2,
    },
  
    logoText: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '800',
    },
  
    brandName: {
      color: '#151A15',
      fontSize: 19,
      fontWeight: '700',
    },
  
    subtitle: {
      color: '#697269',
      fontSize: 13,
      marginTop: 3,
    },
  
    illustration: {
      width: '100%',
      height: 230,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      marginTop: 28,
      marginBottom: 18,
    },
  
    circle: {
        width: 184,
        height: 184,
        borderRadius: 92,
        backgroundColor: '#EAF6E4',
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      },
  
    infoCard: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      paddingHorizontal: 15,
      paddingVertical: 13,
  
      // เงาสำหรับ iOS
      shadowColor: '#152914',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
  
      // เงาสำหรับ Android
      elevation: 3,
    },
  
    focusCard: {
      left: 0,
      top: 36,
      transform: [{ rotate: '-8deg' }],
    },
  
    streakCard: {
      right: 0,
      bottom: 25,
      transform: [{ rotate: '7deg' }],
    },
  
    icon: {
      color: '#438C31',
      fontSize: 16,
      fontWeight: '800',
      marginRight: 6,
    },
  
    cardText: {
      color: '#151A15',
      fontSize: 12,
      fontWeight: '700',
    },
  
    greenText: {
      color: '#438C31',
      fontSize: 12,
      fontWeight: '700',
    },
  
    title: {
      maxWidth: 320,
      color: '#151A15',
      fontSize: 30,
      lineHeight: 34,
      fontWeight: '800',
      textAlign: 'center',
      marginTop: 18,
    },
  
    description: {
      maxWidth: 330,
      color: '#697269',
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      marginTop: 12,
    },
  
    buttonContainer: {
      width: '100%',
      marginTop: 30,
    },
  
    primaryButton: {
      minHeight: 50,
      borderRadius: 14,
      backgroundColor: '#76C457',
      justifyContent: 'center',
      alignItems: 'center',
    },
  
    primaryText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
  
    loginPrompt: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      paddingVertical: 8,
    },

    loginPromptText: {
      color: '#697269',
      fontSize: 16,
    },

    loginLink: {
      paddingVertical: 2,
      marginLeft: 4,
    },

    loginText: {
      color: '#438C31',
      fontSize: 16,
      fontWeight: '700',
    },
  
    pressedButton: {
      opacity: 0.7,
      transform: [{ scale: 0.98 }],
    },

    pressedLink: {
      opacity: 0.55,
      transform: [{ scale: 0.96 }],
    },
  
    footer: {
      color: '#697269',
      fontSize: 13,
      marginTop: 22,
    },

    emoji: {
        fontSize: 52,
      },
    
  });

export default styles;

