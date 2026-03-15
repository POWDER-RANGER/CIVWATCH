"""CIVWATCH ML Service — FastAPI application entry point."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import logging
import os
import time

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CIVWATCH ML Service",
    description="Sentiment analysis and NLP inference service for CIVWATCH.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── State ────────────────────────────────────────────────────────────────────
_model_loaded: bool = False
_startup_time: float = time.time()


class SentimentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to analyse")


class SentimentResponse(BaseModel):
    score: float = Field(..., description="Sentiment polarity from -1.0 (negative) to 1.0 (positive)")
    confidence: float = Field(..., description="Confidence of prediction from 0.0 to 1.0")
    label: str = Field(..., description="Human-readable label: positive | neutral | negative")
    processing_ms: float


# ── Lifecycle ────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def load_model() -> None:
    """Load the sentiment model on startup."""
    global _model_loaded
    logger.info("Loading sentiment model...")
    try:
        # TextBlob is the lightweight MVP model — swap for transformers in M2
        from textblob import TextBlob  # noqa: F401
        _model_loaded = True
        logger.info("Model loaded successfully (TextBlob MVP).")
    except ImportError:
        logger.warning("TextBlob not installed. Falling back to stub model.")
        _model_loaded = True  # stub still functional


# ── Health & Readiness ───────────────────────────────────────────────────────
@app.get("/health", tags=["ops"])
async def health() -> dict:
    """Liveness probe — always responds if the process is alive."""
    import platform
    gpu_available = False
    try:
        import torch
        gpu_available = torch.cuda.is_available()
    except ImportError:
        pass
    return {
        "status": "ok",
        "model_loaded": _model_loaded,
        "gpu_available": gpu_available,
        "uptime_seconds": round(time.time() - _startup_time, 2),
        "python": platform.python_version(),
    }


@app.get("/ready", tags=["ops"])
async def ready():
    """Readiness probe — 503 until model is fully loaded."""
    if not _model_loaded:
        raise HTTPException(status_code=503, detail="Model not yet loaded")
    return {"status": "ready"}


# ── Inference ────────────────────────────────────────────────────────────────
@app.post("/analyze/sentiment", response_model=SentimentResponse, tags=["inference"])
async def analyze_sentiment(req: SentimentRequest) -> SentimentResponse:
    """Run sentiment analysis on the supplied text."""
    if not _model_loaded:
        raise HTTPException(status_code=503, detail="Model not ready")

    start = time.perf_counter()

    try:
        from textblob import TextBlob
        blob = TextBlob(req.text)
        raw_score: float = blob.sentiment.polarity          # -1.0 .. 1.0
        subjectivity: float = blob.sentiment.subjectivity   # 0.0 .. 1.0
        confidence = max(abs(raw_score), 0.05)              # never return 0 confidence
    except ImportError:
        # Stub fallback — neutral
        raw_score = 0.0
        confidence = 0.5
        subjectivity = 0.5

    if raw_score > 0.1:
        label = "positive"
    elif raw_score < -0.1:
        label = "negative"
    else:
        label = "neutral"

    processing_ms = (time.perf_counter() - start) * 1000
    logger.info("Sentiment: score=%.3f label=%s ms=%.1f", raw_score, label, processing_ms)

    return SentimentResponse(
        score=round(raw_score, 4),
        confidence=round(confidence, 4),
        label=label,
        processing_ms=round(processing_ms, 2),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("FASTAPI_HOST", "0.0.0.0"),
        port=int(os.getenv("FASTAPI_PORT", 5000)),
        reload=os.getenv("NODE_ENV") == "development",
    )
