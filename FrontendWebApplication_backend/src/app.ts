import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import lessonRoutes from './routes/lessons.routes.js';
import quizRoutes from './routes/quizzes.routes.js';
import gameRoutes from './routes/games.routes.js';
import progressRoutes from './routes/progress.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app: Application = express();

// Security & parsing
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// CORS
const origins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());
app.use(cors({ origin: origins, credentials: true }));

// Logging
app.use(morgan('dev'));

// Rate limiting basic
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

/**
 * Basic environment validation (non-fatal warnings for optional features).
 */
function validateEnv() {
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }

  const oauthVars = ['OAUTH_GOOGLE_CLIENT_ID', 'OAUTH_GOOGLE_CLIENT_SECRET', 'OAUTH_GOOGLE_REDIRECT_URI'];
  const missOauth = oauthVars.filter((k) => !process.env[k]);
  if (missOauth.length) {
    // eslint-disable-next-line no-console
    console.warn('[ENV] Google OAuth not fully configured:', missOauth.join(', '));
  }

  if (!process.env.SMTP_HOST) {
    // eslint-disable-next-line no-console
    console.warn('[ENV] SMTP not configured. EmailService will log emails to console.');
  }

  if ((process.env.STORAGE_DRIVER || 'local') === 'local') {
    const dir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}
validateEnv();

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Serve static for local uploads
app.use('/static', express.static(path.resolve(process.cwd(), 'uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/lessons', lessonRoutes);
app.use('/quizzes', quizRoutes);
app.use('/games', gameRoutes);
app.use('/progress', progressRoutes);
app.use('/admin', adminRoutes);

// Docs placeholder, actual mounting happens via openApiSetup
app.get('/docs-help', (_req: Request, res: Response) => {
  res.json({
    message: 'Swagger docs available at /docs',
    websocketNote: 'Future WebSocket endpoints will be documented here.'
  });
});

// 404 and Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

// PUBLIC_INTERFACE
export function openApiSetup(appInst: Application): void {
  /** Mounts swagger-ui with swagger-jsdoc generated spec for API exploration. */
  const options = {
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'Chess Learner Helper API',
        version: '0.1.0',
        description: 'REST API for authentication, lessons, quizzes, games, progress, and admin endpoints.'
      },
      servers: [{ url: process.env.APP_BASE_URL || 'http://localhost:4000' }],
      tags: [
        { name: 'Auth', description: 'Authentication and session management' },
        { name: 'Users', description: 'User profile and account management' },
        { name: 'Lessons', description: 'Lessons and progress' },
        { name: 'Quizzes', description: 'Quizzes and attempts' },
        { name: 'Games', description: 'AI and multiplayer games' },
        { name: 'Progress', description: 'Progress and leaderboards' },
        { name: 'Admin', description: 'Admin operations' }
      ]
    },
    apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts']
  };
  const spec = swaggerJsdoc(options);
  appInst.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

  // WebSocket help for docs
  appInst.get('/docs/websocket', (_req: Request, res: Response) => {
    res.json({
      note: 'Connect to ws /ws/multiplayer with ?token=<JWT>. Events: join_random, join_room, move, resign.',
      path: '/ws/multiplayer',
      auth: 'Bearer JWT as query token',
    });
  });
}
