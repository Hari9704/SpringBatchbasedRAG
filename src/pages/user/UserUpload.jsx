import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, CheckCircle, Loader, AlertCircle, ArrowRight } from 'lucide-react'
import { useUserWorkspace } from '../../context/UserWorkspaceContext'

const PROCESSING_STATUSES = new Set(['UPLOADED', 'VALIDATING', 'EXTRACTING', 'CLEANING', 'CHUNKING', 'EMBEDDING'])

const PIPELINE_STEPS = [
  {
    key: 'VALIDATING',
    label: 'Validating upload',
    description: 'Checking file type, size, and storage metadata.',
  },
  {
    key: 'EXTRACTING',
    label: 'Extracting text',
    description: 'Reading document text from the uploaded file.',
  },
  {
    key: 'CLEANING',
    label: 'Cleaning content',
    description: 'Normalizing extracted text before chunking.',
  },
  {
    key: 'CHUNKING',
    label: 'Chunking content',
    description: 'Splitting the document into semantic chunks.',
  },
  {
    key: 'EMBEDDING',
    label: 'Generating embeddings',
    description: 'Writing vector embeddings for retrieval.',
  },
  {
    key: 'PROCESSED',
    label: 'Ready for chat',
    description: 'This document can now be queried in AI Chat.',
  },
]

const STATUS_STYLES = {
  PROCESSED: 'badge-success',
  FAILED: 'badge-error',
}

function formatBytes(sizeBytes) {
  if (!sizeBytes) {
    return '--'
  }

  const sizeInMb = sizeBytes / (1024 * 1024)
  return `${sizeInMb.toFixed(sizeInMb >= 10 ? 0 : 1)} MB`
}

function formatStatus(status) {
  if (!status) {
    return 'unknown'
  }

  return String(status).toLowerCase().replace(/_/g, ' ')
}

function getStepState(stepKey, documentStatus) {
  if (documentStatus === 'FAILED') {
    return 'pending'
  }

  const normalizedStatus = documentStatus === 'UPLOADED' ? 'VALIDATING' : documentStatus
  const currentIndex = PIPELINE_STEPS.findIndex((step) => step.key === normalizedStatus)
  const stepIndex = PIPELINE_STEPS.findIndex((step) => step.key === stepKey)

  if (documentStatus === 'PROCESSED' && stepKey === 'PROCESSED') {
    return 'done'
  }

  if (stepIndex < currentIndex) {
    return 'done'
  }

  if (stepIndex === currentIndex) {
    return 'current'
  }

  return 'pending'
}

export default function UserUpload() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const [pageError, setPageError] = useState('')

  const {
    documents,
    latestJobsByDocumentId,
    processedDocuments,
    uploadFiles,
    workspaceError,
    loading,
    refreshWorkspace,
  } = useUserWorkspace()

  const activeDocument = useMemo(() => {
    const inFlight = documents.filter((document) => PROCESSING_STATUSES.has(document.status))
    if (inFlight.length) {
      return inFlight[0]
    }

    const failed = documents.find((document) => document.status === 'FAILED')
    if (failed) {
      return failed
    }

    return documents[0] || null
  }, [documents])

  const activeJob = activeDocument ? latestJobsByDocumentId[activeDocument.id] : null

  const handleFiles = async (fileList) => {
    if (!fileList.length) {
      return
    }

    setSubmitting(true)
    setPageError('')
    setNotice('')

    try {
      const result = await uploadFiles(fileList)

      if (result.successCount > 0) {
        const noun = result.successCount === 1 ? 'document' : 'documents'
        setNotice(`${result.successCount} ${noun} added to the processing queue.`)
      }

      if (result.errors.length) {
        setPageError(result.errors.join(' '))
      }
    } catch (error) {
      setPageError(error.message || 'Upload failed.')
    } finally {
      setSubmitting(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    handleFiles(Array.from(event.dataTransfer?.files || []))
  }

  const handleFileInput = (event) => {
    handleFiles(Array.from(event.target.files || []))
  }

  return (
    <div className="animate-fade-in" id="user-upload">
      <div className="page-header">
        <h1>Upload & Process</h1>
        <p>Upload your documents to enable AI-powered queries.</p>
      </div>

      {loading && !documents.length ? (
        <div className="card empty-state" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <Loader size={28} className="spin" />
          <div>Loading your documents…</div>
        </div>
      ) : null}

      {(workspaceError || pageError || notice) && (
        <div className={`card ${workspaceError || pageError ? 'status-card error' : 'status-card success'}`} style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {workspaceError || pageError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{workspaceError || pageError || notice}</span>
          </div>
        </div>
      )}

      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''} ${submitting ? 'disabled' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !submitting && inputRef.current?.click()}
        style={{ marginBottom: 'var(--spacing-xl)' }}
      >
        <Upload className="upload-zone-icon" size={48} />
        <h3>Drag and drop your documents here</h3>
        <p>Supported formats: PDF, DOCX, TXT. Max size: 50 MB.</p>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".pdf,.docx,.txt"
          multiple
          onChange={handleFileInput}
        />
        <button
          className="btn btn-primary"
          style={{ marginTop: 'var(--spacing-md)' }}
          onClick={(event) => {
            event.stopPropagation()
            inputRef.current?.click()
          }}
          type="button"
        >
          {submitting ? <Loader size={16} className="spin" /> : null}
          Browse Files
        </button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span>Recent Documents</span>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => refreshWorkspace({ silent: true })} disabled={loading}>
              {loading ? <Loader size={14} className="spin" /> : null}
              Refresh
            </button>
          </div>
          {documents.length === 0 ? (
            <div className="empty-state compact">
              <FileText size={28} />
              <div>No documents uploaded yet.</div>
            </div>
          ) : (
            documents.map((document) => (
              <div key={document.id} className="list-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{document.name}</div>
                    <div className="inline-muted">
                      {document.type} · {formatBytes(document.sizeBytes)} · {document.chunks || 0} chunks
                    </div>
                  </div>
                </div>
                <span className={`badge ${STATUS_STYLES[document.status] || 'badge-processing'}`}>
                  {document.status === 'PROCESSED' ? <CheckCircle size={12} /> : document.status === 'FAILED' ? <AlertCircle size={12} /> : <Loader size={12} className="spin" />}
                  {formatStatus(document.status)}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-title">Processing Pipeline</div>
          {!activeDocument ? (
            <div className="empty-state compact">
              <Upload size={28} />
              <div>Upload a document to start the Spring Batch pipeline.</div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ fontWeight: 600 }}>{activeDocument.name}</div>
                <div className="inline-muted">
                  {activeJob?.currentStep || formatStatus(activeDocument.status)}
                </div>
              </div>
              <div className="timeline">
                {PIPELINE_STEPS.map((step, index) => {
                  const state = getStepState(step.key, activeDocument.status)
                  const isDone = state === 'done'
                  const isCurrent = state === 'current'

                  return (
                    <div className="timeline-item" key={step.key}>
                      <div className={`timeline-dot ${isDone ? 'done' : isCurrent ? 'current' : 'inactive'}`}></div>
                      <div className="timeline-content">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <strong>Step {index + 1}: {step.label}</strong>
                          {isDone ? <span className="badge badge-success"><CheckCircle size={12} /> Done</span> : null}
                          {isCurrent ? <span className="badge badge-processing"><Loader size={12} className="spin" /> Running</span> : null}
                        </div>
                        <div className="inline-muted" style={{ marginTop: 4 }}>{step.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {activeDocument.status === 'FAILED' ? (
                <div className="status-card error" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <AlertCircle size={18} />
                  <span>This document failed during processing. Re-upload or reprocess it from My Documents.</span>
                </div>
              ) : null}

              {activeDocument.status === 'PROCESSED' ? (
                <div className="status-card success" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <CheckCircle size={20} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>Document ready for AI Chat</div>
                    <div className="inline-muted">All chunks are embedded and available for retrieval.</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/app/chat')} type="button">
                    Start Chatting <ArrowRight size={14} />
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {processedDocuments.length > 0 ? (
        <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
          <div className="card-title">Ready Documents</div>
          {processedDocuments.map((document) => (
            <div key={document.id} className="list-row">
              <div>
                <div style={{ fontWeight: 600 }}>{document.name}</div>
                <div className="inline-muted">{document.chunks || 0} chunks available for retrieval</div>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app/chat')} type="button">
                Open Chat <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
