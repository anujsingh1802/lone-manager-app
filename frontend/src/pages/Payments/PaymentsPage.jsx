import { useEffect, useMemo, useState } from 'react';
import { MobileViewTabs } from '../../components/MobileViewTabs.jsx';
import { currency, formatDate } from '../../utils/calculations.js';

const paymentForm = {
  loanId: '',
  paymentDate: '',
  amount: '',
  paymentMethod: 'cash',
  note: ''
};

export function PaymentsPage({ loans, payments, onCreatePayment, mobileIntent, mobileIntentNonce }) {
  const [form, setForm] = useState(paymentForm);
  const [mobileTab, setMobileTab] = useState('history');
  const selectedLoan = useMemo(() => loans.find((loan) => loan.id === form.loanId), [loans, form.loanId]);
  const projectedBalance = selectedLoan ? Math.max(selectedLoan.snapshot.remainingBalance - Number(form.amount || 0), 0) : 0;

  useEffect(() => {
    if (mobileIntent === 'record') {
      setMobileTab('record');
    }
  }, [mobileIntent, mobileIntentNonce]);

  function handleSubmit(event) {
    event.preventDefault();
    onCreatePayment(form);
    setForm(paymentForm);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <MobileViewTabs
        tabs={[
          { id: 'history', label: 'History' },
          { id: 'record', label: 'Record Payment' }
        ]}
        activeTab={mobileTab}
        onChange={setMobileTab}
      />

      <form className={`glass-card rounded-[32px] border border-white/60 p-5 sm:p-6 ${mobileTab !== 'record' ? 'hidden xl:block' : ''}`} onSubmit={handleSubmit}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Installments</p>
        <h3 className="mb-5 text-2xl font-semibold text-slate-900">Record payment</h3>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Loan account
            <select
              required
              value={form.loanId}
              onChange={(event) => setForm((current) => ({ ...current, loanId: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">Select loan</option>
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.customerName} - {currency.format(loan.snapshot.remainingBalance)} pending
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Payment amount
            <input
              required
              type="number"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Payment method
            <select
              value={form.paymentMethod}
              onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank-transfer">Bank transfer</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Date
            <input
              required
              type="date"
              value={form.paymentDate}
              onChange={(event) => setForm((current) => ({ ...current, paymentDate: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Note
            <textarea
              rows="3"
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
          </label>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Remaining balance after save: <span className="font-semibold text-slate-900">{currency.format(projectedBalance)}</span>
          </div>
          <button className="rounded-2xl bg-teal-700 px-5 py-3 font-medium text-white" type="submit">
            Save installment
          </button>
        </div>
      </form>

      <section className={`glass-card rounded-[32px] border border-white/60 p-5 sm:p-6 ${mobileTab !== 'history' ? 'hidden xl:block' : ''}`}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Payment history</p>
        <h3 className="mb-5 text-2xl font-semibold text-slate-900">All collections</h3>
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-100 bg-white/70 p-4">
              <div>
                <p className="font-semibold text-slate-900">{payment.customerName}</p>
                <p className="text-sm text-slate-500">{formatDate(payment.paymentDate)} via {payment.paymentMethod}</p>
                <p className="mt-1 text-sm text-slate-600">Note: {payment.note || 'No note'}</p>
                <p className="mt-1 text-sm text-slate-600">Remaining balance: {currency.format(payment.remainingBalance)}</p>
              </div>
              <p className="text-lg font-semibold text-emerald-700">{currency.format(payment.amount)}</p>
            </div>
          ))}
          {!payments.length ? <p className="text-slate-500">No installment payments recorded.</p> : null}
        </div>
      </section>
    </div>
  );
}
