import { useState, useRef, useEffect } from 'react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import { captureException } from '../../utils/sentry';
import ReportTypeSelector from './ReportTypeSelector';
import EvidenceCapture from './EvidenceCapture';
import ReportForm from './ReportForm';
import ReportSubmission from './ReportSubmission';
import RateLimitIndicator from '../Common/RateLimitIndicator';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '../Common/Toast';
import { submitReport } from '../../hooks/useReports';
import { resolveMunicipality } from '../../utils/geoFencing';
import { MUNICIPALITY_COORDS } from '../../utils/constants';
import { useRateLimit } from '../../hooks/useRateLimit';
import { sanitizeText, truncateText, containsXSS } from '../../utils/sanitization';
import { FEATURE_FLAGS } from '../../config/featureFlags';
import FeatureFlag, { FeatureFlagDisabled } from '../Common/FeatureFlag';

const STEP_TITLES = {
  1: 'REPORT INCIDENT',
  2: 'PROVIDE EVIDENCE',
  3: 'REPORT DETAILS',
};

const STEPS = [
  { num: 1, label: 'Type' },
  { num: 2, label: 'Evidence' },
  { num: 3, label: 'Details' },
];

const DRAFT_KEY = 'bantayog_report_draft';

function loadDraft() {
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      return JSON.parse(draft);
    }
  } catch {
    // Ignore localStorage errors
  }
  return null;
}

function saveDraft(data) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // Ignore localStorage errors
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

export default function ReportModal({ isOpen, onClose, onAnonymousReportSubmitted }) {
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualMunicipality, setManualMunicipality] = useState('');

  const {
    location,
    error: geoError,
    loading: geoLoading,
    refresh: refreshLocation,
    isInApp,
  } = useGeolocation();
  const { user, signInAsGuest } = useAuthContext();
  const { addToast } = useToast();
  const rateLimit = useRateLimit('report_submission');
  const anonTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (anonTimeoutRef.current) clearTimeout(anonTimeoutRef.current);
    };
  }, []);

  // Auto-save draft when form data changes
  useEffect(() => {
    if (isOpen && (formData.description || formData.barangay || formData.street)) {
      const draftData = { reportType, formData, manualMunicipality, step };
      saveDraft(draftData);
    }
  }, [formData, reportType, manualMunicipality, step, isOpen]);

  // Load draft when modal opens
  useEffect(() => {
    if (isOpen) {
      const draft = loadDraft();
      if (draft && draft.step) {
        if (draft.formData?.description) {
          setFormData(draft.formData || {});
          setReportType(draft.reportType || null);
          setManualMunicipality(draft.manualMunicipality || '');
          if (draft.step > 1) {
            setStep(draft.step);
          }
          addToast('Resumed from saved draft', 'info');
        }
      }
    }
  }, [isOpen, addToast]);

  const municipality = location
    ? resolveMunicipality(location.lat, location.lng).municipality
    : manualMunicipality || null;

  // Build an effective location from GPS or manual selection
  const effectiveLocation =
    location ||
    (manualMunicipality && MUNICIPALITY_COORDS[manualMunicipality]
      ? {
          lat: MUNICIPALITY_COORDS[manualMunicipality].lat,
          lng: MUNICIPALITY_COORDS[manualMunicipality].lng,
          accuracy: null, // manual — no GPS accuracy
        }
      : null);

  const handleTypeSelect = (type) => {
    setReportType(type);
    setStep(2);
  };

  const handleEvidenceContinue = () => {
    setFormData((prev) => ({ ...prev, description: '' }));
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
    const sanitizedDescription = sanitizeText(formData.description);
    const sanitizedBarangay = sanitizeText(formData.barangay);
    const sanitizedStreet = sanitizeText(formData.street);

    if (!sanitizedDescription || sanitizedDescription.trim().length < 10) {
      addToast('What is happening? (at least 10 characters)', 'warning');
      return;
    }
    if (
      containsXSS(formData.description) ||
      containsXSS(formData.barangay) ||
      containsXSS(formData.street)
    ) {
      addToast('Invalid characters detected in input', 'warning');
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
      const activeUser = user || (await signInAsGuest());

      const reportData = {
        location: {
          lat: effectiveLocation.lat,
          lng: effectiveLocation.lng,
          municipality: municipality || 'Unknown',
          barangay: truncateText(sanitizedBarangay, 100),
          street: truncateText(sanitizedStreet, 100),
          accuracy: effectiveLocation.accuracy ?? 0,
        },
        disaster: {
          type: 'pending',
          severity: 'pending',
          description: truncateText(sanitizedDescription, 2000),
          tags: [],
        },
        reportType,
      };

      const { skippedFiles } = await submitReport(reportData, evidenceFiles, activeUser);

      rateLimit.recordAction();

      if (skippedFiles > 0) {
        addToast(
          `Report submitted, but ${skippedFiles} file${skippedFiles > 1 ? 's' : ''} could not be uploaded.`,
          'warning'
        );
      } else {
        addToast('Report submitted successfully.', 'success');
      }

      if (activeUser?.isAnonymous && onAnonymousReportSubmitted) {
        anonTimeoutRef.current = window.setTimeout(() => {
          onAnonymousReportSubmitted();
        }, 10000);
      }

      handleClose();
    } catch (error) {
      if (error.code === 'rate_limited') {
        rateLimit.refresh();
        addToast(error.message, 'error');
      } else {
        const msg = error?.message || error?.code || 'Unknown error';
        addToast(`Failed to submit report: ${msg}`, 'error');
      }
      captureException(error, { tags: { component: 'ReportModal' } });
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
    clearDraft();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={STEP_TITLES[step]}>
      {/* Progress Stepper */}
      <div className="mb-6">
        <div className="flex items-center justify-center">
          {STEPS.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step > s.num
                      ? 'bg-green-500 text-white'
                      : step === s.num
                        ? 'bg-accent text-white'
                        : 'bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-400'
                  }`}
                >
                  {step > s.num ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium text-textLight dark:text-dark-textLight">
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${step > s.num ? 'bg-green-500' : 'bg-stone-200 dark:bg-stone-700'}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <FeatureFlag
        flag={FEATURE_FLAGS.NEW_REPORT_FLOW}
        fallback={
          <FeatureFlagDisabled flag={FEATURE_FLAGS.NEW_REPORT_FLOW}>
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 rounded-full flex items-center justify-center">
                <svg
                  aria-hidden="true"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#78716c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-sm text-textLight font-medium">
                Report submission is currently unavailable.
              </p>
              <p className="text-xs text-textLight mt-1">
                We&apos;re working on improving the reporting experience.
              </p>
            </div>
          </FeatureFlagDisabled>
        }
      >
        {step === 1 && <ReportTypeSelector onSelect={handleTypeSelect} />}

        {step === 2 && (
          <div className="space-y-4">
            <EvidenceCapture files={evidenceFiles} onFilesChange={setEvidenceFiles} />

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button variant="primary" onClick={handleEvidenceContinue} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <ReportForm formData={formData} onChange={setFormData} />

            <RateLimitIndicator
              remainingAttempts={rateLimit.remainingAttempts}
              maxAttempts={rateLimit.maxAttempts}
              resetTime={rateLimit.resetTime}
              message={rateLimit.message}
              isAllowed={rateLimit.isAllowed}
              showWhenAllowed={true}
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
                disabled={
                  isSubmitting ||
                  !formData.description ||
                  !effectiveLocation ||
                  !rateLimit.isAllowed
                }
                className="flex-1"
              >
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </FeatureFlag>
    </Modal>
  );
}
