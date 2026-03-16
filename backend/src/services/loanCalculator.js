import { calculateInterestBreakdown } from './interestCalculator.js';

export function calculateLoanSnapshot({
  principal,
  interestRate,
  duration,
  durationUnit = 'months',
  interestType,
  loanDate,
  payments = [],
  asOf = new Date(),
}) {
  const breakdown = calculateInterestBreakdown({
    principal,
    interestRate,
    duration,
    durationUnit,
    interestType,
    loanDate,
    payments,
  });

  return {
    principal: Number(principal || 0),
    interestEarned: breakdown.totalInterest,
    totalPayable: breakdown.totalPayable,
    paidAmount: breakdown.paidAmount,
    remainingBalance: breakdown.remainingBalance,
    dueDate: breakdown.dueDate,
    emiSchedule: breakdown.emiSchedule,
    isOverdue: new Date(asOf) > new Date(breakdown.dueDate) && breakdown.remainingBalance > 0,
  };
}
