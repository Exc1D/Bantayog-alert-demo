import React from 'react';
import * as Sentry from '@sentry/react';
import sentryConfig from '../config/sentry';

let isInitialized = false;

export function initSentry() {
  if (isInitialized) return;

  if (!sentryConfig.enabled || !sentryConfig.dsn) {
    console.info('Sentry disabled: No DSN configured');
    return;
  }

  Sentry.init({
    dsn: sentryConfig.dsn,
    environment: sentryConfig.environment,
    release: sentryConfig.release,

    sampleRate: sentryConfig.sampleRate,
    tracesSampleRate: sentryConfig.tracesSampleRate,
    profilesSampleRate: sentryConfig.profilesSampleRate,

    ignoreErrors: sentryConfig.ignoreErrors,
    denyUrls: sentryConfig.denyUrls,

    integrations: [
      Sentry.browserTracingIntegration({
        tracePropagationTargets: sentryConfig.integrations.browserTracing.tracePropagationTargets,
      }),
      Sentry.replayIntegration({
        maskAllText: sentryConfig.integrations.replay.maskAllText,
        blockAllMedia: sentryConfig.integrations.replay.blockAllMedia,
      }),
      Sentry.extraErrorDataIntegration(),
      Sentry.captureConsoleIntegration({ levels: ['error', 'warn'] }),
    ],

    replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate,
    replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate,

    beforeBreadcrumb(breadcrumb, hint) {
      if (breadcrumb.category === 'ui.click') {
        const target = hint?.event?.target;
        if (target?.tagName) {
          breadcrumb.message = `Clicked ${target.tagName.toLowerCase()}${target.id ? `#${target.id}` : ''}${target.className ? `.${target.className.split(' ')[0]}` : ''}`;
        }
      }
      return breadcrumb;
    },

    beforeSend(event, hint) {
      if (sentryConfig.isDevelopment) {
        console.error('Sentry event:', event, hint);
      }
      return event;
    },
  });

  isInitialized = true;
  console.info(`Sentry initialized in ${sentryConfig.environment} environment`);
}

export function setUserContext(user) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.uid || user.id,
    email: user.email,
    username: user.displayName || user.name || user.email,
    role: user.role,
    municipality: user.municipality,
  });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

export function addBreadcrumb(category, message, level = 'info', data = {}) {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

export function setTag(key, value) {
  Sentry.setTag(key, value);
}

export function setContext(name, context) {
  Sentry.setContext(name, context);
}

export function captureException(error, context = {}) {
  const { tags, extra, user, level = 'error' } = context;

  if (tags) {
    Object.entries(tags).forEach(([key, value]) => Sentry.setTag(key, value));
  }

  if (extra) {
    Object.entries(extra).forEach(([key, value]) => Sentry.setExtra(key, value));
  }

  if (user) {
    setUserContext(user);
  }

  return Sentry.captureException(error, { level });
}

export function captureMessage(message, level = 'info', context = {}) {
  const { tags, extra } = context;

  if (tags) {
    Object.entries(tags).forEach(([key, value]) => Sentry.setTag(key, value));
  }

  if (extra) {
    Object.entries(extra).forEach(([key, value]) => Sentry.setExtra(key, value));
  }

  return Sentry.captureMessage(message, level);
}

export function withScope(callback) {
  return Sentry.withScope(callback);
}

class FallbackErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  resetError = () => this.setState({ error: null });
  render() {
    if (this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') {
        return fallback({ error: this.state.error, resetError: this.resetError });
      }
      return fallback || null;
    }
    return this.props.children;
  }
}

export const ErrorBoundary = Sentry.ErrorBoundary || FallbackErrorBoundary;
export const withErrorBoundary = Sentry.withErrorBoundary;
export const showReportDialog = Sentry.showReportDialog;

export default {
  init: initSentry,
  setUser: setUserContext,
  clearUser: clearUserContext,
  addBreadcrumb,
  setTag,
  setContext,
  captureException,
  captureMessage,
  withScope,
  ErrorBoundary,
  withErrorBoundary,
  showReportDialog,
};
