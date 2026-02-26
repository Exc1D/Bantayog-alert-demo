import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('../../contexts/ReportsContext', () => ({
  useReportsContext: vi.fn(),
}));

import { useAuthContext } from '../../contexts/AuthContext';
import { useReportsContext } from '../../contexts/ReportsContext';

describe('Header', () => {
  const mockAuthContext = {
    user: null,
    userProfile: null,
    isAdmin: false,
    isSuperAdmin: false,
  };

  const mockReportsContext = {
    reports: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthContext.mockReturnValue(mockAuthContext);
    useReportsContext.mockReturnValue(mockReportsContext);
  });

  it('renders brand name', () => {
    render(<Header />);
    expect(screen.getByText('BANTAYOG ALERT')).toBeInTheDocument();
  });

  it('renders Camarines Norte subtitle', () => {
    render(<Header />);
    expect(screen.getByText('Camarines Norte')).toBeInTheDocument();
  });

  it('shows GUEST badge when not authenticated', () => {
    render(<Header />);
    expect(screen.getByText('GUEST')).toBeInTheDocument();
  });

  it('shows CITIZEN badge when authenticated', () => {
    useAuthContext.mockReturnValue({
      ...mockAuthContext,
      user: { displayName: 'Test User' },
    });

    render(<Header />);
    expect(screen.getByText('CITIZEN')).toBeInTheDocument();
  });

  it('shows MUNICIPAL ADMIN badge for admin user', () => {
    useAuthContext.mockReturnValue({
      ...mockAuthContext,
      user: { displayName: 'Admin User' },
      userProfile: { role: 'admin_daet' },
      isAdmin: true,
    });

    render(<Header />);
    expect(screen.getByText('MUNICIPAL ADMIN')).toBeInTheDocument();
  });

  it('shows CNPIO badge for super admin', () => {
    useAuthContext.mockReturnValue({
      ...mockAuthContext,
      user: { displayName: 'Super Admin' },
      userProfile: { role: 'superadmin_provincial' },
      isSuperAdmin: true,
    });

    render(<Header />);
    expect(screen.getByText('CNPIO')).toBeInTheDocument();
  });

  it('displays active count when there are pending/verified reports', () => {
    useReportsContext.mockReturnValue({
      reports: [
        { id: 1, verification: { status: 'pending' } },
        { id: 2, verification: { status: 'verified' } },
        { id: 3, verification: { status: 'rejected' } },
      ],
    });

    render(<Header />);
    expect(screen.getByText('2 ACTIVE')).toBeInTheDocument();
  });

  it('does not show active count when no active reports', () => {
    useReportsContext.mockReturnValue({
      reports: [{ id: 1, verification: { status: 'rejected' } }],
    });

    render(<Header />);
    expect(screen.queryByText(/ACTIVE/)).not.toBeInTheDocument();
  });

  it('shows avatar with initial when user is authenticated', () => {
    useAuthContext.mockReturnValue({
      ...mockAuthContext,
      user: { displayName: 'John Doe' },
    });

    render(<Header />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('calls onProfileClick when avatar is clicked', () => {
    const onProfileClick = vi.fn();
    useAuthContext.mockReturnValue({
      ...mockAuthContext,
      user: { displayName: 'John' },
    });

    render(<Header onProfileClick={onProfileClick} />);

    const avatarButton = screen.getByRole('button', { name: /open profile/i });
    avatarButton.click();

    expect(onProfileClick).toHaveBeenCalled();
  });

  it('renders logo image', () => {
    render(<Header />);
    const logo = screen.getByAltText('Bantayog Alert');
    expect(logo).toBeInTheDocument();
  });
});
