import { AppLogo } from './AppLogo.jsx';

export function TopBar({ owner, connectionLabel, setMobileOpen, onLogout }) {
  return (
    <div className="glass-card mb-3 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-2 sm:gap-3 rounded-2xl sm:rounded-[24px] border border-white/60 p-2.5 sm:p-4 md:rounded-[28px] md:p-4 lg:mb-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white/70 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 lg:hidden"
          onClick={() => setMobileOpen(true)}
          type="button"
        >
          Menu
        </button>
        <div className="hidden sm:block">
          <AppLogo compact />
        </div>
        <div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-teal-700">Owner workspace</p>
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900">{owner?.name || 'Loan Owner'}</h2>
        </div>
      </div>

      <div className="flex w-full sm:w-auto flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="rounded-full bg-emerald-100 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-emerald-800">
          {connectionLabel || 'Connected to MongoDB'}
        </span>
        <button className="ml-auto sm:ml-0 rounded-full bg-slate-900 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
