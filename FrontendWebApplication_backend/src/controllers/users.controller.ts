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

import { storageService } from '../services/storage.service.js';

// PUBLIC_INTERFACE
export async function uploadAvatar(req: AuthedRequest, res: Response) {
  /** Uploads avatar image (expects base64 dataUrl or raw base64 in body.image). */
  const id = req.user!.sub;
  const { image } = (req.body || {}) as { image?: string };
  if (!image) return res.status(400).json({ success: false, error: 'image required (base64)' });

  let base64 = image;
  let contentType = 'image/png';
  const match = /^data:(.+);base64,(.*)$/.exec(image);
  if (match) {
    contentType = match[1] || 'image/png';
    base64 = match[2];
  }
  try {
    const buffer = Buffer.from(base64, 'base64');
    const result = await storageService.uploadAvatar(id, buffer, contentType);
    const profile = await prisma.profile.upsert({
      where: { userId: id },
      update: { avatarUrl: result.url },
      create: { userId: id, avatarUrl: result.url },
    });
    res.json({ success: true, data: { avatarUrl: profile.avatarUrl } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message || 'upload_failed' });
  }
}
