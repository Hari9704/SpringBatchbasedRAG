# DocIntell AI — Document Intelligence Platform

## Overview
A React + Vite single-page application (SPA) for an AI-Driven Document Intelligence Platform with RAG (Retrieval-Augmented Generation), Reasoning, and Self-Learning capabilities. The entire app runs client-side — no backend required for core features.

## Architecture

### Frontend (Active — Port 5000)
- **Framework**: React 18 + Vite 5
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Markdown**: marked (for AI chat responses)
- **Host**: 0.0.0.0:5000

### AI Integration (Direct API)
The app calls LLM APIs directly from the browser:
- **Google Gemini** (Recommended — free tier via `generativelanguage.googleapis.com`)
  - Models: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash
- **OpenAI** (Optional — paid)
  - Models: gpt-4o-mini, gpt-4o
- API keys are stored securely in localStorage (never sent to any server)

### Local Storage Layer
All data is stored in `localStorage` (no backend database required):
- Documents: metadata, raw text, chunks, processing status
- Query history: questions, answers, confidence scores, timestamps
- Settings: API key, provider, model, preferences
- Feedback: user feedback on AI responses

### Backend (Not Running — Requires Java Infrastructure)
The `backend/` directory contains Java Spring Boot microservices for production use:
- `api-gateway`, `auth-service`, `document-service`, `batch-service`, `query-service`, `feedback-service`, `analytics-service`
- Requires Java 17+, Maven, OpenAI/Gemini API key, vector database

## Document Processing Pipeline
Local, browser-based processing:
1. **UPLOADED** → File received
2. **VALIDATING** → File type/size check
3. **EXTRACTING** → Read text (TXT native, PDF/DOCX best-effort)
4. **CLEANING** → Normalize text
5. **CHUNKING** → Split into ~350-word chunks
6. **EMBEDDING** → Mark as ready (no real embedding — Gemini handles retrieval context)
7. **PROCESSED** → Ready for AI Chat

## Project Structure
```
/
├── src/
│   ├── App.jsx              # Main app with routing and auth
│   ├── main.jsx             # Entry point (wraps ToastProvider)
│   ├── index.css            # Global styles + design system
│   ├── components/
│   │   ├── Login.jsx        # Auth with user/admin roles
│   │   ├── UserSidebar.jsx  # User workspace navigation
│   │   ├── AdminSidebar.jsx # Admin panel navigation
│   │   └── Toast.jsx        # Toast notification system
│   ├── context/
│   │   └── UserWorkspaceContext.jsx  # Document state + polling
│   ├── lib/
│   │   ├── api.js           # Local API layer (uses localStorage)
│   │   ├── localStore.js    # localStorage CRUD helpers
│   │   ├── gemini.js        # Gemini + OpenAI API client
│   │   └── fileReader.js    # File text extraction + chunking
│   └── pages/
│       ├── user/            # User workspace pages
│       │   ├── UserDashboard.jsx
│       │   ├── UserUpload.jsx
│       │   ├── MyDocuments.jsx
│       │   ├── AIChat.jsx         # Main chat interface (Gemini/OpenAI)
│       │   ├── UserAnalytics.jsx
│       │   └── UserSettings.jsx   # API key management
│       └── (admin pages)    # Admin dashboard (uses mock/local data)
├── backend/                 # Java Spring Boot microservices (not running)
├── index.html               # HTML entry point
├── vite.config.js           # Vite config (port 5000, host 0.0.0.0)
└── package.json
```

## How to Use
1. Open the app → Login as "Normal User" or "Administrator"
2. Go to **Settings → API Keys** → Add your Gemini API key (free from aistudio.google.com)
3. Go to **Upload & Process** → Upload a .txt, .pdf, or .docx file
4. Wait for processing to complete (shown in pipeline view)
5. Go to **AI Chat** → Ask questions about your document

## Getting a Free Gemini API Key
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Paste it in Settings → API Keys → Save

## Authentication
- **Google OAuth**: "Continue with Google" button on login (uses `@react-oauth/google`)
  - Client ID: `VITE_GOOGLE_CLIENT_ID` env var (shared)
  - Fetches user profile (name, email, picture) from Google userinfo endpoint
- **Email/password**: Simulated client-side auth for demo
- **Admin role**: Full dashboard (email/password only)
- **User role**: Personal workspace — supports Google OAuth or email login

## AI / Gemini API Key
- `VITE_GEMINI_API_KEY` secret: pre-configures the Gemini key for all users automatically
- Model fallback chain: gemini-2.0-flash → gemini-2.0-flash-lite → gemini-1.5-flash → gemini-1.5-pro → gemini-1.0-pro
- Exponential backoff retry (LangGraph-inspired) on rate limit / network errors
- Priority: env var always wins over localStorage cached key

## Agentic Layer (src/lib/)
- **agent.js** — LangGraph-inspired state machine: PLANNING→RETRIEVING→ANALYZING→SYNTHESIZING→DONE, with RETRYING nodes and exponential backoff
- **tools.js** — MCP-style tool registry: searchChunks, extractFacts, summarizeChunks, generateInsights, retryWithBackoff
- **gemini.js** — withRetry(), validateGeminiKey(), model fallback chain, onStep streaming events
- **api.js** — processDocumentWithRetry() for auto-retry on upload failures

## Pages
- **/app/agent** — Agent Studio: interactive LangGraph graph demo, MCP tool registry panel, full tech stack showcase
- **/app/chat** — AI Chat with Agent Mode toggle (CrewAI crew: Planner/Retriever/Analyst/Synthesizer), live trace visualization

## Running
- `npm run dev` — Dev server on port 5000
- `npm run build` — Production build to `dist/`

## Deployment
- Type: Static site
- Build: `npm run build`
- Public dir: `dist`
- Deploy with the Publish button in Replit
