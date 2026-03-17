import { useEffect, useMemo, useState } from 'react';
import { MobileViewTabs } from '../../components/MobileViewTabs.jsx';
import { SignaturePad } from '../../components/SignaturePad.jsx';
import { currency, formatDate } from '../../utils/calculations.js';

const loanForm = {
  customerId: '',
  loanAmount: '',
  interestRate: '',
  loanDate: '',
  duration: '',
  durationUnit: 'months',
  interestType: 'simple',
  itemName: '',
  itemValue: '',
  description: '',
  collateralImage: null,
  aadhaarDocument: null,
  panDocument: null,
  loanAgreementDocument: null,
  signatureData: '',
  notes: ''
};

const formSections = [
  { id: 'loan', label: 'Loan' },
  { id: 'interest', label: 'Interest' },
  { id: 'collateral', label: 'Collateral' },
  { id: 'documents', label: 'Documents' },
  { id: 'signature', label: 'Signature' }
];

export function LoansPage({ customers, loans, onCreateLoan, mobileIntent, mobileIntentNonce }) {
  const [form, setForm] = useState(loanForm);
  const [filters, setFilters] = useState({ name: '', phone: '', status: 'all' });
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [mobileTab, setMobileTab] = useState('portfolio');
  const [formSection, setFormSection] = useState('loan');

  const filteredLoans = useMemo(
    () =>
      loans.filter((loan) => {
        const nameMatch = loan.customerName.toLowerCase().includes(filters.name.toLowerCase());
        const phoneMatch = (loan.customerPhoneNumber || '').includes(filters.phone);
        const derivedStatus = loan.snapshot.isOverdue ? 'overdue' : loan.status;
        const statusMatch = filters.status === 'all'
          ? true
          : filters.status === 'completed'
            ? ['completed', 'closed'].includes(loan.status)
            : derivedStatus === filters.status;
        return nameMatch && phoneMatch && statusMatch;
      }),
    [loans, filters]
  );

  const selectedLoan = loans.find((loan) => loan.id === selectedLoanId) || filteredLoans[0] || null;
  const currentSectionIndex = formSections.findIndex((section) => section.id === formSection);
  const isLastSection = currentSectionIndex === formSections.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  useEffect(() => {
    if (mobileIntent === 'create') {
      setMobileTab('create');
      setFormSection('loan');
    }
  }, [mobileIntent, mobileIntentNonce]);

  function handleSubmit(event) {
    event.preventDefault();
    onCreateLoan(form);
    setForm(loanForm);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <MobileViewTabs
        tabs={[
          { id: 'portfolio', label: 'Portfolio' },
          { id: 'details', label: 'Loan Details' },
          { id: 'create', label: 'Create Loan' }
        ]}
        activeTab={mobileTab}
        onChange={setMobileTab}
      />

      <form className={`glass-card rounded-[32px] border border-white/60 p-5 sm:p-6 ${mobileTab !== 'create' ? 'hidden xl:block' : ''}`} onSubmit={handleSubmit}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Loan entry</p>
        <h3 className="mb-5 text-2xl font-semibold text-slate-900">Create loan</h3>
        <div className="xl:hidden">
          <MobileViewTabs
            tabs={formSections}
            activeTab={formSection}
            onChange={setFormSection}
          />
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
            <span className="font-medium text-slate-700">Step {currentSectionIndex + 1} of {formSections.length}</span>
            <span className="text-slate-500">{formSections[currentSectionIndex]?.label}</span>
          </div>
        </div>
        <div className="grid gap-4">
          <div className={formSection !== 'loan' ? 'hidden xl:grid xl:gap-4' : 'grid gap-4'}>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Customer
            <select
              required
              value={form.customerId}
              onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Loan amount
            <input
              required
              type="number"
              value={form.loanAmount}
              onChange={(event) => setForm((current) => ({ ...current, loanAmount: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Loan date
            <input
              required
              type="date"
              value={form.loanDate}
              onChange={(event) => setForm((current) => ({ ...current, loanDate: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
          </label>
          </div>

          <div className={formSection !== 'interest' ? 'hidden xl:grid xl:gap-4' : 'grid gap-4'}>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Interest Rate
            <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <input
                required
                type="number"
                value={form.interestRate}
                onChange={(event) => setForm((current) => ({ ...current, interestRate: event.target.value }))}
                className="w-full px-4 py-3 outline-none"
              />
              <span className="px-4 text-slate-500">%</span>
            </div>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Duration input
            <div className="grid grid-cols-[1fr_160px] gap-3">
              <input
                required
                type="number"
                value={form.duration}
                onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              />
              <select
                value={form.durationUnit}
                onChange={(event) => setForm((current) => ({ ...current, durationUnit: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <option value="days">Days</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Interest type
            <select
              value={form.interestType}
              onChange={(event) => setForm((current) => ({ ...current, interestType: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="simple">Simple Interest</option>
              <option value="compound">Compound Interest</option>
              <option value="monthly">Monthly Interest</option>
              <option value="daily">Daily Interest</option>
            </select>
          </label>
          {form.loanAmount && form.interestRate && form.duration ? (() => {
            const principal = Number(form.loanAmount);
            const rate = Number(form.interestRate) / 100;
            const time = Number(form.duration);
            let interest = 0;
            if (form.interestType === 'monthly') interest = principal * rate * time;
            else if (form.interestType === 'yearly' || form.interestType === 'simple') interest = principal * rate * (form.durationUnit === 'months' ? time / 12 : time);
            else interest = principal * rate * time; // fallback simple
            const total = principal + interest;
            const emi = total / (form.durationUnit === 'months' ? time : time * 12);
            return (
              <div className="rounded-2xl bg-teal-50 p-4 mt-2">
                <div className="flex justify-between text-sm text-teal-800 mb-1">
                  <span>Estimated Interest</span>
                  <span className="font-semibold">{currency.format(interest)}</span>
                </div>
                <div className="flex justify-between text-sm text-teal-800 mb-1">
                  <span>Total Payable</span>
                  <span className="font-semibold">{currency.format(total)}</span>
                </div>
                {form.durationUnit === 'months' || form.durationUnit === 'years' ? (
                  <div className="flex justify-between text-sm text-teal-800 font-bold border-t border-teal-200 pt-2 mt-2">
                    <span>Suggested EMI</span>
                    <span>{currency.format(emi)} / mo</span>
                  </div>
                ) : null}
              </div>
            );
          })() : null}
          </div>

          <div className={`${formSection !== 'collateral' ? 'hidden xl:block' : ''} rounded-[24px] border border-slate-200 bg-slate-50/80 p-4`}>
            <p className="text-sm font-semibold text-slate-900">Collateral item</p>
            <div className="mt-3 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Item name
                <input value={form.itemName} onChange={(event) => setForm((current) => ({ ...current, itemName: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Gold chain" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Estimated value
                <input type="number" value={form.itemValue} onChange={(event) => setForm((current) => ({ ...current, itemValue: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Description
                <textarea rows="3" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Image upload
                <input type="file" accept="image/*" onChange={(event) => setForm((current) => ({ ...current, collateralImage: event.target.files?.[0] || null }))} className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3" />
              </label>
            </div>
          </div>
          <div className={`${formSection !== 'documents' ? 'hidden xl:block' : ''} rounded-[24px] border border-slate-200 bg-slate-50/80 p-4`}>
            <p className="text-sm font-semibold text-slate-900">Document upload</p>
            <div className="mt-3 grid gap-4">
              {[
                ['aadhaarDocument', 'Aadhaar'],
                ['panDocument', 'PAN'],
                ['loanAgreementDocument', 'Loan agreement']
              ].map(([key, label]) => (
                <label key={key} className="grid gap-2 text-sm font-medium text-slate-700">
                  {label}
                  <input type="file" onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.files?.[0] || null }))} className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3" />
                </label>
              ))}
            </div>
          </div>
          <div className={`${formSection !== 'signature' ? 'hidden xl:block' : ''} rounded-[24px] border border-slate-200 bg-slate-50/80 p-4`}>
            <p className="mb-3 text-sm font-semibold text-slate-900">Digital signature</p>
            <SignaturePad value={form.signatureData} onChange={(signatureData) => setForm((current) => ({ ...current, signatureData }))} />
          </div>
          <label className={`${formSection !== 'signature' ? 'hidden xl:grid xl:gap-2' : 'grid gap-2'} text-sm font-medium text-slate-700`}>
            Notes
            <textarea rows="3" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
          </label>
          <div className="xl:hidden">
            <div className="flex gap-3">
              {!isFirstSection ? (
                <button
                  type="button"
                  onClick={() => setFormSection(formSections[currentSectionIndex - 1].id)}
                  className="min-h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700"
                >
                  Previous
                </button>
              ) : null}
              {!isLastSection ? (
                <button
                  type="button"
                  onClick={() => setFormSection(formSections[currentSectionIndex + 1].id)}
                  className="min-h-11 flex-1 rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white"
                >
                  Next
                </button>
              ) : (
                <button className="min-h-11 flex-1 rounded-2xl bg-teal-700 px-5 py-3 font-medium text-white" type="submit">
                  Save loan
                </button>
              )}
            </div>
          </div>
          <button className="hidden rounded-2xl bg-teal-700 px-5 py-3 font-medium text-white xl:block" type="submit">
            Save loan
          </button>
        </div>
      </form>

      <section className={`space-y-6 ${mobileTab === 'create' ? 'hidden xl:block' : ''}`}>
        <div className={`glass-card rounded-[32px] border border-white/60 p-5 sm:p-6 ${mobileTab !== 'portfolio' ? 'hidden xl:block' : ''}`}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Loan book</p>
              <h3 className="text-2xl font-semibold text-slate-900">Portfolio</h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <input placeholder="Search name" value={filters.name} onChange={(event) => setFilters((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
              <input placeholder="Search phone" value={filters.phone} onChange={(event) => setFilters((current) => ({ ...current, phone: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
              <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <option value="all">All loans</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {filteredLoans.map((loan) => (
              <button
                key={loan.id}
                type="button"
                onClick={() => {
                  setSelectedLoanId(loan.id);
                  setMobileTab('details');
                }}
                className={`w-full rounded-[24px] border p-4 text-left ${selectedLoan?.id === loan.id ? 'border-teal-300 bg-teal-50/60' : 'border-slate-100 bg-white/70'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{loan.customerName}</p>
                    <p className="text-sm text-slate-500">{currency.format(loan.loanAmount)} at {loan.interestRate}% {loan.interestType}</p>
                    <p className="mt-1 text-sm text-slate-500">Duration {loan.duration} {loan.durationUnit} | Due {formatDate(loan.snapshot.dueDate)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${loan.snapshot.isOverdue ? 'bg-rose-100 text-rose-700' : loan.status === 'completed' || loan.status === 'closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {loan.snapshot.isOverdue ? 'Overdue' : loan.status}
                  </span>
                </div>
              </button>
            ))}
            {!filteredLoans.length ? <p className="text-slate-500">No loans match the selected filters.</p> : null}
          </div>
        </div>

        {selectedLoan ? (
          <div className={`glass-card rounded-[32px] border border-white/60 p-5 sm:p-6 ${mobileTab !== 'details' ? 'hidden xl:block' : ''}`}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Loan details</p>
                <h3 className="text-2xl font-semibold text-slate-900">{selectedLoan.customerName}</h3>
              </div>
              {selectedLoan.signature?.filePath ? <img src={selectedLoan.signature.filePath} alt="Signature" className="h-16 rounded-xl border border-slate-200 bg-white p-2" /> : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Customer info</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedLoan.customerName}</p>
                <p className="text-sm text-slate-500">{selectedLoan.customerPhoneNumber || '-'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Loan amount</p>
                <p className="mt-1 font-semibold text-slate-900">{currency.format(selectedLoan.loanAmount)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Interest rate</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedLoan.interestRate}% {selectedLoan.interestType}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Duration</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedLoan.duration} {selectedLoan.durationUnit}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Collateral</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedLoan.collateral?.itemName || 'Not added'}</p>
                <p className="text-sm text-slate-500">{selectedLoan.collateral?.description || '-'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Remaining balance</p>
                <p className="mt-1 font-semibold text-slate-900">{currency.format(selectedLoan.snapshot.remainingBalance)}</p>
                <p className="text-sm text-slate-500">Status {selectedLoan.snapshot.isOverdue ? 'Overdue' : selectedLoan.status}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Actions</p>
                  <p className="mt-1 font-semibold text-slate-900">Send Reminder</p>
                </div>
                {(() => {
                  const remaining = selectedLoan.snapshot.remainingBalance;
                  const waText = encodeURIComponent(`Hello ${selectedLoan.customerName}, your loan balance of ${currency.format(remaining)} is pending. Please arrange the payment.`);
                  const phoneStr = selectedLoan.customerPhoneNumber ? selectedLoan.customerPhoneNumber.replace(/\D/g, '') : '';
                  const waLink = phoneStr ? `https://wa.me/91${phoneStr}?text=${waText}` : null;
                  return waLink ? (
                    <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 font-semibold text-white transition hover:scale-105">
                      WhatsApp
                    </a>
                  ) : <span className="text-sm text-slate-400">No Phone</span>;
                })()}
              </div>
            </div>
            {selectedLoan.collateral?.image?.filePath ? <img src={selectedLoan.collateral.image.filePath} alt="Collateral" className="mt-4 h-48 w-full rounded-[24px] object-cover" /> : null}
            {selectedLoan.documents?.length ? (
              <div className="mt-4 rounded-[24px] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Documents</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedLoan.documents.map((document) => (
                    <a key={document.id || document.filePath} href={document.filePath} target="_blank" rel="noreferrer" className="rounded-full bg-white px-3 py-2 text-sm text-teal-700">
                      {document.documentType || document.name}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-4 rounded-[24px] bg-slate-50 p-4">
              <p className="mb-3 font-semibold text-slate-900">Payment history</p>
              <div className="space-y-2">
                {(selectedLoan.payments || []).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                    <span className="text-sm text-slate-600">{formatDate(payment.paymentDate)} via {payment.paymentMethod}</span>
                    <span className="font-semibold text-emerald-700">{currency.format(payment.amount)}</span>
                  </div>
                ))}
                {!(selectedLoan.payments || []).length ? <p className="text-sm text-slate-500">No payments recorded yet.</p> : null}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
