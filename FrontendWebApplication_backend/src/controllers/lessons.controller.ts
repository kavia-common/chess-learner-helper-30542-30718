import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthedRequest } from '../middleware/auth.js';
import { z } from 'zod';

// PUBLIC_INTERFACE
export async function listLessons(_req: Request, res: Response) {
  /** Returns paginated list of lessons (simple all for now). */
  const items = await prisma.lesson.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: items });
}

// PUBLIC_INTERFACE
export async function getLesson(req: Request, res: Response) {
  /** Returns lesson by id with modules. */
  const { id } = req.params;
  const item = await prisma.lesson.findUnique({ where: { id }, include: { modules: { orderBy: { order: 'asc' } } } });
  if (!item) return res.status(404).json({ success: false, error: 'Lesson not found' });
  res.json({ success: true, data: item });
}

const progressSchema = z.object({
  lessonId: z.string(),
  progress: z.number().min(0).max(100),
  completed: z.boolean().optional()
});

// PUBLIC_INTERFACE
export async function updateProgress(req: AuthedRequest, res: Response) {
  /** Updates or creates lesson progress for the current user. */
  const body = progressSchema.parse(req.body);
  const userId = req.user!.sub;
  const record = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId: body.lessonId } },
    update: { progress: body.progress, completed: body.completed ?? body.progress === 100 },
    create: { userId, lessonId: body.lessonId, progress: body.progress, completed: body.completed ?? false }
  });
  res.json({ success: true, data: record });
}

// Admin CRUD
const lessonCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().optional(),
  difficulty: z.string().optional()
});

// PUBLIC_INTERFACE
export async function adminCreateLesson(req: Request, res: Response) {
  /** Admin creates a new lesson. */
  const body = lessonCreateSchema.parse(req.body);
  const item = await prisma.lesson.create({ data: body });
  res.status(201).json({ success: true, data: item });
}

// PUBLIC_INTERFACE
export async function adminUpdateLesson(req: Request, res: Response) {
  /** Admin updates an existing lesson. */
  const { id } = req.params;
  const body = lessonCreateSchema.partial().parse(req.body);
  const item = await prisma.lesson.update({ where: { id }, data: body });
  res.json({ success: true, data: item });
}

// PUBLIC_INTERFACE
export async function adminDeleteLesson(req: Request, res: Response) {
  /** Admin deletes a lesson. */
  const { id } = req.params;
  await prisma.lesson.delete({ where: { id } });
  res.json({ success: true, message: 'Deleted' });
}
