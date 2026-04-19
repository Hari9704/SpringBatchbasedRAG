import { useState } from 'react'
import { Settings, Play, RotateCcw, Database, FileText, AlertTriangle, Sliders, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react'

const batchJobs = [
  { id: 'JOB-347', name: 'Q3 Report Processing', status: 'completed', started: '13:02', duration: '4.2s', steps: '6/6' },
  { id: 'JOB-346', name: 'Compliance Doc Reindex', status: 'running', started: '12:58', duration: '2.1s', steps: '4/6' },
  { id: 'JOB-345', name: 'Vendor Contract Batch', status: 'completed', started: '12:45', duration: '8.7s', steps: '6/6' },
  { id: 'JOB-344', name: 'SLA Embedding Update', status: 'failed', started: '12:30', duration: '1.3s', steps: '2/6', error: 'Vector DB connection timeout' },
  { id: 'JOB-343', name: 'Board Minutes Processing', status: 'completed', started: '12:15', duration: '3.1s', steps: '6/6' },
]

const embeddingStats = [
  { label: 'Total Vectors', value: '24,891' },
  { label: 'Documents Indexed', value: '1,284' },
  { label: 'Avg. Chunk Size', value: '196 words' },
  { label: 'Embedding Model', value: 'text-embedding-3-small' },
  { label: 'Vector Dimensions', value: '1536' },
  { label: 'Last Reindex', value: '2 hrs ago' },
]

const apiLogs = [
  { time: '13:05:22', method: 'POST', endpoint: '/api/query', status: 200, duration: '1.4s' },
  { time: '13:05:18', method: 'GET', endpoint: '/api/documents', status: 200, duration: '0.2s' },
  { time: '13:04:55', method: 'POST', endpoint: '/api/batch/trigger', status: 201, duration: '0.3s' },
  { time: '13:04:30', method: 'POST', endpoint: '/api/feedback', status: 200, duration: '0.1s' },
  { time: '13:03:12', method: 'GET', endpoint: '/api/analytics', status: 200, duration: '0.5s' },
  { time: '13:02:45', method: 'POST', endpoint: '/api/auth/login', status: 200, duration: '0.4s' },
  { time: '13:01:18', method: 'POST', endpoint: '/api/query', status: 500, duration: '2.1s' },
]

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('batch')
  const [chunkSize, setChunkSize] = useState(200)
  const [threshold, setThreshold] = useState(78)
  const [selectedModel, setSelectedModel] = useState('gpt-4o')

  const tabs = [
    { id: 'batch', label: '🔹 Batch Management', icon: Play },
    { id: 'embedding', label: '🔹 Embedding Control', icon: Database },
    { id: 'logs', label: '🔹 Logs & Monitoring', icon: FileText },
    { id: 'config', label: '🔹 Config Management', icon: Sliders },
  ]

  return (
    <div className="animate-fade-in" id="admin-page">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Control system behavior and monitor operations</p>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Batch Management */}
      {activeTab === 'batch' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--spacing-lg)' }}>
            <button className="btn btn-primary"><Play size={16} /> Trigger New Job</button>
            <button className="btn btn-secondary"><RefreshCw size={16} /> Refresh</button>
          </div>
          <div className="card">
            <div className="card-title">Spring Batch — Job History</div>
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
                {batchJobs.map(job => (
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
                      {job.status === 'failed' && (
                        <button className="btn btn-sm btn-secondary">
                          <RotateCcw size={12} /> Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Embedding Control */}
      {activeTab === 'embedding' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--spacing-lg)' }}>
            <button className="btn btn-primary"><Database size={16} /> Re-index All Documents</button>
          </div>
          <div className="card">
            <div className="card-title">Embedding Statistics</div>
            <div className="stats-grid">
              {embeddingStats.map((stat, idx) => (
                <div key={idx} style={{ padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logs */}
      {activeTab === 'logs' && (
        <div className="animate-fade-in">
          <div className="card">
            <div className="card-title">API Logs — Real-time</div>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {apiLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{log.time}</td>
                    <td>
                      <span style={{
                        fontFamily: 'monospace', fontWeight: 600, fontSize: '0.75rem',
                        padding: '2px 6px', borderRadius: 4,
                        background: log.method === 'POST' ? 'var(--color-info-bg)' : 'var(--color-success-bg)',
                        color: log.method === 'POST' ? 'var(--color-info)' : 'var(--color-success)'
                      }}>
                        {log.method}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{log.endpoint}</td>
                    <td>
                      <span className={`badge ${log.status < 400 ? 'badge-success' : 'badge-error'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{log.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Config */}
      {activeTab === 'config' && (
        <div className="animate-fade-in">
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-title">System Configuration</div>
            
            <div className="form-group">
              <label className="form-label">LLM Model Selection</label>
              <select
                className="form-input"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
              >
                <option value="gpt-4o">GPT-4o (OpenAI)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (OpenAI)</option>
                <option value="claude-3.5">Claude 3.5 Sonnet (Anthropic)</option>
                <option value="gemini-pro">Gemini Pro (Google)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Chunk Size: {chunkSize} words</label>
              <input
                type="range"
                min={50}
                max={500}
                value={chunkSize}
                onChange={e => setChunkSize(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                <span>50</span>
                <span>500</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Similarity Threshold: {threshold}%</label>
              <input
                type="range"
                min={50}
                max={99}
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                <span>50%</span>
                <span>99%</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
              <Settings size={16} /> Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
