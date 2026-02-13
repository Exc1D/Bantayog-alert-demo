import FeedPost from './FeedPost';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function FeedList({ reports, loading, hasMore, loadMore, onViewMap }) {
  if (loading && reports.length === 0) {
    return <LoadingSpinner text="Loading reports..." />;
  }

  if (!loading && reports.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm">
        <p className="text-4xl mb-3">{'\u{1F4ED}'}</p>
        <h3 className="text-lg font-bold mb-1">No Reports Found</h3>
        <p className="text-sm text-textLight">
          No disaster reports match your filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div>
      {reports.map((report, index) => (
        <div
          key={report.id}
          ref={index === reports.length - 1 ? undefined : undefined}
        >
          <FeedPost report={report} onViewMap={onViewMap} />
        </div>
      ))}

      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-accent hover:bg-blue-50 transition-colors"
          >
            Load More Reports
          </button>
        </div>
      )}

      {loading && reports.length > 0 && (
        <LoadingSpinner size="sm" text="Loading more..." />
      )}
    </div>
  );
}
