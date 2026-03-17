import { AppLogo } from './AppLogo.jsx';

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'customers', label: 'Customers' },
  { id: 'loans', label: 'Loans' },
  { id: 'payments', label: 'Payments' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'reports', label: 'Reports' }
];

export function Sidebar({ activeView, setActiveView, isMobileOpen, setMobileOpen, navCounts = {} }) {
  return (
    <aside
      className={`glass-card fixed inset-y-0 left-0 z-30 w-72 overflow-y-auto border-r border-white/60 p-4 sm:p-5 transition-transform duration-300 lg:static lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <AppLogo />
          <h1 className="mt-2 sm:mt-3 text-base sm:text-xl md:text-2xl font-semibold text-slate-900">Khata without the khata book</h1>
        </div>
        <button className="rounded-full border border-slate-200 px-2.5 sm:px-3 py-1 text-xs sm:text-sm lg:hidden" onClick={() => setMobileOpen(false)}>
          Close
        </button>
      </div>

      <nav className="space-y-1 sm:space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id);
              setMobileOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-left text-sm sm:text-base transition ${
              activeView === item.id
                ? 'bg-teal-700 text-white shadow-lg shadow-teal-900/20'
                : 'bg-white/60 text-slate-700 hover:bg-white'
            }`}
          >
            <span className="font-medium">{item.label}</span>
            <span className={`text-xs ${activeView === item.id ? 'text-teal-50' : 'text-slate-400'}`}>
              {String(navCounts[item.id] ?? 0).padStart(2, '0')}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl bg-slate-900 p-4 sm:p-5 text-white">
        <p className="text-xs sm:text-sm font-semibold">Offline support enabled</p>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Data is mirrored in local storage so the app keeps working on low-connectivity routes.
        </p>
      </div>
    </aside>
  );
}
