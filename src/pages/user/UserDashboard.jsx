import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, MessageSquare, Upload, Zap, Clock, ArrowRight,
  CheckCircle, AlertCircle, Brain, Sparkles, Cpu,
} from 'lucide-react'
import { useUserWorkspace } from '../../context/UserWorkspaceContext'
import { fetchQueryHistory } from '../../lib/api'
import { getMemoryStats } from '../../lib/memory'

function formatRelativeTime(dateText) {
  if (!dateText) return 'Unknown time'
  const mins = Math.round((Date.now() - new Date(dateText).getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.round(hrs / 24)} day ago`
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const [queryHistory, setQueryHistory] = useState([])
  const [historyError, setHistoryError] = useState('')
  const [memStats, setMemStats] = useState({})
  const [displayName] = useState(() => sessionStorage.getItem('docintell-display-name') || '')
  const { documents, processedDocuments, workspaceError } = useUserWorkspace()

  useEffect(() => {
    fetchQueryHistory()
      .then(h => { setQueryHistory(h); setHistoryError('') })
      .catch(e => setHistoryError(e.message || 'Unable to load recent queries.'))
    setMemStats(getMemoryStats())
  }, [])

  const latestProcessedDocument = useMemo(() => (
    [...processedDocuments].sort((a, b) => (
      new Date(b.processedDate || b.uploadDate || 0) - new Date(a.processedDate || a.uploadDate || 0)
    ))[0]
  ), [processedDocuments])

  const recentQueries = useMemo(() => (
    queryHistory.slice(0, 5).map(q => {
      const doc = documents.find(d => d.id === q.documentId)
      return {
        id: q.id,
        query: q.question,
        confidence: q.confidenceScore,
        time: formatRelativeTime(q.timestamp),
        documentName: doc?.name || (q.documentId ? `Document #${q.documentId}` : 'All documents'),
        agentMode: q.agentMode,
      }
    })
  ), [documents, queryHistory])

  const avgConfidence = queryHistory.length
    ? Math.round(queryHistory.reduce((s, q) => s + (q.confidenceScore || 0), 0) / queryHistory.length)
    : null

  const stats = [
    {
      label: 'Documents', value: String(documents.length),
      sub: `${processedDocuments.length} processed`, icon: FileText,
      color: 'var(--color-primary)', bg: 'var(--color-primary-lighter)',
    },
    {
      label: 'AI Queries', value: String(queryHistory.length),
      sub: 'Total in history', icon: MessageSquare,
      color: 'var(--color-accent)', bg: 'var(--color-success-bg)',
    },
    {
      label: 'Avg Confidence', value: avgConfidence != null ? `${avgConfidence}%` : '--',
      sub: avgConfidence != null ? 'Across all answers' : 'Run a chat first',
      icon: Zap, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)',
    },
    {
      label: 'Memories', value: String(memStats.total || 0),
      sub: `${memStats.totalRecalls || 0} total recalls`, icon: Brain,
      color: '#6366f1', bg: '#eef2ff',
    },
  ]

  return (
    <div className="animate-fade-in" id="user-dashboard">
      <div className="page-header">
        <h1>Welcome back{displayName ? `, ${displayName}` : ''} 👋</h1>
        <p>Your live document intelligence overview — agents, memories, and queries at a glance.</p>
      </div>

      {(workspaceError || historyError) && (
        <div className="status-card error" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <AlertCircle size={18} /><span>{workspaceError || historyError}</span>
        </div>
      )}

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" style={{ padding: '12px 24px' }} onClick={() => navigate('/app/upload')} type="button">
          <Upload size={18} /> Upload Document
        </button>
        <button className="btn btn-secondary" style={{ padding: '12px 24px', border: '2px solid var(--color-accent)', color: 'var(--color-accent)' }} onClick={() => navigate('/app/chat')} type="button">
          <MessageSquare size={18} /> AI Chat
        </button>
        <button className="btn btn-secondary" style={{ padding: '12px 24px', border: '2px solid #6366f1', color: '#6366f1' }} onClick={() => navigate('/app/insights')} type="button">
          <Sparkles size={18} /> Insight Engine
        </button>
        <button className="btn btn-secondary" style={{ padding: '12px 24px', border: '2px solid #8b5cf6', color: '#8b5cf6' }} onClick={() => navigate('/app/agent')} type="button">
          <Cpu size={18} /> Agent Studio
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div className="stat-card" key={s.label} style={{
              background: i === 3 ? 'linear-gradient(135deg, #eef2ff, #f5f3ff)' : undefined,
              border: i === 3 ? '1.5px solid #c7d2fe' : undefined,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="stat-label">{s.label}</span>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={19} />
                </div>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-subtext">{s.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Latest Processed Doc banner */}
      <div className="card" style={{ marginBottom: 'var(--spacing-xl)', borderLeft: '4px solid var(--color-accent)' }}>
        {latestProcessedDocument ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={22} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600 }}>Last Processed: {latestProcessedDocument.name}</div>
                <div className="inline-muted">
                  {latestProcessedDocument.chunks || 0} chunks · Ready for AI Chat · {formatRelativeTime(latestProcessedDocument.processedDate || latestProcessedDocument.uploadDate)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app/insights')} type="button">
                <Sparkles size={13} /> Insights
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app/chat')} type="button">
                Chat <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600 }}>No processed documents yet</div>
              <div className="inline-muted">Upload and process a document to unlock AI Chat, Insights, and Agent Mode.</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app/upload')} type="button">
              Upload <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Semantic Memory teaser */}
      {memStats.total > 0 && (
        <div className="card" style={{ marginBottom: 'var(--spacing-xl)', background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', border: '1.5px solid #c7d2fe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Brain size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#4338ca' }}>Semantic Memory Active</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: '#6366f1' }}>
                {memStats.total} memory entries across {memStats.uniqueDocs} document(s) · {memStats.totalRecalls} recalls · avg {memStats.avgConfidence}% confidence
              </div>
            </div>
            <button className="btn btn-sm" onClick={() => navigate('/app/agent')} type="button"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', flexShrink: 0 }}>
              <Brain size={13} /> Inspect Memory
            </button>
          </div>
        </div>
      )}

      {/* Recent Queries */}
      <div className="card">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} /> Recent Queries
        </div>
        {recentQueries.length === 0 ? (
          <div className="empty-state compact">
            <MessageSquare size={28} />
            <div>Your recent AI queries will appear here after you start chatting.</div>
          </div>
        ) : (
          recentQueries.map((q, i) => (
            <div key={q.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 0', borderBottom: i < recentQueries.length - 1 ? '1px solid var(--color-border-light)' : 'none', gap: 12
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  {q.agentMode && <Cpu size={12} style={{ color: '#6366f1', flexShrink: 0 }} />}
                  <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.query}</span>
                </div>
                <div className="inline-muted">{q.documentName} · {q.time}</div>
              </div>
              <div className="confidence-bar" style={{ width: 110 }}>
                <div className="confidence-bar-track">
                  <div className={`confidence-bar-fill ${q.confidence >= 90 ? 'high' : q.confidence >= 75 ? 'medium' : 'low'}`} style={{ width: `${q.confidence}%` }} />
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, minWidth: 32 }}>{q.confidence}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
