# Repository Hygiene Review

## Purpose

This document records repository-level hygiene findings and the validation approach for the legacy CIVWATCH codebase. It is not a certification of production readiness. Re-check the current branch before treating any historical finding as resolved.

## Historical findings

The earlier review recorded the following areas for remediation:

| Area | Finding recorded | Required verification |
|---|---|---|
| Repository identity | Documentation from an unrelated project was present | Confirm root documentation describes CIVWATCH only |
| CI configuration | Workflow files were present outside GitHub's recognized workflow directory | Confirm active workflows reside in `.github/workflows/` and run on the intended events |
| Container health | Compose health checks did not consistently match implemented endpoints | Compare each health check with the service's actual route and startup behavior |
| ML image build | Dependency installation could fail without failing the image build | Remove failure suppression and verify a clean image build |
| Automated tests | Some tests used placeholder assertions | Replace placeholders with behavior-focused tests and inspect coverage |
| Large assets | A large GIF increased clone size | Decide whether the asset belongs in source control or release storage; preserve required product assets |
| Release artifacts | A historical release had no downloadable assets | Verify each release's attached artifacts and ensure release notes match reality |

These are historical review items, not claims that each issue is still present. Use the current source, workflow runs, and release metadata to establish present status.

## Validation checklist

Before calling a remediation complete:

1. Inspect the current file or workflow and identify the specific defect.
2. Make the smallest change that addresses the defect.
3. Run the relevant tests, lint, type checks, and build.
4. Confirm the workflow actually executed; a committed workflow file is not evidence of a successful run.
5. Verify the resulting artifact or endpoint where applicable.
6. Record the commit, pull request, workflow run, and remaining limitations.

## Evidence and status discipline

- Separate historical observations from current verification.
- Link to repository-owned source, tests, pull requests, and workflow runs wherever possible.
- Do not describe a planned fix as implemented or a successful build as production acceptance.
- Preserve source files and required assets unless a separate, reviewed change explicitly approves their removal.
- Record uncertainty rather than filling gaps with assumptions.

## Related repository records

- [Damage-control notes](./PR0_DAMAGE_CONTROL.md)
- [API documentation](./API.md)
- [Security guidance](./SECURITY.md)
- [Contributing guide](./CONTRIBUTING.md)

## Maintenance

Update this review when a finding is re-verified against the current repository. Remove stale status claims rather than appending another dated summary.