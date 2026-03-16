import { useEffect, useState } from 'react';
import { MobileViewTabs } from '../../components/MobileViewTabs.jsx';
import { currency, formatDate } from '../../utils/calculations.js';

const ledgerForm = {
  customerId: '',
  type: 'debit',
  amount: '',
  transactionDate: '',
  description: ''
};

export function LedgerPage({ customers, ledgerEntries, onCreateLedgerEntry, mobileIntent, mobileIntentNonce }) {
  const [form, setForm] = useState(ledgerForm);
  const [mobileTab, setMobileTab] = useState('history');

  useEffect(() => {
    if (mobileIntent === 'entry') {
      setMobileTab('entry');
    }
  }, [mobileIntent, mobileIntentNonce]);

  function handleSubmit(event) {
    event.preventDefault();
    onCreateLedgerEntry(form);
    setForm(ledgerForm);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <MobileViewTabs
        tabs={[
          { id: 'history', label: 'Ledger History' },
          { id: 'entry', label: 'New Entry' }
        ]}
        activeTab={mobileTab}
        onChange={setMobileTab}
      />

      <form className={`glass-card rounded-[32px] border border-white/60 p-5 sm:p-6 ${mobileTab !== 'entry' ? 'hidden xl:block' : ''}`} onSubmit={handleSubmit}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Khata book</p>
        <h3 className="mb-5 text-2xl font-semibold text-slate-900">Add ledger entry</h3>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Customer
            <select
              value={form.customerId}
              onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">General entry</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Entry type
            <select
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Amount
            <input
              required
              type="number"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Transaction date
            <input
              required
              type="date"
              value={form.transactionDate}
              onChange={(event) => setForm((current) => ({ ...current, transactionDate: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
          </label>
          <button className="rounded-2xl bg-teal-700 px-5 py-3 font-medium text-white" type="submit">
            Record entry
          </button>
        </div>
      </form>

      <section className={`glass-card rounded-[32px] border border-white/60 p-5 sm:p-6 ${mobileTab !== 'history' ? 'hidden xl:block' : ''}`}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Transactions</p>
        <h3 className="mb-5 text-2xl font-semibold text-slate-900">Ledger history</h3>
        <div className="space-y-3 xl:hidden">
          {ledgerEntries.map((entry) => (
            <div key={entry.id} className="rounded-[24px] border border-slate-100 bg-white/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{entry.description}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(entry.transactionDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Balance</p>
                  <p className="font-semibold text-slate-900">{currency.format(entry.balance || 0)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-rose-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-rose-500">Debit</p>
                  <p className="mt-1 font-semibold text-rose-700">{entry.debit ? currency.format(entry.debit) : '-'}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-500">Credit</p>
                  <p className="mt-1 font-semibold text-emerald-700">{entry.credit ? currency.format(entry.credit) : '-'}</p>
                </div>
              </div>
            </div>
          ))}
          {!ledgerEntries.length ? <p className="rounded-[24px] bg-slate-50 p-4 text-slate-500">No ledger entries recorded.</p> : null}
        </div>

        <div className="hidden overflow-x-auto rounded-[24px] border border-slate-100 xl:block">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[120px_1fr_120px_120px_120px] bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Date</span>
              <span>Description</span>
              <span>Debit</span>
              <span>Credit</span>
              <span>Balance</span>
            </div>
            {ledgerEntries.map((entry) => (
              <div key={entry.id} className="grid grid-cols-[120px_1fr_120px_120px_120px] items-center gap-3 border-t border-slate-100 bg-white px-4 py-3 text-sm">
                <span>{formatDate(entry.transactionDate)}</span>
                <span>{entry.description}</span>
                <span className="text-rose-700">{entry.debit ? currency.format(entry.debit) : '-'}</span>
                <span className="text-emerald-700">{entry.credit ? currency.format(entry.credit) : '-'}</span>
                <span className="font-semibold text-slate-900">{currency.format(entry.balance || 0)}</span>
              </div>
            ))}
          </div>
          {!ledgerEntries.length ? <p className="p-4 text-slate-500">No ledger entries recorded.</p> : null}
        </div>
      </section>
    </div>
  );
}
