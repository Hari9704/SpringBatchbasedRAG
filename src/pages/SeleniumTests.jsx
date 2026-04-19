import { useState } from 'react'
import { TestTube, Play, CheckCircle, XCircle, Clock, RotateCcw, Monitor, Layers, RefreshCw, Zap } from 'lucide-react'

const testSuites = [
  {
    category: 'UI Automation',
    icon: Monitor,
    tests: [
      { name: 'Login Flow', status: 'passed', duration: '2.3s', steps: ['Navigate to /auth', 'Enter credentials', 'Click Sign In', 'Verify dashboard'] },
      { name: 'File Upload', status: 'passed', duration: '4.1s', steps: ['Navigate to /upload', 'Drag file', 'Verify progress', 'Check batch logs'] },
      { name: 'Query Interaction', status: 'passed', duration: '3.7s', steps: ['Navigate to /query', 'Type question', 'Send query', 'Verify response'] },
      { name: 'Feedback Submission', status: 'failed', duration: '1.8s', steps: ['Navigate to /feedback', 'Click Accept', 'Verify state change'], error: 'Assertion failed: button state not updated' },
    ]
  },
  {
    category: 'End-to-End Tests',
    icon: Layers,
    tests: [
      { name: 'Upload → Process → Query', status: 'passed', duration: '12.4s', steps: ['Upload PDF', 'Wait for batch', 'Query content', 'Verify answer'] },
      { name: 'Query → Feedback Loop', status: 'passed', duration: '6.2s', steps: ['Ask question', 'Get response', 'Submit feedback', 'Verify stored'] },
      { name: 'Full Pipeline Test', status: 'running', duration: '8.1s', steps: ['Upload → Batch → Query → Feedback → Reprocess'] },
    ]
  },
  {
    category: 'Regression Tests',
    icon: RefreshCw,
    tests: [
      { name: 'Dashboard Load', status: 'passed', duration: '0.8s', steps: ['Load dashboard', 'Verify all 4 stats', 'Check service health'] },
      { name: 'Document Explorer', status: 'passed', duration: '1.2s', steps: ['Load documents', 'Search filter', 'Select document', 'Preview content'] },
      { name: 'Admin Panel Tabs', status: 'passed', duration: '1.5s', steps: ['Switch all 4 tabs', 'Verify content loads', 'Check interactions'] },
      { name: 'Version Comparison', status: 'passed', duration: '1.1s', steps: ['Load versioning', 'Select versions', 'Verify diff output'] },
    ]
  },
  {
    category: 'API + UI Combo',
    icon: Zap,
    tests: [
      { name: 'POST /api/documents → UI Update', status: 'passed', duration: '3.4s', steps: ['POST document', 'Reload explorer', 'Verify new entry'] },
      { name: 'POST /api/batch/trigger → Job Status', status: 'passed', duration: '5.8s', steps: ['Trigger batch', 'Check admin panel', 'Verify job row'] },
      { name: 'POST /api/query → Chat UI', status: 'passed', duration: '2.9s', steps: ['Send API query', 'Check chat interface', 'Verify AI message'] },
    ]
  }
]

export default function SeleniumTests() {
  const [expandedTest, setExpandedTest] = useState(null)

  const totalTests = testSuites.reduce((sum, s) => sum + s.tests.length, 0)
  const passed = testSuites.reduce((sum, s) => sum + s.tests.filter(t => t.status === 'passed').length, 0)
  const failed = testSuites.reduce((sum, s) => sum + s.tests.filter(t => t.status === 'failed').length, 0)
  const running = testSuites.reduce((sum, s) => sum + s.tests.filter(t => t.status === 'running').length, 0)

  return (
    <div className="animate-fade-in" id="tests-page">
      <div className="page-header">
        <h1>Selenium Tests</h1>
        <p>Automated testing dashboard — UI, E2E, regression, and API+UI combo tests</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card">
          <div className="stat-label">Total Tests</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{totalTests}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">✅ Passed</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-success)' }}>{passed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">❌ Failed</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-error)' }}>{failed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">⏳ Running</div>
          <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-processing)' }}>{running}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--spacing-lg)' }}>
        <button className="btn btn-primary"><Play size={16} /> Run All Tests</button>
        <button className="btn btn-secondary"><RotateCcw size={16} /> Run Failed</button>
      </div>

      {/* Test Suites */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        {testSuites.map((suite, si) => {
          const Icon = suite.icon
          const suitePassed = suite.tests.filter(t => t.status === 'passed').length
          return (
            <div className="card" key={si}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={16} /> {suite.category}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {suitePassed}/{suite.tests.length} passed
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {suite.tests.map((test, ti) => {
                  const key = `${si}-${ti}`
                  const isExpanded = expandedTest === key
                  return (
                    <div
                      key={ti}
                      style={{
                        border: '1px solid',
                        borderColor: test.status === 'failed' ? 'rgba(198,40,40,0.2)' : 'var(--color-border-light)',
                        borderRadius: 'var(--radius-md)',
                        background: test.status === 'failed' ? 'var(--color-error-bg)' : 'var(--color-bg)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', cursor: 'pointer'
                        }}
                        onClick={() => setExpandedTest(isExpanded ? null : key)}
                      >
                        {test.status === 'passed' && <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />}
                        {test.status === 'failed' && <XCircle size={16} style={{ color: 'var(--color-error)' }} />}
                        {test.status === 'running' && <Clock size={16} style={{ color: 'var(--color-processing)', animation: 'pulse 1.5s infinite' }} />}
                        <span style={{ flex: 1, fontWeight: 500, fontSize: '0.875rem' }}>{test.name}</span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{test.duration}</span>
                      </div>
                      {isExpanded && (
                        <div style={{ padding: '0 14px 12px 40px', fontSize: '0.8125rem' }}>
                          <div style={{ color: 'var(--color-text-muted)', marginBottom: 6, fontWeight: 600 }}>Steps:</div>
                          {test.steps.map((step, stepIdx) => (
                            <div key={stepIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                              <span style={{ color: 'var(--color-primary)', fontSize: '0.75rem' }}>→</span>
                              <span style={{ color: 'var(--color-text-secondary)' }}>{step}</span>
                            </div>
                          ))}
                          {test.error && (
                            <div style={{
                              marginTop: 8, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                              background: 'rgba(198,40,40,0.1)', color: 'var(--color-error)',
                              fontSize: '0.75rem', fontFamily: 'monospace'
                            }}>
                              ❌ {test.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
