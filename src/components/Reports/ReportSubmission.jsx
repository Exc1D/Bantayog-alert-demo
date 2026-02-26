import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import { MUNICIPALITIES, MUNICIPALITY_COORDS } from '../../utils/constants';

export default function ReportSubmission({
  location,
  municipality,
  isSubmitting,
  geoLoading,
  geoError,
  isInApp,
  manualMunicipality,
  onManualMunicipalityChange,
  onRefreshLocation,
}) {
  if (isSubmitting) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner text="Submitting your report..." />
        <p className="text-xs text-textLight mt-2">Compressing images and uploading...</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#78716c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="font-semibold text-xs text-textLight uppercase tracking-wider">
            {location ? 'GPS Location' : 'Location'}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefreshLocation}
          disabled={geoLoading}
          className="px-2 py-1 text-[10px]"
        >
          {geoLoading ? 'Locating…' : 'Retry GPS'}
        </Button>
      </div>
      {location ? (
        <div className="text-xs text-textLight space-y-0.5 pl-5">
          <p className="font-mono">
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
          <p>Accuracy: {Math.round(location.accuracy)}m</p>
          {municipality && <p className="font-medium text-text">{municipality}</p>}
        </div>
      ) : (
        <div className="pl-5 space-y-2">
          {!isInApp && (
            <p className="text-xs text-amber-600 font-medium">GPS location not available.</p>
          )}
          {geoError && <p className="text-[11px] text-red-600">{geoError}</p>}

          {/* Manual municipality fallback */}
          <div className="pt-1">
            <label
              htmlFor="report-municipality"
              className="block text-[10px] font-bold text-textLight uppercase tracking-wider mb-1"
            >
              Select your municipality{isInApp ? '' : ' manually'}
            </label>
            <select
              id="report-municipality"
              value={manualMunicipality}
              onChange={(e) => onManualMunicipalityChange(e.target.value)}
              className="w-full border border-stone-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white"
            >
              <option value="">-- Select municipality --</option>
              {MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {manualMunicipality && MUNICIPALITY_COORDS[manualMunicipality] && (
              <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                Location will use {manualMunicipality} town center coordinates
              </p>
            )}
          </div>

          {isInApp && (
            <p className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-1.5">
              Tip: For accurate GPS, open this page in your device&apos;s browser (Chrome/Safari)
              instead of the in-app browser.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
