import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { initSentry, ErrorBoundary, captureException } from './utils/sentry';
import { reportWebVitals } from './utils/webVitals';
import A11yProvider from './components/Common/A11yProvider';

initSentry();

performance.mark('app-start');
performance.mark('react-init-start');

window.addEventListener('load', () => {
  performance.mark('page-loaded');
  performance.measure('app-boot', 'app-start', 'page-loaded');
  performance.measure('initial-load', 'app-start', 'page-loaded');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary
      fallback={({ error, componentStack, resetError }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              We apologize for the inconvenience. The error has been reported.
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                View error details
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {error.message}
                {componentStack}
              </pre>
            </details>
            <button
              onClick={resetError}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    >
      <A11yProvider>
        <App />
      </A11yProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

performance.mark('react-render-complete');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      captureException(error, { tags: { component: 'serviceWorker' } });
    });
  });
}

reportWebVitals((metric) => {
  performance.mark(`${metric.name}-complete`);
  performance.measure(metric.name, 'app-start', `${metric.name}-complete`);

  if (metric.name === 'LCP') {
    performance.measure('time-to-interactive', 'app-start', `${metric.name}-complete`);
  }
});
