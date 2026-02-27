import { appConfig } from './index.js';

export const FEATURE_FLAGS = Object.freeze({
  NEW_REPORT_FLOW: 'newReportFlow',
  WEATHER_ALERTS: 'weatherAlerts',
  COMMUNITY_ENGAGEMENT: 'communityEngagement',
  ADMIN_ANALYTICS: 'adminAnalytics',
  BETA_FEATURES: 'betaFeatures',
});

const DEFAULT_FLAGS = Object.freeze({
  [FEATURE_FLAGS.NEW_REPORT_FLOW]: false,
  [FEATURE_FLAGS.WEATHER_ALERTS]: true,
  [FEATURE_FLAGS.COMMUNITY_ENGAGEMENT]: true,
  [FEATURE_FLAGS.ADMIN_ANALYTICS]: false,
  [FEATURE_FLAGS.BETA_FEATURES]: false,
});

const ENVIRONMENT_DEFAULTS = Object.freeze({
  production: {
    [FEATURE_FLAGS.NEW_REPORT_FLOW]: false,
    [FEATURE_FLAGS.WEATHER_ALERTS]: true,
    [FEATURE_FLAGS.COMMUNITY_ENGAGEMENT]: true,
    [FEATURE_FLAGS.ADMIN_ANALYTICS]: false,
    [FEATURE_FLAGS.BETA_FEATURES]: false,
  },
  staging: {
    [FEATURE_FLAGS.NEW_REPORT_FLOW]: true,
    [FEATURE_FLAGS.WEATHER_ALERTS]: true,
    [FEATURE_FLAGS.COMMUNITY_ENGAGEMENT]: false,
    [FEATURE_FLAGS.ADMIN_ANALYTICS]: true,
    [FEATURE_FLAGS.BETA_FEATURES]: false,
  },
  development: {
    [FEATURE_FLAGS.NEW_REPORT_FLOW]: true,
    [FEATURE_FLAGS.WEATHER_ALERTS]: true,
    [FEATURE_FLAGS.COMMUNITY_ENGAGEMENT]: true,
    [FEATURE_FLAGS.ADMIN_ANALYTICS]: true,
    [FEATURE_FLAGS.BETA_FEATURES]: true,
  },
});

let remoteConfigValues = {};
let isRemoteConfigInitialized = false;

function getEnvironmentKey() {
  const { env = 'development' } = appConfig;
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  return 'development';
}

function getDefaultForFlag(flag) {
  const envKey = getEnvironmentKey();
  const envDefaults = ENVIRONMENT_DEFAULTS[envKey] || ENVIRONMENT_DEFAULTS.development;
  return envDefaults[flag] ?? DEFAULT_FLAGS[flag] ?? false;
}

export function initializeRemoteConfig(values) {
  remoteConfigValues = { ...values };
  isRemoteConfigInitialized = true;
}

export function getRemoteConfigValues() {
  return { ...remoteConfigValues };
}

export function isRemoteConfigReady() {
  return isRemoteConfigInitialized;
}

export function isEnabled(flag) {
  const validFlags = Object.values(FEATURE_FLAGS);
  if (!validFlags.includes(flag)) {
    console.warn(`Unknown feature flag: ${flag}`);
    return false;
  }

  if (isRemoteConfigInitialized && flag in remoteConfigValues) {
    return Boolean(remoteConfigValues[flag]);
  }

  return getDefaultForFlag(flag);
}

export function getAllFlags() {
  const flags = {};
  for (const flag of Object.values(FEATURE_FLAGS)) {
    flags[flag] = isEnabled(flag);
  }
  return Object.freeze(flags);
}

export function getDefaultFlags() {
  const envKey = getEnvironmentKey();
  return Object.freeze(ENVIRONMENT_DEFAULTS[envKey] || ENVIRONMENT_DEFAULTS.development);
}

export function getEnvironment() {
  return getEnvironmentKey();
}

export const featureFlagsConfig = Object.freeze({
  flags: FEATURE_FLAGS,
  defaults: DEFAULT_FLAGS,
  environment: getEnvironmentKey(),
  isRemoteConfigReady,
});

export default {
  FEATURE_FLAGS,
  isEnabled,
  getAllFlags,
  getDefaultFlags,
  getEnvironment,
  initializeRemoteConfig,
  getRemoteConfigValues,
  isRemoteConfigReady,
};
