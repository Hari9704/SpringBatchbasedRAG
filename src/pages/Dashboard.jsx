import { Activity, FileText, Cpu, Clock, Circle } from 'lucide-react'

const services = [
  { name: 'API Gateway', status: 'Running', ok: true },
  { name: 'Auth Service', status: 'Running', ok: true },
  { name: 'Document Service', status: 'Running', ok: true },
  { name: 'Query Service', status: 'Running', ok: true },
  { name: 'Batch Service', status: 'Processing', ok: 'processing' },
  { name: 'Feedback Service', status: 'Running', ok: true },
]

const recentQueries = [
  { id: 1, query: 'What are the key risks in Q3 report?', confidence: 94, time: '2 min ago', user: 'U' },
  { id: 2, query: 'Summarize the compliance clauses', confidence: 88, time: '14 min ago', user: 'A' },
  { id: 3, query: 'Compare v1 and v2 of the SLA doc', confidence: 97, time: '1 hr ago', user: 'U' },
  { id: 4, query: 'Extract all vendor names from contracts', confidence: 91, time: '2 hr ago', user: 'A' },
  { id: 5, query: 'What changed between audit reports?', confidence: 85, time: '3 hr ago', user: 'U' },
]

export default function Dashboard() {
  return (
    <div className="animate-fade-in" id="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>System overview & quick insights</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" id="stat-documents">
          <div className="stat-label">Total documents</div>
          <div className="stat-value">1,284</div>
          <div className="stat-subtext">+12 today</div>
        </div>
        <div className="stat-card" id="stat-batch">
          <div className="stat-label">Batch jobs run</div>
          <div className="stat-value">347</div>
          <div className="stat-subtext">Spring Batch</div>
        </div>
        <div className="stat-card" id="stat-accuracy">
          <div className="stat-label">AI accuracy</div>
          <div className="stat-value">91%</div>
          <div className="stat-subtext">↑ 3% this week</div>
        </div>
        <div className="stat-card" id="stat-queries">
          <div className="stat-label">Recent queries</div>
          <div className="stat-value">58</div>
          <div className="stat-subtext">Last 24 hours</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" id="service-health">
          <div className="card-title">Microservice health</div>
          <table>
            <tbody>
              {services.map(s => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`badge ${s.ok === true ? 'badge-success' : s.ok === 'processing' ? 'badge-processing' : 'badge-error'}`}>
                      <span className="badge-dot"></span>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" id="recent-queries">
          <div className="card-title">Recent queries</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentQueries.map(q => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: q.user === 'U' ? 'var(--color-info-bg)' : 'var(--color-primary-lighter)',
                  color: q.user === 'U' ? 'var(--color-info)' : 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                }}>
                  {q.user}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: 2 }}>{q.query}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Confidence: {q.confidence}% · {q.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
