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
  return getDocs().map((d) => ({ ...d, chunkList: undefined, rawContent: undefined }))
}

export async function fetchBatchJobs() {
  return getDocs()
    .filter((d) => d.jobStatus)
    .map((d) => ({
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
  }
  upsertDoc(doc)

  processDocument(id, file)

  return doc
}

async function processDocument(id, file) {
  const steps = [
    { status: 'VALIDATING', step: 'Validating file type and metadata', delay: 400 },
    { status: 'EXTRACTING', step: 'Extracting text content', delay: 700 },
    { status: 'CLEANING', step: 'Cleaning and normalizing text', delay: 500 },
    { status: 'CHUNKING', step: 'Splitting into semantic chunks', delay: 600 },
    { status: 'EMBEDDING', step: 'Generating vector embeddings', delay: 800 },
  ]

  for (const { status, step, delay } of steps) {
    await sleep(delay)
    upsertDoc({ id, status, currentStep: step, jobStatus: 'RUNNING' })
  }

  try {
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
    })
  } catch (err) {
    upsertDoc({
      id,
      status: 'FAILED',
      jobStatus: 'FAILED',
      currentStep: err.message || 'Processing failed',
    })
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function triggerBatch(documentId) {
  const doc = getDoc(documentId)
  if (!doc) {
    throw new Error(`Document ${documentId} not found`)
  }
  if (doc.status === 'PROCESSED') {
    return { message: 'Already processed' }
  }
  upsertDoc({ id: documentId, status: 'VALIDATING', jobStatus: 'STARTED', currentStep: 'Re-queued' })
  return { message: 'Batch triggered' }
}

export async function deleteDocument(documentId) {
  removeDoc(documentId)
  return { message: 'Deleted' }
}

export async function runQuery({ userId, documentId, question, reasoning }) {
  const doc = getDoc(documentId)
  if (!doc) {
    throw new Error('Document not found. Please upload and process a document first.')
  }
  if (doc.status !== 'PROCESSED') {
    throw new Error('Document is not ready yet. Please wait for processing to complete.')
  }
  if (!doc.chunkList || doc.chunkList.length === 0) {
    throw new Error('Document has no content chunks. Please reprocess the document.')
  }

  const result = await queryDocument({
    question,
    documentId,
    documentName: doc.name,
    chunks: doc.chunkList,
    reasoning,
  })

  addQuery({
    documentId,
    question,
    answer: result.answer,
    confidenceScore: result.confidence,
    sources: result.sources,
    timestamp: new Date().toISOString(),
  })

  return result
}

export async function fetchQueryHistory(userId) {
  return getQueries()
}

export async function fetchQueryStats(userId) {
  const queries = getQueries()
  return {
    totalQueries: queries.length,
    avgConfidence: queries.length
      ? Math.round(queries.reduce((s, q) => s + (q.confidenceScore || 0), 0) / queries.length)
      : 0,
  }
}

export async function fetchDocumentStats(userId) {
  const docs = getDocs()
  return {
    totalDocuments: docs.length,
    processedDocuments: docs.filter((d) => d.status === 'PROCESSED').length,
    failedDocuments: docs.filter((d) => d.status === 'FAILED').length,
  }
}

export async function fetchFeedback() {
  return getFeedback()
}

export async function fetchAllDocumentsAdmin() {
  return getDocs().map((d) => ({ ...d, chunkList: undefined, rawContent: undefined }))
}
