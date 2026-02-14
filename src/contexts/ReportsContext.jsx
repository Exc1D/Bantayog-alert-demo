import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useReports } from '../hooks/useReports';

const ReportsContext = createContext(null);

export function ReportsProvider({ children }) {
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    municipality: 'all',
    sort: 'recent'
  });

  const { reports, loading, error, loadMore, hasMore } = useReports(filters);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const value = useMemo(() => ({
    reports,
    loading,
    error,
    loadMore,
    hasMore,
    filters,
    updateFilters
  }), [reports, loading, error, loadMore, hasMore, filters, updateFilters]);

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReportsContext() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReportsContext must be used within a ReportsProvider');
  }
  return context;
}

export default ReportsContext;
