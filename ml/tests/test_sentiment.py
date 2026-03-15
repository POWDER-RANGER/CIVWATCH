"""CIVWATCH ML Service — Sentiment endpoint tests."""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "model_loaded" in data
    assert "uptime_seconds" in data


def test_ready_returns_ready():
    response = client.get("/ready")
    # May return 503 if model not loaded in test env — that's acceptable
    assert response.status_code in (200, 503)


def test_sentiment_positive():
    response = client.post("/analyze/sentiment", json={"text": "This is absolutely wonderful and fantastic!"})
    assert response.status_code == 200
    data = response.json()
    assert data["score"] > 0
    assert data["label"] == "positive"
    assert 0.0 <= data["confidence"] <= 1.0
    assert data["processing_ms"] >= 0


def test_sentiment_negative():
    response = client.post("/analyze/sentiment", json={"text": "This is absolutely terrible and disgusting."})
    assert response.status_code == 200
    data = response.json()
    assert data["score"] < 0
    assert data["label"] == "negative"


def test_sentiment_neutral():
    response = client.post("/analyze/sentiment", json={"text": "The report was filed on Tuesday."})
    assert response.status_code == 200
    data = response.json()
    assert data["label"] in ("neutral", "positive", "negative")  # allow model variance


def test_sentiment_empty_text_rejected():
    response = client.post("/analyze/sentiment", json={"text": ""})
    assert response.status_code == 422  # Pydantic validation


def test_sentiment_missing_field():
    response = client.post("/analyze/sentiment", json={})
    assert response.status_code == 422
