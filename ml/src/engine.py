"""
ml/src/engine.py — CIVWATCH Unified Inference Engine  v0.5.0

Fuses four intelligence layers into a single composite score:
  1. DistilBERT sentiment   (tiered: CUDA > MPS > ONNX > FP32 > TextBlob)
  2. DBSCAN cluster position (delegated to CivicTransparencyPipeline)
  3. Rolling z-score         (temporal, history-aware)
  4. TF-IDF semantic distance (delegated to CivicTransparencyPipeline)

All layers degrade gracefully — if a dep is missing the weight is zeroed
and composite score is re-normalised so the scale stays 0-1.

Usage (from main.py):
    from src.engine import engine          # singleton
    engine.load()                          # call once at startup
    result = engine.score_batch(records)   # call per request
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger("civwatch-engine")


# ── Output types ─────────────────────────────────────────────────────────────

@dataclass
class ScoredRecord:
    timestamp:       str
    source:          str
    category:        str
    value:           float
    text:            str   = ""

    # Layer outputs
    sentiment_score:  float      = 0.0
    sentiment_label:  str        = "neutral"
    confidence:       float      = 0.5
    z_score:          float      = 0.0
    dbscan_cluster:   int        = 0
    anomaly_score:    float      = 0.0
    is_anomalous:     bool       = False
    composite_score:  float      = 0.0
    flags:            List[str]  = field(default_factory=list)
    layers_used:      List[str]  = field(default_factory=list)


@dataclass
class EngineInsight:
    insight_type:     str        # anomaly_spike | trend_shift | cluster_outlier | sentiment_surge
    severity:         str        # low | medium | high | critical
    affected_sources: List[str]
    description:      str
    score_delta:      float
    detected_at:      str        # ISO-8601


@dataclass
class EngineResult:
    records:        List[ScoredRecord]
    insights:       List[EngineInsight]
    stats:          Dict[str, Any]
    processing_ms:  float
    layers_active:  List[str]


# ── Engine ────────────────────────────────────────────────────────────────────

class CivWatchEngine:
    """
    Singleton inference engine.  One instance per process, loaded at startup.
    Thread-safe for read paths; _history append is GIL-protected in CPython.
    """

    # Composite weights — sum must equal 1.0
    W_SENTIMENT: float = 0.35
    W_ZSCORE:    float = 0.35
    W_DBSCAN:    float = 0.20
    W_TFIDF:     float = 0.10

    _HISTORY_LIMIT = 500

    def __init__(self) -> None:
        self._sentiment_model   = None
        self._sentiment_backend = "none"
        self._pipeline          = None   # CivicTransparencyPipeline instance
        self._loaded            = False
        self._device            = "cpu"
        self._history: List[ScoredRecord] = []

    # ── Startup ───────────────────────────────────────────────────────────────

    def load(self) -> None:
        """Detect and load all available inference layers.  Call once at startup."""
        self._load_sentiment()
        self._load_pipeline()
        self._loaded = True
        logger.info(
            "[engine] ready — sentiment=%s device=%s pipeline=%s",
            self._sentiment_backend, self._device,
            "active" if self._pipeline else "unavailable",
        )

    def _load_sentiment(self) -> None:
        """Tiered DistilBERT loader — picks the best available runtime."""

        # Tier 1: CUDA
        try:
            import torch
            if torch.cuda.is_available():
                from transformers import pipeline as P
                self._sentiment_model   = P(
                    "text-classification",
                    model="distilbert-base-uncased-finetuned-sst-2-english",
                    device=0, truncation=True, max_length=512,
                )
                self._sentiment_backend = "distilbert-cuda"
                self._device = "cuda"
                return
        except Exception:
            pass

        # Tier 2: Apple MPS
        try:
            import torch
            if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                from transformers import pipeline as P
                self._sentiment_model   = P(
                    "text-classification",
                    model="distilbert-base-uncased-finetuned-sst-2-english",
                    device="mps", truncation=True, max_length=512,
                )
                self._sentiment_backend = "distilbert-mps"
                self._device = "mps"
                return
        except Exception:
            pass

        # Tier 3: ONNX quantised (best CPU throughput)
        try:
            from optimum.pipelines import pipeline as P
            self._sentiment_model   = P(
                "text-classification",
                model="optimum/distilbert-base-uncased-finetuned-sst-2-english",
                accelerator="ort", truncation=True, max_length=512,
            )
            self._sentiment_backend = "distilbert-onnx"
            self._device = "cpu"
            return
        except Exception:
            pass

        # Tier 4: FP32 CPU
        try:
            from transformers import pipeline as P
            self._sentiment_model   = P(
                "text-classification",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                device=-1, truncation=True, max_length=512,
            )
            self._sentiment_backend = "distilbert-fp32-cpu"
            self._device = "cpu"
            return
        except Exception:
            pass

        # Tier 5: TextBlob (always available after pip install textblob)
        try:
            from textblob import TextBlob  # noqa: F401
            self._sentiment_backend = "textblob"
            return
        except ImportError:
            pass

        self._sentiment_backend = "stub"

    def _load_pipeline(self) -> None:
        """Load CivicTransparencyPipeline for DBSCAN + TF-IDF layers."""
        try:
            from src.models.civic_transparency_pipeline import CivicTransparencyPipeline
            self._pipeline = CivicTransparencyPipeline()
            logger.info("[engine] CivicTransparencyPipeline loaded")
        except Exception as exc:
            logger.warning("[engine] CivicTransparencyPipeline unavailable: %s", exc)

    # ── Public API ────────────────────────────────────────────────────────────

    def score_batch(self, records: List[Dict[str, Any]]) -> EngineResult:
        """
        Run all active inference layers over a batch of civic records.

        records: list of dicts with keys:
            timestamp (str), source (str), category (str), value (float),
            text (str, optional — engine falls back to category+source)
        """
        t0 = time.perf_counter()
        layers_active: List[str] = []

        # Materialise ScoredRecord objects
        scored: List[ScoredRecord] = [
            ScoredRecord(
                timestamp=r.get("timestamp", ""),
                source=r.get("source", ""),
                category=r.get("category", ""),
                value=float(r.get("value", 0)),
                text=(
                    r.get("text") or
                    f"{r.get('category', '')} {r.get('source', '')}"
                ).strip(),
            )
            for r in records
        ]

        # Layer 1 — Sentiment
        scored, layer = self._apply_sentiment(scored)
        if layer:
            layers_active.append(layer)

        # Layer 2 — Z-score (always runs; uses history window for stable baseline)
        scored = self._apply_zscore(scored)
        layers_active.append("zscore")

        # Layer 3 — DBSCAN (via CivicTransparencyPipeline)
        if self._pipeline and len(scored) >= 3:
            scored, layer = self._apply_dbscan(scored)
            if layer:
                layers_active.append(layer)

        # Layer 4 — TF-IDF semantic distance (via CivicTransparencyPipeline)
        if self._pipeline and len(scored) >= 4:
            scored, layer = self._apply_tfidf(scored)
            if layer:
                layers_active.append(layer)

        # Composite
        scored = self._compute_composite(scored, layers_active)

        # Insights from rolling history + this batch
        insights = self._generate_insights(scored)

        # Append to rolling history
        self._history = (self._history + scored)[-self._HISTORY_LIMIT:]

        stats = self._compute_stats(scored)
        ms    = round((time.perf_counter() - t0) * 1000, 2)

        return EngineResult(
            records=scored,
            insights=insights,
            stats=stats,
            processing_ms=ms,
            layers_active=layers_active,
        )

    def score_text(self, text: str) -> Tuple[float, float, str]:
        """Single-text sentiment — backward-compat for /analyze/sentiment."""
        return self._score_one_text(text)

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def backend(self) -> str:
        return self._sentiment_backend

    @property
    def device(self) -> str:
        return self._device

    # ── Layer implementations ─────────────────────────────────────────────────

    def _score_one_text(self, text: str) -> Tuple[float, float, str]:
        if self._sentiment_model is not None:
            try:
                r    = self._sentiment_model(text[:512])[0]
                prob = float(r["score"])
                raw  = prob if r["label"] == "POSITIVE" else -prob
                conf = prob
            except Exception as exc:
                logger.warning("sentiment inference error: %s", exc)
                raw, conf = 0.0, 0.5
        else:
            try:
                from textblob import TextBlob
                b    = TextBlob(text)
                raw  = float(b.sentiment.polarity)
                conf = float(max(abs(raw), 0.05))
            except ImportError:
                raw, conf = 0.0, 0.5

        label = (
            "positive" if raw > 0.1
            else "negative" if raw < -0.1
            else "neutral"
        )
        return round(raw, 4), round(conf, 4), label

    def _apply_sentiment(
        self, records: List[ScoredRecord]
    ) -> Tuple[List[ScoredRecord], str]:
        if not records:
            return records, ""
        texts = [r.text[:512] for r in records]
        try:
            if self._sentiment_model is not None:
                raw_results = self._sentiment_model(texts)
                for rec, r in zip(records, raw_results):
                    prob = float(r["score"])
                    rec.sentiment_score = round(
                        prob if r["label"] == "POSITIVE" else -prob, 4
                    )
                    rec.confidence      = round(prob, 4)
                    rec.sentiment_label = (
                        "positive" if rec.sentiment_score > 0.1
                        else "negative" if rec.sentiment_score < -0.1
                        else "neutral"
                    )
                    rec.layers_used.append("sentiment")
                return records, self._sentiment_backend
            else:
                for rec in records:
                    s, c, lbl = self._score_one_text(rec.text)
                    rec.sentiment_score = s
                    rec.confidence      = c
                    rec.sentiment_label = lbl
                    rec.layers_used.append("sentiment-textblob")
                return records, "textblob"
        except Exception as exc:
            logger.warning("batch sentiment failed: %s", exc)
            return records, ""

    def _apply_zscore(self, records: List[ScoredRecord]) -> List[ScoredRecord]:
        """
        Z-score values against the batch PLUS the rolling history window.
        A larger history = more stable baseline = fewer false positives on cold start.
        """
        hist_values    = [r.value for r in self._history]
        current_values = [r.value for r in records]
        all_values     = np.array(hist_values + current_values, dtype=float)

        if len(all_values) < 2 or all_values.std() == 0:
            for r in records:
                r.z_score     = 0.0
                r.anomaly_score = 0.0
            return records

        mean = float(all_values.mean())
        std  = float(all_values.std())

        for rec in records:
            z               = (rec.value - mean) / std
            rec.z_score     = round(z, 4)
            rec.anomaly_score = round(min(abs(z) / 4.0, 1.0), 4)
            if abs(z) > 2.0:
                rec.flags.append("volume_surge")
            if abs(z) > 3.0:
                rec.flags.append("extreme_volume_spike")
            rec.layers_used.append("zscore")

        return records

    def _apply_dbscan(
        self, records: List[ScoredRecord]
    ) -> Tuple[List[ScoredRecord], str]:
        """
        Delegate to CivicTransparencyPipeline.detect_anomalies().
        Converts ScoredRecords → CivicDocuments, maps results back.
        """
        try:
            from src.models.civic_transparency_pipeline import CivicDocument
            docs = [
                CivicDocument(
                    doc_id=str(i),
                    title=rec.category,
                    body=rec.text,
                    score=rec.anomaly_score,   # feed z-score result as input score
                    confidence=rec.confidence,
                    label=rec.sentiment_label,
                    source_id=rec.source,
                )
                for i, rec in enumerate(records)
            ]
            anomalies = self._pipeline.detect_anomalies(docs)  # type: ignore[union-attr]
            result_map = {a.doc_id: a for a in anomalies}

            for i, rec in enumerate(records):
                ar = result_map.get(str(i))
                if ar:
                    rec.dbscan_cluster = ar.cluster_id
                    if ar.is_anomaly:
                        rec.flags.append("dbscan_outlier")
                        rec.layers_used.append("dbscan")

            return records, "dbscan"
        except Exception as exc:
            logger.warning("DBSCAN layer error: %s", exc)
            return records, ""

    def _apply_tfidf(
        self, records: List[ScoredRecord]
    ) -> Tuple[List[ScoredRecord], str]:
        """
        Delegate TF-IDF feature extraction to CivicTransparencyPipeline.preprocess().
        Records whose text is in the top-20th-percentile cosine distance from the
        batch centroid receive a semantic_outlier flag.
        """
        try:
            from src.models.civic_transparency_pipeline import CivicDocument
            from sklearn.metrics.pairwise import cosine_distances

            docs = [
                CivicDocument(
                    doc_id=str(i),
                    title=rec.category,
                    body=rec.text,
                    score=rec.anomaly_score,
                )
                for i, rec in enumerate(records)
            ]
            mat, _ = self._pipeline.preprocess(docs)  # type: ignore[union-attr]

            if mat.shape[1] == 0:
                return records, ""

            centroid  = mat.mean(axis=0, keepdims=True)
            distances = cosine_distances(mat, centroid).flatten()
            threshold = float(np.percentile(distances, 80))

            for i, rec in enumerate(records):
                if distances[i] >= threshold:
                    rec.flags.append("semantic_outlier")
                    rec.layers_used.append("tfidf")

            return records, "tfidf"
        except Exception as exc:
            logger.warning("TF-IDF layer error: %s", exc)
            return records, ""

    def _compute_composite(
        self, records: List[ScoredRecord], layers_active: List[str]
    ) -> List[ScoredRecord]:
        """
        Weighted composite: missing layers contribute zero — remaining weights
        are re-normalised so the score stays 0-1 and doesn't deflate when
        DBSCAN or TF-IDF are unavailable.
        """
        has_sentiment = any(l in layers_active for l in ("textblob", self._sentiment_backend))
        has_dbscan    = "dbscan" in layers_active
        has_tfidf     = "tfidf"  in layers_active

        active_weight = (
            (self.W_SENTIMENT if has_sentiment else 0.0) +
            self.W_ZSCORE +
            (self.W_DBSCAN if has_dbscan else 0.0) +
            (self.W_TFIDF  if has_tfidf  else 0.0)
        ) or 1.0

        for rec in records:
            raw = (
                abs(rec.sentiment_score) * (self.W_SENTIMENT if has_sentiment else 0.0) +
                rec.anomaly_score        * self.W_ZSCORE +
                (1.0 if rec.dbscan_cluster == -1 else 0.0) * (self.W_DBSCAN if has_dbscan else 0.0) +
                (0.5 if "semantic_outlier" in rec.flags else 0.0) * (self.W_TFIDF if has_tfidf else 0.0)
            )
            rec.composite_score = round(min(raw / active_weight, 1.0), 4)
            rec.is_anomalous    = rec.composite_score > 0.60
            # Promote anomaly_score to composite for downstream consistency
            rec.anomaly_score   = rec.composite_score

        return records

    def _generate_insights(
        self, records: List[ScoredRecord]
    ) -> List[EngineInsight]:
        insights: List[EngineInsight] = []
        if not records:
            return insights

        scores = [r.composite_score for r in records]
        now    = datetime.utcnow().isoformat()

        # 1 — Critical anomaly cluster
        critical = [r for r in records if r.composite_score >= 0.85]
        if critical:
            max_s = max(r.composite_score for r in critical)
            insights.append(EngineInsight(
                insight_type="anomaly_spike",
                severity="critical" if max_s >= 0.90 else "high",
                affected_sources=list({r.source for r in critical}),
                description=(
                    f"{len(critical)} critical anomal{'y' if len(critical)==1 else 'ies'} "
                    f"(max score={max_s:.3f})"
                ),
                score_delta=round(max_s - float(np.mean(scores)), 4),
                detected_at=now,
            ))

        # 2 — Negative sentiment surge
        negative = [
            r for r in records
            if r.sentiment_label == "negative" and r.confidence > 0.7
        ]
        if negative and len(negative) > len(records) * 0.4:
            insights.append(EngineInsight(
                insight_type="sentiment_surge",
                severity="high" if len(negative) > len(records) * 0.6 else "medium",
                affected_sources=list({r.source for r in negative}),
                description=(
                    f"Negative sentiment surge: {len(negative)}/{len(records)} records "
                    f"({len(negative)/len(records)*100:.0f}%)"
                ),
                score_delta=round(float(np.mean([r.sentiment_score for r in negative])), 4),
                detected_at=now,
            ))

        # 3 — Trend shift vs rolling history
        if len(self._history) >= 20:
            hist_mean  = float(np.mean([r.composite_score for r in self._history]))
            batch_mean = float(np.mean(scores))
            hist_std   = float(np.std([r.composite_score for r in self._history])) or 0.01
            z          = (batch_mean - hist_mean) / hist_std

            if abs(z) >= 2.0:
                direction = "surge" if z > 0 else "drop"
                insights.append(EngineInsight(
                    insight_type="trend_shift",
                    severity=(
                        "critical" if abs(z) > 3.5
                        else "high" if abs(z) > 2.5
                        else "medium"
                    ),
                    affected_sources=list({r.source for r in records}),
                    description=(
                        f"Score {direction} vs {len(self._history)}-record baseline "
                        f"(z={z:.2f})"
                    ),
                    score_delta=round(batch_mean - hist_mean, 4),
                    detected_at=now,
                ))

        return insights

    def _compute_stats(self, records: List[ScoredRecord]) -> Dict[str, Any]:
        if not records:
            return {}
        scores = [r.composite_score for r in records]
        return {
            "total":          len(records),
            "anomalous":      sum(1 for r in records if r.is_anomalous),
            "anomaly_rate":   round(sum(1 for r in records if r.is_anomalous) / len(records), 4),
            "mean_score":     round(float(np.mean(scores)), 4),
            "max_score":      round(float(np.max(scores)), 4),
            "critical_count": sum(1 for r in records if r.composite_score >= 0.85),
            "sentiment_dist": {
                "positive": sum(1 for r in records if r.sentiment_label == "positive"),
                "negative": sum(1 for r in records if r.sentiment_label == "negative"),
                "neutral":  sum(1 for r in records if r.sentiment_label == "neutral"),
            },
            "flags_dist":   self._count_flags(records),
            "history_size": len(self._history),
        }

    @staticmethod
    def _count_flags(records: List[ScoredRecord]) -> Dict[str, int]:
        counts: Dict[str, int] = {}
        for r in records:
            for f in r.flags:
                counts[f] = counts.get(f, 0) + 1
        return counts


# ── Singleton ─────────────────────────────────────────────────────────────────
engine = CivWatchEngine()
