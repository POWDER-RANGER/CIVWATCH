# Branch Protection Setup Guide

## Target Branches
- `main` (required)
- `develop` (optional, recommended)

## Step-by-Step Configuration

1. Navigate to: https://github.com/POWDER-RANGER/CIVWATCH/settings/branches
2. Click **"Add branch protection rule"**
3. Enter branch name pattern: `main`

### Required Settings

| Setting | Status | Rationale |
|---|---|---|
| **Require a pull request before merging** | ✅ Enable | Prevents direct pushes to main |
| **Require approvals** | ✅ 1 approval | Minimum peer review gate |
| **Dismiss stale PR approvals** | ✅ Enable | Ensures reviews are current |
| **Require status checks to pass** | ✅ Enable | CI is truth enforcement |
| **Status checks: `ci`** | ✅ Required | Main CI pipeline |
| **Status checks: `security`** | ✅ Required | Security scanning |
| **Do not allow bypassing** | ✅ Enable | No admin override loopholes |
| **Require linear history** | ✅ Enable | Clean commit history |
| **Require signed commits** | ⚠️ Optional | GPG signing (advanced) |

### Optional but Recommended
- **Lock branch**: Off (prevents PRs entirely — too restrictive)
- **Require merge queue**: Off (until high contributor volume)

## Verification

After enabling, test by:
1. Creating a test branch
2. Making a trivial change
3. Opening a PR
4. Confirming CI runs and blocks merge until green

## Related
- Issue: #4 (CI/CD Pipeline — now hardened)
- Issue: #10 (OBLISK CI Hardening — apply same settings there)