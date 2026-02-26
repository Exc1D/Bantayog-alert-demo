import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInfiniteScroll } from './useInfiniteScroll';

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state with loading false', () => {
    const loadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(loadMore, true));
    expect(result.current.loading).toBe(false);
  });

  it('returns lastElementRef as a function', () => {
    const loadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(loadMore, true));
    expect(typeof result.current.lastElementRef).toBe('function');
  });

  it('returns loading state correctly', () => {
    const loadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(loadMore, false));
    expect(result.current.loading).toBe(false);
  });
});
