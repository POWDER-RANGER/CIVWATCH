# Historical Next-Phase Plan

> **Archive note:** This plan was written on February 25, 2026. It is retained as planning history, not as the active backlog, current schedule, or proof of production readiness.

The original plan grouped work into three themes:

| Theme in the original plan | Examples of work to verify today |
|---|---|
| Foundation | Persistent storage, migration correctness, real tests, type safety |
| Product integration | Dashboard states, real-time updates, public-source ingestion |
| Production readiness | Authentication, rate limits, observability, performance, release acceptance |

Those themes are useful review categories, but task ownership, implementation state, dependencies, and delivery estimates may have changed.

## Current sources of truth

- **Unified application and API contracts:** [CivilianIntelligence](https://github.com/POWDER-RANGER/CivilianIntelligence).
- **Cross-repository boundaries and release gates:** [Cross-repo integration contract](https://github.com/POWDER-RANGER/CivilianIntelligence/blob/main/docs/CROSS_REPO_INTEGRATION.md).
- **Legacy repository role and setup:** [README](./README.md).
- **Public endpoint probe results:** [CIVWATCH status page](https://powder-ranger.github.io/CIVWATCH/status.html).
- **Historical implementation milestones:** [Implementation roadmap](./IMPLEMENTATION_ROADMAP.md).

Before acting on any item, inspect the current source and open issues/PRs, run the relevant checks, and record the exact evidence. Do not copy the old time estimates or presume that a checklist item is still outstanding.
