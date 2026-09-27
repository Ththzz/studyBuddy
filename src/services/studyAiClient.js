import { fetch } from 'expo/fetch'
import { File } from 'expo-file-system'
import { supabase } from './supabaseClient'

function getStudyApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_STUDY_API_URL?.trim()
  if (!configuredUrl) {
    throw new Error('Study AI server URL is missing. Set EXPO_PUBLIC_STUDY_API_URL in .env.local and restart Expo.')
  }

  return configuredUrl.replace(/\/+$/, '')
}

function getNetworkErrorMessage(error) {
  const reason = error instanceof Error && error.message ? ` (${error.message})` : ''
  return `Could not reach the Study Buddy middleware${reason}`
}

async function withAuthenticatedOptions(options) {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session?.access_token) {
    throw new Error('Please sign in again before using Study Buddy AI.')
  }

  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${data.session.access_token}`,
    },
  }
}

async function requestStudyApi(path, options) {
  const url = `${getStudyApiBaseUrl()}${path}`
  let response = await fetch(url, options)

  // Quick Tunnel can occasionally return its own 502 before the request reaches our middleware.
  // Only retry that case once; responses from our middleware include the origin header.
  if (response.status === 502 && response.headers.get('x-study-buddy-origin') !== 'middleware') {
    response = await fetch(url, options)
  }

  return response
}

async function readApiResponse(response) {
  let responseText
  try {
    responseText = await response.text()
  } catch {
    throw new Error(`The Study Buddy server closed the response (HTTP ${response.status}).`)
  }

  let payload
  try {
    payload = JSON.parse(responseText)
  } catch {
    if (!response.ok) {
      throw new Error(`The Study Buddy server returned HTTP ${response.status}. Please try again.`)
    }
    throw new Error('The Study Buddy server returned an unreadable response.')
  }

  if (!response.ok) {
    const message = typeof payload?.error === 'string'
      ? payload.error
      : typeof payload?.message === 'string'
        ? payload.message
        : `The Study Buddy server returned HTTP ${response.status}. Please try again.`
    throw new Error(message)
  }

  if (!payload?.data || typeof payload.data !== 'object') {
    throw new Error('The Study Buddy server returned incomplete study content.')
  }

  return payload.data
}

export async function generateStudyContent({ file, questionCount, difficulty, outputLanguage, questionType }) {
  if (!file?.uri) throw new Error('Choose a study material file first.')

  const formData = new FormData()
  formData.append('file', new File(file.uri))
  formData.append('questionCount', String(questionCount))
  formData.append('difficulty', difficulty)
  formData.append('outputLanguage', outputLanguage || 'English')
  formData.append('questionType', questionType)

  const options = await withAuthenticatedOptions({
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  })

  let response
  try {
    response = await requestStudyApi('/api/study/generate', options)
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error))
  }

  return readApiResponse(response)
}

export async function evaluateStudyAnswer({ subjectName, question, referenceAnswer, userAnswer }) {
  const options = await withAuthenticatedOptions({
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subjectName, question, referenceAnswer, userAnswer }),
  })

  let response
  try {
    response = await requestStudyApi('/api/study/evaluate', options)
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error))
  }

  return readApiResponse(response)
}
