import { useState } from 'react';
import Header from './components/Layout/Header';
import TabNavigation from './components/Layout/TabNavigation';
import Footer from './components/Layout/Footer';
import MapTab from './pages/MapTab';
import FeedTab from './pages/FeedTab';
import WeatherTab from './pages/WeatherTab';
import ProfileTab from './pages/ProfileTab';
import ReportModal from './components/Reports/ReportModal';
import { AuthProvider } from './contexts/AuthContext';
import { ReportsProvider } from './contexts/ReportsContext';
import { ToastProvider } from './components/Common/Toast';

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
        {renderTab()}
      </main>

      {activeTab !== 'profile' && (
        <Footer />
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-danger to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center text-2xl"
        title="Report a Disaster"
      >
        +
      </button>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
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
