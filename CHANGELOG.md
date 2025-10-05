# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### In Progress
- Infrastructure & CI/CD stabilization sprint
- Workspace directory completion
- Pipeline configuration improvements

## [v0.1.0] - 2025-10-04

### Added
- 3 GitHub templates: PR template, bug report template, and docs update template (#10)
- 2 CI/CD workflow files: initial monorepo CI/CD configuration for all services
- 1 docker-compose.yml configuration for backend, frontend, and ml services orchestration
- 3 workspace structures: frontend/, backend/, and ml/ with minimal development files
- 4 Dockerfile.dev files across service workspaces
- 2 package.json files: root monorepo configuration and backend workspace
- 1 types.ts file with core type definitions (User interface, Status type, DataPoint, AnalysisResult, TrendData)
- 3 configuration files: jest.config.js, pytest.ini, tsconfig.json with strict mode
- 1 requirements.txt with comprehensive Python/ML dependencies
- 1 Jest unit test suite for analytics data analyzer module
- 5 documentation files in docs/ directory: getting-started.md, installation.md, first-api-call.md, and architecture guides

### Fixed
- 2 type definition issues in dataAnalyzer module
- 1 missing src/types.ts file causing import errors

### Improved
- README documentation with 3 major updates: early development disclaimer, repository status section, and accurate setup instructions
- 5 documentation files groomed for clarity, style, and professionalism
- All documentation aligned with present utility and reality by removing 8+ placeholder references

### Infrastructure
- 72 total commits establishing project foundation
- 3 core service workspaces initialized
- Monorepo structure with workspace-aware build configuration

### Known Issues
- 45 CI/CD pipeline failures (configuration being revised)
- Missing entry points and start scripts
- Docker services not yet functional
- Project not runnable in current state (Phase 1 in progress)

---

## [v0.0.1] - 2025-10-01

### Added
- Initial repository setup
- MIT License
- Code of Conduct
- Contributing guidelines
- Project vision and roadmap

---

[Unreleased]: https://github.com/POWDER-RANGER/CIVWATCH/compare/v0.1.0...HEAD
[v0.1.0]: https://github.com/POWDER-RANGER/CIVWATCH/releases/tag/v0.1.0
[v0.0.1]: https://github.com/POWDER-RANGER/CIVWATCH/releases/tag/v0.0.1
