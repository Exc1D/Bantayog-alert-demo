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
import { resolveMunicipality } from '../../utils/geoFencing';
import { MUNICIPALITY_COORDS } from '../../utils/constants';

const STEP_TITLES = {
  1: 'REPORT INCIDENT',
  2: 'PROVIDE EVIDENCE',
  3: 'REPORT DETAILS',
};

export default function ReportModal({ isOpen, onClose, onAnonymousReportSubmitted }) {
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState(null); // 'emergency' | 'situation'
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualMunicipality, setManualMunicipality] = useState('');

  const { location, error: geoError, loading: geoLoading, refresh: refreshLocation, isInApp } = useGeolocation();
  const { user, signInAsGuest } = useAuthContext();
  const { addToast } = useToast();

  const municipality = location
    ? resolveMunicipality(location.lat, location.lng).municipality
    : manualMunicipality || null;

  // Build an effective location from GPS or manual selection
  const effectiveLocation = location || (manualMunicipality && MUNICIPALITY_COORDS[manualMunicipality]
    ? {
        lat: MUNICIPALITY_COORDS[manualMunicipality].lat,
        lng: MUNICIPALITY_COORDS[manualMunicipality].lng,
        accuracy: null, // manual — no GPS accuracy
      }
    : null
  );

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
      addToast('What is the alert status?', 'warning');
      return;
    }
    if (!formData.description || formData.description.trim().length < 10) {
      addToast('What is happening? (at least 10 characters)', 'warning');
      return;
    }
    if (!effectiveLocation) {
      addToast(
        `Location is required. ${geoError || 'Please enable GPS or select your municipality manually.'}`,
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const activeUser = user || await signInAsGuest();

      const reportData = {
        location: {
          lat: effectiveLocation.lat,
          lng: effectiveLocation.lng,
          municipality: municipality || 'Unknown',
          barangay: formData.barangay || '',
          street: formData.street || '',
          accuracy: effectiveLocation.accuracy ?? 0
        },
        disaster: {
          type: 'pending',
          severity: formData.severity,
          description: formData.description,
          tags: []
        },
        reportType,
      };

      const { skippedFiles } = await submitReport(reportData, evidenceFiles, activeUser);

      if (skippedFiles > 0) {
        addToast(
          `Report submitted, but ${skippedFiles} file${skippedFiles > 1 ? 's' : ''} could not be uploaded.`,
          'warning'
        );
      } else {
        addToast('Report submitted successfully.', 'success');
      }

      if (activeUser?.isAnonymous && onAnonymousReportSubmitted) {
        window.setTimeout(() => {
          onAnonymousReportSubmitted();
        }, 10000);
      }

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
    setManualMunicipality('');
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
            geoLoading={geoLoading}
            geoError={geoError}
            isInApp={isInApp}
            manualMunicipality={manualMunicipality}
            onManualMunicipalityChange={setManualMunicipality}
            onRefreshLocation={refreshLocation}
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
              disabled={isSubmitting || !formData.severity || !formData.description || !effectiveLocation}
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
