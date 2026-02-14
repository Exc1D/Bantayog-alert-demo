import { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import DisasterTypeSelector from './DisasterTypeSelector';
import ReportForm from './ReportForm';
import ReportSubmission from './ReportSubmission';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '../Common/Toast';
import { submitReport } from '../../hooks/useReports';
import { detectMunicipality } from '../../utils/geoFencing';

export default function ReportModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { location, loading: geoLoading } = useGeolocation();
  const { user } = useAuthContext();
  const { addToast } = useToast();

  const municipality = location
    ? detectMunicipality(location.lat, location.lng)
    : null;

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData({ severity: '', description: '', tags: [] });
    setPhotos([]);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedType(null);
    setFormData({});
    setPhotos([]);
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
      const { severity, description, tags, barangay, street, ...extraFields } = formData;

      const reportData = {
        location: {
          lat: location.lat,
          lng: location.lng,
          municipality: municipality || 'Unknown',
          barangay: barangay || '',
          street: street || '',
          accuracy: location.accuracy
        },
        disaster: {
          type: selectedType.id,
          severity,
          description,
          tags: tags || [],
          extraFields
        }
      };

      await submitReport(reportData, photos, user);

      addToast('Report submitted successfully.', 'success');
      handleClose();
    } catch (error) {
      addToast('Failed to submit report. Please try again.', 'error');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedType(null);
    setFormData({});
    setPhotos([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'REPORT HAZARD' : `Report: ${selectedType?.label}`}
    >
      {step === 1 && (
        <DisasterTypeSelector
          selectedType={selectedType}
          onSelect={handleTypeSelect}
        />
      )}

      {step === 2 && selectedType && (
        <div className="space-y-4">
          <ReportForm
            disasterType={selectedType}
            formData={formData}
            onChange={setFormData}
            photos={photos}
            onPhotosChange={setPhotos}
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
