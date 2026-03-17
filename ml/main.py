"""CIVWATCH ML Service — FastAPI application entry point."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import logging
import os
import time

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CIVWATCH ML Service",
    description="Sentiment analysis and NLP inference service for CIVWATCH.",
    version="0.2.0",
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


# ── Request / Response Models ────────────────────────────────────────────────

class SentimentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)


class SentimentResponse(BaseModel):
    score:         float  # -1.0 (negative) → 1.0 (positive)
    confidence:    float  # 0.0 → 1.0
    label:         str    # 'positive' | 'neutral' | 'negative'
    processing_ms: float


class BatchItem(BaseModel):
    item_id: int
    title:   str = Field(default="")
    body:    str = Field(default="", max_length=2000)


class BatchScoreRequest(BaseModel):
    items: List[BatchItem] = Field(..., min_length=1, max_length=500)


class BatchScoreResult(BaseModel):
    item_id:    int
    score:      float
    confidence: float
    label:      str


class BatchScoreResponse(BaseModel):
    results:      List[BatchScoreResult]
    count:        int
    processing_ms: float


# ── Helpers ───────────────────────────────────────────────────────────────────

def _score_text(text: str) -> tuple[float, float, str]:
    """Score a single text string. Returns (score, confidence, label).
    TextBlob for MVP — swap for transformers pipeline in M2 by replacing
    this function body. The HTTP interface above is stable and will not change.
    """
    try:
        from textblob import TextBlob
        blob        = TextBlob(text)
        raw_score   = float(blob.sentiment.polarity)      # -1.0 .. 1.0
        confidence  = float(max(abs(raw_score), 0.05))    # never return 0
    except ImportError:
        raw_score  = 0.0
        confidence = 0.5

    if raw_score > 0.1:
        label = "positive"
    elif raw_score < -0.1:
        label = "negative"
    else:
        label = "neutral"

    return round(raw_score, 4), round(confidence, 4), label


# ── Lifecycle ─────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def load_model() -> None:
    global _model_loaded
    logger.info("Loading sentiment model...")
    try:
        from textblob import TextBlob  # noqa: F401
        _model_loaded = True
        logger.info("Model loaded (TextBlob MVP). Swap _score_text() body for transformers in M2.")
    except ImportError:
        logger.warning("TextBlob not installed — stub fallback active.")
        _model_loaded = True


# ── Ops Endpoints ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["ops"])
async def health() -> dict:
    import platform
    gpu_available = False
    try:
        import torch
        gpu_available = torch.cuda.is_available()
    except ImportError:
        pass
    return {
        "status":         "ok",
        "model_loaded":   _model_loaded,
        "gpu_available":  gpu_available,
        "uptime_seconds": round(time.time() - _startup_time, 2),
        "python":         platform.python_version(),
        "version":        "0.2.0",
    }


@app.get("/ready", tags=["ops"])
async def ready():
    if not _model_loaded:
        raise HTTPException(status_code=503, detail="Model not yet loaded")
    return {"status": "ready"}


# ── Inference Endpoints ───────────────────────────────────────────────────────

@app.post("/analyze/sentiment", response_model=SentimentResponse, tags=["inference"])
async def analyze_sentiment(req: SentimentRequest) -> SentimentResponse:
    """Score a single text. Preserved for direct use and backward compatibility."""
    if not _model_loaded:
        raise HTTPException(status_code=503, detail="Model not ready")
    start = time.perf_counter()
    score, confidence, label = _score_text(req.text)
    return SentimentResponse(
        score=score,
        confidence=confidence,
        label=label,
        processing_ms=round((time.perf_counter() - start) * 1000, 2),
    )


@app.post("/analyze/batch", response_model=BatchScoreResponse, tags=["inference"])
async def analyze_batch(req: BatchScoreRequest) -> BatchScoreResponse:
    """Score a batch of documents in a single call.

    This is the primary endpoint called by ingestionWorker.ts.
    Replaces N sequential calls to /analyze/sentiment with 1 call.
    Guaranteed to return one result per input item — never drops items.
    ML failure on any item produces a neutral score, never a 500.
    """
    if not _model_loaded:
        raise HTTPException(status_code=503, detail="Model not ready")

    start   = time.perf_counter()
    results = []

    for item in req.items:
        try:
            text             = f"{item.title} {item.body}".strip()
            score, conf, lbl = _score_text(text) if text else (0.0, 0.0, "neutral")
        except Exception as e:
            logger.warning("Score failed for item_id=%d: %s", item.item_id, e)
            score, conf, lbl = 0.0, 0.0, "error"

        results.append(BatchScoreResult(
            item_id=item.item_id,
            score=score,
            confidence=conf,
            label=lbl,
        ))

    processing_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info("Batch scored %d items in %.1fms", len(results), processing_ms)

    return BatchScoreResponse(
        results=results,
        count=len(results),
        processing_ms=processing_ms,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("FASTAPI_HOST", "0.0.0.0"),
        port=int(os.getenv("FASTAPI_PORT", 5000)),
        reload=os.getenv("NODE_ENV") == "development",
    )
