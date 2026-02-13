import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getDisasterType } from '../../data/disasterTypes';
import { MARKER_COLORS, DISASTER_ICONS } from '../../utils/constants';
import { formatTimeAgo } from '../../utils/timeUtils';

function createMarkerIcon(type, status) {
  const color = MARKER_COLORS[type] || MARKER_COLORS.other;
  const icon = DISASTER_ICONS[type] || DISASTER_ICONS.other;
  const opacity = status === 'verified' || status === 'resolved' ? 1 : 0.6;
  const borderColor = status === 'resolved' ? '#10b981' : 'white';

  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid ${borderColor};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        opacity: ${opacity};
      ">
        ${icon}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
}

function SeverityBadge({ severity }) {
  const colors = {
    critical: 'bg-red-100 text-red-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    minor: 'bg-green-100 text-green-800'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${colors[severity] || colors.minor}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: 'bg-gray-100 text-gray-800',
    verified: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    resolved: 'bg-green-100 text-green-800'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

export default function DisasterMarker({ report, onClick }) {
  const disasterType = getDisasterType(report.disaster?.type);
  const icon = createMarkerIcon(report.disaster?.type, report.verification?.status);

  return (
    <Marker
      position={[report.location.lat, report.location.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onClick && onClick(report)
      }}
    >
      <Popup>
        <div className="font-sans min-w-[220px] max-w-[280px]">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-1">
            <span>{disasterType.icon}</span>
            <span className="uppercase">{disasterType.label}</span>
          </h3>

          <p className="font-semibold text-sm">{report.location.municipality}</p>
          {report.location.street && (
            <p className="text-xs text-gray-500">{report.location.street}</p>
          )}

          <p className="text-sm my-2 line-clamp-3">{report.disaster?.description}</p>

          {report.disaster?.waterLevel && (
            <p className="text-xs bg-blue-50 rounded px-2 py-1 mb-2">
              Water Level: {report.disaster.waterLevel}cm
            </p>
          )}

          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge severity={report.disaster?.severity} />
            <StatusBadge status={report.verification?.status} />
          </div>

          <p className="text-xs text-gray-400">
            {formatTimeAgo(report.timestamp)}
          </p>

          {report.media?.photos?.[0] && (
            <img
              src={report.media.photos[0]}
              alt="Report"
              className="w-full h-24 object-cover rounded mt-2"
            />
          )}
        </div>
      </Popup>
    </Marker>
  );
}
