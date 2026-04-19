import { BarChart3, TrendingUp, FileText, MessageSquare, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'

const queryData = [
  { day: 'Mon', queries: 4 }, { day: 'Tue', queries: 7 },
  { day: 'Wed', queries: 5 }, { day: 'Thu', queries: 9 },
  { day: 'Fri', queries: 12 }, { day: 'Sat', queries: 3 }, { day: 'Sun', queries: 7 },
]

const accuracyData = [
  { week: 'W1', accuracy: 78 }, { week: 'W2', accuracy: 82 },
  { week: 'W3', accuracy: 86 }, { week: 'W4', accuracy: 91 }, { week: 'W5', accuracy: 93 },
]

const topDocs = [
  { name: 'Q3 Financial Report', queries: 18 },
  { name: 'Compliance Guidelines', queries: 14 },
  { name: 'SLA Agreement', queries: 9 },
  { name: 'Vendor Contract', queries: 6 },
]

const feedbackBreakdown = [
  { name: 'Accepted', value: 28, color: '#10b981' },
  { name: 'Edited', value: 4, color: '#f59e0b' },
  { name: 'Rejected', value: 2, color: '#ef4444' },
]

export default function UserAnalytics() {
  return (
    <div className="animate-fade-in" id="user-analytics">
      <div className="page-header">
        <h1>My Analytics</h1>
        <p>Your personal query and document insights</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Queries</span>
          <div className="stat-value">47</div>
          <div className="stat-subtext" style={{ color: 'var(--color-primary)' }}>This month</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg. Accuracy</span>
          <div className="stat-value">93%</div>
          <div className="stat-subtext" style={{ color: 'var(--color-accent)' }}>↑ 5% improvement</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Feedback Given</span>
          <div className="stat-value">34</div>
          <div className="stat-subtext" style={{ color: 'var(--color-accent)' }}>82% accepted</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {/* Query Volume Chart */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={16} /> Query Volume (This Week)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={queryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="queries" fill="var(--color-primary)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy Trend */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} /> Accuracy Trend
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis domain={[70, 100]} fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="accuracy" stroke="var(--color-accent)" fill="var(--color-success-bg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        {/* Most Used Documents */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} /> Most Queried Documents
          </div>
          {topDocs.map((doc, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < topDocs.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--color-primary-lighter)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>{i + 1}</div>
              <span style={{ flex: 1, fontWeight: 500 }}>{doc.name}</span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{doc.queries} queries</span>
            </div>
          ))}
        </div>

        {/* Feedback Breakdown */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={16} /> Feedback Breakdown
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={feedbackBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {feedbackBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
            {feedbackBreakdown.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-sm)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.color }}></div>
                {f.name} ({f.value})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
