import FeedPost from './FeedPost';
import LoadingSpinner from '../Common/LoadingSpinner';
import Skeleton from '../Common/Skeleton';
import EmptyState from '../Common/EmptyState';

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}

export default function FeedList({
  reports,
  loading,
  hasMore,
  loadMore,
  onViewMap,
  onRequireSignUp,
  searchQuery,
}) {
  if (loading && reports.length === 0) {
    return <FeedSkeleton />;
  }

  if (!loading && reports.length === 0) {
    if (searchQuery) {
      return (
        <EmptyState
          icon="search"
          title="No Results Found"
          description={`No hazard reports match "${searchQuery}". Try different keywords or adjust your filters.`}
        />
      );
    }
    return (
      <EmptyState
        icon="report"
        title="No Reports Yet"
        description="No hazard reports in your area. Be the first to report a hazard!"
        action={
          <button className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accentDark transition-colors">
            Report a Hazard
          </button>
        }
      />
    );
  }

  return (
    <div>
      {reports.map((report) => (
        <FeedPost
          key={report.id}
          report={report}
          onViewMap={onViewMap}
          onRequireSignUp={onRequireSignUp}
        />
      ))}

      {hasMore && (
        <div className="text-center py-3">
          <button
            onClick={loadMore}
            className="px-5 py-2 bg-white dark:bg-dark-card rounded-lg shadow-card border border-stone-200 dark:border-dark-border text-xs font-semibold text-textLight dark:text-dark-textLight hover:text-text dark:hover:text-dark-text hover:border-stone-300 dark:hover:border-dark-border transition-all"
          >
            Load More Reports
          </button>
        </div>
      )}

      {loading && reports.length > 0 && <LoadingSpinner size="sm" text="Loading more..." />}
    </div>
  );
}
