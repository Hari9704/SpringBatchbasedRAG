import { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Clock, ChevronDown } from 'lucide-react'

const batchLogs = [
  { step: 'File Validation', status: 'completed', time: '0.3s', detail: 'Format: PDF, Size: 2.4MB — Valid' },
  { step: 'Text Extraction', status: 'completed', time: '1.2s', detail: 'Extracted 4,521 words from 12 pages' },
  { step: 'Chunking', status: 'completed', time: '0.8s', detail: 'Created 23 chunks (avg 196 words)' },
  { step: 'Embedding Generation', status: 'processing', time: '2.1s', detail: 'Processing chunk 18/23...' },
  { step: 'Vector Storage', status: 'pending', time: '--', detail: 'Waiting for embeddings' },
  { step: 'Metadata Update', status: 'pending', time: '--', detail: 'Waiting for storage' },
]

export default function UploadProcessing() {
  const [files, setFiles] = useState([
    { name: 'Q3_Financial_Report.pdf', size: '2.4 MB', progress: 100, status: 'processing' },
    { name: 'Compliance_Guidelines_v2.docx', size: '1.1 MB', progress: 100, status: 'completed' },
  ])
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer?.files || [])
    dropped.forEach(f => {
      setFiles(prev => [...prev, {
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
        progress: 0,
        status: 'uploading'
      }])
    })
  }

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="animate-fade-in" id="upload-page">
      <div className="page-header">
        <h1>Upload & Processing</h1>
        <p>Upload documents to enter the processing pipeline</p>
      </div>

      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        id="upload-zone"
      >
        <Upload className="upload-zone-icon" />
        <h3>Drag & drop files here</h3>
        <p>or click to browse · Supports PDF, DOCX, TXT</p>
        <input
          type="file"
          ref={fileRef}
          style={{ display: 'none' }}
          accept=".pdf,.docx,.txt"
          multiple
          onChange={(e) => {
            Array.from(e.target.files || []).forEach(f => {
              setFiles(prev => [...prev, {
                name: f.name,
                size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
                progress: 0,
                status: 'uploading'
              }])
            })
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
          <div className="card-title">Upload Queue</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {files.map((file, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)'
              }}>
                <FileText size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{file.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{file.size}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${file.progress}%` }}></div>
                  </div>
                </div>
                {file.status === 'completed' && <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />}
                {file.status === 'processing' && <Clock size={18} style={{ color: 'var(--color-processing)', animation: 'pulse 1.5s infinite' }} />}
                {file.status === 'uploading' && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{file.progress}%</span>}
                <button onClick={() => removeFile(idx)} className="btn btn-icon btn-secondary" style={{ width: 28, height: 28 }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card-title">Batch Job Logs — Spring Batch Pipeline</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {batchLogs.map((log, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: log.status === 'processing' ? 'var(--color-processing-bg)' :
                log.status === 'completed' ? 'var(--color-success-bg)' : 'var(--color-bg)',
              border: '1px solid',
              borderColor: log.status === 'processing' ? 'rgba(255,143,0,0.2)' :
                log.status === 'completed' ? 'rgba(46,125,50,0.15)' : 'var(--color-border-light)'
            }}>
              <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {log.status === 'completed' && <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />}
                {log.status === 'processing' && <Clock size={16} style={{ color: 'var(--color-processing)', animation: 'spin 2s linear infinite' }} />}
                {log.status === 'pending' && <Circle size={16} style={{ color: 'var(--color-text-muted)' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{log.step}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{log.detail}</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
