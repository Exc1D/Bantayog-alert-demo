import ErrorBoundary from '../Common/ErrorBoundary';

function MapFallback({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-stone-50 p-8 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
        <svg
          aria-hidden="true"
          className="w-8 h-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-text mb-2">Map Unavailable</h3>
      <p className="text-textLight text-sm mb-4 max-w-sm">
        The map could not be loaded. This may be due to a network issue or an unexpected error.
      </p>

      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accentDark transition-colors"
      >
        <svg
          aria-hidden="true"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Reload Map
      </button>

      {import.meta.env.DEV && error && (
        <details className="mt-4 text-left w-full max-w-sm">
          <summary className="cursor-pointer text-xs text-textLight hover:text-text">
            Technical Details
          </summary>
          <pre className="mt-2 p-2 bg-stone-200 rounded text-xs text-red-600 overflow-auto max-h-32">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  );
}

export default function MapErrorBoundary({ children }) {
  return <ErrorBoundary fallback={MapFallback}>{children}</ErrorBoundary>;
}
