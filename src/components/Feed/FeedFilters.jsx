import { DISASTER_TYPES } from '../../data/disasterTypes';
import { MUNICIPALITIES } from '../../utils/constants';

export default function FeedFilters({ filters, onFilterChange }) {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const selectClass = "flex-1 min-w-[130px] p-2 border border-stone-300 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent";

  return (
    <div className="bg-white rounded-xl p-3 shadow-card mb-3 border border-stone-100">
      <div className="flex gap-2 flex-wrap">
        <select
          className={selectClass}
          value={filters.type || 'all'}
          onChange={(e) => handleChange('type', e.target.value)}
        >
          <option value="all">All Hazard Types</option>
          {DISASTER_TYPES.map(type => (
            <option key={type.id} value={type.id}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={filters.status || 'all'}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="resolved">Resolved</option>
          <option value="pending">Pending</option>
        </select>

        <select
          className={selectClass}
          value={filters.municipality || 'all'}
          onChange={(e) => handleChange('municipality', e.target.value)}
        >
          <option value="all">All Municipalities</option>
          {MUNICIPALITIES.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          className={selectClass}
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
