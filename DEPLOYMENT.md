# CIVWATCH Deployment Guide

> **Standard**: AWS Well-Architected Framework | **Source**: [AWS Well-Architected](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)  
> **Platforms**: Docker Compose (dev), Kubernetes (prod), Electron (desktop)

---

## Quick Start (Docker Compose)

```bash
# Clone and setup
git clone https://github.com/POWDER-RANGER/CIVWATCH.git
cd CIVWATCH
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# Verify health
curl http://localhost:3000/api/health
```

---

## Environments

| Environment | Purpose | Infra | Auto-deploy |
|-------------|---------|-------|-------------|
| **Local** | Development | Docker Compose | N/A |
| **Preview** | PR validation | Vercel (frontend) + Render (backend) | On PR open |
| **Staging** | Pre-production | Kubernetes (EKS) | On merge to `main` |
| **Production** | Live system | Kubernetes (EKS) + RDS | Manual approval |

---

## Architecture: Production (Kubernetes)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                                       │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Route 53 (DNS)                                │   │
│  └──────────────────────────────┬───────────────────────────────────────┘   │
│                                 │                                            │
│  ┌──────────────────────────────▼───────────────────────────────────────┐   │
│  │                    CloudFront (CDN) + WAF                             │   │
│  └──────────────────────────────┬───────────────────────────────────────┘   │
│                                 │                                            │
│  ┌──────────────────────────────▼───────────────────────────────────────┐   │
│  │                  Application Load Balancer                            │
│  │              (TLS termination, health checks)                         │   │
│  └──────────┬───────────────────┬───────────────────┬───────────────────┘   │
│             │                   │                   │                        │
│  ┌──────────▼────┐    ┌────────▼──────┐   ┌────────▼──────┐              │
│  │  Frontend Pods │    │  Backend Pods │   │  ML Pods      │              │
│  │  (React + Nginx)│    │  (Express)    │   │  (FastAPI)    │              │
│  │                │    │               │   │               │              │
│  │  Replicas: 3   │    │  Replicas: 5  │   │  Replicas: 3  │              │
│  │  CPU: 250m     │    │  CPU: 500m    │   │  CPU: 1000m   │              │
│  │  Mem: 256Mi    │    │  Mem: 512Mi   │   │  Mem: 2Gi     │              │
│  └────────────────┘    └───────┬───────┘   └───────┬───────┘              │
│                                │                   │                        │
│  ┌─────────────────────────────┼───────────────────┘                        │
│  │                             ▼                                            │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐       │
│  │  │ RDS      │  │ ElastiCache│  │ S3       │  │ Secrets Manager  │       │
│  │  │Postgres  │  │ (Redis)   │  │ (Reports)│  │ (Credentials)   │       │
│  │  │Multi-AZ  │  │Cluster   │  │          │  │                  │       │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘       │
│  │                                                                          │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  │  EKS Control Plane (managed)                                    │   │
│  │  │  - Auto-scaling (HPA + Cluster Autoscaler)                      │   │
│  │  │  - Spot instances for non-critical workloads                    │   │
│  │  │  - Fargate for ML inference (burstable)                         │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │
│  └────────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Resource Specifications

### Frontend (React + Nginx)

```yaml
# kubernetes/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: civwatch-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: civwatch-frontend
  template:
    spec:
      containers:
        - name: frontend
          image: civwatch/frontend:v1.0.0
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 250m
              memory: 256Mi
          livenessProbe:
            httpGet:
              path: /health
              port: 80
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Backend (Express)

```yaml
# kubernetes/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: civwatch-backend
spec:
  replicas: 5
  template:
    spec:
      containers:
        - name: backend
          image: civwatch/backend:v1.0.0
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: civwatch-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: civwatch-secrets
                  key: redis-url
            - name: JWT_PRIVATE_KEY
              valueFrom:
                secretKeyRef:
                  name: civwatch-secrets
                  key: jwt-private-key
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
```

### ML Service (FastAPI)

```yaml
# kubernetes/ml-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: civwatch-ml
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: ml
          image: civwatch/ml:v1.0.0
          ports:
            - containerPort: 5000
          resources:
            requests:
              cpu: 500m
              memory: 1Gi
            limits:
              cpu: 2000m
              memory: 4Gi
          env:
            - name: MODEL_PATH
              value: /models
            - name: ONNX_THREADS
              value: "4"
          volumeMounts:
            - name: models
              mountPath: /models
      volumes:
        - name: models
          persistentVolumeClaim:
            claimName: ml-models-pvc
```

---

## Autoscaling

### Horizontal Pod Autoscaler (HPA)

```yaml
# kubernetes/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: civwatch-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: civwatch-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

### Cluster Autoscaler

```yaml
# Node group configuration
managedNodeGroups:
  - name: general
    instanceTypes: [m6i.large, m6i.xlarge]
    minSize: 2
    maxSize: 10
    desiredCapacity: 3
    spot: true
    
  - name: ml
    instanceTypes: [c6i.2xlarge, c6i.4xlarge]
    minSize: 1
    maxSize: 5
    desiredCapacity: 2
    spot: false  # On-demand for predictable ML performance
    taints:
      - key: workload
        value: ml
        effect: NoSchedule
```

---

## Database (RDS PostgreSQL)

```hcl
# terraform/rds.tf
resource "aws_db_instance" "civwatch" {
  identifier           = "civwatch-prod"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.r6g.xlarge"
  allocated_storage    = 100
  max_allocated_storage = 1000
  storage_type         = "gp3"
  storage_encrypted    = true
  
  multi_az             = true
  publicly_accessible  = false
  
  db_name              = "civwatch"
  username             = "civwatch_admin"
  password             = data.aws_secretsmanager_secret_version.db_password.secret_string
  
  backup_retention_period = 30
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  
  deletion_protection = true
  skip_final_snapshot = false
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.civwatch.name
  
  performance_insights_enabled    = true
  performance_insights_retention_period = 7
}
```

---

## Redis (ElastiCache)

```hcl
# terraform/elasticache.tf
resource "aws_elasticache_replication_group" "civwatch" {
  replication_group_id = "civwatch-redis"
  description          = "CIVWATCH Redis cluster"
  
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.r6g.large"
  
  num_cache_clusters   = 2
  automatic_failover_enabled = true
  multi_az_enabled     = true
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  snapshot_retention_limit = 7
  snapshot_window         = "05:00-06:00"
  
  parameter_group_name = aws_elasticache_parameter_group.civwatch.name
  subnet_group_name    = aws_elasticache_subnet_group.civwatch.name
  security_group_ids   = [aws_security_group.redis.id]
}
```

---

## CI/CD Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Push   │───►│   Lint   │───►│   Test   │───►│   Build  │───►│  Deploy  │
│  to PR   │    │ + SAST   │    │ + DAST   │    │ + Scan   │    │ Preview  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │
     ▼ (merge to main)
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Staging │───►│   E2E    │───►│  Promote │
│  Deploy  │    │  Tests   │    │  to Prod │
└──────────┘    └──────────┘    └──────────┘
```

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Lint
        run: npm run lint
      - name: Unit Tests
        run: npm test && pytest
      - name: SAST
        run: semgrep scan --config=auto
      - name: Build Containers
        run: docker-compose -f docker-compose.yml build
      - name: Container Scan
        run: trivy image civwatch/backend:${{ github.sha }}

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE }}
          aws-region: us-east-1
      - name: Deploy to EKS
        run: |
          aws eks update-kubeconfig --name civwatch-staging
          kubectl set image deployment/civwatch-backend \
            backend=civwatch/backend:${{ github.sha }}
          kubectl rollout status deployment/civwatch-backend
      - name: Run E2E Tests
        run: npx playwright test

  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Production
        run: |
          aws eks update-kubeconfig --name civwatch-production
          kubectl set image deployment/civwatch-backend \
            backend=civwatch/backend:${{ github.sha }}
          kubectl rollout status deployment/civwatch-backend
```

---

## Monitoring & Alerting

### Prometheus Rules

```yaml
# monitoring/prometheus-rules.yaml
groups:
  - name: civwatch
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.service }}"
          
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "95th percentile latency > 2s on {{ $labels.service }}"
          
      - alert: MLServiceDown
        expr: up{job="civwatch-ml"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "ML service is down"
          
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_activity_count > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL connection count > 80"
```

### Grafana Dashboards

| Dashboard | Metrics |
|-----------|---------|
| **API Overview** | Request rate, latency (p50/p95/p99), error rate, active connections |
| **Ingestion Pipeline** | Documents/min, processing time, queue depth, failure rate |
| **ML Performance** | Inference latency, throughput, model version distribution |
| **Anomaly Detection** | Detections/hour, false positive rate, algorithm breakdown |
| **Infrastructure** | CPU, memory, disk, network per pod/node |
| **Data Quality** | Schema violations, parse failures, duplicate rate |

---

## Disaster Recovery

| Component | RTO | RPO | Strategy |
|-----------|-----|-----|----------|
| PostgreSQL | 1 hour | 5 min | Multi-AZ + cross-region snapshot |
| Redis | 15 min | 0 (cache) | Multi-AZ + automatic failover |
| Object Store (S3) | 0 | 0 | Cross-region replication |
| Application | 15 min | N/A | Blue/green deployment |

### Runbook: Database Failover

```bash
# 1. Verify primary is unreachable
psql -h $DB_HOST -U admin -c "SELECT 1" || echo "Primary down"

# 2. RDS automatically promotes standby (Multi-AZ)
#    If manual promotion needed:
aws rds promote-read-replica \
  --db-instance-identifier civwatch-prod-standby

# 3. Update application connection string
kubectl set env deployment/civwatch-backend \
  DATABASE_URL="postgresql://new-endpoint/civwatch"

# 4. Verify connectivity
curl https://api.civwatch.io/health

# 5. Notify team via PagerDuty
```

---

## Security Hardening

### Network Policies

```yaml
# kubernetes/network-policies.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-policy
spec:
  podSelector:
    matchLabels:
      app: civwatch-backend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: civwatch-frontend
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: civwatch-ml
      ports:
        - protocol: TCP
          port: 5000
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - protocol: TCP
          port: 6379
```

---

## Electron Desktop Deployment

```bash
# Build Electron app
npm run electron:build

# Outputs:
# dist/CIVWATCH-Setup-1.0.0.exe   (Windows)
# dist/CIVWATCH-1.0.0.dmg         (macOS)
# dist/CIVWATCH-1.0.0.AppImage    (Linux)

# Code signing (Windows)
signtool sign /f certificate.pfx /p $PASSWORD \
  /tr http://timestamp.digicert.com \
  /td sha256 /fd sha256 \
  "dist/CIVWATCH-Setup-1.0.0.exe"

# Notarization (macOS)
xcrun notarytool submit "dist/CIVWATCH-1.0.0.dmg" \
  --apple-id $APPLE_ID \
  --team-id $TEAM_ID \
  --password $APP_PASSWORD \
  --wait
```

---

## See Also

- [Architecture Reference](./ARCHITECTURE.md) — System architecture
- [Performance Guide](./PERFORMANCE.md) — SRE and optimization
- [Threat Model](./THREAT_MODEL.md) — Security analysis
- [Security Policy](./SECURITY.md) — Vulnerability disclosure
