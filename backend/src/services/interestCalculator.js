const DAY_IN_MS = 1000 * 60 * 60 * 24;

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function addDurationToDate(loanDate, duration, durationUnit = 'months') {
  const dueDate = new Date(loanDate);
  const value = normalizeNumber(duration);

  if (durationUnit === 'years') {
    dueDate.setFullYear(dueDate.getFullYear() + value);
    return dueDate;
  }

  if (durationUnit === 'months') {
    dueDate.setMonth(dueDate.getMonth() + value);
    return dueDate;
  }

  dueDate.setDate(dueDate.getDate() + value);
  return dueDate;
}

export function getPeriodsForDuration(duration, durationUnit = 'months', frequency = 'monthly') {
  const value = normalizeNumber(duration);

  if (frequency === 'daily') {
    if (durationUnit === 'years') return Math.max(1, Math.round(value * 365));
    if (durationUnit === 'months') return Math.max(1, Math.round(value * 30));
    return Math.max(1, value);
  }

  if (durationUnit === 'years') return Math.max(1, value * 12);
  if (durationUnit === 'days') return Math.max(1, Math.ceil(value / 30));
  return Math.max(1, value);
}

function getPeriodRate(interestRate, frequency, periods) {
  const annualRate = normalizeNumber(interestRate) / 100;

  if (frequency === 'daily') {
    return annualRate / 365;
  }

  if (frequency === 'monthly') {
    return annualRate / 12;
  }

  return periods > 0 ? annualRate / periods : annualRate;
}

function buildPaymentMap(payments = []) {
  return payments.reduce((acc, payment) => {
    const dateKey = new Date(payment.paymentDate || payment.createdAt || Date.now()).toISOString().slice(0, 10);
    acc[dateKey] = Number(((acc[dateKey] || 0) + normalizeNumber(payment.amount)).toFixed(2));
    return acc;
  }, {});
}

function buildSchedule({
  principal,
  periods,
  totalInterest,
  frequency,
  loanDate,
  paymentMap = {},
}) {
  const schedule = [];
  const installmentPrincipal = periods ? principal / periods : principal;
  const installmentInterest = periods ? totalInterest / periods : totalInterest;
  let runningBalance = principal + totalInterest;
  let runningPaid = 0;

  for (let index = 0; index < periods; index += 1) {
    const dueDate = new Date(loanDate);
    if (frequency === 'daily') {
      dueDate.setDate(dueDate.getDate() + index + 1);
    } else {
      dueDate.setMonth(dueDate.getMonth() + index + 1);
    }

    const installmentAmount = installmentPrincipal + installmentInterest;
    const paid = paymentMap[dueDate.toISOString().slice(0, 10)] || 0;
    runningPaid += paid;
    runningBalance = Math.max(principal + totalInterest - runningPaid, 0);

    schedule.push({
      installmentNumber: index + 1,
      dueDate,
      principalComponent: Number(installmentPrincipal.toFixed(2)),
      interestComponent: Number(installmentInterest.toFixed(2)),
      installmentAmount: Number(installmentAmount.toFixed(2)),
      paidAmount: Number(paid.toFixed(2)),
      balanceAfterInstallment: Number(runningBalance.toFixed(2)),
      status: paid >= installmentAmount ? 'paid' : dueDate < new Date() ? 'due' : 'upcoming',
    });
  }

  return schedule;
}

export function calculateInterestBreakdown({
  principal,
  interestRate,
  duration,
  durationUnit = 'months',
  interestType = 'simple',
  loanDate,
  payments = [],
}) {
  const amount = normalizeNumber(principal);
  const periods = getPeriodsForDuration(duration, durationUnit, interestType === 'daily' ? 'daily' : 'monthly');
  const ratePerPeriod = getPeriodRate(interestRate, interestType === 'daily' ? 'daily' : 'monthly', periods);
  const paymentMap = buildPaymentMap(payments);
  let totalInterest = 0;

  switch (interestType) {
    case 'compound':
      totalInterest = amount * (Math.pow(1 + ratePerPeriod, periods) - 1);
      break;
    case 'daily':
      totalInterest = amount * ratePerPeriod * periods;
      break;
    case 'monthly':
      totalInterest = amount * ratePerPeriod * periods;
      break;
    case 'simple':
    default:
      totalInterest = amount * (normalizeNumber(interestRate) / 100) * (periods / 12);
      break;
  }

  const totalPayable = amount + totalInterest;
  const paidAmount = payments.reduce((sum, payment) => sum + normalizeNumber(payment.amount), 0);
  const remainingBalance = Math.max(totalPayable - paidAmount, 0);
  const emiSchedule = buildSchedule({
    principal: amount,
    periods,
    totalInterest,
    frequency: interestType === 'daily' ? 'daily' : 'monthly',
    loanDate,
    paymentMap,
  });

  return {
    totalInterest: Number(totalInterest.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
    paidAmount: Number(paidAmount.toFixed(2)),
    remainingBalance: Number(remainingBalance.toFixed(2)),
    emiSchedule,
    dueDate: addDurationToDate(loanDate, duration, durationUnit),
  };
}
