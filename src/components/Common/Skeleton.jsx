import { memo } from 'react';

function SkeletonText({ lines = 1, className = '' }) {
  if (lines === 1) {
    return (
      <div className={`h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse ${className}`} />
    );
  }
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`bg-white dark:bg-dark-card rounded-xl p-4 shadow-card border border-stone-100 dark:border-dark-border ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-lg animate-pulse" />
        <div className="flex-1">
          <SkeletonText className="w-1/2 mb-2" />
          <SkeletonText lines={2} />
        </div>
      </div>
      <div className="mt-4 h-48 bg-stone-200 dark:bg-stone-700 rounded-lg animate-pulse" />
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse" />
        <div className="h-6 w-20 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonAvatar({ className = '' }) {
  return (
    <div className={`rounded-full bg-stone-200 dark:bg-stone-700 animate-pulse ${className}`} />
  );
}

function SkeletonWeatherCard({ className = '' }) {
  return (
    <div
      className={`bg-white dark:bg-dark-card rounded-xl p-4 shadow-card border border-stone-100 dark:border-dark-border ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <SkeletonText className="w-24" />
        <div className="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse" />
      </div>
      <SkeletonText className="w-16 text-2xl mb-1" />
      <SkeletonText className="w-20" />
    </div>
  );
}

const Skeleton = memo(function Skeleton({ variant = 'text', className = '', ...props }) {
  switch (variant) {
    case 'card':
      return <SkeletonCard className={className} {...props} />;
    case 'avatar':
      return <SkeletonAvatar className={className} {...props} />;
    case 'weather':
      return <SkeletonWeatherCard className={className} {...props} />;
    case 'text':
    default:
      return <SkeletonText className={className} {...props} />;
  }
});

export default Skeleton;

export { SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonWeatherCard };
