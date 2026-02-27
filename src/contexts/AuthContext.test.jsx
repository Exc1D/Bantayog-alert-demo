import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { AuthProvider, useAuthContext } from './AuthContext';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { uid: 'test-uid', email: 'test@example.com' },
    userProfile: { displayName: 'Test User', role: 'user' },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInAsGuest: vi.fn(),
    signOut: vi.fn(),
    requestPasswordReset: vi.fn(),
    updateProfilePicture: vi.fn(),
    removeAccount: vi.fn(),
    isAdmin: false,
    isSuperAdmin: false,
  })),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides auth context to children', () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper: AuthProvider });

    expect(result.current.user).toBeTruthy();
  });

  it('provides all auth methods', () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper: AuthProvider });

    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signUp).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
  });
});
