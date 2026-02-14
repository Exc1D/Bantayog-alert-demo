import { useReportsContext } from '../contexts/ReportsContext';
import LeafletMap from '../components/Map/LeafletMap';

export default function MapTab({ onViewReport }) {
  const { reports } = useReportsContext();

  return (
    <div className="h-[calc(100vh-112px)]">
      <LeafletMap
        reports={reports}
        onReportClick={onViewReport}
      />
    </div>
  );
}
