# Changelog

All notable changes to OBELISK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
<!-- New features that have been merged to main but not yet released -->
<!-- Example format with quantifiable details:
- Multi-agent task scheduling with priority queues supporting up to 1000 queued tasks with <10ms priority recalculation ([#45](link-to-pr-or-issue))
-->

### Changed
<!-- Changes in existing functionality -->
<!-- Example:
- Vault encryption upgraded from AES-128 to AES-256-GCM, increasing security margin while maintaining <5ms encryption overhead for 1MB payloads ([#52](link))
-->

### Fixed
<!-- Bug fixes -->
<!-- Example with measurable improvement:
- Fixed memory leak in agent cleanup causing 2GB growth per 1000 agent cycles—now stable at constant memory usage ([#38](link))
-->

### Security
<!-- Security improvements and vulnerability fixes -->
<!-- Example:
- Patched authentication bypass in agent registration allowing unauthorized agent spawn (CVE-2025-XXXXX, CVSS 8.1 High) ([Security Advisory](link))
-->

## [0.1.0] - 2025-10-04

### Added

<!-- CUSTOMIZE: Add your actual features with specific technical details and measurements -->

- **Multi-agent task orchestration via gRPC** supporting up to 16 concurrent agents with measured sub-50ms task distribution latency in benchmark suite ([benchmark results](link-to-benchmark-output-or-test-file))
  - Implements asynchronous task queue with priority scheduling
  - Agents can register with capability tags for intelligent task routing
  - Orchestrator maintains agent health monitoring with 5-second heartbeat intervals

- **Encrypted vault implementation** using AES-256-GCM with per-agent key derivation from PBKDF2-derived master secret (100,000 iterations), preventing cross-agent state access
  - Each agent receives unique encryption keys derived from master secret + agent ID
  - Vault API enforces isolation: agents can only access their own encrypted state
  - Tested against timing attacks and key recovery scenarios ([security test suite](link))

- **PDDL 2.1 planning integration** with domain validation, precondition checking, and plan verification against domain constraints
  - Supports complex planning scenarios with up to 50 actions and 100 predicates
  - Plan validation ensures generated plans are executable within domain rules
  - Integration tested with 15 standard PDDL benchmark domains ([test coverage report](link))

- **Prometheus metrics endpoint** at `/metrics` exposing:
  - Agent task latency percentiles (p50, p95, p99) - baseline: p95 < 100ms for simple tasks
  - Vault operation throughput (reads/writes per second) - baseline: >500 ops/sec
  - Planning success rate and average planning time - baseline: 95% success rate
  - System resource utilization (CPU, memory per agent)
  - Custom metrics: active agent count, queued task count, vault size

- **Role-based access control (RBAC)** with three permission tiers:
  - **Admin**: Full system control including vault master key access, agent spawn/terminate, RBAC management
  - **Agent-Operator**: Can spawn, configure, and terminate agents; submit tasks; read metrics
  - **Read-Only**: Access to metrics, logs, and planning output only; no write permissions
  - RBAC enforced at API gateway with JWT-based authentication

- **Docker Compose orchestration** for one-command deployment with health checks for all services
  - Includes Prometheus for metrics collection and Grafana for visualization dashboards
  - Pre-configured with recommended resource limits and security policies
  - Development environment starts in <30 seconds on standard hardware

- **Comprehensive test suite** with 82% code coverage on critical paths:
  - Unit tests for agent lifecycle (spawn, execute, terminate, crash recovery)
  - Integration tests for multi-agent coordination scenarios
  - Security tests for vault isolation and RBAC enforcement
  - Performance benchmarks for task distribution and planning latency
  - All tests run in CI on every pull request ([CI workflow](link))

### Fixed

<!-- CUSTOMIZE: Add actual bugs you fixed with measurable improvements -->

- **PDDL planner deadlock prevention**: Added dependency cycle detection in action preconditions, reducing mission timeout errors by 92% in complex planning scenarios with circular dependencies ([Issue #12](link-to-issue))
  - Implemented Tarjan's algorithm for cycle detection in planning graph
  - Planner now fails fast with clear error message instead of infinite loop
  - Tested against 50 intentionally-cyclic PDDL domains

- **Race condition in agent registration**: Fixed intermittent registration failures when multiple agents spawn simultaneously, improving spawn success rate from 87% to 99.8% under load testing with 20 concurrent spawns ([Issue #8](link))

### Security

<!-- CUSTOMIZE: Add security features you implemented -->

- **Inter-agent communication authentication** using HMAC-SHA256 with per-agent secrets rotated on agent restart
  - Prevents message spoofing and replay attacks between agents
  - Each message includes timestamp and nonce, preventing replay windows >5 seconds
  
- **Vault encryption key derivation** using PBKDF2 with 100,000 iterations and 256-bit salt
  - Prevents key recovery from compromised agent memory dumps
  - Master secret must be >32 bytes of high-entropy data (enforced at startup)
  - Key rotation procedure documented for production deployments

- **API rate limiting** with configurable thresholds per client IP and per RBAC role
  - Default limits: 100 requests/minute for read-only, 500 req/min for operators, unlimited for admin
  - Prevents denial-of-service via API flooding

## Version History Notes

### Versioning Strategy

OBELISK follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Incompatible API changes, architectural shifts, or breaking changes to configuration format
- **MINOR**: New features added in a backward-compatible manner, significant performance improvements
- **PATCH**: Backward-compatible bug fixes, documentation updates, security patches

### Pre-release Versions

Versions prior to 1.0.0 are considered early development. The API and configuration format may change between minor versions without a major version bump during this phase.

### Upgrade Guidance

When upgrading between versions:

1. Read the changelog carefully for breaking changes marked with ⚠️
2. Check the [migration guide](docs/migrations/README.md) if upgrading across major versions
3. Test in a non-production environment before upgrading production deployments
4. Back up vault data before upgrading (see [backup procedures](docs/operations/backup.md))

### Contributing to Changelog

When submitting pull requests:

- Add your changes to the "Unreleased" section following the format examples above
- Include quantifiable improvements when possible (latency reduction, memory savings, error rate decreases)
- Link to issues, PRs, or benchmark results that support your claims
- Use present tense ("Add feature" not "Added feature") in unreleased section
- Maintainers will move entries to versioned sections when cutting releases

---

<!-- 
CUSTOMIZATION CHECKLIST FOR v0.1.0 RELEASE:

1. Replace [link-to-benchmark-output-or-test-file] with actual links to your test results or benchmark files
2. Replace [link-to-issue] with actual GitHub issue numbers (e.g., https://github.com/POWDER-RANGER/OBLISK/issues/12)
3. Add your actual feature implementations with their technical details
4. Include real measurements from your testing (latency numbers, coverage percentages, success rates)
5. If you have security vulnerabilities that were fixed, request CVE numbers through GitHub
6. Remove placeholder comments before committing
7. Update the release date to match when you actually tag the release

MAINTAINING THIS CHANGELOG:

- Keep entries concise but specific: "what changed" + "technical detail that proves depth" + "measurable impact if applicable"
- Every quantifiable claim should link to evidence (test output, benchmark, issue with before/after measurements)
- Security entries should include severity assessment and mitigation guidance
- Group related changes together (don't split a multi-part feature across multiple entries)
- Use sub-bullets for implementation details under main feature bullets
-->
