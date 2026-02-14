import LoadingSpinner from '../Common/LoadingSpinner';

export default function ReportSubmission({ location, municipality, isSubmitting }) {
  if (isSubmitting) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner text="Submitting your report..." />
        <p className="text-xs text-textLight mt-2">
          Compressing images and uploading...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <p className="font-semibold text-xs text-textLight uppercase tracking-wider">GPS Location</p>
      </div>
      {location ? (
        <div className="text-xs text-textLight space-y-0.5 pl-5">
          <p className="font-mono">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
          <p>Accuracy: {Math.round(location.accuracy)}m</p>
          {municipality && <p className="font-medium text-text">{municipality}</p>}
        </div>
      ) : (
        <p className="text-xs text-amber-600 font-medium pl-5">
          GPS location not available. Please enable location services.
        </p>
      )}
    </div>
  );
}
