import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthedRequest } from '../middleware/auth.js';
import { z } from 'zod';

// PUBLIC_INTERFACE
export async function listQuizzes(_req: Request, res: Response) {
  /** Returns quizzes list. */
  const items = await prisma.quiz.findMany({ select: { id: true, title: true, description: true } });
  res.json({ success: true, data: items });
}

// PUBLIC_INTERFACE
export async function getQuiz(req: Request, res: Response) {
  /** Returns quiz with questions (no answers). */
  const { id } = req.params;
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: 'asc' }, select: { id: true, prompt: true, options: true, order: true } } }
  });
  if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });
  res.json({ success: true, data: quiz });
}

const submitSchema = z.object({
  quizId: z.string(),
  answers: z.array(z.object({ questionId: z.string(), answer: z.any() }))
});

// PUBLIC_INTERFACE
export async function submitQuiz(req: AuthedRequest, res: Response) {
  /** Grades a quiz attempt (basic exact match) and stores attempt. */
  const body = submitSchema.parse(req.body);
  const quiz = await prisma.quiz.findUnique({ where: { id: body.quizId }, include: { questions: true } });
  if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });

  const answerMap = new Map(body.answers.map((a) => [a.questionId, a.answer]));
  let score = 0;
  for (const q of quiz.questions) {
    const correct = q.answer;
    const provided = answerMap.get(q.id);
    if (JSON.stringify(provided) === JSON.stringify(JSON.parse(correct))) {
      score += 1;
    }
  }

  const attempt = await prisma.quizAttempt.create({
    data: { userId: req.user!.sub, quizId: quiz.id, score, finishedAt: new Date() }
  });
  res.json({ success: true, data: { attemptId: attempt.id, score, total: quiz.questions.length } });
}
