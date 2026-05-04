import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  DEFAULT_USER_ID,
  deleteDocument as deleteDocumentRequest,
  fetchBatchJobs,
  fetchDocuments,
  triggerBatch,
  uploadDocument,
} from '../lib/api'

const STORAGE_KEY = 'docintell-selected-document-id'
const PROCESSING_STATUSES = new Set(['UPLOADED', 'VALIDATING', 'EXTRACTING', 'CLEANING', 'CHUNKING', 'EMBEDDING'])
const ACTIVE_JOB_STATUSES = new Set(['STARTED', 'RUNNING'])

const UserWorkspaceContext = createContext(null)

function getStoredDocumentId() {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  const parsed = Number(stored)
  return Number.isFinite(parsed) ? parsed : null
}

function getNextSelectedDocumentId(documents, preferredId) {
  if (!documents.length) return null
  if (preferredId != null && documents.some((d) => d.id === preferredId)) return preferredId
  const processed = documents.filter((d) => d.status === 'PROCESSED')
  return processed.length ? processed[0].id : documents[0].id
}

function documentFromUploadResponse(payload) {
  if (!payload || payload.id == null) return null
  return {
    id: Number(payload.id),
    userId: payload.userId != null ? Number(payload.userId) : DEFAULT_USER_ID,
    name: payload.name || 'Untitled',
    type: payload.type || 'FILE',
    sizeBytes: payload.sizeBytes != null ? Number(payload.sizeBytes) : 0,
    status: payload.status || 'UPLOADED',
    chunks: payload.chunks != null ? Number(payload.chunks) : 0,
    uploadDate: payload.uploadDate || new Date().toISOString(),
    processedDate: payload.processedDate ?? null,
    version: payload.version ?? 1,
  }
}

function mergeDocumentList(previous, incoming) {
  if (!incoming) return previous
  const without = previous.filter((d) => d.id !== incoming.id)
  return [incoming, ...without]
}

function getLatestJobsByDocumentId(jobs) {
  return jobs.reduce((acc, job) => {
    const documentId = job?.documentId
    if (documentId == null) return acc
    const current = acc[documentId]
    if (!current) {
      acc[documentId] = job
      return acc
    }
    const newTime = new Date(job.startTime || 0).getTime()
    const curTime = new Date(current.startTime || 0).getTime()
    if (newTime >= curTime) acc[documentId] = job
    return acc
  }, {})
}

export function UserWorkspaceProvider({ children }) {
  const [documents, setDocuments] = useState([])
  const [jobs, setJobs] = useState([])
  const [selectedDocumentId, setSelectedDocumentId] = useState(() => getStoredDocumentId())
  const [loading, setLoading] = useState(true)
  const [workspaceError, setWorkspaceError] = useState('')
  const selectedDocumentIdRef = useRef(selectedDocumentId)

  useEffect(() => {
    selectedDocumentIdRef.current = selectedDocumentId
  }, [selectedDocumentId])

  const persistSelectedDocument = useCallback((documentId) => {
    setSelectedDocumentId(documentId)
    if (documentId == null) {
      window.localStorage.removeItem(STORAGE_KEY)
    } else {
      window.localStorage.setItem(STORAGE_KEY, String(documentId))
    }
  }, [])

  const refreshWorkspace = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)

    let nextDocuments = null
    let nextJobs = null
    const errors = []

    try {
      nextDocuments = await fetchDocuments(DEFAULT_USER_ID)
    } catch (err) {
      errors.push(err.message || 'Could not load documents')
    }

    try {
      nextJobs = await fetchBatchJobs()
    } catch (err) {
      errors.push(err.message || 'Could not load batch jobs')
    }

    if (Array.isArray(nextDocuments)) {
      setDocuments(nextDocuments)
    } else if (!silent) {
      setDocuments([])
    }

    if (Array.isArray(nextJobs)) {
      setJobs(nextJobs)
    } else if (!silent) {
      setJobs([])
    }

    setWorkspaceError(errors.length ? [...new Set(errors)].join(' · ') : '')

    if (Array.isArray(nextDocuments)) {
      if (!nextDocuments.length) {
        persistSelectedDocument(null)
      } else {
        const next = getNextSelectedDocumentId(nextDocuments, selectedDocumentIdRef.current)
        if (next !== selectedDocumentIdRef.current) {
          persistSelectedDocument(next)
        }
      }
    }

    if (!silent) setLoading(false)
  }, [persistSelectedDocument])

  useEffect(() => { refreshWorkspace() }, [refreshWorkspace])

  const hasActiveProcessing = useMemo(() => (
    documents.some((d) => PROCESSING_STATUSES.has(d.status))
    || jobs.some((j) => ACTIVE_JOB_STATUSES.has(j.status))
  ), [documents, jobs])

  useEffect(() => {
    if (!hasActiveProcessing) return undefined
    const id = window.setInterval(() => refreshWorkspace({ silent: true }), 2000)
    return () => window.clearInterval(id)
  }, [hasActiveProcessing, refreshWorkspace])

  useEffect(() => {
    const onFocus = () => refreshWorkspace({ silent: true })
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshWorkspace])

  const processedDocuments = useMemo(
    () => documents.filter((d) => d.status === 'PROCESSED'),
    [documents],
  )

  const latestJobsByDocumentId = useMemo(() => getLatestJobsByDocumentId(jobs), [jobs])

  const selectedDocument = useMemo(
    () => documents.find((d) => d.id === selectedDocumentId) || null,
    [documents, selectedDocumentId],
  )

  const uploadFiles = useCallback(async (files) => {
    const errors = []
    let successCount = 0

    for (const file of files) {
      try {
        const raw = await uploadDocument(file, DEFAULT_USER_ID)
        const normalized = documentFromUploadResponse(raw)
        if (normalized) {
          setDocuments((prev) => mergeDocumentList(prev, normalized))
          persistSelectedDocument(normalized.id)
        }
        successCount += 1
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`)
      }
    }

    await refreshWorkspace({ silent: true })
    return { successCount, errors }
  }, [persistSelectedDocument, refreshWorkspace])

  const reprocessDocument = useCallback(async (documentId) => {
    await triggerBatch(documentId)
    await refreshWorkspace({ silent: true })
  }, [refreshWorkspace])

  const removeDocument = useCallback(async (documentId) => {
    await deleteDocumentRequest(documentId, DEFAULT_USER_ID)
    await refreshWorkspace({ silent: true })
  }, [refreshWorkspace])

  const value = useMemo(() => ({
    documents,
    jobs,
    latestJobsByDocumentId,
    processedDocuments,
    selectedDocumentId,
    selectedDocument,
    loading,
    workspaceError,
    refreshWorkspace,
    selectDocument: persistSelectedDocument,
    uploadFiles,
    reprocessDocument,
    removeDocument,
    hasActiveProcessing,
  }), [
    documents, hasActiveProcessing, jobs, latestJobsByDocumentId, loading,
    persistSelectedDocument, processedDocuments, refreshWorkspace, removeDocument,
    reprocessDocument, selectedDocument, selectedDocumentId, uploadFiles, workspaceError,
  ])

  return (
    <UserWorkspaceContext.Provider value={value}>
      {children}
    </UserWorkspaceContext.Provider>
  )
}

export function useUserWorkspace() {
  const context = useContext(UserWorkspaceContext)
  if (!context) throw new Error('useUserWorkspace must be used inside UserWorkspaceProvider.')
  return context
}
