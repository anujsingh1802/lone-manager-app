import { useEffect, useMemo, useState } from 'react';
import { MobileViewTabs } from '../../components/MobileViewTabs.jsx';
import { currency, formatDate } from '../../utils/calculations.js';

const emptyForm = {
  id: '',
  name: '',
  phoneNumber: '',
  address: '',
  aadhaarNumber: '',
  panNumber: '',
  documents: []
};

function buildCustomerActivity(profile) {
  return [
    ...(profile.loans || []).map((loan) => ({
      id: `loan-${loan.id}`,
      date: loan.loanDate,
      title: 'Loan created',
      description: `${currency.format(loan.loanAmount)} issued at ${loan.interestRate}%`,
      amount: loan.loanAmount,
      tone: 'debit'
    })),
    ...(profile.payments || []).map((payment) => ({
      id: `payment-${payment.id}`,
      date: payment.paymentDate,
      title: 'Payment received',
      description: `${payment.paymentMethod} collection`,
      amount: payment.amount,
      tone: 'credit'
    })),
    ...(profile.ledgerEntries || []).map((entry) => ({
      id: `ledger-${entry.id}`,
      date: entry.transactionDate,
      title: 'Ledger activity',
      description: entry.description,
      amount: entry.credit || entry.debit || entry.amount,
      tone: entry.credit > 0 ? 'credit' : 'debit'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function CustomersPage({ customers, customerProfiles, onSaveCustomer, onDeleteCustomer, mobileIntent, mobileIntentNonce }) {
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [mobileTab, setMobileTab] = useState('profiles');

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        [customer.name, customer.phoneNumber].some((value) => value?.toLowerCase().includes(query.toLowerCase()))
      ),
    [customers, query]
  );

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) || filteredCustomers[0] || null;
  const selectedProfile = selectedCustomer ? customerProfiles[selectedCustomer.id] : null;
  const activityFeed = selectedProfile ? buildCustomerActivity(selectedProfile) : [];

  useEffect(() => {
    if (mobileIntent === 'form') {
      setMobileTab('form');
    }
  }, [mobileIntent, mobileIntentNonce]);

  function handleSubmit(event) {
    event.preventDefault();
    onSaveCustomer(form);
    setForm(emptyForm);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <MobileViewTabs
        tabs={[
          { id: 'profiles', label: 'Profiles' },
          { id: 'profile', label: 'Profile View' },
          { id: 'form', label: form.id ? 'Edit' : 'Add Customer' }
        ]}
        activeTab={mobileTab}
        onChange={setMobileTab}
      />

      <form className={`glass-card rounded-[32px] border border-white/60 p-5 sm:p-6 ${mobileTab !== 'form' ? 'hidden xl:block' : ''}`} onSubmit={handleSubmit}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Customer management</p>
        <h3 className="mb-5 text-2xl font-semibold text-slate-900">{form.id ? 'Edit borrower' : 'Add borrower'}</h3>
        <div className="grid gap-4">
          {[
            ['name', 'Name'],
            ['phoneNumber', 'Phone number'],
            ['address', 'Address'],
            ['aadhaarNumber', 'Aadhaar number'],
            ['panNumber', 'PAN number']
          ].map(([key, label]) => (
            <label key={key} className="grid gap-2 text-sm font-medium text-slate-700">
              {label}
              <input
                required={key === 'name' || key === 'phoneNumber'}
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-500"
              />
            </label>
          ))}
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Borrower documents
            <input
              type="file"
              multiple
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  documents: Array.from(event.target.files || []).map((file) => ({
                    id: crypto.randomUUID(),
                    name: file.name,
                    file
                  }))
                }))
              }
              className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3"
            />
          </label>
          <div className="flex gap-3">
            <button className="rounded-2xl bg-teal-700 px-5 py-3 font-medium text-white" type="submit">
              {form.id ? 'Update customer' : 'Create customer'}
            </button>
            {form.id ? (
              <button type="button" onClick={() => setForm(emptyForm)} className="rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-700">
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </form>

      <section className={`space-y-6 ${mobileTab === 'form' ? 'hidden xl:block' : ''}`}>
        <div className={`glass-card rounded-[32px] border border-white/60 p-5 sm:p-6 ${mobileTab !== 'profiles' ? 'hidden xl:block' : ''}`}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Profiles</p>
              <h3 className="text-2xl font-semibold text-slate-900">Borrowers</h3>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or phone"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:w-72"
            />
          </div>
          <div className="space-y-3">
            {filteredCustomers.map((customer) => {
              const profile = customerProfiles[customer.id];
              return (
                <div key={customer.id} className={`rounded-[24px] border p-4 ${selectedCustomer?.id === customer.id ? 'border-teal-300 bg-teal-50/60' : 'border-slate-100 bg-white/70'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <button type="button" className="text-left" onClick={() => setSelectedCustomerId(customer.id)}>
                      <p className="text-lg font-semibold text-slate-900">{customer.name}</p>
                      <p className="text-sm text-slate-500">{customer.phoneNumber}</p>
                      <p className="mt-2 text-sm text-slate-600">{customer.address}</p>
                      <p className="mt-2 text-xs text-slate-400">Added {formatDate(customer.createdAt)}</p>
                    </button>
                    <div className="flex gap-2">
                      <button className="rounded-full border border-slate-200 px-4 py-2 text-sm" onClick={() => setForm(customer)} type="button">
                        Edit
                      </button>
                      <button className="rounded-full bg-rose-600 px-4 py-2 text-sm text-white" onClick={() => onDeleteCustomer(customer.id)} type="button">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p>Aadhaar: {customer.aadhaarNumber || '-'}</p>
                    <p>PAN: {customer.panNumber || '-'}</p>
                    <p>Loans: {profile?.summary.totalLoans || 0}</p>
                    <p>Outstanding: {currency.format(profile?.summary.totalOutstanding || 0)}</p>
                    <p className="sm:col-span-2">Documents: {customer.documents?.map((doc) => doc.name).join(', ') || 'No docs uploaded'}</p>
                  </div>
                </div>
              );
            })}
            {!filteredCustomers.length ? <p className="text-slate-500">No customers match the search.</p> : null}
          </div>
        </div>

        {selectedCustomer && selectedProfile ? (
          <div className={`glass-card rounded-[32px] border border-white/60 p-5 sm:p-6 ${mobileTab !== 'profile' ? 'hidden xl:block' : ''}`}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Customer profile</p>
                <h3 className="text-2xl font-semibold text-slate-900">{selectedCustomer.name}</h3>
                <p className="text-sm text-slate-500">{selectedCustomer.phoneNumber}</p>
              </div>
              <div className="rounded-[24px] bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Balance left <span className="font-semibold text-slate-900">{currency.format(selectedProfile.summary.totalOutstanding)}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Total loans</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{selectedProfile.summary.totalLoans}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Active loans</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{selectedProfile.summary.activeLoans}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Total paid</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-700">{currency.format(selectedProfile.summary.totalPaid)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Interest earned</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{currency.format(selectedProfile.summary.totalInterest)}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <div className="space-y-4">
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="mb-3 font-semibold text-slate-900">Loan history</p>
                  <div className="space-y-3">
                    {selectedProfile.loans.map((loan) => (
                      <div key={loan.id} className="rounded-2xl bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{currency.format(loan.loanAmount)}</p>
                            <p className="text-sm text-slate-500">
                              {loan.interestRate}% {loan.interestType} for {loan.duration} {loan.durationUnit}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${loan.snapshot.isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {loan.snapshot.isOverdue ? 'Overdue' : loan.status}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                          <p>Issued: {formatDate(loan.loanDate)}</p>
                          <p>Paid: {currency.format(loan.snapshot.paidAmount)}</p>
                          <p>Left: {currency.format(loan.snapshot.remainingBalance)}</p>
                        </div>
                      </div>
                    ))}
                    {!selectedProfile.loans.length ? <p className="text-sm text-slate-500">No loan history yet.</p> : null}
                  </div>
                </div>

                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="mb-3 font-semibold text-slate-900">Payment history</p>
                  <div className="space-y-3">
                    {selectedProfile.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{formatDate(payment.paymentDate)}</p>
                          <p className="text-sm text-slate-500">{payment.paymentMethod} • {payment.note || 'No note'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-700">{currency.format(payment.amount)}</p>
                          <p className="text-xs text-slate-400">Left {currency.format(payment.remainingBalance || 0)}</p>
                        </div>
                      </div>
                    ))}
                    {!selectedProfile.payments.length ? <p className="text-sm text-slate-500">No payments recorded yet.</p> : null}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="mb-3 font-semibold text-slate-900">All activity</p>
                  <div className="space-y-3">
                    {activityFeed.map((activity) => (
                      <div key={activity.id} className="rounded-2xl bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{activity.title}</p>
                            <p className="text-sm text-slate-500">{activity.description}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${activity.tone === 'credit' ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {currency.format(activity.amount || 0)}
                            </p>
                            <p className="text-xs text-slate-400">{formatDate(activity.date)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!activityFeed.length ? <p className="text-sm text-slate-500">No activity available.</p> : null}
                  </div>
                </div>

                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="mb-3 font-semibold text-slate-900">Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.documents?.length ? selectedCustomer.documents.map((document) => (
                      <a
                        key={document.id}
                        href={document.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white px-3 py-2 text-sm text-teal-700"
                      >
                        {document.name}
                      </a>
                    )) : <p className="text-sm text-slate-500">No customer documents uploaded.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
