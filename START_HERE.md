# START_HERE: CIVWATCH Execution Plan

**Date:** February 25, 2026  
**Status:** Pre-Alpha → Production Ready  
**You are here:** 📃 **Reading this. Next: Execute PR0 & PR1.**

---

## What You Have

You have a repo that:
- ❌ Claims v1.0.0 with downloads that don't exist
- ❌ References OBELISK project (wrong)
- ❌ Has Docker services that don't all start properly
- ❌ ML service is just a print statement
- ✅ **BUT** has solid architecture docs and scaffolding
- ✅ **AND** all the tools to become production-grade

---

## The Plan (In 3 Sentences)

1. **PR0 (30-60 min):** Delete OBELISK artifacts, remove false claims, clean repo hygiene
2. **PR1 (2-3 hrs):** Implement real backend endpoint, ML clustering service, healthy Docker stack
3. **Phase 1 (4-6 weeks):** Wire database, real tests, cache layer → MVP ready

---

## Right Now: Execute This (Next 3-4 Hours)

### Step 1: Damage Control (PR0) — 30-60 Minutes

**What:** Remove OBELISK references, false claims, unused files  
**Why:** Restores credibility immediately  
**How:** Follow [PR0_DAMAGE_CONTROL.md](./PR0_DAMAGE_CONTROL.md)

```bash
# TL;DR
git checkout -b pr/damage-control

# Delete root workflow files (won't run anyway)
git rm ci-workflow.yml scorecard-workflow.yml README-OBELISK.md DEVIANT2026_small.gif
git commit -m "chore: remove unused files and OBELISK artifacts"

# Fix CI workflow (replace obelisk → civwatch)
vi .github/workflows/ci.yml
# (Replace 'obelisk' with 'civwatch' in pytest commands)
git add .github/workflows/ci.yml
git commit -m "fix: remove OBELISK references from CI"

# Update SECURITY.md (remove placeholder email)
vi SECURITY.md
# (Delete the placeholder email section, keep GitHub Advisories reference)
git add SECURITY.md
git commit -m "fix: remove placeholder email from SECURITY.md"

git push origin pr/damage-control
# Create PR on GitHub, merge when ready
```

**Expected Result:**
- Repository looks project-specific (not copy-pasted from OBELISK)
- No false v1.0.0 download claims
- CI workflows actually in the right place

---

### Step 2: Docker Green (PR1) — 2-3 Hours

**What:** Implement real services so Docker Compose fully works  
**Why:** Unblocks all future development  
**How:** Follow [PR1_DOCKER_GREEN.md](./PR1_DOCKER_GREEN.md)

**The 5 changes:**

1. **Backend** (`backend/index.js`)
   - Add `/api/health` endpoint (backend returns status + uptime)
   - Keep existing `/api/status`
   - ~15 lines of code

2. **ML Service** (`ml/main.py`)
   - Replace print() with full FastAPI server
   - Implement DBSCAN clustering (anomaly detection)
   - Add `/health` and `/api/analyze` endpoints
   - ~150 lines of code

3. **ML Dockerfile** (`ml/Dockerfile.dev`)
   - Fix pip install path (currently broken)
   - Create `ml/requirements.txt` with dependencies
   - ~10 lines of code

4. **Frontend** (`frontend/src/main.tsx`)
   - Add health checks for backend and ML service
   - Show status indicators (green/red)
   - ~50 lines of code

5. **Verify** `docker-compose.yml`
   - Ensure healthchecks point to correct endpoints
   - No changes needed if already correct

```bash
# Execute PR1
git checkout -b pr/docker-green

# 1. Backend
vi backend/index.js
# Copy from PR1_DOCKER_GREEN.md, add /api/health
git add backend/index.js
git commit -m "feat: add /api/health endpoint"

# 2. ML
vi ml/main.py
# Copy full FastAPI implementation from PR1_DOCKER_GREEN.md
git add ml/main.py

vi ml/requirements.txt
# Copy dependencies from PR1_DOCKER_GREEN.md
git add ml/requirements.txt

git commit -m "feat: implement ML service with DBSCAN"

# 3. Dockerfile
vi ml/Dockerfile.dev
# Fix path from PR1_DOCKER_GREEN.md
git add ml/Dockerfile.dev
git commit -m "fix: correct ML Dockerfile dependencies"

# 4. Frontend
vi frontend/src/main.tsx
# Copy health check code from PR1_DOCKER_GREEN.md
git add frontend/src/main.tsx
git commit -m "feat: add backend/ML service health indicators"

git push origin pr/docker-green
# Create PR, merge when CI passes
```

**Test after merging:**
```bash
# Clean old state
docker-compose down -v

# Start fresh
docker-compose up

# Wait ~30 seconds, check logs:
# backend  ✓ healthy
# ml       ✓ healthy
# frontend ✓ running

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:5000/health

# Test anomaly detection
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {"timestamp": 1000, "value": 1.0},
      {"timestamp": 2000, "value": 1.1},
      {"timestamp": 3000, "value": 10.0}
    ],
    "eps": 0.5,
    "min_samples": 2
  }'

# Open http://localhost:4000 in browser
# Should see green checkmarks for Backend and ML Service
```

**Expected Result:**
- All 3 Docker services start successfully
- All healthchecks pass within 30 seconds
- Frontend shows green "Connected" status
- Anomaly detection actually works (last point flagged as outlier)

---

## Success Criteria (After PR0 + PR1)

✅ **Credibility Restored**
- No OBELISK references remaining
- v1.0.0 removed or drafted as v0.1.0-alpha
- README is accurate and honest
- SECURITY.md is project-specific

✅ **Docker Green**
- All 3 services pass healthchecks
- Backend `/api/health` returns uptime + status
- ML service detects anomalies via DBSCAN
- Frontend shows service connectivity

✅ **Foundation Ready**
- All services talk to each other
- Real code (not stubs) running
- Docker Compose fully operational
- Ready for Phase 1 (database wiring, real tests)

---

## Next: Phase 1 (Starts After PR1 Merges)

**Timeline:** 4-6 weeks  
**Deliverables:** MVP-ready (database, tests, caching)  
**Success:** All critical path items from [NEXT_PHASE.md](./NEXT_PHASE.md) complete

See [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) for full timeline.

---

## Documents You'll Need

| Document | Purpose | Read When |
|----------|---------|----------|
| [PR0_DAMAGE_CONTROL.md](./PR0_DAMAGE_CONTROL.md) | Exact patches for credibility fixes | Before executing PR0 |
| [PR1_DOCKER_GREEN.md](./PR1_DOCKER_GREEN.md) | Exact code for all 5 changes | Before executing PR1 |
| [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) | Master timeline (PR0-3 + 3 phases) | To understand full scope |
| [NEXT_PHASE.md](./NEXT_PHASE.md) | Phase 1 details (DB, tests, types) | After PR1 merges |
| [STATUS.md](./STATUS.md) | Implementation matrix + metrics | To track progress |
| [CREDIBILITY_CHECKLIST.md](./CREDIBILITY_CHECKLIST.md) | Fixes already completed (for reference) | Optional reference |
| [docs/architecture.md](./docs/architecture.md) | System design + data flow | To understand design |
| [docs/api.md](./docs/api.md) | Planned endpoints | To understand API |

---

## Estimated Timing

| Task | Time | Start | End | Blocker |
|------|------|-------|-----|----------|
| PR0: Damage Control | 1 hour | Now | 1 hour | None |
| PR0: Review + Merge | 30 min | After | 1.5 hour | None |
| PR1: Implementation | 2 hours | After PR0 | 3.5 hour | None |
| PR1: Testing + Debug | 1 hour | After | 4.5 hour | None |
| PR1: Review + Merge | 30 min | After | 5 hour | CI passing |
| **Total (PR0 + PR1)** | **~5 hours** | Now | ~5 PM today | None |

**Then you can start Phase 1 (database wiring, real tests) next week.**

---

## Questions?

**Q: Should I do PR0 and PR1 together or separately?**  
A: Separately. PR0 is quick damage control; wait for it to merge, then do PR1.

**Q: What if tests fail in PR1?**  
A: Check docker logs: `docker-compose logs backend`, `docker-compose logs ml`

**Q: Do I need to change database/Redis config?**  
A: Not for PR1. That's Phase 1 work. For now, they're just environment variables.

**Q: Can I skip PR0 and just do PR1?**  
A: Not recommended. PR0 removes credibility damage that will hurt perception of Phase 1 work.

**Q: How long until this is production-ready?**  
A: 10-12 weeks total (Phase 1-3). After PR1, you're at the "foundation ready" checkpoint.

---

## Quick Reference: Command Cheatsheet

```bash
# See logs
docker-compose logs -f backend
docker-compose logs -f ml
docker-compose logs -f frontend

# Check if services are healthy
docker ps --format "table {{.Names}}\t{{.Status}}"

# Restart specific service
docker-compose restart backend

# Clean everything and restart
docker-compose down -v
docker-compose up

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:5000/health

# View code changes before commit
git diff

# Undo local changes
git checkout .
```

---

## Success Checkpoints

### After PR0 Merges ✅
- [ ] Repository is project-specific (no OBELISK)
- [ ] No broken download promises
- [ ] Workflows won't trigger CI (moved to .github/workflows/)
- [ ] README/SECURITY match repo reality

### After PR1 Merges ✅
- [ ] `docker-compose up` works fully
- [ ] All services pass healthchecks
- [ ] Backend `/api/health` endpoint works
- [ ] ML anomaly detection works
- [ ] Frontend shows service status
- [ ] Ready to start Phase 1

---

## Next Action

**Right now:** Open [PR0_DAMAGE_CONTROL.md](./PR0_DAMAGE_CONTROL.md) and execute Step 1.  
**Expected completion:** ~5 hours from now (PR0 + PR1 both done)  
**Then:** [NEXT_PHASE.md](./NEXT_PHASE.md) for Phase 1 roadmap

---

**Good luck! You've got this.**

Any blockers, ping Curtis or open an issue with `blocked` label.
