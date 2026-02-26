import FeedPost from './FeedPost';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function FeedList({
  reports,
  loading,
  hasMore,
  loadMore,
  onViewMap,
  onRequireSignUp,
}) {
  if (loading && reports.length === 0) {
    return <LoadingSpinner text="Loading reports..." />;
  }

  if (!loading && reports.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-card border border-stone-100">
        <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 rounded-full flex items-center justify-center">
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a8a29e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h3 className="text-sm font-bold mb-1">No Reports Found</h3>
        <p className="text-xs text-textLight">No hazard reports match your current filters.</p>
      </div>
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
            className="px-5 py-2 bg-white rounded-lg shadow-card border border-stone-200 text-xs font-semibold text-textLight hover:text-text hover:border-stone-300 transition-all"
          >
            Load More Reports
          </button>
        </div>
      )}

      {loading && reports.length > 0 && <LoadingSpinner size="sm" text="Loading more..." />}
    </div>
  );
}
