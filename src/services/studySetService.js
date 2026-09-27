import { supabase } from './supabaseClient'

const STUDY_SET_COLUMNS = [
  'id',
  'user_id',
  'subject_id',
  'source_file_name',
  'set_type',
  'difficulty',
  'requested_count',
  'title',
  'created_at',
  'quiz_questions(id,position,prompt,correct_option_key,explanation,quiz_options(id,option_key,position,option_text))',
  'qa_questions(id,position,prompt,sample_answer,key_points)',
].join(',')

const STUDY_SET_PAGE_SIZE = 100
const FLASHCARD_PAGE_SIZE = 1000
const FLASHCARD_REVIEW_PAGE_SIZE = 1000
const FLASHCARD_COLUMNS = 'id,study_set_id,position,front,back'
const FLASHCARD_REVIEW_COLUMNS = 'id,flashcard_id,user_id,confidence,reviewed_at'
const ALLOWED_DIFFICULTIES = new Set(['Easy', 'Medium', 'Hard'])
const ALLOWED_QUESTION_COUNTS = new Set([5, 10, 20])
const ALLOWED_OPTION_KEYS = new Set(['A', 'B', 'C', 'D'])
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SET_TYPE_BY_RESULT_TYPE = {
  'Multiple Choice': 'multiple_choice',
  Flashcards: 'flashcards',
  'Q&A': 'qa',
}
const RESULT_TYPE_BY_SET_TYPE = {
  multiple_choice: 'Multiple Choice',
  flashcards: 'Flashcards',
  qa: 'Q&A',
}

function requireUserId(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('A signed-in user is required to access study sets.')
  }

  return userId.trim()
}

async function requireCurrentUser(userId) {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error

  if (!data.user || data.user.id !== userId) {
    throw new Error('The signed-in account changed before these study sets could be accessed.')
  }
}

function requireRecord(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} is invalid.`)
  }

  return value
}

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`)
  }

  return value.trim()
}

function optionalFileName(value) {
  if (value == null) return null
  if (typeof value !== 'string') throw new Error('Source file name must be a string or null.')
  return value.trim() || null
}

function optionalSubjectId(value) {
  if (value == null) return null
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error('Subject ID must be a UUID string or null.')
  }
  return value
}

function normalizeTitle(generated, sourceFileName, titleOverride) {
  if (titleOverride != null) {
    const title = requireText(titleOverride, 'Study-set title')
    if (Array.from(title).length > 120) {
      throw new Error('Study-set title must contain 1 to 120 characters.')
    }
    return title
  }

  const preferredTitle = generated.deckName || generated.subjectName || sourceFileName || 'Study Set'
  const title = requireText(preferredTitle, 'Study-set title')
  return Array.from(title).slice(0, 120).join('').trim()
}

function normalizeOption(option, index) {
  const value = Array.isArray(option)
    ? { key: option[0], text: option[1] }
    : requireRecord(option, `Quiz option ${index + 1}`)
  const key = requireText(value.key, `Quiz option ${index + 1} key`).toUpperCase()
  const text = requireText(value.text, `Quiz option ${index + 1} text`)

  if (!ALLOWED_OPTION_KEYS.has(key)) {
    throw new Error(`Quiz option ${index + 1} must use an A-D key.`)
  }

  return { option_key: key, option_text: text }
}

function normalizeGeneratedContent({ generated, questionCount, difficulty, sourceFileName, subjectId, title }) {
  requireRecord(generated, 'Generated study content')

  const setType = SET_TYPE_BY_RESULT_TYPE[generated.type]
  if (!setType) throw new Error('Generated content has an unsupported study-set type.')
  if (!ALLOWED_DIFFICULTIES.has(difficulty)) throw new Error('Difficulty must be Easy, Medium, or Hard.')

  const count = Number(questionCount)
  if (!ALLOWED_QUESTION_COUNTS.has(count)) throw new Error('Question count must be 5, 10, or 20.')

  const safeFileName = optionalFileName(sourceFileName)
  const contentSource = setType === 'flashcards' ? generated.cards : generated.questions
  if (!Array.isArray(contentSource) || contentSource.length !== count) {
    throw new Error('Generated content must match the requested item count.')
  }

  let content
  if (setType === 'multiple_choice') {
    content = contentSource.map((item, index) => {
      requireRecord(item, `Quiz question ${index + 1}`)
      const prompt = requireText(item.prompt, `Quiz question ${index + 1}`)
      const correctKey = requireText(item.correctKey, `Quiz question ${index + 1} correct answer`).toUpperCase()
      const explanation = requireText(item.explanation, `Quiz question ${index + 1} explanation`)
      if (!ALLOWED_OPTION_KEYS.has(correctKey) || !Array.isArray(item.answers) || item.answers.length !== 4) {
        throw new Error(`Quiz question ${index + 1} must have four options and a valid correct answer.`)
      }

      const options = item.answers.map(normalizeOption)
      if (new Set(options.map((option) => option.option_key)).size !== 4
        || !options.some((option) => option.option_key === correctKey)) {
        throw new Error(`Quiz question ${index + 1} must use distinct A-D keys and include the correct answer.`)
      }

      return {
        prompt,
        correct_option_key: correctKey,
        explanation,
        options,
      }
    })
  } else if (setType === 'flashcards') {
    content = contentSource.map((card, index) => {
      requireRecord(card, `Flashcard ${index + 1}`)
      return {
        front: requireText(card.question, `Flashcard ${index + 1} front`),
        back: requireText(card.answer, `Flashcard ${index + 1} back`),
      }
    })
  } else {
    content = contentSource.map((item, index) => {
      requireRecord(item, `Q&A question ${index + 1}`)
      if (!Array.isArray(item.keyPoints)) {
        throw new Error(`Q&A question ${index + 1} key points must be an array.`)
      }

      return {
        prompt: requireText(item.prompt, `Q&A question ${index + 1}`),
        sample_answer: requireText(item.sampleAnswer, `Q&A question ${index + 1} sample answer`),
        key_points: item.keyPoints.map((point, pointIndex) => requireText(point, `Q&A question ${index + 1} key point ${pointIndex + 1}`)),
      }
    })
  }

  return {
    set_type: setType,
    difficulty,
    requested_count: count,
    title: normalizeTitle(generated, safeFileName, title),
    source_file_name: safeFileName,
    subject_id: optionalSubjectId(subjectId),
    content,
  }
}

/**
 * Persist one completed Generate Quiz result. `generated` is the middleware
 * result; the remaining metadata comes from the quiz upload configuration.
 */
export async function saveStudySetForUser(userId, {
  generated,
  questionCount,
  difficulty,
  sourceFileName = null,
  subjectId = null,
  title = null,
  idempotencyKey = null,
} = {}) {
  const safeUserId = requireUserId(userId)
  const safeIdempotencyKey = idempotencyKey == null ? null : String(idempotencyKey).trim()
  if (safeIdempotencyKey && !UUID_PATTERN.test(safeIdempotencyKey)) {
    throw new Error('Study-set idempotency key must be a UUID string.')
  }
  const studySet = normalizeGeneratedContent({
    generated,
    questionCount,
    difficulty,
    sourceFileName,
    subjectId,
    title,
  })

  await requireCurrentUser(safeUserId)

  const { data, error } = await supabase.rpc(
    safeIdempotencyKey ? 'save_study_set_idempotent' : 'save_study_set',
    safeIdempotencyKey
      ? { p_user_id: safeUserId, p_study_set: studySet, p_idempotency_key: safeIdempotencyKey }
      : { p_user_id: safeUserId, p_study_set: studySet },
  )

  if (error) throw error
  if (typeof data !== 'string' || !data) {
    throw new Error('The study set could not be confirmed as saved.')
  }

  return data
}

/** Persist a user-created flashcard deck without imposing AI generation counts. */
export async function saveManualFlashcardDeckForUser(userId, { title, cards } = {}) {
  const safeUserId = requireUserId(userId)
  const safeTitle = requireText(title, 'Flashcard deck title')
  if (Array.from(safeTitle).length > 120) {
    throw new Error('Flashcard deck title must contain 1 to 120 characters.')
  }
  if (!Array.isArray(cards) || cards.length < 1 || cards.length > 32767) {
    throw new Error('A flashcard deck must contain between 1 and 32767 cards.')
  }

  const content = cards.map((card, index) => {
    requireRecord(card, `Flashcard ${index + 1}`)
    return {
      front: requireText(card.question, `Flashcard ${index + 1} front`),
      back: requireText(card.answer, `Flashcard ${index + 1} back`),
    }
  })

  await requireCurrentUser(safeUserId)
  const { data, error } = await supabase.rpc('save_manual_flashcard_deck', {
    p_user_id: safeUserId,
    p_title: safeTitle,
    p_cards: content,
  })

  if (error) throw error
  if (typeof data !== 'string' || !UUID_PATTERN.test(data)) {
    throw new Error('The flashcard deck could not be confirmed as saved.')
  }
  return data
}

/** Record one confidence rating for a card owned by the signed-in user. */
export async function saveFlashcardReviewForUser(userId, {
  flashcardId,
  confidence,
  reviewedAt = new Date().toISOString(),
} = {}) {
  const safeUserId = requireUserId(userId)
  const safeFlashcardId = typeof flashcardId === 'string' ? flashcardId.trim() : ''
  const safeConfidence = Number(confidence)
  const reviewDate = new Date(reviewedAt)

  if (!UUID_PATTERN.test(safeFlashcardId)) {
    throw new Error('The saved flashcard ID is missing or invalid.')
  }
  if (!Number.isInteger(safeConfidence) || safeConfidence < 0 || safeConfidence > 3) {
    throw new Error('Flashcard confidence must be a whole number from 0 to 3.')
  }
  if (Number.isNaN(reviewDate.getTime())) {
    throw new Error('Flashcard review time is invalid.')
  }

  const safeReviewedAt = reviewDate.toISOString()
  await requireCurrentUser(safeUserId)
  const { data, error } = await supabase
    .from('flashcard_reviews')
    .insert({
      user_id: safeUserId,
      flashcard_id: safeFlashcardId,
      confidence: safeConfidence,
      reviewed_at: safeReviewedAt,
    })
    .select('id,user_id,flashcard_id,confidence,reviewed_at')
    .single()

  if (error) throw error
  if (!data || data.user_id !== safeUserId || data.flashcard_id !== safeFlashcardId) {
    throw new Error('The flashcard review could not be confirmed as saved.')
  }
  await requireCurrentUser(safeUserId)
  return {
    id: String(data.id),
    flashcardId: String(data.flashcard_id),
    confidence: Number(data.confidence),
    reviewedAt: data.reviewed_at,
  }
}

function quotePostgrestFilterValue(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function rowsInPositionOrder(value) {
  return Array.isArray(value)
    ? [...value].sort((left, right) => Number(left.position) - Number(right.position))
    : []
}

function mapLoadedStudySet(row, flashcardRows = [], latestReviewsByFlashcardId = new Map()) {
  if (!RESULT_TYPE_BY_SET_TYPE[row.set_type]) {
    throw new Error(`Study set ${row.id} has an unsupported type.`)
  }

  const requestedCount = Number(row.requested_count)
  const common = {
    id: String(row.id),
    subjectId: row.subject_id || null,
    sourceFileName: row.source_file_name || null,
    setType: row.set_type,
    type: RESULT_TYPE_BY_SET_TYPE[row.set_type],
    difficulty: row.difficulty,
    questionCount: requestedCount,
    title: row.title,
    createdAt: row.created_at,
  }

  if (row.set_type === 'multiple_choice') {
    const questions = rowsInPositionOrder(row.quiz_questions).map((question) => ({
      id: String(question.id),
      subject: row.title,
      prompt: question.prompt,
      answers: rowsInPositionOrder(question.quiz_options).map((option) => [option.option_key, option.option_text]),
      correctKey: question.correct_option_key,
      explanation: question.explanation || '',
    }))
    if (questions.length !== requestedCount || questions.some((question) => question.answers.length !== 4)) {
      throw new Error(`Study set ${row.id} is missing quiz questions or options.`)
    }
    return { ...common, subjectName: row.title, questions }
  }

  if (row.set_type === 'flashcards') {
    const cards = rowsInPositionOrder(flashcardRows).map((card) => ({
      id: String(card.id),
      question: card.front,
      answer: card.back,
      confidence: latestReviewsByFlashcardId.has(String(card.id))
        ? Number(latestReviewsByFlashcardId.get(String(card.id)).confidence)
        : null,
      reviewedAt: latestReviewsByFlashcardId.get(String(card.id))?.reviewed_at || null,
    }))
    if (cards.length !== requestedCount) throw new Error(`Study set ${row.id} is missing flashcards.`)
    const latestReviewedAt = cards
      .map((card) => card.reviewedAt)
      .filter(Boolean)
      .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] || null
    const mastery = cards.length > 0
      ? Math.round(cards.reduce((total, card) => total + (card.confidence || 0), 0) / (cards.length * 3) * 100)
      : 0
    return { ...common, deckName: row.title, cards, latestReviewedAt, mastery }
  }

  const questions = rowsInPositionOrder(row.qa_questions).map((question) => ({
    id: String(question.id),
    subject: row.title,
    prompt: question.prompt,
    sampleAnswer: question.sample_answer,
    keyPoints: Array.isArray(question.key_points) ? question.key_points : [],
  }))
  if (questions.length !== requestedCount) throw new Error(`Study set ${row.id} is missing Q&A questions.`)
  return { ...common, subjectName: row.title, questions }
}

async function loadFlashcardsForStudySets(studySetRows) {
  const flashcardStudySetIds = studySetRows
    .filter((row) => row.set_type === 'flashcards')
    .map((row) => String(row.id))
  const flashcardsByStudySetId = new Map(
    flashcardStudySetIds.map((studySetId) => [studySetId, []]),
  )

  for (let batchStart = 0; batchStart < flashcardStudySetIds.length; batchStart += STUDY_SET_PAGE_SIZE) {
    const studySetIds = flashcardStudySetIds.slice(batchStart, batchStart + STUDY_SET_PAGE_SIZE)
    let offset = 0

    while (true) {
      const { data, error, count } = await supabase
        .from('flashcards')
        .select(FLASHCARD_COLUMNS, { count: 'exact' })
        .in('study_set_id', studySetIds)
        .order('study_set_id', { ascending: true })
        .order('position', { ascending: true })
        .order('id', { ascending: true })
        .range(offset, offset + FLASHCARD_PAGE_SIZE - 1)

      if (error) throw error
      if (!Number.isInteger(count) || count < 0) {
        throw new Error('The total number of saved flashcards could not be confirmed.')
      }

      const page = data || []
      for (const card of page) {
        const studySetId = String(card.study_set_id)
        const cards = flashcardsByStudySetId.get(studySetId)
        if (!cards) throw new Error('A saved flashcard did not belong to a loaded deck.')
        cards.push(card)
      }

      offset += page.length
      if (offset >= count) break
      if (page.length === 0) {
        throw new Error('Saved flashcards could not be fully loaded. Please try again.')
      }
    }
  }

  return flashcardsByStudySetId
}

async function loadLatestFlashcardReviewsForUser(userId) {
  const latestReviewsByFlashcardId = new Map()
  let offset = 0

  while (true) {
    const { data, error, count } = await supabase
      .from('flashcard_reviews')
      .select(FLASHCARD_REVIEW_COLUMNS, { count: 'exact' })
      .eq('user_id', userId)
      .order('flashcard_id', { ascending: true })
      .order('reviewed_at', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + FLASHCARD_REVIEW_PAGE_SIZE - 1)

    if (error) throw error
    if (!Number.isInteger(count) || count < 0) {
      throw new Error('The total number of saved flashcard reviews could not be confirmed.')
    }

    const page = data || []
    for (const review of page) {
      if (review.user_id !== userId) {
        throw new Error('A flashcard review did not belong to the signed-in account.')
      }

      const flashcardId = String(review.flashcard_id)
      if (!latestReviewsByFlashcardId.has(flashcardId)) {
        latestReviewsByFlashcardId.set(flashcardId, review)
      }
    }

    offset += page.length
    if (offset >= count) break
    if (page.length === 0) {
      throw new Error('Saved flashcard reviews could not be fully loaded. Please try again.')
    }
  }

  return latestReviewsByFlashcardId
}

/** Load all study sets and nested content visible to the signed-in owner. */
export async function loadStudySetsForUser(userId) {
  const safeUserId = requireUserId(userId)
  await requireCurrentUser(safeUserId)

  const studySetRows = []
  const seenStudySetIds = new Set()
  let cursor = null

  while (true) {
    let query = supabase
      .from('study_sets')
      .select(STUDY_SET_COLUMNS)
      .eq('user_id', safeUserId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(STUDY_SET_PAGE_SIZE)

    if (cursor) {
      const quotedCreatedAt = quotePostgrestFilterValue(cursor.createdAt)
      query = query.or(
        `created_at.lt.${quotedCreatedAt},and(created_at.eq.${quotedCreatedAt},id.lt.${cursor.id})`,
      )
    }

    const { data, error } = await query
    if (error) throw error

    const page = data || []
    if (page.length === 0) break

    for (const row of page) {
      if (row.user_id !== safeUserId) {
        throw new Error('A study set did not belong to the signed-in account.')
      }
      const studySetId = String(row.id)
      if (!seenStudySetIds.has(studySetId)) {
        studySetRows.push(row)
        seenStudySetIds.add(studySetId)
      }
    }

    if (page.length < STUDY_SET_PAGE_SIZE) break

    const lastRow = page[page.length - 1]
    if (typeof lastRow.created_at !== 'string' || !lastRow.created_at || !lastRow.id) {
      throw new Error('A study set is missing the fields required to continue loading saved content.')
    }

    cursor = { createdAt: lastRow.created_at, id: String(lastRow.id) }
  }

  const flashcardsByStudySetId = await loadFlashcardsForStudySets(studySetRows)
  const hasFlashcardSets = studySetRows.some((row) => row.set_type === 'flashcards')
  const latestReviewsByFlashcardId = hasFlashcardSets
    ? await loadLatestFlashcardReviewsForUser(safeUserId)
    : new Map()
  await requireCurrentUser(safeUserId)
  return studySetRows.map((row) => mapLoadedStudySet(
    row,
    flashcardsByStudySetId.get(String(row.id)) || [],
    latestReviewsByFlashcardId,
  ))
}

/** Load one owner-checked generated Q&A set without paging through the full library. */
export async function loadQaStudySetForUser(userId, studySetId) {
  const safeUserId = requireUserId(userId)
  const safeStudySetId = typeof studySetId === 'string' ? studySetId.trim() : ''
  if (!UUID_PATTERN.test(safeStudySetId)) throw new Error('The saved Q&A set ID is invalid.')
  await requireCurrentUser(safeUserId)
  const { data, error } = await supabase
    .from('study_sets')
    .select(STUDY_SET_COLUMNS)
    .eq('id', safeStudySetId)
    .eq('user_id', safeUserId)
    .eq('set_type', 'qa')
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const studySet = mapLoadedStudySet(data)
  await requireCurrentUser(safeUserId)
  return studySet
}

function requireQaStudySetId(studySetId) {
  const safeStudySetId = typeof studySetId === 'string' ? studySetId.trim() : ''
  if (!UUID_PATTERN.test(safeStudySetId)) throw new Error('The saved Q&A set ID is invalid.')
  return safeStudySetId
}

function requireQaStudySetTitle(title) {
  const safeTitle = requireText(title, 'Q&A set title')
  if (Array.from(safeTitle).length > 120) {
    throw new Error('Q&A set title must contain 1 to 120 characters.')
  }
  return safeTitle
}

/** Rename one Q&A set owned by the signed-in user. */
export async function renameQaStudySetForUser(userId, studySetId, title) {
  const safeUserId = requireUserId(userId)
  const safeStudySetId = requireQaStudySetId(studySetId)
  const safeTitle = requireQaStudySetTitle(title)

  await requireCurrentUser(safeUserId)
  const { data, error } = await supabase
    .from('study_sets')
    .update({ title: safeTitle })
    .eq('id', safeStudySetId)
    .eq('user_id', safeUserId)
    .eq('set_type', 'qa')
    .select('id,user_id,set_type,title')
    .maybeSingle()

  if (error) throw error
  if (!data || data.user_id !== safeUserId || data.set_type !== 'qa') {
    throw new Error('This Q&A set could not be renamed or is no longer available.')
  }

  await requireCurrentUser(safeUserId)
  return { id: String(data.id), title: data.title }
}

/** Delete one Q&A set owned by the signed-in user. Related questions and answers
 * are removed by the database foreign-key cascades. */
export async function deleteQaStudySetForUser(userId, studySetId) {
  const safeUserId = requireUserId(userId)
  const safeStudySetId = requireQaStudySetId(studySetId)

  await requireCurrentUser(safeUserId)
  const { data, error } = await supabase
    .from('study_sets')
    .delete()
    .eq('id', safeStudySetId)
    .eq('user_id', safeUserId)
    .eq('set_type', 'qa')
    .select('id,user_id,set_type')
    .maybeSingle()

  if (error) throw error
  if (!data || data.user_id !== safeUserId || data.set_type !== 'qa') {
    throw new Error('This Q&A set could not be deleted or is no longer available.')
  }

  await requireCurrentUser(safeUserId)
  return String(data.id)
}
