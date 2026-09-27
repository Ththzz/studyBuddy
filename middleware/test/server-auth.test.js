import assert from 'node:assert/strict'
import test from 'node:test'

process.env.NODE_ENV = 'test'
process.env.SUPABASE_URL = 'https://example.test'
process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key'
process.env.AI_RATE_LIMIT_MAX_REQUESTS = '2'

const {
  limitUserRequests,
  requireAuthenticatedUser,
  resetRequestWindows,
} = await import('../src/server.js')

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(statusCode) {
      this.statusCode = statusCode
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }
}

test.afterEach(() => {
  resetRequestWindows()
})

test('rejects an AI request with no Bearer token', async () => {
  const req = { get: () => '' }
  const res = createResponse()
  let nextCalled = false

  await requireAuthenticatedUser(req, res, () => { nextCalled = true })

  assert.equal(res.statusCode, 401)
  assert.equal(nextCalled, false)
})

test('rejects an invalid Bearer token', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('', { status: 401 })
  const req = { get: () => 'Bearer invalid-token' }
  const res = createResponse()
  let nextCalled = false

  try {
    await requireAuthenticatedUser(req, res, () => { nextCalled = true })
  } finally {
    globalThis.fetch = originalFetch
  }

  assert.equal(res.statusCode, 401)
  assert.equal(nextCalled, false)
})

test('accepts a valid token and identifies the signed-in user', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ id: 'user-123' }), { status: 200 })
  const req = { get: () => 'Bearer valid-token' }
  const res = createResponse()
  let nextCalled = false

  try {
    await requireAuthenticatedUser(req, res, () => { nextCalled = true })
  } finally {
    globalThis.fetch = originalFetch
  }

  assert.equal(res.statusCode, null)
  assert.equal(nextCalled, true)
  assert.deepEqual(req.studyBuddyUser, { id: 'user-123' })
})

test('limits AI requests per signed-in user', () => {
  const req = { studyBuddyUser: { id: 'user-123' } }
  const first = createResponse()
  const second = createResponse()
  const third = createResponse()
  let nextCount = 0

  limitUserRequests(req, first, () => { nextCount += 1 })
  limitUserRequests(req, second, () => { nextCount += 1 })
  limitUserRequests(req, third, () => { nextCount += 1 })

  assert.equal(nextCount, 2)
  assert.equal(third.statusCode, 429)
})
