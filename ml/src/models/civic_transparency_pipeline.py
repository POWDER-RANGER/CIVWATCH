"""
CIVWATCH Civic Transparency ML Pipeline

Provides:
  - Document preprocessing and feature extraction
  - DBSCAN-based anomaly detection on civic record score vectors
  - Temporal trend analysis (rolling z-score on time-series scores)
  - Insight generation for dashboard consumption
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer

logger = logging.getLogger("civwatch-pipeline")


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class CivicDocument:
    doc_id: str
    title: str
    body: str
    score: float = 0.0
    confidence: float = 0.0
    label: str = "unscored"
    published_at: Optional[datetime] = None
    source_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AnomalyResult:
    doc_id: str
    score: float
    is_anomaly: bool
    cluster_id: int
    z_score: float


@dataclass
class PipelineInsight:
    insight_type: str          # 'anomaly_spike' | 'trend_shift' | 'cluster_outlier'
    severity: str              # 'low' | 'medium' | 'high' | 'critical'
    affected_doc_ids: List[str]
    description: str
    score_delta: float
    detected_at: datetime


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------

class CivicTransparencyPipeline:
    """
    End-to-end ML pipeline for civic transparency analysis.

    Usage:
        pipeline = CivicTransparencyPipeline()
        results = pipeline.run(documents)
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        cfg = config or {}
        # DBSCAN parameters
        self.dbscan_eps: float = cfg.get("dbscan_eps", 0.15)
        self.dbscan_min_samples: int = cfg.get("dbscan_min_samples", 3)
        # Trend detection
        self.trend_window: int = cfg.get("trend_window", 10)
        self.anomaly_z_threshold: float = cfg.get("anomaly_z_threshold", 2.0)
        # TF-IDF for text features
        self._vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=2000,
            sublinear_tf=True,
            stop_words="english",
        )
        self._vectorizer_fitted = False
        logger.info("[civwatch-pipeline] Initialized")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def run(self, documents: List[CivicDocument]) -> Dict[str, Any]:
        """
        Full pipeline pass over a batch of scored documents.

        Returns a dict with:
          anomalies  — List[AnomalyResult]
          insights   — List[PipelineInsight]
          stats      — summary statistics
        """
        if not documents:
            return {"anomalies": [], "insights": [], "stats": {}}

        # 1. Score-vector anomaly detection
        anomalies = self.detect_anomalies(documents)

        # 2. Temporal trend analysis
        trend_insights = self._analyze_trends(documents)

        # 3. Cluster outlier insights
        cluster_insights = self._cluster_insights(documents, anomalies)

        all_insights = trend_insights + cluster_insights

        stats = self._compute_stats(documents, anomalies)

        logger.info(
            f"[civwatch-pipeline] Processed {len(documents)} docs | "
            f"{len([a for a in anomalies if a.is_anomaly])} anomalies | "
            f"{len(all_insights)} insights"
        )

        return {
            "anomalies": anomalies,
            "insights": all_insights,
            "stats": stats,
        }

    def detect_anomalies(
        self,
        documents: List[CivicDocument],
        eps: Optional[float] = None,
        min_samples: Optional[int] = None,
    ) -> List[AnomalyResult]:
        """
        DBSCAN anomaly detection on document score vectors.
        Documents with cluster_id == -1 are anomalies.
        """
        if len(documents) < 2:
            return [
                AnomalyResult(
                    doc_id=d.doc_id, score=d.score,
                    is_anomaly=False, cluster_id=0, z_score=0.0
                )
                for d in documents
            ]

        scores = np.array([d.score for d in documents]).reshape(-1, 1)
        scores_scaled = StandardScaler().fit_transform(scores)

        db = DBSCAN(
            eps=eps or self.dbscan_eps,
            min_samples=min_samples or self.dbscan_min_samples,
            metric="euclidean",
        )
        labels = db.fit_predict(scores_scaled)

        # Rolling z-scores
        flat_scores = scores.flatten()
        mean = float(np.mean(flat_scores))
        std = float(np.std(flat_scores)) or 1.0
        z_scores = [(s - mean) / std for s in flat_scores]

        results = []
        for i, doc in enumerate(documents):
            results.append(AnomalyResult(
                doc_id=doc.doc_id,
                score=doc.score,
                is_anomaly=bool(labels[i] == -1),
                cluster_id=int(labels[i]),
                z_score=round(float(z_scores[i]), 4),
            ))

        return results

    def preprocess(
        self, documents: List[CivicDocument]
    ) -> Tuple[np.ndarray, List[str]]:
        """
        TF-IDF feature extraction from document text.
        Returns (feature_matrix, doc_ids).
        """
        texts = [f"{d.title} {d.body}" for d in documents]
        doc_ids = [d.doc_id for d in documents]

        if not self._vectorizer_fitted:
            X = self._vectorizer.fit_transform(texts)
            self._vectorizer_fitted = True
        else:
            X = self._vectorizer.transform(texts)

        return X.toarray(), doc_ids

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _analyze_trends(
        self, documents: List[CivicDocument]
    ) -> List[PipelineInsight]:
        """
        Rolling z-score trend detection.
        Flags windows where mean score shifts > anomaly_z_threshold std devs.
        """
        insights: List[PipelineInsight] = []
        scores = [d.score for d in documents]

        if len(scores) < self.trend_window:
            return insights

        window = self.trend_window
        global_mean = float(np.mean(scores))
        global_std = float(np.std(scores)) or 1.0

        for i in range(len(scores) - window + 1):
            window_scores = scores[i:i + window]
            window_mean = float(np.mean(window_scores))
            z = (window_mean - global_mean) / global_std

            if abs(z) >= self.anomaly_z_threshold:
                affected = [d.doc_id for d in documents[i:i + window]]
                severity = "critical" if abs(z) > 3.0 else "high" if abs(z) > 2.5 else "medium"
                direction = "spike" if z > 0 else "drop"
                insights.append(PipelineInsight(
                    insight_type="trend_shift",
                    severity=severity,
                    affected_doc_ids=affected,
                    description=(
                        f"Score {direction} detected: window mean={window_mean:.3f} "
                        f"(z={z:.2f}) over {window} documents"
                    ),
                    score_delta=round(window_mean - global_mean, 4),
                    detected_at=datetime.utcnow(),
                ))

        return insights

    def _cluster_insights(
        self,
        documents: List[CivicDocument],
        anomalies: List[AnomalyResult],
    ) -> List[PipelineInsight]:
        """Generate insights for anomalous documents flagged by DBSCAN."""
        insights: List[PipelineInsight] = []
        flagged = [a for a in anomalies if a.is_anomaly]

        if not flagged:
            return insights

        doc_map = {d.doc_id: d for d in documents}
        high_score_outliers = [
            f for f in flagged
            if f.score >= 0.65 and abs(f.z_score) >= self.anomaly_z_threshold
        ]

        if high_score_outliers:
            affected_ids = [f.doc_id for f in high_score_outliers]
            max_score = max(f.score for f in high_score_outliers)
            insights.append(PipelineInsight(
                insight_type="anomaly_spike",
                severity="high" if max_score >= 0.80 else "medium",
                affected_doc_ids=affected_ids,
                description=(
                    f"{len(high_score_outliers)} high-concern outlier(s) detected "
                    f"(max score={max_score:.3f}, DBSCAN cluster=-1)"
                ),
                score_delta=round(max_score, 4),
                detected_at=datetime.utcnow(),
            ))

        return insights

    def _compute_stats(
        self,
        documents: List[CivicDocument],
        anomalies: List[AnomalyResult],
    ) -> Dict[str, Any]:
        """Compute summary statistics for a pipeline run."""
        scores = [d.score for d in documents]
        n_anomalies = sum(1 for a in anomalies if a.is_anomaly)
        label_dist: Dict[str, int] = {}
        for d in documents:
            label_dist[d.label] = label_dist.get(d.label, 0) + 1

        return {
            "total_documents": len(documents),
            "mean_score": round(float(np.mean(scores)), 4) if scores else 0.0,
            "max_score": round(float(np.max(scores)), 4) if scores else 0.0,
            "min_score": round(float(np.min(scores)), 4) if scores else 0.0,
            "std_score": round(float(np.std(scores)), 4) if scores else 0.0,
            "n_anomalies": n_anomalies,
            "anomaly_rate": round(n_anomalies / len(documents), 4) if documents else 0.0,
            "label_distribution": label_dist,
        }
