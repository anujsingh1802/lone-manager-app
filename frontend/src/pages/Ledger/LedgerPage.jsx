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

      <form className={`glass-card rounded-xl sm:rounded-[24px] md:rounded-[28px] lg:rounded-[32px] border border-white/60 p-3 sm:p-4 md:p-5 lg:p-6 ${mobileTab !== 'entry' ? 'hidden xl:block' : ''}`} onSubmit={handleSubmit}>
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] text-teal-700">Khata book</p>
        <h3 className="mb-3 sm:mb-4 md:mb-5 text-lg sm:text-2xl font-semibold text-slate-900">Add ledger entry</h3>
        <div className="grid gap-3 sm:gap-4">
          <label className="grid gap-2 text-xs sm:text-sm font-medium text-slate-700">
            Customer
            <select
              value={form.customerId}
              onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
              className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <option value="">General entry</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs sm:text-sm font-medium text-slate-700">
            Entry type
            <select
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </label>
          <label className="grid gap-2 text-xs sm:text-sm font-medium text-slate-700">
            Amount
            <input
              required
              type="number"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
            />
          </label>
          <label className="grid gap-2 text-xs sm:text-sm font-medium text-slate-700">
            Transaction date
            <input
              required
              type="date"
              value={form.transactionDate}
              onChange={(event) => setForm((current) => ({ ...current, transactionDate: event.target.value }))}
              className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
            />
          </label>
          <label className="grid gap-2 text-xs sm:text-sm font-medium text-slate-700">
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
            />
          </label>
          <button className="rounded-xl sm:rounded-2xl bg-teal-700 px-4 sm:px-5 py-2.5 sm:py-3 font-medium text-white text-xs sm:text-base" type="submit">
            Record entry
          </button>
        </div>
      </form>

      <section className={`glass-card rounded-xl sm:rounded-[24px] md:rounded-[28px] lg:rounded-[32px] border border-white/60 p-3 sm:p-4 md:p-5 lg:p-6 ${mobileTab !== 'history' ? 'hidden xl:block' : ''}`}>
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] text-teal-700">Transactions</p>
        <h3 className="mb-3 sm:mb-4 md:mb-5 text-lg sm:text-2xl font-semibold text-slate-900">Ledger history</h3>
        <div className="space-y-2 sm:space-y-3 xl:hidden">
          {ledgerEntries.map((entry) => (
            <div key={entry.id} className="rounded-lg sm:rounded-[24px] border border-slate-100 bg-white/80 p-2.5 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
                <div className="min-w-[100px] flex-1">
                  <p className="font-semibold text-xs sm:text-sm text-slate-900 break-words line-clamp-2" title={entry.description}>{entry.description}</p>
                  <p className="mt-0.5 sm:mt-1 text-xs text-slate-500">{formatDate(entry.transactionDate)}</p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Balance</p>
                  <p className="font-semibold text-xs sm:text-sm text-slate-900">{currency.format(entry.balance || 0)}</p>
                </div>
              </div>
              <div className="mt-2 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="rounded-lg sm:rounded-2xl bg-rose-50 px-2 sm:px-3 py-1.5 sm:py-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-rose-500">Debit</p>
                  <p className="mt-0.5 sm:mt-1 font-semibold text-rose-700 text-xs sm:text-sm">{entry.debit ? currency.format(entry.debit) : '-'}</p>
                </div>
                <div className="rounded-lg sm:rounded-2xl bg-emerald-50 px-2 sm:px-3 py-1.5 sm:py-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-500">Credit</p>
                  <p className="mt-0.5 sm:mt-1 font-semibold text-emerald-700 text-xs sm:text-sm">{entry.credit ? currency.format(entry.credit) : '-'}</p>
                </div>
              </div>
            </div>
          ))}
          {!ledgerEntries.length ? <p className="rounded-lg sm:rounded-[24px] bg-slate-50 p-2.5 sm:p-4 text-xs sm:text-sm text-slate-500">No ledger entries recorded.</p> : null}
        </div>

        <div className="hidden overflow-x-auto rounded-xl sm:rounded-[24px] md:rounded-[28px] border border-slate-100 xl:block">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[100px_1fr_100px_100px_100px] bg-slate-100 px-3 sm:px-4 py-2 sm:py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              <span>Date</span>
              <span>Description</span>
              <span>Debit</span>
              <span>Credit</span>
              <span>Balance</span>
            </div>
            {ledgerEntries.map((entry) => (
              <div key={entry.id} className="grid grid-cols-[100px_1fr_100px_100px_100px] items-center gap-2 sm:gap-3 border-t border-slate-100 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                <span>{formatDate(entry.transactionDate)}</span>
                <span>{entry.description}</span>
                <span className="text-rose-700">{entry.debit ? currency.format(entry.debit) : '-'}</span>
                <span className="text-emerald-700">{entry.credit ? currency.format(entry.credit) : '-'}</span>
                <span className="font-semibold text-slate-900">{currency.format(entry.balance || 0)}</span>
              </div>
            ))}
          </div>
          {!ledgerEntries.length ? <p className="p-3 sm:p-4 text-xs sm:text-sm text-slate-500">No ledger entries recorded.</p> : null}
        </div>
      </section>
    </div>
  );
}
