import { useState } from 'react';
import { getDisasterType } from '../../data/disasterTypes';
import { formatTimeAgo } from '../../utils/timeUtils';
import { SEVERITY_COLORS, STATUS_COLORS } from '../../utils/constants';
import EngagementButtons from './EngagementButtons';

function SeverityBadge({ severity }) {
  const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.minor;
  return (
    <span className={`${colors.bg} ${colors.text} px-2 py-0.5 rounded text-xs font-bold uppercase`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span className={`${colors.bg} ${colors.text} px-2 py-0.5 rounded text-xs font-bold uppercase`}>
      {status}
    </span>
  );
}

export default function FeedPost({ report, onViewMap }) {
  const [showComments, setShowComments] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const disasterType = getDisasterType(report.disaster?.type);
  const photos = report.media?.photos || [];

  return (
    <div className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Resolved Banner */}
      {report.verification?.status === 'resolved' && (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-2.5 text-center font-bold text-green-800 text-sm">
          RESOLVED
        </div>
      )}

      {/* Post Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 font-bold text-base">
              <span className="text-xl">{disasterType.icon}</span>
              <span className="uppercase">{disasterType.label}</span>
              {report.verification?.status === 'verified' && (
                <span className="text-blue-500 text-sm">{'\u2713'}</span>
              )}
            </div>
            <div className="text-sm text-textLight mt-0.5">
              {report.location?.municipality}
              {report.location?.street && ` \u2022 ${report.location.street}`}
              {report.location?.barangay && ` \u2022 ${report.location.barangay}`}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              <span>{formatTimeAgo(report.timestamp)}</span>
              <span>\u2022</span>
              <span>{report.reporter?.name || 'Anonymous'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <SeverityBadge severity={report.disaster?.severity} />
            <StatusBadge status={report.verification?.status} />
          </div>
        </div>
      </div>

      {/* Photo */}
      {photos.length > 0 && (
        <div className="relative">
          <img
            src={photos[imageIndex]}
            alt="Report"
            className="w-full max-h-96 object-cover"
            loading="lazy"
          />
          {photos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {imageIndex + 1}/{photos.length}
            </div>
          )}
          {photos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === imageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <p className="text-sm mb-3">{report.disaster?.description}</p>

        {/* Type-specific details */}
        {report.disaster?.waterLevel && (
          <div className="bg-blue-50 rounded-lg p-2.5 mb-3 text-sm">
            <strong>Water Level:</strong> {report.disaster.waterLevel}cm
          </div>
        )}

        {report.disaster?.windSpeed && (
          <div className="bg-cyan-50 rounded-lg p-2.5 mb-3 text-sm">
            <strong>Wind Speed:</strong> {report.disaster.windSpeed} kph
          </div>
        )}

        {report.disaster?.casualties > 0 && (
          <div className="bg-red-50 rounded-lg p-2.5 mb-3 text-sm">
            <strong>Casualties:</strong> {report.disaster.casualties}
          </div>
        )}

        {/* Tags */}
        {report.disaster?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {report.disaster.tags.map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Weather Context */}
        {report.weatherContext && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2.5 mb-3 text-xs text-gray-700">
            {'\u2601\uFE0F'} <strong>Weather:</strong> {report.weatherContext.condition}, {report.weatherContext.temperature}&deg;C
            {report.weatherContext.windSpeed ? ` \u2022 Wind: ${report.weatherContext.windSpeed}kph` : ''}
            {report.weatherContext.humidity ? ` \u2022 Humidity: ${report.weatherContext.humidity}%` : ''}
          </div>
        )}
      </div>

      {/* Resolution Evidence */}
      {report.verification?.status === 'resolved' && report.verification?.resolution && (
        <div className="bg-gray-50 p-4 border-t-2 border-green-500">
          <div className="font-bold text-green-800 mb-2 text-sm">
            RESOLUTION EVIDENCE
          </div>
          {report.verification.resolution.evidencePhotos?.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {report.verification.resolution.evidencePhotos.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`Evidence ${i + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                  loading="lazy"
                />
              ))}
            </div>
          )}
          {report.verification.resolution.actionsTaken && (
            <>
              <p className="text-xs font-semibold mb-0.5">Actions Taken:</p>
              <p className="text-xs text-gray-600">{report.verification.resolution.actionsTaken}</p>
            </>
          )}
          {report.verification.resolution.resolutionNotes && (
            <p className="text-xs text-gray-500 mt-2">{report.verification.resolution.resolutionNotes}</p>
          )}
        </div>
      )}

      {/* Engagement Buttons */}
      <EngagementButtons
        report={report}
        onViewMap={onViewMap}
        onToggleComments={() => setShowComments(!showComments)}
      />

      {/* Comments section placeholder */}
      {showComments && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-textLight text-center">Comments coming soon</p>
        </div>
      )}
    </div>
  );
}
