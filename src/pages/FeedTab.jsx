import { useMemo } from 'react';
import { useReportsContext } from '../contexts/ReportsContext';
import FeedList from '../components/Feed/FeedList';
import FeedFilters from '../components/Feed/FeedFilters';
import { FEATURE_FLAGS } from '../config/featureFlags';
import FeatureFlag, { FeatureFlagDisabled } from '../components/Common/FeatureFlag';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function getFirestoreMs(ts) {
  if (ts == null) return null;
  if (typeof ts.toDate === 'function') return ts.toDate().getTime();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'number') return ts;
  return null;
}

function isResolvedAndExpired(report, now) {
  if (report.verification?.status !== 'resolved') return false;
  const resolvedMs = getFirestoreMs(report.verification?.resolution?.resolvedAt);
  return resolvedMs != null && now - resolvedMs > TWENTY_FOUR_HOURS_MS;
}

function getEffectiveTimestamp(report) {
  if (report.verification?.status === 'resolved') {
    const resolvedMs = getFirestoreMs(report.verification?.resolution?.resolvedAt);
    if (resolvedMs != null) return resolvedMs;
  }
  return getFirestoreMs(report.timestamp) ?? 0;
}

function getSeverityRank(severity) {
  switch (severity) {
    case 'critical':
      return 0;
    case 'moderate':
      return 1;
    case 'minor':
      return 2;
    default:
      return 3;
  }
}

function filterAndSortReports(reports, sort) {
  const now = Date.now();
  const filtered = reports.filter((report) => !isResolvedAndExpired(report, now));

  if (sort === 'upvoted') {
    return [...filtered].sort(
      (a, b) => (b.engagement?.upvotes || 0) - (a.engagement?.upvotes || 0)
    );
  }

  if (sort === 'critical') {
    return [...filtered].sort((a, b) => {
      const sevDiff = getSeverityRank(a.disaster?.severity) - getSeverityRank(b.disaster?.severity);
      if (sevDiff !== 0) return sevDiff;
      return getEffectiveTimestamp(b) - getEffectiveTimestamp(a);
    });
  }

  return [...filtered].sort((a, b) => getEffectiveTimestamp(b) - getEffectiveTimestamp(a));
}

export default function FeedTab({ onViewMap, onRequireSignUp }) {
  const { reports, loading, loadMore, hasMore, filters, updateFilters } = useReportsContext();

  const feedReports = useMemo(
    () => filterAndSortReports(reports, filters.sort),
    [reports, filters.sort]
  );

  return (
    <div className="max-w-[800px] mx-auto px-3 py-3 sm:px-4 sm:py-4">
      <FeedFilters filters={filters} onFilterChange={updateFilters} />
      <FeatureFlag
        flag={FEATURE_FLAGS.COMMUNITY_ENGAGEMENT}
        fallback={
          <FeatureFlagDisabled flag={FEATURE_FLAGS.COMMUNITY_ENGAGEMENT}>
            <div className="bg-white rounded-xl p-4 text-center shadow-card border border-stone-100 mb-3">
              <div className="w-10 h-10 mx-auto mb-2 bg-stone-100 rounded-full flex items-center justify-center">
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#78716c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <p className="font-semibold text-sm text-textLight">Community features coming soon</p>
              <p className="text-xs text-textLight mt-1">
                Upvotes and comments will be available soon
              </p>
            </div>
          </FeatureFlagDisabled>
        }
      >
        <FeedList
          reports={feedReports}
          loading={loading}
          hasMore={hasMore}
          loadMore={loadMore}
          onViewMap={onViewMap}
          onRequireSignUp={onRequireSignUp}
        />
      </FeatureFlag>
    </div>
  );
}
