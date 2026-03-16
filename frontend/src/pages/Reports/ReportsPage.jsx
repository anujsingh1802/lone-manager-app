import { currency, formatDate } from '../../utils/calculations.js';

export function ReportsPage({ reports }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="glass-card rounded-[28px] border border-white/60 p-5">
          <p className="text-sm text-slate-500">Total loans issued</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">{currency.format(reports.totalLoansIssued)}</h3>
        </div>
        <div className="glass-card rounded-[28px] border border-white/60 p-5">
          <p className="text-sm text-slate-500">Total interest earned</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">{currency.format(reports.totalInterestEarned)}</h3>
        </div>
        <div className="glass-card rounded-[28px] border border-white/60 p-5">
          <p className="text-sm text-slate-500">Pending payments</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">{currency.format(reports.pendingPayments)}</h3>
        </div>
        <div className="glass-card rounded-[28px] border border-white/60 p-5">
          <p className="text-sm text-slate-500">Overdue customers</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">{reports.overdueCustomers.length}</h3>
        </div>
        <div className="glass-card rounded-[28px] border border-white/60 p-5">
          <p className="text-sm text-slate-500">Monthly profit report</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">
            {currency.format(Object.values(reports.monthlyProfitSummary).reduce((sum, value) => sum + Number(value || 0), 0))}
          </h3>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-[32px] border border-white/60 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Overdue loans</p>
          <h3 className="mb-5 text-2xl font-semibold text-slate-900">Customers needing follow-up</h3>
          <div className="space-y-3">
            {reports.overdueCustomers.map((loan) => (
              <div key={loan.id} className="rounded-[24px] border border-slate-100 bg-white/70 p-4">
                <p className="font-semibold text-slate-900">{loan.customerName}</p>
                <p className="text-sm text-slate-500">Due {formatDate(loan.snapshot.dueDate)}</p>
                <p className="mt-2 text-sm text-rose-700">Outstanding {currency.format(loan.snapshot.remainingBalance)}</p>
              </div>
            ))}
            {!reports.overdueCustomers.length ? <p className="text-slate-500">No overdue accounts currently.</p> : null}
          </div>
        </div>

        <div className="glass-card rounded-[32px] border border-white/60 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Monthly profit</p>
          <h3 className="mb-5 text-2xl font-semibold text-slate-900">Collections trend</h3>
          <div className="space-y-3">
            {Object.entries(reports.monthlyProfitSummary).map(([month, value]) => (
              <div key={month} className="rounded-[24px] border border-slate-100 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{month}</p>
                  <p className="font-semibold text-emerald-700">{currency.format(value)}</p>
                </div>
              </div>
            ))}
            {!Object.keys(reports.monthlyProfitSummary).length ? <p className="text-slate-500">Monthly summary will appear after payments are collected.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
