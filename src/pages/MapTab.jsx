import { useReportsContext } from '../contexts/ReportsContext';
import LeafletMap from '../components/Map/LeafletMap';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function MapTab({ onViewReport }) {
  const { reports, loading } = useReportsContext();

  if (loading && reports.length === 0) {
    return (
      <div className="h-[calc(100vh-116px)] flex items-center justify-center">
        <LoadingSpinner text="Loading map data..." />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-116px)]">
      <LeafletMap
        reports={reports}
        onReportClick={onViewReport}
      />
    </div>
  );
}
