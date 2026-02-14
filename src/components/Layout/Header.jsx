import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReportsContext } from '../../contexts/ReportsContext';

export default function Header() {
  const { user, userProfile, isAdmin, isSuperAdmin } = useAuthContext();
  const { reports } = useReportsContext();

  const activeCount = useMemo(
    () => reports.filter(
      r => r.verification?.status === 'pending' || r.verification?.status === 'verified'
    ).length,
    [reports]
  );

  const getRoleBadge = () => {
    if (isSuperAdmin) return 'PDRRMO';
    if (isAdmin) return 'DRRMO';
    if (user) return 'CITIZEN';
    return 'GUEST';
  };

  const getRoleBadgeColor = () => {
    if (isSuperAdmin) return 'bg-purple-500/90';
    if (isAdmin) return 'bg-blue-500/90';
    return 'bg-white/15';
  };

  return (
    <header className="sticky top-0 z-50 h-[56px] bg-primary text-white flex items-center justify-between px-4 shadow-dark">
      {/* Left: Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-accent/20 border border-accent/30 rounded-lg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="leading-none">
          <h1 className="text-[15px] font-extrabold tracking-wide text-white">
            BANTAYOG
          </h1>
          <p className="text-[9px] font-medium text-white/40 tracking-widest uppercase">
            Camarines Norte
          </p>
        </div>
      </div>

      {/* Right: Status + Role */}
      <div className="flex items-center gap-2">
        {/* Live Indicator */}
        {activeCount > 0 && (
          <div className="flex items-center gap-1.5 bg-white/[0.08] border border-white/10 rounded-full px-2.5 py-1">
            <span className="w-2 h-2 bg-accent rounded-full live-beacon" />
            <span className="text-[10px] font-bold text-white/70 tracking-wide">
              {activeCount} ACTIVE
            </span>
          </div>
        )}

        <span className={`${getRoleBadgeColor()} text-white text-[10px] font-bold px-2 py-1 rounded tracking-wide`}>
          {getRoleBadge()}
        </span>

        {user && !user.isAnonymous && (
          <div className="w-7 h-7 bg-white/10 border border-white/15 rounded-full flex items-center justify-center text-xs font-bold text-white/80">
            {(userProfile?.name || user.displayName || 'U')[0].toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
