import { memo } from 'react';
import { TABS, SIDEBAR_WIDTH } from '../../config/tabs';

export default memo(function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside
      className="hidden lg:flex flex-col bg-white border-r border-border/60 h-[calc(100vh-56px)] sticky top-[56px]"
      style={{ width: SIDEBAR_WIDTH }}
    >
      <nav aria-label="Main navigation" className="flex flex-col py-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-pressed={isActive}
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
