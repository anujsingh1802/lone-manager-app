export function MobileViewTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="xl:hidden">
      <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`min-h-11 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
