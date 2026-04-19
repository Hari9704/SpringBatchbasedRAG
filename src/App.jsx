import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Login from './components/Login'
import Dashboard from './pages/Dashboard'
import UploadProcessing from './pages/UploadProcessing'
import DocumentExplorer from './pages/DocumentExplorer'
import Versioning from './pages/Versioning'
import AIQuery from './pages/AIQuery'
import ReasoningBreakdown from './pages/ReasoningBreakdown'
import FeedbackLearning from './pages/FeedbackLearning'
import Analytics from './pages/Analytics'
import AdminPanel from './pages/AdminPanel'
import AuthRoles from './pages/AuthRoles'
import SeleniumTests from './pages/SeleniumTests'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar onLogout={() => setIsAuthenticated(false)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadProcessing />} />
            <Route path="/documents" element={<DocumentExplorer />} />
            <Route path="/versioning" element={<Versioning />} />
            <Route path="/query" element={<AIQuery />} />
            <Route path="/reasoning" element={<ReasoningBreakdown />} />
            <Route path="/feedback" element={<FeedbackLearning />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/auth" element={<AuthRoles />} />
            <Route path="/tests" element={<SeleniumTests />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
