import { useMemo, memo, useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReportsContext } from '../../contexts/ReportsContext';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = memo(function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
});

const RoleBadge = memo(function RoleBadge({ role, color }) {
  return (
    <span className={`${color} text-white text-[10px] font-bold px-2 py-1 rounded tracking-wide`}>
      {role}
    </span>
  );
});

const ActiveIndicator = memo(function ActiveIndicator({ count }) {
  if (count <= 0) return null;
  return (
    <div className="flex items-center gap-1.5 bg-white/[0.08] border border-white/10 rounded-full px-2.5 py-1">
      <span className="w-2 h-2 bg-accent rounded-full live-beacon" aria-hidden="true" />
      <span className="text-[10px] font-bold text-white/70 tracking-wide" aria-live="polite">
        {count} ACTIVE
      </span>
    </div>
  );
});

const Avatar = memo(function Avatar({ url, initial, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
      aria-label="Open profile"
    >
      {url ? (
        <img src={url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <span className="text-xs font-bold text-white/90">{initial}</span>
      )}
    </button>
  );
});

export default memo(function Header({ onProfileClick }) {
  const { user, userProfile, isAdmin, isSuperAdmin } = useAuthContext();
  const { reports } = useReportsContext();
  const { isDark, toggleTheme } = useTheme();

  const activeCount = useMemo(
    () =>
      reports.filter(
        (r) => r.verification?.status === 'pending' || r.verification?.status === 'verified'
      ).length,
    [reports]
  );

  const role = useMemo(() => {
    if (isSuperAdmin) return { badge: 'CNPIO', color: 'bg-green-500/90' };
    if (isAdmin) return { badge: 'MUNICIPAL ADMIN', color: 'bg-blue-500/90' };
    if (user) return { badge: 'CITIZEN', color: 'bg-white/15' };
    return { badge: 'GUEST', color: 'bg-white/15' };
  }, [isSuperAdmin, isAdmin, user]);

  const avatarUrl = userProfile?.photoURL || user?.photoURL;
  const avatarInitial = useMemo(
    () =>
      (userProfile?.displayName || userProfile?.name || user?.displayName || 'U')[0].toUpperCase(),
    [userProfile?.displayName, userProfile?.name, user?.displayName]
  );

  const handleProfileClick = useCallback(() => {
    onProfileClick?.();
  }, [onProfileClick]);

  return (
    <header className="sticky top-0 z-50 h-[56px] bg-primary text-white flex items-center justify-between px-4 shadow-dark">
      {/* Left: Brand */}
      <div className="flex items-center gap-2.5">
        <img src="/logo.svg" alt="Bantayog Alert" className="w-8 h-8 rounded-lg" loading="lazy" />
        <div className="leading-none">
          <h1 className="text-[15px] font-extrabold tracking-wide text-white">BANTAYOG ALERT</h1>
          <p className="text-[9px] font-medium text-white/60 tracking-widest uppercase">
            Camarines Norte
          </p>
        </div>
      </div>

      {/* Right: Status + Role */}
      <div className="flex items-center gap-2">
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        <ActiveIndicator count={activeCount} />
        <RoleBadge role={role.badge} color={role.color} />
        <Avatar url={avatarUrl} initial={avatarInitial} onClick={handleProfileClick} />
      </div>
    </header>
  );
});
