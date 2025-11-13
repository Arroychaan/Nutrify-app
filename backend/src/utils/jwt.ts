import jwt, { SignOptions } from 'jsonwebtoken';
import config from '@config/index.js';
import { IJWTPayload } from '../types/index.js';

export function generateAccessToken(userId: string, email: string): string {
  const payload = { userId, email };
  const options = { expiresIn: config.jwt.expiresIn } as SignOptions;
  return jwt.sign(payload, config.jwt.secret as string, options);
}

export function generateRefreshToken(userId: string, email: string): string {
  const payload = { userId, email };
  const options = { expiresIn: config.jwt.refreshExpiresIn } as SignOptions;
  return jwt.sign(payload, config.jwt.refreshSecret as string, options);
}

export function verifyAccessToken(token: string): IJWTPayload {
  try {
    return jwt.verify(token, config.jwt.secret as string) as IJWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): IJWTPayload {
  try {
    return jwt.verify(token, config.jwt.refreshSecret as string) as IJWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

export function decodeToken(token: string): IJWTPayload | null {
  try {
    return jwt.decode(token) as IJWTPayload;
  } catch {
    return null;
  }
}
