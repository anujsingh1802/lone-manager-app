import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Owner } from '../models/Owner.js';
import { getSmsConfiguration, sendOtpSms } from '../services/smsService.js';

function normalizePhone(phone) {
  return String(phone || '').trim();
}

function signToken(owner) {
  return jwt.sign(
    {
      sub: owner._id.toString(),
      name: owner.name,
      phone: owner.phone,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function bootstrapOwner() {
  // Migration: Ensure all existing owners are verified
  await Owner.updateMany({ isVerified: { $exists: false } }, { $set: { isVerified: true } });

  const ownerCount = await Owner.countDocuments();
  if (ownerCount > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(process.env.OWNER_PASSWORD || 'admin123', 10);
  await Owner.create({
    name: process.env.OWNER_NAME || 'Owner',
    phone: process.env.OWNER_PHONE || '9111465347',
    passwordHash,
    isVerified: true,
  });
}

export async function loginOwner(req, res) {
  const { password } = req.body;
  const phone = normalizePhone(req.body.phone);
  const owner = await Owner.findOne({ phone });

  if (!owner) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  if (!owner.isVerified) {
    return res.status(403).json({ message: 'Verify your phone number before logging in.' });
  }

  const isValid = await bcrypt.compare(password, owner.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  return res.json({
    token: signToken(owner),
    owner: {
      id: owner._id,
      name: owner.name,
      phone: owner.phone,
    },
  });
}

export async function registerOwner(req, res) {
  try {
    const { name, password } = req.body;
    const phone = normalizePhone(req.body.phone);

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required.' });
    }

    let owner = await Owner.findOne({ phone });
    
    // If owner exists and is already verified, block registration
    if (owner && owner.isVerified) {
      return res.status(409).json({ message: 'Owner with this phone number already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    if (!owner) {
      owner = await Owner.create({ name, phone, passwordHash, otp, otpExpiry });
    } else {
      // Update unverified owner with new OTP and password
      owner.name = name;
      owner.passwordHash = passwordHash;
      owner.otp = otp;
      owner.otpExpiry = otpExpiry;
      await owner.save();
    }

    const smsConfig = getSmsConfiguration();

    if (smsConfig.configured) {
      try {
        const smsResult = await sendOtpSms(phone, otp);
        return res.status(200).json({
          message: 'OTP sent successfully via SMS.',
          smsConfigured: true,
          delivery: smsResult.status,
          verificationMethod: 'sms'
        });
      } catch (smsError) {
        console.error('[sms] failed to send real otp:', smsError.message);
        // Fallback to console even if configured but failing
      }
    }

    console.warn(`[auth] SMS NOT CONFIGURED OR FAILED. AUTH OTP FOR ${phone}: ${otp}`);
    return res.status(200).json({
      message: 'SMS service not ready. OTP has been logged to the server console for testing.',
      smsConfigured: false,
      verificationMethod: 'console'
    });
  } catch (error) {
    console.error('[auth] registration error:', error.message);
    return res.status(500).json({ message: error.message || 'Failed to initiate registration.' });
  }
}

export async function verifyOTP(req, res) {
  try {
    const phone = normalizePhone(req.body.phone);
    const { otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required.' });
    }

    const owner = await Owner.findOne({ phone });

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found.' });
    }

    if (owner.isVerified) {
      return res.status(400).json({ message: 'Owner is already verified.' });
    }

    if (owner.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP.' });
    }

    if (new Date() > owner.otpExpiry) {
      return res.status(401).json({ message: 'OTP has expired. Please register again.' });
    }

    // OTP is valid
    owner.isVerified = true;
    owner.otp = undefined;
    owner.otpExpiry = undefined;
    await owner.save();

    return res.status(200).json({
      token: signToken(owner),
      owner: {
        id: owner._id,
        name: owner.name,
        phone: owner.phone,
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ message: 'Failed to verify OTP.' });
  }
}

export async function getProfile(req, res) {
  const owner = await Owner.findById(req.user.sub).select('-passwordHash');
  if (!owner) {
    return res.status(404).json({ message: 'Owner not found.' });
  }
  res.json(owner);
}
