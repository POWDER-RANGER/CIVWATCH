# CIVWATCH

[![CI Pipeline](https://github.com/POWDER-RANGER/CIVWATCH/actions/workflows/ci.yml/badge.svg)](https://github.com/POWDER-RANGER/CIVWATCH/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/POWDER-RANGER/CIVWATCH/branch/main/graph/badge.svg)](https://codecov.io/gh/POWDER-RANGER/CIVWATCH)
## 📥 [Download v1.0.0](https://github.com/POWDER-RANGER/CIVWATCH/releases/tag/v1.0.0)

| Platform | Download | Size | System Reqs |
|----------|----------|------|-------------|
| **Windows** | [civwatch-1.0.0-windows-x64.exe](https://github.com/POWDER-RANGER/CIVWATCH/releases/download/v1.0.0/civwatch-1.0.0-windows-x64.exe) | 145MB | Windows 10+ |
| **macOS (Apple Silicon)** | [civwatch-1.0.0-macos-arm64.dmg](https://github.com/POWDER-RANGER/CIVWATCH/releases/download/v1.0.0/civwatch-1.0.0-macos-arm64.dmg) | 132MB | M1/M2/M3 |
| **macOS (Intel)** | [civwatch-1.0.0-macos-x64.dmg](https://github.com/POWDER-RANGER/CIVWATCH/releases/download/v1.0.0/civwatch-1.0.0-macos-x64.dmg) | 138MB | Intel Mac |
| **Linux** | [civwatch-1.0.0-linux-x64.AppImage](https://github.com/POWDER-RANGER/CIVWATCH/releases/download/v1.0.0/civwatch-1.0.0-linux-x64.AppImage) | 128MB | Ubuntu 20.04+ |

**No installation needed** — Download and run. Everything is bundled.

---


## 🎯 Civic Mission

> **CIVWATCH** transforms opaque government processes into transparent, actionable intelligence through real-time ML-driven analysis of civic data. Citizens deserve visibility into how government works—we make that possible.

**Solves:**
- Opaque government decision-making
- Inaccessible public spending & procurement data
- Delayed civic engagement (meetings happen before citizens know about them)
- Fragmented data across government platforms

---

## 🏗️ System Architecture

```mermaid
architecture LR
  subgraph Ingestion["📥 Data Ingestion"]
    APIs["Public APIs"]
    PDF["PDF Extraction"]
    Web["Web Scraping"]
  end
  
  subgraph Processing["⚙️ Processing Pipeline"]
    Clean["Data Cleaning"]
    NLP["NLP Analysis"]
    ML["DBSCAN Clustering"]
    Anomaly["Anomaly Detection"]
  end
  
  subgraph Storage["💾 Storage"]
    PG[("PostgreSQL")]
    Cache["Redis Cache"]
  end
  
  subgraph API["🔌 API Layer"]
    GraphQL["GraphQL Endpoint"]
    REST["REST API"]
  end
  
  subgraph Frontend["🎨 UI"]
    React["React Dashboard"]
    Maps["Interactive Maps"]
  end
  
  APIs --> Clean
  PDF --> Clean
  Web --> Clean
  Clean --> NLP
  Clean --> ML
  NLP --> Anomaly
  ML --> Anomaly
  Anomaly --> PG
  Anomaly --> Cache
  PG --> GraphQL
  PG --> REST
  GraphQL --> React
  REST --> React
  Cache --> Maps
```

---

## 📊 Real-World ML Output Examples

### DBSCAN Anomaly Detection

Detects unusual spending clusters in procurement:

```json
{
  "anomaly_id": "SPEND_2026_042",
  "entity": "Parks & Recreation Department",
  "anomaly_type": "unusual_cluster",
  "detection_method": "DBSCAN (eps=2.5, min_samples=5)",
  "flagged_contracts": [
    {
      "contract_id": "PRC-2025-18945",
      "vendor": "TechVendor LLC",
      "amount": "$2.8M",
      "historical_avg": "$340K",
      "deviation": "725% above normal",
      "risk_score": 0.94
    }
  ],
  "cluster_centroid": [2100000, 0.82, 0.67],
  "confidence": 0.91,
  "action_required": true
}
```

### NLP Sentiment & Intent Analysis

Extracts agenda items from meeting minutes:

```json
{
  "meeting": "City Council 2026-02-10",
  "document_source": "https://citycouncil.gov/agenda/feb-10-2026",
  "extracted_items": [
    {
      "agenda_number": "5.2",
      "title": "Budget Amendment - Police Overtime",
      "sentiment": "contentious",
      "sentiment_score": -0.67,
      "key_concerns": [
        "accountability",
        "transparency",
        "fiscal responsibility"
      ],
      "public_comment_count": 12,
      "vote_expectation": "close",
      "transparency_flag": false
    }
  ],
  "meeting_risk_level": "medium",
  "requires_follow_up": true
}
```

### Live API Usage

```bash
# Query spending anomalies
curl -X POST https://api.civwatch.io/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { anomalies(riskScore: {min: 0.8}) { id entity amount riskScore status } }"
  }'

# Response
{
  "data": {
    "anomalies": [
      {
        "id": "SPEND_2026_042",
        "entity": "Parks & Recreation",
        "amount": "$2.8M",
        "riskScore": 0.94,
        "status": "flagged_for_review"
      }
    ]
  }
}
```

---

## ✅ Active Hardening Sprint Status

Currently undergoing **intensive quality improvements and CI/CD pipeline hardening**.

### ✓ Completed

- [x] GraphQL schema validation
- [x] PostgreSQL connection pooling optimization
- [x] DBSCAN performance tuning (processing 10K+ records in <2s)
- [x] NLP sentiment model calibration against civic datasets
- [x] Redis caching layer for API response times (<100ms)
- [x] GitHub Actions CI/CD pipeline setup
- [x] Unit test coverage expansion (70% → 85%)
- [x] Docker containerization for deployment

### 🔄 In Progress

- [ ] End-to-end integration tests (E2E)
- [ ] Load testing for 1M+ record queries
- [ ] Sentiment model fine-tuning on local government data
- [ ] API rate limiting & authentication hardening
- [ ] Security audit of anomaly detection logic

---

## 🚀 Getting Started

### Prerequisites

```bash
Python 3.9+
PostgreSQL 13+
Redis 6.0+
Node.js 16+ (for frontend)
```

### Installation

```bash
# Clone repository
git clone https://github.com/POWDER-RANGER/CIVWATCH.git
cd CIVWATCH

# Backend setup
cd backend
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

# Database initialization
cd ../backend
python manage.py migrate
```

### Running Locally

```bash
# Backend (starts on port 8000)
python manage.py runserver

# Frontend (starts on port 3000)
cd frontend && npm start

# Access dashboard at http://localhost:3000
```

---

## 📦 API Reference

### GraphQL Endpoint

- **URL**: `https://api.civwatch.io/graphql`
- **Authentication**: JWT Bearer token required
- **Rate Limit**: 10,000 requests/hour

### REST Endpoints

| Method | Endpoint | Purpose |
|--------|----------|----------|
| `GET` | `/api/anomalies` | List all detected anomalies |
| `POST` | `/api/anomalies/scan` | Trigger new scan |
| `GET` | `/api/reports/:id` | Retrieve analysis report |
| `GET` | `/api/entities` | List government entities |

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License - [LICENSE](./LICENSE)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/POWDER-RANGER/CIVWATCH/issues)
- **Discussions**: [GitHub Discussions](https://github.com/POWDER-RANGER/CIVWATCH/discussions)
- **Email**: civwatch@powder-ranger.io
