import { useState } from 'react';
import { getDisasterType } from '../../data/disasterTypes';
import { formatTimeAgo } from '../../utils/timeUtils';
import { useAuthContext } from '../../contexts/AuthContext';
import { verifyReport, rejectReport } from '../../hooks/useReports';
import { useToast } from '../Common/Toast';
import Button from '../Common/Button';

const SEV_STYLES = {
  critical: 'bg-red-600 text-white',
  moderate: 'bg-amber-500 text-white',
  minor: 'bg-emerald-600 text-white'
};

export default function VerificationPanel({ report, onDone }) {
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const { user, userProfile } = useAuthContext();
  const { addToast } = useToast();

  const disasterType = getDisasterType(report.disaster?.type);
  const sevStyle = SEV_STYLES[report.disaster?.severity] || SEV_STYLES.minor;

  const handleVerify = async () => {
    setProcessing(true);
    try {
      await verifyReport(report.id, user.uid, userProfile?.role, notes);
      addToast('Report verified successfully', 'success');
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
          className="flex-1"
        >
          Verify Report
        </Button>
      </div>
    </div>
  );
}
