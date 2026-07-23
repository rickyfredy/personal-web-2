# Product Requirements Document — RAG Chat Assistant

**Project**: Personal Web 2 — RAG-Powered Portfolio Chat  
**Author**: Ricky Fredy  
**Version**: 2.0  
**Status**: In Progress

---

## 1. Overview

### 1.1 Purpose

Build an AI-powered chat assistant embedded in Ricky Fredy's personal portfolio website. The assistant uses **Retrieval-Augmented Generation (RAG)** to answer visitor questions strictly based on the content of Ricky's resume (`frontend/public/resume.pdf`), powered by Google Gemini.

### 1.2 Goals

- Provide an interactive, intelligent way for visitors (recruiters, hiring managers, collaborators) to learn about Ricky's experience
- Replace the previous hardcoded chatbot responses with a real AI that understands natural language
- Ensure the AI operates in **strict mode** — only answering questions relevant to Ricky's professional profile
- Demonstrate technical capability in AI/ML integration

### 1.3 Non-Goals

- General-purpose AI chatbot
- Multi-document RAG (only single resume PDF)
- User authentication or conversation persistence
- Real-time streaming responses (v1)

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-1 | Visitor | Ask questions about Ricky's experience | I can quickly learn about his background |
| US-2 | Recruiter | Ask about specific skills or technologies | I can assess fit for a role |
| US-3 | Visitor | Click quick-action buttons | I get instant answers without typing |
| US-4 | Visitor | See a loading indicator while AI thinks | I know the system is processing |
| US-5 | Ricky | Configure the AI model and API key | I can swap models without code changes |
| US-6 | Ricky | Have strict mode enforcement | The AI doesn't answer irrelevant questions |
| US-7 | Visitor | Toggle between light and dark mode | I can view the site comfortably in any lighting |

---

## 3. Architecture

### 3.1 System Components

```
┌──────────────────────────────────────────────────────┐
│              Frontend (Next.js — frontend/)           │
│                                                       │
│  ┌─────────────────┐    ┌──────────────────────────┐ │
│  │  Portfolio Page  │    │  FloatingChatWidget.tsx   │ │
│  │  (sections,     │    │  - Message list           │ │
│  │   animations)   │    │  - Input form             │ │
│  │                 │    │  - Quick actions           │ │
│  │                 │    │  - Loading states          │ │
│  └─────────────────┘    └──────────┬───────────────┘ │
│                                     │ POST /api/chat  │
└─────────────────────────────────────┼─────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────┐
│          Backend (Python FastAPI — backend/)           │
│                                                       │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ PyPDF2     │  │ TF-IDF       │  │ google-genai │ │
│  │ (resume    │─▶│ Vectorizer   │─▶│ API Client   │ │
│  │  ingestion)│  │ + Retriever  │  │ (strict mode)│ │
│  └────────────┘  └──────────────┘  └──────────────┘ │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### 3.2 Technology Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend | Next.js 16 + React 19 + TypeScript | Modern SSR framework, type safety |
| Styling | Tailwind CSS v4 | Utility-first, Graphite Mono theme (oklch) |
| Fonts | DM Sans, Geist Mono | Modern, clean typography from Google Fonts |
| Animations | Framer Motion | Smooth, declarative animations |
| Theme | Graphite Mono (21st.dev) | Monochrome oklch palette, light/dark mode |
| Backend | Python 3 + FastAPI + Uvicorn | Lightweight async framework, fast startup |
| AI Model | Google Gemini (google-genai SDK) | Fast, cost-effective, free tier available |
| PDF Parsing | PyPDF2 | Reliable Python PDF text extraction |
| Retrieval | TF-IDF + Cosine Similarity | Simple, no external vector DB needed |
| Configuration | python-dotenv + .env | Standard environment management |

### 3.3 Data Flow

1. **Startup**: Backend loads `frontend/public/resume.pdf` → parses text → chunks into sections → builds TF-IDF index
2. **User Query**: Frontend sends `POST /api/chat` with user message
3. **Retrieval**: Backend vectorizes query → finds top-5 relevant chunks via cosine similarity
4. **Generation**: Chunks injected into strict system prompt → sent to Gemini API
5. **Response**: Gemini returns answer → backend returns to frontend → displayed in chat

---

## 4. Configuration

### 4.1 Environment Variables

**Root `.env`** (used by Python backend):

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `GEMINI_API_KEY` | string | Yes | — | Google Gemini API key |
| `LLM_MODEL` | string | No | `gemini-2.5-flash-lite` | Gemini model identifier |
| `FRONTEND_PORT` | number | No | `3000` | Next.js dev server port |
| `BACKEND_PORT` | number | No | `4000` | FastAPI backend port |
| `NEXT_PUBLIC_BACKEND_URL` | string | No | `http://localhost:4000` | Backend URL for frontend |

**`frontend/.env`** (used by Next.js):

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | string | No | `http://localhost:4000` | Backend URL for API rewrites |
| `FRONTEND_PORT` | number | No | `3000` | Next.js dev server port |

### 4.2 Model Configuration

The default model is **`gemini-2.5-flash-lite`** — a lightweight, fast model suitable for conversational tasks. The model can be changed via the `LLM_MODEL` environment variable to any Gemini model (e.g., `gemini-2.5-pro`, `gemini-2.0-flash`).

---

## 5. Strict Mode Specification

### 5.1 System Prompt Rules

The AI operates under a strict system prompt that enforces:

1. **Scope Limitation**: Only answers questions about Ricky Fredy's professional profile, resume, experience, skills, products, projects, education, or career
2. **Refusal Policy**: Politely declines general knowledge, coding help, math, weather, or any unrelated topics
3. **No Fabrication**: Never invents information not present in the resume
4. **Grounded Responses**: All answers must be based on the retrieved resume context
5. **Graceful Fallback**: If the resume doesn't contain relevant info, says so explicitly

### 5.2 Refusal Examples

| User Question | Expected Behavior |
|--------------|-------------------|
| "What's Ricky's experience with Java?" | Answer based on resume |
| "What's the weather today?" | Politely decline, redirect to portfolio |
| "Write me a Python script" | Politely decline |
| "What's 2+2?" | Politely decline |
| "Tell me about Ricky's education" | Answer based on resume |
| "What products has Ricky built?" | Answer based on resume |

---

## 6. Frontend Requirements

### 6.1 Theme

- **Graphite Mono** theme from 21st.dev (oklch-based monochrome palette)
- Light/dark mode toggle with system preference detection
- localStorage persistence for user preference
- FOUC (Flash of Unstyled Content) prevention via inline script in `<head>`

### 6.2 Chat Widget

- Floating button (bottom-right) with gradient styling
- Expandable panel with message history
- Quick action buttons for common questions
- Loading indicator (spinner) while waiting for AI response
- Disabled input/button states during API calls
- Error handling with user-friendly messages if backend is unreachable

### 6.3 Quick Actions

- "What's your experience?"
- "Tell me about your skills"
- "What products have you built?"

---

## 7. Backend Requirements

### 7.1 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /health` | GET | Returns server status, model name, chunk count, API key status |
| `POST /api/chat` | POST | Accepts `{ message: string }`, returns `{ reply: string }` |

### 7.2 RAG Pipeline

1. **Document Ingestion**: Parse `frontend/public/resume.pdf` on startup using PyPDF2
2. **Chunking**: Split resume text by semantic sections (headers, paragraphs)
3. **Indexing**: Build TF-IDF vectors for all chunks
4. **Retrieval**: For each query, compute query vector → cosine similarity → top-5 chunks
5. **Generation**: Inject chunks into strict system prompt → call Gemini API via google-genai SDK
6. **Error Handling**: Graceful errors for missing API key, API failures, or no relevant chunks

### 7.3 CORS

Allow requests only from the configured frontend origin (`http://localhost:{FRONTEND_PORT}`).

---

## 8. Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend + backend concurrently |
| `npm run dev:frontend` | Start Next.js frontend only |
| `npm run dev:backend` | Start Python FastAPI backend only |
| `npm run build` | Build Next.js for production |
| `npm start` | Start production Next.js server |
| `npm run install:all` | Install frontend (npm) + backend (pip) dependencies |

---

## 9. Security Considerations

- **API Key Protection**: `GEMINI_API_KEY` is stored in `.env` (server-side only), never exposed to the frontend
- **`.env` in `.gitignore`**: Prevents accidental commit of secrets
- **`.env.example`**: Safe to commit, serves as a template
- **CORS**: Backend only accepts requests from the configured frontend origin
- **Strict Mode**: Prevents the AI from being abused for general-purpose queries

---

## 10. Future Enhancements (v2)

| Feature | Description |
|---------|-------------|
| Streaming responses | Server-Sent Events for real-time token streaming |
| Conversation memory | Maintain chat context across multiple messages |
| Multi-document RAG | Support additional documents beyond resume |
| Analytics | Track popular questions and chat metrics |
| Semantic embeddings | Replace TF-IDF with actual embedding vectors |
| Rate limiting | Prevent abuse of the chat API |
| Admin panel | View chat logs and configure system prompt |
