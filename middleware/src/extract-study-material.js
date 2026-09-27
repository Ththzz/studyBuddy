import path from 'node:path'
import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'
import { HttpError } from './errors.js'

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const MAX_SOURCE_CHARACTERS = 45000
const MIN_SOURCE_CHARACTERS = 80
const MIN_SOURCE_WORDS = 8
const GENERIC_BINARY_MIME_TYPES = new Set(['', 'application/octet-stream'])

const FILE_TYPES = {
  pdf: {
    extensions: new Set(['.pdf']),
    mimeTypes: new Set(['application/pdf']),
  },
  docx: {
    extensions: new Set(['.docx']),
    mimeTypes: new Set(['application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  },
  text: {
    extensions: new Set(['.txt']),
    mimeTypes: new Set(['text/plain']),
  },
  jpeg: {
    extensions: new Set(['.jpg', '.jpeg']),
    mimeTypes: new Set(['image/jpeg']),
  },
  png: {
    extensions: new Set(['.png']),
    mimeTypes: new Set(['image/png']),
  },
  webp: {
    extensions: new Set(['.webp']),
    mimeTypes: new Set(['image/webp']),
  },
  gif: {
    extensions: new Set(['.gif']),
    mimeTypes: new Set(['image/gif']),
  },
}

function getExtension(fileName = '') {
  return path.extname(fileName).toLowerCase()
}

function trimSourceText(text) {
  return String(text || '').replace(/\u0000/g, '').trim().slice(0, MAX_SOURCE_CHARACTERS)
}

function hasSignature(buffer, signature, offset = 0) {
  return buffer.length >= offset + signature.length && buffer.subarray(offset, offset + signature.length).equals(signature)
}

function detectFileType(buffer) {
  if (hasSignature(buffer, Buffer.from('%PDF-'))) return 'pdf'
  if (hasSignature(buffer, Buffer.from([0x50, 0x4b, 0x03, 0x04]))) return 'docx'
  if (hasSignature(buffer, Buffer.from([0xff, 0xd8, 0xff]))) return 'jpeg'
  if (hasSignature(buffer, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (hasSignature(buffer, Buffer.from('RIFF')) && hasSignature(buffer, Buffer.from('WEBP'), 8)) return 'webp'
  if (hasSignature(buffer, Buffer.from('GIF87a')) || hasSignature(buffer, Buffer.from('GIF89a'))) return 'gif'
  return 'text'
}

function readUInt32BigEndian(buffer, offset) {
  return buffer.readUInt32BE(offset)
}

function isValidPng(buffer) {
  if (buffer.length < 45) return false

  let offset = 8
  let sawIhdr = false
  let sawImageData = false
  while (offset + 12 <= buffer.length) {
    const chunkLength = readUInt32BigEndian(buffer, offset)
    const chunkType = buffer.subarray(offset + 4, offset + 8).toString('ascii')
    const chunkEnd = offset + 12 + chunkLength
    if (chunkEnd > buffer.length) return false

    if (!sawIhdr) {
      if (chunkType !== 'IHDR' || chunkLength !== 13) return false
      const width = readUInt32BigEndian(buffer, offset + 8)
      const height = readUInt32BigEndian(buffer, offset + 12)
      if (width === 0 || height === 0) return false
      sawIhdr = true
    } else if (chunkType === 'IDAT') {
      if (chunkLength === 0) return false
      sawImageData = true
    } else if (chunkType === 'IEND') {
      return chunkLength === 0 && sawImageData && chunkEnd === buffer.length
    }

    offset = chunkEnd
  }

  return false
}

function isValidGif(buffer) {
  if (buffer.length < 13) return false
  return buffer.readUInt16LE(6) > 0 && buffer.readUInt16LE(8) > 0
}

function isValidWebp(buffer) {
  if (buffer.length < 20) return false
  const declaredRiffSize = buffer.readUInt32LE(4)
  const chunkType = buffer.subarray(12, 16).toString('ascii')
  const chunkSize = buffer.readUInt32LE(16)
  const isImageChunk = ['VP8 ', 'VP8L', 'VP8X'].includes(chunkType)
  return declaredRiffSize + 8 <= buffer.length
    && isImageChunk
    && chunkSize > 0
    && 20 + chunkSize <= buffer.length
}

function isValidJpeg(buffer) {
  if (buffer.length < 10 || !hasSignature(buffer, Buffer.from([0xff, 0xd8, 0xff])) || !hasSignature(buffer, Buffer.from([0xff, 0xd9]), buffer.length - 2)) {
    return false
  }

  let offset = 2
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1
      continue
    }
    while (buffer[offset] === 0xff) offset += 1
    const marker = buffer[offset]
    offset += 1

    if (marker === 0xd9 || marker === 0xda) break
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
    if (offset + 2 > buffer.length) return false

    const segmentLength = buffer.readUInt16BE(offset)
    if (segmentLength < 2 || offset + segmentLength > buffer.length) return false
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xc3
      || marker >= 0xc5 && marker <= 0xc7
      || marker >= 0xc9 && marker <= 0xcb
      || marker >= 0xcd && marker <= 0xcf
    if (isStartOfFrame && segmentLength >= 8) {
      const height = buffer.readUInt16BE(offset + 3)
      const width = buffer.readUInt16BE(offset + 5)
      return width > 0 && height > 0
    }
    offset += segmentLength
  }

  return false
}

function assertValidImageStructure(file, detectedType) {
  const validators = {
    jpeg: isValidJpeg,
    png: isValidPng,
    webp: isValidWebp,
    gif: isValidGif,
  }

  if (!validators[detectedType]?.(file.buffer)) {
    throw new HttpError(422, 'This image file is incomplete or invalid. Choose a different image.')
  }
}

function assertFileTypeMatches(file, detectedType) {
  const extension = getExtension(file.originalname)
  const declaredMimeType = String(file.mimetype || '').toLowerCase()
  const expected = FILE_TYPES[detectedType]

  if (!expected) throw new HttpError(415, 'This file type is not supported.')
  if (!expected.extensions.has(extension)) {
    throw new HttpError(415, 'The file extension does not match the file contents.')
  }
  if (!GENERIC_BINARY_MIME_TYPES.has(declaredMimeType) && !expected.mimeTypes.has(declaredMimeType)) {
    throw new HttpError(415, 'The file type does not match its declared format.')
  }

  if (detectedType === 'docx') {
    const hasDocxEntries = file.buffer.includes(Buffer.from('[Content_Types].xml'))
      && file.buffer.includes(Buffer.from('word/'))
    if (!hasDocxEntries) {
      throw new HttpError(415, 'The selected DOCX file is not a valid Office document.')
    }
  }
}

function assertMeaningfulText(text) {
  if (text.length < MIN_SOURCE_CHARACTERS) {
    throw new HttpError(422, 'This file does not contain enough readable study material.')
  }

  const words = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []
  if (words.length < MIN_SOURCE_WORDS) {
    throw new HttpError(422, 'This file does not contain enough readable study material.')
  }

  const wordCounts = new Map()
  for (const word of words) {
    const normalizedWord = word.toLocaleLowerCase()
    wordCounts.set(normalizedWord, (wordCounts.get(normalizedWord) || 0) + 1)
  }
  const mostCommonWordCount = Math.max(0, ...wordCounts.values())
  if (mostCommonWordCount / words.length > 0.55) {
    throw new HttpError(422, 'This file appears to contain repeated or unusable text.')
  }

  const printableCharacters = text.match(/[\p{L}\p{N}\p{P}\p{Z}\n\r\t]/gu)?.length || 0
  if (printableCharacters / text.length < 0.9) {
    throw new HttpError(415, 'This text file appears to contain binary or unreadable data.')
  }

  const nonWhitespaceText = text.replace(/\s/g, '')
  const characterCounts = new Map()
  for (const character of nonWhitespaceText) {
    characterCounts.set(character, (characterCounts.get(character) || 0) + 1)
  }
  const mostCommonCharacterCount = Math.max(0, ...characterCounts.values())
  const nonWhitespaceLength = nonWhitespaceText.length
  if (nonWhitespaceLength > 0 && mostCommonCharacterCount / nonWhitespaceLength > 0.45) {
    throw new HttpError(422, 'This file appears to contain repeated or unusable text.')
  }
}

export async function extractStudyMaterial(file) {
  if (!file?.buffer?.length) {
    throw new HttpError(400, 'Choose a study material file first.')
  }

  const detectedType = detectFileType(file.buffer)
  assertFileTypeMatches(file, detectedType)

  if (['jpeg', 'png', 'webp', 'gif'].includes(detectedType)) {
    assertValidImageStructure(file, detectedType)
    return {
      kind: 'image',
      mimeType: [...FILE_TYPES[detectedType].mimeTypes][0],
      base64: file.buffer.toString('base64'),
    }
  }

  if (detectedType === 'text') {
    let decodedText
    try {
      decodedText = new TextDecoder('utf-8', { fatal: true }).decode(file.buffer)
    } catch {
      throw new HttpError(415, 'This text file appears to contain binary or unreadable data.')
    }
    const text = trimSourceText(decodedText)
    assertMeaningfulText(text)
    return { kind: 'text', text }
  }

  if (detectedType === 'docx') {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer })
      const text = trimSourceText(result.value)
      assertMeaningfulText(text)
      return { kind: 'text', text }
    } catch (error) {
      if (error instanceof HttpError) throw error
      throw new HttpError(422, 'This DOCX file could not be read. Try exporting it again as DOCX or PDF.')
    }
  }

  if (detectedType === 'pdf') {
    const parser = new PDFParse({ data: file.buffer })
    try {
      const result = await parser.getText()
      const text = trimSourceText(result.text)
      assertMeaningfulText(text)
      return { kind: 'text', text }
    } catch (error) {
      if (error instanceof HttpError) throw error
      throw new HttpError(422, 'This PDF could not be read. Check that it is not password-protected.')
    } finally {
      await parser.destroy()
    }
  }

  throw new HttpError(415, 'Supported material: PDF, DOCX, TXT, JPG, PNG, WebP, or GIF.')
}

export const supportedImageMimeTypes = IMAGE_MIME_TYPES
