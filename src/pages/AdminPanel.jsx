import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Play, RotateCcw, Database, FileText, Sliders, RefreshCw } from 'lucide-react'
import { fetchAllDocumentsAdmin, fetchBatchJobs } from '../lib/api'

const CONFIG_KEY = 'docintell-admin-config-v1'

function mapJobStatus(status) {
  if (status === 'COMPLETED') {
    return 'completed'
  }

  if (status === 'FAILED') {
    return 'failed'
  }

  return 'running'
}

function formatDuration(startTime, endTime) {
  if (!startTime) {
    return '--'
  }

  const start = new Date(startTime).getTime()
  const end = endTime ? new Date(endTime).getTime() : Date.now()
  if (Number.isNaN(start)) {
    return '--'
  }

  const seconds = Math.max(0, Math.round((end - start) / 1000))
  if (seconds < 60) {
    return `${seconds}s`
  }

  return `${(seconds / 60).toFixed(1)}m`
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('batch')
  const [chunkSize, setChunkSize] = useState(200)
  const [threshold, setThreshold] = useState(78)
  const [selectedModel, setSelectedModel] = useState('gemini-pro')
  const [jobs, setJobs] = useState([])
  const [jobsError, setJobsError] = useState('')
  const [jobsLoading, setJobsLoading] = useState(false)
  const [embeddingMeta, setEmbeddingMeta] = useState({ documents: 0, chunks: 0, processed: 0 })
  const [configMessage, setConfigMessage] = useState('')

  const loadJobs = useCallback(async () => {
    setJobsLoading(true)
    setJobsError('')

    try {
      const data = await fetchBatchJobs()
      setJobs(Array.isArray(data) ? data : [])
    } catch (error) {
      setJobsError(error.message || 'Unable to load batch jobs.')
    } finally {
      setJobsLoading(false)
    }
  }, [])

  const loadEmbeddingMeta = useCallback(async () => {
    try {
      const docs = await fetchAllDocumentsAdmin()
      if (!Array.isArray(docs)) {
        return
      }

      const chunks = docs.reduce((sum, document) => sum + (Number(document.chunks) || 0), 0)
      const processed = docs.filter((document) => document.status === 'PROCESSED').length
      setEmbeddingMeta({ documents: docs.length, chunks, processed })
    } catch {
      setEmbeddingMeta({ documents: 0, chunks: 0, processed: 0 })
    }
  }, [])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  useEffect(() => {
    if (activeTab === 'embedding') {
      loadEmbeddingMeta()
    }
  }, [activeTab, loadEmbeddingMeta])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONFIG_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw)
      if (parsed.chunkSize) {
        setChunkSize(parsed.chunkSize)
      }

      if (parsed.threshold) {
        setThreshold(parsed.threshold)
      }

      if (parsed.selectedModel) {
        setSelectedModel(parsed.selectedModel)
      }
    } catch {
      // ignore
    }
  }, [])

  const mappedJobs = useMemo(() => (
    jobs.map((job) => ({
      id: `JOB-${job.id}`,
      rawId: job.id,
      name: job.documentName || `Document #${job.documentId}`,
      status: mapJobStatus(job.status),
      started: job.startTime ? new Date(job.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--',
      duration: formatDuration(job.startTime, job.endTime),
      steps: `${job.completedSteps}/${job.totalSteps}`,
      error: job.errorMessage,
    }))
  ), [jobs])

  const embeddingStats = useMemo(() => ([
    { label: 'Documents (all users)', value: String(embeddingMeta.documents) },
    { label: 'Processed documents', value: String(embeddingMeta.processed) },
    { label: 'Total chunk count (sum)', value: String(embeddingMeta.chunks) },
    { label: 'Embedding stack', value: 'Spring AI + Gemini' },
    { label: 'Vector store', value: 'SimpleVectorStore (file)' },
    { label: 'Last refresh', value: new Date().toLocaleTimeString() },
  ]), [embeddingMeta])

  const handleSaveConfig = () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ chunkSize, threshold, selectedModel }))
    setConfigMessage('Saved locally in this browser (demo). Wire to backend config when ready.')
    window.setTimeout(() => setConfigMessage(''), 4000)
  }

  const tabs = [
    { id: 'batch', label: 'Batch management', icon: Play },
    { id: 'embedding', label: 'Embedding control', icon: Database },
    { id: 'logs', label: 'Logs & monitoring', icon: FileText },
    { id: 'config', label: 'Config', icon: Sliders },
  ]

  return (
    <div className="animate-fade-in" id="admin-page">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Monitor Spring Batch and tune demo settings.</p>
      </div>

      <div className="tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <Icon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'batch' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-primary" type="button" onClick={() => navigate('/admin/documents')}>
              <Play size={16} /> Pick document to process
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => loadJobs()} disabled={jobsLoading}>
              <RefreshCw size={16} className={jobsLoading ? 'spin' : ''} /> Refresh jobs
            </button>
            {jobsError ? <span className="inline-muted" style={{ color: 'var(--color-error)' }}>{jobsError}</span> : null}
          </div>
          <div className="card">
            <div className="card-title">Spring Batch — job history</div>
            {mappedJobs.length === 0 && !jobsError ? (
              <div className="empty-state compact">
                <FileText size={28} />
                <div>No batch job records yet. Trigger processing from the user upload flow or document explorer.</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Duration</th>
                    <th>Steps</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedJobs.map((job) => (
                    <tr key={job.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{job.id}</td>
                      <td>{job.name}</td>
                      <td>
                        <span className={`badge ${job.status === 'completed' ? 'badge-success' : job.status === 'running' ? 'badge-processing' : 'badge-error'}`}>
                          <span className="badge-dot"></span>
                          {job.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{job.started}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{job.duration}</td>
                      <td>{job.steps}</td>
                      <td>
                        {job.status === 'failed' ? (
                          <button
                            className="btn btn-sm btn-secondary"
                            type="button"
                            onClick={() => window.alert(job.error || 'See batch-service logs. Re-upload or reprocess from the user workspace.')}
                          >
                            <RotateCcw size={12} /> Details
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'embedding' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                loadEmbeddingMeta()
                window.alert('Refreshed counts from /api/documents/all. Full re-index is driven per document via batch jobs.')
              }}
            >
              <Database size={16} /> Refresh embedding stats
            </button>
          </div>
          <div className="card">
            <div className="card-title">Embedding statistics (live)</div>
            <div className="stats-grid">
              {embeddingStats.map((stat) => (
                <div key={stat.label} style={{ padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="animate-fade-in">
          <div className="card">
            <div className="card-title">API logs</div>
            <p className="inline-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
              Central request logging is not enabled in this demo. Use Spring Boot logs on each service, or add a gateway access log.
            </p>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => navigate('/admin/tests')}>
              Open test checklist
            </button>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="animate-fade-in">
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-title">System configuration (local demo)</div>
            {configMessage ? <div className="status-card success" style={{ marginBottom: 'var(--spacing-md)' }}>{configMessage}</div> : null}

            <div className="form-group">
              <label className="form-label">Preferred model label</label>
              <select
                className="form-input"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="gemini-pro">Gemini (Google)</option>
                <option value="gpt-4o">GPT-4o (placeholder)</option>
                <option value="claude-3.5">Claude 3.5 (placeholder)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">UI chunk size hint: {chunkSize}</label>
              <input
                type="range"
                min={50}
                max={500}
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">UI similarity hint: {threshold}%</label>
              <input
                type="range"
                min={50}
                max={99}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-royal)' }}
              />
            </div>

            <button className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }} type="button" onClick={handleSaveConfig}>
              <Settings size={16} /> Save configuration
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
