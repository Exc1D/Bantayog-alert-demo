import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthContext } from '../../contexts/AuthContext';
import { db } from '../../utils/firebaseConfig';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import { useToast } from '../Common/Toast';

export default function PrivacySettings() {
  const { user, userProfile, exportUserData, removeAccount } = useAuthContext();
  const { addToast } = useToast();
  const [dataCollectionEnabled, setDataCollectionEnabled] = useState(
    userProfile?.settings?.dataCollectionEnabled ?? true
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  if (!user || user.isAnonymous) {
    return null;
  }

  const handleDataCollectionToggle = async () => {
    if (toggling) return;
    setToggling(true);

    let newValue;
    setDataCollectionEnabled((prev) => {
      newValue = !prev;
      return newValue;
    });

    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { settings: { dataCollectionEnabled: newValue } },
        { merge: true }
      );
      addToast(`Data collection ${newValue ? 'enabled' : 'disabled'}`, 'info');
    } catch {
      setDataCollectionEnabled((prev) => !prev);
      addToast('Failed to update privacy setting', 'error');
    } finally {
      setToggling(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      await exportUserData(user.uid, user.email);
      addToast('Your data export has been initiated. You will receive it via email.', 'success');
      setShowExportModal(false);
    } catch {
      addToast('Failed to initiate data export. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      addToast('Please type DELETE exactly to confirm account deletion.', 'warning');
      return;
    }

    setDeleting(true);
    try {
      await removeAccount();
      addToast('Your account and all associated data have been deleted.', 'info');
      setShowDeleteModal(false);
    } catch (error) {
      if (error?.code === 'auth/requires-recent-login') {
        addToast('Please sign in again before deleting your account.', 'warning');
      } else {
        addToast(error.message || 'Failed to delete account. Please try again.', 'error');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-card border border-stone-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-text">Privacy & Data</h3>
          <p className="text-xs text-textLight">Manage your personal data</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-stone-100">
          <div>
            <p className="text-sm font-medium text-text">Data Collection</p>
            <p className="text-xs text-textLight">
              Allow us to collect usage data to improve the service
            </p>
          </div>
          <button
            onClick={handleDataCollectionToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              dataCollectionEnabled ? 'bg-accent' : 'bg-stone-300'
            }`}
            role="switch"
            aria-checked={dataCollectionEnabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                dataCollectionEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="pt-2 space-y-2">
          <Button variant="secondary" onClick={() => setShowExportModal(true)} className="w-full">
            <span className="flex items-center gap-2">
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export My Data
            </span>
          </Button>
          <p className="text-xs text-textLight text-center">
            Download a copy of all your data stored in our system
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <Button
            variant="ghost"
            onClick={() => setShowDeleteModal(true)}
            className="w-full text-red-600 hover:text-red-700"
          >
            <span className="flex items-center gap-2">
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete My Account
            </span>
          </Button>
          <p className="text-xs text-red-500 text-center">
            Permanently delete your account and all associated data
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-stone-100">
        <p className="text-xs text-textMuted">
          Under GDPR, you have the right to access, rectify, port, and delete your data. Contact our
          Data Protection Officer for assistance.
        </p>
      </div>

      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Your Data"
      >
        <div className="space-y-4">
          <p className="text-sm text-textLight">
            We will prepare a copy of all your data and send it to your registered email address.
            This may take up to 30 days.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowExportModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleExportData} loading={exporting} className="flex-1">
              Export Data
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-800 font-medium">
              Warning: This action cannot be undone
            </p>
            <ul className="text-xs text-red-700 mt-2 list-disc list-inside">
              <li>Your account will be permanently deleted</li>
              <li>All your reports will be anonymized</li>
              <li>You will lose access to all features</li>
              <li>This action is irreversible</li>
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
              className="w-full border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              placeholder="DELETE"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              loading={deleting}
              disabled={deleteConfirmation !== 'DELETE'}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
