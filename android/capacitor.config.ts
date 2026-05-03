import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'gov.civwatch.app',
  appName: 'CIVWATCH',
  webDir: '../frontend/dist',
  server: {
    // In production the app loads from the bundled dist.
    // Set androidScheme to https to allow secure context APIs.
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      keystorePath: undefined,   // set via CI secrets for signed release builds
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0f172a',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0f172a',
    },
  },
};

export default config;
