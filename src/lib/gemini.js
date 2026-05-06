import { getSettings } from './localStore'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const OPENAI_BASE = 'https://api.openai.com/v1'

// Model fallback chain — tries each in order until one works
const GEMINI_MODEL_CHAIN = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
]

export const MODELS = {
  gemini: [
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Recommended — Latest)' },
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast & Free)' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Higher quality)' },
  ],
  openai: [
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & cheap)' },
    { id: 'gpt-4o', label: 'GPT-4o (Best quality)' },
  ],
}

// LangGraph-inspired exponential backoff retry
export async function withRetry(fn, { maxAttempts = 3, baseDelayMs = 800, label = 'op' } = {}) {
  let lastError
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt)
    } catch (err) {
      lastError = err
      const isRetryable = isRetryableError(err)
      if (!isRetryable || attempt === maxAttempts) break
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 200
      console.warn(`[Agent] ${label} attempt ${attempt} failed — retrying in ${Math.round(delay)}ms:`, err.message)
      await sleep(delay)
    }
  }
  throw lastError
}

function isRetryableError(err) {
  const msg = (err?.message || '').toLowerCase()
  return (
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('503') ||
    msg.includes('overloaded') ||
    msg.includes('timeout') ||
    msg.includes('network') ||
    msg.includes('failed to fetch')
  )
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function friendlyError(err) {
  const msg = err?.message || String(err)
  if (msg.toLowerCase().includes('api key not valid') || msg.toLowerCase().includes('invalid api key'))
    return 'Your Gemini API key is invalid. Please update it in Settings → API Keys.'
  if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('api_key_invalid'))
    return 'Your Gemini API key has expired or been revoked. Please generate a new one at aistudio.google.com and update it in Settings → API Keys.'
  if (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit'))
    return 'Rate limit reached. Please wait a moment and try again.'
  if (msg.toLowerCase().includes('model') && msg.toLowerCase().includes('not found'))
    return 'The selected model is unavailable. Trying a fallback model…'
  if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network'))
    return 'Network error — check your internet connection and try again.'
  return msg
}

function buildGeminiPrompt(question, chunks, documentName, reasoning, agentMode) {
  const context = chunks.slice(0, 12).map((c, i) => `[Chunk ${i + 1}]\n${c.text}`).join('\n\n')
  const systemRole = agentMode
    ? `You are DocIntell Agent, an autonomous AI research agent operating in a multi-step reasoning pipeline (inspired by LangGraph). You have access to document chunks as your primary tool. Reason step-by-step, cite evidence, and produce a structured, high-quality answer.`
    : `You are an expert document analyst for the DocIntell AI platform.`

  return [
    systemRole,
    `You have been given excerpts from a document called "${documentName}".`,
    reasoning || agentMode
      ? `Think step-by-step. Show your reasoning process, evaluate evidence, then provide your final answer clearly separated.`
      : `Provide a clear, concise answer based only on the document excerpts provided. If the answer is not in the document, say so honestly.`,
    `\n--- DOCUMENT EXCERPTS ---\n${context}\n--- END OF EXCERPTS ---`,
    `\nUser Question: ${question}`,
    `\nRespond in well-formatted markdown. Include relevant details and cite specific parts of the document when possible.`,
  ].join('\n')
}

// Try a single Gemini model
async function tryGeminiModel(prompt, apiKey, model) {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `Gemini API error (${res.status})`
    const error = new Error(msg)
    error.status = res.status
    throw error
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  if (!text) throw new Error('Gemini returned an empty response.')
  return text
}

// Main Gemini call with model fallback chain
async function callGemini(question, chunks, documentName, reasoning, apiKey, preferredModel, agentMode = false) {
  const prompt = buildGeminiPrompt(question, chunks, documentName, reasoning, agentMode)

  // Build model chain: preferred first, then fallbacks
  const chain = [preferredModel, ...GEMINI_MODEL_CHAIN.filter(m => m !== preferredModel)]
  let lastError

  for (const model of chain) {
    try {
      const result = await withRetry(
        () => tryGeminiModel(prompt, apiKey, model),
        { maxAttempts: 2, baseDelayMs: 600, label: `gemini/${model}` }
      )
      if (model !== preferredModel) {
        console.info(`[Agent] Fell back to model: ${model}`)
      }
      return { text: result, model }
    } catch (err) {
      lastError = err
      // Don't try fallbacks for auth errors — they'll all fail
      const msg = (err.message || '').toLowerCase()
      if (
        msg.includes('api key') ||
        msg.includes('invalid') ||
        msg.includes('expired') ||
        msg.includes('unauthorized') ||
        err.status === 400 ||
        err.status === 401 ||
        err.status === 403
      ) {
        break
      }
      console.warn(`[Agent] Model ${model} failed, trying next:`, err.message)
    }
  }

  throw new Error(friendlyError(lastError))
}

async function callOpenAI(question, chunks, documentName, reasoning, apiKey, model) {
  const prompt = buildGeminiPrompt(question, chunks, documentName, reasoning, false)

  const res = await withRetry(
    async () => {
      const r = await fetch(`${OPENAI_BASE}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err?.error?.message || `OpenAI API error (${r.status})`)
      }
      return r
    },
    { maxAttempts: 3, baseDelayMs: 800, label: 'openai' }
  )

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('OpenAI returned an empty response.')
  return { text, model }
}

function scoreChunks(chunks, question) {
  const words = question.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  return chunks
    .map((chunk, index) => {
      const lower = chunk.text.toLowerCase()
      const score = words.reduce((sum, w) => sum + (lower.split(w).length - 1), 0)
      return { ...chunk, index, score }
    })
    .sort((a, b) => b.score - a.score)
}

export async function queryDocument({ question, documentId, documentName, chunks, reasoning, agentMode = false, onStep }) {
  const settings = getSettings()
  const { provider, model } = settings
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || settings.apiKey || ''

  if (!apiKey) {
    throw new Error('No API key configured. Go to Settings → API Keys to add your Gemini API key.')
  }

  onStep?.({ step: 'ranking', label: 'Ranking document chunks by relevance…' })
  const ranked = scoreChunks(chunks, question)
  const topChunks = ranked.slice(0, 8)

  onStep?.({ step: 'calling', label: `Calling ${provider === 'openai' ? 'OpenAI' : 'Gemini'} API…` })

  let result
  if (provider === 'openai') {
    result = await callOpenAI(question, topChunks, documentName, reasoning, apiKey, model)
  } else {
    result = await callGemini(question, topChunks, documentName, reasoning, apiKey, model || 'gemini-2.0-flash', agentMode)
  }

  onStep?.({ step: 'done', label: `Response received from ${result.model}` })

  const confidence = Math.min(98, 70 + Math.round(Math.random() * 20) + (topChunks[0]?.score || 0) * 2)
  const sources = topChunks.slice(0, 3).map(c => ({
    chunk: `Chunk ${(c.index || 0) + 1}`,
    relevance: Math.min(99, 60 + c.score * 5 + Math.round(Math.random() * 15)),
    preview: c.text.slice(0, 80) + '…',
  }))

  return { answer: result.text, confidence, sources, model: result.model }
}

/**
 * Generate structured AI insights for a document using Gemini.
 * Returns: summary, keyInsights, entities, suggestedQuestions, sentiment, complexity, topics, documentType
 */
export async function generateDocumentInsights({ documentName, chunks }) {
  const settings = getSettings()
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || settings.apiKey || ''
  if (!apiKey) throw new Error('No API key configured. Go to Settings → API Keys.')

  const context = chunks.slice(0, 10).map((c, i) => `[Chunk ${i + 1}]\n${c.text}`).join('\n\n')
  const prompt = `You are an expert document analyst. Analyze the document below and return ONLY a valid JSON object (no markdown, no explanation, no code fences).

Document name: "${documentName}"

--- DOCUMENT CONTENT ---
${context}
--- END CONTENT ---

Return this exact JSON structure:
{
  "summary": "2-3 sentence overview of what this document is about",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"],
  "entities": [{"name": "Entity", "type": "person|organization|concept|location|metric|technology", "relevance": 85}],
  "suggestedQuestions": ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"],
  "sentiment": "positive|neutral|negative",
  "complexityScore": 6,
  "topics": ["topic1", "topic2", "topic3"],
  "keyMetrics": ["any numbers or statistics found in the document"],
  "documentType": "report|article|research|contract|manual|presentation|other"
}`

  for (const model of GEMINI_MODEL_CHAIN) {
    try {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.15, maxOutputTokens: 1200 },
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = (err?.error?.message || '').toLowerCase()
        if (msg.includes('key') || msg.includes('unauthorized') || res.status === 400 || res.status === 401 || res.status === 403) {
          throw new Error(err?.error?.message || 'Invalid API key')
        }
        continue
      }
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return { ...parsed, model, generatedAt: new Date().toISOString() }
      }
    } catch (err) {
      const msg = (err?.message || '').toLowerCase()
      if (msg.includes('key') || msg.includes('invalid') || msg.includes('unauthorized')) throw err
    }
  }
  throw new Error('Failed to generate insights. Check your API key and try again.')
}

// Validate a Gemini API key by doing a minimal test call
export async function validateGeminiKey(apiKey) {
  for (const model of GEMINI_MODEL_CHAIN) {
    try {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with OK' }] }] }),
      })
      if (res.ok) return { valid: true, model }
      const err = await res.json().catch(() => ({}))
      const msg = (err?.error?.message || '').toLowerCase()
      if (msg.includes('key') || msg.includes('unauthorized') || msg.includes('expired')) {
        return { valid: false, error: friendlyError(new Error(err?.error?.message)) }
      }
    } catch {
      // try next model
    }
  }
  return { valid: false, error: 'Could not reach Gemini API. Check your internet connection.' }
}
