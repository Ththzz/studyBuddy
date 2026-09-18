import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = '@studybuddy/study-sessions'

export async function loadStudySessions() {
  try {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEY)
    if (storedValue === null) {
      return { success: true, sessions: [] }
    }

    const sessions = JSON.parse(storedValue)

    if (!Array.isArray(sessions)) {
      const error = new Error('Stored study sessions must be an array')
      console.warn('Unable to load study sessions', error)
      return { success: false, sessions: [], error }
    }

    return { success: true, sessions }
  } catch (error) {
    console.warn('Unable to load study sessions', error)
    return { success: false, sessions: [], error }
  }
}

export async function saveStudySessions(sessions) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch (error) {
    console.warn('Unable to save study sessions', error)
  }
}
