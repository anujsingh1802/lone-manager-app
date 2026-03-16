import { LedgerEntry } from '../models/LedgerEntry.js';
import { createLedgerRecord } from '../services/ledgerService.js';

export async function listLedgerEntries(req, res) {
  const entries = await LedgerEntry.find().populate('customer loan payment').sort({ transactionDate: -1, createdAt: -1 });
  res.json(entries);
}

export async function createLedgerEntry(req, res) {
  const entry = await createLedgerRecord({
    customer: req.body.customer || null,
    transactionDate: req.body.transactionDate,
    description: req.body.description,
    debit: req.body.type === 'debit' ? req.body.amount : 0,
    credit: req.body.type === 'credit' ? req.body.amount : 0,
    source: 'manual',
  });
  const created = await LedgerEntry.findById(entry._id).populate('customer loan payment');
  res.status(201).json(created);
}
