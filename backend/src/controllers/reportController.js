import { Customer } from '../models/Customer.js';
import { Loan } from '../models/Loan.js';
import { Payment } from '../models/Payment.js';
import { calculateLoanSnapshot } from '../services/loanCalculator.js';

export async function getReports(req, res) {
  const loans = await Loan.find().populate('customer').lean();
  const payments = await Payment.find().lean();

  const paymentMap = payments.reduce((acc, payment) => {
    const key = payment.loan.toString();
    acc[key] ||= [];
    acc[key].push(payment);
    return acc;
  }, {});

  const snapshots = loans.map((loan) => ({
    loan,
    snapshot: calculateLoanSnapshot({
      principal: loan.loanAmount,
      interestRate: loan.interestRate,
      duration: loan.duration,
      durationUnit: loan.durationUnit,
      interestType: loan.interestType,
      loanDate: loan.loanDate,
      payments: paymentMap[loan._id.toString()] || [],
    }),
  }));

  const overdueCustomers = snapshots
    .filter(({ snapshot }) => snapshot.isOverdue && snapshot.remainingBalance > 0)
    .map(({ loan, snapshot }) => ({
      customer: loan.customer?.name,
      phoneNumber: loan.customer?.phoneNumber,
      remainingBalance: snapshot.remainingBalance,
      dueDate: snapshot.dueDate,
    }));

  const monthlyProfitSummary = payments.reduce((acc, payment) => {
    const key = new Date(payment.paymentDate).toISOString().slice(0, 7);
    acc[key] = Number(((acc[key] || 0) + payment.amount).toFixed(2));
    return acc;
  }, {});

  res.json({
    totalCustomers: await Customer.countDocuments(),
    totalLoansIssued: Number(loans.reduce((sum, loan) => sum + loan.loanAmount, 0).toFixed(2)),
    totalInterestEarned: Number(snapshots.reduce((sum, item) => sum + item.snapshot.interestEarned, 0).toFixed(2)),
    pendingPayments: Number(snapshots.reduce((sum, item) => sum + item.snapshot.remainingBalance, 0).toFixed(2)),
    overdueCustomers,
    monthlyProfitSummary,
    activeLoans: loans.filter((loan) => ['active', 'overdue'].includes(loan.status)).length,
  });
}
