"""
CIVWATCH ML Service — v0.4.0
FastAPI inference service: sentiment analysis, volume anomaly detection, batch predict.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict
import logging
import os
import time
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CIVWATCH ML Service",
    description="Sentiment analysis and anomaly detection for CIVWATCH.",
    version="0.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:4000").split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

_model_loaded: bool = False
_startup_time: float = time.time()


# ── Pydantic Models ────────────────────────────────────────────────────────────

class SentimentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)

class SentimentResponse(BaseModel):
    score:         float
    confidence:    float
    label:         str
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
    results:       List[BatchScoreResult]
    count:         int
    processing_ms: float

class AnomalyRequest(BaseModel):
    geo_cell:        str       = Field(..., description="Geographic cell ID (e.g., US-IA-019)")
    category:        str       = Field(..., description="Event category (e.g., police_complaint)")
    window_count:    int       = Field(..., ge=0, description="Current time window count")
    baseline_counts: List[int] = Field(..., min_length=1, description="Historical counts")
    avg_confidence:  float     = Field(0.5, ge=0.0, le=1.0)

class AnomalyResponse(BaseModel):
    anomaly_score: float = Field(..., ge=0.0, le=1.0)
    is_anomalous:  bool
    reason:        Dict[str, str]
    z_score:       float
    flags:         List[str]

# ── /predict Pydantic schema (resolves issue #9) ───────────────────────────────

class CivicRecord(BaseModel):
    """Single civic record for anomaly prediction."""
    timestamp:  str   = Field(..., description="ISO-8601 timestamp")
    source:     str   = Field(..., description="Data source identifier")
    category:   str   = Field(..., description="Event category")
    value:      float = Field(..., description="Numeric value to score")

class PredictRequest(BaseModel):
    records: List[CivicRecord] = Field(
        ..., min_length=1, max_length=500,
        description="Batch of civic records to score for anomalies"
    )

class PredictResult(BaseModel):
    timestamp:     str
    source:        str
    category:      str
    value:         float
    anomaly_score: float = Field(..., ge=0.0, le=1.0)
    is_anomalous:  bool
    z_score:       float
    flags:         List[str]

class PredictResponse(BaseModel):
    results:       List[PredictResult]
    count:         int
    anomalous:     int
    processing_ms: float


# ── Helpers ────────────────────────────────────────────────────────────────────

def _score_text(text: str) -> tuple:
    """Score a single text. Returns (score, confidence, label).
    TextBlob for MVP — swap this function body for transformers in Phase 3.
    Both /analyze/sentiment and /analyze/batch share this function;
    one swap upgrades both endpoints simultaneously.
    # Phase 3: return CivicTransparencyPipeline.score(text)
    """
    try:
        from textblob import TextBlob
        blob       = TextBlob(text)
        raw_score  = float(blob.sentiment.polarity)
        confidence = float(max(abs(raw_score), 0.05))
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


# ── Lifecycle ──────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def load_model() -> None:
    global _model_loaded
    logger.info("Loading sentiment model...")
    try:
        from textblob import TextBlob  # noqa: F401
        _model_loaded = True
        logger.info("Model loaded (TextBlob MVP). Swap _score_text() for transformers in Phase 3.")
    except ImportError:
        logger.warning("TextBlob not installed — stub fallback active.")
        _model_loaded = True


# ── Ops ────────────────────────────────────────────────────────────────────────

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
        "version":        "0.4.0",
    }

@app.get("/ready", tags=["ops"])
async def ready():
    if not _model_loaded:
        raise HTTPException(status_code=503, detail="Model not yet loaded")
    return {"status": "ready"}


# ── Inference ──────────────────────────────────────────────────────────────────

@app.post("/analyze/sentiment", response_model=SentimentResponse, tags=["inference"])
async def analyze_sentiment(req: SentimentRequest) -> SentimentResponse:
    """Score a single text. Preserved for direct use and backward compatibility."""
    if not _model_loaded:
        raise HTTPException(status_code=503, detail="Model not ready")
    start = time.perf_counter()
    score, confidence, label = _score_text(req.text)
    return SentimentResponse(
        score=score, confidence=confidence, label=label,
        processing_ms=round((time.perf_counter() - start) * 1000, 2),
    )

@app.post("/analyze/batch", response_model=BatchScoreResponse, tags=["inference"])
async def analyze_batch(req: BatchScoreRequest) -> BatchScoreResponse:
    """Score a batch of documents in a single call.
    Primary endpoint called by ingestionWorker.ts.
    Guaranteed 1:1 input/output — never drops items. Per-item errors produce neutral score.
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
        results.append(BatchScoreResult(item_id=item.item_id, score=score, confidence=conf, label=lbl))
    processing_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info("Batch scored %d items in %.1fms", len(results), processing_ms)
    return BatchScoreResponse(results=results, count=len(results), processing_ms=processing_ms)

@app.post("/score/anomaly", response_model=AnomalyResponse, tags=["inference"])
async def score_anomaly(req: AnomalyRequest) -> AnomalyResponse:
    """Detect volume anomalies in report clusters vs rolling baseline.

    The load-bearing intelligence endpoint. Called by aggregate.ts after
    every time-window rollup. Returns semantic flags the alert engine
    matches against directly — no downstream translation needed.

    Threshold: anomaly_score > 0.75 → is_anomalous = True
    Flags:     volume_surge (z>2), extreme_volume_spike (z>3),
               low_confidence_cluster (avg_confidence<0.3)

    Phase 3: replace body with CivicTransparencyPipeline.detect_anomalies(data)
    """
    if not _model_loaded:
        raise HTTPException(status_code=503, detail="Model not ready")

    start    = time.perf_counter()
    baseline = np.array(req.baseline_counts)

    if len(baseline) == 0 or baseline.std() == 0:
        z     = 0.0
        flags = []
    else:
        z     = float((req.window_count - baseline.mean()) / baseline.std())
        flags = []
        if z > 2.0: flags.append("volume_surge")
        if z > 3.0: flags.append("extreme_volume_spike")
        if req.avg_confidence < 0.3: flags.append("low_confidence_cluster")

    anomaly_score = min(abs(z) / 4.0, 1.0)
    is_anomalous  = anomaly_score > 0.75

    reason = {
        "human": f"{req.window_count / max(float(baseline.mean()), 1.0):.1f}x above "
                 f"{len(baseline)}-period baseline (z={z:.2f})",
        "code":  "volume_anomaly" if z > 2 else "normal",
    }

    ms = (time.perf_counter() - start) * 1000
    logger.info("Anomaly: %s/%s z=%.2f score=%.3f flags=%s ms=%.1f",
                req.geo_cell, req.category, z, anomaly_score, flags, ms)

    return AnomalyResponse(
        anomaly_score=round(anomaly_score, 4),
        is_anomalous=is_anomalous,
        reason=reason,
        z_score=round(z, 4),
        flags=flags,
    )


# ── /predict — ML→API bridge (resolves issue #9) ──────────────────────────────

@app.post("/predict", response_model=PredictResponse, tags=["inference"])
async def predict(req: PredictRequest) -> PredictResponse:
    """
    Batch anomaly prediction for civic records.

    Called by /api/ingest (after DB persist) and /api/anomalies (cold-start fallback)
    on the Node.js backend. Each record is z-scored against the full batch baseline —
    outliers are flagged as anomalous and returned for storage in anomaly_events.

    Threshold: anomaly_score > 0.75 → is_anomalous = True
    Flags:     volume_surge (|z|>2), extreme_volume_spike (|z|>3)
    """
    if not _model_loaded:
        raise HTTPException(status_code=503, detail="Model not ready")

    start  = time.perf_counter()
    values = np.array([r.value for r in req.records], dtype=float)

    # z-score the full batch; single-record batches get z=0 (not anomalous by default)
    if len(values) < 2 or values.std() == 0:
        z_scores = np.zeros(len(values))
    else:
        z_scores = (values - values.mean()) / values.std()

    results = []
    for record, z in zip(req.records, z_scores):
        z_f   = float(z)
        flags = []
        if abs(z_f) > 2.0: flags.append("volume_surge")
        if abs(z_f) > 3.0: flags.append("extreme_volume_spike")

        score        = min(abs(z_f) / 4.0, 1.0)
        is_anomalous = score > 0.75

        results.append(PredictResult(
            timestamp=record.timestamp,
            source=record.source,
            category=record.category,
            value=record.value,
            anomaly_score=round(score, 4),
            is_anomalous=is_anomalous,
            z_score=round(z_f, 4),
            flags=flags,
        ))

    ms              = round((time.perf_counter() - start) * 1000, 2)
    anomalous_count = sum(1 for r in results if r.is_anomalous)

    logger.info("Predict: %d records, %d anomalous in %.1fms",
                len(results), anomalous_count, ms)

    return PredictResponse(
        results=results,
        count=len(results),
        anomalous=anomalous_count,
        processing_ms=ms,
    )
