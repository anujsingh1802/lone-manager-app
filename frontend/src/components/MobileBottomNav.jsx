const navItems = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: (
      <path d="M4 11.5L12 5l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
    )
  },
  {
    id: 'customers',
    label: 'People',
    icon: (
      <>
        <path d="M7.5 12a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
        <path d="M2.5 20a5 5 0 0 1 10 0" />
        <path d="M16.5 12a2.5 2.5 0 1 0 0-5" />
        <path d="M14.5 20a4 4 0 0 1 5-3.87" />
      </>
    )
  },
  {
    id: 'loans',
    label: 'Loans',
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 12h10" />
        <path d="M7 15h5" />
      </>
    )
  },
  {
    id: 'payments',
    label: 'Pay',
    icon: (
      <>
        <path d="M12 3v18" />
        <path d="M16 7.5c0-1.93-1.79-3.5-4-3.5s-4 1.57-4 3.5 1.79 3.5 4 3.5 4 1.57 4 3.5-1.79 3.5-4 3.5-4-1.57-4-3.5" />
      </>
    )
  },
  {
    id: 'ledger',
    label: 'Book',
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </>
    )
  },
  {
    id: 'reports',
    label: 'Stats',
    icon: (
      <>
        <path d="M5 19V9" />
        <path d="M12 19V5" />
        <path d="M19 19v-7" />
      </>
    )
  }
];

export function MobileBottomNav({ activeView, onChange }) {
  return (
    <nav className="fixed inset-x-2 bottom-2 z-40 lg:hidden">
      <div className="rounded-[18px] border border-white/70 bg-white/90 px-1.5 py-1 shadow-[0_8px_20px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="grid grid-cols-6 gap-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            title={item.label}
            className={`group flex min-h-9 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[12px] px-0.5 py-1 text-[8px] font-semibold leading-none transition-all duration-200 active:scale-[0.95] ${
              activeView === item.id
                ? 'bg-slate-900 text-white shadow-[0_4px_12px_rgba(15,23,42,0.2)]'
                : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 transition-transform duration-200 ${activeView === item.id ? 'scale-100' : 'group-hover:-translate-y-0.5'}`}>
              {item.icon}
            </svg>
            <span className="max-w-full truncate text-[7px]">{item.label}</span>
          </button>
        ))}
        </div>
      </div>
    </nav>
  );
}
