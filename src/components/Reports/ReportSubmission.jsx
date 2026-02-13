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
    <div className="bg-blue-50 rounded-lg p-3 text-sm">
      <p className="font-semibold mb-1">Location Details:</p>
      {location ? (
        <div className="text-xs text-textLight space-y-0.5">
          <p>Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}</p>
          <p>Accuracy: {Math.round(location.accuracy)}m</p>
          {municipality && <p>Municipality: {municipality}</p>}
        </div>
      ) : (
        <p className="text-xs text-warning">
          {'\u26A0\uFE0F'} GPS location not available. Please enable location services.
        </p>
      )}
    </div>
  );
}
