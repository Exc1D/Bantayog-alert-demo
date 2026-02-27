import { useState, useEffect, useCallback, lazy, Suspense, useTransition } from 'react';
import Header from './components/Layout/Header';
import TabNavigation from './components/Layout/TabNavigation';
import Footer from './components/Layout/Footer';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';
import MapErrorBoundary from './components/Map/MapErrorBoundary';
import ReportFormErrorBoundary from './components/Reports/ReportFormErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ReportsProvider } from './contexts/ReportsContext';
import { ToastProvider } from './components/Common/Toast';
import SignUpPromptModal from './components/Common/SignUpPromptModal';

const MapTab = lazy(() => import('./pages/MapTab'));
const FeedTab = lazy(() => import('./pages/FeedTab'));
const WeatherTab = lazy(() => import('./pages/WeatherTab'));
const ProfileTab = lazy(() => import('./pages/ProfileTab'));
const ReportModal = lazy(() => import('./components/Reports/ReportModal'));

const VALID_TABS = ['map', 'feed', 'weather', 'profile'];
const noop = () => {};

const TAB_TITLES = {
  map: 'Map - BANTAYOG ALERT',
  feed: 'Feed - BANTAYOG ALERT',
  weather: 'Weather - BANTAYOG ALERT',
  profile: 'Profile - BANTAYOG ALERT',
};

function getTabFromHash() {
  const hash = window.location.hash.replace('#', '');
  return VALID_TABS.includes(hash) ? hash : 'map';
}

function AppContent() {
  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [_isPending, startTransition] = useTransition();

  // Sync tab changes to URL hash + browser history
  const changeTab = useCallback((tab) => {
    if (!VALID_TABS.includes(tab)) tab = 'map';
    startTransition(() => {
      setActiveTab(tab);
    });
    const newHash = `#${tab}`;
    if (window.location.hash !== newHash) {
      window.history.pushState(null, '', newHash);
    }
  }, []);

  // Listen for browser back/forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromHash());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Set initial hash on mount if not already present
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#map');
    }
  }, []);

  // Update document title on tab change
  useEffect(() => {
    document.title = TAB_TITLES[activeTab] || 'BANTAYOG ALERT';
  }, [activeTab]);

  const handleViewMap = () => {
    changeTab('map');
  };

  const openSignUpPrompt = () => {
    setShowSignUpPrompt(true);
  };

  const handleSignUpNow = () => {
    setShowSignUpPrompt(false);
    changeTab('profile');
  };

  const handleOpenProfileTab = () => {
    changeTab('profile');
  };

  const handleOpenReportModal = () => setShowReportModal(true);

  const renderTab = () => {
    switch (activeTab) {
      case 'map':
        return (
          <MapErrorBoundary>
            <MapTab onViewReport={noop} />
          </MapErrorBoundary>
        );
      case 'feed':
        return <FeedTab onViewMap={handleViewMap} onRequireSignUp={openSignUpPrompt} />;
      case 'weather':
        return <WeatherTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return (
          <MapErrorBoundary>
            <MapTab onViewReport={noop} />
          </MapErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header onProfileClick={handleOpenProfileTab} />
      <TabNavigation activeTab={activeTab} onTabChange={changeTab} />

      <main className="flex-1" id={`tabpanel-${activeTab}`}>
        <Suspense
          fallback={
            <div className="h-[calc(100vh-112px)] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          }
        >
          {renderTab()}
        </Suspense>
      </main>

      {activeTab !== 'profile' && <Footer />}

      {/* Emergency Report Button */}
      <button
        onClick={handleOpenReportModal}
        className="fixed bottom-6 right-4 z-50 flex items-center gap-2 report-btn-glow text-white rounded-full emergency-pulse transition-all duration-200 px-5 py-3.5 sm:px-6"
        aria-label="Report a hazard"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-sm font-bold tracking-wide">REPORT</span>
      </button>

      {/* Report Modal */}
      {showReportModal && (
        <Suspense fallback={null}>
          <ReportFormErrorBoundary>
            <ReportModal
              isOpen={showReportModal}
              onClose={() => setShowReportModal(false)}
              onAnonymousReportSubmitted={openSignUpPrompt}
            />
          </ReportFormErrorBoundary>
        </Suspense>
      )}

      <SignUpPromptModal
        isOpen={showSignUpPrompt}
        onClose={() => setShowSignUpPrompt(false)}
        onSignUpNow={handleSignUpNow}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ReportsProvider>
            <AppContent />
          </ReportsProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
