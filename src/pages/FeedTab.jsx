import { useMemo } from 'react';
import { useReportsContext } from '../contexts/ReportsContext';
import FeedList from '../components/Feed/FeedList';
import FeedFilters from '../components/Feed/FeedFilters';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function getResolvedTimestamp(report) {
  const resolvedAt = report.verification?.resolution?.resolvedAt;
  if (!resolvedAt) return null;
  if (resolvedAt.toDate) return resolvedAt.toDate().getTime();
  if (resolvedAt.seconds) return resolvedAt.seconds * 1000;
  return null;
}

export default function FeedTab({ onViewMap }) {
  const { reports, loading, loadMore, hasMore, filters, updateFilters } = useReportsContext();

  const feedReports = useMemo(() => {
    const now = Date.now();

    // 1. Filter out resolved reports older than 24 hours
    const filtered = reports.filter(report => {
      if (report.verification?.status === 'resolved') {
        const resolvedTime = getResolvedTimestamp(report);
        if (resolvedTime && (now - resolvedTime) > TWENTY_FOUR_HOURS_MS) {
          return false;
        }
      }
      return true;
    });

    // 2. Sort resolved reports to the top, keep original order within groups
    return [...filtered].sort((a, b) => {
      const aResolved = a.verification?.status === 'resolved';
      const bResolved = b.verification?.status === 'resolved';
      if (aResolved && !bResolved) return -1;
      if (!aResolved && bResolved) return 1;
      return 0;
    });
  }, [reports]);

  return (
    <div className="max-w-[800px] mx-auto px-3 py-3 sm:px-4 sm:py-4">
      <FeedFilters filters={filters} onFilterChange={updateFilters} />
      <FeedList
        reports={feedReports}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        onViewMap={onViewMap}
      />
    </div>
  );
}
