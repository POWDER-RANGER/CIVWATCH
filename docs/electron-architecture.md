# CIVWATCH Electron Architecture

## Overview

CIVWATCH ships as a single Windows `.exe` installer that embeds:
- **Electron** (Chromium + Node.js runtime for native window)
- **Node.js backend** (Express API + pipeline logic, spawned as subprocess)
- **Python ML service** (PyInstaller binary, spawned as subprocess)
- **SQLite** (single `.db` file in `%APPDATA%\CIVWATCH`)

No Docker, no external runtime, no installer prerequisites beyond Windows 10/11 x64.

---

## Process Architecture

```
civwatch.exe (Electron main process)
  ├── Renderer process (Chromium → React frontend)
  ├── resources/backend/index.js (Node.js subprocess, port 3000)
  └── resources/ml/civwatch-ml.exe (Python PyInstaller, port 8000)
```

### IPC Flow

```
Renderer (React)
  └─→ window.api.getAnomalies()        [contextBridge]
       └─→ ipcRenderer.invoke('api:...')  [preload.ts]
            └─→ ipcMain.handle('api:...')  [main.ts]
                 └─→ fetch(127.0.0.1:3000)  [localhost only]
                      └─→ Node backend
                           └─→ SQLite / ML service
```

The renderer **never** makes direct HTTP calls in Electron mode. All network
access goes through the IPC bridge in `main.ts`. This:
- Prevents renderer-to-network CORS issues inside Electron
- Keeps all service ports on localhost only (not exposed externally)
- Allows the same React code to work in both Electron and web browser

---

## Security Model

| Setting | Value | Why |
|---------|-------|-----|
| `nodeIntegration` | `false` | Never expose Node.js to renderer |
| `contextIsolation` | `true` | Required for `contextBridge` |
| `sandbox` | `false` | Needed for preload script filesystem access |
| Backend port | `127.0.0.1:3000` | Localhost only, not `0.0.0.0` |
| ML port | `127.0.0.1:8000` | Localhost only |

---

## File Layout (Installed)

```
C:\Program Files\CIVWATCH\
├── civwatch.exe              # Electron main (Squirrel-wrapped)
└── resources\
    ├── app\                  # React frontend (Vite build)
    ├── backend\              # Node.js API (pkg-bundled)
    └── ml\
        └── civwatch-ml.exe   # Python ML (PyInstaller)

%APPDATA%\CIVWATCH\
├── civwatch.db               # SQLite data
├── logs\
└── exports\
```

---

## Build Pipeline

### Prerequisites
```powershell
npm install -g @electron-forge/cli
cd civwatch-desktop
npm install
```

### Development (hot-reload)
```powershell
npm run dev
# Opens Electron window loading React dev server on :4000
# Backend + ML start normally
```

### Production build
```powershell
# 1. Build React frontend
cd frontend && npm run build

# 2. Build Node backend
cd backend && npm run build

# 3. Build Python ML binary (Phase 2)
cd ml && pyinstaller --onefile --name civwatch-ml main.py

# 4. Package Electron + all resources
cd civwatch-desktop && npm run make
# Output: out/make/nsis/CIVWATCH-1.0.0-setup.exe
```

---

## Phase Roadmap

| Phase | Status | Deliverable |
|-------|--------|-------------|
| 0 | ✅ Complete | CI green, all CVEs patched, deps current |
| 1 | 🟡 In Progress | Electron shell + IPC bridge (this branch) |
| 2 | ⏳ Planned | PyInstaller Python binary + embedded runtime |
| 3 | ⏳ Planned | SQLite migration, settings UI, data export |
| 4 | ⏳ Planned | NSIS installer, code signing, auto-update |

---

## Known Issues / Future Work

- `_flushBuckets()` in `aggregate.ts` must be excluded from public barrel before Phase 1 ships
- `sanitize()` return type should be enriched to `{ data } | { error }` for granular rejection metrics
- Backend port `3000` is hardcoded — make configurable via settings.json in Phase 3
- ML service startup timeout (15s) may need tuning on cold HDD installs
- Code signing certificate (EV cert) required for SmartScreen bypass — Phase 4 blocker
