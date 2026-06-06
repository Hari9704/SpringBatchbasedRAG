import {
  getDocs,
  getDoc,
  upsertDoc,
  removeDoc,
  getQueries,
  addQuery,
  getSettings,
  getFeedback,
  nextDocId,
} from './localStore'
import { extractText, chunkText } from './fileReader'
import { queryDocument } from './gemini'

export const DEFAULT_USER_ID = 1

export async function fetchDocuments() {
  return getDocs().map(d => ({ ...d, chunkList: undefined, rawContent: undefined }))
}

export async function fetchBatchJobs() {
  return getDocs()
    .filter(d => d.jobStatus)
    .map(d => ({
      id: d.id,
      documentId: d.id,
      status: d.jobStatus,
      currentStep: d.currentStep || '',
      startTime: d.uploadDate,
    }))
}

export async function uploadDocument(file) {
  const id = nextDocId()
  const ext = file.name.split('.').pop().toUpperCase()
  const doc = {
    id,
    userId: DEFAULT_USER_ID,
    name: file.name,
    type: ext,
    sizeBytes: file.size,
    status: 'UPLOADED',
    chunks: 0,
    chunkList: [],
    rawContent: '',
    uploadDate: new Date().toISOString(),
    processedDate: null,
    version: 1,
    jobStatus: 'STARTED',
    currentStep: 'Queued for processing',
    retryCount: 0,
  }
  upsertDoc(doc)
  processDocumentWithRetry(id, file)
  return doc
}

// LangGraph-inspired retry: each step is a node; on failure, retry the whole pipeline
async function processDocumentWithRetry(id, file, attempt = 1) {
  const MAX_ATTEMPTS = 3
  const BACKOFF_BASE = 1200

  try {
    await processDocument(id, file)
  } catch (err) {
    if (attempt < MAX_ATTEMPTS) {
      const delay = BACKOFF_BASE * Math.pow(2, attempt - 1)
      upsertDoc({
        id,
        status: 'RETRYING',
        jobStatus: 'RETRYING',
        currentStep: `Retrying (attempt ${attempt + 1}/${MAX_ATTEMPTS}) in ${Math.round(delay / 1000)}s…`,
        retryCount: attempt,
      })
      await sleep(delay)
      await processDocumentWithRetry(id, file, attempt + 1)
    } else {
      upsertDoc({
        id,
        status: 'FAILED',
        jobStatus: 'FAILED',
        currentStep: err.message || 'Processing failed after retries',
      })
    }
  }
}

async function processDocument(id, file) {
  const steps = [
    { status: 'VALIDATING', step: 'Validating file type and metadata',   delay: 400 },
    { status: 'EXTRACTING', step: 'Extracting text content',              delay: 700 },
    { status: 'CLEANING',   step: 'Cleaning and normalizing text',        delay: 500 },
    { status: 'CHUNKING',   step: 'Splitting into semantic chunks',       delay: 600 },
    { status: 'EMBEDDING',  step: 'Generating vector embeddings',         delay: 800 },
  ]

  for (const { status, step, delay } of steps) {
    await sleep(delay)
    upsertDoc({ id, status, currentStep: step, jobStatus: 'RUNNING' })
  }

  const rawContent = await extractText(file)
  const chunkList = chunkText(rawContent)

  await sleep(500)
  upsertDoc({
    id,
    status: 'PROCESSED',
    chunks: chunkList.length,
    chunkList,
    rawContent: rawContent.slice(0, 10000),
    processedDate: new Date().toISOString(),
    jobStatus: 'COMPLETED',
    currentStep: 'Ready',
    retryCount: 0,
  })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

export async function triggerBatch(documentId) {
  const doc = getDoc(documentId)
  if (!doc) throw new Error(`Document ${documentId} not found`)
  if (doc.status === 'PROCESSED') return { message: 'Already processed' }

  // If we have raw content + chunks from a prior run, rebuild from stored data
  if (doc.rawContent && doc.rawContent.length > 20) {
    upsertDoc({ id: documentId, status: 'CHUNKING', jobStatus: 'RUNNING', currentStep: 'Re-chunking from stored content', retryCount: 0 })
    await sleep(400)
    const { chunkText } = await import('./fileReader')
    const chunkList = chunkText(doc.rawContent)
    upsertDoc({
      id: documentId,
      status: 'PROCESSED',
      chunks: chunkList.length,
      chunkList,
      processedDate: new Date().toISOString(),
      jobStatus: 'COMPLETED',
      currentStep: 'Ready',
      retryCount: 0,
    })
    return { message: 'Reprocessed from stored content' }
  }

  // No file or content available — can't reprocess without re-upload
  throw new Error('Original file not available. Please delete this document and re-upload it to reprocess.')
}

export async function deleteDocument(documentId) {
  removeDoc(documentId)
  return { message: 'Deleted' }
}

export async function runQuery({ userId, documentId, question, reasoning, agentMode = false, onStep }) {
  const doc = getDoc(documentId)
  if (!doc) throw new Error('Document not found. Please upload and process a document first.')
  if (doc.status !== 'PROCESSED') throw new Error('Document is not ready yet. Please wait for processing to complete.')
  if (!doc.chunkList?.length) throw new Error('Document has no content chunks. Please reprocess the document.')

  const result = await queryDocument({
    question,
    documentId,
    documentName: doc.name,
    chunks: doc.chunkList,
    reasoning,
    agentMode,
    onStep,
  })

  addQuery({
    documentId,
    question,
    answer: result.answer,
    confidenceScore: result.confidence,
    sources: result.sources,
    model: result.model,
    timestamp: new Date().toISOString(),
  })

  return result
}

export async function runAgentQuery({ userId, documentId, question, reasoning, onEvent }) {
  const doc = getDoc(documentId)
  if (!doc) throw new Error('Document not found.')
  if (doc.status !== 'PROCESSED') throw new Error('Document is not ready yet.')
  if (!doc.chunkList?.length) throw new Error('Document has no content chunks.')

  const { runAgentGraph } = await import('./agent')

  const result = await runAgentGraph({
    question,
    documentId,
    documentName: doc.name,
    chunks: doc.chunkList,
    reasoning,
    agentMode: true,
  }, onEvent)

  addQuery({
    documentId,
    question,
    answer: result.answer,
    confidenceScore: result.confidence,
    sources: result.sources,
    model: result.model,
    agentMode: true,
    timestamp: new Date().toISOString(),
  })

  return result
}

export async function fetchQueryHistory() { return getQueries() }

export async function fetchQueryStats() {
  const queries = getQueries()
  return {
    totalQueries: queries.length,
    avgConfidence: queries.length
      ? Math.round(queries.reduce((s, q) => s + (q.confidenceScore || 0), 0) / queries.length)
      : 0,
  }
}

export async function fetchDocumentStats() {
  const docs = getDocs()
  return {
    totalDocuments: docs.length,
    processedDocuments: docs.filter(d => d.status === 'PROCESSED').length,
    failedDocuments: docs.filter(d => d.status === 'FAILED').length,
  }
}

export async function fetchFeedback() { return getFeedback() }

export async function fetchAllDocumentsAdmin() {
  return getDocs().map(d => ({ ...d, chunkList: undefined, rawContent: undefined }))
}
