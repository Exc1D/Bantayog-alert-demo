import ErrorBoundary from '../Common/ErrorBoundary';

function FormFallback({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-stone-50 rounded-lg">
      <div className="w-14 h-14 mb-3 rounded-full bg-amber-100 flex items-center justify-center">
        <svg
          aria-hidden="true"
          className="w-7 h-7 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-text mb-1">Form Error</h3>
      <p className="text-textLight text-sm mb-4 max-w-sm">
        Something went wrong with the form. Your data may not have been saved.
      </p>

      <div className="flex gap-2">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accentDark transition-colors"
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
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-text border border-stone-200 rounded-lg font-semibold text-sm hover:bg-stone-50 transition-colors"
        >
          Refresh Page
        </button>
      </div>

      {import.meta.env.DEV && error && (
        <p className="mt-3 text-xs text-textLight">Error: {error.message}</p>
      )}
    </div>
  );
}

export default function ReportFormErrorBoundary({ children }) {
  return <ErrorBoundary fallback={FormFallback}>{children}</ErrorBoundary>;
}
