const TABS = [
  { id: 'map', label: 'Map', icon: '\u{1F5FA}\uFE0F' },
  { id: 'feed', label: 'Feed', icon: '\u{1F4F0}' },
  { id: 'weather', label: 'Weather', icon: '\u26C5' },
  { id: 'profile', label: 'Profile', icon: '\u{1F464}' }
];

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <nav className="sticky top-[60px] z-40 bg-white border-b border-border shadow-sm">
      <div className="max-w-[1400px] mx-auto flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'text-accent border-b-2 border-accent bg-blue-50/50'
                : 'text-textLight hover:text-text hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
