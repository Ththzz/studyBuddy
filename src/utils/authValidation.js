const FULL_NAME_PATTERN = /^[\p{L}\p{M}]+(?:[\p{Zs}]+[\p{L}\p{M}]+)*$/u

const EMAIL_PATTERN = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i

export function isValidFullName(value) {
  const fullName = String(value ?? '').trim()

  return fullName.length > 0 && FULL_NAME_PATTERN.test(fullName)
}

export function isValidEmail(value) {
  const email = String(value ?? '')
  const atIndex = email.indexOf('@')
  const localPart = atIndex >= 0 ? email.slice(0, atIndex) : ''

  if (!email || /\s/u.test(email)) return false
  if (atIndex < 0 || atIndex !== email.lastIndexOf('@')) return false
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return false
  }

  return EMAIL_PATTERN.test(email)
}

export function isValidPassword(value) {
  const password = String(value ?? '')
  const characterCount = Array.from(password).length
  const hasSpecialCharacter = /[^\p{L}\p{M}\p{N}\s]/u.test(password)

  return characterCount >= 8 && hasSpecialCharacter
}
