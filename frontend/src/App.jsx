import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { AppLogo } from './components/AppLogo.jsx';
import { FloatingActionButton } from './components/FloatingActionButton.jsx';
import { MobileBottomNav } from './components/MobileBottomNav.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { TopBar } from './components/TopBar.jsx';
import { ReceiptPrintView } from './components/ReceiptPrintView.jsx';
import { usePersistentState } from './hooks/usePersistentState.js';
import { api } from './utils/api.js';
import { buildAppInsights, calculateLoan, currency } from './utils/calculations.js';

const SESSION_KEY = 'loan-manager-session-prototype';
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage.jsx').then((module) => ({ default: module.DashboardPage })));
const CustomersPage = lazy(() => import('./pages/Customers/CustomersPage.jsx').then((module) => ({ default: module.CustomersPage })));
const LoansPage = lazy(() => import('./pages/Loans/LoansPage.jsx').then((module) => ({ default: module.LoansPage })));
const PaymentsPage = lazy(() => import('./pages/Payments/PaymentsPage.jsx').then((module) => ({ default: module.PaymentsPage })));
const LedgerPage = lazy(() => import('./pages/Ledger/LedgerPage.jsx').then((module) => ({ default: module.LedgerPage })));
const ReportsPage = lazy(() => import('./pages/Reports/ReportsPage.jsx').then((module) => ({ default: module.ReportsPage })));
const EMPTY_APP_STATE = {
  customers: [],
  loans: [],
  payments: [],
  ledgerEntries: []
};

function buildCustomerFormData(customer) {
  const formData = new FormData();
  formData.append('name', customer.name);
  formData.append('phoneNumber', customer.phoneNumber);
  formData.append('address', customer.address || '');
  formData.append('aadhaarNumber', customer.aadhaarNumber || '');
  formData.append('panNumber', customer.panNumber || '');
  (customer.documents || []).forEach((document) => {
    if (document.file) {
      formData.append('documents', document.file);
    }
  });
  return formData;
}

function buildLoanFormData(form) {
  const formData = new FormData();
  formData.append('customer', form.customerId);
  formData.append('loanAmount', String(Number(form.loanAmount || 0)));
  formData.append('interestRate', String(Number(form.interestRate || 0)));
  formData.append('loanDate', form.loanDate);
  formData.append('duration', String(Number(form.duration || 0)));
  formData.append('durationUnit', form.durationUnit || 'months');
  formData.append('interestType', form.interestType);
  formData.append('itemName', form.itemName || '');
  formData.append('itemValue', String(Number(form.itemValue || 0)));
  formData.append('description', form.description || '');
  formData.append('signatureData', form.signatureData || '');
  formData.append('notes', form.notes || '');

  if (form.collateralImage) formData.append('collateralImage', form.collateralImage);
  if (form.aadhaarDocument) formData.append('aadhaarDocument', form.aadhaarDocument);
  if (form.panDocument) formData.append('panDocument', form.panDocument);
  if (form.loanAgreementDocument) formData.append('loanAgreementDocument', form.loanAgreementDocument);

  return formData;
}

function normalizeLedgerEntries(entries = []) {
  let balance = 0;

  return [...entries]
    .sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate))
    .map((entry) => {
      const debit = Number(entry.debit ?? (entry.type === 'debit' ? entry.amount : 0) ?? 0);
      const credit = Number(entry.credit ?? (entry.type === 'credit' ? entry.amount : 0) ?? 0);
      balance = Number((entry.balance ?? balance + credit - debit).toFixed(2));
      return {
        ...entry,
        debit,
        credit,
        balance
      };
    })
    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
}

function mapWorkspaceState(customers, loans, payments, ledgerEntries) {
  return {
    customers: customers.map((customer) => ({
      id: customer._id,
      name: customer.name,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      aadhaarNumber: customer.aadhaarNumber,
      panNumber: customer.panNumber,
      documents: (customer.documents || []).map((document) => ({
        id: document._id,
        name: document.name,
        documentType: document.documentType,
        filePath: document.filePath
      })),
      createdAt: customer.createdAt
    })),
    loans: loans.map((loan) => ({
      id: loan._id,
      customerId: loan.customer?._id || loan.customer,
      loanAmount: loan.loanAmount,
      interestRate: loan.interestRate,
      loanDate: loan.loanDate?.slice(0, 10),
      duration: loan.duration,
      durationUnit: loan.durationUnit || 'months',
      interestType: loan.interestType,
      status: loan.status,
      collateral: loan.collateral || {},
      documents: (loan.documents || []).map((document) => ({
        id: document._id,
        documentType: document.documentType,
        name: document.name,
        filePath: document.filePath
      })),
      signature: loan.signature || {},
      notes: loan.notes || ''
    })),
    payments: payments.map((payment) => ({
      id: payment._id,
      loanId: payment.loan?._id || payment.loan,
      customerId: payment.customer?._id || payment.customer,
      paymentDate: payment.paymentDate?.slice(0, 10),
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      remainingBalance: payment.remainingBalance,
      note: payment.note || ''
    })),
    ledgerEntries: normalizeLedgerEntries(
      ledgerEntries.map((entry) => ({
        id: entry._id,
        customerId: entry.customer?._id || '',
        type: entry.type,
        amount: entry.amount,
        debit: entry.debit,
        credit: entry.credit,
        balance: entry.balance,
        transactionDate: entry.transactionDate?.slice(0, 10),
        description: entry.description
      }))
    )
  };
}

export default function App() {
  const [session, setSession] = usePersistentState(SESSION_KEY, { token: 'prototype_token', owner: { name: 'Recruiter Demo', phone: '0000000000', id: 'demo123' } });
  const [localState, setLocalState] = useState(EMPTY_APP_STATE);
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [loginForm, setLoginForm] = useState({ name: '', phone: '', password: '' });
  const [mobileAction, setMobileAction] = useState({ view: '', target: '', nonce: 0 });
  const [printPaymentId, setPrintPaymentId] = useState(null);
  const [connectionState, setConnectionState] = useState({ status: 'checking', label: 'Checking connection' });
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  async function ensureApiReady() {
    const health = await api.healthCheck();
    const dbConnected = health?.database?.status === 'connected';

    if (!dbConnected) {
      throw new Error('MongoDB is not connected. The app is unavailable until the database reconnects.');
    }

    setConnectionState({ status: 'connected', label: 'Live MongoDB connection' });
    return health;
  }

  async function loadWorkspace(token) {
    await ensureApiReady();

    const [owner, customers, loans, payments, ledgerEntries] = await Promise.all([
      api.fetchProfile(token),
      api.fetchCustomers(token),
      api.fetchLoans(token),
      api.fetchPayments(token),
      api.fetchLedger(token)
    ]);

    setSession((current) => current ? { ...current, owner: { name: owner.name, phone: owner.phone, id: owner._id || owner.id } } : current);
    setLocalState(mapWorkspaceState(customers, loans, payments, ledgerEntries));
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setIsBootstrapping(true);

      try {
        await ensureApiReady();
      } catch (error) {
        if (!cancelled) {
          setConnectionState({ status: 'error', label: 'Database unavailable' });
          setNotice('');
          // Prototype bypass: allow app to work offline or retry, don't clear session
        }
        if (!cancelled) {
          setIsBootstrapping(false);
        }
        return;
      }

      if (!session?.token) {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        await loadWorkspace(session.token);
        if (!cancelled) {
          setNotice('');
        }
      } catch (error) {
        if (!cancelled) {
          setNotice('');
          // Prototype bypass: don't wipe data
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  const enrichedCustomers = localState.customers;

  const enrichedLoans = useMemo(
    () =>
      localState.loans.map((loan) => {
        const customer = enrichedCustomers.find((item) => item.id === loan.customerId);
        const payments = localState.payments.filter((payment) => payment.loanId === loan.id);
        return {
          ...loan,
          customerName: customer?.name || 'Unknown customer',
          customerPhoneNumber: customer?.phoneNumber || '',
          payments,
          snapshot: calculateLoan(loan, payments)
        };
      }),
    [enrichedCustomers, localState.loans, localState.payments]
  );

  const enrichedPayments = useMemo(
    () =>
      [...localState.payments]
        .map((payment) => {
          const customer = enrichedCustomers.find((item) => item.id === payment.customerId);
          const loan = enrichedLoans.find((item) => item.id === payment.loanId);
          return {
            ...payment,
            customerName: customer?.name || 'Unknown customer',
            remainingBalance: payment.remainingBalance ?? loan?.snapshot.remainingBalance ?? 0
          };
        })
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)),
    [enrichedCustomers, enrichedLoans, localState.payments]
  );

  const enrichedLedger = useMemo(
    () =>
      normalizeLedgerEntries(
        localState.ledgerEntries.map((entry) => ({
          ...entry,
          customerName: enrichedCustomers.find((customer) => customer.id === entry.customerId)?.name || ''
        }))
      ),
    [enrichedCustomers, localState.ledgerEntries]
  );

  const customerProfiles = useMemo(
    () =>
      enrichedCustomers.reduce((acc, customer) => {
        const loans = enrichedLoans.filter((loan) => loan.customerId === customer.id);
        const payments = enrichedPayments.filter((payment) => payment.customerId === customer.id);
        const ledgerEntries = enrichedLedger.filter((entry) => entry.customerId === customer.id);

        acc[customer.id] = {
          summary: {
            totalLoans: loans.length,
            activeLoans: loans.filter((loan) => loan.status !== 'completed' && loan.status !== 'closed').length,
            totalLoanAmount: Number(loans.reduce((sum, loan) => sum + Number(loan.loanAmount || 0), 0).toFixed(2)),
            totalOutstanding: Number(loans.reduce((sum, loan) => sum + Number(loan.snapshot.remainingBalance || 0), 0).toFixed(2)),
            totalInterest: Number(loans.reduce((sum, loan) => sum + Number(loan.snapshot.interestEarned || 0), 0).toFixed(2)),
            totalPaid: Number(payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0).toFixed(2))
          },
          loans,
          payments,
          ledgerEntries
        };

        return acc;
      }, {}),
    [enrichedCustomers, enrichedLedger, enrichedLoans, enrichedPayments]
  );

  const insights = useMemo(
    () => buildAppInsights({ customers: enrichedCustomers, loans: enrichedLoans, payments: enrichedPayments, ledgerEntries: enrichedLedger }),
    [enrichedCustomers, enrichedLedger, enrichedLoans, enrichedPayments]
  );

  const floatingAction = useMemo(() => {
    switch (activeView) {
      case 'customers':
        return { label: 'Customer', target: 'form' };
      case 'loans':
        return mobileAction.view === 'loans' && mobileAction.target === 'create'
          ? null
          : { label: 'Loan', target: 'create' };
      case 'payments':
        return { label: 'Payment', target: 'record' };
      case 'ledger':
        return { label: 'Entry', target: 'entry' };
      case 'dashboard':
        return { label: 'Loan', target: 'create', view: 'loans' };
      default:
        return null;
    }
  }, [activeView, mobileAction.target, mobileAction.view]);

  const navCounts = useMemo(
    () => ({
      dashboard: Math.max(
        1,
        Number(Boolean(enrichedCustomers.length || enrichedLoans.length || enrichedPayments.length || enrichedLedger.length))
      ),
      customers: enrichedCustomers.length,
      loans: enrichedLoans.length,
      payments: enrichedPayments.length,
      ledger: enrichedLedger.length,
      reports: Object.keys(insights.reports.monthlyProfitSummary || {}).length
    }),
    [enrichedCustomers.length, enrichedLedger.length, enrichedLoans.length, enrichedPayments.length, insights.reports.monthlyProfitSummary]
  );

  async function handleLogin(event) {
    event.preventDefault();

    try {
      await ensureApiReady();
      const response = await api.login(loginForm.phone, loginForm.password);
      setSession({ token: response.token, owner: response.owner });
      setNotice('Logged in with live backend.');
      setIsOtpMode(false);
    } catch (error) {
      setNotice(error.message || 'Login failed. Check phone/password and API connectivity.');
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    try {
      await ensureApiReady();
      const response = await api.register(loginForm.name, loginForm.phone, loginForm.password);
      setIsOtpMode(true);
      setNotice(response.message || 'OTP sent! Please check your phone.');
    } catch (err) {
      setNotice(err.message || 'Registration failed.');
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    try {
      const response = await api.verifyOtp(loginForm.phone, otpInput);
      setLocalState(EMPTY_APP_STATE);
      setSession({ token: response.token, owner: response.owner });
      setNotice('Account verified successfully!');
    } catch (err) {
      setNotice(err.message || 'Invalid OTP. Please try again.');
    }
  }

  function handleLogout() {
    setSession(null);
    setLocalState(EMPTY_APP_STATE);
    setActiveView('dashboard');
    setNotice('');
    setIsOtpMode(false);
    setOtpInput('');
    setLoginForm({ name: '', phone: '', password: '' });
  }

  async function saveCustomer(customer) {
    if (!session?.token) {
      throw new Error('Login required.');
    }

    const payload = {
      ...customer,
      id: customer.id || crypto.randomUUID(),
      createdAt: customer.createdAt || new Date().toISOString(),
      documents: (customer.documents || []).map((document) => ({
        id: document.id || crypto.randomUUID(),
        name: document.name,
        filePath: document.filePath || `/offline/${document.name}`,
        file: document.file
      }))
    };

    const formData = buildCustomerFormData(payload);
    const response = customer.id ? await api.updateCustomer(session.token, customer.id, formData) : await api.createCustomer(session.token, formData);
    payload.id = response._id;
    payload.documents = (response.documents || []).map((document) => ({ id: document._id, name: document.name, filePath: document.filePath }));

    setLocalState((current) => ({
      ...current,
      customers: customer.id ? current.customers.map((item) => (item.id === customer.id ? payload : item)) : [payload, ...current.customers]
    }));
  }

  async function deleteCustomer(customerId) {
    if (!session?.token) {
      throw new Error('Login required.');
    }

    await api.deleteCustomer(session.token, customerId);

    setLocalState((current) => ({
      ...current,
      customers: current.customers.filter((customer) => customer.id !== customerId),
      loans: current.loans.filter((loan) => loan.customerId !== customerId),
      payments: current.payments.filter((payment) => payment.customerId !== customerId),
      ledgerEntries: current.ledgerEntries.filter((entry) => entry.customerId !== customerId)
    }));
  }

  async function createLoan(form) {
    if (!session?.token) {
      throw new Error('Login required.');
    }

    const loan = {
      id: crypto.randomUUID(),
      customerId: form.customerId,
      loanAmount: Number(form.loanAmount),
      interestRate: Number(form.interestRate),
      loanDate: form.loanDate,
      duration: Number(form.duration),
      durationUnit: form.durationUnit,
      interestType: form.interestType,
      status: 'active',
      collateral: {
        itemName: form.itemName,
        itemValue: Number(form.itemValue || 0),
        description: form.description,
        image: form.collateralImage ? { filePath: URL.createObjectURL(form.collateralImage) } : null
      },
      documents: [
        form.aadhaarDocument ? { id: crypto.randomUUID(), documentType: 'aadhaar', name: form.aadhaarDocument.name, filePath: URL.createObjectURL(form.aadhaarDocument) } : null,
        form.panDocument ? { id: crypto.randomUUID(), documentType: 'pan', name: form.panDocument.name, filePath: URL.createObjectURL(form.panDocument) } : null,
        form.loanAgreementDocument ? { id: crypto.randomUUID(), documentType: 'loan-agreement', name: form.loanAgreementDocument.name, filePath: URL.createObjectURL(form.loanAgreementDocument) } : null
      ].filter(Boolean),
      signature: form.signatureData ? { filePath: form.signatureData } : {},
      notes: form.notes
    };

    const response = await api.createLoan(session.token, buildLoanFormData(form));
    loan.id = response._id;
    loan.documents = (response.documents || []).map((document) => ({ id: document._id, documentType: document.documentType, name: document.name, filePath: document.filePath }));
    loan.signature = response.signature || loan.signature;
    loan.collateral = response.collateral || loan.collateral;

    setLocalState((current) => ({
      ...current,
      loans: [loan, ...current.loans],
      ledgerEntries: normalizeLedgerEntries([
        {
          id: crypto.randomUUID(),
          customerId: loan.customerId,
          type: 'debit',
          amount: loan.loanAmount,
          debit: loan.loanAmount,
          credit: 0,
          transactionDate: loan.loanDate,
          description: 'Loan disbursement'
        },
        ...current.ledgerEntries
      ])
    }));
  }

  async function createPayment(form) {
    if (!session?.token) {
      throw new Error('Login required.');
    }

    const selectedLoan = enrichedLoans.find((loan) => loan.id === form.loanId);
    if (!selectedLoan) return;

    const paymentAmount = Number(form.amount);
    const remainingBalance = Math.max(selectedLoan.snapshot.remainingBalance - paymentAmount, 0);
    const payment = {
      id: crypto.randomUUID(),
      loanId: form.loanId,
      customerId: selectedLoan.customerId,
      paymentDate: form.paymentDate,
      amount: paymentAmount,
      paymentMethod: form.paymentMethod,
      remainingBalance,
      note: form.note
    };

    const response = await api.createPayment(session.token, {
      loan: form.loanId,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      note: payment.note
    });
    payment.id = response._id;
    payment.remainingBalance = response.remainingBalance;

    setLocalState((current) => ({
      ...current,
      payments: [payment, ...current.payments],
      ledgerEntries: normalizeLedgerEntries([
        {
          id: crypto.randomUUID(),
          customerId: selectedLoan.customerId,
          type: 'credit',
          amount: payment.amount,
          debit: 0,
          credit: payment.amount,
          transactionDate: payment.paymentDate,
          description: `Installment received via ${payment.paymentMethod}`
        },
        ...current.ledgerEntries
      ]),
      loans: current.loans.map((loan) => (loan.id === selectedLoan.id ? { ...loan, status: remainingBalance <= 0 ? 'completed' : loan.status } : loan))
    }));
  }

  async function createLedgerEntry(form) {
    if (!session?.token) {
      throw new Error('Login required.');
    }

    const baseEntries = normalizeLedgerEntries(localState.ledgerEntries);
    const currentBalance = Number(baseEntries[0]?.balance || 0);
    const debit = form.type === 'debit' ? Number(form.amount) : 0;
    const credit = form.type === 'credit' ? Number(form.amount) : 0;
    const entry = {
      id: crypto.randomUUID(),
      customerId: form.customerId,
      type: form.type,
      amount: Number(form.amount),
      debit,
      credit,
      balance: Number((currentBalance + credit - debit).toFixed(2)),
      transactionDate: form.transactionDate,
      description: form.description
    };

    const response = await api.createLedgerEntry(session.token, {
      customer: form.customerId || null,
      type: entry.type,
      amount: entry.amount,
      transactionDate: entry.transactionDate,
      description: entry.description
    });
    entry.id = response._id;
    entry.balance = response.balance ?? entry.balance;
    entry.debit = response.debit ?? entry.debit;
    entry.credit = response.credit ?? entry.credit;

    setLocalState((current) => ({ ...current, ledgerEntries: normalizeLedgerEntries([entry, ...current.ledgerEntries]) }));
  }

  // Authentication removed for prototype 

  const viewMap = {
    dashboard: <DashboardPage dashboard={insights.dashboard} reminders={insights.reminders} recentPayments={insights.dashboard.recentPayments} />,
    customers: <CustomersPage customers={enrichedCustomers} customerProfiles={customerProfiles} onSaveCustomer={saveCustomer} onDeleteCustomer={deleteCustomer} mobileIntent={mobileAction.view === 'customers' ? mobileAction.target : ''} mobileIntentNonce={mobileAction.nonce} />,
    loans: <LoansPage customers={enrichedCustomers} loans={enrichedLoans} onCreateLoan={createLoan} mobileIntent={mobileAction.view === 'loans' ? mobileAction.target : ''} mobileIntentNonce={mobileAction.nonce} />,
    payments: <PaymentsPage loans={enrichedLoans} payments={enrichedPayments} onCreatePayment={createPayment} onPrintReceipt={setPrintPaymentId} mobileIntent={mobileAction.view === 'payments' ? mobileAction.target : ''} mobileIntentNonce={mobileAction.nonce} />,
    ledger: <LedgerPage customers={enrichedCustomers} ledgerEntries={enrichedLedger} onCreateLedgerEntry={createLedgerEntry} mobileIntent={mobileAction.view === 'ledger' ? mobileAction.target : ''} mobileIntentNonce={mobileAction.nonce} />,
    reports: <ReportsPage reports={insights.reports} />
  };

  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[288px_1fr]">
      <div className="hidden lg:block">
        <Sidebar activeView={activeView} setActiveView={setActiveView} isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} navCounts={navCounts} />
      </div>
      <main className="p-2 pb-16 sm:p-4 lg:p-8 lg:pb-8 md:p-6 md:pb-8">
        <div className="sticky top-2 sm:top-3 z-20 mobile-screen-enter">
          <TopBar owner={session.owner} connectionLabel={connectionState.label} setMobileOpen={setMobileOpen} onLogout={handleLogout} />
        </div>
        {notice ? <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</div> : null}
        {isBootstrapping ? (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
            Syncing workspace with the live database...
          </div>
        ) : null}
        {activeView === 'dashboard' ? (
          <section className="mb-3 sm:mb-4 md:mb-6 glass-card rounded-xl sm:rounded-[24px] md:rounded-[28px] lg:rounded-[32px] border border-white/60 p-3 sm:p-4 md:p-5 lg:p-6 mobile-screen-enter bg-gradient-to-br from-teal-50 to-emerald-50/50">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] text-teal-700">Portfolio pulse</p>
            <div className="mt-2 sm:mt-3 md:mt-4 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold text-slate-900">Pending collections <span className="text-emerald-700">{currency.format(insights.dashboard.pendingLoanAmount)}</span></h2>
                <p className="mt-1 sm:mt-2 max-w-2xl text-xs sm:text-sm text-slate-600">Search customers, issue loans, record payments, and track balances from one mobile-friendly workspace.</p>
              </div>
              <div className="w-full lg:w-auto rounded-xl sm:rounded-2xl border border-teal-100 bg-white/60 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 lg:rounded-3xl lg:px-5 lg:py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-teal-700">Installable PWA</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">Add this app to the home screen for faster access.</p>
              </div>
            </div>
          </section>
        ) : null}
        <Suspense fallback={<div className="glass-card rounded-[24px] border border-white/60 p-6 text-sm text-slate-500">Loading workspace...</div>}>
          <div key={activeView} className="mobile-screen-enter">
            {viewMap[activeView]}
          </div>
        </Suspense>
      </main>
      <FloatingActionButton
        label={floatingAction?.label}
        onClick={() => {
          const targetView = floatingAction?.view || activeView;
          setActiveView(targetView);
          setMobileAction({ view: targetView, target: floatingAction?.target || '', nonce: Date.now() });
        }}
      />
      <MobileBottomNav
        activeView={activeView}
        onChange={(view) => {
          setActiveView(view);
          setMobileAction({ view: '', target: '', nonce: Date.now() });
        }}
      />
      <ReceiptPrintView payment={enrichedPayments.find(p => p.id === printPaymentId)} owner={session.owner} />
    </div>
  );
}
