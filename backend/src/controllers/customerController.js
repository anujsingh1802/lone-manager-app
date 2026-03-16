import { Customer } from '../models/Customer.js';
import { LedgerEntry } from '../models/LedgerEntry.js';
import { Loan } from '../models/Loan.js';
import { Payment } from '../models/Payment.js';
import { calculateLoanSnapshot } from '../services/loanCalculator.js';

function mapUploadedDocuments(files = []) {
  return files.map((file) => ({
    name: file.originalname,
    fileName: file.filename,
    filePath: `/uploads/${file.filename}`,
    mimeType: file.mimetype,
  }));
}

export async function listCustomers(req, res) {
  const search = req.query.search?.trim();
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};
  const customers = await Customer.find(query).sort({ createdAt: -1 });
  res.json(customers);
}

export async function createCustomer(req, res) {
  const payload = {
    ...req.body,
    documents: mapUploadedDocuments(req.files),
  };
  const customer = await Customer.create(payload);
  res.status(201).json(customer);
}

export async function getCustomer(req, res) {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }
  return res.json(customer);
}

export async function getCustomerProfile(req, res) {
  const customer = await Customer.findById(req.params.id).lean();
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  const [loans, payments, ledgerEntries] = await Promise.all([
    Loan.find({ customer: customer._id }).sort({ loanDate: -1 }).lean(),
    Payment.find({ customer: customer._id }).sort({ paymentDate: -1 }).lean(),
    LedgerEntry.find({ customer: customer._id }).sort({ transactionDate: -1, createdAt: -1 }).lean(),
  ]);

  const paymentMap = payments.reduce((acc, payment) => {
    const key = payment.loan.toString();
    acc[key] ||= [];
    acc[key].push(payment);
    return acc;
  }, {});

  const loanProfiles = loans.map((loan) => ({
    ...loan,
    snapshot: calculateLoanSnapshot({
      principal: loan.loanAmount,
      interestRate: loan.interestRate,
      duration: loan.duration,
      durationUnit: loan.durationUnit,
      interestType: loan.interestType,
      loanDate: loan.loanDate,
      payments: paymentMap[loan._id.toString()] || [],
    }),
    payments: paymentMap[loan._id.toString()] || [],
  }));

  const totals = loanProfiles.reduce(
    (acc, loan) => {
      acc.totalLoanAmount += Number(loan.loanAmount || 0);
      acc.totalOutstanding += Number(loan.snapshot.remainingBalance || 0);
      acc.totalInterest += Number(loan.snapshot.interestEarned || 0);
      return acc;
    },
    { totalLoanAmount: 0, totalOutstanding: 0, totalInterest: 0 }
  );

  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  res.json({
    customer,
    summary: {
      totalLoans: loanProfiles.length,
      activeLoans: loanProfiles.filter((loan) => loan.status !== 'completed' && loan.status !== 'closed').length,
      totalLoanAmount: Number(totals.totalLoanAmount.toFixed(2)),
      totalOutstanding: Number(totals.totalOutstanding.toFixed(2)),
      totalInterest: Number(totals.totalInterest.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
    },
    loans: loanProfiles,
    payments,
    ledgerEntries,
    activities: [
      ...loanProfiles.map((loan) => ({
        type: 'loan',
        date: loan.loanDate,
        description: `Loan created for ${loan.loanAmount}`,
        amount: loan.loanAmount,
      })),
      ...payments.map((payment) => ({
        type: 'payment',
        date: payment.paymentDate,
        description: `Payment received via ${payment.paymentMethod}`,
        amount: payment.amount,
      })),
      ...ledgerEntries.map((entry) => ({
        type: 'ledger',
        date: entry.transactionDate,
        description: entry.description,
        amount: entry.credit || entry.debit || entry.amount,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)),
  });
}

export async function updateCustomer(req, res) {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  Object.assign(customer, req.body);
  const newDocuments = mapUploadedDocuments(req.files);
  if (newDocuments.length) {
    customer.documents.push(...newDocuments);
  }

  await customer.save();
  return res.json(customer);
}

export async function deleteCustomer(req, res) {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }
  return res.status(204).send();
}
