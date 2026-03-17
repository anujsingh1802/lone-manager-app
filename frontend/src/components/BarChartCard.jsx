import { currency } from '../utils/calculations.js';

export function BarChartCard({ title, subtitle, data }) {
  const entries = Object.entries(data || {});
  const maxValue = Math.max(...entries.map(([, value]) => Number(value || 0)), 1);

  return (
    <div className="glass-card rounded-xl sm:rounded-[24px] md:rounded-[28px] lg:rounded-[32px] border border-white/60 p-3 sm:p-4 md:p-5 lg:p-6">
      <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] text-teal-700">{subtitle}</p>
      <h3 className="mb-3 sm:mb-4 md:mb-5 text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">{title}</h3>
      <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.length ? entries.map(([label, value]) => (
          <div key={label} className="rounded-lg sm:rounded-[20px] md:rounded-[24px] bg-white/70 p-2.5 sm:p-3 md:p-4">
            <div className="mb-2 sm:mb-2 md:mb-3 flex items-center justify-between gap-2 text-xs text-slate-500">
              <span className="truncate">{label}</span>
              <span className="shrink-0 text-xs sm:text-sm">{currency.format(value)}</span>
            </div>
            <div className="h-1.5 sm:h-2 md:h-3 rounded-full bg-slate-100">
              <div
                className="h-1.5 sm:h-2 md:h-3 rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500"
                style={{ width: `${Math.max(8, (Number(value || 0) / maxValue) * 100)}%` }}
              />
            </div>
          </div>
        )) : <p className="text-sm text-slate-500">No chart data available yet.</p>}
      </div>
    </div>
  );
}
