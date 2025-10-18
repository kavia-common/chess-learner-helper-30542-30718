import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { z } from 'zod';

const userCreateSchema = z.object({
  email: z.string().email(),
  role: z.enum(['LEARNER', 'ADMIN']).default('LEARNER')
});

// PUBLIC_INTERFACE
export async function listUsers(_req: Request, res: Response) {
  /** Admin: list users. */
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } });
  res.json({ success: true, data: users });
}

// PUBLIC_INTERFACE
export async function createUser(req: Request, res: Response) {
  /** Admin: create user with optional role (password not set). */
  const body = userCreateSchema.parse(req.body);
  const user = await prisma.user.create({ data: { email: body.email, role: body.role } });
  res.status(201).json({ success: true, data: user });
}

// PUBLIC_INTERFACE
export async function updateUser(req: Request, res: Response) {
  /** Admin: update user role. */
  const { id } = req.params;
  const body = userCreateSchema.partial().parse(req.body);
  const user = await prisma.user.update({ where: { id }, data: { ...body } });
  res.json({ success: true, data: user });
}

// PUBLIC_INTERFACE
export async function deleteUser(req: Request, res: Response) {
  /** Admin: delete user. */
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  res.json({ success: true, message: 'Deleted' });
}

// PUBLIC_INTERFACE
export async function listAuditLogs(_req: Request, res: Response) {
  /** Admin: list audit logs. */
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data: logs });
}
