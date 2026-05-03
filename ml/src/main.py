"""
CIVWATCH ML Service — Production FastAPI

Endpoints:
  GET  /health           — liveness probe
  POST /predict          — single-item scoring
  POST /analyze/batch    — batch scoring (called by ingestionWorker)
  POST /anomalies/detect — DBSCAN anomaly detection on score vectors
"""

import os
import time
import logging
from typing import List, Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("civwatch-ml")

app = FastAPI(
    title="CIVWATCH ML Service",
    description="Civic document scoring and anomaly detection",
    version="2.0.0",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_CIVIC_CORPUS = [
    "budget deficit emergency spending increase tax hike",
    "contract awarded no-bid sole source procurement override",
    "executive session closed meeting public excluded",
    "variance granted zoning override developer exemption",
    "audit finding misappropriation fund transfer irregularity",
    "resignation fired terminated under investigation official",
    "lawsuit settlement payment taxpayer liability judgment",
    "emergency ordinance passed without public comment period",
    "police use of force complaint sustained officer misconduct",
    "conflict of interest recusal failure board member vote",
    "campaign donation contractor awarded bid corruption",
    "water contamination lead levels exceeded EPA violation",
    "school board vote curriculum removal book ban",
    "pension fund deficit underfunded liability shortfall",
    "annexation rezoning approved without environmental review",
    "lobbyist registered influence legislation amendment",
    "tax increment financing TIF district diversion",
    "federal grant misused clawback repayment required",
    "public comment period waived emergency declaration",
    "redistricting gerrymandering challenge filed court",
    "regular meeting agenda approved minutes recorded",
    "annual budget adopted fiscal year appropriations",
    "road maintenance schedule pothole repair crew",
    "park hours updated seasonal recreation program",
    "library board approved new book acquisitions",
    "utility rate review standard annual adjustment",
    "employee recognition award service years",
    "recycling schedule holiday pickup reminder",
    "public works department infrastructure update",
    "city hall office hours updated holiday closure",
    "planning commission approved variance minor adjustment",
    "fire department annual inspection report",
    "school calendar approved board vote",
    "transit route schedule adjustment minor",
    "permit issued building standard residential",
    "water main replacement scheduled project",
    "community center rental availability",
    "budget amendment routine transfer approved",
    "ordinance reading second passed standard",
    "council meeting quorum achieved vote recorded",
]
_CIVIC_LABELS = [1] * 20 + [0] * 20

_CONCERN_KEYWORDS = [
    "no-bid", "sole source", "closed session", "executive session",
    "misappropriation", "conflict of interest", "under investigation",
    "emergency ordinance", "waived", "override", "deficit", "violation",
    "contamination", "misconduct", "corruption", "lawsuit", "settlement",
    "gerrymandering", "clawback", "misused", "underfunded", "irregularity",
    "recusal", "exemption", "diversion", "ban",
]


class _ScoringModel:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3), max_features=8000,
            sublinear_tf=True, stop_words="english"
        )
        self.classifier = LogisticRegression(
            C=1.0, max_iter=1000, solver="lbfgs", class_weight="balanced"
        )
        X = self.vectorizer.fit_transform(_CIVIC_CORPUS)
        self.classifier.fit(X, _CIVIC_LABELS)
        logger.info("[civwatch-ml] Scoring model ready")

    def score(self, title: str, body: str) -> dict:
        text = f"{title} {body}".lower().strip()
        if not text:
            return {"score": 0.0, "confidence": 0.0, "label": "unscored"}
        vec = self.vectorizer.transform([text])
        proba = self.classifier.predict_proba(vec)[0]
        concern_prob = float(proba[1])
        boost = min(sum(1 for kw in _CONCERN_KEYWORDS if kw in text) * 0.04, 0.25)
        raw_score = min(concern_prob + boost, 1.0)
        confidence = float(abs(raw_score - 0.5) * 2)
        if raw_score >= 0.65:
            label = "high_concern"
        elif raw_score >= 0.40:
            label = "moderate_concern"
        else:
            label = "routine"
        return {"score": round(raw_score, 6), "confidence": round(confidence, 6), "label": label}


_model: Optional[_ScoringModel] = None


@app.on_event("startup")
async def startup_event():
    global _model
    _model = _ScoringModel()
    logger.info("[civwatch-ml] Service ready")


class SingleItem(BaseModel):
    title: str = Field(default="")
    body: str = Field(default="")


class BatchItem(BaseModel):
    item_id: int
    title: str = Field(default="")
    body: str = Field(default="")


class BatchRequest(BaseModel):
    items: List[BatchItem]


class ScoreResult(BaseModel):
    item_id: int
    score: float
    confidence: float
    label: str


class BatchResponse(BaseModel):
    results: List[ScoreResult]
    processed: int
    elapsed_ms: float


class AnomalyRequest(BaseModel):
    scores: List[float]
    eps: float = Field(default=0.15)
    min_samples: int = Field(default=3)


class AnomalyResponse(BaseModel):
    anomaly_indices: List[int]
    cluster_labels: List[int]
    n_clusters: int
    n_anomalies: int


@app.get("/health")
def health():
    return {"status": "ok", "service": "CIVWATCH ML", "version": "2.0.0", "model_ready": _model is not None}


@app.post("/predict", response_model=ScoreResult)
def predict(item: SingleItem):
    if _model is None:
        raise HTTPException(status_code=503, detail="Model not ready")
    return ScoreResult(item_id=0, **_model.score(item.title, item.body))


@app.post("/analyze/batch", response_model=BatchResponse)
def analyze_batch(req: BatchRequest):
    """Batch scoring endpoint — called by ingestionWorker.ts POST /api/sources/:id/run"""
    if _model is None:
        raise HTTPException(status_code=503, detail="Model not ready")
    if len(req.items) > 200:
        raise HTTPException(status_code=400, detail="Max 200 items per batch")
    t0 = time.perf_counter()
    results = [ScoreResult(item_id=item.item_id, **_model.score(item.title, item.body[:2000])) for item in req.items]
    elapsed = round((time.perf_counter() - t0) * 1000, 2)
    logger.info(f"[civwatch-ml] Batch: {len(results)} items in {elapsed}ms")
    return BatchResponse(results=results, processed=len(results), elapsed_ms=elapsed)


@app.post("/anomalies/detect", response_model=AnomalyResponse)
def detect_anomalies(req: AnomalyRequest):
    """DBSCAN anomaly detection on document score vectors"""
    if len(req.scores) < 2:
        return AnomalyResponse(anomaly_indices=[], cluster_labels=[], n_clusters=0, n_anomalies=0)
    X = StandardScaler().fit_transform(np.array(req.scores).reshape(-1, 1))
    labels = DBSCAN(eps=req.eps, min_samples=req.min_samples).fit_predict(X)
    anomaly_indices = [int(i) for i, lbl in enumerate(labels) if lbl == -1]
    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    logger.info(f"[civwatch-ml] DBSCAN: {n_clusters} clusters, {len(anomaly_indices)} anomalies")
    return AnomalyResponse(
        anomaly_indices=anomaly_indices,
        cluster_labels=[int(l) for l in labels],
        n_clusters=n_clusters,
        n_anomalies=len(anomaly_indices),
    )


if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
