import { AppLogo } from './AppLogo.jsx';

export function TopBar({ owner, offlineMode, pendingSyncCount, setMobileOpen, onLogout }) {
  return (
    <div className="glass-card mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/60 p-3 sm:mb-6 sm:rounded-[28px] sm:p-4">
      <div className="flex items-center gap-3">
        <button
          className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 lg:hidden"
          onClick={() => setMobileOpen(true)}
          type="button"
        >
          Menu
        </button>
        <div className="hidden sm:block">
          <AppLogo compact />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Owner workspace</p>
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{owner?.name || 'Loan Owner'}</h2>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${offlineMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
          {offlineMode ? 'Offline-first mode' : 'Connected to API'}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Pending sync: {pendingSyncCount}
        </span>
        <button className="ml-auto rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white sm:ml-0" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
