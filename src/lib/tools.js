/**
 * DocIntell MCP-style Tool Registry
 *
 * Inspired by the Model Context Protocol (MCP):
 * Each tool has a name, description, input schema, and async handler.
 * The agent calls executeTool(name, args) at runtime.
 *
 * This makes the AI's capabilities modular, composable, and auditable —
 * the same principle behind real MCP servers (Brave, GitHub, Filesystem, etc.)
 *
 * Backend mode: when VITE_API_BASE_URL is set, searchChunks delegates to the
 * Spring Boot query-service vector search instead of the local keyword scorer.
 */

import { isBackendAvailable, backendRagQuery } from './api'

// ─── Tool Definitions ──────────────────────────────────────────────────────────

export const TOOLS = {

  searchChunks: {
    name: 'searchChunks',
    description: 'Vector similarity search (backend) or keyword search (local) across document chunks. Returns the most relevant chunks ranked by score.',
    schema: {
      chunks: 'DocumentChunk[]',
      query: 'string',
      keywords: 'string[]',
      topK: 'number',
      documentId: 'number?',
    },
    async handler({ chunks, query, keywords = [], topK = 8, documentId }) {
      if (isBackendAvailable() && documentId != null) {
        const result = await backendRagQuery({ documentId, question: query })
        const sources = result.sources || []
        const mappedChunks = sources.slice(0, topK).map((s, i) => ({
          text: s.chunk || '',
          index: typeof s.chunkIndex === 'number' ? s.chunkIndex : i,
          score: s.relevance === 'High' ? 1 : 0.5,
          documentId: s.documentId,
        }))
        return {
          chunks: mappedChunks,
          topScore: mappedChunks[0]?.score || 0,
          totalSearched: sources.length,
          backendConfidence: result.confidence,
          source: 'backend-vector',
        }
      }

      const allWords = [
        ...query.toLowerCase().split(/\W+/).filter(w => w.length > 3),
        ...keywords.map(k => k.toLowerCase()),
      ]
      const unique = [...new Set(allWords)]

      const scored = chunks.map((chunk, index) => {
        const lower = chunk.text.toLowerCase()
        const score = unique.reduce((sum, w) => sum + (lower.split(w).length - 1), 0)
        const proximity = unique.filter(w => lower.includes(w)).length / Math.max(unique.length, 1)
        return { ...chunk, index, score: score + proximity * 2 }
      }).sort((a, b) => b.score - a.score)

      const top = scored.slice(0, topK)
      return {
        chunks: top,
        topScore: top[0]?.score || 0,
        totalSearched: chunks.length,
        source: 'local-keyword',
      }
    },
  },

  extractFacts: {
    name: 'extractFacts',
    description: 'Extracts key facts and entities from the top document chunks relevant to the question.',
    schema: { chunks: 'DocumentChunk[]', question: 'string' },
    async handler({ chunks, question }) {
      const questionWords = new Set(question.toLowerCase().split(/\W+/).filter(w => w.length > 3))
      const facts = []

      for (const chunk of chunks.slice(0, 5)) {
        const sentences = chunk.text.split(/[.!?]+/).filter(s => s.trim().length > 20)
        for (const sentence of sentences) {
          const lower = sentence.toLowerCase()
          const hits = [...questionWords].filter(w => lower.includes(w)).length
          if (hits >= 1) {
            facts.push({ text: sentence.trim(), relevance: hits, chunkIndex: chunk.index })
          }
        }
      }

      facts.sort((a, b) => b.relevance - a.relevance)
      return { facts: facts.slice(0, 6) }
    },
  },

  summarizeChunks: {
    name: 'summarizeChunks',
    description: 'Produces a brief extractive summary from the top-ranked document chunks.',
    schema: { chunks: 'DocumentChunk[]', maxSentences: 'number' },
    async handler({ chunks, maxSentences = 4 }) {
      const sentences = []
      for (const chunk of chunks.slice(0, 4)) {
        const parts = chunk.text.split(/[.!?]+/).filter(s => s.trim().length > 30)
        sentences.push(...parts.map(s => s.trim()))
      }
      return { summary: sentences.slice(0, maxSentences).join('. ') + '.' }
    },
  },

  retryWithBackoff: {
    name: 'retryWithBackoff',
    description: 'Wraps any async operation with LangGraph-inspired exponential backoff retry.',
    schema: { fn: 'AsyncFunction', maxAttempts: 'number', baseDelayMs: 'number' },
    async handler({ fn, maxAttempts = 3, baseDelayMs = 800 }) {
      let lastError
      for (let i = 1; i <= maxAttempts; i++) {
        try { return await fn(i) } catch (err) {
          lastError = err
          if (i < maxAttempts) await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, i - 1)))
        }
      }
      throw lastError
    },
  },

  generateInsights: {
    name: 'generateInsights',
    description: 'Generates structured insight cards from document content (themes, entities, questions).',
    schema: { chunks: 'DocumentChunk[]' },
    async handler({ chunks }) {
      const allText = chunks.slice(0, 6).map(c => c.text).join(' ')
      const words = allText.toLowerCase().split(/\W+/).filter(w => w.length > 5)
      const freq = {}
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
      const topTerms = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([term]) => term)

      const numbers = [...allText.matchAll(/\b\d[\d,.]*(?: ?%| million| billion| thousand)?\b/g)].map(m => m[0]).slice(0, 5)

      return {
        topTerms,
        numbers,
        sentenceCount: allText.split(/[.!?]+/).filter(s => s.trim().length > 10).length,
        wordCount: words.length,
      }
    },
  },

}

// ─── Tool Executor ─────────────────────────────────────────────────────────────

export async function executeTool(name, args) {
  const tool = TOOLS[name]
  if (!tool) throw new Error(`Unknown MCP tool: ${name}`)
  try {
    return await tool.handler(args)
  } catch (err) {
    throw new Error(`Tool "${name}" failed: ${err.message}`)
  }
}

export function listTools() {
  return Object.values(TOOLS).map(({ name, description, schema }) => ({ name, description, schema }))
}
