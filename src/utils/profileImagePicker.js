import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

export async function pickProfileImage() {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      Alert.alert(
        'Photo access required',
        'Allow Study Buddy to access your photos to choose a profile picture.',
        [{ text: 'OK' }],
      )
      return null
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    })

    if (result.canceled) return null

    return result.assets?.[0]?.uri || null
  } catch (error) {
    console.warn('Profile image selection failed', error)
    Alert.alert(
      'Could not choose photo',
      'Please try selecting a photo again.',
      [{ text: 'OK' }],
    )
    return null
  }
}
