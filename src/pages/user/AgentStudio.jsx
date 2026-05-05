import { useState } from 'react'
import { Cpu, GitBranch, Wrench, Layers, Zap, RefreshCw, CheckCircle, Clock, ArrowRight, ExternalLink } from 'lucide-react'
import { AGENTS, AGENT_STATES } from '../../lib/agent'
import { listTools } from '../../lib/tools'

const TECH_STACK = [
  {
    category: 'Core Backend',
    color: '#6366f1',
    bg: '#eef2ff',
    items: [
      { name: 'Spring Boot 3.5', role: 'Microservice runtime', desc: 'Powers auth-service, batch-service, query-service, document-service, analytics-service.' },
      { name: 'Spring Batch', role: 'RAG pipeline engine', desc: 'Chunking, embedding, validation — each pipeline step is a Spring Batch Job step with retry/skip policies.' },
      { name: 'Spring Security + OAuth2', role: 'Auth layer', desc: 'JWT + Google OAuth2/OIDC. Resource server validates Google-issued JWTs.' },
      { name: 'Spring Cloud Gateway', role: 'API Gateway', desc: 'Routes frontend requests to the correct microservice with rate limiting and auth filter.' },
    ]
  },
  {
    category: 'AI & Agents',
    color: '#f59e0b',
    bg: '#fffbeb',
    items: [
      { name: 'Google Gemini 2.0', role: 'LLM backbone', desc: 'Primary AI model for document Q&A, reasoning, and synthesis. Auto-fallback chain across model versions.' },
      { name: 'LangGraph (concept)', role: 'State machine', desc: 'Agent graph with nodes (Plan→Retrieve→Analyze→Synthesize) and exponential backoff retry on each edge.' },
      { name: 'CrewAI (concept)', role: 'Multi-agent crew', desc: 'Planner, Retriever, Analyst, and Synthesizer agents collaborate via structured messages.' },
      { name: 'AutoGen (concept)', role: 'Agent communication', desc: 'Agents emit structured events to the UI, enabling real-time trace visualization.' },
    ]
  },
  {
    category: 'MCP & Tools',
    color: '#10b981',
    bg: '#f0fdf4',
    items: [
      { name: 'MCP Protocol (concept)', role: 'Tool registry', desc: 'Each tool has a name, description, input schema, and handler — just like real MCP servers (Brave, GitHub, Filesystem).' },
      { name: 'searchChunks tool', role: 'Semantic search', desc: 'Keyword + proximity scoring across document chunks. The Retriever agent calls this via executeTool().' },
      { name: 'extractFacts tool', role: 'Fact extraction', desc: 'Sentence-level relevance scoring to pull facts from chunks before synthesizing.' },
      { name: 'generateInsights tool', role: 'Document insights', desc: 'Extracts top terms, numeric values, and entity mentions for the dashboard.' },
    ]
  },
  {
    category: 'Frontend',
    color: '#3b82f6',
    bg: '#eff6ff',
    items: [
      { name: 'React 18 + Vite 6', role: 'SPA framework', desc: 'Client-side rendering with hot module reload and optimized production builds.' },
      { name: 'Google OAuth (@react-oauth/google)', role: 'Frontend auth', desc: '"Continue with Google" button — fetches profile from Google userinfo, maps to app roles.' },
      { name: 'Recharts', role: 'Analytics charts', desc: 'Interactive charts for query history, confidence scores, and processing metrics.' },
      { name: 'React Router v6', role: 'Client routing', desc: 'Role-based routing — /admin/* and /app/* shells with protected layout guards.' },
    ]
  },
]

const GRAPH_NODES = [
  { id: 'PLANNING',    label: 'Plan',      emoji: '🗺️',  x: 10,  color: '#6366f1' },
  { id: 'RETRIEVING',  label: 'Retrieve',  emoji: '🔍',  x: 32,  color: '#f59e0b' },
  { id: 'ANALYZING',   label: 'Analyze',   emoji: '🧪',  x: 54,  color: '#10b981' },
  { id: 'SYNTHESIZING',label: 'Synthesize',emoji: '✍️',  x: 76,  color: '#3b82f6' },
  { id: 'DONE',        label: 'Done',      emoji: '✅',  x: 95,  color: '#22c55e' },
]

function GraphDemo() {
  const [activeNode, setActiveNode] = useState(null)
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState([])

  const runDemo = async () => {
    setRunning(true)
    setCompleted([])
    setActiveNode(null)
    for (const node of GRAPH_NODES) {
      setActiveNode(node.id)
      await new Promise(r => setTimeout(r, 700))
      setCompleted(prev => [...prev, node.id])
    }
    setActiveNode(null)
    setRunning(false)
  }

  return (
    <div style={{ padding: '1.5rem', background: '#0f172a', borderRadius: 12, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontFamily: 'monospace' }}>LangGraph State Machine — Agent Pipeline</span>
        <button
          onClick={runDemo}
          disabled={running}
          type="button"
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            borderRadius: 8, border: 'none', background: running ? '#1e293b' : '#6366f1',
            color: running ? '#64748b' : 'white', fontSize: '0.8rem', fontWeight: 600,
            cursor: running ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
          }}
        >
          {running ? <><RefreshCw size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Running…</> : <><Zap size={13} /> Run Demo</>}
        </button>
      </div>

      {/* Graph */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
        {GRAPH_NODES.map((node, i) => {
          const isDone = completed.includes(node.id)
          const isActive = activeNode === node.id
          return (
            <div key={node.id} style={{ display: 'flex', alignItems: 'center', flex: i < GRAPH_NODES.length - 1 ? '1' : 'none' }}>
              <div
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '10px 14px', borderRadius: 10,
                  background: isActive ? node.color + '33' : isDone ? '#1e293b' : '#1e293b',
                  border: `2px solid ${isActive ? node.color : isDone ? node.color + '66' : '#334155'}`,
                  transition: 'all 0.3s', minWidth: 80,
                  boxShadow: isActive ? `0 0 16px ${node.color}44` : 'none',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{isDone ? '✅' : node.emoji}</span>
                <span style={{ color: isActive ? node.color : isDone ? '#94a3b8' : '#64748b', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {node.label}
                </span>
                {isActive && (
                  <span style={{ fontSize: '0.6rem', color: node.color, animation: 'pulse 1s infinite' }}>● active</span>
                )}
              </div>
              {i < GRAPH_NODES.length - 1 && (
                <div style={{ flex: 1, height: 2, background: isDone && completed.includes(GRAPH_NODES[i+1]?.id) ? '#6366f1' : '#334155', transition: 'background 0.5s', position: 'relative', minWidth: 20 }}>
                  <ArrowRight size={12} style={{ position: 'absolute', right: -6, top: -5, color: completed.includes(GRAPH_NODES[i+1]?.id) ? '#6366f1' : '#334155' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['Exponential Backoff Retry', 'State Persistence', 'Event Streaming', 'Tool Calls'].map(label => (
          <span key={label} style={{ padding: '3px 10px', borderRadius: 20, background: '#1e293b', border: '1px solid #334155', color: '#64748b', fontSize: '0.7rem' }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function ToolCard({ tool }) {
  return (
    <div style={{
      padding: '1rem', borderRadius: 10, background: 'white',
      border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ padding: 6, background: '#f0fdf4', borderRadius: 8 }}>
          <Wrench size={14} color="#10b981" />
        </div>
        <code style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{tool.name}()</code>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{tool.description}</p>
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

export default function AgentStudio() {
  const [activeTab, setActiveTab] = useState('graph')
  const tools = listTools()

  const tabs = [
    { id: 'graph', label: 'Agent Graph', icon: GitBranch },
    { id: 'tools', label: 'MCP Tools', icon: Wrench },
    { id: 'stack', label: 'Tech Stack', icon: Layers },
  ]

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Cpu size={26} style={{ color: 'var(--color-primary)' }} />
          Agent Studio
        </h1>
        <p>Visualize the agentic pipeline, MCP tool registry, and full tech stack powering DocIntell AI.</p>
      </div>

      {/* Tech badge strip */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {['LangGraph', 'CrewAI', 'AutoGen', 'MCP Protocol', 'Gemini 2.0', 'Spring Batch', 'Spring Security OAuth2'].map(t => (
          <span key={t} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
            background: 'linear-gradient(135deg, var(--color-primary-lighter), #f0fdf4)',
            color: 'var(--color-primary-dark)', border: '1px solid rgba(249,115,22,0.2)'
          }}>{t}</span>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              className={`tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
              type="button"
            >
              <Icon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Agent Graph Tab */}
      {activeTab === 'graph' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <GraphDemo />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {Object.values(AGENTS).map(agent => (
              <div key={agent.name} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: '1.5rem' }}>{agent.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{agent.name}</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>{agent.desc}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: '#0f172a', border: 'none', padding: '1.25rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
              // LangGraph-style retry on synthesis failure
            </div>
            <pre style={{ color: '#e2e8f0', fontSize: '0.78rem', margin: 0, overflowX: 'auto', lineHeight: 1.7 }}>{`const result = await withRetry(
  () => queryDocument({ question, chunks, agentMode: true }),
  { maxAttempts: 3, baseDelayMs: 1000, label: 'synthesize' }
)
// State transition: SYNTHESIZING → RETRYING → SYNTHESIZING → DONE`}</pre>
          </div>
        </div>
      )}

      {/* MCP Tools Tab */}
      {activeTab === 'tools' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '1.25rem', background: '#f0fdf4', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontWeight: 700, color: '#065f46', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wrench size={16} /> MCP-Inspired Tool Registry
            </div>
            <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0, lineHeight: 1.6 }}>
              Each tool below mirrors the Model Context Protocol pattern: a <code>name</code>, <code>description</code>,
              typed <code>schema</code>, and an async <code>handler</code>. Agents call <code>executeTool(name, args)</code>
              at runtime — swappable with real MCP servers (Brave Search, GitHub, Filesystem) via HTTP transport.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {tools.map(tool => <ToolCard key={tool.name} tool={tool} />)}
          </div>

          <div className="card" style={{ background: '#0f172a', border: 'none', padding: '1.25rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
              // Agent calls MCP tool at runtime
            </div>
            <pre style={{ color: '#e2e8f0', fontSize: '0.78rem', margin: 0, overflowX: 'auto', lineHeight: 1.7 }}>{`// MCP-style tool call (local) — pluggable with remote MCP server
const result = await executeTool('searchChunks', {
  chunks: doc.chunkList,
  query: 'quarterly revenue growth',
  topK: 8,
})
// → { chunks: [...], topScore: 4.2, totalSearched: 34 }`}</pre>
          </div>

          <div className="card" style={{ padding: '1rem', background: 'var(--color-primary-lighter)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: 6 }}>Real MCP Servers (integrable)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Brave Search MCP', 'GitHub MCP', 'Filesystem MCP', 'PostgreSQL MCP', 'Slack MCP', 'Google Drive MCP'].map(s => (
                <span key={s} style={{ padding: '4px 10px', background: 'white', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 6, fontSize: '0.75rem', color: '#7c3aed', fontWeight: 500 }}>
                  {s}
                </span>
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-primary-dark)', margin: '10px 0 0', opacity: 0.8 }}>
              Replace local tool handlers with HTTP calls to these MCP servers for live web search, file access, and database queries.
            </p>
          </div>
        </div>
      )}

      {/* Tech Stack Tab */}
      {activeTab === 'stack' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {TECH_STACK.map(section => (
            <div key={section.category}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: '1rem', fontWeight: 700, color: section.color }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: section.color, display: 'inline-block' }} />
                {section.category}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {section.items.map(item => (
                  <div
                    key={item.name}
                    className="card"
                    style={{ padding: '1rem', borderLeft: `3px solid ${section.color}`, background: section.bg }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: section.color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.role}</div>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="card" style={{ background: '#0f172a', border: 'none', padding: '1.5rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
              architecture.yml — DocIntell AI Platform
            </div>
            <pre style={{ color: '#e2e8f0', fontSize: '0.74rem', margin: 0, overflowX: 'auto', lineHeight: 1.8 }}>{`Frontend (React/Vite) → Spring Cloud Gateway (port 8080)
  ├── /auth/**     → auth-service     (port 8081) [Google OAuth2 + JWT]
  ├── /docs/**     → document-service (port 8082) [Spring Batch upload pipeline]
  ├── /batch/**    → batch-service    (port 8083) [Chunk/Embed jobs]
  ├── /query/**    → query-service    (port 8084) [Gemini RAG endpoint]
  ├── /feedback/** → feedback-service (port 8085) [Self-learning loop]
  └── /analytics/**→ analytics-service(port 8086) [Metrics + trends]

AI Layer:
  queryDocument → [LangGraph graph] → Gemini 2.0 Flash API
  MCP Tools: searchChunks · extractFacts · generateInsights
  CrewAI Crew: Planner · Retriever · Analyst · Synthesizer`}</pre>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}
