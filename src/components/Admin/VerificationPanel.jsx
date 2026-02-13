import { useState } from 'react';
import { getDisasterType } from '../../data/disasterTypes';
import { formatTimeAgo } from '../../utils/timeUtils';
import { SEVERITY_COLORS } from '../../utils/constants';
import { useAuthContext } from '../../contexts/AuthContext';
import { verifyReport, rejectReport } from '../../hooks/useReports';
import { useToast } from '../Common/Toast';
import Button from '../Common/Button';

export default function VerificationPanel({ report, onDone }) {
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const { user, userProfile } = useAuthContext();
  const { addToast } = useToast();

  const disasterType = getDisasterType(report.disaster?.type);
  const severityColors = SEVERITY_COLORS[report.disaster?.severity] || SEVERITY_COLORS.minor;

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
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{disasterType.icon}</span>
          <h3 className="font-bold text-lg">{disasterType.label}</h3>
          <span className={`${severityColors.bg} ${severityColors.text} px-2 py-0.5 rounded text-xs font-bold uppercase ml-auto`}>
            {report.disaster?.severity}
          </span>
        </div>
        <p className="text-sm mb-1"><strong>Location:</strong> {report.location?.municipality}{report.location?.street ? `, ${report.location.street}` : ''}</p>
        <p className="text-sm mb-1"><strong>Reporter:</strong> {report.reporter?.name || 'Anonymous'}</p>
        <p className="text-sm mb-2"><strong>Reported:</strong> {formatTimeAgo(report.timestamp)}</p>
        <p className="text-sm">{report.disaster?.description}</p>
      </div>

      {/* Photos */}
      {report.media?.photos?.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">Attached Photos:</p>
          <div className="grid grid-cols-3 gap-2">
            {report.media.photos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt={`Report photo ${i + 1}`}
                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
              />
            ))}
          </div>
        </div>
      )}

      {/* Admin Notes */}
      <div>
        <label className="block text-sm font-semibold mb-1.5">
          Admin Notes {report.verification?.status === 'pending' ? '' : '(required for rejection)'}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this report..."
          className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
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
