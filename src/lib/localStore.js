const DOCS_KEY = 'docintell-documents'
const QUERIES_KEY = 'docintell-queries'
const SETTINGS_KEY = 'docintell-settings'
const FEEDBACK_KEY = 'docintell-feedback'

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable
  }
}

export function getDocs() {
  return safeRead(DOCS_KEY, [])
}

export function saveDocs(docs) {
  safeWrite(DOCS_KEY, docs)
}

export function getDoc(id) {
  return getDocs().find((d) => d.id === Number(id)) || null
}

export function upsertDoc(doc) {
  const docs = getDocs()
  const idx = docs.findIndex((d) => d.id === doc.id)
  if (idx >= 0) {
    docs[idx] = { ...docs[idx], ...doc }
  } else {
    docs.unshift(doc)
  }
  saveDocs(docs)
  return getDocs().find((d) => d.id === doc.id)
}

export function removeDoc(id) {
  saveDocs(getDocs().filter((d) => d.id !== Number(id)))
}

export function getQueries() {
  return safeRead(QUERIES_KEY, [])
}

export function saveQueries(queries) {
  safeWrite(QUERIES_KEY, queries)
}

export function addQuery(query) {
  const queries = getQueries()
  queries.unshift({ ...query, id: Date.now() })
  if (queries.length > 500) {
    queries.length = 500
  }
  saveQueries(queries)
  return queries[0]
}

export function getSettings() {
  return safeRead(SETTINGS_KEY, {
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    apiKey: '',
    queryMode: 'basic',
  })
}

export function saveSettings(settings) {
  safeWrite(SETTINGS_KEY, { ...getSettings(), ...settings })
}

export function getFeedback() {
  return safeRead(FEEDBACK_KEY, [])
}

export function addFeedback(item) {
  const list = getFeedback()
  list.unshift({ ...item, id: Date.now() })
  safeWrite(FEEDBACK_KEY, list)
}

let _nextId = null
export function nextDocId() {
  if (_nextId === null) {
    const docs = getDocs()
    _nextId = docs.length ? Math.max(...docs.map((d) => d.id)) + 1 : 1
  }
  return _nextId++
}
