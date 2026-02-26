import { sentryConfig } from './sentry.js';

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

function validateEnv() {
  const isTestMode = import.meta.env.VITE_APP_ENV === 'test' || process.env.NODE_ENV === 'test';

  const missing = requiredEnvVars.filter((key) => {
    const value = import.meta.env[key];
    return !value || value.includes('YOUR_');
  });

  if (missing.length > 0) {
    console.error('\n========================================');
    console.error('Missing required environment variables:');
    missing.forEach((key) => console.error(`  - ${key}`));
    console.error('\nPlease check your .env file or .env.local');
    console.error('See .env.example for reference.');
    console.error('========================================\n');

    if (isTestMode) {
      console.warn('Running in test mode - using default values');
      return;
    }

    if (import.meta.env.VITE_APP_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

function getEnvString(key, defaultValue = '') {
  return import.meta.env[key] || defaultValue;
}

validateEnv();

export const appConfig = Object.freeze({
  env: getEnvString('VITE_APP_ENV', 'development'),
  version: '1.0.0',
  name: 'Bantayog Alert',
  isDevelopment: getEnvString('VITE_APP_ENV', 'development') === 'development',
  isProduction: getEnvString('VITE_APP_ENV', 'development') === 'production',
});

export const firebaseConfig = Object.freeze({
  apiKey: getEnvString('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvString('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvString('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvString('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvString('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvString('VITE_FIREBASE_APP_ID'),
});

export const apiConfig = Object.freeze({
  openWeatherApiKey: getEnvString('VITE_OPENWEATHER_API_KEY'),
  openWeatherBaseUrl: 'https://api.openweathermap.org/data/2.5',
});

export const config = {
  app: appConfig,
  firebase: firebaseConfig,
  api: apiConfig,
  sentry: sentryConfig,
};

export default config;
