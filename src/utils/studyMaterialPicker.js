import { Alert } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'

function formatFileSize(bytes) {
  const numericBytes = Number(bytes)

  if (!Number.isFinite(numericBytes) || numericBytes <= 0) return 'Size unavailable'
  if (numericBytes < 1024 * 1024) return `${Math.max(1, Math.round(numericBytes / 1024))} KB`

  return `${(numericBytes / (1024 * 1024)).toFixed(1)} MB`
}

function getImageName(asset) {
  if (asset.fileName) return asset.fileName

  const extension = asset.mimeType?.split('/')[1] || 'jpg'
  return `study-material-${Date.now()}.${extension}`
}

export async function pickStudyDocument() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      copyToCacheDirectory: true,
      multiple: false,
    })

    if (result.canceled) return null

    const asset = result.assets?.[0]
    if (!asset?.uri) return null

    return {
      uri: asset.uri,
      name: asset.name || `study-material-${Date.now()}`,
      type: 'Document',
      size: formatFileSize(asset.size),
      mimeType: asset.mimeType || 'application/octet-stream',
      source: 'document',
    }
  } catch (error) {
    console.warn('Study document selection failed', error)
    Alert.alert('Could not choose file', 'Please try selecting the study material again.', [{ text: 'OK' }])
    return null
  }
}

export async function pickStudyPhoto(source = 'library') {
  try {
    if (source === 'camera') {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert(
          'Camera access required',
          'Allow Study Buddy to use your camera to capture study material.',
          [{ text: 'OK' }],
        )
        return null
      }
    } else {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert(
          'Photo access required',
          'Allow Study Buddy to access your photos to choose study material.',
          [{ text: 'OK' }],
        )
        return null
      }
    }

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      })
      : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      })

    if (result.canceled) return null

    const asset = result.assets?.[0]
    if (!asset?.uri) return null

    return {
      uri: asset.uri,
      name: getImageName(asset),
      type: 'Image',
      size: formatFileSize(asset.fileSize),
      mimeType: asset.mimeType || 'image/jpeg',
      source,
    }
  } catch (error) {
    console.warn('Study photo selection failed', error)
    Alert.alert('Could not choose photo', 'Please try selecting the study material again.', [{ text: 'OK' }])
    return null
  }
}
