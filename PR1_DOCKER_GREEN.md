# PR1: Docker Green (Phase 1 Core Implementation)

**Priority:** 🟡 HIGH (unblocks all development)  
**Prerequisites:** PR0 must be merged first  
**Estimated Time:** 2-3 hours  
**Impact:** All 3 services pass Docker healthchecks; foundation code works end-to-end

---

## Overview: What PR1 Implements

| Component | Current | Fix | Result |
|-----------|---------|-----|--------|
| Backend endpoint | Only `/api/status` | Add `/api/health` to match Compose | Healthcheck passes |
| ML service | Just `print()` statement | Implement FastAPI + DBSCAN | Real anomaly detection |
| ML Dockerfile | `pip install \|\| true` (fails silently) | Fix dependency installation | Dependencies actually install |
| Docker Compose | Healthchecks fail | Align ports + endpoints | All services green |
| Frontend | Static header only | Add `/status` API call | Shows "Backend Connected" |

---

## Part 1: Backend — Add `/api/health` Endpoint

**File:** `backend/index.js`  
**Why:** `docker-compose.yml` healthcheck expects `/api/health` but backend only has `/api/status`  
**Time:** 5 minutes

### BEFORE (current)
```javascript
const express = require('express');
const app = express();

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### AFTER (add /api/health)
```javascript
const express = require('express');
const app = express();

const startTime = Date.now();

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  const uptime = (Date.now() - startTime) / 1000;
  res.json({
    status: 'healthy',
    uptime: Math.round(uptime),
    timestamp: new Date().toISOString(),
    version: '0.1.0-alpha'
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('Endpoints: /api/status, /api/health');
});
```

**Commit message:**
```
feat: add /api/health endpoint for Docker healthcheck

Docker Compose healthcheck expects /api/health with:
- status: 'healthy'
- uptime in seconds
- ISO timestamp
- version info

Keeps /api/status for backward compatibility.
```

**Test locally:**
```bash
cd backend
npm install
npm run dev

# In another terminal
curl http://localhost:3000/api/health
# Expected: {"status":"healthy","uptime":X,"timestamp":"2026-02-25T05:...","version":"0.1.0-alpha"}
```

---

## Part 2: ML Service — Implement FastAPI + DBSCAN

**File:** `ml/main.py`  
**Why:** Currently just a print statement; needs real HTTP server with anomaly detection  
**Time:** 20 minutes

### BEFORE (current)
```python
print("ML service placeholder")
```

### AFTER (full implementation)
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
import numpy as np
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CIVWATCH ML Service",
    description="Anomaly detection and clustering pipeline",
    version="0.1.0"
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class DataPoint(BaseModel):
    """Single data point for analysis"""
    timestamp: int  # Unix milliseconds
    value: float
    feature_dim_2: float = None  # Optional second dimension
    feature_dim_3: float = None  # Optional third dimension

class AnalysisRequest(BaseModel):
    """Request to analyze multiple data points"""
    data: list[DataPoint]
    eps: float = 0.5  # DBSCAN epsilon (max distance)
    min_samples: int = 3  # Min points to form cluster

class AnomalyResult(BaseModel):
    """Analysis result with clusters and anomalies"""
    total_points: int
    cluster_count: int
    anomaly_count: int
    anomalies: list[dict]
    clusters: dict
    processing_time_ms: float
    timestamp: str

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    version: str
    service: str = "ML"

# Global state
start_time = datetime.now()

@app.on_event("startup")
async def startup():
    logger.info("ML service starting...")
    logger.info(f"DBSCAN clustering available")
    logger.info(f"Listening on port 5000")

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for Docker healthcheck and orchestration"""
    uptime = (datetime.now() - start_time).total_seconds()
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="0.1.0-alpha"
    )

@app.get("/status")
async def status():
    """Service status (compatibility with backend pattern)"""
    return {
        "status": "ok",
        "service": "ML",
        "version": "0.1.0-alpha",
        "capabilities": ["DBSCAN", "anomaly-detection", "clustering"]
    }

@app.post("/api/analyze", response_model=AnomalyResult)
async def analyze_data(request: AnalysisRequest):
    """
    Analyze data points for anomalies using DBSCAN clustering.
    
    DBSCAN (Density-Based Spatial Clustering of Applications with Noise):
    - Groups points that are close together (within eps distance)
    - Marks points that don't fit in any cluster as anomalies (noise/outliers)
    - Robust to outliers without specifying cluster count
    
    Args:
        request: AnalysisRequest with data points and clustering parameters
        
    Returns:
        AnomalyResult with clusters, anomalies, and metadata
    """
    import time
    start = time.time()
    
    try:
        if not request.data:
            raise HTTPException(status_code=400, detail="No data points provided")
        
        logger.info(f"Analyzing {len(request.data)} data points with eps={request.eps}")
        
        # Extract feature vectors from data points
        features = []
        timestamps = []
        for point in request.data:
            features.append([point.value, 
                            point.feature_dim_2 or 0.0,
                            point.feature_dim_3 or 0.0])
            timestamps.append(point.timestamp)
        
        features = np.array(features)
        
        # Normalize features for fair distance comparison
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        # Run DBSCAN
        clustering = DBSCAN(eps=request.eps, min_samples=request.min_samples).fit(features_scaled)
        labels = clustering.labels_
        
        # Parse results
        unique_labels = set(labels)
        clusters = {}
        anomalies = []
        
        for label in unique_labels:
            mask = labels == label
            cluster_indices = np.where(mask)[0].tolist()
            
            if label == -1:
                # Label -1 means anomaly/noise
                for idx in cluster_indices:
                    anomalies.append({
                        "index": idx,
                        "timestamp": timestamps[idx],
                        "raw_value": float(request.data[idx].value),
                        "scaled_value": float(features_scaled[idx][0]),
                        "reason": "density_outlier"
                    })
            else:
                # Normal cluster
                clusters[f"cluster_{label}"] = {
                    "size": len(cluster_indices),
                    "indices": cluster_indices,
                    "centroid": features[mask].mean(axis=0).tolist()
                }
        
        processing_time = (time.time() - start) * 1000  # Convert to ms
        
        result = AnomalyResult(
            total_points=len(request.data),
            cluster_count=len(clusters),
            anomaly_count=len(anomalies),
            anomalies=anomalies,
            clusters=clusters,
            processing_time_ms=round(processing_time, 2),
            timestamp=datetime.now().isoformat()
        )
        
        logger.info(f"Analysis complete: {result.cluster_count} clusters, {result.anomaly_count} anomalies")
        return result
        
    except Exception as e:
        logger.error(f"Error analyzing data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/")
async def root():
    """API documentation endpoint"""
    return {
        "service": "CIVWATCH ML Service",
        "version": "0.1.0-alpha",
        "docs": "/docs",
        "endpoints": {
            "/health": "Health check",
            "/status": "Service status",
            "/api/analyze": "POST: Analyze data for anomalies"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000,
        log_level="info"
    )
```

**Commit message:**
```
feat: implement ML service with DBSCAN clustering

Implement full FastAPI ML service with:
- DBSCAN anomaly detection algorithm
- Data normalization via StandardScaler
- Health and status endpoints for Docker
- POST /api/analyze for real-time clustering
- CORS middleware for frontend integration
- Comprehensive logging and error handling
- Swagger docs auto-generated at /docs

Algorithm: DBSCAN identifies density-based clusters and marks
outliers (points that don't fit any cluster) as anomalies.
```

**Test locally:**
```bash
cd ml
pip install -r requirements.txt
python main.py

# In another terminal
curl http://localhost:5000/health
# Expected: {"status":"healthy","timestamp":"...","version":"0.1.0-alpha","service":"ML"}

# Test anomaly detection
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {"timestamp": 1000, "value": 1.0, "feature_dim_2": 0.5},
      {"timestamp": 2000, "value": 1.1, "feature_dim_2": 0.6},
      {"timestamp": 3000, "value": 1.05, "feature_dim_2": 0.55},
      {"timestamp": 4000, "value": 10.0, "feature_dim_2": 5.0}
    ],
    "eps": 0.5,
    "min_samples": 2
  }'
# Expected: clusters detected + anomaly at index 3 (the outlier 10.0)
```

---

## Part 3: Fix ML Dockerfile

**File:** `ml/Dockerfile.dev`  
**Why:** Current version ignores pip install failures (`|| true`)  
**Time:** 3 minutes

### BEFORE (current)
```dockerfile
FROM python:3.10

WORKDIR /app

# Copy requirements from repo root (WRONG PATH)
COPY requirements.txt .

# Install, but ignore failures (WRONG)
RUN pip install -r requirements.txt || true

COPY . .

CMD ["python", "ml/main.py"]
```

### AFTER (fixed)
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Copy ML requirements from correct path
COPY ml/requirements.txt .

# Install dependencies (fail fast if there's an error)
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run ML service
CMD ["python", "-m", "uvicorn", "ml.main:app", "--host", "0.0.0.0", "--port", "5000"]
```

**Also create:** `ml/requirements.txt` (if it doesn't exist as standalone)

```
fastapi==0.109.0
uvicorn==0.27.0
numpy==1.26.4
scikit-learn==1.4.1
pydantic==2.5.3
python-multipart==0.0.6
```

**Commit message:**
```
fix: correct ML Dockerfile and dependencies

- Use correct requirements.txt path
- Enable fast-fail on install errors (remove || true)
- Use slim base image to reduce size
- Use uvicorn command syntax for proper startup
- Create standalone ml/requirements.txt
```

---

## Part 4: Fix Frontend to Show Backend Connection

**File:** `frontend/src/main.tsx`  
**Why:** Currently just static header; should show we can reach backend  
**Time:** 5 minutes

### BEFORE (current)
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div>
      <h1>CIVWATCH</h1>
      <p>Real-Time Anomaly Detection</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### AFTER (fetch backend status)
```typescript
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function App() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [mlStatus, setMlStatus] = useState<'loading' | 'connected' | 'error'>('loading')

  useEffect(() => {
    // Check backend health
    fetch('http://localhost:3000/api/health')
      .then(res => res.json())
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('error'))

    // Check ML service health
    fetch('http://localhost:5000/health')
      .then(res => res.json())
      .then(() => setMlStatus('connected'))
      .catch(() => setMlStatus('error'))
  }, [])

  const statusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#00ff00'
      case 'error': return '#ff0000'
      default: return '#ffff00'
    }
  }

  const statusText = (status: string) => {
    switch (status) {
      case 'connected': return '✓ Connected'
      case 'error': return '✗ Disconnected'
      default: return '⟳ Checking...'
    }
  }

  return (
    <div style={{ fontFamily: 'monospace', padding: '20px', backgroundColor: '#0f0f0f', color: '#00f7ff', minHeight: '100vh' }}>
      <h1>🔍 CIVWATCH</h1>
      <p>Real-Time Anomaly Detection Platform</p>
      <p style={{ fontSize: '0.9em', color: '#888' }}>v0.1.0-alpha</p>
      
      <hr style={{ borderColor: '#00f7ff', margin: '20px 0' }} />
      
      <h2>System Status</h2>
      <div style={{ marginLeft: '20px' }}>
        <p>
          <span style={{ color: statusColor(backendStatus) }}>●</span>
          {' Backend: '}
          <span style={{ color: statusColor(backendStatus) }}>{statusText(backendStatus)}</span>
        </p>
        <p>
          <span style={{ color: statusColor(mlStatus) }}>●</span>
          {' ML Service: '}
          <span style={{ color: statusColor(mlStatus) }}>{statusText(mlStatus)}</span>
        </p>
      </div>
      
      <hr style={{ borderColor: '#00f7ff', margin: '20px 0' }} />
      
      <p style={{ fontSize: '0.85em', color: '#888' }}>
        Dashboard components coming in Phase 2...
      </p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Commit message:**
```
feat: add backend/ML service health indicators to frontend

Frontend now displays status of:
- Backend API (/api/health)
- ML Service (/health)

Shows loading state while checking, then connected/disconnected.
Cyber-themed styling with status indicators.
```

**Test:**
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:4000
# Should show green checkmarks when docker-compose is running
```

---

## Part 5: Update docker-compose.yml (No Code Changes, Just Verify)

**File:** `docker-compose.yml`  
**Status:** Should already be correct  
**Verify:**

```yaml
services:
  backend:
    # ... existing config ...
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 3
  
  ml:
    # ... existing config ...
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
  
  frontend:
    # ... existing config ...
    # (frontend doesn't need healthcheck, it's a browser app)
```

If not present, add those healthchecks.

---

## Execution Checklist

Run in this order:

```bash
# 1. Create branch
git checkout -b pr/docker-green

# 2. Backend /api/health
vi backend/index.js
# (Replace as shown above)
git add backend/index.js
git commit -m "feat: add /api/health endpoint for Docker healthcheck"

# 3. ML service full implementation
vi ml/main.py
# (Replace entire file as shown above)
git add ml/main.py
git commit -m "feat: implement ML service with DBSCAN clustering"

# 4. Fix ML Dockerfile
vi ml/Dockerfile.dev
# (Update as shown above)
git add ml/Dockerfile.dev

# 5. Create ml/requirements.txt
vi ml/requirements.txt
# (Add dependencies as shown above)
git add ml/requirements.txt
git commit -m "fix: correct ML Dockerfile and dependencies"

# 6. Update frontend
vi frontend/src/main.tsx
# (Replace as shown above)
git add frontend/src/main.tsx
git commit -m "feat: add backend/ML service health indicators to frontend"

# 7. Verify docker-compose.yml has healthchecks
grep -A 4 "healthcheck" docker-compose.yml
# If missing, add them

# 8. Push and create PR
git push origin pr/docker-green
# Create PR on GitHub
```

---

## Testing PR1

After all changes:

```bash
# Clean old containers
docker-compose down -v

# Start fresh
docker-compose up

# In ~30 seconds, all services should report healthy:
# backend: healthy ✓
# ml: healthy ✓
# frontend: running (no healthcheck needed)

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:5000/health

# Test anomaly detection
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"data":[{"timestamp":1000,"value":1.0},{"timestamp":2000,"value":1.1},{"timestamp":3000,"value":10.0}],"eps":0.5,"min_samples":2}'

# Open http://localhost:4000 in browser
# Should show green checkmarks for Backend and ML Service
```

---

## Success Criteria (Docker Green ✓)

After PR1 merge:

- [ ] `docker-compose up` starts all 3 services
- [ ] All healthchecks pass within 30 seconds (status: `healthy`)
- [ ] Backend `/api/health` responds with uptime + timestamp
- [ ] ML service `/health` responds with proper status
- [ ] Frontend displays green checkmarks for both services
- [ ] `curl -X POST http://localhost:5000/api/analyze ...` detects anomalies
- [ ] Tests pass: `npm test` (backend + frontend)
- [ ] No OBELISK references remain in code

---

## What's Next (Phase 1 Continued)

Once PR1 is merged:

1. **PR2: Database Wiring** — PostgreSQL connection pooling + real queries
2. **PR3: Real Tests** — Replace stubs with actual DBSCAN + API tests
3. **PR4: Redis Cache** — Cache layer for ML results + session management

See `NEXT_PHASE.md` for full roadmap.

---

## Questions?

If any steps are unclear, open an issue before executing.
