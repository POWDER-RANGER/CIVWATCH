# PR0: Damage Control Fixes (Reputation + Repo Hygiene)

**Priority:** 🔴 CRITICAL — Do these immediately before any Phase 1 implementation work
**Estimated Time:** 30-60 minutes (5 small commits)
**Impact:** Restores credibility, removes false claims, cleans up OBELISK bleed-over

---

## Overview: What's Currently Damaging Your Credibility

| Issue | Current State | Fix | Impact |
|-------|---------------|-----|--------|
| Root workflow files in wrong location | `ci-workflow.yml` + `scorecard-workflow.yml` in repo root (won't trigger) | Delete or move to `.github/workflows/` | Workflows will actually run |
| CI workflow references OBELISK project | `ci-workflow.yml` line 100+ says `--cov=obelisk` and OBLISK badge | Replace with `civwatch` and CIVWATCH badge | Honest CI logs |
| v1.0.0 release claims downloads that don't exist | GitHub release has `assets: []` but README implies exe/dmg/AppImage | Delete v1.0.0 or draft as v0.1.0-alpha | No broken promises |
| README-OBELISK.md leftover | `README-OBELISK.md` in repo root (user confusion) | Delete (it's not referenced anywhere) | Cleaner repo |
| DEVIANT2026_small.gif bloats clones | 12MB GIF in repo | Use GitHub issue image upload or delete | Faster clones |
| Placeholder email in SECURITY.md | `security@civwatch.io` (non-existent) | Use GitHub Security Advisories tab | Proper reporting flow |

---

## PR0.1: Delete Root Workflow Files (Don't Migrate Yet)

**Why:** These files in the root won't trigger GitHub Actions. They're redundant with `.github/workflows/ci.yml` and reference OBELISK.  
**Time:** 1 minute

### Delete These Files
```bash
git rm ci-workflow.yml
git rm scorecard-workflow.yml
```

**Commit message:**
```
chore: remove unused root workflow files

These files were in repo root (not .github/workflows/) so they never
triggered. The actual CI workflow is at .github/workflows/ci.yml.
Removing to reduce noise and confusion.
```

**Check after:**
```bash
# These should NOT exist at repo root anymore
ls -la | grep workflow

# This SHOULD exist and be the only workflow
cat .github/workflows/ci.yml | head -5
```

---

## PR0.2: Fix CI Workflow (Remove OBELISK References)

**File:** `.github/workflows/ci.yml`  
**Why:** Currently references `--cov=obelisk` which is the wrong project  
**Time:** 2 minutes

### BEFORE (current, line ~66-69)
```yaml
      - name: Run unit tests with coverage
        run: |
          pytest \
            -n auto \
            --cov=obelisk \
```

### AFTER (replace with)
```yaml
      - name: Run unit tests with coverage
        run: |
          pytest \
            -n auto \
            --cov=civwatch \
```

---

### BEFORE (current, line ~78-81)
```yaml
      - name: Run integration tests
        run: |
          pytest \
            --cov=obelisk \
```

### AFTER (replace with)
```yaml
      - name: Run integration tests
        run: |
          pytest \
            --cov=civwatch \
```

---

### BEFORE (current, line ~87-91)
```yaml
      - name: Run security tests
        run: |
          pytest \
            -m security \
            --cov=obelisk \
```

### AFTER (replace with)
```yaml
      - name: Run security tests
        run: |
          pytest \
            -m security \
            --cov=civwatch \
```

---

### BEFORE (current, line ~135, in mypy step)
```yaml
      - name: Run type checking with mypy
        run: |
          mypy obelisk --ignore-missing-imports
```

### AFTER (replace with)
```yaml
      - name: Run type checking with mypy
        run: |
          mypy src --ignore-missing-imports
```

---

### BEFORE (current, line ~235, in workflow badge comment)
```yaml
# [![CI](https://github.com/POWDER-RANGER/OBLISK/actions/workflows/ci.yml/badge.svg)](https://github.com/POWDER-RANGER/OBLISK/actions/workflows/ci.yml)
```

### AFTER (replace with)
```yaml
# [![CI](https://github.com/POWDER-RANGER/CIVWATCH/actions/workflows/ci.yml/badge.svg)](https://github.com/POWDER-RANGER/CIVWATCH/actions/workflows/ci.yml)
```

---

**Commit message:**
```
fix: remove OBELISK references from CI workflow

Replace all instances of 'obelisk' package/project names with 'civwatch'.
Update badge URL to correct GitHub repo.

- Change --cov=obelisk to --cov=civwatch
- Update mypy target from obelisk to src
- Fix badge URL in comments
```

---

## PR0.3: Delete README-OBELISK.md (Leftover Template)

**File:** `README-OBELISK.md` at repo root  
**Why:** This is a copy/paste artifact from OBELISK project. Not used. Confusing.  
**Time:** 1 minute

### Delete
```bash
git rm README-OBELISK.md
```

**Commit message:**
```
chore: remove OBELISK README template

README-OBELISK.md was left over from project template and is not used.
The actual README is README.md.
```

---

## PR0.4: Delete or Optimize DEVIANT2026_small.gif (12MB)

**File:** `DEVIANT2026_small.gif`  
**Why:** 12MB GIF bloats every clone unnecessarily  
**Option A:** Delete it (cleanest)  
**Option B:** Host it elsewhere and link (if you must show it)  
**Time:** 1 minute

### Option A: Delete (Recommended)
```bash
git rm DEVIANT2026_small.gif
```

**Commit message:**
```
chore: remove 12MB GIF to reduce clone size

DEVIANT2026_small.gif was bloating every clone. If needed, this can be
hostled on GitHub releases or CDN and linked instead.
```

---

### Option B: If You Must Keep It
Commit as-is but add to `.gitignore` for local builds:
```
# In .gitignore
DEVIANT2026_small.gif
```
Then check if it's needed in the README.

---

## PR0.5: Update SECURITY.md (Remove Placeholder Email)

**File:** `SECURITY.md`  
**Why:** Currently lists `security@civwatch.io` which doesn't exist  
**Fix:** Direct users to GitHub Security Advisories (built-in) instead  
**Time:** 2 minutes

### BEFORE (current, line ~69-72)
```markdown
**Option 2: Email**

For researchers who prefer email contact, you can send reports to:

**Email**: security@civwatch.io (or contact information TBD)
```

### AFTER (replace with)
```markdown
**Option 2: GitHub Discussions**

For non-urgent security questions or process clarification:
- Open a private discussion in the GitHub Discussions tab of this repository
- Tag with `security` label for visibility
```

---

**Commit message:**
```
fix: remove placeholder email from SECURITY.md

Remove non-existent security@civwatch.io email.
Direct users to GitHub Security Advisories tab (built-in) for reports
and GitHub Discussions for questions.
```

---

## PR0.6 (Optional): Draft v1.0.0 Release as v0.1.0-alpha

**When:** After all cleanup commits are merged  
**Why:** Current v1.0.0 release claims downloads that don't exist (`assets: []`)  
**Action:** Via GitHub UI (not code)

### Steps
1. Go to **Releases** tab
2. Click on **v1.0.0**
3. Click **Edit**
4. Change:
   - **Tag name:** v0.1.0-alpha
   - **Release title:** v0.1.0-alpha Pre-Release
   - **Check:** "This is a pre-release"
   - **Body:** Replace with:
     ```markdown
     # CIVWATCH v0.1.0-alpha
     
     **Status:** Pre-alpha scaffolding. Core implementation in progress.
     
     ## What Works
     - Backend status endpoint (`/api/status`)
     - Frontend bootstrap rendering
     - Analytics module scaffolding
     
     ## What's Not Ready
     - ML service (DBSCAN not implemented yet)
     - Dashboard UI (components pending)
     - Database integration (not wired)
     - Real-time updates (WebSocket layer pending)
     
     No binary releases yet. To try CIVWATCH:
     ```bash
     git clone https://github.com/POWDER-RANGER/CIVWATCH
     docker-compose up
     ```
     
     See README.md for details.
     ```
5. Save

**Result:** Release is now honest about status, no false download expectations.

---

## Execution Checklist

Run these in order:

```bash
# 1. Create branch
git checkout -b pr/damage-control

# 2. PR0.1: Delete root workflows
git rm ci-workflow.yml
git rm scorecard-workflow.yml
git commit -m "chore: remove unused root workflow files"

# 3. PR0.2: Fix CI workflow references
# Use your editor to replace all instances of 'obelisk' with 'civwatch' in:
vi .github/workflows/ci.yml
# (Replace lines as shown above)
git add .github/workflows/ci.yml
git commit -m "fix: remove OBELISK references from CI workflow"

# 4. PR0.3: Delete OBELISK README
git rm README-OBELISK.md
git commit -m "chore: remove OBELISK README template"

# 5. PR0.4: Handle the GIF
git rm DEVIANT2026_small.gif
git commit -m "chore: remove 12MB GIF to reduce clone size"

# 6. PR0.5: Update SECURITY.md
# Use your editor to update email section:
vi SECURITY.md
# (Replace lines as shown above)
git add SECURITY.md
git commit -m "fix: remove placeholder email from SECURITY.md"

# 7. Push and create PR
git push origin pr/damage-control
# Create PR on GitHub
```

---

## Verification

After merging PR0, verify:

```bash
# 1. Repo root should NOT have these files
git ls-files | grep -E "(ci-workflow|scorecard|README-OBELISK|DEVIANT2026)"
# Should return: nothing

# 2. .github/workflows/ci.yml should NOT contain 'obelisk' or 'OBLISK'
grep -i "obelisk\|OBLISK" .github/workflows/ci.yml
# Should return: nothing

# 3. Clone size should be smaller
git clone https://github.com/POWDER-RANGER/CIVWATCH test-clone
du -sh test-clone/.git
# Should be noticeably smaller than before
```

---

## Next: PR1 (Docker Green)

Once PR0 is merged, move to **PR1: Docker Green** which implements:
- Backend `/api/health` endpoint
- ML FastAPI service with DBSCAN
- Fix Docker Compose dependency issues
- Healthchecks all passing

See `NEXT_PHASE.md` for Phase 1 roadmap.

---

## Questions?

If any of these changes seem risky or you need clarification, open an issue before executing.
