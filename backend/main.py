"""
RAG Backend Server - Python (FastAPI)
======================================
Portfolio chatbot with TF-IDF retrieval + Gemini LLM.
"""

import os
import re
import math
from pathlib import Path
from dataclasses import dataclass

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from google import genai

# ===========================
# Config
# ===========================
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-flash-lite")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "4000"))
FRONTEND_PORT = int(os.getenv("FRONTEND_PORT", "3000"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "")
RESUME_PATH = Path(__file__).resolve().parent.parent / "frontend" / "public" / "resume.pdf"


# ===========================
# RAG: Data Structures
# ===========================
@dataclass
class DocChunk:
    text: str
    section: str
    embedding: list[float]


document_chunks: list[DocChunk] = []
global_vocabulary: list[str] = []
global_idf: dict[str, float] = {}


# ===========================
# RAG: TF-IDF Engine
# ===========================
def tokenize(text: str) -> list[str]:
    """Tokenize text into lowercase word tokens."""
    return [t for t in re.sub(r"[^a-z0-9\s]", " ", text.lower()).split() if len(t) > 1]


def vectorize(tokens: list[str], vocabulary: list[str], idf: dict[str, float]) -> list[float]:
    """Compute TF-IDF vector for tokens against vocabulary."""
    tf: dict[str, int] = {}
    for t in tokens:
        tf[t] = tf.get(t, 0) + 1
    max_len = max(len(tokens), 1)
    return [(tf.get(word, 0) / max_len) * idf.get(word, 0.0) for word in vocabulary]


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Cosine similarity between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    denom = mag_a * mag_b
    return dot / denom if denom != 0 else 0.0


def chunk_resume_text(text: str) -> list[dict[str, str]]:
    """Split resume text into semantic chunks by sections."""
    chunks: list[dict[str, str]] = []
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    current_section = "Header"
    buffer: list[str] = []

    for line in lines:
        is_section_header = (
            len(line) < 60
            and re.match(r"^[A-Z][A-Za-z\s&\-/]+$", line)
            and not line[0].isdigit()
        )

        if is_section_header and buffer:
            chunks.append({"text": "\n".join(buffer), "section": current_section})
            buffer = []
            current_section = line

        buffer.append(line)

    if buffer:
        chunks.append({"text": "\n".join(buffer), "section": current_section})

    # Further split large chunks (>600 chars)
    result: list[dict[str, str]] = []
    for chunk in chunks:
        if len(chunk["text"]) <= 600:
            result.append(chunk)
        else:
            sentences = re.split(r"(?<=[.!?])\s+", chunk["text"])
            sub: list[str] = []
            for sentence in sentences:
                sub.append(sentence)
                if len(" ".join(sub)) >= 400:
                    result.append({"text": " ".join(sub), "section": chunk["section"]})
                    sub = []
            if sub:
                result.append({"text": " ".join(sub), "section": chunk["section"]})

    return result


def load_resume() -> None:
    """Load and index the resume PDF."""
    global document_chunks, global_vocabulary, global_idf

    if not RESUME_PATH.exists():
        print(f"[RAG] Resume not found at: {RESUME_PATH}")
        print("[RAG] Please place your resume.pdf in the frontend/public/ folder.")
        raise SystemExit(1)

    print("[RAG] Loading resume PDF...")
    reader = PdfReader(str(RESUME_PATH))
    raw_text = "\n".join(page.extract_text() or "" for page in reader.pages)

    print(f"[RAG] Extracted {len(raw_text)} characters from PDF")

    raw_chunks = chunk_resume_text(raw_text)
    print(f"[RAG] Split into {len(raw_chunks)} chunks")

    # Build vocabulary and IDF
    all_token_sets = [tokenize(c["text"]) for c in raw_chunks]
    doc_count = len(raw_chunks)
    df: dict[str, int] = {}

    for tokens in all_token_sets:
        for word in set(tokens):
            df[word] = df.get(word, 0) + 1

    idf = {word: math.log(doc_count / freq) for word, freq in df.items()}
    vocabulary = sorted(df.keys())

    # Vectorize each chunk
    document_chunks = [
        DocChunk(
            text=chunk["text"],
            section=chunk["section"],
            embedding=vectorize(all_token_sets[i], vocabulary, idf),
        )
        for i, chunk in enumerate(raw_chunks)
    ]

    global_vocabulary = vocabulary
    global_idf = idf

    print(f"[RAG] Indexed {len(document_chunks)} chunks with {len(vocabulary)} vocabulary terms")


def retrieve(query: str, top_k: int = 4) -> list[DocChunk]:
    """Retrieve top-k most relevant chunks for a query."""
    query_tokens = tokenize(query)
    query_vec = vectorize(query_tokens, global_vocabulary, global_idf)

    scored = [
        (chunk, cosine_similarity(query_vec, chunk.embedding))
        for chunk in document_chunks
    ]
    scored.sort(key=lambda x: x[1], reverse=True)

    return [chunk for chunk, score in scored if score > 0.01][:top_k]


# ===========================
# Gemini RAG Chat
# ===========================
STRICT_SYSTEM_PROMPT = """You are a professional portfolio assistant for Ricky Fredy. Your SOLE purpose is to answer questions about Ricky Fredy's resume, experience, skills, products, and career.

STRICT RULES:
1. ONLY answer questions related to Ricky Fredy's professional profile, resume, experience, skills, products, projects, education, or career.
2. If the user asks anything outside this scope (general knowledge, coding help, weather, math, unrelated topics, etc.), politely decline and redirect them to ask about Ricky's profile.
3. Base ALL answers strictly on the provided resume context below. Do NOT fabricate information not present in the resume.
4. Be professional, concise, and helpful. Highlight key achievements and metrics when available.
5. If the question is relevant but the resume doesn't contain the answer, say "That information isn't available in Ricky's resume" rather than guessing.

RESUME CONTEXT:
{context}"""

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def chat_with_gemini(user_message: str) -> str:
    """Generate a response using RAG + Gemini."""
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        return "I'm not configured yet. Please add your Gemini API key to the `.env` file and restart the server."

    relevant_chunks = retrieve(user_message, 5)

    if not relevant_chunks:
        return "I couldn't find relevant information in Ricky's resume for that question. I can only answer questions about Ricky's professional experience, skills, products, and career. Could you try asking something related to his portfolio?"

    context = "\n\n---\n\n".join(
        f"[Section: {chunk.section}]\n{chunk.text}" for chunk in relevant_chunks
    )
    system_prompt = STRICT_SYSTEM_PROMPT.replace("{context}", context)

    try:
        response = client.models.generate_content(
            model=LLM_MODEL,
            contents=user_message,
            config={"system_instruction": system_prompt},
        )
        return response.text or ""
    except Exception as e:
        print(f"[Gemini] Error: {e}")
        return f"Sorry, I encountered an error processing your request. Please make sure the GEMINI_API_KEY is valid in your .env file.\n\nError: {e}"


# ===========================
# FastAPI Server
# ===========================
app = FastAPI(title="RAG Backend", version="2.0.0")

_cors_origins = [
    f"http://localhost:{FRONTEND_PORT}",
    f"http://127.0.0.1:{FRONTEND_PORT}",
]
if FRONTEND_URL:
    _cors_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str
    model: str
    chunks: int
    apiKeyConfigured: bool


@app.get("/health")
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model=LLM_MODEL,
        chunks=len(document_chunks),
        apiKeyConfigured=bool(GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here"),
    )


@app.post("/api/chat")
def chat(req: ChatRequest) -> dict[str, str]:
    if not req.message:
        raise HTTPException(status_code=400, detail="Message is required")

    try:
        reply = chat_with_gemini(req.message)
        return {"reply": reply}
    except Exception as e:
        print(f"[Server] Chat error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ===========================
# Start
# ===========================
def main():
    load_resume()

    api_key_status = "✓ Configured" if (GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here") else "✗ Not configured"

    print(f"\n{'=' * 40}")
    print(f"  RAG Backend Server (Python)")
    print(f"  {'─' * 38}")
    print(f"  Port:      {BACKEND_PORT}")
    print(f"  Model:     {LLM_MODEL}")
    print(f"  API Key:   {api_key_status}")
    print(f"  Chunks:    {len(document_chunks)}")
    print(f"{'=' * 40}\n")

    uvicorn.run(app, host="0.0.0.0", port=BACKEND_PORT)


if __name__ == "__main__":
    main()
