import { BarChart3, TrendingUp, Target, MessageSquare, ThumbsUp } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const queryTrend = [
  { day: 'Mon', queries: 12, success: 11 },
  { day: 'Tue', queries: 19, success: 17 },
  { day: 'Wed', queries: 15, success: 14 },
  { day: 'Thu', queries: 22, success: 20 },
  { day: 'Fri', queries: 28, success: 26 },
  { day: 'Sat', queries: 8, success: 7 },
  { day: 'Sun', queries: 5, success: 5 },
]

const confidenceTrend = [
  { week: 'W1', confidence: 78 },
  { week: 'W2', confidence: 82 },
  { week: 'W3', confidence: 80 },
  { week: 'W4', confidence: 85 },
  { week: 'W5', confidence: 87 },
  { week: 'W6', confidence: 89 },
  { week: 'W7', confidence: 91 },
  { week: 'W8', confidence: 91 },
]

const topTopics = [
  { topic: 'Financial Reports', count: 34 },
  { topic: 'Compliance', count: 28 },
  { topic: 'Risk Assessment', count: 22 },
  { topic: 'Vendor Contracts', count: 18 },
  { topic: 'SLA Documents', count: 14 },
]

const feedbackTrend = [
  { month: 'Jan', accepted: 62, rejected: 22, edited: 8 },
  { month: 'Feb', accepted: 70, rejected: 18, edited: 10 },
  { month: 'Mar', accepted: 78, rejected: 14, edited: 12 },
  { month: 'Apr', accepted: 85, rejected: 8, edited: 6 },
]

const pieData = [
  { name: 'Accepted', value: 295, color: '#2e7d32' },
  { name: 'Rejected', value: 62, color: '#c62828' },
  { name: 'Edited', value: 36, color: '#1565c0' },
  { name: 'Pending', value: 18, color: '#bdbdbd' },
]

export default function Analytics() {
  return (
    <div className="animate-fade-in" id="analytics-page">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Measure system intelligence and performance over time</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Query Success Rate</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-success)' }}>93.4%</div>
          <div className="stat-subtext">↑ 2.1% from last week</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Confidence</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)' }}>91%</div>
          <div className="stat-subtext">↑ 4% this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Feedback Score</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-info)' }}>4.6/5</div>
          <div className="stat-subtext">Based on 393 responses</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Self-Improvement</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-primary)' }}>+12%</div>
          <div className="stat-subtext">Accuracy gain from feedback</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {/* Query Volume Chart */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={16} /> Query Volume (This Week)
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={queryTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#8a95a3' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8a95a3' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e6ea', fontSize: 13 }}
                />
                <Bar dataKey="queries" fill="#4caf50" radius={[4,4,0,0]} name="Total" />
                <Bar dataKey="success" fill="#2e7d32" radius={[4,4,0,0]} name="Successful" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Trend */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} /> Confidence Trend
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <AreaChart data={confidenceTrend}>
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2e7d32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#8a95a3' }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 12, fill: '#8a95a3' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e6ea', fontSize: 13 }} />
                <Area type="monotone" dataKey="confidence" stroke="#2e7d32" strokeWidth={2.5} fill="url(#confGrad)" name="Confidence %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Feedback Breakdown */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThumbsUp size={16} /> Feedback Improvement
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={feedbackTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8a95a3' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8a95a3' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e6ea', fontSize: 13 }} />
                <Legend />
                <Line type="monotone" dataKey="accepted" stroke="#2e7d32" strokeWidth={2} name="Accepted" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="rejected" stroke="#c62828" strokeWidth={2} name="Rejected" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="edited" stroke="#1565c0" strokeWidth={2} name="Edited" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Topics */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={16} /> Most Asked Topics
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
            <div style={{ width: 160, height: 160 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              {topTopics.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', opacity: 1 - idx * 0.15 }}></div>
                  <span style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 500 }}>{t.topic}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
