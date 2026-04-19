import { useNavigate } from 'react-router-dom'
import { FileText, MessageSquare, Upload, Zap, Clock, ArrowRight, CheckCircle } from 'lucide-react'

const stats = [
  { label: 'Documents Uploaded', value: '12', sub: '+3 this week', icon: FileText, color: 'var(--color-primary)' },
  { label: 'AI Queries', value: '47', sub: 'Last 30 days', icon: MessageSquare, color: 'var(--color-accent)' },
  { label: 'AI Accuracy', value: '93%', sub: 'Based on your feedback', icon: Zap, color: 'var(--color-warning)' },
]

const recentQueries = [
  { query: 'What are the key risks in Q3 report?', confidence: 94, time: '2 min ago', doc: 'Q3_Financial_Report.pdf' },
  { query: 'Summarize the compliance clauses', confidence: 88, time: '1 hr ago', doc: 'Compliance_Guidelines_v2.docx' },
  { query: 'What is the total contract value?', confidence: 72, time: '3 hr ago', doc: 'SLA_Agreement_2026.pdf' },
]

export default function UserDashboard() {
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in" id="user-dashboard">
      <div className="page-header">
        <h1>Welcome back, Syama 👋</h1>
        <p>Here's your document intelligence overview</p>
      </div>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 'var(--spacing-xl)' }}>
        <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: 15 }} onClick={() => navigate('/app/upload')} id="cta-upload">
          <Upload size={18} /> Upload New Document
        </button>
        <button className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: 15, border: '2px solid var(--color-accent)', color: 'var(--color-accent)' }} onClick={() => navigate('/app/chat')} id="cta-query">
          <MessageSquare size={18} /> Start AI Chat
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div className="stat-card" key={i}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="stat-label">{s.label}</span>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: i === 0 ? 'var(--color-primary-lighter)' : i === 1 ? 'var(--color-success-bg)' : 'var(--color-warning-bg)', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-subtext">{s.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Last Processed File */}
      <div className="card" style={{ marginBottom: 'var(--spacing-xl)', borderLeft: '4px solid var(--color-accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle size={22} style={{ color: 'var(--color-accent)' }} />
            <div>
              <div style={{ fontWeight: 600 }}>Last Processed: Q3_Financial_Report.pdf</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>23 chunks · Ready for AI Query · Processed 2 min ago</div>
            </div>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app/chat')}>
            Query this doc <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Recent Queries */}
      <div className="card">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} /> Recent Queries
        </div>
        {recentQueries.map((q, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < recentQueries.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{q.query}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                📄 {q.doc} · {q.time}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="confidence-bar" style={{ width: 120 }}>
                <div className="confidence-bar-track">
                  <div className={`confidence-bar-fill ${q.confidence >= 90 ? 'high' : q.confidence >= 75 ? 'medium' : 'low'}`} style={{ width: `${q.confidence}%` }} />
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, minWidth: 35 }}>{q.confidence}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
