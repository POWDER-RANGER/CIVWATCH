"""
CIVWATCH ML Service — v0.5.0

Thin FastAPI shell.  All ML logic lives in src/engine.py.
Routes only: validate input with Pydantic, delegate to engine, serialise output.

Backward-compatible contract (ingest.ts, aggregate.ts depend on these fields):
  /predict        → anomaly_score, is_anomalous, z_score, flags   (unchanged)
                    + composite_score, sentiment_score,
                      sentiment_label, layers_used, insights       (new, additive)
  /score/anomaly  → anomaly_score, is_anomalous, reason,
                      z_score, flags                               (unchanged)
  /analyze/*      → score, confidence, label, processing_ms       (unchanged)
"""
from __future__ import annotations

import logging
import os
import time
from typing import Any, Dict, List

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.engine import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_startup_time = time.time()

app = FastAPI(
    title="CIVWATCH ML Service",
    description="Unified civic anomaly intelligence — sentiment + DBSCAN + z-score + TF-IDF.",
    version="0.5.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:4000").split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# ── Pydantic schemas ──────────────────────────────────────────────────────────

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


class CivicRecord(BaseModel):
    timestamp:  str   = Field(..., description="ISO-8601 timestamp")
    source:     str   = Field(..., description="Data source identifier")
    category:   str   = Field(..., description="Event category")
    value:      float = Field(..., description="Numeric value to score")
    text:       str   = Field(default="", description="Optional free text for NLP layers")

class PredictRequest(BaseModel):
    records: List[CivicRecord] = Field(..., min_length=1, max_length=500)

class PredictResult(BaseModel):
    # Existing fields — unchanged for backward compat
    timestamp:     str
    source:        str
    category:      str
    value:         float
    anomaly_score: float
    is_anomalous:  bool
    z_score:       float
    flags:         List[str]
    # New fields — additive, ingest.ts can ignore safely
    composite_score:  float
    sentiment_score:  float
    sentiment_label:  str
    layers_used:      List[str]

class PredictResponse(BaseModel):
    results:        List[PredictResult]
    count:          int
    anomalous:      int
    processing_ms:  float
    layers_active:  List[str]
    insights:       List[Dict[str, Any]]


class AnomalyRequest(BaseModel):
    geo_cell:        str
    category:        str
    window_count:    int
    baseline_counts: List[int] = Field(..., min_length=1)
    avg_confidence:  float     = Field(0.5, ge=0.0, le=1.0)

class AnomalyResponse(BaseModel):
    anomaly_score: float
    is_anomalous:  bool
    reason:        Dict[str, str]
    z_score:       float
    flags:         List[str]


# ── Lifecycle ─────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup() -> None:
    engine.load()


# ── Ops ───────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["ops"])
async def health() -> dict:
    import platform
    gpu = False
    try:
        import torch
        gpu = torch.cuda.is_available()
    except ImportError:
        pass
    return {
        "status":          "ok",
        "model_loaded":    engine.is_loaded,
        "model_backend":   engine.backend,
        "device":          engine.device,
        "gpu_available":   gpu,
        "uptime_seconds":  round(time.time() - _startup_time, 2),
        "python":          platform.python_version(),
        "version":         "0.5.0",
    }

@app.get("/ready", tags=["ops"])
async def ready():
    if not engine.is_loaded:
        raise HTTPException(503, "Engine not ready")
    return {"status": "ready"}


# ── Inference ─────────────────────────────────────────────────────────────────

@app.post("/analyze/sentiment", response_model=SentimentResponse, tags=["inference"])
async def analyze_sentiment(req: SentimentRequest) -> SentimentResponse:
    """Single-text sentiment.  Backward-compatible with all existing callers."""
    if not engine.is_loaded:
        raise HTTPException(503, "Engine not ready")
    t0 = time.perf_counter()
    score, conf, label = engine.score_text(req.text)
    return SentimentResponse(
        score=score, confidence=conf, label=label,
        processing_ms=round((time.perf_counter() - t0) * 1000, 2),
    )


@app.post("/analyze/batch", response_model=BatchScoreResponse, tags=["inference"])
async def analyze_batch(req: BatchScoreRequest) -> BatchScoreResponse:
    """
    Batch sentiment — primary endpoint called by ingestionWorker.ts.
    Delegates to engine.score_batch so DistilBERT runs as a single forward pass.
    1:1 input/output guaranteed; per-item errors produce neutral score.
    """
    if not engine.is_loaded:
        raise HTTPException(503, "Engine not ready")
    t0 = time.perf_counter()
    records = [
        {
            "timestamp": "",
            "source":    str(item.item_id),
            "category":  "",
            "value":     0.0,
            "text":      f"{item.title} {item.body}".strip(),
        }
        for item in req.items
    ]
    result  = engine.score_batch(records)
    by_src  = {r.source: r for r in result.records}
    results = [
        BatchScoreResult(
            item_id=item.item_id,
            score=by_src[str(item.item_id)].sentiment_score
                  if str(item.item_id) in by_src else 0.0,
            confidence=by_src[str(item.item_id)].confidence
                       if str(item.item_id) in by_src else 0.5,
            label=by_src[str(item.item_id)].sentiment_label
                  if str(item.item_id) in by_src else "neutral",
        )
        for item in req.items
    ]
    return BatchScoreResponse(
        results=results, count=len(results),
        processing_ms=round((time.perf_counter() - t0) * 1000, 2),
    )


@app.post("/predict", response_model=PredictResponse, tags=["inference"])
async def predict(req: PredictRequest) -> PredictResponse:
    """
    Full composite inference — called by /api/ingest and /api/anomalies cold-start.
    Returns all four layer outputs plus engine insights.
    """
    if not engine.is_loaded:
        raise HTTPException(503, "Engine not ready")

    records = [r.model_dump() for r in req.records]
    result  = engine.score_batch(records)

    out = [
        PredictResult(
            timestamp=r.timestamp,
            source=r.source,
            category=r.category,
            value=r.value,
            anomaly_score=r.anomaly_score,
            is_anomalous=r.is_anomalous,
            z_score=r.z_score,
            flags=r.flags,
            composite_score=r.composite_score,
            sentiment_score=r.sentiment_score,
            sentiment_label=r.sentiment_label,
            layers_used=r.layers_used,
        )
        for r in result.records
    ]

    insights_raw = [
        {
            "insight_type":     i.insight_type,
            "severity":         i.severity,
            "affected_sources": i.affected_sources,
            "description":      i.description,
            "score_delta":      i.score_delta,
            "detected_at":      i.detected_at,
        }
        for i in result.insights
    ]

    return PredictResponse(
        results=out,
        count=len(out),
        anomalous=sum(1 for r in out if r.is_anomalous),
        processing_ms=result.processing_ms,
        layers_active=result.layers_active,
        insights=insights_raw,
    )


@app.post("/score/anomaly", response_model=AnomalyResponse, tags=["inference"])
async def score_anomaly(req: AnomalyRequest) -> AnomalyResponse:
    """
    Volume anomaly endpoint — preserved unchanged for aggregate.ts backward compat.
    """
    if not engine.is_loaded:
        raise HTTPException(503, "Engine not ready")

    baseline = np.array(req.baseline_counts, dtype=float)
    if len(baseline) == 0 or baseline.std() == 0:
        z, flags = 0.0, []
    else:
        z     = float((req.window_count - baseline.mean()) / baseline.std())
        flags = []
        if z > 2.0: flags.append("volume_surge")
        if z > 3.0: flags.append("extreme_volume_spike")
        if req.avg_confidence < 0.3: flags.append("low_confidence_cluster")

    anomaly_score = round(min(abs(z) / 4.0, 1.0), 4)
    return AnomalyResponse(
        anomaly_score=anomaly_score,
        is_anomalous=anomaly_score > 0.75,
        reason={
            "human": (
                f"{req.window_count / max(float(baseline.mean()), 1.0):.1f}x above "
                f"{len(baseline)}-period baseline (z={z:.2f})"
            ),
            "code": "volume_anomaly" if z > 2 else "normal",
        },
        z_score=round(z, 4),
        flags=flags,
    )


@app.get("/insights", tags=["inference"])
async def get_insights() -> dict:
    """
    Latest engine insights derived from the in-memory rolling history window.
    Frontend polls this to populate the Insights panel introduced in Sprint C.
    """
    if not engine.is_loaded:
        raise HTTPException(503, "Engine not ready")
    if not engine._history:
        return {"insights": [], "history_size": 0, "backend": engine.backend}

    # Run insight generation over the most recent 100 history records
    result = engine._generate_insights(engine._history[-100:])
    return {
        "insights": [
            {
                "insight_type":     i.insight_type,
                "severity":         i.severity,
                "affected_sources": i.affected_sources,
                "description":      i.description,
                "score_delta":      i.score_delta,
                "detected_at":      i.detected_at,
            }
            for i in result
        ],
        "history_size": len(engine._history),
        "backend":      engine.backend,
    }
