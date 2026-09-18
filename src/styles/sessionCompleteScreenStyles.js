import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F8FAF7',
    },

    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingVertical: 40,
    },

    completeScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    successBurst: {
      width: 92,
      height: 92,
      marginBottom: 20,
      borderRadius: 46,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EAF6E4',
    },

    eyebrow: {
      color: '#438C31',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },

    title: {
      marginTop: 8,
      color: '#151A15',
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '800',
      textAlign: 'center',
    },

    bodyCopy: {
      maxWidth: 320,
      marginTop: 10,
      color: '#697269',
      fontSize: 15,
      lineHeight: 23,
      textAlign: 'center',
    },

    summaryCard: {
      width: '100%',
      marginTop: 28,
      padding: 16,
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

    metricRow: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    metricRowBorder: {
      borderTopWidth: 1,
      borderTopColor: '#EDF1EB',
    },

    metricLabel: {
      flex: 1,
    },

    metricTitle: {
      color: '#151A15',
      fontSize: 14,
      fontWeight: '800',
    },

    metricHint: {
      marginTop: 5,
      color: '#697269',
      fontSize: 12,
    },

    metricScore: {
      marginLeft: 16,
      color: '#438C31',
      fontSize: 18,
      fontWeight: '800',
    },

    goalCard: {
      minHeight: 46,
      marginTop: 13,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 12,
      backgroundColor: '#EAF6E4',
    },

    goalCardNeutral: {
      backgroundColor: '#F4F6F2',
    },

    goalCardText: {
      color: '#438C31',
      fontSize: 13,
      fontWeight: '800',
    },

    goalCardTextNeutral: {
      color: '#4F5A4E',
    },

    actions: {
      width: '100%',
      marginTop: 24,
      gap: 10,
    },

    secondaryButton: {
      width: '100%',
      minHeight: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: '#EAF6E4',
    },

    secondaryButtonText: {
      color: '#438C31',
      fontSize: 14,
      fontWeight: '800',
    },

    ghostButton: {
      width: '100%',
      minHeight: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#DCEBD5',
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
    },

    ghostButtonText: {
      color: '#438C31',
      fontSize: 14,
      fontWeight: '800',
    },

    textButton: {
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },

    textButtonText: {
      color: '#697269',
      fontSize: 14,
      fontWeight: '700',
    },

    buttonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.98 }],
    },
})

export default styles
