import mongoose from 'mongoose';

const uploadedDocumentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    storageProvider: { type: String, default: 'local' },
    publicId: { type: String, default: null },
    documentType: { type: String, default: 'general' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const collateralSchema = new mongoose.Schema(
  {
    itemName: { type: String, default: '', trim: true },
    itemValue: { type: Number, default: 0 },
    description: { type: String, default: '', trim: true },
    image: { type: uploadedDocumentSchema, default: null },
  },
  { _id: false }
);

const signatureSchema = new mongoose.Schema(
  {
    fileName: { type: String, default: '' },
    filePath: { type: String, default: '' },
    mimeType: { type: String, default: 'image/png' },
    signedAt: { type: Date, default: null },
  },
  { _id: false }
);

const reminderSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['upcoming', 'overdue', 'pending'], required: true },
    message: { type: String, required: true },
    dueDate: { type: Date, required: true },
    channel: { type: String, enum: ['whatsapp', 'sms', 'manual'], default: 'manual' },
    sent: { type: Boolean, default: false },
  },
  { _id: true }
);

const loanSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    loanAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    loanDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    durationUnit: { type: String, enum: ['days', 'months', 'years'], default: 'months' },
    interestType: {
      type: String,
      enum: ['simple', 'compound', 'monthly', 'daily'],
      required: true,
    },
    status: { type: String, enum: ['active', 'completed', 'closed', 'overdue'], default: 'active' },
    notes: { type: String, default: '' },
    collateral: { type: collateralSchema, default: () => ({}) },
    documents: [uploadedDocumentSchema],
    signature: { type: signatureSchema, default: () => ({}) },
    reminders: [reminderSchema],
  },
  { timestamps: true }
);

export const Loan = mongoose.model('Loan', loanSchema);
