export const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
});

const DAY_MS = 1000 * 60 * 60 * 24;

export function addDurationToDate(loanDate, duration, durationUnit = 'months') {
  const dueDate = new Date(loanDate);
  const numericDuration = Number(duration || 0);

  if (durationUnit === 'years') {
    dueDate.setFullYear(dueDate.getFullYear() + numericDuration);
    return dueDate;
  }

  if (durationUnit === 'months') {
    dueDate.setMonth(dueDate.getMonth() + numericDuration);
    return dueDate;
  }

  dueDate.setDate(dueDate.getDate() + numericDuration);
  return dueDate;
}

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function getPeriodsForDuration(duration, durationUnit = 'months', frequency = 'monthly') {
  const value = Number(duration || 0);
  if (frequency === 'daily') {
    if (durationUnit === 'years') return Math.max(1, Math.round(value * 365));
    if (durationUnit === 'months') return Math.max(1, Math.round(value * 30));
    return Math.max(1, value);
  }
  if (durationUnit === 'years') return Math.max(1, value * 12);
  if (durationUnit === 'days') return Math.max(1, Math.ceil(value / 30));
  return Math.max(1, value);
}

function getRatePerPeriod(rate, interestType) {
  const annualRate = Number(rate || 0) / 100;
  if (interestType === 'daily') return annualRate / 365;
  if (interestType === 'monthly' || interestType === 'compound') return annualRate / 12;
  return annualRate;
}

function buildEmiSchedule({ principal, totalInterest, periods, frequency, loanDate, paidAmount }) {
  const schedule = [];
  const installmentPrincipal = periods ? principal / periods : principal;
  const installmentInterest = periods ? totalInterest / periods : totalInterest;
  let runningBalance = principal + totalInterest;
  let paidLeft = paidAmount;

  for (let index = 0; index < periods; index += 1) {
    const dueDate = new Date(loanDate);
    if (frequency === 'daily') {
      dueDate.setDate(dueDate.getDate() + index + 1);
    } else {
      dueDate.setMonth(dueDate.getMonth() + index + 1);
    }

    const installmentAmount = installmentPrincipal + installmentInterest;
    const installmentPaid = Math.min(paidLeft, installmentAmount);
    paidLeft = Math.max(paidLeft - installmentAmount, 0);
    runningBalance = Math.max(runningBalance - installmentPaid, 0);

    schedule.push({
      installmentNumber: index + 1,
      dueDate: dueDate.toISOString(),
      principalComponent: Number(installmentPrincipal.toFixed(2)),
      interestComponent: Number(installmentInterest.toFixed(2)),
      installmentAmount: Number(installmentAmount.toFixed(2)),
      paidAmount: Number(installmentPaid.toFixed(2)),
      balanceAfterInstallment: Number(runningBalance.toFixed(2)),
      status: installmentPaid >= installmentAmount ? 'paid' : dueDate < new Date() ? 'due' : 'upcoming'
    });
  }

  return schedule;
}

export function calculateLoan(loan, payments = []) {
  const principal = Number(loan.loanAmount || 0);
  const rate = Number(loan.interestRate || 0);
  const duration = Number(loan.duration || 0);
  const durationUnit = loan.durationUnit || 'months';
  const paidAmount = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const frequency = loan.interestType === 'daily' ? 'daily' : 'monthly';
  const periods = getPeriodsForDuration(duration, durationUnit, frequency);
  const ratePerPeriod = getRatePerPeriod(rate, loan.interestType);

  let interestEarned = 0;

  switch (loan.interestType) {
    case 'compound':
      interestEarned = principal * (Math.pow(1 + ratePerPeriod, periods) - 1);
      break;
    case 'monthly':
    case 'daily':
      interestEarned = principal * ratePerPeriod * periods;
      break;
    case 'simple':
    default:
      interestEarned = principal * (rate / 100) * (periods / 12);
      break;
  }

  const totalPayable = principal + interestEarned;
  const remainingBalance = Math.max(totalPayable - paidAmount, 0);
  const dueDate = addDurationToDate(loan.loanDate, duration, durationUnit);
  const isOverdue = dueDate < new Date() && remainingBalance > 0;

  return {
    principal,
    interestEarned: Number(interestEarned.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
    paidAmount: Number(paidAmount.toFixed(2)),
    remainingBalance: Number(remainingBalance.toFixed(2)),
    dueDate: dueDate.toISOString(),
    emiSchedule: buildEmiSchedule({
      principal,
      totalInterest: interestEarned,
      periods,
      frequency,
      loanDate: loan.loanDate,
      paidAmount
    }),
    isOverdue
  };
}

export function buildAppInsights({ customers, loans, payments, ledgerEntries }) {
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
    .slice(0, 5);

  const reminders = loans
    .flatMap((loan) => {
      const dueDate = new Date(loan.snapshot.dueDate);
      const diffDays = Math.ceil((dueDate - new Date()) / DAY_MS);

      if (loan.snapshot.isOverdue) {
        return [{ type: 'overdue', label: 'Overdue', message: `${loan.customerName} is overdue`, dueDate }];
      }
      if (diffDays >= 0 && diffDays <= 3) {
        return [{ type: 'upcoming', label: 'EMI due', message: `${loan.customerName} payment due in ${diffDays} day(s)`, dueDate }];
      }
      if (loan.snapshot.remainingBalance > 0) {
        return [{ type: 'pending', label: 'Pending', message: `${loan.customerName} still owes ${currency.format(loan.snapshot.remainingBalance)}`, dueDate }];
      }
      return [];
    })
    .slice(0, 8);

  const monthlyProfitSummary = payments.reduce((acc, payment) => {
    const month = payment.paymentDate.slice(0, 7);
    acc[month] = Number(((acc[month] || 0) + Number(payment.amount || 0)).toFixed(2));
    return acc;
  }, {});

  const monthlyLoanDistribution = loans.reduce((acc, loan) => {
    const month = loan.loanDate.slice(0, 7);
    acc[month] = Number(((acc[month] || 0) + Number(loan.loanAmount || 0)).toFixed(2));
    return acc;
  }, {});

  const todaysCollection = payments
    .filter((payment) => payment.paymentDate === new Date().toISOString().slice(0, 10))
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const totalLoanAmount = loans.reduce((sum, loan) => sum + Number(loan.loanAmount || 0), 0);

  return {
    reminders,
    dashboard: {
      totalCustomers: customers.length,
      activeLoans: loans.filter((loan) => loan.status !== 'completed' && loan.status !== 'closed').length,
      totalLoanAmount: Number(totalLoanAmount.toFixed(2)),
      pendingLoanAmount: Number(loans.reduce((sum, loan) => sum + loan.snapshot.remainingBalance, 0).toFixed(2)),
      interestEarned: Number(loans.reduce((sum, loan) => sum + loan.snapshot.interestEarned, 0).toFixed(2)),
      todaysCollection: Number(todaysCollection.toFixed(2)),
      recentPayments,
      monthlyLoanDistribution
    },
    reports: {
      totalLoansIssued: Number(totalLoanAmount.toFixed(2)),
      totalInterestEarned: Number(loans.reduce((sum, loan) => sum + loan.snapshot.interestEarned, 0).toFixed(2)),
      pendingPayments: Number(loans.reduce((sum, loan) => sum + loan.snapshot.remainingBalance, 0).toFixed(2)),
      overdueCustomers: loans.filter((loan) => loan.snapshot.isOverdue),
      monthlyProfitSummary,
      activeLoans: loans.filter((loan) => loan.status !== 'completed' && loan.status !== 'closed').length
    }
  };
}
