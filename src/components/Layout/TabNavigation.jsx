import { TABS } from '../../config/tabs';

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <nav
      className="sticky top-[56px] z-40 bg-white border-b border-border/60"
      aria-label="Main navigation"
    >
      <div className="max-w-[1400px] mx-auto px-3 lg:px-6 flex" role="tablist">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-semibold transition-all relative ${
                isActive ? 'text-accentDark' : 'text-textLight hover:text-text'
              }`}
            >
              {tab.icon(isActive)}
              <span className="tracking-wide">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
