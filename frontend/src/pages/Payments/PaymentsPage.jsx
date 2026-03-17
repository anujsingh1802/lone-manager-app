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

export function PaymentsPage({ loans, payments, onCreatePayment, onPrintReceipt, mobileIntent, mobileIntentNonce }) {
  const [form, setForm] = useState(paymentForm);
  const [mobileTab, setMobileTab] = useState('history');
  const [printPaymentId, setPrintPaymentId] = useState(null);
  
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
            <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-100 bg-white/70 p-4 transition-colors hover:border-teal-100">
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{payment.customerName}</p>
                <p className="text-sm text-slate-500">{formatDate(payment.paymentDate)} via {payment.paymentMethod}</p>
                <p className="mt-1 text-sm text-slate-600">Note: {payment.note || 'No note'}</p>
                <p className="mt-1 text-sm text-slate-600">Remaining balance: {currency.format(payment.remainingBalance)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-emerald-700">{currency.format(payment.amount)}</p>
                <button
                  onClick={() => {
                    setPrintPaymentId(payment.id);
                    if (onPrintReceipt) onPrintReceipt(payment.id);
                    setTimeout(() => window.print(), 150);
                  }}
                  className="mt-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  Download Receipt
                </button>
              </div>
            </div>
          ))}
          {!payments.length ? <p className="text-slate-500">No installment payments recorded.</p> : null}
        </div>
      </section>
      {/* Hidden Print Receipt Section */}
      <div className="hidden print-only bg-white text-black p-8 font-sans">
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900">Payment Receipt</h1>
          <p className="text-sm text-slate-500 mt-1">Authorized Acknowledgment</p>
        </div>
        
        {printPaymentId && payments.find(p => p.id === printPaymentId) ? (() => {
          const p = payments.find(p => p.id === printPaymentId);
          const l = loans.find(l => l.id === p.loanId);
          return (
            <div className="space-y-6 text-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wider">Received From</p>
                  <p className="font-bold text-xl mt-1">{p.customerName}</p>
                  {l && <p className="text-sm mt-1">Loan Ref: {l.id.slice(0, 8).toUpperCase()}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 uppercase tracking-wider">Receipt No</p>
                  <p className="font-mono font-bold mt-1 text-slate-900">{p.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm mt-1">Date: {formatDate(p.paymentDate)}</p>
                </div>
              </div>

              <div className="border border-slate-200 mt-8 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="py-3 px-4 text-sm font-semibold uppercase text-slate-600">Description</th>
                      <th className="py-3 px-4 text-sm font-semibold uppercase text-slate-600">Payment Mode</th>
                      <th className="py-3 px-4 text-sm font-semibold uppercase text-slate-600 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-200">
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-900">Installment Collection</p>
                        <p className="text-sm text-slate-500 mt-1">{p.note || 'No additional note'}</p>
                      </td>
                      <td className="py-4 px-4 capitalize text-slate-900">{p.paymentMethod}</td>
                      <td className="py-4 px-4 text-right font-bold text-lg text-slate-900">{currency.format(p.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Amount Paid</span>
                    <span className="font-bold text-slate-900">{currency.format(p.amount)}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-slate-50 rounded-b-lg">
                    <span className="text-slate-600 font-semibold px-2">Balance Remaining</span>
                    <span className="font-bold text-slate-900 px-2">{currency.format(p.remainingBalance)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-slate-200 text-center text-sm text-slate-500 space-y-1">
                <p>This is a computer-generated receipt.</p>
                <p>Keep this document for your records.</p>
              </div>
            </div>
          );
        })() : <p className="text-center text-slate-500">Loading receipt details...</p>}
      </div>
    </div>
  );
}
