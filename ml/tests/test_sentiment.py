"""Unit tests for ml/main.py sentiment analysis endpoint."""
import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add parent dir to path so we can import main
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app  # noqa: E402

client = TestClient(app)


# ── Health / readiness ──────────────────────────────────────────────────────

def test_health_returns_ok():
    resp = client.get('/health')
    assert resp.status_code == 200
    data = resp.json()
    assert data['status'] == 'ok'
    assert 'model_loaded' in data
    assert 'uptime_seconds' in data


def test_ready_returns_ready_after_startup():
    resp = client.get('/ready')
    # model_loaded is set to True even on stub fallback, so 200 expected
    assert resp.status_code == 200
    assert resp.json()['status'] == 'ready'


# ── Sentiment scoring ───────────────────────────────────────────────────────

def test_positive_text_returns_positive_label():
    resp = client.post('/analyze/sentiment', json={'text': 'This is wonderful, amazing, and great!'})
    assert resp.status_code == 200
    data = resp.json()
    assert data['label'] == 'positive'
    assert data['score'] > 0.1
    assert 0.0 <= data['confidence'] <= 1.0
    assert data['processing_ms'] >= 0


def test_negative_text_returns_negative_label():
    resp = client.post('/analyze/sentiment', json={'text': 'This is terrible, awful, and horrible.'})
    assert resp.status_code == 200
    data = resp.json()
    assert data['label'] == 'negative'
    assert data['score'] < -0.1


def test_neutral_text_returns_neutral_label():
    resp = client.post('/analyze/sentiment', json={'text': 'The meeting is scheduled for Tuesday.'})
    assert resp.status_code == 200
    data = resp.json()
    assert data['label'] == 'neutral'
    assert -0.1 <= data['score'] <= 0.1


def test_confidence_is_nonzero():
    """Confidence should never return 0 (clamped to 0.05 min)."""
    resp = client.post('/analyze/sentiment', json={'text': 'The.'})
    assert resp.status_code == 200
    assert resp.json()['confidence'] >= 0.05


def test_score_is_within_range():
    for text in ['great', 'bad', 'okay', 'the cat sat on the mat']:
        resp = client.post('/analyze/sentiment', json={'text': text})
        data = resp.json()
        assert -1.0 <= data['score'] <= 1.0, f"Score out of range for: {text}"
        assert 0.0 <= data['confidence'] <= 1.0


# ── Validation ──────────────────────────────────────────────────────────────

def test_empty_text_returns_422():
    resp = client.post('/analyze/sentiment', json={'text': ''})
    assert resp.status_code == 422  # Pydantic min_length=1


def test_missing_text_field_returns_422():
    resp = client.post('/analyze/sentiment', json={})
    assert resp.status_code == 422


def test_text_too_long_returns_422():
    resp = client.post('/analyze/sentiment', json={'text': 'x' * 10001})
    assert resp.status_code == 422  # max_length=10000


def test_wrong_content_type_returns_422():
    resp = client.post('/analyze/sentiment', data='plain text', headers={'Content-Type': 'text/plain'})
    assert resp.status_code in (422, 400)


# ── Performance ─────────────────────────────────────────────────────────────

def test_latency_under_1000ms():
    """Single inference must complete under 1 second locally (TextBlob is fast)."""
    import time
    start = time.perf_counter()
    resp = client.post('/analyze/sentiment', json={'text': 'Performance test sentence for latency measurement.'})
    elapsed_ms = (time.perf_counter() - start) * 1000
    assert resp.status_code == 200
    assert elapsed_ms < 1000, f"Inference took {elapsed_ms:.0f}ms, expected <1000ms"


def test_reported_processing_ms_reasonable():
    resp = client.post('/analyze/sentiment', json={'text': 'Quick check.'})
    assert resp.status_code == 200
    assert resp.json()['processing_ms'] < 1000
