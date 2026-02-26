import { useState, memo } from 'react';
import { getDisasterType } from '../../data/disasterTypes';
import { formatTimeAgo } from '../../utils/timeUtils';
import EngagementButtons from './EngagementButtons';
import { getSafeMediaUrls } from '../../utils/mediaSafety';

function SeverityBadge({ severity }) {
  const styles = {
    critical: 'bg-red-600 text-white',
    moderate: 'bg-amber-500 text-white',
    minor: 'bg-emerald-600 text-white',
  };
  return (
    <span
      className={`${styles[severity] || styles.minor} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide`}
    >
      {severity}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-stone-200 text-stone-700',
    verified: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    resolved: 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span
      className={`${styles[status] || styles.pending} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide`}
    >
      {status}
    </span>
  );
}

const SEVERITY_BORDER = {
  critical: 'severity-border-critical',
  moderate: 'severity-border-moderate',
  minor: 'severity-border-minor',
};

export default memo(function FeedPost({ report, onViewMap, onRequireSignUp }) {
  const [showComments, setShowComments] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const disasterType = getDisasterType(report.disaster?.type);
  const photos = getSafeMediaUrls(report.media?.photos);
  const severity = report.disaster?.severity || 'minor';
  const status = report.verification?.status || 'pending';
  const isCritical = severity === 'critical' && status !== 'resolved';

  return (
    <div
      className={`bg-white rounded-xl mb-3 shadow-card overflow-hidden hover:shadow-card-hover transition-shadow ${SEVERITY_BORDER[severity] || ''} ${isCritical ? 'critical-glow' : ''} status-stripe-${status}`}
    >
      {/* Resolved Banner */}
      {status === 'resolved' && (
        <div className="bg-emerald-600 text-white py-1.5 text-center text-[10px] font-bold uppercase tracking-widest">
          RESOLVED
        </div>
      )}

      {/* Post Header */}
      <div className="p-3.5">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{disasterType.icon}</span>
              <span className="font-bold text-sm uppercase tracking-wide truncate">
                {disasterType.label}
              </span>
              {status === 'verified' && (
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="#2563eb"
                  stroke="white"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="9 12 11.5 14.5 16 10" />
                </svg>
              )}
            </div>
            <div className="text-xs text-textLight mt-1 flex items-center gap-1">
              <svg
                aria-hidden="true"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">
                {report.location?.municipality}
                {report.location?.barangay && `, ${report.location.barangay}`}
              </span>
            </div>
            <div className="text-[11px] text-textMuted mt-0.5 flex items-center gap-1.5">
              <span>{formatTimeAgo(report.timestamp)}</span>
              <span className="text-border">&bull;</span>
              <span>{report.reporter?.name || 'Anonymous'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <SeverityBadge severity={severity} />
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {/* Photo */}
      {photos.length > 0 && (
        <div className="relative">
          <img
            src={photos[imageIndex]}
            alt="Report"
            className="w-full max-h-80 object-cover"
            loading="lazy"
          />
          {photos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
              {imageIndex + 1}/{photos.length}
            </div>
          )}
          {photos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === imageIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-3.5 py-3">
        <p className="text-sm leading-relaxed">{report.disaster?.description}</p>

        {/* Type-specific details */}
        {report.disaster?.waterLevel && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 mt-2.5 text-xs flex items-center gap-2">
            <span className="font-bold text-blue-700">Water Level</span>
            <span className="text-blue-600">{report.disaster.waterLevel}cm</span>
          </div>
        )}

        {report.disaster?.windSpeed && (
          <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-2 mt-2.5 text-xs flex items-center gap-2">
            <span className="font-bold text-cyan-700">Wind Speed</span>
            <span className="text-cyan-600">{report.disaster.windSpeed} kph</span>
          </div>
        )}

        {report.disaster?.casualties > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-2 mt-2.5 text-xs flex items-center gap-2">
            <span className="font-bold text-red-700">Casualties</span>
            <span className="text-red-600">{report.disaster.casualties}</span>
          </div>
        )}

        {/* Tags */}
        {report.disaster?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {report.disaster.tags.map((tag) => (
              <span
                key={tag}
                className="bg-stone-100 text-stone-500 text-[10px] px-2 py-0.5 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Weather Context */}
        {report.weatherContext && (
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-2 mt-2.5 text-[11px] text-textLight">
            <span className="font-semibold">Weather:</span> {report.weatherContext.condition},{' '}
            {report.weatherContext.temperature}&deg;C
            {report.weatherContext.windSpeed
              ? ` &bull; Wind: ${report.weatherContext.windSpeed}kph`
              : ''}
          </div>
        )}
      </div>

      {/* Resolution Evidence */}
      {status === 'resolved' && report.verification?.resolution && (
        <div className="bg-emerald-50 p-3.5 border-t border-emerald-200">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
            Update
          </p>
          {report.verification.resolution.evidencePhotos?.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {getSafeMediaUrls(report.verification.resolution.evidencePhotos).map((photo, i) => (
                <img
                  key={`${photo}-${i}`}
                  src={photo}
                  alt={`Evidence ${i + 1}`}
                  className="w-full h-16 object-cover rounded-lg border border-emerald-200"
                  loading="lazy"
                />
              ))}
            </div>
          )}
          {report.verification.resolution.actionsTaken && (
            <p className="text-xs text-emerald-800">
              {report.verification.resolution.actionsTaken}
            </p>
          )}
          {report.verification.resolution.resolutionNotes && (
            <p className="text-[11px] text-emerald-600 mt-1">
              {report.verification.resolution.resolutionNotes}
            </p>
          )}
        </div>
      )}

      {/* Engagement */}
      <EngagementButtons
        report={report}
        onViewMap={onViewMap}
        onToggleComments={() => setShowComments(!showComments)}
        onRequireSignUp={onRequireSignUp}
      />

      {showComments && (
        <div className="p-3 border-t border-stone-100 bg-stone-50">
          <p className="text-[11px] text-textMuted text-center">Comments coming soon</p>
        </div>
      )}
    </div>
  );
});
