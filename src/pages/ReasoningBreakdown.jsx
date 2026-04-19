import { Brain, Search, FileText, Cpu, Zap, CheckCircle, ArrowDown } from 'lucide-react'

const steps = [
  {
    phase: 'Query Decomposition',
    icon: Search,
    color: 'var(--color-info)',
    bg: 'var(--color-info-bg)',
    description: 'Breaking down the user query into sub-questions',
    details: [
      'Original: "What are the key risks in Q3 report?"',
      'Sub-Q1: Identify risk factors mentioned in document',
      'Sub-Q2: Categorize risks by severity level',
      'Sub-Q3: Find mitigation recommendations',
    ]
  },
  {
    phase: 'Context Retrieval',
    icon: FileText,
    color: 'var(--color-primary)',
    bg: 'var(--color-primary-lighter)',
    description: 'Retrieving relevant chunks from vector database',
    details: [
      'Vector search: cosine similarity (threshold: 0.78)',
      'Retrieved 5 chunks from 2 documents',
      'Top match: Q3_Financial_Report.pdf — Chunk #18 (sim: 0.97)',
      'Cross-reference: Risk_Assessment_Q2.pdf — Chunk #7 (sim: 0.82)',
      'Filtered: 2 chunks below threshold discarded',
    ]
  },
  {
    phase: 'Intermediate Reasoning',
    icon: Cpu,
    color: 'var(--color-warning)',
    bg: 'var(--color-warning-bg)',
    description: 'Applying chain-of-thought reasoning on retrieved context',
    details: [
      'Step 1: Extracted 4 explicit risk mentions from Chunk #18',
      'Step 2: Cross-validated with Q2 risk assessment (2 recurring risks)',
      'Step 3: Identified 2 NEW risks not in Q2 (supply chain, cyber)',
      'Step 4: Severity ranking applied: Cyber > Supply > Regulatory > Currency',
      'Step 5: Connected risks to mitigation recommendations in Chunk #19',
    ]
  },
  {
    phase: 'Final Synthesis',
    icon: Zap,
    color: 'var(--color-success)',
    bg: 'var(--color-success-bg)',
    description: 'Synthesizing final answer from reasoning chain',
    details: [
      'Combined insights from 3 reasoning steps',
      'Generated structured response with 4 risk factors',
      'Attached source references for traceability',
      'Confidence calculation: avg(chunk_sim) × reasoning_score = 94%',
      'Final answer: 4 key risks with severity rankings and mitigations',
    ]
  }
]

export default function ReasoningBreakdown() {
  return (
    <div className="animate-fade-in" id="reasoning-page">
      <div className="page-header">
        <h1>Reasoning Breakdown</h1>
        <p>Transparent AI reasoning — see how answers are generated step by step</p>
      </div>

      {/* Query Context */}
      <div className="card" style={{ marginBottom: 'var(--spacing-xl)', background: 'linear-gradient(135deg, var(--color-primary-lighter), #f0faf0)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Brain size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analyzing Query</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>"What are the key risks in Q3 report?"</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="badge badge-success" style={{ fontSize: '0.8125rem', padding: '6px 14px' }}>
              <CheckCircle size={14} /> Completed · 94% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Reasoning Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((step, idx) => {
          const Icon = step.icon
          return (
            <div key={idx}>
              <div className="card" style={{ 
                borderLeft: `4px solid ${step.color}`,
                animation: `fadeInUp 0.4s ease ${idx * 0.1}s both`
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: step.bg, color: step.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: step.color, background: step.bg, padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                        STEP {idx + 1}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{step.phase}</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>{step.description}</div>
                    <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                      {step.details.map((d, di) => (
                        <div key={di} style={{ 
                          fontSize: '0.8125rem', padding: '4px 0',
                          color: 'var(--color-text-secondary)',
                          fontFamily: d.includes(':') ? 'Consolas, Monaco, monospace' : 'inherit',
                          display: 'flex', gap: 8, alignItems: 'flex-start'
                        }}>
                          <span style={{ color: step.color, flexShrink: 0 }}>›</span>
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                  <ArrowDown size={20} style={{ color: 'var(--color-border)' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
