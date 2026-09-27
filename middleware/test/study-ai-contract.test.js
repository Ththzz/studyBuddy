import assert from 'node:assert/strict'
import test from 'node:test'
import { generateStudyContent } from '../src/study-ai.js'

const originalFetch = globalThis.fetch
const originalConfig = {
  baseUrl: process.env.AI_BASE_URL,
  model: process.env.AI_MODEL,
  apiKey: process.env.AI_API_KEY,
}

process.env.AI_BASE_URL = 'https://example.test/v1'
process.env.AI_MODEL = 'test-model'
process.env.AI_API_KEY = 'test-key'

const studyFile = {
  originalname: 'networks.txt',
  mimetype: 'text/plain',
  buffer: Buffer.from([
    'Computer networks use protocols so devices exchange data reliably.',
    'TCP provides ordered delivery while UDP uses lower overhead for time-sensitive traffic.',
    'Ports identify applications and routers forward packets between networks.',
  ].join(' ')),
}

function completion(body) {
  return new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify(body) }, finish_reason: 'stop' }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

function mockProvider(responses, requests) {
  globalThis.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body))
    return completion(responses.shift())
  }
}

function flashcards(count, difficulty) {
  return {
    deckName: 'Computer Networks',
    cards: Array.from({ length: count }, (_, index) => ({
      question: `Concept ${index + 1}`,
      answer: `Answer ${index + 1}`,
      difficulty,
    })),
  }
}

function multipleChoiceQuestions(count, difficulty) {
  return {
    subjectName: 'Computer Networks',
    questions: Array.from({ length: count }, (_, index) => ({
      prompt: `Question ${index + 1}`,
      difficulty,
      answers: [
        { key: 'A', text: 'Option A' },
        { key: 'B', text: 'Option B' },
        { key: 'C', text: 'Option C' },
        { key: 'D', text: 'Option D' },
      ],
      correctKey: 'A',
      explanation: 'Grounded in the source.',
    })),
  }
}

function qaQuestions(count, difficulty) {
  return {
    subjectName: 'Computer Networks',
    questions: Array.from({ length: count }, (_, index) => ({
      prompt: `Explain concept ${index + 1}`,
      difficulty,
      sampleAnswer: `Sample answer ${index + 1}`,
      keyPoints: ['One key point'],
    })),
  }
}

test.after(() => {
  globalThis.fetch = originalFetch
  process.env.AI_BASE_URL = originalConfig.baseUrl
  process.env.AI_MODEL = originalConfig.model
  process.env.AI_API_KEY = originalConfig.apiKey
})

test('returns exactly the requested number and sends the selected difficulty rubric', async () => {
  const requests = []
  mockProvider([
    { allowed: true, confidence: 0.95, topic: 'Computer networks', reason: 'Lecture notes' },
    flashcards(5, 'Hard'),
  ], requests)

  const result = await generateStudyContent({
    file: studyFile,
    questionCount: 5,
    difficulty: 'Hard',
    questionType: 'Flashcards',
  })

  assert.equal(result.cards.length, 5)
  assert.match(requests[1].messages[1].content, /Create exactly 5 items at Hard difficulty/)
  assert.match(requests[1].messages[1].content, /multi-step reasoning/i)
})

test('rejects an AI result with fewer items than requested', async () => {
  mockProvider([
    { allowed: true, confidence: 0.95, topic: 'Computer networks', reason: 'Lecture notes' },
    flashcards(4, 'Medium'),
  ], [])

  await assert.rejects(
    generateStudyContent({ file: studyFile, questionCount: 5, difficulty: 'Medium', questionType: 'Flashcards' }),
    (error) => error.statusCode === 502 && /4 of 5 requested cards/i.test(error.message),
  )
})

test('rejects an AI result whose difficulty does not match the selection', async () => {
  mockProvider([
    { allowed: true, confidence: 0.95, topic: 'Computer networks', reason: 'Lecture notes' },
    flashcards(5, 'Easy'),
  ], [])

  await assert.rejects(
    generateStudyContent({ file: studyFile, questionCount: 5, difficulty: 'Hard', questionType: 'Flashcards' }),
    (error) => error.statusCode === 502 && /invalid difficulty/i.test(error.message),
  )
})

test('enforces the selected count and difficulty for quiz and Q&A results', async () => {
  mockProvider([
    { allowed: true, confidence: 0.95, topic: 'Computer networks', reason: 'Lecture notes' },
    multipleChoiceQuestions(5, 'Easy'),
    { allowed: true, confidence: 0.95, topic: 'Computer networks', reason: 'Lecture notes' },
    qaQuestions(5, 'Medium'),
  ], [])

  const quiz = await generateStudyContent({
    file: studyFile,
    questionCount: 5,
    difficulty: 'Easy',
    questionType: 'Multiple Choice',
  })
  const qa = await generateStudyContent({
    file: studyFile,
    questionCount: 5,
    difficulty: 'Medium',
    questionType: 'Q&A',
  })

  assert.equal(quiz.questions.length, 5)
  assert.equal(qa.questions.length, 5)
})
