import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
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

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    address: { type: String, default: '', trim: true },
    aadhaarNumber: { type: String, default: '', trim: true },
    panNumber: { type: String, default: '', trim: true },
    documents: [documentSchema],
  },
  { timestamps: true }
);

export const Customer = mongoose.model('Customer', customerSchema);
