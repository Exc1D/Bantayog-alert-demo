import { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import ReportTypeSelector from './ReportTypeSelector';
import EvidenceCapture from './EvidenceCapture';
import ReportForm from './ReportForm';
import ReportSubmission from './ReportSubmission';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '../Common/Toast';
import { submitReport } from '../../hooks/useReports';
import { detectMunicipality } from '../../utils/geoFencing';

const STEP_TITLES = {
  1: 'REPORT INCIDENT',
  2: 'PROVIDE EVIDENCE',
  3: 'REPORT DETAILS',
};

export default function ReportModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState(null); // 'emergency' | 'situation'
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { location, loading: geoLoading } = useGeolocation();
  const { user } = useAuthContext();
  const { addToast } = useToast();

  const municipality = location
    ? detectMunicipality(location.lat, location.lng)
    : null;

  const handleTypeSelect = (type) => {
    setReportType(type);
    setStep(2);
  };

  const handleEvidenceContinue = () => {
    setFormData({ severity: '', description: '' });
    setStep(3);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setReportType(null);
      setEvidenceFiles([]);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!formData.severity) {
      addToast('Please select a severity level', 'warning');
      return;
    }
    if (!formData.description || formData.description.trim().length < 10) {
      addToast('Please provide a description (at least 10 characters)', 'warning');
      return;
    }
    if (!location) {
      addToast('Location is required. Please enable GPS.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        location: {
          lat: location.lat,
          lng: location.lng,
          municipality: municipality || 'Unknown',
          barangay: formData.barangay || '',
          street: formData.street || '',
          accuracy: location.accuracy
        },
        disaster: {
          type: 'pending',
          severity: formData.severity,
          description: formData.description,
          tags: []
        },
        reportType,
      };

      await submitReport(reportData, evidenceFiles, user);

      addToast('Report submitted successfully.', 'success');
      handleClose();
    } catch (error) {
      const msg = error?.message || error?.code || 'Unknown error';
      addToast(`Failed to submit report: ${msg}`, 'error');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setReportType(null);
    setEvidenceFiles([]);
    setFormData({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={STEP_TITLES[step]}
    >
      {step === 1 && (
        <ReportTypeSelector onSelect={handleTypeSelect} />
      )}

      {step === 2 && (
        <div className="space-y-4">
          <EvidenceCapture
            files={evidenceFiles}
            onFilesChange={setEvidenceFiles}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleBack}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleEvidenceContinue}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <ReportForm
            formData={formData}
            onChange={setFormData}
          />

          <ReportSubmission
            location={location}
            municipality={municipality}
            isSubmitting={isSubmitting}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting || !formData.severity || !formData.description}
              className="flex-1"
            >
              Submit Report
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
