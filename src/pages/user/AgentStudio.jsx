import { useEffect, useMemo, useState } from 'react'
import {
  Cpu, GitBranch, Wrench, Layers, Zap, RefreshCw, CheckCircle,
  ArrowRight, Brain, Search, Trash2, Clock, MessageCircle, Shield,
} from 'lucide-react'
import { AGENTS, AGENT_STATES } from '../../lib/agent'
import { listTools } from '../../lib/tools'
import { getAllMemories, clearMemories, getMemoryStats } from '../../lib/memory'

// ─── Constants ────────────────────────────────────────────────────────────────

const GRAPH_NODES = [
  { id: 'PLANNING',      label: 'Plan',       emoji: '🗺️', color: '#6366f1' },
  { id: 'MEMORY_RECALL', label: 'Memory',     emoji: '🧠', color: '#f59e0b' },
  { id: 'RETRIEVING',    label: 'Retrieve',   emoji: '🔍', color: '#3b82f6' },
  { id: 'ANALYZING',     label: 'Analyze',    emoji: '🧪', color: '#10b981' },
  { id: 'SYNTHESIZING',  label: 'Synthesize', emoji: '✍️', color: '#f97316' },
  { id: 'CRITIQUING',    label: 'Critic',     emoji: '🔬', color: '#ef4444' },
  { id: 'DONE',          label: 'Done',       emoji: '✅', color: '#22c55e' },
]

const TECH_STACK = [
  {
    category: 'AI & Agents', color: '#6366f1', bg: '#eef2ff',
    items: [
      { name: 'Google Gemini 2.0 Flash', role: 'LLM Backbone', desc: 'Primary model for Q&A, reasoning, and document synthesis. Auto-fallback chain across 6 model versions.' },
      { name: 'LangGraph (pattern)', role: 'State Machine', desc: 'Typed graph with 7 nodes (Plan→Memory→Retrieve→Analyze→Synthesize→Critique→Done) and exponential backoff on each edge.' },
      { name: 'CrewAI (pattern)', role: 'Multi-Agent Crew', desc: 'Orchestrator + 6 specialized agents collaborate via structured AutoGen-style HANDOFF messages.' },
      { name: 'AutoGen (pattern)', role: 'Agent Messaging', desc: 'Agents publish structured messages on a shared bus. UI visualizes the inter-agent conversation in real time.' },
    ]
  },
  {
    category: 'Memory & Storage', color: '#f59e0b', bg: '#fffbeb',
    items: [
      { name: 'Semantic Memory Store', role: 'Episodic Memory', desc: 'Persists agent-learned facts across sessions. Future queries recall relevant past knowledge to enrich context.' },
      { name: 'Insight Engine', role: 'Document Intelligence', desc: 'Gemini generates structured JSON insights: summary, entities, knowledge map, suggested questions.' },
      { name: 'localStorage Layer', role: 'Client Persistence', desc: 'Documents, queries, settings, memories, and insights stored locally — zero backend required.' },
    ]
  },
  {
    category: 'MCP & Tools', color: '#10b981', bg: '#f0fdf4',
    items: [
      { name: 'MCP Protocol (pattern)', role: 'Tool Registry', desc: 'Each tool has name, description, typed schema, and handler — identical to real MCP servers (Brave, GitHub, Filesystem).' },
      { name: 'searchChunks', role: 'Semantic Search', desc: 'Keyword + proximity scoring across document chunks. Called by Retriever agent.' },
      { name: 'extractFacts', role: 'Fact Extraction', desc: 'Sentence-level relevance scoring across top chunks. Called by Analyst agent.' },
      { name: 'detectSentiment + buildKnowledgeGraph', role: 'Analysis Tools', desc: 'Parallel tools run during analysis: sentiment scoring + entity co-occurrence graph construction.' },
    ]
  },
  {
    category: 'Core Backend', color: '#3b82f6', bg: '#eff6ff',
    items: [
      { name: 'Spring Boot 3.5', role: 'Microservice Runtime', desc: 'Powers api-gateway, auth-service, document-service, batch-service, query-service, analytics-service.' },
      { name: 'Spring Batch', role: 'RAG Pipeline Engine', desc: 'Chunking, embedding, validation — each pipeline step is a Batch Job step with retry/skip policies.' },
      { name: 'Spring Security + OAuth2', role: 'Auth Layer', desc: 'JWT auth, role-based access control, Spring Cloud Gateway rate limiting.' },
    ]
  },
]

// ─── Components ───────────────────────────────────────────────────────────────

function GraphDemo() {
  const [activeIdx, setActiveIdx] = useState(-1)
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState([])

  const runDemo = async () => {
    setRunning(true); setCompleted([]); setActiveIdx(-1)
    for (let i = 0; i < GRAPH_NODES.length; i++) {
      setActiveIdx(i)
      await new Promise(r => setTimeout(r, 620))
      setCompleted(prev => [...prev, i])
    }
    setActiveIdx(-1); setRunning(false)
  }

  return (
    <div style={{ background: '#0f172a', borderRadius: 14, padding: '1.5rem', border: '1px solid #1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontFamily: 'monospace' }}>LangGraph · AutoGen · CrewAI State Machine</span>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {['Exponential Backoff', 'Memory Recall', 'Critic Review', 'AutoGen Bus'].map(l => (
              <span key={l} style={{ padding: '2px 8px', borderRadius: 12, background: '#1e293b', border: '1px solid #334155', color: '#64748b', fontSize: '0.67rem' }}>{l}</span>
            ))}
          </div>
        </div>
        <button onClick={runDemo} disabled={running} type="button" style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
          borderRadius: 8, border: 'none', background: running ? '#1e293b' : '#6366f1',
          color: running ? '#64748b' : '#fff', fontSize: '0.8rem', fontWeight: 600,
          cursor: running ? 'not-allowed' : 'pointer',
        }}>
          {running ? <><RefreshCw size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Running…</> : <><Zap size={13} /> Run Pipeline</>}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
        {GRAPH_NODES.map((node, i) => {
          const isDone = completed.includes(i)
          const isActive = activeIdx === i
          return (
            <div key={node.id} style={{ display: 'flex', alignItems: 'center', flex: i < GRAPH_NODES.length - 1 ? '1' : 'none' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                padding: '10px 12px', borderRadius: 10, minWidth: 76, transition: 'all 0.3s',
                background: isActive ? `${node.color}22` : '#1e293b',
                border: `2px solid ${isActive ? node.color : isDone ? `${node.color}55` : '#334155'}`,
                boxShadow: isActive ? `0 0 20px ${node.color}44` : 'none',
              }}>
                <span style={{ fontSize: '1.2rem' }}>{isDone ? '✅' : node.emoji}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isActive ? node.color : isDone ? '#94a3b8' : '#64748b', whiteSpace: 'nowrap' }}>
                  {node.label}
                </span>
                {isActive && <span style={{ fontSize: '0.58rem', color: node.color, animation: 'pulse 0.9s infinite' }}>● live</span>}
              </div>
              {i < GRAPH_NODES.length - 1 && (
                <div style={{ flex: 1, height: 2, minWidth: 16, background: isDone && completed.includes(i + 1) ? '#6366f1' : '#334155', transition: 'background 0.5s', position: 'relative' }}>
                  <ArrowRight size={11} style={{ position: 'absolute', right: -5, top: -5, color: completed.includes(i + 1) ? '#6366f1' : '#334155' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Agent cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginTop: '1.25rem' }}>
        {Object.values(AGENTS).map(agent => (
          <div key={agent.name} style={{
            padding: '10px 12px', borderRadius: 8, background: '#1e293b',
            border: `1px solid ${agent.color}33`, display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            <span style={{ fontSize: '1.1rem' }}>{agent.emoji}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: agent.color }}>{agent.name}</span>
            <span style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.4 }}>{agent.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AutoGenChat() {
  const [session, setSession] = useState(null)
  const [expanded, setExpanded] = useState(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem('docintell-last-autogen')
      if (raw) setSession(JSON.parse(raw))
    } catch {}
  }, [])

  if (!session) return (
    <div className="card empty-state compact">
      <MessageCircle size={28} />
      <div>No agent run recorded yet. Use <strong>Agent Mode</strong> in AI Chat to see inter-agent conversations here.</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Session header */}
      <div className="card" style={{ background: '#0f172a', border: 'none', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'monospace', marginBottom: 4 }}>Last AutoGen Session</div>
            <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 4, fontSize: '0.9rem' }}>"{session.question}"</div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{session.documentName} · {new Date(session.timestamp).toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: session.qualityScore >= 65 ? '#4ade80' : '#f87171' }}>{session.qualityScore}</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Quality /100</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#94a3b8' }}>{(session.messages || []).length}</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Handoffs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent conversation */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={16} color="#6366f1" /> AutoGen Inter-Agent Messages
        </div>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {(session.messages || []).map((msg, i) => {
            const isExpanded = expanded.has(i)
            return (
              <div key={i} style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: i < session.messages.length - 1 ? 0 : 0 }}>
                {i < session.messages.length - 1 && (
                  <div style={{ position: 'absolute', left: 18, top: 42, bottom: -4, width: 2, background: 'var(--color-border-light)', zIndex: 0 }} />
                )}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: msg.fromColor || '#6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: '1rem', boxShadow: `0 2px 8px ${msg.fromColor || '#6366f1'}44`, zIndex: 1,
                }}>
                  {msg.fromEmoji}
                </div>
                <div style={{ flex: 1, paddingBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: msg.fromColor || '#6366f1' }}>{msg.from}</span>
                    <ArrowRight size={11} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{msg.toEmoji} {msg.to}</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.6,
                      background: '#f8fafc', borderRadius: 8, padding: '10px 12px',
                      border: '1px solid var(--color-border)',
                      cursor: msg.content.length > 120 ? 'pointer' : 'default',
                    }}
                    onClick={() => {
                      if (msg.content.length > 120) {
                        setExpanded(prev => {
                          const next = new Set(prev)
                          next.has(i) ? next.delete(i) : next.add(i)
                          return next
                        })
                      }
                    }}
                  >
                    {isExpanded || msg.content.length <= 120
                      ? msg.content
                      : msg.content.slice(0, 120) + '… '}
                    {msg.content.length > 120 && (
                      <span style={{ color: '#6366f1', fontWeight: 600 }}>{isExpanded ? ' less' : 'more'}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MemoryInspector() {
  const [search, setSearch] = useState('')
  const [memories, setMemories] = useState([])
  const [stats, setStats] = useState({})
  const [expanded, setExpanded] = useState(null)

  const refresh = () => {
    setMemories(getAllMemories())
    setStats(getMemoryStats())
  }
  useEffect(() => { refresh() }, [])

  const filtered = useMemo(() => {
    if (!search) return memories
    const q = search.toLowerCase()
    return memories.filter(m => m.question.toLowerCase().includes(q) || m.answerSummary.toLowerCase().includes(q))
  }, [memories, search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Memories', value: stats.total || 0, color: '#6366f1' },
          { label: 'Avg Confidence', value: `${stats.avgConfidence || 0}%`, color: '#10b981' },
          { label: 'Total Recalls', value: stats.totalRecalls || 0, color: '#f59e0b' },
          { label: 'Documents', value: stats.uniqueDocs || 0, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '1rem' }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search + Clear */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="form-input"
            placeholder="Search memories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button className="btn btn-sm btn-secondary" type="button" onClick={refresh}>
          <RefreshCw size={14} />
        </button>
        {memories.length > 0 && (
          <button className="btn btn-sm btn-secondary" type="button"
            onClick={() => { if (window.confirm('Clear all memories?')) { clearMemories(); refresh() } }}
            style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state compact">
          <Brain size={28} />
          <div>{memories.length === 0 ? 'No memories yet. Run Agent Mode queries to build the semantic memory store.' : 'No memories match your search.'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(m => (
            <div key={m.id} className="card" style={{ padding: '0.875rem 1rem', cursor: 'pointer', transition: 'all 0.15s' }}
              onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              onMouseOver={e => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem',
                }}>🧠</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.question}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{m.documentName}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>·</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={10} /> {new Date(m.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {expanded === m.id && (
                    <div style={{ marginTop: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, border: '1px solid var(--color-border)' }}>
                      {m.answerSummary}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flex: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700,
                    background: m.confidence >= 80 ? '#ecfdf5' : '#fff7ed',
                    color: m.confidence >= 80 ? '#059669' : '#d97706',
                  }}>{m.confidence}%</span>
                  {m.recallCount > 0 && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>recalled {m.recallCount}×</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ToolCard({ tool }) {
  return (
    <div style={{ padding: '1rem', borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ padding: 6, background: '#f0fdf4', borderRadius: 8 }}><Wrench size={14} color="#10b981" /></div>
        <code style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{tool.name}()</code>
      </div>
      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{tool.description}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {Object.keys(tool.schema).map(k => (
          <code key={k} style={{ fontSize: '0.68rem', padding: '2px 6px', background: '#f1f5f9', borderRadius: 4, color: '#475569' }}>
            {k}: {tool.schema[k]}
          </code>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AgentStudio() {
  const [activeTab, setActiveTab] = useState('graph')
  const tools = listTools()

  const tabs = [
    { id: 'graph',   label: 'Agent Graph',    icon: GitBranch },
    { id: 'autogen', label: 'AutoGen Chat',   icon: MessageCircle },
    { id: 'memory',  label: 'Memory Store',   icon: Brain },
    { id: 'tools',   label: 'MCP Tools',      icon: Wrench },
    { id: 'stack',   label: 'Tech Stack',     icon: Layers },
  ]

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Cpu size={26} style={{ color: 'var(--color-primary)' }} /> Agent Studio
        </h1>
        <p>Visualize the 7-node agentic pipeline, AutoGen inter-agent conversations, semantic memory store, and MCP tool registry.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {['LangGraph', 'CrewAI', 'AutoGen', 'MCP Protocol', 'Gemini 2.0', 'Semantic Memory', 'Critic Review', 'Spring Batch'].map(t => (
          <span key={t} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
            background: 'linear-gradient(135deg, var(--color-primary-lighter), #f0fdf4)',
            color: 'var(--color-primary-dark)', border: '1px solid rgba(249,115,22,0.2)',
          }}>{t}</span>
        ))}
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)} type="button">
              <Icon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
              {t.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'graph' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <GraphDemo />
          <div className="card" style={{ background: '#0f172a', border: 'none', padding: '1.25rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.75rem', fontFamily: 'monospace' }}>// AutoGen-enhanced agent graph with Critic + Semantic Memory</div>
            <pre style={{ color: '#e2e8f0', fontSize: '0.75rem', margin: 0, overflowX: 'auto', lineHeight: 1.75 }}>{`const result = await runAgentGraph({ question, chunks, documentId }, onEvent)
// Node flow:
//  PLANNING → MEMORY_RECALL → RETRIEVING → ANALYZING → SYNTHESIZING → CRITIQUING → DONE
//
// AutoGen Bus: each agent emits structured HANDOFF messages to the next agent
// Memory: recallMemory() enriches Synthesizer context with past answers  
// Critic: scores answer on completeness, grounding, structure (0–100)
// Post-run: storeMemory() saves learned knowledge for future sessions`}</pre>
          </div>
        </div>
      )}

      {activeTab === 'autogen' && <AutoGenChat />}

      {activeTab === 'memory' && <MemoryInspector />}

      {activeTab === 'tools' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '1.25rem', background: '#f0fdf4', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontWeight: 700, color: '#065f46', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wrench size={16} /> MCP-Inspired Tool Registry — {tools.length} tools registered
            </div>
            <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0, lineHeight: 1.6 }}>
              Each tool below mirrors the Model Context Protocol: <code>name</code>, <code>description</code>, typed <code>schema</code>, and an async <code>handler</code>.
              Swap any handler with an HTTP call to a real MCP server (Brave Search, GitHub, Filesystem) with zero agent code changes.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {tools.map(tool => <ToolCard key={tool.name} tool={tool} />)}
          </div>
          <div className="card" style={{ background: '#0f172a', border: 'none', padding: '1.25rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.75rem', fontFamily: 'monospace' }}>// Parallel tool execution in nodeAnalyze</div>
            <pre style={{ color: '#e2e8f0', fontSize: '0.75rem', margin: 0, overflowX: 'auto', lineHeight: 1.75 }}>{`const [factResult, sentimentResult] = await Promise.all([
  executeTool('extractFacts',   { chunks: topChunks, question }),
  executeTool('detectSentiment',{ chunks: topChunks }),
])
// → facts: [{text, relevance, chunkIndex}]
// → sentiment: {sentiment, intensity, posScore, negScore}`}</pre>
          </div>
        </div>
      )}

      {activeTab === 'stack' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {TECH_STACK.map(section => (
            <div key={section.category}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: '1rem', fontWeight: 700, color: section.color }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: section.color, display: 'inline-block' }} />
                {section.category}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12 }}>
                {section.items.map(item => (
                  <div key={item.name} className="card" style={{ padding: '1rem', borderLeft: `3px solid ${section.color}`, background: section.bg }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: section.color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.role}</div>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="card" style={{ background: '#0f172a', border: 'none', padding: '1.5rem' }}>
            <pre style={{ color: '#e2e8f0', fontSize: '0.74rem', margin: 0, overflowX: 'auto', lineHeight: 1.8 }}>{`DocIntell AI Architecture (Client-Only Mode):
┌─────────────────────────────────────────────────────────┐
│  React 18 + Vite 6                                       │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐ │
│  │ Agent    │  │ Insight   │  │ Semantic Memory Store │ │
│  │ Studio   │  │ Engine    │  │ (localStorage)        │ │
│  └────┬─────┘  └─────┬─────┘  └──────────┬───────────┘ │
│       │               │                   │              │
│  ┌────▼───────────────▼───────────────────▼───────────┐ │
│  │  Agent Graph: Plan→Memory→Retrieve→Analyze→         │ │
│  │              Synthesize→Critique→Done               │ │
│  └─────────────────────────┬───────────────────────────┘ │
│                             │ Gemini 2.0 Flash API        │
└─────────────────────────────┴───────────────────────────┘`}</pre>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}
