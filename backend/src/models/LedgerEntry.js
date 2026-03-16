import mongoose from 'mongoose';

const ledgerEntrySchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', default: null },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    type: { type: String, enum: ['debit', 'credit'], required: true },
    amount: { type: Number, required: true },
    transactionDate: { type: Date, required: true },
    description: { type: String, default: '' },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    source: { type: String, enum: ['manual', 'loan-disbursement', 'loan-payment'], default: 'manual' },
  },
  { timestamps: true }
);

export const LedgerEntry = mongoose.model('LedgerEntry', ledgerEntrySchema);
