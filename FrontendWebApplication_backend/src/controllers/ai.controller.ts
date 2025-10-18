import { Request, Response } from 'express';
import { z } from 'zod';

const aiMoveSchema = z.object({
  fen: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
});

/**
 * PUBLIC_INTERFACE
 * Returns a legal move suggestion stub based on difficulty.
 */
export async function aiMove(req: Request, res: Response) {
  /** AI move endpoint stub: returns a pseudo-legal move string. */
  const body = aiMoveSchema.parse(req.body || {});
  // For stub: choose from a small set varying by difficulty
  const candidateMoves = {
    beginner: ['e2e4', 'd2d4', 'g1f3', 'c2c4'],
    intermediate: ['e2e4', 'd2d4', 'c2c4', 'g1f3', 'b1c3', 'f2f4'],
    advanced: ['e2e4', 'd2d4', 'c2c4', 'g1f3', 'b1c3', 'g2g3', 'b2b3'],
  } as const;

  const options = candidateMoves[body.difficulty];
  const move = options[Math.floor(Math.random() * options.length)];
  res.json({ success: true, data: { move, difficulty: body.difficulty } });
}
