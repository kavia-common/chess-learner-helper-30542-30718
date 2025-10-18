import { Router } from 'express';
import { getQuiz, listQuizzes, submitQuiz } from '../controllers/quizzes.controller.js';
import { jwtAuth } from '../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /quizzes:
 *   get:
 *     tags: [Quizzes]
 *     summary: List quizzes
 */
router.get('/', jwtAuth, listQuizzes);

/**
 * @openapi
 * /quizzes/{id}:
 *   get:
 *     tags: [Quizzes]
 *     summary: Get quiz
 */
router.get('/:id', jwtAuth, getQuiz);

/**
 * @openapi
 * /quizzes/submit:
 *   post:
 *     tags: [Quizzes]
 *     summary: Submit quiz answers
 */
router.post('/submit', jwtAuth, submitQuiz);

export default router;
