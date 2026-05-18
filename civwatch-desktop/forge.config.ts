import type { ForgeConfig } from '@electron-forge/shared-types';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'CIVWATCH',
    executableName: 'civwatch',
    appVersion: process.env.npm_package_version,
    win32metadata: {
      CompanyName: 'POWDER-RANGER',
      FileDescription: 'CIVWATCH Civic Transparency Platform',
      OriginalFilename: 'civwatch.exe',
      ProductName: 'CIVWATCH',
    },
  },
  rebuildConfig: {},
  makers: [
    {
      // Squirrel — primary Windows .exe installer + auto-update
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'civwatch',
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
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: { owner: 'POWDER-RANGER', name: 'CIVWATCH' },
        prerelease: false,
        draft: true,
      },
    },
  ],
};

export default config;
