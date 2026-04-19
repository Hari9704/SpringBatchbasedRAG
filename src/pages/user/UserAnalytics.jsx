import { useEffect, useMemo, useState } from 'react'
import { BarChart3, TrendingUp, FileText, MessageSquare, Star, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { useUserWorkspace } from '../../context/UserWorkspaceContext'
import { DEFAULT_USER_ID, fetchDocumentStats, fetchFeedback, fetchQueryHistory, fetchQueryStats } from '../../lib/api'

function parseTs(value) {
  if (!value) {
    return null
  }

  const t = new Date(value).getTime()
  return Number.isNaN(t) ? null : t
}

function buildLast7DayVolume(history) {
  const now = new Date()
  const buckets = []

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const start = d.getTime()
    buckets.push({
      day: d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' }),
      start,
      end: start + 86400000,
      queries: 0,
    })
  }

  for (const row of history) {
    const ts = parseTs(row.timestamp)
    if (ts == null) {
      continue
    }

    const bucket = buckets.find((b) => ts >= b.start && ts < b.end)
    if (bucket) {
      bucket.queries += 1
    }
  }

  return buckets.map(({ day, queries }) => ({ day, queries }))
}

function buildConfidenceTrend(history) {
  const sorted = [...history]
    .filter((row) => row.confidenceScore != null)
    .sort((a, b) => (parseTs(a.timestamp) || 0) - (parseTs(b.timestamp) || 0))
    .slice(-8)

  return sorted.map((row, index) => ({
    label: `Q${index + 1}`,
    accuracy: Math.min(100, Math.max(0, Number(row.confidenceScore) || 0)),
  }))
}

function buildTopDocuments(history, documents) {
  const tally = new Map()
  for (const row of history) {
    if (!row.documentId) {
      continue
    }

    tally.set(row.documentId, (tally.get(row.documentId) || 0) + 1)
  }

  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([documentId, queries]) => {
      const doc = documents.find((d) => d.id === documentId)
      return {
        name: doc?.name || `Document #${documentId}`,
        queries,
      }
    })
}

function buildFeedbackPie(feedbackList) {
  const tally = { ACCEPTED: 0, EDITED: 0, REJECTED: 0 }
  for (const row of feedbackList) {
    const action = row.action
    if (action && tally[action] !== undefined) {
      tally[action] += 1
    }
  }

  return [
    { name: 'Accepted', value: tally.ACCEPTED, color: '#10b981' },
    { name: 'Edited', value: tally.EDITED, color: '#f59e0b' },
    { name: 'Rejected', value: tally.REJECTED, color: '#ef4444' },
  ].filter((slice) => slice.value > 0)
}

export default function UserAnalytics() {
  const { documents } = useUserWorkspace()
  const [queryHistory, setQueryHistory] = useState([])
  const [feedbackList, setFeedbackList] = useState([])
  const [docStats, setDocStats] = useState({ totalDocuments: 0, processedDocuments: 0 })
  const [queryStats, setQueryStats] = useState({ totalQueries: 0 })
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const [history, feedback, stats, qStats] = await Promise.all([
          fetchQueryHistory(DEFAULT_USER_ID),
          fetchFeedback().catch(() => []),
          fetchDocumentStats(DEFAULT_USER_ID),
          fetchQueryStats(DEFAULT_USER_ID),
        ])

        if (cancelled) {
          return
        }

        setQueryHistory(Array.isArray(history) ? history : [])
        setFeedbackList(Array.isArray(feedback) ? feedback : [])
        setDocStats({
          totalDocuments: stats?.totalDocuments ?? 0,
          processedDocuments: stats?.processedDocuments ?? 0,
        })
        setQueryStats({ totalQueries: qStats?.totalQueries ?? 0 })
        setLoadError('')
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message || 'Unable to load analytics.')
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  const queryData = useMemo(() => buildLast7DayVolume(queryHistory), [queryHistory])
  const accuracyData = useMemo(() => buildConfidenceTrend(queryHistory), [queryHistory])
  const topDocs = useMemo(() => buildTopDocuments(queryHistory, documents), [documents, queryHistory])
  const feedbackBreakdown = useMemo(() => buildFeedbackPie(feedbackList), [feedbackList])

  const totalFeedback = feedbackBreakdown.reduce((sum, slice) => sum + slice.value, 0)
  const acceptedShare = totalFeedback
    ? Math.round((feedbackBreakdown.find((f) => f.name === 'Accepted')?.value || 0) * 100 / totalFeedback)
    : null

  const avgConfidence = queryHistory.length
    ? Math.round(queryHistory.reduce((sum, row) => sum + (Number(row.confidenceScore) || 0), 0) / queryHistory.length)
    : null

  return (
    <div className="animate-fade-in" id="user-analytics">
      <div className="page-header">
        <h1>My Analytics</h1>
        <p>Live metrics from your documents, queries, and feedback.</p>
      </div>

      {loadError ? (
        <div className="status-card error" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <AlertCircle size={18} />
          <span>{loadError}</span>
        </div>
      ) : null}

      <div className="stats-grid">
        <div className="stat-card stat-card-accent-blue">
          <span className="stat-label">Total Queries</span>
          <div className="stat-value">{queryStats.totalQueries}</div>
          <div className="stat-subtext" style={{ color: 'var(--color-royal)' }}>All time (this workspace)</div>
        </div>
        <div className="stat-card stat-card-accent-green">
          <span className="stat-label">Documents</span>
          <div className="stat-value">{docStats.totalDocuments}</div>
          <div className="stat-subtext" style={{ color: 'var(--color-accent)' }}>
            {docStats.processedDocuments} processed
          </div>
        </div>
        <div className="stat-card stat-card-accent-warm">
          <span className="stat-label">Avg. answer confidence</span>
          <div className="stat-value">{avgConfidence != null ? `${avgConfidence}%` : '—'}</div>
          <div className="stat-subtext" style={{ color: 'var(--color-primary)' }}>
            {queryHistory.length ? 'From saved query history' : 'Run AI Chat to populate'}
          </div>
        </div>
        <div className="stat-card stat-card-accent-violet">
          <span className="stat-label">Feedback items</span>
          <div className="stat-value">{totalFeedback}</div>
          <div className="stat-subtext" style={{ color: 'var(--color-processing)' }}>
            {acceptedShare != null ? `${acceptedShare}% accepted` : 'No feedback yet'}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="card card-surface-blue">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={16} /> Query volume (last 7 days)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={queryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="queries" fill="var(--color-royal)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-surface-mint">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} /> Confidence from recent answers
          </div>
          {accuracyData.length === 0 ? (
            <div className="empty-state compact" style={{ minHeight: 200 }}>
              <MessageSquare size={28} />
              <div>No query history with confidence scores yet.</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="accuracy" stroke="var(--color-accent)" fill="var(--color-ice)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} /> Most queried documents
          </div>
          {topDocs.length === 0 ? (
            <div className="empty-state compact">
              <FileText size={28} />
              <div>Query documents in AI Chat to see rankings here.</div>
            </div>
          ) : (
            topDocs.map((doc, i) => (
              <div key={doc.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < topDocs.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: i % 2 === 0 ? 'var(--color-ice)' : 'var(--color-primary-lighter)', color: i % 2 === 0 ? 'var(--color-royal)' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>{i + 1}</div>
                <span style={{ flex: 1, fontWeight: 500 }}>{doc.name}</span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{doc.queries} queries</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={16} /> Feedback breakdown
          </div>
          {feedbackBreakdown.length === 0 ? (
            <div className="empty-state compact" style={{ minHeight: 200 }}>
              <Star size={28} />
              <div>No feedback submitted yet.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={feedbackBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {feedbackBreakdown.map((entry, i) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, flexWrap: 'wrap' }}>
                {feedbackBreakdown.map((f) => (
                  <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-sm)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.color }}></div>
                    {f.name} ({f.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
