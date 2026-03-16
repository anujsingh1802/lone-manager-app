import { Customer } from '../models/Customer.js';
import { Loan } from '../models/Loan.js';
import { Payment } from '../models/Payment.js';
import { calculateLoanSnapshot } from '../services/loanCalculator.js';
import { buildLoanReminders, dispatchReminder } from '../services/reminderService.js';

export async function listReminders(req, res) {
  const loans = await Loan.find().populate('customer').lean();
  const payments = await Payment.find({ loan: { $in: loans.map((loan) => loan._id) } }).lean();
  const paymentMap = payments.reduce((acc, payment) => {
    const key = payment.loan.toString();
    acc[key] ||= [];
    acc[key].push(payment);
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
    ).map((reminder) => ({
      ...reminder,
      loanId: loan._id,
      customerName: loan.customer?.name || 'Unknown customer',
      phoneNumber: loan.customer?.phoneNumber || '',
    }))
  );

  res.json(reminders);
}

export async function sendReminder(req, res) {
  const loan = await Loan.findById(req.body.loanId).populate('customer');
  if (!loan) {
    return res.status(404).json({ message: 'Loan not found.' });
  }

  const customer = await Customer.findById(loan.customer._id);
  const payload = await dispatchReminder(req.body, customer);
  res.status(201).json(payload);
}
