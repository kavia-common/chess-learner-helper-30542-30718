import { Router } from 'express';
import { adminCreateLesson, adminDeleteLesson, adminUpdateLesson, getLesson, listLessons, updateProgress } from '../controllers/lessons.controller.js';
import { jwtAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /lessons:
 *   get:
 *     tags: [Lessons]
 *     summary: List lessons
 */
router.get('/', jwtAuth, listLessons);

/**
 * @openapi
 * /lessons/{id}:
 *   get:
 *     tags: [Lessons]
 *     summary: Get lesson by id
 */
router.get('/:id', jwtAuth, getLesson);

/**
 * @openapi
 * /lessons/progress:
 *   post:
 *     tags: [Lessons]
 *     summary: Update lesson progress
 */
router.post('/progress', jwtAuth, updateProgress);

// Admin under /lessons/admin or as specified /admin/lessons in requirements: mount a sub-router from admin.routes.
// For convenience also expose here at /lessons/admin
router.post('/admin', jwtAuth, requireRole(['ADMIN']), adminCreateLesson);
router.put('/admin/:id', jwtAuth, requireRole(['ADMIN']), adminUpdateLesson);
router.delete('/admin/:id', jwtAuth, requireRole(['ADMIN']), adminDeleteLesson);

export default router;
