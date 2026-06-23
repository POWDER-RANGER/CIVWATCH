# CIVWATCH Data Lineage

> **Standard**: OpenLineage | **Source**: [openlineage.io](https://openlineage.io/)  
> **Purpose**: Track provenance, transformations, and dependencies across the civic data pipeline

---

## Overview

Data lineage in CIVWATCH provides complete visibility into the lifecycle of every civic document — from ingestion through analysis to final reporting. This enables:

- **Transparency**: Citizens and auditors can trace any analysis result back to source data
- **Debugging**: Engineers can identify where data quality issues originate
- **Compliance**: FOIA and public records laws require data provenance documentation
- **Reproducibility**: ML results can be reproduced given the same source inputs

---

## Lineage Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA LINEAGE ARCHITECTURE                             │
│                                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │  Source  │──►│ Ingest   │──►│  Enrich  │──►│ Analyze  │──►│  Report  │ │
│  │  Layer   │   │  Layer   │   │  Layer   │   │  Layer   │   │  Layer   │ │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘ │
│       │              │              │              │              │      │
│       ▼              ▼              ▼              ▼              ▼      │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    OpenLineage Metadata Store                        │  │
│  │                                                                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │  Runs    │  │ Datasets │  │   Jobs   │  │   Facets         │   │  │
│  │  │          │  │          │  │          │  │   (custom)       │   │  │
│  │  │ run_id   │  │ namespace│  │ name     │  │ - source_type    │   │  │
│  │  │ start_ts │  │ name     │  │ namespace│  │ - confidence     │   │  │
│  │  │ end_ts   │  │ facets   │  │ version  │  │ - anomaly_score  │   │  │
│  │  │ status   │  │          │  │ inputs   │  │ - ml_model_ver   │   │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                   │                                         │
│                                   ▼                                         │
│                           ┌──────────────┐                                 │
│                           │  PostgreSQL  │                                 │
│                           │  (lineage)   │                                 │
│                           └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Lineage Events

### Event Types

| Event | Description | Emitted By |
|-------|-------------|------------|
| `START` | Job execution begins | Pipeline orchestrator |
| `COMPLETE` | Job execution succeeds | Pipeline orchestrator |
| `FAIL` | Job execution fails | Pipeline orchestrator |
| `ABORT` | Job execution aborted | Pipeline orchestrator |
| `RUNNING` | Periodic progress update | Long-running jobs |

### Event Schema (OpenLineage-compatible)

```json
{
  "eventType": "COMPLETE",
  "eventTime": "2026-06-22T14:30:00.000Z",
  "run": {
    "runId": "0190a1b2-c3d4-7e8f-9a0b-1c2d3e4f5a6b",
    "facets": {
      "civwatch": {
        "pipelineVersion": "1.2.3",
        "trigger": "scheduled",
        "sourceIds": ["src_abc123"]
      }
    }
  },
  "job": {
    "namespace": "civwatch.ingestion",
    "name": "rss_feed_fetch",
    "facets": {
      "documentation": {
        "description": "Fetch and parse RSS feed from city council website"
      },
      "sourceCode": {
        "type": "git",
        "url": "https://github.com/POWDER-RANGER/CIVWATCH",
        "version": "abc1234",
        "path": "src/pipeline/rss_fetcher.py"
      }
    }
  },
  "inputs": [
    {
      "namespace": "civwatch.external",
      "name": "rss://cityofkeokuk.org/feed.xml",
      "facets": {
        "schema": {
          "fields": [
            { "name": "title", "type": "string" },
            { "name": "link", "type": "string" },
            { "name": "pubDate", "type": "timestamp" },
            { "name": "content", "type": "string" }
          ]
        }
      }
    }
  ],
  "outputs": [
    {
      "namespace": "civwatch.postgresql",
      "name": "raw_documents",
      "facets": {
        "schema": {
          "fields": [
            { "name": "id", "type": "uuid" },
            { "name": "source_id", "type": "string" },
            { "name": "content_hash", "type": "string" },
            { "name": "raw_content", "type": "text" },
            { "name": "metadata", "type": "jsonb" },
            { "name": "ingested_at", "type": "timestamp" }
          ]
        },
        "lifecycleStateChange": {
          "lifecycleStateChange": "OVERWRITE"
        }
      }
    }
  ],
  "producer": "https://github.com/POWDER-RANGER/CIVWATCH"
}
```

---

## Pipeline Stages

### Stage 1: Source Ingestion

```
External Source (RSS/API/Scraper/File)
    │
    ├── run_id: generated
    ├── input: source URL/file
    ├── transformation: fetch + validate + sanitize
    ├── output: raw_documents table
    └── lineage: source metadata preserved
```

**Emitted events:**
- `START`: Before HTTP request / file read
- `COMPLETE`: After documents persisted to `raw_documents`
- `FAIL`: On network error, parse failure, or validation error

**Custom facets:**
```json
{
  "civwatch_ingestion": {
    "sourceType": "rss",
    "sourceUrl": "https://cityofkeokuk.org/feed.xml",
    "fetchMethod": "https",
    "httpStatus": 200,
    "documentsFetched": 15,
    "documentsNew": 3,
    "fetchDurationMs": 245,
    "contentHash": "sha256:abc123..."
  }
}
```

---

### Stage 2: Document Enrichment

```
raw_documents
    │
    ├── input: document ID + raw content
    ├── transformation: NLP enrichment (NER, sentiment, topics)
    ├── output: document_analyses table
    └── lineage: ML model version + confidence scores
```

**Custom facets:**
```json
{
  "civwatch_enrichment": {
    "mlModelVersion": "sentiment-v2.1.0",
    "modelFramework": "onnx",
    "inferenceDurationMs": 45,
    "entitiesExtracted": 8,
    "sentimentScore": 0.23,
    "confidence": 0.94,
    "topics": ["budget", "infrastructure"]
  }
}
```

---

### Stage 3: Anomaly Detection

```
document_analyses (aggregated)
    │
    ├── input: time-windowed analysis vectors
    ├── transformation: DBSCAN + Isolation Forest + Z-score ensemble
    ├── output: anomaly_detections table + alerts
    └── lineage: algorithm parameters + ensemble weights
```

**Custom facets:**
```json
{
  "civwatch_anomaly": {
    "algorithms": [
      { "name": "dbscan", "eps": 0.5, "min_samples": 5, "weight": 0.4 },
      { "name": "isolation_forest", "contamination": 0.05, "weight": 0.35 },
      { "name": "z_score", "threshold": 3.0, "weight": 0.25 }
    ],
    "ensembleScore": 0.87,
    "detectionWindow": { "from": "2026-06-21T00:00:00Z", "to": "2026-06-22T00:00:00Z" },
    "featureVectorVersion": "fv-2026.2"
  }
}
```

---

### Stage 4: Alert Dispatch

```
anomaly_detections
    │
    ├── input: detection ID + context
    ├── transformation: rule evaluation + notification formatting
    ├── output: alert_records + webhook deliveries
    └── lineage: rule ID + delivery attempts
```

---

### Stage 5: Report Generation

```
all preceding outputs
    │
    ├── input: time-range scoped analyses + anomalies + alerts
    ├── transformation: aggregation + templating + PDF rendering
    ├── output: report_files (PDF/CSV/JSON)
    └── lineage: all upstream run IDs linked
```

**Report lineage chain:**
```json
{
  "civwatch_report": {
    "reportType": "transparency",
    "period": { "from": "2026-04-01", "to": "2026-06-30" },
    "upstreamRuns": [
      "run_ingest_001",
      "run_enrich_042",
      "run_anomaly_015",
      "run_alert_008"
    ],
    "documentCount": 45230,
    "anomalyCount": 89,
    "generatedAt": "2026-06-23T10:00:00Z"
  }
}
```

---

## Data Freshness & SLAs

| Stage | Target Latency | Maximum Latency | Alert Threshold |
|-------|---------------|-----------------|-----------------|
| Ingestion | < 5 min | 15 min | > 10 min |
| Enrichment | < 30 sec/document | 2 min | > 1 min/doc |
| Anomaly Detection | < 1 hour (batch) | 4 hours | > 2 hours |
| Alert Dispatch | < 30 sec | 2 min | > 1 min |
| Report Generation | < 5 min | 30 min | > 15 min |

---

## Backfilling & Replay

When source data is corrected or pipeline code changes, lineage enables targeted replay:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Identify   │────►│   Select     │────►│   Replay     │
│   Affected   │     │   Runs       │     │   Pipeline   │
│   Runs       │     │   by Filter  │     │   Segments   │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │  Compare Old vs │
                                         │  New Outputs    │
                                         │  (regression)   │
                                         └────────┬────────┘
                                                  │
                                         ┌────────▼────────┐
                                         │  Promote or     │
                                         │  Rollback       │
                                         └─────────────────┘
```

**Replay API:**
```
POST /admin/lineage/replay
{
  "sourceIds": ["src_abc123"],
  "dateRange": { "from": "2026-06-01", "to": "2026-06-15" },
  "stages": ["enrichment", "anomaly_detection"],
  "reason": "Model version upgrade: sentiment-v2.1.0"
}
```

---

## Schema Reference

### lineage_runs

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | OpenLineage run ID |
| `job_namespace` | TEXT | Job namespace (e.g., `civwatch.ingestion`) |
| `job_name` | TEXT | Job name (e.g., `rss_feed_fetch`) |
| `parent_run_id` | UUID (FK) | Parent run for nested jobs |
| `started_at` | TIMESTAMPTZ | Run start time |
| `ended_at` | TIMESTAMPTZ | Run end time |
| `status` | ENUM | `STARTED`, `COMPLETED`, `FAILED`, `ABORTED` |
| `facets` | JSONB | Custom facets (CivWatch-specific metadata) |
| `created_at` | TIMESTAMPTZ | Record creation time |

### lineage_datasets

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Dataset ID |
| `namespace` | TEXT | Dataset namespace |
| `name` | TEXT | Dataset name |
| `source_type` | ENUM | `TABLE`, `STREAM`, `FILE` |
| `facets` | JSONB | Schema, lifecycle info |
| `created_at` | TIMESTAMPTZ | Record creation time |

### lineage_run_datasets

| Column | Type | Description |
|--------|------|-------------|
| `run_id` | UUID (FK → lineage_runs) | Associated run |
| `dataset_id` | UUID (FK → lineage_datasets) | Associated dataset |
| `direction` | ENUM | `INPUT` or `OUTPUT` |
| `facets` | JSONB | IO-specific metadata |

---

## See Also

- [OpenLineage Specification](https://openlineage.io/spec/)
- [Architecture Reference](./ARCHITECTURE.md) — System architecture
- [ML Tuning Guide](./ML_TUNING.md) — Anomaly detection configuration
- [Performance Guide](./PERFORMANCE.md) — Pipeline performance monitoring
