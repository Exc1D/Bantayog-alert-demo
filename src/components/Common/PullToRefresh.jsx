import { useState, useRef, useCallback, useEffect, memo } from 'react';

const PULL_THRESHOLD = 80;
const RESISTANCE = 3;

const PullToRefresh = memo(function PullToRefresh({
  onRefresh,
  children,
  pullingText = 'Pull to refresh',
  readyText = 'Release to refresh',
  loadingText = 'Refreshing...',
}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback(
    (e) => {
      if (isRefreshing) return;
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    },
    [isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (isRefreshing || !isPulling) return;

      const scrollTop = containerRef.current?.scrollTop || 0;
      if (scrollTop > 0) return;

      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, (currentY.current - startY.current) / RESISTANCE);
      setPullDistance(Math.min(distance, PULL_THRESHOLD * 1.5));
    },
    [isRefreshing, isPulling]
  );

  const handleTouchEnd = useCallback(async () => {
    if (isRefreshing) return;

    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(0);
      try {
        await onRefresh?.();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
  }, [isRefreshing, pullDistance, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const isReady = pullDistance >= PULL_THRESHOLD && !isRefreshing;

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="relative" style={{ transform: `translateY(${pullDistance}px)` }}>
        <div
          className="absolute top-0 left-0 right-0 h-12 flex items-center justify-center transition-opacity"
          style={{ opacity: pullDistance > 10 ? 1 : 0 }}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-textLight dark:text-dark-textLight">
            {isRefreshing ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" />
                  <path
                    className="opacity-80"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {loadingText}
              </>
            ) : isReady ? (
              <>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                {readyText}
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
                {pullingText}
              </>
            )}
          </div>
        </div>
        <div style={{ transform: `translateY(-${pullDistance}px)` }}>{children}</div>
      </div>
    </div>
  );
});

export default PullToRefresh;
