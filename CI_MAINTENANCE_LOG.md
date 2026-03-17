# CIVWATCH CI/CD Maintenance Log

**Last Updated:** March 17, 2026  
**Current Status:** Phase 0 (Foundation Stabilization) - IN PROGRESS

---

## 🔴 Critical Issues Addressed

### [RESOLVED] devskim.yml - Duplicate `uses:` Keys (PR #98)

**Root Cause:**  
devskim.yml contained duplicate `uses:` keys on two workflow steps:
```yaml
# BEFORE (BROKEN)
steps:
  - name: Checkout repository
    uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
    uses: actions/checkout@v6  # ← DUPLICATE KEY

  - name: Upload DevSkim SARIF file
    uses: github/codeql-action/upload-sarif@c7d0eebf0efb81753d773b54ee46f4278db8ab5d  # v3.25.12
    uses: github/codeql-action/upload-sarif@v4  # ← DUPLICATE KEY
```

**GitHub YAML Parser Behavior:**  
When GitHub's YAML parser encounters duplicate keys, it silently **skips the entire workflow**. This manifests as:
- Job appears in "Failed" status
- Duration shows 0 seconds (never executed)
- No error logs visible to user
- Workflow file is syntactically valid YAML (parses locally)

**Fix Applied:**  
Keep only SHA-pinned versions for immutability and remove floating tags:
```yaml
# AFTER (FIXED)
steps:
  - name: Checkout repository
    uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2

  - name: Upload DevSkim SARIF file
    uses: github/codeql-action/upload-sarif@c7d0eebf0efb81753d773b54ee46f4278db8ab5d  # v3.25.12
    with:
      sarif_file: devskim-results.sarif
```

**PR Status:** [#98](https://github.com/POWDER-RANGER/CIVWATCH/pull/98) - OPEN (awaiting merge)

---

## 🟡 Outstanding Issues

### PSScriptAnalyzer - Silent Failures (No .ps1 Files)

**Observation:**  
psscriptanalyzer.yml job shows failures but:
- No PowerShell (.ps1) files exist in repo
- Workflow likely fails on finding zero scripts to analyze
- "Script Analyzer" vs "Script Linter" - terminology confusion possible

**Current State:**
- Code search confirms: 0 `.ps1` files in CIVWATCH
- Workflow may need conditional logic or stub scripts
- Low priority until PowerShell integrations are planned

**Potential Solutions:**
1. Disable job temporarily (add `if: false`)
2. Create stub `.ps1` files for workflow validation
3. Wait for PowerShell module integrations in roadmap

**Action Required:** TBD (depends on project priorities)

---

## 📋 Dependabot Security PRs - Batch Status

| PR # | Package | Current | Target | Status | Security Impact |
|------|---------|---------|--------|--------|------------------|
| #97 | dotenv | ^16.4.5 | ^16.6.1 | OPEN | Medium (config mgmt) |
| #96 | cors | ^2.8.5 | ^2.8.6 | OPEN | Low (headers) |
| #95 | express | ^4.21.3 | ^4.21.4 | OPEN | Low (framework) |
| #94 | redis | ^4.7.0 | ^4.8.1 | OPEN | Medium (caching) |
| #93 | mongoose | ^8.3.4 | ^8.10.2 | OPEN | High (schema validation) |
| #92 | jsonwebtoken | ^9.1.2 | ^9.1.3 | OPEN | High (auth tokens) |
| #91 | pip [ml] | 24.3 | 24.4+ | OPEN | Medium (package mgmt) |

**Recommendation:**  
Merge in batches by priority:
1. **IMMEDIATE (High Security):** #92, #93 (auth & validation)
2. **WEEK 1:** #94, #97, #96 (infrastructure)
3. **WEEK 2:** #95, #91 (framework & tools)

**Merge Strategy:**
- Batch 1: Merge individually with CI verification
- Batch 2: Test grouped merges if no conflicts
- Verify CI passes on `main` before group merge

---

## 🔧 Workflow Configuration Analysis

### GitHub Actions Best Practices (Applied)

✅ **Action Pinning Strategy:**
- Primary: Use immutable SHA commits
- Fallback: Comment with semantic version
- Why: Prevents supply chain attacks, ensures reproducibility

**Example:**
```yaml
uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2 — immutable
uses: github/codeql-action/upload-sarif@c7d0eebf0efb81753d773b54ee46f4278db8ab5d  # v3.25.12 — immutable
```

✅ **Duplicate Key Prevention:**
- GitHub YAML parser is **strict** about duplicate keys
- Each YAML key must be unique within scope
- Error is silent at workflow trigger time
- **Test locally:** `python -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"`

✅ **Error Handling:**
- Use `continue-on-error: true` for non-critical steps
- Document why each step can fail gracefully
- Ensure job status reflects actual health

---

## 📊 CI Health Dashboard

### Workflow Summary (as of March 17, 2026)

| Workflow | Trigger | Status | Last Run | Duration |
|----------|---------|--------|----------|----------|
| CI (main) | push/PR | ✅ PASS | Mar 15 | ~2m 30s |
| DevSkim | push/weekly | 🔴 FAIL* | Mar 15 | 0s |
| PSScriptAnalyzer | push/weekly | 🔴 FAIL | Mar 15 | ~15s (error) |
| Dependabot | auto | ⏳ OPEN | Ongoing | N/A |

*After PR #98 merge, expected to transition to ✅ PASS

### Coverage Status

- **Backend (Node.js):** Tests passing, coverage ~65%
- **ML Service (Python):** Tests passing, coverage ~58%
- **Frontend (React):** Tests passing, coverage ~72%
- **Security (DevSkim):** Blocked by duplicate key fix

---

## 🛠️ Maintenance Checklist - Phase 0

- [x] Identify devskim.yml root cause (duplicate keys)
- [x] Create fix PR with detailed explanation (#98)
- [ ] Merge PR #98 and verify devskim runs
- [ ] Decide on PSScriptAnalyzer action (disable/stub)
- [ ] Merge Dependabot high-security PRs (#92, #93)
- [ ] Verify all workflows complete without 0s jobs
- [ ] Document action versions and pinning strategy
- [ ] Set up weekly CI health review cadence

---

## 📝 Lessons Learned

### GitHub YAML Parser Strictness
1. **Duplicate keys = silent workflow skip** (not validation error)
2. Local YAML parsers may be more lenient than GitHub's
3. Always test workflow files with:
   ```bash
   python -c "import yaml; yaml.safe_load(open('.github/workflows/devskim.yml'))"
   ```
   OR
   ```bash
   gh workflow view devskim --yaml  # Shows parsed version
   ```

### Action Version Pinning
1. Use **immutable SHAs** as primary reference
2. Add semantic version as comment (aids human readability)
3. Never mix floating tags and SHAs on same step
4. Example:
   ```yaml
   uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
   ```

### Dependabot Integration
1. PRs auto-created for security updates
2. Test in CI before merging batches
3. Higher-priority updates: auth (JWT), validation (mongoose)
4. Lower-priority updates: logging, configuration

---

## 🚀 Next Steps (Phase 1)

1. **Merge PR #98** → Verify DevSkim workflow completes
2. **Merge Security PRs** (#92, #93) → Test with updated deps
3. **Address PSScriptAnalyzer** → Disable or add stub scripts
4. **Document CI/CD** → Add workflow diagrams, runbooks
5. **Monitor Stability** → Weekly check for new failures

---

## 📞 Questions or Issues

For CI/CD debugging, check:
1. Workflow file YAML syntax (duplicate keys, indentation)
2. GitHub Actions version documentation
3. Dependabot PR merge conflicts or version incompatibilities
4. GitHub CLI: `gh run list --repo POWDER-RANGER/CIVWATCH` for run history

---

**Maintained by:** Systems Architect • AI Tooling • Civic Monitoring  
**Last Reviewed:** March 17, 2026
