import { useState, lazy, Suspense } from 'react';
import Header from './components/Layout/Header';
import TabNavigation from './components/Layout/TabNavigation';
import Footer from './components/Layout/Footer';
import LoadingSpinner from './components/Common/LoadingSpinner';
import { AuthProvider } from './contexts/AuthContext';
import { ReportsProvider } from './contexts/ReportsContext';
import { ToastProvider } from './components/Common/Toast';

const MapTab = lazy(() => import('./pages/MapTab'));
const FeedTab = lazy(() => import('./pages/FeedTab'));
const WeatherTab = lazy(() => import('./pages/WeatherTab'));
const ProfileTab = lazy(() => import('./pages/ProfileTab'));
const ReportModal = lazy(() => import('./components/Reports/ReportModal'));

function AppContent() {
  const [activeTab, setActiveTab] = useState('map');
  const [showReportModal, setShowReportModal] = useState(false);

  const handleViewMap = (report) => {
    setActiveTab('map');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'map':
        return <MapTab onViewReport={(report) => {}} />;
      case 'feed':
        return <FeedTab onViewMap={handleViewMap} />;
      case 'weather':
        return <WeatherTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <MapTab onViewReport={(report) => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1">
        <Suspense fallback={<div className="h-[calc(100vh-112px)] flex items-center justify-center"><LoadingSpinner /></div>}>
          {renderTab()}
        </Suspense>
      </main>

      {activeTab !== 'profile' && (
        <Footer />
      )}

      {/* Emergency Report Button */}
      <button
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-6 right-4 z-50 flex items-center gap-2 report-btn-glow text-white rounded-full emergency-pulse transition-all duration-200 px-5 py-3.5 sm:px-6"
        title="Report a Hazard"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-sm font-bold tracking-wide">REPORT</span>
      </button>

      {/* Report Modal */}
      {showReportModal && (
        <Suspense fallback={null}>
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ReportsProvider>
          <AppContent />
        </ReportsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
