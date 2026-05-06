import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Brain, FileText, AlertCircle, Loader, RefreshCw,
  MessageSquare, ChevronRight, Zap, Globe, BarChart2, Hash,
  Star, HelpCircle, BookOpen, Target, Trash2, Clock, CheckCircle,
} from 'lucide-react'
import { useUserWorkspace } from '../../context/UserWorkspaceContext'
import { generateDocumentInsights } from '../../lib/gemini'
import { getInsights, saveInsights, clearInsights } from '../../lib/localStore'
import { getSettings } from '../../lib/localStore'

const SENTIMENT_COLOR = { positive: '#10b981', neutral: '#6366f1', negative: '#ef4444' }
const SENTIMENT_BG    = { positive: '#ecfdf5', neutral: '#eef2ff', negative: '#fef2f2' }
const ENTITY_COLOR    = {
  person: '#6366f1', organization: '#f59e0b', concept: '#10b981',
  location: '#3b82f6', metric: '#ef4444', technology: '#8b5cf6',
}

function InsightBadge({ label, color = '#6366f1', bg = '#eef2ff' }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
      background: bg, color, border: `1px solid ${color}22`, whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

function InsightCard({ number, text, color }) {
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '14px 18px', borderRadius: 12,
      background: '#fff', border: `1.5px solid ${color}22`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.15s, box-shadow 0.2s',
    }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${color}22` }}
      onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 10, background: color,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
      }}>{number}</div>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{text}</p>
    </div>
  )
}

const INSIGHT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6']

function KnowledgeMap({ topics = [], entities = [] }) {
  const nodes = [
    ...topics.slice(0, 4).map((t, i) => ({ label: t, type: 'topic', idx: i })),
    ...entities.slice(0, 5).map((e, i) => ({ label: e.name, type: e.type, idx: i + 4 })),
  ]
  if (!nodes.length) return null

  return (
    <div style={{ position: 'relative', height: 180, background: '#f8fafc', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
      <div style={{ position: 'absolute', top: 8, left: 12, fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Knowledge Map
      </div>
      {nodes.map((node, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2
        const r = node.type === 'topic' ? 55 : 72
        const cx = 50 + r * Math.cos(angle) * 0.9
        const cy = 50 + r * Math.sin(angle) * 0.9
        const color = ENTITY_COLOR[node.type] || INSIGHT_COLORS[i % INSIGHT_COLORS.length]
        return (
          <div key={i} style={{
            position: 'absolute', left: `${cx}%`, top: `${cy}%`,
            transform: 'translate(-50%, -50%)',
            padding: '5px 10px', borderRadius: 20, background: color,
            color: '#fff', fontSize: '0.68rem', fontWeight: 600, whiteSpace: 'nowrap',
            boxShadow: `0 3px 10px ${color}44`, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis',
            zIndex: 2,
          }}>
            {node.label.slice(0, 16)}
          </div>
        )
      })}
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3,
        boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
      }}>
        <Brain size={18} color="#fff" />
      </div>
    </div>
  )
}

export default function InsightEngine() {
  const navigate = useNavigate()
  const { processedDocuments, loading } = useUserWorkspace()
  const [selectedId, setSelectedId] = useState(null)
  const [insights, setInsights] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const selectedDoc = useMemo(
    () => processedDocuments.find(d => d.id === selectedId) || processedDocuments[0] || null,
    [processedDocuments, selectedId]
  )

  useEffect(() => {
    if (selectedDoc) {
      setInsights(getInsights(selectedDoc.id))
      setError('')
    }
  }, [selectedDoc?.id])

  const hasApiKey = Boolean(getSettings().apiKey)

  const handleGenerate = useCallback(async () => {
    if (!selectedDoc?.chunkList?.length) {
      setError('Document has no content chunks. Please reprocess it.')
      return
    }
    if (!hasApiKey) {
      setError('No API key configured. Go to Settings → API Keys.')
      return
    }
    setGenerating(true)
    setError('')
    try {
      const result = await generateDocumentInsights({
        documentName: selectedDoc.name,
        chunks: selectedDoc.chunkList,
      })
      saveInsights(selectedDoc.id, result)
      setInsights(result)
    } catch (err) {
      setError(err.message || 'Failed to generate insights.')
    } finally {
      setGenerating(false)
    }
  }, [selectedDoc, hasApiKey])

  const handleClear = () => {
    if (!selectedDoc) return
    clearInsights(selectedDoc.id)
    setInsights(null)
  }

  if (loading) return (
    <div className="animate-fade-in">
      <div className="page-header"><h1>Insight Engine</h1><p>Loading…</p></div>
      <div className="card empty-state"><Loader size={24} className="spin" /><div>Loading documents…</div></div>
    </div>
  )

  if (!processedDocuments.length) return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={24} style={{ color: '#6366f1' }} /> Insight Engine
        </h1>
        <p>AI-powered deep analysis of your documents — summaries, entities, knowledge maps, and more.</p>
      </div>
      <div className="card empty-state">
        <div className="empty-state-icon-wrap"><FileText size={32} /></div>
        <h2>No processed documents yet</h2>
        <p>Upload and process a document to unlock AI-powered insights.</p>
        <button className="btn btn-primary" onClick={() => navigate('/app/upload')} type="button">
          Upload a Document
        </button>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in" id="insight-engine" style={{ maxWidth: 1100 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={24} style={{ color: '#6366f1' }} /> Insight Engine
          </h1>
          <p>Gemini-powered deep document intelligence: summaries, entities, knowledge maps, and suggested queries.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {insights && (
            <button className="btn btn-sm btn-secondary" onClick={handleClear} type="button">
              <Trash2 size={14} /> Clear
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={generating || !hasApiKey}
            type="button"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {generating
              ? <><Loader size={16} className="spin" /> Analyzing…</>
              : insights
                ? <><RefreshCw size={16} /> Regenerate</>
                : <><Sparkles size={16} /> Generate Insights</>}
          </button>
        </div>
      </div>

      {/* API Key warning */}
      {!hasApiKey && (
        <div className="status-card" style={{ marginBottom: 'var(--spacing-md)', background: 'var(--color-warning-bg)', borderColor: 'rgba(245,158,11,0.3)' }}>
          <AlertCircle size={18} style={{ color: '#f59e0b' }} />
          <span style={{ flex: 1 }}><strong>API key required</strong> to generate insights.</span>
          <button className="btn btn-sm" onClick={() => navigate('/app/settings')} type="button" style={{ background: '#f59e0b', color: '#fff' }}>
            Add API Key
          </button>
        </div>
      )}

      {error && (
        <div className="status-card error" style={{ marginBottom: 'var(--spacing-md)' }}>
          <AlertCircle size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button className="btn btn-sm btn-secondary" onClick={() => setError('')} type="button">Dismiss</button>
        </div>
      )}

      {/* Document Selector */}
      {processedDocuments.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
          {processedDocuments.map(doc => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setSelectedId(doc.id)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: '1.5px solid',
                borderColor: (selectedId ?? processedDocuments[0].id) === doc.id ? '#6366f1' : 'var(--color-border)',
                background: (selectedId ?? processedDocuments[0].id) === doc.id ? '#eef2ff' : 'transparent',
                color: (selectedId ?? processedDocuments[0].id) === doc.id ? '#4338ca' : 'var(--color-text-secondary)',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <FileText size={13} /> {doc.name}
              {getInsights(doc.id) && <CheckCircle size={12} style={{ color: '#10b981' }} />}
            </button>
          ))}
        </div>
      )}

      {/* Empty — no insights yet */}
      {!insights && !generating && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={32} color="#6366f1" />
          </div>
          <h3 style={{ marginBottom: 8 }}>No insights yet for <em>{selectedDoc?.name}</em></h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, maxWidth: 440, margin: '0 auto 20px' }}>
            Click <strong>Generate Insights</strong> to let Gemini analyze this document and extract a deep intelligence report.
          </p>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={!hasApiKey} type="button"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Sparkles size={16} /> Generate Insights
          </button>
        </div>
      )}

      {/* Generating skeleton */}
      {generating && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
          <Loader size={36} className="spin" style={{ color: '#6366f1', marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8, color: '#6366f1' }}>Gemini is analyzing your document…</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Extracting insights, entities, and knowledge map. This takes 5–15 seconds.</p>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {['Summarizing…', 'Extracting entities…', 'Mapping concepts…', 'Generating questions…'].map((s, i) => (
              <span key={s} style={{
                padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 500,
                background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe',
                opacity: generating ? 1 : 0.5, animation: `fadeInUp 0.4s ${i * 0.2}s both`,
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Insights Display */}
      {insights && !generating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

          {/* Summary + Meta row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, alignItems: 'stretch' }}>
            <div className="card" style={{ borderLeft: '4px solid #6366f1', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <BookOpen size={16} color="#6366f1" />
                <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Summary</span>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: 'var(--color-text-secondary)', margin: 0 }}>
                {insights.summary || 'No summary generated.'}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 8 }}>
                {(insights.topics || []).slice(0, 5).map(t => (
                  <InsightBadge key={t} label={t} color="#6366f1" bg="#eef2ff" />
                ))}
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Document Profile</div>
              {[
                {
                  label: 'Type',
                  value: insights.documentType || 'N/A',
                  icon: FileText, color: '#6366f1',
                },
                {
                  label: 'Sentiment',
                  value: insights.sentiment || 'neutral',
                  icon: Target,
                  color: SENTIMENT_COLOR[insights.sentiment] || '#6366f1',
                  bg: SENTIMENT_BG[insights.sentiment] || '#eef2ff',
                },
                {
                  label: 'Complexity',
                  value: `${insights.complexityScore || '–'}/10`,
                  icon: BarChart2, color: '#f59e0b',
                },
                {
                  label: 'AI Model',
                  value: insights.model || 'Gemini',
                  icon: Brain, color: '#8b5cf6',
                },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: bg || `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{label}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 4, fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} />
                {insights.generatedAt ? new Date(insights.generatedAt).toLocaleString() : ''}
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Star size={16} color="#f59e0b" />
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Key Insights</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{(insights.keyInsights || []).length} insights</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(insights.keyInsights || []).map((insight, i) => (
                <InsightCard key={i} number={i + 1} text={insight} color={INSIGHT_COLORS[i % INSIGHT_COLORS.length]} />
              ))}
            </div>
          </div>

          {/* Entities + Questions row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Entities */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Globe size={16} color="#10b981" />
                <span style={{ fontWeight: 700 }}>Detected Entities</span>
              </div>
              {(insights.entities || []).length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No entities detected.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(insights.entities || []).slice(0, 8).map((entity, i) => {
                    const color = ENTITY_COLOR[entity.type] || '#6366f1'
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0,
                          boxShadow: `0 0 4px ${color}66`,
                        }} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', flex: 1 }}>{entity.name}</span>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                          background: `${color}18`, color, textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>{entity.type}</span>
                        {entity.relevance && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', minWidth: 32 }}>{entity.relevance}%</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <HelpCircle size={16} color="#3b82f6" />
                <span style={{ fontWeight: 700 }}>Suggested Questions</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(insights.suggestedQuestions || []).map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => navigate('/app/chat')}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                      borderRadius: 8, border: '1px solid var(--color-border)',
                      background: '#f8fafc', cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all 0.15s', color: 'var(--color-text-secondary)',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#93c5fd' }}
                    onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
                  >
                    <MessageSquare size={13} style={{ color: '#3b82f6', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>{q}</span>
                    <ChevronRight size={13} style={{ color: '#93c5fd', marginLeft: 'auto', flexShrink: 0, marginTop: 2 }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Knowledge Map + Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Zap size={16} color="#8b5cf6" />
                <span style={{ fontWeight: 700 }}>Concept Knowledge Map</span>
              </div>
              <KnowledgeMap topics={insights.topics || []} entities={insights.entities || []} />
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Hash size={16} color="#ef4444" />
                <span style={{ fontWeight: 700 }}>Key Metrics & Data</span>
              </div>
              {(insights.keyMetrics || []).length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No numeric data found in document.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(insights.keyMetrics || []).slice(0, 6).map((m, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', borderRadius: 8, background: '#fef2f2',
                      border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 500 }}>{m}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 8, background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Document Stats</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1' }}>{selectedDoc?.chunks || 0}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Chunks</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{(insights.entities || []).length}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Entities</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>{(insights.keyInsights || []).length}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Insights</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
