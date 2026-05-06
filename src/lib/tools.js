/**
 * DocIntell MCP-style Tool Registry
 *
 * Inspired by the Model Context Protocol (MCP):
 * Each tool has a name, description, typed schema, and an async handler.
 * Agents call executeTool(name, args) at runtime — swappable with real
 * MCP servers (Brave Search, GitHub, Filesystem) via HTTP transport.
 */

export const TOOLS = {

  searchChunks: {
    name: 'searchChunks',
    description: 'Semantic keyword search across document chunks. Returns the most relevant chunks ranked by combined keyword + proximity score.',
    schema: {
      chunks: 'DocumentChunk[]',
      query: 'string',
      keywords: 'string[]',
      topK: 'number',
    },
    async handler({ chunks, query, keywords = [], topK = 8 }) {
      const allWords = [
        ...String(query).toLowerCase().split(/\W+/).filter(w => w.length > 3),
        ...keywords.map(k => String(k).toLowerCase()),
      ]
      const unique = [...new Set(allWords)]

      const scored = chunks.map((chunk, index) => {
        const lower = chunk.text.toLowerCase()
        const termScore = unique.reduce((sum, w) => sum + (lower.split(w).length - 1), 0)
        const coverage = unique.filter(w => lower.includes(w)).length / Math.max(unique.length, 1)
        const positionBonus = index < 3 ? 0.5 : 0
        return { ...chunk, index, score: termScore + coverage * 2 + positionBonus }
      }).sort((a, b) => b.score - a.score)

      const top = scored.slice(0, topK)
      return { chunks: top, topScore: top[0]?.score || 0, totalSearched: chunks.length }
    },
  },

  extractFacts: {
    name: 'extractFacts',
    description: 'Extracts key facts and sentences from top document chunks most relevant to the question.',
    schema: { chunks: 'DocumentChunk[]', question: 'string' },
    async handler({ chunks, question }) {
      const questionWords = new Set(String(question).toLowerCase().split(/\W+/).filter(w => w.length > 3))
      const facts = []
      for (const chunk of chunks.slice(0, 6)) {
        const sentences = chunk.text.split(/[.!?]+/).filter(s => s.trim().length > 20)
        for (const sentence of sentences) {
          const lower = sentence.toLowerCase()
          const hits = [...questionWords].filter(w => lower.includes(w)).length
          if (hits >= 1) facts.push({ text: sentence.trim(), relevance: hits, chunkIndex: chunk.index })
        }
      }
      facts.sort((a, b) => b.relevance - a.relevance)
      return { facts: facts.slice(0, 8) }
    },
  },

  summarizeChunks: {
    name: 'summarizeChunks',
    description: 'Produces a brief extractive summary from the top-ranked document chunks.',
    schema: { chunks: 'DocumentChunk[]', maxSentences: 'number' },
    async handler({ chunks, maxSentences = 5 }) {
      const sentences = []
      for (const chunk of chunks.slice(0, 5)) {
        const parts = chunk.text.split(/[.!?]+/).filter(s => s.trim().length > 30)
        sentences.push(...parts.map(s => s.trim()))
      }
      return { summary: sentences.slice(0, maxSentences).join('. ') + '.' }
    },
  },

  detectSentiment: {
    name: 'detectSentiment',
    description: 'Analyzes the overall sentiment and tone of document chunks (positive/neutral/negative).',
    schema: { chunks: 'DocumentChunk[]' },
    async handler({ chunks }) {
      const positive = ['success', 'growth', 'improve', 'achieve', 'benefit', 'strong', 'increase', 'good', 'excellent', 'profit', 'gain', 'innovation', 'advance', 'progress', 'opportunity']
      const negative = ['failure', 'decline', 'problem', 'issue', 'risk', 'loss', 'decrease', 'bad', 'poor', 'concern', 'crisis', 'warning', 'threat', 'challenge', 'deficit']
      const text = chunks.slice(0, 8).map(c => c.text).join(' ').toLowerCase()
      const pos = positive.reduce((s, w) => s + (text.split(w).length - 1), 0)
      const neg = negative.reduce((s, w) => s + (text.split(w).length - 1), 0)
      const total = pos + neg
      const sentiment = total === 0 ? 'neutral' : pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral'
      const intensity = total === 0 ? 0 : Math.min(100, Math.round((Math.abs(pos - neg) / total) * 100))
      return { sentiment, intensity, posScore: pos, negScore: neg }
    },
  },

  buildKnowledgeGraph: {
    name: 'buildKnowledgeGraph',
    description: 'Extracts named entities and co-occurrence relationships from document chunks to build a mini knowledge graph.',
    schema: { chunks: 'DocumentChunk[]' },
    async handler({ chunks }) {
      const text = chunks.slice(0, 8).map(c => c.text).join(' ')

      // Extract capitalized noun phrases as entities
      const matches = text.match(/\b[A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{2,})*/g) || []
      const freq = {}
      matches.forEach(m => { freq[m] = (freq[m] || 0) + 1 })

      const entities = Object.entries(freq)
        .filter(([, c]) => c >= 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([name, count], id) => ({
          id,
          name,
          count,
          type: /\b(Inc|Corp|Ltd|LLC|Co)\b/.test(name) ? 'organization'
              : /^\d/.test(name) ? 'metric'
              : name.split(' ').length > 1 ? 'concept'
              : 'entity',
        }))

      // Build co-occurrence edges (entities within 300 chars of each other)
      const relationships = []
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < Math.min(entities.length, 8); j++) {
          const a = entities[i].name, b = entities[j].name
          const ia = text.indexOf(a), ib = text.indexOf(b)
          if (ia >= 0 && ib >= 0 && Math.abs(ia - ib) < 300) {
            relationships.push({ from: i, to: j, strength: Math.max(1, 3 - Math.floor(Math.abs(ia - ib) / 100)) })
          }
        }
      }
      return { entities, relationships }
    },
  },

  generateInsights: {
    name: 'generateInsights',
    description: 'Generates structured insight data from document content: top terms, key numbers, and entity frequency.',
    schema: { chunks: 'DocumentChunk[]' },
    async handler({ chunks }) {
      const allText = chunks.slice(0, 8).map(c => c.text).join(' ')
      const words = allText.toLowerCase().split(/\W+/).filter(w => w.length > 5)
      const freq = {}
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
      const topTerms = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([term, count]) => ({ term, count }))

      const numbers = [...allText.matchAll(/\b\d[\d,.]*(?: ?%| million| billion| thousand| k\b)?\b/g)]
        .map(m => m[0]).slice(0, 8)

      return {
        topTerms,
        numbers,
        sentenceCount: allText.split(/[.!?]+/).filter(s => s.trim().length > 10).length,
        wordCount: words.length,
      }
    },
  },

  retryWithBackoff: {
    name: 'retryWithBackoff',
    description: 'Wraps any async operation with LangGraph-inspired exponential backoff retry logic.',
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

}

export async function executeTool(name, args) {
  const tool = TOOLS[name]
  if (!tool) throw new Error(`Unknown MCP tool: ${name}`)
  try { return await tool.handler(args) } catch (err) { throw new Error(`Tool "${name}" failed: ${err.message}`) }
}

export function listTools() {
  return Object.values(TOOLS).map(({ name, description, schema }) => ({ name, description, schema }))
}
