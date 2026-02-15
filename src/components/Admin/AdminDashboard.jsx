import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import { useAuthContext } from '../../contexts/AuthContext';
import { getDisasterType } from '../../data/disasterTypes';
import { formatTimeAgo } from '../../utils/timeUtils';
import { deleteReport } from '../../hooks/useReports';
import { useToast } from '../Common/Toast';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import VerificationPanel from './VerificationPanel';
import ResolutionModal from './ResolutionModal';
import LoadingSpinner from '../Common/LoadingSpinner';

const SEV_STYLES = {
  critical: 'bg-red-600 text-white',
  moderate: 'bg-amber-500 text-white',
  minor: 'bg-emerald-600 text-white'
};

export default function AdminDashboard() {
  const [pendingReports, setPendingReports] = useState([]);
  const [verifiedReports, setVerifiedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const { isAdmin, isSuperAdmin, userProfile } = useAuthContext();
  const { addToast } = useToast();

  useEffect(() => {
    if (!isAdmin) return;

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

  const handleDeleteReport = async (reportId) => {
    setDeleting(true);
    try {
      await deleteReport(reportId);
      addToast('Report deleted permanently', 'success');
    } catch (error) {
      addToast('Failed to delete report', 'error');
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 rounded-full flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h3 className="text-sm font-bold">Admin Access Required</h3>
        <p className="text-xs text-textLight mt-1">This section is only available to DRRMO administrators.</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const displayReports = activeTab === 'pending' ? pendingReports : verifiedReports;

  return (
    <div>
      {/* Admin Header */}
      <div className="bg-primary rounded-xl p-4 mb-3 text-white">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ec4b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <h2 className="text-sm font-bold tracking-wide uppercase">
            {isSuperAdmin ? 'Provincial' : 'Municipal'} Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-3 mt-2 ml-[26px]">
          <span className="text-xs text-amber-400 font-bold">{pendingReports.length} pending</span>
          <span className="text-white/20">&bull;</span>
          <span className="text-xs text-blue-400 font-bold">{verifiedReports.length} awaiting resolution</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-warning text-white shadow-sm'
              : 'bg-white text-textLight hover:bg-stone-50 border border-stone-200'
          }`}
        >
          Pending ({pendingReports.length})
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'verified'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-white text-textLight hover:bg-stone-50 border border-stone-200'
          }`}
        >
          Needs Resolution ({verifiedReports.length})
        </button>
      </div>

      {/* Report List */}
      {displayReports.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-center shadow-card border border-stone-100">
          <div className="w-10 h-10 mx-auto mb-2 bg-emerald-50 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="font-semibold text-sm">
            {activeTab === 'pending' ? 'No pending reports' : 'All reports resolved'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayReports.map(report => {
            const disasterType = getDisasterType(report.disaster?.type);
            const sevStyle = SEV_STYLES[report.disaster?.severity] || SEV_STYLES.minor;

            return (
              <div
                key={report.id}
                className="bg-white rounded-xl p-3 shadow-card border border-stone-100 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer active:scale-[0.99]"
                    onClick={() => {
                      setSelectedReport(report);
                      if (activeTab === 'pending') {
                        setShowVerifyModal(true);
                      } else {
                        setShowResolveModal(true);
                      }
                    }}
                  >
                    <span className="text-lg">{disasterType.icon}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-xs uppercase tracking-wide">{disasterType.label}</p>
                      <p className="text-[10px] text-textLight">
                        {report.location?.municipality} &bull; {formatTimeAgo(report.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`${sevStyle} px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide`}>
                      {report.disaster?.severity}
                    </span>
                    {/* Delete button */}
                    {deleteConfirmId === report.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          disabled={deleting}
                          className="bg-red-600 text-white rounded-lg p-1.5 hover:bg-red-700 transition-colors disabled:opacity-40"
                          title="Confirm delete"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="bg-stone-200 text-stone-600 rounded-lg p-1.5 hover:bg-stone-300 transition-colors"
                          title="Cancel"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(report.id);
                        }}
                        className="text-stone-300 hover:text-red-500 transition-colors p-1"
                        title="Delete report"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p
                  className="text-[11px] text-textLight mt-1.5 line-clamp-2 pl-[30px] cursor-pointer"
                  onClick={() => {
                    setSelectedReport(report);
                    if (activeTab === 'pending') {
                      setShowVerifyModal(true);
                    } else {
                      setShowResolveModal(true);
                    }
                  }}
                >
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
        title="VERIFY REPORT"
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
