import type { ForgeConfig } from '@electron-forge/shared-types';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './build/icon',
    name: 'CIVWATCH',
    executableName: 'civwatch',
    appVersion: process.env.npm_package_version,
    win32metadata: {
      CompanyName: 'POWDER-RANGER',
      FileDescription: 'CIVWATCH Civic Transparency Platform',
      OriginalFilename: 'civwatch.exe',
      ProductName: 'CIVWATCH',
    },
    // Code signing — fill in Phase 4
    // osxSign: {},
    // osxNotarize: {},
  },
  rebuildConfig: {},
  makers: [
    {
      // NSIS installer (.exe) — primary Windows target
      name: '@electron-forge/maker-nsis',
      config: {
        name: 'CIVWATCH',
        setupIcon: './build/icon.ico',
        uninstallDisplayName: 'CIVWATCH',
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: 'CIVWATCH',
        // Installs to %PROGRAMFILES%\CIVWATCH by default
        // Users can override during install
        perMachine: false,
      },
    },
    {
      // Squirrel — for auto-update delta patching
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'civwatch',
        setupIcon: './build/icon.ico',
        // Phase 4: add certificateFile + certificatePassword for signing
      },
    },
    {
      // ZIP — portable no-install option
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          { entry: 'main.ts', config: 'vite.main.config.ts' },
          { entry: 'preload.ts', config: 'vite.preload.config.ts' },
        ],
        renderer: [
          { name: 'main_window', config: 'vite.renderer.config.ts' },
        ],
      },
    },
  ],
  publishers: [
    {
      // Phase 4: publish to GitHub Releases for auto-update
      name: '@electron-forge/publisher-github',
      config: {
        repository: { owner: 'POWDER-RANGER', name: 'CIVWATCH' },
        prerelease: false,
        draft: true, // draft first, manually publish after review
      },
    },
  ],
};

export default config;
