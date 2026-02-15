import { useState } from 'react';
import { DISASTER_TYPES, getDisasterType } from '../../data/disasterTypes';
import { formatTimeAgo } from '../../utils/timeUtils';
import { useAuthContext } from '../../contexts/AuthContext';
import { verifyReport, rejectReport, deleteReport } from '../../hooks/useReports';
import { useToast } from '../Common/Toast';
import Button from '../Common/Button';

const SEV_STYLES = {
  critical: 'bg-red-600 text-white',
  moderate: 'bg-amber-500 text-white',
  minor: 'bg-emerald-600 text-white'
};

// Disaster types available for classification (exclude 'pending')
const CLASSIFIABLE_TYPES = DISASTER_TYPES.filter(t => t.id !== 'pending');

export default function VerificationPanel({ report, onDone }) {
  const [notes, setNotes] = useState('');
  const [selectedType, setSelectedType] = useState(
    report.disaster?.type !== 'pending' ? report.disaster?.type : ''
  );
  const [processing, setProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user, userProfile } = useAuthContext();
  const { addToast } = useToast();

  const disasterType = getDisasterType(report.disaster?.type);
  const sevStyle = SEV_STYLES[report.disaster?.severity] || SEV_STYLES.minor;

  const handleVerify = async () => {
    if (!selectedType) {
      addToast('Please classify the hazard/disaster type before verifying', 'warning');
      return;
    }
    setProcessing(true);
    try {
      await verifyReport(report.id, user.uid, userProfile?.role, notes, selectedType);
      addToast('Report verified and classified successfully', 'success');
      onDone();
    } catch (error) {
      addToast('Failed to verify report', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      addToast('Please provide a reason for rejection', 'warning');
      return;
    }
    setProcessing(true);
    try {
      await rejectReport(report.id, user.uid, userProfile?.role, notes);
      addToast('Report rejected', 'info');
      onDone();
    } catch (error) {
      addToast('Failed to reject report', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    setProcessing(true);
    try {
      await deleteReport(report.id);
      addToast('Report deleted permanently', 'success');
      onDone();
    } catch (error) {
      addToast('Failed to delete report', 'error');
    } finally {
      setProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Report Summary */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{disasterType.icon}</span>
          <h3 className="font-bold text-sm uppercase tracking-wide">{disasterType.label}</h3>
          <span className={`${sevStyle} px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ml-auto`}>
            {report.disaster?.severity}
          </span>
        </div>
        <div className="text-xs space-y-1 text-textLight">
          <p><span className="font-semibold text-text">Location:</span> {report.location?.municipality}{report.location?.street ? `, ${report.location.street}` : ''}</p>
          <p><span className="font-semibold text-text">Reporter:</span> {report.reporter?.name || 'Anonymous'}</p>
          <p><span className="font-semibold text-text">Reported:</span> {formatTimeAgo(report.timestamp)}</p>
        </div>
        <p className="text-sm mt-2">{report.disaster?.description}</p>
      </div>

      {/* Photos */}
      {report.media?.photos?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-textLight uppercase tracking-wider mb-2">Attached Photos</p>
          <div className="grid grid-cols-3 gap-2">
            {report.media.photos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt={`Report photo ${i + 1}`}
                className="w-full h-20 object-cover rounded-lg border border-stone-200 cursor-pointer hover:opacity-80"
              />
            ))}
          </div>
        </div>
      )}

      {/* Hazard/Disaster Type Classification */}
      <div>
        <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">
          Classify Hazard Type <span className="text-accent">*</span>
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full border border-stone-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white"
        >
          <option value="">-- Select hazard type --</option>
          {CLASSIFIABLE_TYPES.map(type => (
            <option key={type.id} value={type.id}>
              {type.icon} {type.label} — {type.description}
            </option>
          ))}
        </select>
        {selectedType && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
            <span className="text-base">{getDisasterType(selectedType).icon}</span>
            <span className="font-semibold">{getDisasterType(selectedType).label}</span>
          </div>
        )}
      </div>

      {/* Admin Notes */}
      <div>
        <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">
          Admin Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this report..."
          className="w-full border border-stone-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white"
          rows="3"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="danger"
          onClick={handleReject}
          loading={processing}
          className="flex-1"
        >
          Reject
        </Button>
        <Button
          variant="success"
          onClick={handleVerify}
          loading={processing}
          disabled={!selectedType}
          className="flex-1"
        >
          Verify Report
        </Button>
      </div>

      {/* Delete Report */}
      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full text-center text-[11px] text-red-400 hover:text-red-600 transition-colors py-1"
        >
          Delete this report permanently
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-bold text-red-700 text-center">
            Are you sure? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={processing}
              className="flex-1"
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
