from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CIVWATCH ML Service",
    description="Real-time anomaly detection via DBSCAN clustering",
    version="0.1.0-alpha"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DataPoint(BaseModel):
    """A single data point for analysis"""
    timestamp: float
    features: List[float]
    metadata: Optional[dict] = None


class AnomalyRequest(BaseModel):
    """Request body for anomaly detection"""
    points: List[DataPoint]
    eps: float = 0.5
    min_samples: int = 3


class AnomalyResponse(BaseModel):
    """Anomaly detection results"""
    total_points: int
    anomalies: List[int]
    anomaly_count: int
    clusters: int
    threshold: float


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "civwatch-ml",
        "ready": True
    }


@app.get("/status")
def status():
    """Service status"""
    return {
        "service": "civwatch-ml",
        "version": "0.1.0-alpha",
        "phase": "planning",
        "capabilities": [
            "DBSCAN clustering",
            "Anomaly detection",
            "Feature normalization"
        ]
    }


@app.post("/detect", response_model=AnomalyResponse)
def detect_anomalies(request: AnomalyRequest):
    """
    Detect anomalies in a batch of data points using DBSCAN.
    
    Returns:
        - total_points: Total number of points analyzed
        - anomalies: List of indices identified as anomalies (outliers)
        - anomaly_count: Count of anomalies found
        - clusters: Number of clusters identified
        - threshold: EPS threshold used for clustering
    """
    try:
        if not request.points:
            raise HTTPException(status_code=400, detail="No data points provided")
        
        # Extract feature vectors
        features = np.array([p.features for p in request.points])
        
        if features.shape[0] < request.min_samples:
            logger.warning(
                f"Insufficient data points ({features.shape[0]}) "
                f"for min_samples={request.min_samples}"
            )
            return AnomalyResponse(
                total_points=len(request.points),
                anomalies=[],
                anomaly_count=0,
                clusters=0,
                threshold=request.eps
            )
        
        # Normalize features
        scaler = StandardScaler()
        features_normalized = scaler.fit_transform(features)
        
        # Apply DBSCAN
        db = DBSCAN(eps=request.eps, min_samples=request.min_samples)
        labels = db.fit_predict(features_normalized)
        
        # Find anomalies (label == -1)
        anomaly_indices = [i for i, label in enumerate(labels) if label == -1]
        
        # Count unique clusters (excluding noise)
        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        
        logger.info(
            f"Analysis complete: {len(request.points)} points, "
            f"{len(anomaly_indices)} anomalies, {n_clusters} clusters"
        )
        
        return AnomalyResponse(
            total_points=len(request.points),
            anomalies=anomaly_indices,
            anomaly_count=len(anomaly_indices),
            clusters=n_clusters,
            threshold=request.eps
        )
    
    except Exception as e:
        logger.error(f"Anomaly detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = 5000
    logger.info(f"Starting CIVWATCH ML Service on http://localhost:{port}")
    logger.info("  Health: http://localhost:5000/health")
    logger.info("  API Docs: http://localhost:5000/docs")
        unicorn.run(app, host="localhost", port=port, log_level="info")
