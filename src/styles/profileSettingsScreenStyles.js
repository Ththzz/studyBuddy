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

  profileHeroCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 223, 0.8)',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#152914',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  profileHero: {
    alignItems: 'center',
    paddingTop: 3,
    paddingBottom: 3,
  },

  profileAvatar: {
    width: 82,
    height: 82,
    marginBottom: 11,
    borderRadius: 41,
    backgroundColor: '#D7EBCE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },

  profileAvatarText: {
    color: '#438C31',
    fontSize: 30,
    fontWeight: '800',
  },

  profileName: {
    color: '#151A15',
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
  },

  profileNameRow: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  profileMetaGrid: {
    width: '100%',
    marginTop: 15,
    flexDirection: 'row',
    gap: 7,
  },

  profileMetaCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 11,
    backgroundColor: '#F8FAF7',
    justifyContent: 'center',
  },

  profileMetaLabel: {
    color: '#9AA49A',
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  profileMetaValue: {
    marginTop: 3,
    color: '#151A15',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },

  settingsGroup: {
    marginTop: 24,
  },

  settingsGroupTitle: {
    marginHorizontal: 3,
    marginBottom: 8,
    color: '#697269',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  settingsCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 223, 0.8)',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#152914',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 9,
    elevation: 2,
  },

  settingRow: {
    minHeight: 70,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2ED',
  },

  settingRowLast: {
    borderBottomWidth: 0,
  },

  settingRowPressed: {
    backgroundColor: '#F7FCF4',
  },

  settingIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#EAF6E4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingIconDanger: {
    backgroundColor: '#FFF0F0',
  },

  settingCopy: {
    flex: 1,
    minWidth: 0,
  },

  settingTitle: {
    color: '#151A15',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },

  settingDangerText: {
    color: '#A73737',
  },

  settingSubtitle: {
    marginTop: 2,
    color: '#697269',
    fontSize: 12,
    lineHeight: 15,
  },

  settingValue: {
    color: '#697269',
    fontSize: 12,
    fontWeight: '700',
  },

  switchTrack: {
    width: 43,
    height: 26,
    padding: 3,
    borderRadius: 14,
    backgroundColor: '#DDE4DA',
    justifyContent: 'center',
  },

  switchTrackActive: {
    backgroundColor: '#76C457',
  },

  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  switchThumbActive: {
    alignSelf: 'flex-end',
  },

  editorPanel: {
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#B8D5AE',
    borderRadius: 16,
    backgroundColor: '#FBFEF9',
  },

  editorTitle: {
    marginBottom: 13,
    color: '#151A15',
    fontSize: 15,
    fontWeight: '800',
  },

  editorLabel: {
    marginTop: 11,
    marginBottom: 6,
    color: '#697269',
    fontSize: 12,
    fontWeight: '800',
  },

  editorInput: {
    minHeight: 45,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    color: '#151A15',
    fontSize: 14,
  },

  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  choice: {
    width: '31.8%',
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  choiceActive: {
    borderColor: '#76C457',
    backgroundColor: '#EAF6E4',
  },

  choiceText: {
    color: '#697269',
    fontSize: 12,
    fontWeight: '800',
  },

  choiceTextActive: {
    color: '#438C31',
  },

  choicePressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },

  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },

  dayChoice: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayChoiceActive: {
    borderColor: '#76C457',
    backgroundColor: '#EAF6E4',
  },

  dayChoiceText: {
    color: '#697269',
    fontSize: 13,
    fontWeight: '800',
  },

  dayChoiceTextActive: {
    color: '#438C31',
  },

  subjectChoices: {
    gap: 7,
  },

  subjectChoice: {
    minHeight: 43,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#E2E8DF',
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  subjectChoiceActive: {
    borderColor: '#B8D5AE',
    backgroundColor: '#F7FCF4',
  },

  subjectChoiceText: {
    color: '#697269',
    fontSize: 12,
    fontWeight: '700',
  },

  subjectChoiceTextActive: {
    color: '#438C31',
  },

  editorError: {
    marginTop: 8,
    color: '#A73737',
    fontSize: 11,
    fontWeight: '700',
  },

  editorActions: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },

  editorCancel: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editorCancelText: {
    color: '#697269',
    fontSize: 12,
    fontWeight: '800',
  },

  editorSave: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#76C457',
    alignItems: 'center',
    justifyContent: 'center',
  },

  editorSaveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },

  pressedSmall: {
    opacity: 0.6,
  },
})

export default styles
