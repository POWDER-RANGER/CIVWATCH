# Contributing to CIVWATCH 🛡️

First off, thank you for considering contributing to CIVWATCH! It's people like you that make CIVWATCH such a great tool for civic transparency and democratic accountability.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

```bash
node -v  # >= 18.0.0
python -v  # >= 3.9.0
docker -v  # >= 24.0.0
git --version  # >= 2.0.0
```

### Setting Up Your Development Environment

1. **Fork the repository**
   - Visit https://github.com/POWDER-RANGER/CIVWATCH
   - Click the "Fork" button in the top right

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/CIVWATCH.git
   cd CIVWATCH
   git remote add upstream https://github.com/POWDER-RANGER/CIVWATCH.git
   ```

3. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   cd ..
   
   # Python/ML dependencies
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Start the development stack**
   ```bash
   docker-compose up -d  # Start databases and services
   npm run dev:frontend  # Terminal 1: React dev server
   npm run dev:backend   # Terminal 2: Node.js API server
   npm run dev:ai        # Terminal 3: Python ML services
   ```

6. **Verify installation**
   ```bash
   npm test  # Run test suite
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When submitting a bug report, include:**
- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, versions)
- **Error messages and stack traces**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**When submitting an enhancement:**
- **Use a clear title**
- **Provide detailed description**
- **Explain the motivation**
- **Describe alternatives considered**
- **Include mockups** (for UI changes)

### Good First Issues

Looking for a place to start? Check out issues labeled `good-first-issue`:
https://github.com/POWDER-RANGER/CIVWATCH/labels/good-first-issue

### Areas for Contribution

- **Code**: Features, bug fixes, optimizations
- **Documentation**: Guides, tutorials, API docs
- **Design**: UI/UX improvements, graphics
- **Testing**: Write tests, improve coverage
- **Translation**: Internationalization support
- **Community**: Help others, answer questions

## Development Workflow

### Branch Strategy

- `main` - Stable release branch
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes
- `docs/*` - Documentation updates

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Write code** following our coding standards
2. **Add tests** for new functionality
3. **Update documentation** as needed
4. **Run linters** to ensure code quality
5. **Test thoroughly** on multiple environments

```bash
# Lint your code
npm run lint
npm run lint:fix  # Auto-fix issues

# Run tests
npm test
npm run test:watch  # Watch mode
npm run test:coverage  # With coverage

# Type checking
npm run type-check
```

## Coding Standards

### JavaScript/TypeScript

- **ESLint + Prettier** for consistent formatting
- **TypeScript** with strict mode enabled
- **Functional components** with hooks (React)
- **Async/await** over promises
- **Descriptive variable names**

```typescript
// Good
const fetchCivicData = async (params: CivicDataParams): Promise<CivicData> => {
  const response = await api.get('/civic-data', { params });
  return response.data;
};

// Avoid
const getData = async (p: any) => {
  return await api.get('/civic-data', { params: p }).then(r => r.data);
};
```

### Python

- **PEP 8** style guide
- **Type hints** for function signatures
- **Docstrings** for all public methods
- **Black** for formatting

```python
from typing import List, Dict

def analyze_sentiment(text: str) -> Dict[str, float]:
    """
    Analyze sentiment of given text.
    
    Args:
        text: Input text to analyze
        
    Returns:
        Dictionary with sentiment scores
    """
    # Implementation
    pass
```

### CSS/Styling

- **Tailwind CSS** utility classes
- **BEM naming** for custom CSS
- **Mobile-first** responsive design
- **Accessibility** (WCAG 2.1 AA)

## Commit Guidelines

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Build process or tooling changes
- `ci:` CI/CD changes
- `revert:` Revert a previous commit

### Examples

```bash
# Feature
git commit -m "feat(dashboard): add real-time civic data visualization"

# Bug fix
git commit -m "fix(api): resolve authentication token expiry issue"

# Documentation
git commit -m "docs(contributing): add commit guidelines section"

# Breaking change
git commit -m "feat(api): redesign authentication endpoint

BREAKING CHANGE: authentication now requires JWT tokens"
```

## Pull Request Process

### Before Submitting

✅ **Checklist:**
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated and passing
- [ ] No new warnings or errors
- [ ] Commit messages follow conventions
- [ ] PR description is clear

### Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select `develop` as the base branch
   - Fill out the PR template

3. **PR Title Format**
   ```
   feat(component): brief description of changes
   ```

4. **PR Description Template**
   ```markdown
   ## Description
   Brief description of what this PR does
   
   ## Related Issue
   Fixes #123
   
   ## Changes Made
   - Change 1
   - Change 2
   
   ## Screenshots
   (if applicable)
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Documentation updated
   - [ ] Tests added/updated
   ```

### Code Review Process

1. **Automated checks** must pass
   - CI/CD pipeline
   - Code coverage requirements
   - Linting and formatting

2. **Peer review** by maintainers
   - At least one approval required
   - Address all feedback
   - Re-request review after changes

3. **Merge**
   - Squash and merge preferred
   - Maintainers will merge when approved

### After Your PR is Merged

- Delete your feature branch
- Update your local repository
- Celebrate! 🎉

```bash
git checkout develop
git pull upstream develop
git branch -d feature/your-feature-name
```

## Community

### Getting Help

- **Discord**: [Join our server](https://discord.gg/civwatch)
- **GitHub Discussions**: For questions and ideas
- **Stack Overflow**: Tag `civwatch`
- **Email**: dev@civwatch.org

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Monthly contributor highlights
- Annual contributor awards

### Contributor Levels

- **🌱 New Contributor**: First PR merged
- **🌿 Regular Contributor**: 5+ PRs merged
- **🌳 Core Contributor**: 20+ PRs or significant impact
- **⭐ Maintainer**: Ongoing project stewardship

## Additional Resources

- [Project Roadmap](README.md#project-roadmap)
- [Architecture Guide](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Plugin Development](docs/plugins.md)
- [Testing Guide](docs/testing.md)

## Questions?

Don't hesitate to ask! We're here to help:
- Open a [GitHub Discussion](https://github.com/POWDER-RANGER/CIVWATCH/discussions)
- Join our [Discord community](https://discord.gg/civwatch)
- Email us at dev@civwatch.org

---

**Thank you for contributing to CIVWATCH! Together, we're building a more transparent world. 🌍✨**
