import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Owner } from '../models/Owner.js';

function signToken(owner) {
  return jwt.sign(
    {
      sub: owner._id.toString(),
      name: owner.name,
      phone: owner.phone,
    },
    process.env.JWT_SECRET || 'dev-jwt-secret',
    { expiresIn: '7d' }
  );
}

export async function bootstrapOwner() {
  const ownerCount = await Owner.countDocuments();
  if (ownerCount > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(process.env.OWNER_PASSWORD || 'admin123', 10);
  await Owner.create({
    name: process.env.OWNER_NAME || 'Owner',
    phone: process.env.OWNER_PHONE || '9999999999',
    passwordHash,
  });
}

export async function loginOwner(req, res) {
  const { phone, password } = req.body;
  const owner = await Owner.findOne({ phone });

  if (!owner) {
    return res.status(401).json({ message: 'Invalid credentials.' });
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

export async function getProfile(req, res) {
  const owner = await Owner.findById(req.user.sub).select('-passwordHash');
  res.json(owner);
}
