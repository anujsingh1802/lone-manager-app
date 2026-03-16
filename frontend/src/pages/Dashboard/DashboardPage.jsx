import { BarChartCard } from '../../components/BarChartCard.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { currency, formatDate } from '../../utils/calculations.js';

export function DashboardPage({ dashboard, reminders, recentPayments }) {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-6">
        <StatCard label="Total customers" value={dashboard.totalCustomers} accent="teal" />
        <StatCard label="Active loans" value={dashboard.activeLoans} accent="slate" />
        <StatCard label="Total loan amount" value={dashboard.totalLoanAmount} money accent="amber" />
        <StatCard label="Pending amount" value={dashboard.pendingLoanAmount} money accent="rose" />
        <StatCard label="Interest earned" value={dashboard.interestEarned} money accent="teal" />
        <StatCard label="Today's collection" value={dashboard.todaysCollection} money accent="amber" />
      </section>

      <BarChartCard title="Monthly Loan Distribution" subtitle="Loan trend" data={dashboard.monthlyLoanDistribution} />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-[24px] border border-white/60 p-4 sm:rounded-[32px] sm:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Recent payments</p>
            <h3 className="text-2xl font-semibold text-slate-900">Installment activity</h3>
          </div>
          <div className="space-y-3">
            {recentPayments.length ? recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 sm:px-4">
                <div>
                  <p className="font-medium text-slate-900">{payment.customerName}</p>
                  <p className="text-sm text-slate-500">{formatDate(payment.paymentDate)} via {payment.paymentMethod}</p>
                </div>
                <p className="font-semibold text-emerald-700">{currency.format(payment.amount)}</p>
              </div>
            )) : <p className="text-slate-500">No payments recorded yet.</p>}
          </div>
        </div>

        <div className="glass-card rounded-[24px] border border-white/60 p-4 sm:rounded-[32px] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Reminders</p>
          <h3 className="mb-5 text-2xl font-semibold text-slate-900">Upcoming and overdue</h3>
          <div className="space-y-3">
            {reminders.length ? reminders.map((reminder, index) => (
              <div key={`${reminder.message}-${index}`} className="rounded-2xl border border-slate-100 bg-white/70 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    reminder.type === 'overdue' ? 'bg-rose-100 text-rose-700' : reminder.type === 'upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {reminder.label}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(reminder.dueDate)}</span>
                </div>
                <p className="mt-3 text-sm text-slate-700">{reminder.message}</p>
              </div>
            )) : <p className="text-slate-500">No reminders. Portfolio looks healthy.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
