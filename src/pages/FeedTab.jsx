import { useReportsContext } from '../contexts/ReportsContext';
import FeedList from '../components/Feed/FeedList';
import FeedFilters from '../components/Feed/FeedFilters';

export default function FeedTab({ onViewMap }) {
  const { reports, loading, loadMore, hasMore, filters, updateFilters } = useReportsContext();

  return (
    <div className="max-w-[800px] mx-auto px-3 py-3 sm:px-4 sm:py-4">
      <FeedFilters filters={filters} onFilterChange={updateFilters} />
      <FeedList
        reports={reports}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        onViewMap={onViewMap}
      />
    </div>
  );
}
