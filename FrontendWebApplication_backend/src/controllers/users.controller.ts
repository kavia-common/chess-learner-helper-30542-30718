import { Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthedRequest } from '../middleware/auth.js';
import { z } from 'zod';

// PUBLIC_INTERFACE
export async function me(req: AuthedRequest, res: Response) {
  /** Returns current user profile. */
  const id = req.user!.sub;
  const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({
    success: true,
    data: { id: user.id, email: user.email, role: user.role, profile: user.profile }
  });
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional()
});

// PUBLIC_INTERFACE
export async function updateMe(req: AuthedRequest, res: Response) {
  /** Updates current user's profile fields. */
  const body = updateSchema.parse(req.body || {});
  const id = req.user!.sub;

  const profile = await prisma.profile.upsert({
    where: { userId: id },
    update: { ...body },
    create: { userId: id, ...body }
  });
  res.json({ success: true, data: profile });
}

// PUBLIC_INTERFACE
export async function deleteMe(req: AuthedRequest, res: Response) {
  /** Deletes current user account and cascades. */
  const id = req.user!.sub;
  await prisma.user.delete({ where: { id } });
  res.json({ success: true, message: 'Account deleted' });
}

// PUBLIC_INTERFACE
export async function uploadAvatar(_req: AuthedRequest, res: Response) {
  /** Stub for avatar upload; to be implemented with storage. */
  res.status(501).json({ success: false, error: 'Not implemented: avatar upload' });
}
