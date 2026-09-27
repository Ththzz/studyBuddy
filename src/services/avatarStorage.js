import { supabase } from './supabaseClient'

const AVATAR_BUCKET = 'avatars'
const SIGNED_URL_TTL_SECONDS = 60 * 60

function getAvatarContentType(uri) {
  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase()

  if (extension === 'png') return 'image/png'
  if (extension === 'webp') return 'image/webp'
  if (extension === 'heic' || extension === 'heif') return 'image/heic'

  return 'image/jpeg'
}

export function isLocalAvatarUri(uri) {
  return typeof uri === 'string'
    && /^(file|content|ph|assets-library):/i.test(uri)
}

export async function uploadAvatar({ userId, localUri }) {
  if (!userId || !isLocalAvatarUri(localUri)) {
    throw new Error('Choose a valid profile image before saving.')
  }

  const fileBody = await fetch(localUri).then((response) => {
    if (!response.ok) throw new Error('The selected image could not be read.')
    return response.arrayBuffer()
  })
  const path = `${userId}/avatar`
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, fileBody, {
      cacheControl: '3600',
      contentType: getAvatarContentType(localUri),
      upsert: true,
    })

  if (error) throw error

  return data.path
}

export async function getAvatarSignedUrl(path) {
  if (!path || typeof path !== 'string') return null

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)

  if (error) throw error

  return data.signedUrl
}
