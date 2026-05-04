# DocIntell AI — Document Intelligence Platform

## Overview
A React + Vite single-page application (SPA) for an AI-Driven Document Intelligence Platform with RAG (Retrieval-Augmented Generation), Reasoning, and Self-Learning capabilities.

## Architecture

### Frontend (Active)
- **Framework**: React 18 + Vite 5
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Port**: 5000 (dev server on 0.0.0.0)

### Backend (Not Running — Requires Java Infrastructure)
The `backend/` directory contains a Java Spring Boot microservices architecture:
- `api-gateway` — API Gateway (port 8080)
- `auth-service` — Authentication microservice
- `document-service` — Document management
- `batch-service` — Spring Batch jobs for document ingestion/processing
- `query-service` — RAG query service
- `feedback-service` — Feedback/self-learning service
- `analytics-service` — Analytics microservice

The backend requires Java 17+, Maven, an OpenAI API key, and a vector database. It is not running in this environment.

## Project Structure
```
/
├── src/
│   ├── App.jsx              # Main app with routing and auth
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles
│   ├── components/          # Shared UI components (Login, Sidebars)
│   ├── context/             # React context (UserWorkspaceContext)
│   ├── lib/                 # API utilities (api.js)
│   └── pages/               # Page-level components
│       ├── user/            # User-facing pages
│       └── (admin pages)    # Admin panel pages
├── backend/                 # Java Spring Boot microservices (not running)
├── index.html               # HTML entry point
├── vite.config.js           # Vite config (port 5000, host 0.0.0.0)
└── package.json             # Node dependencies
```

## Authentication
The app uses client-side role-based auth (no backend required for UI):
- **Admin role**: Full dashboard with document management, analytics, AI query, etc.
- **User role**: Personal workspace with upload, chat, analytics, settings

## API Proxy
Vite proxies `/api/*` requests to `http://localhost:8080` (Spring Boot gateway). API calls will fail gracefully when the backend is not running.

## Running
- `npm run dev` — Start dev server on port 5000
- `npm run build` — Build for production (outputs to `dist/`)

## Deployment
- Type: Static site
- Build: `npm run build`
- Public dir: `dist`
