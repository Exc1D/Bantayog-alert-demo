import Button from './Button';

export default function ErrorFallback({ error, onRetry, onGoHome, showDetails = false }) {
  const isDev = import.meta.env.DEV;

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center">
        <svg
          aria-hidden="true"
          className="w-8 h-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-text mb-2">Something went wrong</h2>
      <p className="text-textLight text-sm mb-6 max-w-md">
        We encountered an unexpected error. Please try again or return to the home page.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        {onRetry && (
          <Button onClick={onRetry} variant="primary">
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
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="secondary">
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go Home
          </Button>
        )}
      </div>

      {(showDetails || isDev) && error && (
        <details className="mt-6 text-left w-full max-w-md">
          <summary className="cursor-pointer text-xs text-textLight hover:text-text">
            Error Details
          </summary>
          <pre className="mt-2 p-3 bg-stone-100 rounded-lg text-xs text-red-600 overflow-auto max-h-40">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
    </div>
  );
}
