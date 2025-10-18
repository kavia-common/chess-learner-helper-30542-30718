import { Router } from 'express';
import { detail, history, makeMove, startAI } from '../controllers/games.controller.js';
import { jwtAuth } from '../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /games/start-ai:
 *   post:
 *     tags: [Games]
 *     summary: Start AI game
 */
router.post('/start-ai', jwtAuth, startAI);

/**
 * @openapi
 * /games/move:
 *   post:
 *     tags: [Games]
 *     summary: Make a move (stub)
 */
router.post('/move', jwtAuth, makeMove);

/**
 * @openapi
 * /games/history:
 *   get:
 *     tags: [Games]
 *     summary: User game history
 */
router.get('/history', jwtAuth, history);

/**
 * @openapi
 * /games/detail/{id}:
 *   get:
 *     tags: [Games]
 *     summary: Game detail
 */
router.get('/detail/:id', jwtAuth, detail);

export default router;
