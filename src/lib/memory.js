/**
 * DocIntell Semantic Memory Store
 *
 * The "Second Brain" of the agent system — persists learned knowledge across sessions.
 * After each query, key facts are stored. Future queries recall relevant memories
 * to enrich the AI's context, making it smarter with every interaction.
 *
 * Inspired by episodic memory in cognitive science and vector-store RAG patterns.
 */

const MEMORY_KEY = 'docintell-semantic-memory'
const MAX_MEMORIES = 300

function readMemory() {
  try { return JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]') } catch { return [] }
}

function writeMemory(list) {
  try { localStorage.setItem(MEMORY_KEY, JSON.stringify(list.slice(0, MAX_MEMORIES))) } catch {}
}

function extractKeyPhrases(text) {
  const clean = String(text).toLowerCase().replace(/[^a-z\s]/g, ' ')
  const words = clean.split(/\s+/).filter(w => w.length > 5)
  const freq = {}
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
  return Object.entries(freq)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w)
}

/**
 * Store a new memory entry after an agent query.
 */
export function storeMemory({ documentId, documentName, question, answer, facts = [], entities = [], confidence, model }) {
  const memories = readMemory()
  const entry = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    documentId,
    documentName,
    question,
    answerSummary: String(answer).slice(0, 350),
    facts: (facts || []).slice(0, 5),
    entities: (entities || []).slice(0, 8),
    keyPhrases: extractKeyPhrases(String(answer)),
    confidence: confidence || 0,
    model: model || 'unknown',
    timestamp: new Date().toISOString(),
    recallCount: 0,
  }
  memories.unshift(entry)
  writeMemory(memories)
  return entry.id
}

/**
 * Recall memories relevant to a question.
 * Returns top-K entries sorted by relevance score.
 */
export function recallMemory({ documentId, question, topK = 4 }) {
  const memories = readMemory()
  const words = String(question).toLowerCase().split(/\W+/).filter(w => w.length > 3)
  if (!words.length) return []

  const scored = memories
    .filter(m => !documentId || m.documentId === documentId)
    .map(m => {
      const text = `${m.question} ${m.answerSummary} ${(m.keyPhrases || []).join(' ')}`.toLowerCase()
      const score = words.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0)
      return { ...m, recallScore: score }
    })
    .filter(m => m.recallScore > 0)
    .sort((a, b) => b.recallScore - a.recallScore)
    .slice(0, topK)

  if (scored.length) {
    const ids = new Set(scored.map(m => m.id))
    writeMemory(memories.map(m => ids.has(m.id) ? { ...m, recallCount: (m.recallCount || 0) + 1 } : m))
  }
  return scored
}

/**
 * Get all memories, optionally filtered by document.
 */
export function getAllMemories(documentId) {
  const all = readMemory()
  return documentId ? all.filter(m => m.documentId === documentId) : all
}

/**
 * Delete memories for a document or all memories.
 */
export function clearMemories(documentId) {
  if (documentId) {
    writeMemory(readMemory().filter(m => m.documentId !== documentId))
  } else {
    try { localStorage.removeItem(MEMORY_KEY) } catch {}
  }
}

/**
 * Aggregate stats about the memory store.
 */
export function getMemoryStats() {
  const memories = readMemory()
  const byDoc = {}
  memories.forEach(m => { byDoc[m.documentId] = (byDoc[m.documentId] || 0) + 1 })
  return {
    total: memories.length,
    byDocument: byDoc,
    mostRecent: memories[0]?.timestamp || null,
    totalRecalls: memories.reduce((s, m) => s + (m.recallCount || 0), 0),
    avgConfidence: memories.length
      ? Math.round(memories.reduce((s, m) => s + (m.confidence || 0), 0) / memories.length)
      : 0,
    uniqueDocs: Object.keys(byDoc).length,
  }
}
