import { LedgerEntry } from '../models/LedgerEntry.js';

async function getLastBalance() {
  const lastEntry = await LedgerEntry.findOne().sort({ transactionDate: -1, createdAt: -1 }).lean();
  return Number(lastEntry?.balance || 0);
}

export async function createLedgerRecord({
  customer = null,
  loan = null,
  payment = null,
  transactionDate,
  description,
  debit = 0,
  credit = 0,
  source = 'manual',
}) {
  const openingBalance = await getLastBalance();
  const balance = Number((openingBalance + Number(credit || 0) - Number(debit || 0)).toFixed(2));

  return LedgerEntry.create({
    customer,
    loan,
    payment,
    transactionDate,
    description,
    debit: Number(debit || 0),
    credit: Number(credit || 0),
    amount: Number(credit || debit || 0),
    type: Number(credit || 0) > 0 ? 'credit' : 'debit',
    balance,
    source,
  });
}
