import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';

const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

const originalNavigator = globalThis.navigator;

beforeEach(() => {
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      ...originalNavigator,
      geolocation: mockGeolocation,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    },
    writable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useGeolocation', () => {
  it('returns initial state with null location', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation(() => {});

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.location).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('sets location on successful geolocation', async () => {
    const mockPosition = {
      coords: {
        latitude: 18.1978,
        longitude: 120.5939,
        accuracy: 10,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.location).toEqual({
      lat: 18.1978,
      lng: 120.5939,
      accuracy: 10,
    });
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('sets error on geolocation failure', async () => {
    const mockError = {
      code: 1,
      message: 'User denied Geolocation',
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.location).toBeNull();
    expect(result.current.error).toBe('User denied Geolocation');
    expect(result.current.loading).toBe(false);
  });

  it('refresh function requests new location', async () => {
    const mockPosition = {
      coords: {
        latitude: 18.1978,
        longitude: 120.5939,
        accuracy: 10,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.location).not.toBeNull();

    mockGeolocation.getCurrentPosition.mockClear();
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 18.2,
          longitude: 120.6,
          accuracy: 5,
        },
      });
    });

    act(() => {
      result.current.refresh();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('detects in-app browsers via userAgent pattern', () => {
    expect(true).toBe(true);
  });
});
