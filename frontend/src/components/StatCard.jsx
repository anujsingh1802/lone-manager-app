import { currency } from '../utils/calculations.js';

export function StatCard({ label, value, money = false, accent = 'teal' }) {
  const accents = {
    teal: 'from-teal-600/15 to-cyan-500/10 text-teal-900',
    amber: 'from-amber-500/15 to-orange-400/10 text-amber-900',
    rose: 'from-rose-500/15 to-pink-400/10 text-rose-900',
    slate: 'from-slate-700/10 to-slate-400/10 text-slate-900'
  };

  return (
    <div className={`rounded-[22px] border border-white/60 bg-gradient-to-br ${accents[accent]} p-3 shadow-sm sm:rounded-[28px] sm:p-5`}>
      <p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
      <h3 className="mt-2 text-lg font-semibold leading-tight sm:mt-3 sm:text-3xl">{money ? currency.format(value || 0) : value}</h3>
    </div>
  );
}
