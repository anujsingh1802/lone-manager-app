import { Customer } from '../models/Customer.js';
import { Loan } from '../models/Loan.js';
import { Payment } from '../models/Payment.js';
import { calculateLoanSnapshot } from '../services/loanCalculator.js';
import { createLedgerRecord } from '../services/ledgerService.js';
import { buildLoanReminders } from '../services/reminderService.js';
import { persistSignature, persistUploadedFile } from '../services/storageService.js';

function getFilesByField(files = [], fieldName) {
  return files.find((file) => file.fieldname === fieldName) || null;
}

function normalizePayload(req) {
  const source = req.body || {};
  return {
    customer: source.customer,
    loanAmount: Number(source.loanAmount),
    interestRate: Number(source.interestRate),
    loanDate: source.loanDate,
    duration: Number(source.duration),
    durationUnit: source.durationUnit || 'months',
    interestType: source.interestType,
    notes: source.notes || '',
    status: source.status || 'active',
    collateral: {
      itemName: source.itemName || source?.collateral?.itemName || '',
      itemValue: Number(source.itemValue || source?.collateral?.itemValue || 0),
      description: source.description || source?.collateral?.description || '',
    },
    signatureData: source.signatureData || '',
  };
}

export async function listLoans(req, res) {
  const { status, overdue, from, to, customerName, phone, query: searchTerm } = req.query;
  const filters = {};

  if (status) {
    if (status === 'completed') {
      filters.status = { $in: ['completed', 'closed'] };
    } else if (status !== 'overdue') {
      filters.status = status;
    }
  }
  if (from || to) {
    filters.loanDate = {};
    if (from) filters.loanDate.$gte = new Date(from);
    if (to) filters.loanDate.$lte = new Date(to);
  }

  const customerQuery = {};
  if (customerName || searchTerm) {
    customerQuery.name = { $regex: customerName || searchTerm, $options: 'i' };
  }
  if (phone) {
    customerQuery.phoneNumber = { $regex: phone, $options: 'i' };
  }
  const customerIds = Object.keys(customerQuery).length
    ? (await Customer.find(customerQuery).select('_id').lean()).map((customer) => customer._id)
    : null;

  if (customerIds) {
    filters.customer = { $in: customerIds };
  }

  const loans = await Loan.find(filters).populate('customer').sort({ loanDate: -1 }).lean();
  const loanIds = loans.map((loan) => loan._id);
  const payments = await Payment.find({ loan: { $in: loanIds } }).lean();
  const paymentMap = payments.reduce((acc, payment) => {
    const key = payment.loan.toString();
    acc[key] ||= [];
    acc[key].push(payment);
    return acc;
  }, {});

  const enriched = loans
    .map((loan) => ({
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
      reminders: buildLoanReminders(
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
      ),
    }))
    .filter((loan) => {
      if (status === 'overdue' || overdue === 'true') {
        return loan.snapshot.isOverdue && loan.snapshot.remainingBalance > 0;
      }
      return true;
    });

  res.json(enriched);
}

export async function createLoan(req, res) {
  const payload = normalizePayload(req);
  const customer = await Customer.findById(payload.customer);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  const collateralImage = await persistUploadedFile(getFilesByField(req.files || [], 'collateralImage'), {
    folder: 'loan-manager/collateral',
    documentType: 'collateral-image',
  });
  const aadhaarDocument = await persistUploadedFile(getFilesByField(req.files || [], 'aadhaarDocument'), {
    folder: 'loan-manager/documents',
    documentType: 'aadhaar',
  });
  const panDocument = await persistUploadedFile(getFilesByField(req.files || [], 'panDocument'), {
    folder: 'loan-manager/documents',
    documentType: 'pan',
  });
  const agreementDocument = await persistUploadedFile(getFilesByField(req.files || [], 'loanAgreementDocument'), {
    folder: 'loan-manager/documents',
    documentType: 'loan-agreement',
  });

  const loan = await Loan.create({
    customer: payload.customer,
    loanAmount: payload.loanAmount,
    interestRate: payload.interestRate,
    loanDate: payload.loanDate,
    duration: payload.duration,
    durationUnit: payload.durationUnit,
    interestType: payload.interestType,
    notes: payload.notes,
    status: payload.status,
    collateral: {
      ...payload.collateral,
      image: collateralImage,
    },
    documents: [aadhaarDocument, panDocument, agreementDocument].filter(Boolean),
    reminders: [],
  });

  if (payload.signatureData) {
    loan.signature = await persistSignature(payload.signatureData, loan._id.toString());
  }

  const snapshot = calculateLoanSnapshot({
    principal: loan.loanAmount,
    interestRate: loan.interestRate,
    duration: loan.duration,
    durationUnit: loan.durationUnit,
    interestType: loan.interestType,
    loanDate: loan.loanDate,
    payments: [],
  });
  loan.reminders = buildLoanReminders(loan, snapshot);
  await loan.save();

  await createLedgerRecord({
    customer: loan.customer,
    loan: loan._id,
    transactionDate: loan.loanDate,
    description: `Loan disbursement for ${customer.name}`,
    debit: loan.loanAmount,
    source: 'loan-disbursement',
  });

  const created = await Loan.findById(loan._id).populate('customer');
  return res.status(201).json(created);
}

export async function getLoan(req, res) {
  const loan = await Loan.findById(req.params.id).populate('customer');
  if (!loan) {
    return res.status(404).json({ message: 'Loan not found.' });
  }
  const payments = await Payment.find({ loan: loan._id }).sort({ paymentDate: -1 });
  return res.json({
    ...loan.toObject(),
    payments,
    snapshot: calculateLoanSnapshot({
      principal: loan.loanAmount,
      interestRate: loan.interestRate,
      duration: loan.duration,
      durationUnit: loan.durationUnit,
      interestType: loan.interestType,
      loanDate: loan.loanDate,
      payments,
    }),
  });
}

export async function updateLoanSignature(req, res) {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    return res.status(404).json({ message: 'Loan not found.' });
  }

  const signature = await persistSignature(req.body.signatureData, loan._id.toString());
  loan.signature = signature || loan.signature;
  await loan.save();

  res.json(loan);
}
