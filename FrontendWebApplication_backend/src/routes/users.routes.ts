import { Router } from 'express';
import { jwtAuth } from '../middleware/auth.js';
import { deleteMe, me, updateMe, uploadAvatar } from '../controllers/users.controller.js';

const router = Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user
 */
router.get('/me', jwtAuth, me);

/**
 * @openapi
 * /users/me:
 *   put:
 *     tags: [Users]
 *     summary: Update current user profile
 */
router.put('/me', jwtAuth, updateMe);

/**
 * @openapi
 * /users/me:
 *   delete:
 *     tags: [Users]
 *     summary: Delete current user
 */
router.delete('/me', jwtAuth, deleteMe);

/**
 * @openapi
 * /users/upload-avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload avatar
 *     description: Expects JSON { image: 'data:<mime>;base64,....' } or raw base64 string in image.
 */
router.post('/upload-avatar', jwtAuth, uploadAvatar);

export default router;
