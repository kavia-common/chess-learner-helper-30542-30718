import { Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthedRequest } from '../middleware/auth.js';

// PUBLIC_INTERFACE
export async function summary(req: AuthedRequest, res: Response) {
  /** Returns simple progress summary for dashboard. */
  const uid = req.user!.sub;
  const lessonsCompleted = await prisma.lessonProgress.count({ where: { userId: uid, completed: true } });
  const quizzesCompleted = await prisma.quizAttempt.count({ where: { userId: uid } });
  const points = lessonsCompleted * 50 + quizzesCompleted * 20;
  res.json({ success: true, data: { lessonsCompleted, quizzesCompleted, points } });
}

// PUBLIC_INTERFACE
export async function leaderboards(_req: AuthedRequest, res: Response) {
  /** Returns top leaderboard entries (stub). */
  const top = await prisma.leaderboard.findMany({ orderBy: { points: 'desc' }, take: 50, include: { user: true } });
  res.json({
    success: true,
    data: top.map((t) => ({ userId: t.userId, email: t.user.email, points: t.points, period: t.period, rank: t.rank }))
  });
}
