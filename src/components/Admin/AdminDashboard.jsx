import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import { useAuthContext } from '../../contexts/AuthContext';
import { getDisasterType } from '../../data/disasterTypes';
import { formatTimeAgo } from '../../utils/timeUtils';
import { SEVERITY_COLORS } from '../../utils/constants';
import Modal from '../Common/Modal';
import VerificationPanel from './VerificationPanel';
import ResolutionModal from './ResolutionModal';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function AdminDashboard() {
  const [pendingReports, setPendingReports] = useState([]);
  const [verifiedReports, setVerifiedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const { isAdmin, isSuperAdmin, userProfile } = useAuthContext();

  useEffect(() => {
    if (!isAdmin) return;

    // Listen for pending reports
    const pendingQuery = query(
      collection(db, 'reports'),
      where('verification.status', '==', 'pending'),
      orderBy('timestamp', 'desc')
    );

    const verifiedQuery = query(
      collection(db, 'reports'),
      where('verification.status', '==', 'verified'),
      orderBy('timestamp', 'desc')
    );

    const unsubPending = onSnapshot(pendingQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Filter by municipality for non-provincial admins
      if (!isSuperAdmin && userProfile?.municipality) {
        setPendingReports(docs.filter(d => d.location?.municipality === userProfile.municipality));
      } else {
        setPendingReports(docs);
      }
      setLoading(false);
    });

    const unsubVerified = onSnapshot(verifiedQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!isSuperAdmin && userProfile?.municipality) {
        setVerifiedReports(docs.filter(d => d.location?.municipality === userProfile.municipality));
      } else {
        setVerifiedReports(docs);
      }
    });

    return () => {
      unsubPending();
      unsubVerified();
    };
  }, [isAdmin, isSuperAdmin, userProfile?.municipality]);

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">{'\u{1F512}'}</p>
        <h3 className="text-lg font-bold">Admin Access Required</h3>
        <p className="text-sm text-textLight">This section is only available to DRRMO administrators.</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  const displayReports = activeTab === 'pending' ? pendingReports : verifiedReports;

  return (
    <div>
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-secondary to-blue-700 rounded-xl p-4 mb-4 text-white">
        <h2 className="text-xl font-bold">
          {isSuperAdmin ? 'Provincial' : 'Municipal'} Admin Dashboard
        </h2>
        <p className="text-sm text-white/80">
          {pendingReports.length} pending | {verifiedReports.length} awaiting resolution
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'pending'
              ? 'bg-warning text-white'
              : 'bg-white text-textLight hover:bg-gray-50'
          }`}
        >
          Pending ({pendingReports.length})
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'verified'
              ? 'bg-accent text-white'
              : 'bg-white text-textLight hover:bg-gray-50'
          }`}
        >
          Needs Resolution ({verifiedReports.length})
        </button>
      </div>

      {/* Report List */}
      {displayReports.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-3xl mb-2">{activeTab === 'pending' ? '\u2705' : '\u{1F389}'}</p>
          <p className="font-semibold">
            {activeTab === 'pending' ? 'No pending reports' : 'All verified reports resolved'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayReports.map(report => {
            const disasterType = getDisasterType(report.disaster?.type);
            const sevColors = SEVERITY_COLORS[report.disaster?.severity] || SEVERITY_COLORS.minor;

            return (
              <div
                key={report.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedReport(report);
                  if (activeTab === 'pending') {
                    setShowVerifyModal(true);
                  } else {
                    setShowResolveModal(true);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{disasterType.icon}</span>
                    <div>
                      <p className="font-bold text-sm">{disasterType.label}</p>
                      <p className="text-xs text-textLight">
                        {report.location?.municipality} &bull; {formatTimeAgo(report.timestamp)}
                      </p>
                    </div>
                  </div>
                  <span className={`${sevColors.bg} ${sevColors.text} px-2 py-0.5 rounded text-xs font-bold uppercase`}>
                    {report.disaster?.severity}
                  </span>
                </div>
                <p className="text-xs text-textLight mt-2 line-clamp-2">
                  {report.disaster?.description}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Verification Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => { setShowVerifyModal(false); setSelectedReport(null); }}
        title="Verify Report"
      >
        {selectedReport && (
          <VerificationPanel
            report={selectedReport}
            onDone={() => { setShowVerifyModal(false); setSelectedReport(null); }}
          />
        )}
      </Modal>

      {/* Resolution Modal */}
      <ResolutionModal
        isOpen={showResolveModal}
        onClose={() => { setShowResolveModal(false); setSelectedReport(null); }}
        report={selectedReport}
      />
    </div>
  );
}
