import { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import EvidenceUpload from './EvidenceUpload';
import { resolveReport } from '../../hooks/useReports';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '../Common/Toast';
import { formatDate } from '../../utils/timeUtils';
import { getDisasterType } from '../../data/disasterTypes';

export default function ResolutionModal({ isOpen, onClose, report }) {
  const [evidencePhotos, setEvidencePhotos] = useState([]);
  const [actionsTaken, setActionsTaken] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resourcesUsed, setResourcesUsed] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuthContext();
  const { addToast } = useToast();

  if (!report) return null;

  const disasterType = getDisasterType(report.disaster?.type);

  const handleSubmit = async () => {
    if (evidencePhotos.length === 0) {
      addToast('At least 1 evidence photo is required', 'warning');
      return;
    }

    if (!actionsTaken || actionsTaken.trim().length < 10) {
      addToast('Please describe what actions were taken (at least 10 characters)', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await resolveReport(
        report.id,
        user.uid,
        evidencePhotos,
        actionsTaken,
        resolutionNotes,
        resourcesUsed
      );

      addToast('Report marked as resolved!', 'success');
      handleClose();
    } catch (error) {
      addToast('Failed to resolve report', 'error');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setEvidencePhotos([]);
    setActionsTaken('');
    setResolutionNotes('');
    setResourcesUsed('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Resolve Report #${report.id?.slice(0, 8)}`}
    >
      <div className="space-y-5">
        {/* Original Report Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-sm mb-2">Original Report:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Type:</strong> {disasterType.icon} {disasterType.label}</p>
            <p><strong>Location:</strong> {report.location?.municipality}</p>
            <p><strong>Severity:</strong> {report.disaster?.severity}</p>
            <p><strong>Reported:</strong> {formatDate(report.timestamp)}</p>
            <p className="text-textLight mt-2">{report.disaster?.description}</p>
          </div>
        </div>

        {/* Evidence Upload */}
        <EvidenceUpload
          photos={evidencePhotos}
          onPhotosChange={setEvidencePhotos}
        />

        {/* Actions Taken */}
        <div>
          <label className="block text-sm font-bold mb-1.5">
            What Actions Were Taken? <span className="text-danger">*</span>
          </label>
          <textarea
            value={actionsTaken}
            onChange={(e) => setActionsTaken(e.target.value)}
            placeholder="E.g., Drainage cleared by DPWH crew, water pumped out, road reopened to traffic"
            className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            rows="4"
          />
        </div>

        {/* Resources Used */}
        <div>
          <label className="block text-sm font-bold mb-1.5">Resources Used (Optional)</label>
          <textarea
            value={resourcesUsed}
            onChange={(e) => setResourcesUsed(e.target.value)}
            placeholder="E.g., 2 water pumps, 5 DPWH workers, 1 backhoe"
            className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            rows="2"
          />
        </div>

        {/* Resolution Notes */}
        <div>
          <label className="block text-sm font-bold mb-1.5">Additional Notes (Optional)</label>
          <textarea
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Any additional details..."
            className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            rows="2"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            loading={submitting}
            disabled={evidencePhotos.length === 0 || !actionsTaken.trim()}
            className="flex-1"
          >
            Mark as Resolved
          </Button>
        </div>

        <p className="text-xs text-textLight text-center">
          * Cannot resolve without evidence photos.
        </p>
      </div>
    </Modal>
  );
}
