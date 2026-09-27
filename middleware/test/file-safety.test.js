import assert from 'node:assert/strict'
import test from 'node:test'
import { extractStudyMaterial } from '../src/extract-study-material.js'

function upload({ name = 'notes.txt', mimeType = 'text/plain', buffer }) {
  return { originalname: name, mimetype: mimeType, buffer }
}

const validStudyText = [
  'Computer networks use protocols to let devices exchange data reliably.',
  'The transport layer divides messages into segments and uses ports to identify applications.',
  'TCP provides ordered delivery while UDP is useful when lower overhead matters.',
].join(' ')

test('accepts readable study text with a matching extension and MIME type', async () => {
  const material = await extractStudyMaterial(upload({ buffer: Buffer.from(validStudyText) }))
  assert.equal(material.kind, 'text')
  assert.match(material.text, /Computer networks/)
})

test('rejects a PDF renamed as a TXT file', async () => {
  await assert.rejects(
    extractStudyMaterial(upload({ buffer: Buffer.from('%PDF-1.7 sample content') })),
    (error) => error.statusCode === 415 && /extension/i.test(error.message),
  )
})

test('rejects unreadable binary data disguised as text', async () => {
  await assert.rejects(
    extractStudyMaterial(upload({ buffer: Buffer.from([0xff, 0xfe, 0xfd, 0x00, 0x81, 0x82, 0x83]) })),
    (error) => error.statusCode === 415 && /binary|unreadable/i.test(error.message),
  )
})

test('rejects a PNG file that contains only a valid signature', async () => {
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  await assert.rejects(
    extractStudyMaterial(upload({ name: 'broken.png', mimeType: 'image/png', buffer: pngSignature })),
    (error) => error.statusCode === 422 && /incomplete|invalid/i.test(error.message),
  )
})

test('rejects a PNG with IHDR but no image data or end chunk', async () => {
  const truncatedPng = Buffer.alloc(33)
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(truncatedPng)
  truncatedPng.writeUInt32BE(13, 8)
  truncatedPng.write('IHDR', 12, 'ascii')
  truncatedPng.writeUInt32BE(1, 16)
  truncatedPng.writeUInt32BE(1, 20)

  await assert.rejects(
    extractStudyMaterial(upload({ name: 'truncated.png', mimeType: 'image/png', buffer: truncatedPng })),
    (error) => error.statusCode === 422 && /incomplete|invalid/i.test(error.message),
  )
})

test('rejects repeated filler text', async () => {
  await assert.rejects(
    extractStudyMaterial(upload({ buffer: Buffer.from('study '.repeat(50)) })),
    (error) => error.statusCode === 422 && /repeated|unusable/i.test(error.message),
  )
})
