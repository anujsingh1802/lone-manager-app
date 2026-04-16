import { AppLogo } from './AppLogo.jsx';

export function TopBar({ owner, connectionLabel, setMobileOpen, onLogout }) {
  return (
    <div className="flex flex-col gap-3 lg:gap-4 mb-3 lg:mb-4">
      {/* Premium Prototype Banner */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-800 to-teal-900 px-4 py-2.5 sm:py-3 shadow-lg transform transition-all">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
        <div className="relative flex items-center justify-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
          <p className="text-center text-xs sm:text-sm font-semibold tracking-wide text-teal-50 uppercase shadow-black drop-shadow-md">
            Prototype demonstration made for client 
            <span className="hidden sm:inline"> — Evaluation Copy</span>
          </p>
        </div>
      </div>

      <div className="glass-card flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-2 sm:gap-3 rounded-2xl sm:rounded-[24px] border border-white/60 p-2.5 sm:p-4 md:rounded-[28px] md:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white/70 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 lg:hidden hover:bg-white transition"
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
            <h2 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{owner?.name || 'Evaluation User'}</h2>
          </div>
        </div>

        <div className="flex w-full sm:w-auto flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="rounded-full border border-emerald-200/50 bg-gradient-to-b from-emerald-50 to-teal-100/50 px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold text-teal-800 shadow-sm backdrop-blur-md">
            {connectionLabel || 'Connected to MongoDB'}
          </span>
          {/* Logout button removed for prototype */}
        </div>
      </div>
    </div>
  );
}
