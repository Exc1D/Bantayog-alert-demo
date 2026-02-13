import { DISASTER_TYPES } from '../../data/disasterTypes';
import { MUNICIPALITIES } from '../../utils/constants';

export default function FeedFilters({ filters, onFilterChange }) {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <div className="flex gap-3 flex-wrap">
        <select
          className="flex-1 min-w-[140px] p-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
          value={filters.type || 'all'}
          onChange={(e) => handleChange('type', e.target.value)}
        >
          <option value="all">All Disaster Types</option>
          {DISASTER_TYPES.map(type => (
            <option key={type.id} value={type.id}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>

        <select
          className="flex-1 min-w-[140px] p-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
          value={filters.status || 'all'}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="resolved">Resolved</option>
          <option value="pending">Pending</option>
        </select>

        <select
          className="flex-1 min-w-[140px] p-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
          value={filters.municipality || 'all'}
          onChange={(e) => handleChange('municipality', e.target.value)}
        >
          <option value="all">All Municipalities</option>
          {MUNICIPALITIES.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          className="flex-1 min-w-[140px] p-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
          value={filters.sort || 'recent'}
          onChange={(e) => handleChange('sort', e.target.value)}
        >
          <option value="recent">Most Recent</option>
          <option value="upvoted">Most Upvoted</option>
          <option value="critical">Most Critical</option>
        </select>
      </div>
    </div>
  );
}
