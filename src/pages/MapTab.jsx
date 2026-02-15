import { useMemo } from 'react';
import { useReportsContext } from '../contexts/ReportsContext';
import LeafletMap from '../components/Map/LeafletMap';

export default function MapTab({ onViewReport }) {
  const { reports } = useReportsContext();

  // Filter out resolved reports — resolved pins should not appear on the map
  const mapReports = useMemo(() => {
    return reports.filter(report => report.verification?.status !== 'resolved');
  }, [reports]);

  return (
    <div className="h-[calc(100vh-112px)] isolate">
      <LeafletMap
        reports={mapReports}
        onReportClick={onViewReport}
      />
    </div>
  );
}
