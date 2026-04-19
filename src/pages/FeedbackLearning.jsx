import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Edit3, Check, X, TrendingUp, MessageSquare, RotateCcw } from 'lucide-react'

const feedbackData = [
  {
    id: 1,
    query: 'What are the key risks in Q3 report?',
    answer: 'Based on the Q3 Financial Report, there are 4 key risk factors: supply chain disruptions, regulatory changes, currency fluctuation, and cybersecurity threats.',
    confidence: 94,
    timestamp: '2 min ago',
    feedback: 'accepted',
    improved: false
  },
  {
    id: 2,
    query: 'Summarize the compliance clauses',
    answer: 'The compliance document outlines 12 key clauses covering data protection, audit requirements, reporting obligations, and penalty structures.',
    confidence: 88,
    timestamp: '14 min ago',
    feedback: null,
    improved: false
  },
  {
    id: 3,
    query: 'What is the total contract value?',
    answer: 'The total contract value across all vendor agreements is $8.4M annually.',
    confidence: 72,
    timestamp: '1 hr ago',
    feedback: 'rejected',
    editedAnswer: 'The total contract value across all vendor agreements is $9.2M annually, including the Q4 amendment.',
    improved: true
  },
  {
    id: 4,
    query: 'Compare v1 and v2 of the SLA doc',
    answer: 'Version 2 of the SLA includes updated uptime requirements (99.9% → 99.95%), new penalty clauses, and expanded support hours.',
    confidence: 97,
    timestamp: '1 hr ago',
    feedback: 'accepted',
    improved: false
  },
  {
    id: 5,
    query: 'List all vendor names',
    answer: 'Vendors identified: Acme Corp, GlobalTech Solutions, DataFlow Inc, SecureNet Ltd, CloudBase Systems.',
    confidence: 91,
    timestamp: '2 hr ago',
    feedback: 'accepted',
    improved: false
  },
]

export default function FeedbackLearning() {
  const [data, setData] = useState(feedbackData)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const handleFeedback = (id, type) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, feedback: type } : item
    ))
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditText(item.editedAnswer || item.answer)
  }

  const saveEdit = (id) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, editedAnswer: editText, feedback: 'edited', improved: true } : item
    ))
    setEditingId(null)
  }

  const accepted = data.filter(d => d.feedback === 'accepted').length
  const rejected = data.filter(d => d.feedback === 'rejected').length
  const edited = data.filter(d => d.feedback === 'edited').length
  const improved = data.filter(d => d.improved).length

  return (
    <div className="animate-fade-in" id="feedback-page">
      <div className="page-header">
        <h1>Feedback & Learning</h1>
        <p>Help the system self-improve through your feedback</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card">
          <div className="stat-label">Total Queries</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{data.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">👍 Accepted</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-success)' }}>{accepted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">👎 Rejected</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-error)' }}>{rejected}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">✍️ Edited</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-info)' }}>{edited}</div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="card">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={16} /> Query History
          </div>
          <button className="btn btn-primary btn-sm">
            <RotateCcw size={14} /> Trigger Reprocessing
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {data.map(item => (
            <div key={item.id} style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-light)',
              background: item.improved ? 'var(--color-success-bg)' : 'var(--color-bg)',
              transition: 'all var(--transition-base)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.query}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{item.timestamp}</span>
                  <span className={`badge ${item.confidence >= 90 ? 'badge-success' : item.confidence >= 70 ? 'badge-warning' : 'badge-error'}`}>
                    {item.confidence}%
                  </span>
                </div>
              </div>

              {editingId === item.id ? (
                <div style={{ marginBottom: 8 }}>
                  <textarea
                    className="form-input"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={3}
                    style={{ fontSize: '0.8125rem' }}
                  />
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(item.id)}>
                      <Check size={14} /> Save
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>
                  {item.editedAnswer || item.answer}
                  {item.improved && (
                    <span className="badge badge-success" style={{ marginLeft: 8, fontSize: '0.6875rem' }}>
                      <TrendingUp size={10} /> Improved
                    </span>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className={`btn btn-sm ${item.feedback === 'accepted' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleFeedback(item.id, 'accepted')}
                >
                  <ThumbsUp size={14} /> Accept
                </button>
                <button
                  className={`btn btn-sm ${item.feedback === 'rejected' ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={() => handleFeedback(item.id, 'rejected')}
                >
                  <ThumbsDown size={14} /> Reject
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => startEdit(item)}
                >
                  <Edit3 size={14} /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
