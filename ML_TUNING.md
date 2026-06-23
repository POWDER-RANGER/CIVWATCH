# CIVWATCH ML Tuning Guide

> **Reference**: DBSCAN — *A Density-Based Algorithm for Discovering Clusters in Large Spatial Databases with Noise* (Ester et al., KDD-96)  
> **Paper**: [KDD-96 Proceedings](https://www.dbs.ifi.lmu.de/Publikationen/Papers/KDD-96.final.frame.pdf)  
> **Library**: [scikit-learn DBSCAN](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.DBSCAN.html)

---

## Overview

CIVWATCH uses a multi-algorithm ensemble for anomaly detection in civic data. DBSCAN (Density-Based Spatial Clustering of Applications with Noise) is the primary clustering-based detector, complemented by Isolation Forest for tree-based detection and statistical Z-score methods for univariate outliers.

This guide provides operational parameters, tuning heuristics, and validation procedures for the anomaly detection subsystem.

---

## Algorithm Configuration

### DBSCAN Parameters

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `eps` | 0.5 | 0.1 – 2.0 | Maximum distance between two samples for them to be considered neighbors. Smaller values = more clusters, more points marked as noise. |
| `min_samples` | 5 | 3 – 20 | Minimum points required to form a dense region (core point). Higher values = more noise points, more robust to outliers. |
| `metric` | `"euclidean"` | `"euclidean"`, `"manhattan"`, `"cosine"` | Distance metric for neighborhood calculation. Use `"cosine"` for high-dimensional text features. |
| `algorithm` | `"auto"` | `"auto"`, `"ball_tree"`, `"kd_tree"`, `"brute"` | Algorithm for nearest-neighbors search. `"auto"` selects based on data. |
| `leaf_size` | 30 | 10 – 50 | Leaf size for BallTree/KDTree. Affects speed and memory. |
| `n_jobs` | `-1` | `-1` (all cores) | Parallel jobs for computation. |

---

### eps Tuning Heuristic (k-distance graph)

The optimal `eps` value can be estimated using the **k-distance graph method**:

```python
from sklearn.neighbors import NearestNeighbors
import numpy as np
import matplotlib.pyplot as plt

def plot_k_distance(X, k=5):
    """
    Plot the k-distance graph to help select eps.
    The 'elbow' in the curve suggests a good eps value.
    """
    neigh = NearestNeighbors(n_neighbors=k)
    neigh.fit(X)
    distances, indices = neigh.kneighbors(X)
    
    # Sort the k-th nearest neighbor distances
    k_distances = np.sort(distances[:, k-1])
    
    plt.figure(figsize=(10, 6))
    plt.plot(k_distances)
    plt.ylabel(f"{k}-th nearest neighbor distance")
    plt.xlabel("Points (sorted by distance)")
    plt.title("K-Distance Graph for eps Selection")
    plt.grid(True)
    plt.show()
    
    return k_distances

# Usage
# k_dist = plot_k_distance(feature_matrix, k=5)
# Look for the "elbow" — the point where distance starts increasing rapidly
```

**Rule of thumb**: Choose `eps` at the "elbow" of the k-distance curve — the point where the distance to the k-th nearest neighbor starts increasing rapidly.

---

### min_samples Selection

| Data Characteristics | Recommended min_samples | Rationale |
|---------------------|------------------------|-----------|
| Small dataset (< 1000 points) | 3 – 5 | Lower threshold to detect small clusters |
| Medium dataset (1000 – 10000) | 5 – 10 | Balanced for general civic data |
| Large dataset (> 10000) | 10 – 20 | Higher threshold reduces noise sensitivity |
| High-dimensional features | 2 × dimensions | Rule of thumb for dimensional density |
| Known cluster size | cluster_size ÷ 2 | Half the expected smallest cluster |

---

## Feature Engineering for Civic Data

### Feature Categories

```
┌──────────────────────────────────────────────────────────────┐
│              Feature Vector for Anomaly Detection             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Numerical Features           Temporal Features              │
│  ─────────────────            ───────────────                │
│  • Dollar amount              • Hour of day [0-23]           │
│  • Transaction count          • Day of week [0-6]            │
│  • Word count                 • Month [1-12]                 │
│  • Sentiment score [-1,1]     • Days since last activity     │
│  • Entity count               • Quarter [1-4]                │
│                                                              │
│  Categorical (encoded)        Textual Features               │
│  ─────────────────────        ───────────────                │
│  • Source type (one-hot)      • TF-IDF vector (top 500)      │
│  • Entity type                • Topic distribution (LDA)     │
│  • Geographic region          • Key phrase presence          │
│  • Filing type                • Named entity density         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Feature Scaling

DBSCAN is **distance-sensitive** — always scale features before clustering:

```python
from sklearn.preprocessing import StandardScaler, RobustScaler

# StandardScaler: good for normally distributed features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# RobustScaler: better for civic data with outliers (median/IQR based)
scaler = RobustScaler(quantile_range=(25.0, 75.0))
X_scaled = scaler.fit_transform(X)
```

**Recommendation**: Use `RobustScaler` for civic financial data (campaign finance, contracts) due to inherent heavy-tailed distributions.

---

## Ensemble Configuration

### Multi-Detector Voting

CIVWATCH combines three detectors via weighted voting:

```python
ANOMALY_DETECTORS = {
    "dbscan": {
        "enabled": True,
        "weight": 0.4,
        "params": {
            "eps": 0.5,
            "min_samples": 5,
            "metric": "euclidean"
        }
    },
    "isolation_forest": {
        "enabled": True,
        "weight": 0.35,
        "params": {
            "n_estimators": 200,
            "contamination": 0.05,
            "max_samples": "auto",
            "random_state": 42
        }
    },
    "z_score": {
        "enabled": True,
        "weight": 0.25,
        "params": {
            "threshold": 3.0,  # 3 sigma
            "robust": True     # Use MAD instead of std
        }
    }
}

# Ensemble score = weighted average of normalized detector scores
# Final classification: score > 0.7 → anomalous (configurable)
```

### Tuning by Data Domain

| Domain | Recommended Config | Notes |
|--------|-------------------|-------|
| **Campaign Finance** | DBSCAN: eps=0.3, min_samples=8; IF: contamination=0.03 | Focus on unusual contribution patterns, large single donations |
| **Meeting Minutes** | DBSCAN: eps=0.7, min_samples=5; IF: contamination=0.08 | Topic drift, unusual attendee patterns |
| **Contract Awards** | DBSCAN: eps=0.4, min_samples=10; IF: contamination=0.02 | Bid anomalies, vendor concentration |
| **FOIA Requests** | DBSCAN: eps=0.6, min_samples=4; IF: contamination=0.05 | Response time outliers, rejection patterns |
| **311 Service** | DBSCAN: eps=0.5, min_samples=6; IF: contamination=0.06 | Request volume spikes, resolution time anomalies |

---

## Performance Optimization

### For Large Datasets (> 50,000 documents)

| Technique | Speedup | Implementation |
|-----------|---------|----------------|
| HNSW indexing | 10-50x | Use `hnswlib` or `faiss` for approximate nearest neighbors |
| Mini-batch DBSCAN | 5-10x | Process data in batches; merge cluster labels |
| Feature selection | 2-5x | Use PCA or feature importance to reduce dimensionality |
| Sampling | Varies | Use stratified sampling on temporal windows |

### Approximate Nearest Neighbors (ANN) for DBSCAN

```python
# Use hnswlib for large-scale DBSCAN
import hnswlib
import numpy as np
from sklearn.cluster import DBSCAN

def fast_dbscan(X, ef=200, M=16, space='l2', eps=0.5, min_samples=5):
    dim = X.shape[1]
    
    # Build HNSW index
    index = hnswlib.Index(space=space, dim=dim)
    index.init_index(max_elements=len(X), ef_construction=ef, M=M)
    index.add_items(X)
    index.set_ef(ef)
    
    # Query eps-neighborhood for each point
    labels, distances = index.knn_query(X, k=min_samples)
    
    # Pass precomputed distances to DBSCAN
    # ... (custom DBSCAN using precomputed neighbors)
    
    return dbscan_labels
```

---

## Validation & Monitoring

### Silhouette Score

```python
from sklearn.metrics import silhouette_score

# Only compute for non-noise points
mask = labels != -1
if mask.sum() > 1:
    score = silhouette_score(X_scaled[mask], labels[mask])
    print(f"Silhouette Score: {score:.3f}")
    # > 0.5: Good structure
    # 0.25 - 0.5: Reasonable structure
    # < 0.25: Weak structure (consider retuning)
```

### Custom Civic-Specific Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| **Detection Rate** | TP / (TP + FN) | > 0.85 |
| **False Positive Rate** | FP / (FP + TN) | < 0.10 |
| **Precision** | TP / (TP + FP) | > 0.80 |
| **Mean Time to Detect** | Hours from anomaly occurrence to alert | < 4 hours |
| **Alert Fatigue Index** | Alerts per day / Anomalies per day | 1.0 – 1.5 |

### Drift Detection

Monitor for model drift using statistical tests:

```python
from scipy.stats import ks_2samp

def detect_feature_drift(reference_data, current_data, threshold=0.05):
    """
    Kolmogorov-Smirnov test for feature distribution drift.
    Returns features that have drifted beyond threshold.
    """
    drifted = []
    for col in reference_data.columns:
        stat, p_value = ks_2samp(reference_data[col], current_data[col])
        if p_value < threshold:
            drifted.append((col, p_value))
    return drifted

# Run weekly; if >30% of features drifted, trigger model retraining
```

---

## Retraining Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Weekly     │────►│   Feature    │────►│   Drift      │
│   Trigger    │     │   Extract    │     │   Check      │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                             ┌────────────────────┘
                             │ Drift detected?
                             ▼
                    ┌─────────────────┐
                    │  No ──► Continue│
                    │  Yes ──► Retrain │
                    └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Hyperparameter │
                    │  Search (optuna)│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Validate on    │
                    │  Hold-out Set   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Deploy to      │
                    │  Production     │
                    └─────────────────┘
```

---

## See Also

- [Architecture Reference](./ARCHITECTURE.md) — System architecture
- [Performance Guide](./PERFORMANCE.md) — SRE and optimization
- [Data Lineage](./DATA_LINEAGE.md) — Data provenance tracking
- scikit-learn DBSCAN documentation
- Ester et al. (1996) — Original DBSCAN paper
