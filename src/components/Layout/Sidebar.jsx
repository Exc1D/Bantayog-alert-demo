import { memo } from 'react';

const TABS = [
  {
    id: 'map',
    label: 'Map',
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={active ? 'text-accent' : 'text-textLight'}
      >
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
  {
    id: 'feed',
    label: 'Feed',
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={active ? 'text-accent' : 'text-textLight'}
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id: 'weather',
    label: 'Weather',
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={active ? 'text-accent' : 'text-textLight'}
      >
        <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={active ? 'text-accent' : 'text-textLight'}
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default memo(function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-border/60 h-[calc(100vh-56px)] sticky top-[56px]">
      <nav aria-label="Desktop navigation" className="flex flex-col py-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-all relative ${
                isActive
                  ? 'text-accentDark bg-accent/5'
                  : 'text-textLight hover:text-text hover:bg-stone-50'
              }`}
            >
              {tab.icon(isActive)}
              <span className="tracking-wide">{tab.label}</span>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-border/60">
        <p className="text-[10px] text-textLight/60 text-center">BANTAYOG ALERT v1.0</p>
      </div>
    </aside>
  );
});
