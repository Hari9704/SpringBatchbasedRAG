import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, MessageSquare, Upload, Zap, Clock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import { useUserWorkspace } from '../../context/UserWorkspaceContext'
import { fetchQueryHistory } from '../../lib/api'

function formatRelativeTime(dateText) {
  if (!dateText) {
    return 'Unknown time'
  }

  const deltaInMinutes = Math.round((Date.now() - new Date(dateText).getTime()) / 60000)

  if (deltaInMinutes < 1) {
    return 'Just now'
  }

  if (deltaInMinutes < 60) {
    return `${deltaInMinutes} min ago`
  }

  const deltaInHours = Math.round(deltaInMinutes / 60)
  if (deltaInHours < 24) {
    return `${deltaInHours} hr ago`
  }

  return `${Math.round(deltaInHours / 24)} day ago`
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const [queryHistory, setQueryHistory] = useState([])
  const [historyError, setHistoryError] = useState('')
  const [displayName] = useState(() => sessionStorage.getItem('docintell-display-name') || '')
  const { documents, processedDocuments, workspaceError } = useUserWorkspace()

  useEffect(() => {
    fetchQueryHistory()
      .then((history) => {
        setQueryHistory(history)
        setHistoryError('')
      })
      .catch((error) => {
        setHistoryError(error.message || 'Unable to load recent queries.')
      })
  }, [])

  const latestProcessedDocument = useMemo(() => (
    [...processedDocuments].sort((left, right) => (
      new Date(right.processedDate || right.uploadDate || 0).getTime()
      - new Date(left.processedDate || left.uploadDate || 0).getTime()
    ))[0]
  ), [processedDocuments])

  const recentQueries = useMemo(() => (
    queryHistory.slice(0, 5).map((query) => {
      const matchingDocument = documents.find((document) => document.id === query.documentId)
      return {
        id: query.id,
        query: query.question,
        confidence: query.confidenceScore,
        time: formatRelativeTime(query.timestamp),
        documentName: matchingDocument?.name || (query.documentId ? `Document #${query.documentId}` : 'All documents'),
      }
    })
  ), [documents, queryHistory])

  const stats = [
    {
      label: 'Documents Uploaded',
      value: String(documents.length),
      sub: `${processedDocuments.length} processed and ready`,
      icon: FileText,
      color: 'var(--color-primary)',
    },
    {
      label: 'AI Queries',
      value: String(queryHistory.length),
      sub: 'Recorded in query history',
      icon: MessageSquare,
      color: 'var(--color-accent)',
    },
    {
      label: 'Avg. Confidence',
      value: queryHistory.length
        ? `${Math.round(queryHistory.reduce((sum, item) => sum + item.confidenceScore, 0) / queryHistory.length)}%`
        : '--',
      sub: queryHistory.length ? 'Across recent answers' : 'Run a chat to measure confidence',
      icon: Zap,
      color: 'var(--color-warning)',
    },
  ]

  return (
    <div className="animate-fade-in" id="user-dashboard">
      <div className="page-header">
        <h1>Welcome back{displayName ? `, ${displayName}` : ''}</h1>
        <p>Here&apos;s your live document intelligence overview.</p>
      </div>

      {(workspaceError || historyError) ? (
        <div className="status-card error" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <AlertCircle size={18} />
          <span>{workspaceError || historyError}</span>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 16, marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: 15 }} onClick={() => navigate('/app/upload')} id="cta-upload" type="button">
          <Upload size={18} /> Upload New Document
        </button>
        <button className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: 15, border: '2px solid var(--color-accent)', color: 'var(--color-accent)' }} onClick={() => navigate('/app/chat')} id="cta-query" type="button">
          <MessageSquare size={18} /> Start AI Chat
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div className="stat-card" key={stat.label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="stat-label">{stat.label}</span>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: index === 0 ? 'var(--color-primary-lighter)' : index === 1 ? 'var(--color-ice)' : 'var(--color-warning-bg)', color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-subtext">{stat.sub}</div>
            </div>
          )
        })}
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-xl)', borderLeft: '4px solid var(--color-accent)' }}>
        {latestProcessedDocument ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={22} style={{ color: 'var(--color-accent)' }} />
              <div>
                <div style={{ fontWeight: 600 }}>Last Processed: {latestProcessedDocument.name}</div>
                <div className="inline-muted">
                  {latestProcessedDocument.chunks || 0} chunks · Ready for AI Chat · {formatRelativeTime(latestProcessedDocument.processedDate || latestProcessedDocument.uploadDate)}
                </div>
              </div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app/chat')} type="button">
              Query this doc <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 600 }}>No processed documents yet</div>
              <div className="inline-muted">Upload and process a document to unlock the RAG chatbot.</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app/upload')} type="button">
              Upload a document <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

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
          recentQueries.map((query, index) => (
            <div key={query.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: index < recentQueries.length - 1 ? '1px solid var(--color-border-light)' : 'none', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis' }}>{query.query}</div>
                <div className="inline-muted">
                  {query.documentName} · {query.time}
                </div>
              </div>
              <div className="confidence-bar" style={{ width: 120 }}>
                <div className="confidence-bar-track">
                  <div className={`confidence-bar-fill ${query.confidence >= 90 ? 'high' : query.confidence >= 75 ? 'medium' : 'low'}`} style={{ width: `${query.confidence}%` }} />
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, minWidth: 35 }}>{query.confidence}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
