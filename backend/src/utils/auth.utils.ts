import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { CONFIG } from '../config';

interface AuthTokenPayload {
  userId: string;
  username: string;
}

interface RefreshTokenPayload {
  userId: string;
}

// Generate JWT Token
export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: '24h' });
}

// Generate Refresh Token
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, CONFIG.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// Verify Token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, CONFIG.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Hash Password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare Password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
