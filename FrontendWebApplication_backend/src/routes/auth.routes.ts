import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { forgotPassword, googleOAuthCallback, login, logout, refresh, register, resendVerification, resetPassword, verifyEmail } from '../controllers/auth.controller.js';
import { z } from 'zod';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register
 *     description: Registers a new user
 */
router.post('/register', validateBody(z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1) })), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     description: Authenticates user and returns JWTs
 */
router.post('/login', validateBody(z.object({ email: z.string().email(), password: z.string().min(1) })), login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 */
router.post('/refresh', validateBody(z.object({ refresh: z.string() })), refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 */
router.post('/logout', logout);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email
 */
router.post('/verify-email', validateBody(z.object({ token: z.string() })), verifyEmail);

/**
 * @openapi
 * /auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Resend verification email
 */
router.post('/resend-verification', validateBody(z.object({ email: z.string().email() })), resendVerification);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Forgot password
 */
router.post('/forgot-password', validateBody(z.object({ email: z.string().email() })), forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password
 */
router.post('/reset-password', validateBody(z.object({ token: z.string(), password: z.string().min(8) })), resetPassword);

/**
 * @openapi
 * /auth/oauth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth callback (stub)
 */
router.get('/oauth/google/callback', googleOAuthCallback);

export default router;
