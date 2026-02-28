import { useState, useCallback, useEffect, useRef } from 'react';
import { MUNICIPALITIES } from '../../utils/constants';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function FeedFilters({ filters, onFilterChange }) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 300);
  const inputRef = useRef(null);

  const handleChange = useCallback(
    (key, value) => {
      onFilterChange({ ...filters, [key]: value });
    },
    [filters, onFilterChange]
  );

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      handleChange('search', debouncedSearch);
    }
  }, [debouncedSearch, filters.search, handleChange]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    inputRef.current?.focus();
  }, []);

  const selectClass =
    'flex-1 min-w-[130px] p-2 border border-stone-300 dark:border-stone-600 rounded-lg text-xs font-medium bg-white dark:bg-dark-card text-text dark:text-dark-text focus:ring-2 focus:ring-accent/30 focus:border-accent';

  const searchClass =
    'flex-1 min-w-[150px] p-2 border border-stone-300 dark:border-stone-600 rounded-lg text-xs font-medium bg-white dark:bg-dark-card text-text dark:text-dark-text focus:ring-2 focus:ring-accent/30 focus:border-accent placeholder:text-textMuted dark:placeholder:text-dark-textMuted';

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-3 shadow-card mb-3 border border-stone-100 dark:border-dark-border">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[150px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted dark:text-dark-textMuted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search reports..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`${searchClass} pl-9 pr-8`}
            aria-label="Search reports"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-textMuted hover:text-text dark:hover:text-dark-text"
              aria-label="Clear search"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <select
          aria-label="Filter by municipality"
          className={selectClass}
          value={filters.municipality || 'all'}
          onChange={(e) => handleChange('municipality', e.target.value)}
        >
          <option value="all">All Municipalities</option>
          {MUNICIPALITIES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort reports"
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
