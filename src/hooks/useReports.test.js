import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useReports,
  submitReport,
  upvoteReport,
  removeUpvote,
  verifyReport,
  rejectReport,
  resolveReport,
  deleteReport,
  getReportSubmissionRateLimit,
} from './useReports';

vi.mock('../utils/firebaseConfig', () => ({
  db: {},
  storage: {},
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
}));

vi.mock('../utils/rateLimiter', () => ({
  checkLimit: vi.fn(() => ({ allowed: true, resetTime: null })),
  recordAction: vi.fn(),
  formatResetTime: vi.fn(() => '5 minutes'),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'reports'),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  onSnapshot: vi.fn((query, onSuccess) => {
    onSuccess({ docs: [{ data: () => ({ id: '1', title: 'Test Report' }), id: '1' }] });
    return vi.fn();
  }),
  where: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [{ data: () => ({ id: '2' }), id: '2' }] })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(),
  serverTimestamp: vi.fn(),
  increment: vi.fn((val) => val),
  arrayUnion: vi.fn((val) => val),
  arrayRemove: vi.fn((val) => val),
}));

vi.mock('firebase/storage', () => ({
  ref: vi.fn(() => ({})),
  uploadBytes: vi.fn(() => Promise.resolve()),
  getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/image.jpg')),
}));

vi.mock('../utils/imageCompression', () => ({
  compressImage: vi.fn((file) => Promise.resolve(file)),
  createThumbnail: vi.fn((file) => Promise.resolve(file)),
}));

vi.mock('../utils/weatherAPI', () => ({
  fetchCurrentWeather: vi.fn(() => Promise.resolve({})),
}));

vi.mock('../utils/geoFencing', () => ({
  resolveMunicipality: vi.fn(() => ({ municipality: 'Daet', method: 'polygon_match' })),
}));

describe('useReports hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state', async () => {
    const { result } = renderHook(() => useReports());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.reports).toBeTruthy();
  });

  it('provides loadMore function', () => {
    const { result } = renderHook(() => useReports());
    expect(typeof result.current.loadMore).toBe('function');
  });

  it('provides hasMore', () => {
    const { result } = renderHook(() => useReports());
    expect(typeof result.current.hasMore).toBe('boolean');
  });

  it('provides error state', () => {
    const { result } = renderHook(() => useReports());
    expect(result.current.error).toBeNull();
  });
});

describe('submitReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error if user is not authenticated', async () => {
    await expect(submitReport({}, [], null)).rejects.toThrow('Authentication required');
  });

  it('throws error if rate limit exceeded', async () => {
    const { checkLimit } = await import('../utils/rateLimiter');
    checkLimit.mockReturnValueOnce({ allowed: false, resetTime: Date.now() + 300000 });

    await expect(submitReport({}, [], { uid: 'test-uid' })).rejects.toThrow('Rate limit exceeded');
  });
});

describe('upvoteReport', () => {
  it('throws error if userId is not provided', async () => {
    await expect(upvoteReport('report-id', null)).rejects.toThrow('Authentication required');
  });
});

describe('removeUpvote', () => {
  it('throws error if userId is not provided', async () => {
    await expect(removeUpvote('report-id', null)).rejects.toThrow('Authentication required');
  });
});

describe('verifyReport', () => {
  it('throws error if adminId is missing', async () => {
    await expect(verifyReport('report-id', null, 'admin_role')).rejects.toThrow(
      'Admin privileges required'
    );
  });

  it('throws error if adminRole is missing', async () => {
    await expect(verifyReport('report-id', 'admin-id', '')).rejects.toThrow(
      'Admin privileges required'
    );
  });
});

describe('rejectReport', () => {
  it('throws error if adminId is missing', async () => {
    await expect(rejectReport('report-id', null, 'admin_role')).rejects.toThrow(
      'Admin privileges required'
    );
  });
});

describe('resolveReport', () => {
  it('throws error if adminId is missing', async () => {
    await expect(resolveReport('report-id', null, [], 'action')).rejects.toThrow(
      'Admin privileges required'
    );
  });
});

describe('deleteReport', () => {
  it('throws error if adminRole is not admin', async () => {
    await expect(deleteReport('report-id', 'citizen')).rejects.toThrow('Admin privileges required');
  });
});

describe('getReportSubmissionRateLimit', () => {
  it('returns rate limit status', () => {
    const result = getReportSubmissionRateLimit();
    expect(result).toEqual({ allowed: true, resetTime: null });
  });
});
