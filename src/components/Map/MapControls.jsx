import { DISASTER_TYPES } from '../../data/disasterTypes';
import { MUNICIPALITIES } from '../../utils/constants';

export default function MapControls({ filters, onFilterChange, reportCount }) {
  return (
    <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none">
      <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-3 pointer-events-auto">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Disaster Type Filter */}
          <select
            value={filters.type || 'all'}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="all">All Types</option>
            {DISASTER_TYPES.map(type => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Municipality Filter */}
          <select
            value={filters.municipality || 'all'}
            onChange={(e) => onFilterChange({ ...filters, municipality: e.target.value })}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="all">All Municipalities</option>
            {MUNICIPALITIES.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Report Count */}
          <span className="text-xs text-textLight ml-auto">
            {reportCount} report{reportCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
