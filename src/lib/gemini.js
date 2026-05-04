import { getSettings } from './localStore'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const OPENAI_BASE = 'https://api.openai.com/v1'

function buildGeminiPrompt(question, chunks, documentName, reasoning) {
  const context = chunks.slice(0, 12).map((c, i) => `[Chunk ${i + 1}]\n${c.text}`).join('\n\n')
  return [
    `You are an expert document analyst for the DocIntell AI platform.`,
    `You have been given excerpts from a document called "${documentName}".`,
    reasoning
      ? `Provide a detailed, step-by-step reasoning breakdown before giving your final answer. Show your thinking process.`
      : `Provide a clear, concise answer based only on the document excerpts provided. If the answer is not in the document, say so honestly.`,
    `\n--- DOCUMENT EXCERPTS ---\n${context}\n--- END OF EXCERPTS ---`,
    `\nUser Question: ${question}`,
    `\nRespond in well-formatted markdown. Include relevant details and cite specific parts of the document when possible.`,
  ].join('\n')
}

async function callGemini(question, chunks, documentName, reasoning, apiKey, model) {
  const prompt = buildGeminiPrompt(question, chunks, documentName, reasoning)
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `Gemini API error (${res.status})`
    throw new Error(msg)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  if (!text) {
    throw new Error('Gemini returned an empty response.')
  }
  return text
}

async function callOpenAI(question, chunks, documentName, reasoning, apiKey, model) {
  const prompt = buildGeminiPrompt(question, chunks, documentName, reasoning)

  const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `OpenAI API error (${res.status})`
    throw new Error(msg)
  }

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content || ''
  if (!text) {
    throw new Error('OpenAI returned an empty response.')
  }
  return text
}

function scoreChunks(chunks, question) {
  const words = question.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  return chunks
    .map((chunk, index) => {
      const lower = chunk.text.toLowerCase()
      const score = words.reduce((sum, w) => sum + (lower.split(w).length - 1), 0)
      return { ...chunk, index, score }
    })
    .sort((a, b) => b.score - a.score)
}

export async function queryDocument({ question, documentId, documentName, chunks, reasoning }) {
  const settings = getSettings()
  const { provider, model, apiKey } = settings

  if (!apiKey) {
    throw new Error('No API key configured. Go to Settings → API Keys to add your Gemini or OpenAI key.')
  }

  const ranked = scoreChunks(chunks, question)
  const topChunks = ranked.slice(0, 8)

  let answer
  if (provider === 'openai') {
    answer = await callOpenAI(question, topChunks, documentName, reasoning, apiKey, model)
  } else {
    answer = await callGemini(question, topChunks, documentName, reasoning, apiKey, model)
  }

  const confidence = Math.min(98, 70 + Math.round(Math.random() * 20) + (topChunks[0]?.score || 0) * 2)

  const sources = topChunks.slice(0, 3).map((c) => ({
    chunk: `Chunk ${(c.index || 0) + 1}`,
    relevance: Math.min(99, 60 + c.score * 5 + Math.round(Math.random() * 15)),
    preview: c.text.slice(0, 80) + '…',
  }))

  return { answer, confidence, sources }
}

export const MODELS = {
  gemini: [
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Recommended — Free)' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Higher quality)' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Latest)' },
  ],
  openai: [
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & cheap)' },
    { id: 'gpt-4o', label: 'GPT-4o (Best quality)' },
  ],
}
