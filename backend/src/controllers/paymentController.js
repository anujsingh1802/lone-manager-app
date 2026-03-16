import { Loan } from '../models/Loan.js';
import { Payment } from '../models/Payment.js';
import { calculateLoanSnapshot } from '../services/loanCalculator.js';
import { createLedgerRecord } from '../services/ledgerService.js';

export async function listPayments(req, res) {
  const payments = await Payment.find().populate('customer loan').sort({ paymentDate: -1 });
  res.json(payments);
}

export async function createPayment(req, res) {
  const loan = await Loan.findById(req.body.loan).populate('customer');
  if (!loan) {
    return res.status(404).json({ message: 'Loan not found.' });
  }

  const previousPayments = await Payment.find({ loan: loan._id });
  const snapshot = calculateLoanSnapshot({
    principal: loan.loanAmount,
    interestRate: loan.interestRate,
    duration: loan.duration,
    durationUnit: loan.durationUnit,
    interestType: loan.interestType,
    loanDate: loan.loanDate,
    payments: [...previousPayments, { amount: req.body.amount, paymentDate: req.body.paymentDate }],
  });

  const payment = await Payment.create({
    ...req.body,
    customer: loan.customer._id,
    remainingBalance: snapshot.remainingBalance,
  });

  if (snapshot.remainingBalance <= 0 && loan.status !== 'completed') {
    loan.status = 'completed';
    await loan.save();
  } else if (snapshot.isOverdue) {
    loan.status = 'overdue';
    await loan.save();
  } else if (loan.status !== 'active') {
    loan.status = 'active';
    await loan.save();
  }

  await createLedgerRecord({
    customer: loan.customer._id,
    loan: loan._id,
    payment: payment._id,
    transactionDate: payment.paymentDate,
    description: `Loan payment via ${payment.paymentMethod}`,
    credit: payment.amount,
    source: 'loan-payment',
  });

  res.status(201).json(payment);
}
