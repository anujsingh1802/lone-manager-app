import { currency } from '../utils/calculations.js';

export function BarChartCard({ title, subtitle, data }) {
  const entries = Object.entries(data || {});
  const maxValue = Math.max(...entries.map(([, value]) => Number(value || 0)), 1);

  return (
    <div className="glass-card rounded-[24px] border border-white/60 p-4 sm:rounded-[32px] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 sm:text-sm">{subtitle}</p>
      <h3 className="mb-4 text-xl font-semibold text-slate-900 sm:mb-5 sm:text-2xl">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {entries.length ? entries.map(([label, value]) => (
          <div key={label} className="rounded-[20px] bg-white/70 p-3 sm:rounded-[24px] sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500 sm:mb-3 sm:text-sm">
              <span className="truncate">{label}</span>
              <span className="shrink-0">{currency.format(value)}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 sm:h-3">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 sm:h-3"
                style={{ width: `${Math.max(8, (Number(value || 0) / maxValue) * 100)}%` }}
              />
            </div>
          </div>
        )) : <p className="text-slate-500">No chart data available yet.</p>}
      </div>
    </div>
  );
}
