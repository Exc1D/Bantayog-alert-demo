import { DISASTER_TYPES } from '../../data/disasterTypes';
import { MUNICIPALITIES } from '../../utils/constants';

export default function MapControls({ filters, onFilterChange, reportCount }) {
  const selectClass = "text-[11px] font-medium border border-white/20 rounded-lg px-2 py-1.5 bg-white/10 text-white focus:ring-2 focus:ring-accent/50 focus:border-accent appearance-none";

  return (
    <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none">
      <div className="bg-primary/90 backdrop-blur-sm rounded-xl shadow-dark p-2.5 pointer-events-auto">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filters.type || 'all'}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            className={selectClass}
          >
            <option value="all">All Types</option>
            {DISASTER_TYPES.map(type => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>

          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className={selectClass}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filters.municipality || 'all'}
            onChange={(e) => onFilterChange({ ...filters, municipality: e.target.value })}
            className={selectClass}
          >
            <option value="all">All Areas</option>
            {MUNICIPALITIES.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 bg-accent rounded-full live-beacon" />
            <span className="text-[10px] font-bold text-white/80 tracking-wide">
              {reportCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
