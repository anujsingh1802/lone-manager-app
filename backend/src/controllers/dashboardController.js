import { Customer } from '../models/Customer.js';
import { Loan } from '../models/Loan.js';
import { Payment } from '../models/Payment.js';
import { calculateLoanSnapshot } from '../services/loanCalculator.js';
import { buildLoanReminders } from '../services/reminderService.js';

export async function getDashboardStats(req, res) {
  const [customers, loans, recentPayments] = await Promise.all([
    Customer.countDocuments(),
    Loan.find().lean(),
    Payment.find().populate('customer loan').sort({ paymentDate: -1 }).limit(5).lean(),
  ]);

  const loanIds = loans.map((loan) => loan._id);
  const allPayments = await Payment.find({ loan: { $in: loanIds } }).lean();
  const paymentMap = allPayments.reduce((acc, payment) => {
    const key = payment.loan.toString();
    acc[key] ||= [];
    acc[key].push(payment);
    return acc;
  }, {});

  const snapshots = loans.map((loan) =>
    calculateLoanSnapshot({
      principal: loan.loanAmount,
      interestRate: loan.interestRate,
      duration: loan.duration,
      durationUnit: loan.durationUnit,
      interestType: loan.interestType,
      loanDate: loan.loanDate,
      payments: paymentMap[loan._id.toString()] || [],
    })
  );

  const today = new Date().toISOString().slice(0, 10);
  const todaysCollection = allPayments
    .filter((payment) => new Date(payment.paymentDate).toISOString().slice(0, 10) === today)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const monthlyLoanDistribution = loans.reduce((acc, loan) => {
    const month = new Date(loan.loanDate).toISOString().slice(0, 7);
    acc[month] = Number(((acc[month] || 0) + Number(loan.loanAmount || 0)).toFixed(2));
    return acc;
  }, {});

  const reminders = loans.flatMap((loan) =>
    buildLoanReminders(
      loan,
      calculateLoanSnapshot({
        principal: loan.loanAmount,
        interestRate: loan.interestRate,
        duration: loan.duration,
        durationUnit: loan.durationUnit,
        interestType: loan.interestType,
        loanDate: loan.loanDate,
        payments: paymentMap[loan._id.toString()] || [],
      })
    )
  );

  res.json({
    totalCustomers: customers,
    activeLoans: loans.filter((loan) => ['active', 'overdue'].includes(loan.status)).length,
    totalLoanAmount: Number(loans.reduce((sum, loan) => sum + Number(loan.loanAmount || 0), 0).toFixed(2)),
    pendingLoanAmount: Number(snapshots.reduce((sum, item) => sum + item.remainingBalance, 0).toFixed(2)),
    interestEarned: Number(snapshots.reduce((sum, item) => sum + item.interestEarned, 0).toFixed(2)),
    todaysCollection: Number(todaysCollection.toFixed(2)),
    monthlyLoanDistribution,
    reminders,
    recentPayments,
  });
}
