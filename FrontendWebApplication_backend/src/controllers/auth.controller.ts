import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});

// PUBLIC_INTERFACE
export async function register(req: Request, res: Response) {
  /** Register a new user, create verification token (stub), and return message. */
  const body = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return res.status(409).json({ success: false, error: 'Email already in use' });

  const hash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash: hash,
      profile: { create: { name: body.name } }
    }
  });

  // Create email verification token (stub send)
  await prisma.emailVerificationToken.create({
    data: {
      token: `verify_${user.id}_${Date.now()}`,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
  });

  return res.status(201).json({ success: true, message: 'Registered. Please verify your email.' });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// PUBLIC_INTERFACE
export async function login(req: Request, res: Response) {
  /** Validate credentials and return JWT + refresh token (refresh stubbed). */
  const body = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !user.passwordHash) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  if (!user.emailVerified) {
    // You may allow login but limited actions until verified. Here we warn but proceed.
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'dev', { expiresIn: '1h' });
  const refresh = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET || 'dev', { expiresIn: '7d' });
  return res.json({ success: true, data: { token, refresh, user: { id: user.id, email: user.email, role: user.role } } });
}

// PUBLIC_INTERFACE
export async function refresh(req: Request, res: Response) {
  /** Issue a new access token from refresh token (basic). */
  const { refresh: refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ success: false, error: 'refresh required' });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'dev') as any;
    const token = jwt.sign({ sub: payload.sub, role: payload.role }, process.env.JWT_SECRET || 'dev', { expiresIn: '1h' });
    return res.json({ success: true, data: { token } });
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
}

// PUBLIC_INTERFACE
export async function logout(_req: Request, res: Response) {
  /** Stateless JWT logout; client should discard tokens. */
  res.json({ success: true, message: 'Logged out' });
}

// PUBLIC_INTERFACE
export async function verifyEmail(req: Request, res: Response) {
  /** Verify email using token param. */
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ success: false, error: 'token required' });

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ success: false, error: 'Invalid or expired token' });
  }
  await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } });
  await prisma.emailVerificationToken.delete({ where: { id: record.id } });
  res.json({ success: true, message: 'Email verified' });
}

// PUBLIC_INTERFACE
export async function resendVerification(req: Request, res: Response) {
  /** Resend email verification (stub). */
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ success: false, error: 'email required' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.emailVerificationToken.create({
      data: {
        token: `verify_${user.id}_${Date.now()}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
      }
    });
  }
  res.json({ success: true, message: 'If the email exists, a verification link has been sent.' });
}

// PUBLIC_INTERFACE
export async function forgotPassword(req: Request, res: Response) {
  /** Create password reset token (stub sending email). */
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ success: false, error: 'email required' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.passwordResetToken.create({
      data: {
        token: `reset_${user.id}_${Date.now()}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60)
      }
    });
  }
  res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
}

// PUBLIC_INTERFACE
export async function resetPassword(req: Request, res: Response) {
  /** Reset password using token. */
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ success: false, error: 'token and password required' });
  const rec = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!rec || rec.expiresAt < new Date()) return res.status(400).json({ success: false, error: 'Invalid or expired token' });
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: rec.userId }, data: { passwordHash: hash } });
  await prisma.passwordResetToken.delete({ where: { id: rec.id } });
  res.json({ success: true, message: 'Password updated' });
}

// PUBLIC_INTERFACE
export async function googleOAuthCallback(_req: Request, res: Response) {
  /** Google OAuth callback stub endpoint. */
  res.json({ success: true, message: 'Google OAuth callback not implemented. TODO.' });
}
