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

  const inputClass = "w-full border border-stone-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="RESOLVE REPORT"
    >
      <div className="space-y-4">
        {/* Original Report Info */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
          <p className="text-[10px] font-bold text-textLight uppercase tracking-wider mb-2">Original Report</p>
          <div className="text-xs space-y-1 text-textLight">
            <p><span className="font-semibold text-text">Type:</span> {disasterType.icon} {disasterType.label}</p>
            <p><span className="font-semibold text-text">Location:</span> {report.location?.municipality}</p>
            <p><span className="font-semibold text-text">Severity:</span> <span className="capitalize">{report.disaster?.severity}</span></p>
            <p><span className="font-semibold text-text">Reported:</span> {formatDate(report.timestamp)}</p>
          </div>
          <p className="text-xs text-textLight mt-2">{report.disaster?.description}</p>
        </div>

        {/* Evidence Upload */}
        <EvidenceUpload
          photos={evidencePhotos}
          onPhotosChange={setEvidencePhotos}
        />

        {/* Actions Taken */}
        <div>
          <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">
            Actions Taken <span className="text-accent">*</span>
          </label>
          <textarea
            value={actionsTaken}
            onChange={(e) => setActionsTaken(e.target.value)}
            placeholder="E.g., Drainage cleared by DPWH crew, water pumped out, road reopened"
            className={inputClass}
            rows="3"
          />
        </div>

        {/* Resources Used */}
        <div>
          <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">Resources Used</label>
          <textarea
            value={resourcesUsed}
            onChange={(e) => setResourcesUsed(e.target.value)}
            placeholder="E.g., 2 water pumps, 5 DPWH workers"
            className={inputClass}
            rows="2"
          />
        </div>

        {/* Resolution Notes */}
        <div>
          <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">Additional Notes</label>
          <textarea
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Any additional details..."
            className={inputClass}
            rows="2"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-1">
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

        <p className="text-[10px] text-textMuted text-center">
          Evidence photos are required to resolve a report.
        </p>
      </div>
    </Modal>
  );
}
