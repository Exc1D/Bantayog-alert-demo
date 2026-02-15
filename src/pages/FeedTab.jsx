import { useMemo } from 'react';
import { useReportsContext } from '../contexts/ReportsContext';
import FeedList from '../components/Feed/FeedList';
import FeedFilters from '../components/Feed/FeedFilters';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function getFirestoreMs(ts) {
  if (ts == null) return null;
  if (typeof ts.toDate === 'function') return ts.toDate().getTime();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'number') return ts;
  return null;
}

// For resolved reports use resolvedAt so resolution surfaces as fresh activity;
// fall back to the original report timestamp for everything else.
function getEffectiveTimestamp(report) {
  if (report.verification?.status === 'resolved') {
    const resolvedMs = getFirestoreMs(report.verification?.resolution?.resolvedAt);
    if (resolvedMs != null) return resolvedMs;
  }
  return getFirestoreMs(report.timestamp) ?? 0;
}

export default function FeedTab({ onViewMap }) {
  const { reports, loading, loadMore, hasMore, filters, updateFilters } = useReportsContext();

  const feedReports = useMemo(() => {
    const now = Date.now();

    // 1. Filter out resolved reports older than 24 hours
    const filtered = reports.filter(report => {
      if (report.verification?.status === 'resolved') {
        const resolvedMs = getFirestoreMs(report.verification?.resolution?.resolvedAt);
        if (resolvedMs != null && (now - resolvedMs) > TWENTY_FOUR_HOURS_MS) {
          return false;
        }
      }
      return true;
    });

    // 2. Sort purely chronologically — newest effective timestamp first
    return [...filtered].sort((a, b) => getEffectiveTimestamp(b) - getEffectiveTimestamp(a));
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
