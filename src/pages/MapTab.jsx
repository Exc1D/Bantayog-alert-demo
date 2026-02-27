import { useMemo } from 'react';
import { useReportsContext } from '../contexts/ReportsContext';
import LeafletMap from '../components/Map/LeafletMap';

export default function MapTab({ onViewReport }) {
  const { reports } = useReportsContext();

  // Filter out resolved reports — resolved pins should not appear on the map
  const mapReports = useMemo(() => {
    return reports.filter((report) => report.verification?.status !== 'resolved');
  }, [reports]);

  return (
    <div className="flex-1 min-h-0 isolate">
      <LeafletMap reports={mapReports} onReportClick={onViewReport} />
    </div>
  );
}
