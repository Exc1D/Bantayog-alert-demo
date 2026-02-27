import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('featureFlags', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should have all required flag definitions', async () => {
    const { FEATURE_FLAGS } = await import('../../src/config/featureFlags');

    expect(FEATURE_FLAGS.NEW_REPORT_FLOW).toBe('newReportFlow');
    expect(FEATURE_FLAGS.WEATHER_ALERTS).toBe('weatherAlerts');
    expect(FEATURE_FLAGS.COMMUNITY_ENGAGEMENT).toBe('communityEngagement');
    expect(FEATURE_FLAGS.ADMIN_ANALYTICS).toBe('adminAnalytics');
    expect(FEATURE_FLAGS.BETA_FEATURES).toBe('betaFeatures');
  });

  it('should return development in development mode', async () => {
    vi.stubEnv('VITE_APP_ENV', 'development');
    const { getEnvironment } = await import('../../src/config/featureFlags');
    expect(getEnvironment()).toBe('development');
  });

  it('should return staging in staging mode', async () => {
    vi.stubEnv('VITE_APP_ENV', 'staging');
    const { getEnvironment } = await import('../../src/config/featureFlags');
    expect(getEnvironment()).toBe('staging');
  });

  it('should return production in production mode', async () => {
    vi.stubEnv('VITE_APP_ENV', 'production');
    const { getEnvironment } = await import('../../src/config/featureFlags');
    expect(getEnvironment()).toBe('production');
  });

  it('should return default to development for unknown environments', async () => {
    vi.stubEnv('VITE_APP_ENV', 'unknown');
    const { getEnvironment } = await import('../../src/config/featureFlags');
    expect(getEnvironment()).toBe('development');
  });

  it('should return development defaults in development mode', async () => {
    vi.stubEnv('VITE_APP_ENV', 'development');
    const { getDefaultFlags } = await import('../../src/config/featureFlags');
    const defaults = getDefaultFlags();
    expect(defaults.newReportFlow).toBe(true);
    expect(defaults.weatherAlerts).toBe(true);
    expect(defaults.communityEngagement).toBe(true);
    expect(defaults.adminAnalytics).toBe(true);
    expect(defaults.betaFeatures).toBe(true);
  });

  it('should return staging defaults in staging mode', async () => {
    vi.stubEnv('VITE_APP_ENV', 'staging');
    const { getDefaultFlags } = await import('../../src/config/featureFlags');
    const defaults = getDefaultFlags();
    expect(defaults.newReportFlow).toBe(true);
    expect(defaults.weatherAlerts).toBe(true);
    expect(defaults.communityEngagement).toBe(false);
    expect(defaults.adminAnalytics).toBe(true);
    expect(defaults.betaFeatures).toBe(false);
  });

  it('should return production defaults in production mode', async () => {
    vi.stubEnv('VITE_APP_ENV', 'production');
    const { getDefaultFlags } = await import('../../src/config/featureFlags');
    const defaults = getDefaultFlags();
    expect(defaults.newReportFlow).toBe(false);
    expect(defaults.weatherAlerts).toBe(true);
    expect(defaults.communityEngagement).toBe(true);
    expect(defaults.adminAnalytics).toBe(false);
    expect(defaults.betaFeatures).toBe(false);
  });

  it('should return default value when no remote config is set', async () => {
    vi.stubEnv('VITE_APP_ENV', 'production');
    const { isEnabled, FEATURE_FLAGS, initializeRemoteConfig } =
      await import('../../src/config/featureFlags');
    initializeRemoteConfig({});

    expect(isEnabled(FEATURE_FLAGS.NEW_REPORT_FLOW)).toBe(false);
  });

  it.skip('should return remote config value when set', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_APP_ENV', 'production');

    const { isEnabled, initializeRemoteConfig } = await import('../../src/config/featureFlags');

    const values = {
      newReportFlow: true,
      weatherAlerts: false,
    };
    initializeRemoteConfig(values);

    const flags = Object.keys(values);
    const results = {};
    for (const flag of flags) {
      results[flag] = isEnabled(flag);
    }

    expect(results.newReportFlow).toBe(true);
    expect(results.weatherAlerts).toBe(false);
  });

  it('should return default value for unknown flags', async () => {
    const { isEnabled } = await import('../../src/config/featureFlags');
    expect(isEnabled('unknownFlag')).toBe(false);
  });

  it('should return all flags with their enabled state', async () => {
    const { getAllFlags } = await import('../../src/config/featureFlags');
    const flags = getAllFlags();

    expect(flags).toHaveProperty('newReportFlow');
    expect(flags).toHaveProperty('weatherAlerts');
    expect(flags).toHaveProperty('communityEngagement');
    expect(flags).toHaveProperty('adminAnalytics');
    expect(flags).toHaveProperty('betaFeatures');
  });

  it('should return frozen object', async () => {
    const { getAllFlags } = await import('../../src/config/featureFlags');
    const flags = getAllFlags();
    expect(Object.isFrozen(flags)).toBe(true);
  });

  it('should set remote config values', async () => {
    const { initializeRemoteConfig, getRemoteConfigValues } =
      await import('../../src/config/featureFlags');
    const values = {
      newReportFlow: true,
      weatherAlerts: true,
      communityEngagement: false,
    };

    initializeRemoteConfig(values);

    expect(getRemoteConfigValues()).toEqual(values);
  });

  it('should set isRemoteConfigReady to true', async () => {
    const { initializeRemoteConfig, isRemoteConfigReady } =
      await import('../../src/config/featureFlags');
    initializeRemoteConfig({ test: true });
    expect(isRemoteConfigReady()).toBe(true);
  });
});
