export function AppLogo({ compact = false, showText = true, title = 'Loan Manager' }) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      <img
        src="/icon.svg"
        alt={`${title} logo`}
        className={`${compact ? 'h-10 w-10 rounded-2xl' : 'h-12 w-12 rounded-[20px]'} shadow-lg shadow-teal-900/15`}
      />
      {showText ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{title}</p>
          <p className={`text-slate-900 ${compact ? 'text-sm font-semibold' : 'text-base font-semibold'}`}>Digital lending workspace</p>
        </div>
      ) : null}
    </div>
  );
}
