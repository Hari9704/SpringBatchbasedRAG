import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, Trash2, RefreshCw, MessageSquare, CheckCircle, Loader, AlertCircle } from 'lucide-react'
import { useUserWorkspace } from '../../context/UserWorkspaceContext'

const PROCESSING_STATUSES = new Set(['UPLOADED', 'VALIDATING', 'EXTRACTING', 'CLEANING', 'CHUNKING', 'EMBEDDING'])

function formatBytes(sizeBytes) {
  if (!sizeBytes) {
    return '--'
  }

  const sizeInMb = sizeBytes / (1024 * 1024)
  return `${sizeInMb.toFixed(sizeInMb >= 10 ? 0 : 1)} MB`
}

function formatStatus(status) {
  return status.toLowerCase().replace(/_/g, ' ')
}

function formatTimestamp(dateText) {
  if (!dateText) {
    return 'Unknown'
  }

  return new Date(dateText).toLocaleString()
}

export default function MyDocuments() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeDocumentId, setActiveDocumentId] = useState(null)
  const [pageError, setPageError] = useState('')
  const [busyDocumentId, setBusyDocumentId] = useState(null)
  const {
    documents,
    latestJobsByDocumentId,
    selectDocument,
    reprocessDocument,
    removeDocument,
    workspaceError,
  } = useUserWorkspace()

  useEffect(() => {
    if (!documents.length) {
      setActiveDocumentId(null)
      return
    }

    if (!documents.some((document) => document.id === activeDocumentId)) {
      setActiveDocumentId(documents[0].id)
    }
  }, [activeDocumentId, documents])

  const filteredDocuments = useMemo(
    () => documents.filter((document) => document.name.toLowerCase().includes(search.toLowerCase())),
    [documents, search],
  )

  const selectedDocument = documents.find((document) => document.id === activeDocumentId) || null
  const selectedJob = selectedDocument ? latestJobsByDocumentId[selectedDocument.id] : null

  const handleOpenInChat = () => {
    if (!selectedDocument || selectedDocument.status !== 'PROCESSED') {
      return
    }

    selectDocument(selectedDocument.id)
    navigate('/app/chat')
  }

  const handleReprocess = async () => {
    if (!selectedDocument) {
      return
    }

    setBusyDocumentId(selectedDocument.id)
    setPageError('')

    try {
      await reprocessDocument(selectedDocument.id)
    } catch (error) {
      setPageError(error.message || 'Unable to reprocess this document.')
    } finally {
      setBusyDocumentId(null)
    }
  }

  const handleDelete = async () => {
    if (!selectedDocument) {
      return
    }

    setBusyDocumentId(selectedDocument.id)
    setPageError('')

    try {
      await removeDocument(selectedDocument.id)
    } catch (error) {
      setPageError(error.message || 'Unable to delete this document.')
    } finally {
      setBusyDocumentId(null)
    }
  }

  return (
    <div className="animate-fade-in" id="my-documents">
      <div className="page-header">
        <h1>My Documents</h1>
        <p>Your personal document library.</p>
      </div>

      {(workspaceError || pageError) ? (
        <div className="status-card error" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <AlertCircle size={18} />
          <span>{workspaceError || pageError}</span>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--spacing-xl)', alignItems: 'center' }}>
        <div className="input-with-icon" style={{ flex: 1 }}>
          <Search size={18} className="input-icon" />
          <input
            className="form-input"
            placeholder="Search your documents..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="inline-muted" style={{ whiteSpace: 'nowrap' }}>
          <FileText size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {documents.filter((document) => document.status === 'PROCESSED').length} ready · {documents.filter((document) => PROCESSING_STATUSES.has(document.status)).length} processing
        </div>
      </div>

      <div className="document-layout">
        <div style={{ flex: 1 }}>
          {filteredDocuments.length === 0 ? (
            <div className="card">
              <div className="empty-state compact">
                <FileText size={28} />
                <div>No documents match your search yet.</div>
              </div>
            </div>
          ) : (
            filteredDocuments.map((document) => {
              const isProcessing = PROCESSING_STATUSES.has(document.status)
              const isSelected = activeDocumentId === document.id

              return (
                <div
                  key={document.id}
                  className="card"
                  style={{
                    marginBottom: 12,
                    cursor: 'pointer',
                    borderLeft: isSelected ? '4px solid var(--color-primary)' : '4px solid transparent',
                  }}
                  onClick={() => setActiveDocumentId(document.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: document.type === 'PDF' ? 'var(--color-primary-lighter)' : 'var(--color-info-bg)', color: document.type === 'PDF' ? 'var(--color-primary)' : 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-base)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{document.name}</div>
                        <div className="inline-muted">
                          {document.type} · {formatBytes(document.sizeBytes)} · {document.chunks || 0} chunks
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge ${document.status === 'PROCESSED' ? 'badge-success' : document.status === 'FAILED' ? 'badge-error' : 'badge-processing'}`}>
                        {document.status === 'PROCESSED' ? <CheckCircle size={12} /> : document.status === 'FAILED' ? <AlertCircle size={12} /> : <Loader size={12} className={isProcessing ? 'spin' : ''} />}
                        {formatStatus(document.status)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {selectedDocument ? (
          <div className="document-detail-panel">
            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-lighter)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-md)' }}>
                  <FileText size={28} />
                </div>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>{selectedDocument.name}</h3>
              </div>

              <div className="document-detail-grid">
                <div className="detail-row">
                  <span className="inline-muted">Type</span>
                  <span className="badge badge-info">{selectedDocument.type}</span>
                </div>
                <div className="detail-row">
                  <span className="inline-muted">Size</span>
                  <span>{formatBytes(selectedDocument.sizeBytes)}</span>
                </div>
                <div className="detail-row">
                  <span className="inline-muted">Status</span>
                  <span className={`badge ${selectedDocument.status === 'PROCESSED' ? 'badge-success' : selectedDocument.status === 'FAILED' ? 'badge-error' : 'badge-processing'}`}>
                    {formatStatus(selectedDocument.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="inline-muted">Chunks</span>
                  <span>{selectedDocument.chunks || 0}</span>
                </div>
                <div className="detail-row">
                  <span className="inline-muted">Uploaded</span>
                  <span>{formatTimestamp(selectedDocument.uploadDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="inline-muted">Processed</span>
                  <span>{selectedDocument.processedDate ? formatTimestamp(selectedDocument.processedDate) : '--'}</span>
                </div>
                {selectedJob ? (
                  <div className="detail-row">
                    <span className="inline-muted">Batch step</span>
                    <span>{selectedJob.currentStep || selectedJob.status}</span>
                  </div>
                ) : null}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 'var(--spacing-lg)' }}>
                <button
                  className="btn btn-sm btn-secondary"
                  style={{ flex: 1 }}
                  onClick={handleOpenInChat}
                  disabled={selectedDocument.status !== 'PROCESSED'}
                  type="button"
                >
                  <MessageSquare size={14} /> Open in Chat
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  style={{ flex: 1 }}
                  onClick={handleReprocess}
                  disabled={busyDocumentId === selectedDocument.id}
                  type="button"
                >
                  {busyDocumentId === selectedDocument.id ? <Loader size={14} className="spin" /> : <RefreshCw size={14} />}
                  Reprocess
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={handleDelete}
                  disabled={busyDocumentId === selectedDocument.id}
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
