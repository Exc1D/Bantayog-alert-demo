import { useEffect, useState } from 'react';
import { useOffline, useOfflineQueue } from '../../hooks/useOffline';

export default function OfflineIndicator() {
  const { isOffline } = useOffline();
  const { pendingCount } = useOfflineQueue();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    let timer;
    let wasOffline = false;

    const handleOffline = () => {
      wasOffline = true;
    };

    const handleOnline = () => {
      if (wasOffline) {
        setShowReconnected(true);
        timer = setTimeout(() => {
          setShowReconnected(false);
        }, 3000);
      }
    };

    if (isOffline) {
      wasOffline = true;
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timer) clearTimeout(timer);
    };
  }, [isOffline]);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] py-2 px-4 text-center text-sm font-medium transition-all duration-300 ${
        isOffline ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
      }`}
      role="status"
      aria-live="polite"
    >
      {isOffline ? (
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          <span>You are offline. Some features may be unavailable.</span>
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs">
              {pendingCount} pending
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Back online! Syncing data...</span>
        </div>
      )}
    </div>
  );
}
