import { currency } from '../utils/calculations.js';

export function StatCard({ label, value, money = false, accent = 'teal' }) {
  const accents = {
    teal: 'from-teal-600/15 to-cyan-500/10 text-teal-900',
    amber: 'from-amber-500/15 to-orange-400/10 text-amber-900',
    rose: 'from-rose-500/15 to-pink-400/10 text-rose-900',
    slate: 'from-slate-700/10 to-slate-400/10 text-slate-900'
  };

  return (
    <div className={`rounded-xl sm:rounded-[22px] border border-white/60 bg-gradient-to-br ${accents[accent]} p-2.5 sm:p-4 md:p-5 md:rounded-[28px] shadow-sm`}>
      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-500">{label}</p>
      <h3 className="mt-1.5 sm:mt-2 text-base sm:text-2xl md:text-3xl font-semibold leading-tight">{money ? currency.format(value || 0) : value}</h3>
    </div>
  );
}
