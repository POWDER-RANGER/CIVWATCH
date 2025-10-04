# CIVWATCH

![CI Pipeline](https://github.com/POWDER-RANGER/CIVWATCH/actions/workflows/ci.yml/badge.svg)

Civic transparency platform (early development).

## Status

This project is in early development. Most features are not yet implemented.

**⚠️ WARNING: The project is currently NOT runnable. See Known Issues below.**

## Known Issues

- Missing `frontend/`, `backend/`, and `ml/` workspace directories referenced in `package.json`
- Missing Dockerfile.dev files required by `docker-compose.yml`
- No working entry point or start script
- `docker-compose up` will fail due to missing build contexts

## Setup

```bash
# Clone repository
git clone https://github.com/POWDER-RANGER/CIVWATCH.git
cd CIVWATCH

# Install Node.js dependencies
npm install

# Install Python dependencies (optional for ML work)
pip install -r requirements.txt
```

## Testing

```bash
# Run tests (limited functionality until workspaces are created)
npm test

# Python tests
pytest
```

## Current Implementation

- Basic TypeScript analytics module with placeholder functions
- Jest and pytest configuration files
- Docker compose setup for local services (not yet functional)
- CI/CD pipeline configuration

## Roadmap to Make This Runnable

1. Create workspace directories: `frontend/`, `backend/`, `ml/`
2. Add package.json files to each workspace
3. Create Dockerfile.dev for each service
4. Add minimal entry points (e.g., index.ts, main.py)
5. Add a working `npm run dev` or `npm start` script

## Documentation

See [docs/](docs) for available documentation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.
