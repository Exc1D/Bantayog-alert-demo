import { useAuthContext } from '../../contexts/AuthContext';

export default function Header() {
  const { user, userProfile, isAdmin, isSuperAdmin } = useAuthContext();

  const getRoleBadge = () => {
    if (isSuperAdmin) return 'PDRRMO';
    if (isAdmin) return 'DRRMO';
    if (user) return 'Citizen';
    return 'Guest';
  };

  const getRoleBadgeColor = () => {
    if (isSuperAdmin) return 'bg-purple-500';
    if (isAdmin) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  return (
    <header className="sticky top-0 z-50 h-[60px] bg-gradient-to-r from-primary to-slate-800 text-white flex items-center justify-between px-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-xl">
          {'\u{1F6E1}\uFE0F'}
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight tracking-tight">
            BANTAYOG ALERT
          </h1>
          <p className="text-[10px] text-white/60 leading-none">
            Camarines Norte Disaster Reporting
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`${getRoleBadgeColor()} text-white text-xs font-bold px-2 py-1 rounded-full`}>
          {getRoleBadge()}
        </span>
        {user && !user.isAnonymous && (
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
            {(userProfile?.name || user.displayName || 'U')[0].toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
