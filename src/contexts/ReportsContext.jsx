import { createContext, useContext, useState } from 'react';
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

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <ReportsContext.Provider value={{
      reports,
      loading,
      error,
      loadMore,
      hasMore,
      filters,
      updateFilters
    }}>
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
