import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    paymentDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank-transfer', 'card', 'other'],
      default: 'cash',
    },
    remainingBalance: { type: Number, required: true },
    note: { type: String, default: '' },
    referenceNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
