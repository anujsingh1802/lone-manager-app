import { BarChartCard } from '../../components/BarChartCard.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { currency, formatDate } from '../../utils/calculations.js';

export function DashboardPage({ dashboard, reminders, recentPayments }) {
  return (
    <div className="space-y-4 md:space-y-6">
      <section className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total customers" value={dashboard.totalCustomers} accent="teal" />
        <StatCard label="Active loans" value={dashboard.activeLoans} accent="slate" />
        <StatCard label="Total loan amount" value={dashboard.totalLoanAmount} money accent="amber" />
        <StatCard label="Pending amount" value={dashboard.pendingLoanAmount} money accent="rose" />
        <StatCard label="Interest earned" value={dashboard.interestEarned} money accent="teal" />
        <StatCard label="Today's collection" value={dashboard.todaysCollection} money accent="amber" />
      </section>

      <BarChartCard title="Monthly Loan Distribution" subtitle="Loan trend" data={dashboard.monthlyLoanDistribution} />

      <section className="grid gap-4 md:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-xl sm:rounded-[24px] md:rounded-[28px] lg:rounded-[32px] border border-white/60 p-3 sm:p-4 md:p-5 lg:p-6">
          <div className="mb-3 sm:mb-4 md:mb-5">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] text-teal-700">Recent payments</p>
            <h3 className="text-xl sm:text-2xl md:text-2xl font-semibold text-slate-900">Installment activity</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {recentPayments.length ? recentPayments.map((payment) => (
              <div key={payment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl sm:rounded-2xl bg-slate-50 px-2 sm:px-3 md:px-4 py-2.5 sm:py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base text-slate-900 truncate">{payment.customerName}</p>
                  <p className="text-xs sm:text-sm text-slate-500">{formatDate(payment.paymentDate)} via {payment.paymentMethod}</p>
                </div>
                <p className="font-semibold text-sm sm:text-base text-emerald-700 whitespace-nowrap">{currency.format(payment.amount)}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No payments recorded yet.</p>}
          </div>
        </div>

        <div className="glass-card rounded-xl sm:rounded-[24px] md:rounded-[28px] lg:rounded-[32px] border border-white/60 p-3 sm:p-4 md:p-5 lg:p-6">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] text-teal-700">Reminders</p>
          <h3 className="mb-3 sm:mb-4 md:mb-5 text-xl sm:text-2xl font-semibold text-slate-900">Upcoming and overdue</h3>
          <div className="space-y-2 sm:space-y-3">
            {reminders.length ? reminders.map((reminder, index) => {
              const waText = encodeURIComponent(`Your loan installment of ${currency.format(reminder.remainingBalance)} is due. Please arrange the payment.`);
              const phoneStr = reminder.phone ? reminder.phone.replace(/\D/g, '') : '';
              const waLink = phoneStr ? `https://wa.me/91${phoneStr}?text=${waText}` : null;

              return (
                <div key={`${reminder.message}-${index}`} className="group relative rounded-xl sm:rounded-2xl border border-slate-100 bg-white/70 p-2.5 sm:p-3 md:p-4 transition hover:border-teal-100 hover:shadow-sm">
                  <div className="flex items-start sm:items-center justify-between gap-2 mb-2">
                    <span className={`rounded-full px-2 sm:px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${
                      reminder.type === 'overdue' ? 'bg-rose-100 text-rose-700' : reminder.type === 'upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {reminder.label}
                    </span>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(reminder.dueDate)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 mb-2">{reminder.message}</p>
                  {waLink ? (
                    <a href={waLink} target="_blank" rel="noreferrer" className="hidden sm:inline-block absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-3 rounded-full bg-[#25D366] px-2.5 sm:px-3 py-1 text-xs font-semibold text-white transition hover:scale-105 group-hover:flex items-center gap-1">
                      WhatsApp
                    </a>
                  ) : null}
                  {waLink ? (
                    <div className="mt-2 sm:hidden">
                       <a href={waLink} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center rounded-lg bg-[#25D366] py-1.5 text-xs font-semibold text-white">
                        Send WhatsApp
                       </a>
                    </div>
                  ) : null}
                </div>
              );
            }) : <p className="text-sm text-slate-500">No reminders. Portfolio looks healthy.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
