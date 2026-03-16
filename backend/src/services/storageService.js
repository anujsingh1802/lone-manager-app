import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const uploadsRoot = path.resolve(process.cwd(), 'uploads');

async function uploadToCloudinary(file, folder = 'loan-manager') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret || !file?.path) {
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${folder}/${path.parse(file.filename || file.originalname || 'asset').name}`;
  const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureBase).digest('hex');
  const buffer = await fs.readFile(file.path);

  const form = new FormData();
  form.append('file', new Blob([buffer]), file.originalname || file.filename || 'upload');
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('public_id', publicId);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  return response.json();
}

export async function persistUploadedFile(file, options = {}) {
  if (!file) return null;

  try {
    const remote = await uploadToCloudinary(file, options.folder);
    if (remote) {
      return {
        name: options.name || file.originalname,
        fileName: file.filename || file.originalname,
        filePath: remote.secure_url,
        mimeType: file.mimetype,
        storageProvider: 'cloudinary',
        publicId: remote.public_id,
        documentType: options.documentType || 'general',
      };
    }
  } catch {
    // Fall back to local storage when Cloudinary credentials or network are unavailable.
  }

  return {
    name: options.name || file.originalname,
    fileName: file.filename || file.originalname,
    filePath: `/uploads/${path.basename(file.path || file.filename || '')}`,
    mimeType: file.mimetype,
    storageProvider: 'local',
    publicId: null,
    documentType: options.documentType || 'general',
  };
}

export async function persistSignature(signatureDataUrl, loanId) {
  if (!signatureDataUrl) return null;
  const [, base64Content] = signatureDataUrl.split(',');
  if (!base64Content) return null;

  await fs.mkdir(uploadsRoot, { recursive: true });
  const fileName = `${Date.now()}-${loanId || 'signature'}.png`;
  const filePath = path.join(uploadsRoot, fileName);
  await fs.writeFile(filePath, Buffer.from(base64Content, 'base64'));

  return {
    fileName,
    filePath: `/uploads/${fileName}`,
    mimeType: 'image/png',
    signedAt: new Date(),
  };
}
