import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReportsProvider, useReportsContext } from './ReportsContext';

vi.mock('../hooks/useReports', () => ({
  useReports: vi.fn(() => ({
    reports: [],
    loading: false,
    error: null,
    loadMore: vi.fn(),
    hasMore: true,
  })),
}));

describe('ReportsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial state to children', () => {
    const { result } = renderHook(() => useReportsContext(), { wrapper: ReportsProvider });

    expect(result.current.reports).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('provides updateFilters function', () => {
    const { result } = renderHook(() => useReportsContext(), { wrapper: ReportsProvider });

    expect(typeof result.current.updateFilters).toBe('function');
  });

  it('updateFilters updates filters correctly', () => {
    const { result } = renderHook(() => useReportsContext(), { wrapper: ReportsProvider });

    act(() => {
      result.current.updateFilters({ municipality: 'Daet' });
    });

    expect(result.current.filters.municipality).toBe('Daet');
  });
});
