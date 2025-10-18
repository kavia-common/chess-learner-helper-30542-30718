import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthedRequest } from '../middleware/auth.js';
import { z } from 'zod';

const startSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner')
});

// PUBLIC_INTERFACE
export async function startAI(req: AuthedRequest, res: Response) {
  /** Starts a new AI game session (logic stub). */
  const body = startSchema.parse(req.body || {});
  const game = await prisma.game.create({
    data: { whiteId: req.user!.sub, rated: false }
  });
  res.status(201).json({ success: true, data: { gameId: game.id, difficulty: body.difficulty } });
}

const moveSchema = z.object({
  gameId: z.string(),
  move: z.string()
});

// PUBLIC_INTERFACE
export async function makeMove(req: AuthedRequest, res: Response) {
  /** Records a move in a game (no validation stub). */
  const body = moveSchema.parse(req.body);
  const count = await prisma.gameMove.count({ where: { gameId: body.gameId } });
  await prisma.gameMove.create({ data: { gameId: body.gameId, move: body.move, moveNumber: count + 1 } });
  res.json({ success: true, data: { ok: true } });
}

// PUBLIC_INTERFACE
export async function history(req: AuthedRequest, res: Response) {
  /** Returns current user's game history. */
  const uid = req.user!.sub;
  const games = await prisma.game.findMany({
    where: { OR: [{ whiteId: uid }, { blackId: uid }] },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json({ success: true, data: games });
}

// PUBLIC_INTERFACE
export async function detail(req: Request, res: Response) {
  /** Returns a game details with moves. */
  const { id } = req.params;
  const game = await prisma.game.findUnique({ where: { id }, include: { moves: { orderBy: { moveNumber: 'asc' } } } });
  if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
  res.json({ success: true, data: game });
}
