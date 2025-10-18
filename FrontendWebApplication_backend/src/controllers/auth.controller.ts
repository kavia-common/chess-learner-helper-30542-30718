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

import { emailService } from '../services/email.service.js';
import { googleOAuth } from '../services/oauth.service.js';

// PUBLIC_INTERFACE
export async function forgotPassword(req: Request, res: Response) {
  /** Create password reset token and email link (SMTP logs if not configured). */
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ success: false, error: 'email required' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = `reset_${user.id}_${Date.now()}`;
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60)
      }
    });
    const resetUrl = `${process.env.APP_BASE_URL || 'http://localhost:4000'}/auth/reset?token=${encodeURIComponent(token)}`;
    await emailService.sendMail(email, 'Password reset', `Reset your password: ${resetUrl}`, `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`);
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

/**
 * PUBLIC_INTERFACE
 * Starts Google OAuth flow by redirecting to consent screen.
 */
export async function googleOAuthStart(req: Request, res: Response) {
  /** Redirects to Google consent screen. */
  const state = req.query.state?.toString();
  const url = googleOAuth.getAuthUrl(state || undefined);
  res.redirect(url);
}

// PUBLIC_INTERFACE
export async function googleOAuthCallback(req: Request, res: Response) {
  /** Handles Google OAuth callback, creates/links account, returns simple HTML with token (for demo). */
  const code = req.query.code?.toString();
  if (!code) return res.status(400).send('Missing code');

  try {
    const tokens = await googleOAuth.exchangeCode(code);
    const profile = await googleOAuth.getUserInfo(tokens.access_token);

    // Link or create user
    let user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email,
          emailVerified: true,
          profile: { create: { name: profile.name || '' , avatarUrl: profile.picture || undefined } },
        },
      });
    }
    // Link OAuth account if missing
    const existing = await prisma.oAuthAccount.findUnique({
      where: { provider_providerId: { provider: 'google', providerId: profile.sub } },
    });
    if (!existing) {
      await prisma.oAuthAccount.create({
        data: {
          provider: 'google',
          providerId: profile.sub,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          userId: user.id,
        },
      });
    }

    const jwtToken = require('jsonwebtoken').sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET || 'dev',
      { expiresIn: '1h' }
    );

    // Minimal UX: render a page that posts token to opener or shows it
    const script = `
<!doctype html><html><body>
<script>
  (function(){
    try {
      if (window.opener) {
        window.opener.postMessage({ type: 'oauth_success', provider: 'google', token: '${jwtToken}' }, '*');
        window.close();
      }
    } catch (e) {}
  })();
</script>
<p>Login successful. Token: ${jwtToken}</p>
</body></html>`;
    res.setHeader('Content-Type', 'text/html').send(script);
  } catch (e: any) {
    res.status(400).send(`OAuth error: ${e.message || e}`);
  }
}
