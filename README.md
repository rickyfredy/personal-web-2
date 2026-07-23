# Personal Web 2 — Ricky Fredy Portfolio

A modern personal portfolio website built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4**, featuring a **Graphite Mono** theme with light/dark mode and an AI-powered **RAG (Retrieval-Augmented Generation)** chat assistant connected to Google Gemini.

## Features

- **Graphite Mono Theme** — Monochrome palette from 21st.dev with light/dark mode toggle, system preference detection, and localStorage persistence
- **Spline 3D Scene** — Interactive 3D robot in the hero section (from 21st.dev)
- **RAG Chat Assistant** — Floating chat widget powered by Google Gemini that answers questions strictly based on the resume PDF
- **Animated Sections** — Hero, About, Experience Timeline, Products, Skills, Case Studies, Contact
- **Responsive Design** — Mobile-first with smooth animations via Framer Motion

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Graphite Mono theme (oklch) |
| Fonts | DM Sans, Geist Mono (Google Fonts) |
| Animations | Framer Motion |
| 3D | Spline (`@splinetool/react-spline`) |
| Backend | Python 3, FastAPI, Uvicorn |
| AI | Google Gemini (`google-genai` Python SDK) |
| RAG | TF-IDF vectorization + cosine similarity |
| PDF | `PyPDF2` for resume extraction |

## Project Structure

```
├── frontend/                        # Next.js frontend
│   ├── public/
│   │   └── resume.pdf               # Resume PDF (RAG knowledge source)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css           # Graphite Mono theme + component styles
│   │   │   ├── layout.tsx            # Root layout with fonts & meta
│   │   │   └── page.tsx              # Main page with all sections
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── spline-scene.tsx   # Spline 3D wrapper
│   │   │   │   └── spotlight.tsx      # Hover spotlight effect
│   │   │   ├── CaseStudyModal.tsx     # Case study detail modal
│   │   │   ├── FloatingChatWidget.tsx # RAG chat widget
│   │   │   ├── Navbar.tsx             # Navigation bar
│   │   │   ├── ThemeProvider.tsx      # Light/dark mode context
│   │   │   └── ThemeSwitcher.tsx      # Theme toggle button
│   │   ├── data/
│   │   │   └── portfolio.ts          # All portfolio content
│   │   └── lib/
│   │       └── utils.ts              # Utility functions
│   ├── .env                          # Frontend env (backend URL)
│   ├── next.config.ts                # Next.js config with API rewrites
│   ├── package.json
│   └── tsconfig.json
├── backend/                          # Python FastAPI backend
│   ├── main.py                       # RAG server (TF-IDF + Gemini)
│   └── requirements.txt              # Python dependencies
├── .env                              # Backend env (Gemini API key, ports)
├── .env.example                      # Environment template
├── package.json                      # Root orchestration scripts
└── prd.md                            # Product Requirements Document
```

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- **Python** >= 3.9
- A **Google Gemini API Key** ([get one free](https://aistudio.google.com/apikey))
- Your **resume.pdf** in the `frontend/public/` folder

### 1. Clone and Install

```bash
npm run install:all
```

This installs both frontend (npm) and backend (pip) dependencies.

### 2. Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` (root — used by backend):

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API key | *(required)* |
| `LLM_MODEL` | Gemini model name | `gemini-2.5-flash-lite` |
| `FRONTEND_PORT` | Next.js dev server port | `3000` |
| `BACKEND_PORT` | FastAPI RAG server port | `4000` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL for frontend | `http://localhost:4000` |

The frontend also reads `frontend/.env` for `NEXT_PUBLIC_BACKEND_URL`.

### 3. Add Your Resume

Place your resume as `resume.pdf` in the `frontend/public/` folder. The RAG server will parse and index it on startup.

### 4. Run Development Servers

Start both the frontend and backend concurrently:

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:3000 (Next.js)
- **Backend**: http://localhost:4000 (Python FastAPI)

Or run them separately:

```bash
npm run dev:frontend   # Frontend only
npm run dev:backend    # Backend only
```

### 5. Build for Production

```bash
npm run build
npm start
```

## RAG Chat Architecture

```
User Question
     │
     ▼
┌─────────────────┐
│  Frontend Chat   │  POST /api/chat
│  Widget (React)  │──────────────────┐
└─────────────────┘                   │
                                      ▼
                            ┌──────────────────┐
                            │  FastAPI Server   │
                            │  (Python RAG)     │
                            └────────┬─────────┘
                                     │
                         ┌───────────┴───────────┐
                         ▼                       ▼
                  ┌─────────────┐        ┌──────────────┐
                  │  TF-IDF     │        │  Gemini API   │
                  │  Retrieval  │───────▶│  (Strict Mode)│
                  │  (Resume    │context │               │
                  │   Chunks)   │        └──────────────┘
                  └─────────────┘
```

### How It Works

1. **Resume Ingestion** — On startup, the backend parses `resume.pdf` and splits it into semantic chunks
2. **TF-IDF Indexing** — Each chunk is vectorized using TF-IDF (Term Frequency–Inverse Document Frequency)
3. **Query Retrieval** — When a user asks a question, the system finds the top-5 most relevant resume chunks using cosine similarity
4. **Strict Context Generation** — The retrieved chunks are injected into a strict system prompt that instructs Gemini to ONLY answer questions about Ricky's resume
5. **Response** — Gemini generates an answer grounded exclusively in the resume content

### Strict Mode

The chat assistant operates in **strict mode**:
- Only answers questions about Ricky Fredy's professional profile
- Refuses general knowledge, coding, math, or unrelated topics
- Never fabricates information not present in the resume
- Redirects off-topic questions back to the portfolio

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Server health check (model, chunks, API key status) |
| `POST` | `/api/chat` | Send a chat message, receive RAG-powered response |

### POST /api/chat

**Request:**
```json
{ "message": "What is Ricky's current role?" }
```

**Response:**
```json
{ "reply": "Ricky is currently a Senior Product Manager at Lazada Singapore..." }
```

## Design Credits

- **Theme**: [Graphite Mono](https://21st.dev/community/themes/graphite-mono) by serafimcloud from 21st.dev
- **3D Scene**: [Spline Scene](https://21st.dev/@serafimcloud/components/splite) from 21st.dev
- **Chat Widget**: [Floating Chat Widget](https://21st.dev/@moumensoliman/components/floating-chat-widget-shadcnui) from 21st.dev
- **Spotlight Effect**: [Spotlight](https://21st.dev/community/components/s/spotlight) from 21st.dev

## License

Private — © 2025 Ricky Fredy
