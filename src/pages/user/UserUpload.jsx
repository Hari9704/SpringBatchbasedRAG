import { useState } from 'react'
import { Upload, FileText, CheckCircle, Loader, AlertCircle, X } from 'lucide-react'

const batchSteps = [
  { step: 'Reading', desc: 'Extracting raw content from file' },
  { step: 'Parsing', desc: 'Identifying structure and sections' },
  { step: 'Chunking', desc: 'Splitting into semantic chunks' },
  { step: 'Embedding', desc: 'Generating vector embeddings (Spring AI)' },
]

export default function UserUpload() {
  const [files, setFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [processing, setProcessing] = useState(null) // null, 'processing', 'done'
  const [currentStep, setCurrentStep] = useState(-1)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer?.files || [])
    if (droppedFiles.length) addFiles(droppedFiles)
  }

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length) addFiles(selectedFiles)
  }

  const addFiles = (newFiles) => {
    setFiles(newFiles.map(f => ({ name: f.name, size: (f.size / 1024 / 1024).toFixed(2) + ' MB', type: f.name.split('.').pop().toUpperCase() })))
    simulateProcessing()
  }

  const simulateProcessing = () => {
    setProcessing('processing')
    setCurrentStep(0)
    let step = 0
    const interval = setInterval(() => {
      step++
      if (step >= batchSteps.length) {
        clearInterval(interval)
        setCurrentStep(batchSteps.length)
        setProcessing('done')
      } else {
        setCurrentStep(step)
      }
    }, 1500)
  }

  return (
    <div className="animate-fade-in" id="user-upload">
      <div className="page-header">
        <h1>Upload & Process</h1>
        <p>Upload your documents to enable AI-powered queries</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
        style={{ marginBottom: 'var(--spacing-xl)' }}
      >
        <Upload className="upload-zone-icon" size={48} />
        <h3>Drag & drop your documents here</h3>
        <p>Supported formats: PDF, DOCX, TXT · Max 50MB</p>
        <input type="file" id="file-input" hidden accept=".pdf,.docx,.txt" multiple onChange={handleFileInput} />
        <button className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }} onClick={(e) => e.stopPropagation()}>
          Browse Files
        </button>
      </div>

      {/* File Queue */}
      {files.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="card-title">Uploaded Files</div>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={20} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{f.name}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{f.type} · {f.size}</div>
                </div>
              </div>
              {processing === 'done' ? (
                <span className="badge badge-success"><CheckCircle size={12} /> Ready</span>
              ) : processing === 'processing' ? (
                <span className="badge badge-processing"><Loader size={12} className="spin" /> Processing</span>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Processing Pipeline */}
      {processing && (
        <div className="card">
          <div className="card-title">Spring Batch Processing Pipeline</div>
          <div className="timeline">
            {batchSteps.map((s, i) => {
              const isDone = i < currentStep
              const isCurrent = i === currentStep && processing !== 'done'
              return (
                <div className="timeline-item" key={i}>
                  <div className="timeline-dot" style={{
                    background: isDone ? 'var(--color-accent)' : isCurrent ? 'var(--color-primary)' : 'var(--color-border)',
                    boxShadow: isDone ? '0 0 0 2px white, 0 0 0 4px var(--color-accent)' : isCurrent ? '0 0 0 2px white, 0 0 0 4px var(--color-primary)' : '0 0 0 2px white, 0 0 0 4px var(--color-border)'
                  }}></div>
                  <div className="timeline-content" style={{ borderColor: isDone ? 'var(--color-accent)' : isCurrent ? 'var(--color-primary)' : undefined }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong>Step {i + 1}: {s.step}</strong>
                      {isDone && <span className="badge badge-success"><CheckCircle size={12} /> Done</span>}
                      {isCurrent && <span className="badge badge-processing"><Loader size={12} /> Running</span>}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 4 }}>{s.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {processing === 'done' && (
            <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={24} style={{ color: 'var(--color-accent)' }} />
              <div>
                <div style={{ fontWeight: 600, color: '#065f46' }}>Document Ready for AI Query ✅</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: '#047857' }}>All chunks embedded and stored. You can now start chatting!</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
