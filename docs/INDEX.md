# CIVWATCH Documentation Index

> **Last Updated**: 2026-06-24
> 
> This index provides a comprehensive guide to all CIVWATCH documentation, organized by function and priority.

---

## START HERE

| Document | Read If... |
|----------|-----------|
| [`README.md`](../README.md) | You're new to CIVWATCH; want the big picture |
| [`START_HERE.md`](../START_HERE.md) | You want a guided onboarding path |
| [`ARCHITECTURE.md`](../ARCHITECTURE.md) | You need to understand system architecture |

---

## BY ROLE

### For Legal/Policy Staff

| Priority | Document | Purpose |
|----------|----------|---------|
| 1 | [`LEGAL_REVIEW.md`](legal/LEGAL_REVIEW.md) | First Amendment, FOIA, anti-SLAPP framework |
| 2 | [`SLAPP_RESPONSE_PLAYBOOK.md`](legal/SLAPP_RESPONSE_PLAYBOOK.md) | Legal defense protocol (48-hour response) |
| 3 | [`ETHICS_CHARTER.md`](legal/ETHICS_CHARTER.md) | Non-partisan pledge, data handling standards |
| 4 | [`PRIVACY_IMPACT_ASSESSMENT.md`](legal/PRIVACY_IMPACT_ASSESSMENT.md) | NIST Privacy Framework compliance |
| 5 | [`TRANSPARENCY_REPORT.md`](legal/TRANSPARENCY_REPORT.md) | Quarterly reporting template |

### For Security Engineers

| Priority | Document | Purpose |
|----------|----------|---------|
| 1 | [`ADVERSARIAL_SECURITY.md`](security/ADVERSARIAL_SECURITY.md) | Threat model, defense layers, incident response |
| 2 | [`OBELISK_AUDIT_CHAIN.md`](security/OBELISK_AUDIT_CHAIN.md) | Immutable hash-chain audit specification |
| 3 | [`THREAT_MODEL.md`](../THREAT_MODEL.md) | STRIDE analysis and risk register |
| 4 | [`WARRANT_CANARY.md`](security/WARRANT_CANARY.md) | Cryptographic warrant canary system |
| 5 | [`SECURITY.md`](../SECURITY.md) | Vulnerability disclosure policy |

### For Data Engineers

| Priority | Document | Purpose |
|----------|----------|---------|
| 1 | [`FEC_INGESTION_SPEC.md`](data-sources/FEC_INGESTION_SPEC.md) | Campaign finance data pipeline |
| 2 | [`LOBBYING_INGESTION_SPEC.md`](data-sources/LOBBYING_INGESTION_SPEC.md) | Lobbying disclosure pipeline |
| 3 | [`DATA_LINEAGE.md`](../DATA_LINEAGE.md) | Data provenance tracking |
| 4 | [`API.md`](../API.md) | Full API specification |
| 5 | [`PROMISE_TRACKER_SCHEMA.md`](campaign-promises/PROMISE_TRACKER_SCHEMA.md) | Promise database and API |

### For Analysts/Journalists

| Priority | Document | Purpose |
|----------|----------|---------|
| 1 | [`PROMISE_TRACKER_SCHEMA.md`](campaign-promises/PROMISE_TRACKER_SCHEMA.md) | Promise tracker data model |
| 2 | [`BODY_CAMERA_MONITORING_MODULE.md`](body-camera/BODY_CAMERA_MONITORING_MODULE.md) | BWC policy tracker and scores |
| 3 | [`API.md`](../API.md) | Querying CIVWATCH data |
| 4 | [`CREDIBILITY_CHECKLIST.md`](../CREDIBILITY_CHECKLIST.md) | Data credibility guidelines |

### For DevOps/Infrastructure

| Priority | Document | Purpose |
|----------|----------|---------|
| 1 | [`DEPLOYMENT.md`](../DEPLOYMENT.md) | Infrastructure setup and hardening |
| 2 | [`docker-compose-civwatch.yml`](../docker-compose-civwatch.yml) | Docker stack definition |
| 3 | [`ADVERSARIAL_SECURITY.md`](security/ADVERSARIAL_SECURITY.md) | Security hardening requirements |
| 4 | [`SETUP.md`](../SETUP.md) | Development environment setup |

---

## BY DOCUMENT TYPE

### Legal & Ethics
- [`LEGAL_REVIEW.md`](legal/LEGAL_REVIEW.md)
- [`ETHICS_CHARTER.md`](legal/ETHICS_CHARTER.md)
- [`PRIVACY_IMPACT_ASSESSMENT.md`](legal/PRIVACY_IMPACT_ASSESSMENT.md)
- [`SLAPP_RESPONSE_PLAYBOOK.md`](legal/SLAPP_RESPONSE_PLAYBOOK.md)
- [`TRANSPARENCY_REPORT.md`](legal/TRANSPARENCY_REPORT.md)
- [`RESPONSIBLE_DISCLOSURE.md`](../RESPONSIBLE_DISCLOSURE.md)

### Security
- [`ADVERSARIAL_SECURITY.md`](security/ADVERSARIAL_SECURITY.md)
- [`OBELISK_AUDIT_CHAIN.md`](security/OBELISK_AUDIT_CHAIN.md)
- [`WARRANT_CANARY.md`](security/WARRANT_CANARY.md)
- [`SECURITY.md`](../SECURITY.md)
- [`THREAT_MODEL.md`](../THREAT_MODEL.md)

### Data & Architecture
- [`FEC_INGESTION_SPEC.md`](data-sources/FEC_INGESTION_SPEC.md)
- [`LOBBYING_INGESTION_SPEC.md`](data-sources/LOBBYING_INGESTION_SPEC.md)
- [`PROMISE_TRACKER_SCHEMA.md`](campaign-promises/PROMISE_TRACKER_SCHEMA.md)
- [`BODY_CAMERA_MONITORING_MODULE.md`](body-camera/BODY_CAMERA_MONITORING_MODULE.md)
- [`ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`API.md`](../API.md)
- [`DATA_LINEAGE.md`](../DATA_LINEAGE.md)

### Operations
- [`DEPLOYMENT.md`](../DEPLOYMENT.md)
- [`SETUP.md`](../SETUP.md)
- [`CONTRIBUTING.md`](../CONTRIBUTING.md)
- [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md)
- [`CODEOWNERS`](../CODEOWNERS)

### Planning
- [`IMPLEMENTATION_ROADMAP.md`](../IMPLEMENTATION_ROADMAP.md)
- [`NEXT_PHASE.md`](../NEXT_PHASE.md)
- [`STATUS.md`](../STATUS.md)
- [`CHANGELOG.md`](../CHANGELOG.md)

---

## DOCUMENT STATUS LEGEND

| Status | Meaning |
|--------|---------|
| ✅ **Complete** | Document finalized and approved |
| 🔄 **In Progress** | Document being implemented or updated |
| ⏳ **Planned** | Document approved but not yet started |
| 📋 **Specification** | Technical specification ready for implementation |

---

*This index is maintained by the CIVWATCH documentation team. Updates are published with each release.*
