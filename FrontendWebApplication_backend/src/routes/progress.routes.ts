import { Router } from 'express';
import { jwtAuth } from '../middleware/auth.js';
import { leaderboards, summary } from '../controllers/progress.controller.js';

const router = Router();

/**
 * @openapi
 * /progress/summary:
 *   get:
 *     tags: [Progress]
 *     summary: Progress summary
 */
router.get('/summary', jwtAuth, summary);

/**
 * @openapi
 * /progress/leaderboards:
 *   get:
 *     tags: [Progress]
 *     summary: Leaderboards
 */
router.get('/leaderboards', jwtAuth, leaderboards);

export default router;
```

Explanation: Admin routes including users CRUD and audit logs; also admin lessons CRUD under /admin/lessons.
````write file="chess-learner-helper-30542-30718/FrontendWebApplication_backend/src/routes/admin.routes.ts"
import { Router } from 'express';
import { requireRole, jwtAuth } from '../middleware/auth.js';
import { createUser, deleteUser, listAuditLogs, listUsers, updateUser } from '../controllers/admin.controller.js';
import { adminCreateLesson, adminDeleteLesson, adminUpdateLesson } from '../controllers/lessons.controller.js';

const router = Router();

router.use(jwtAuth, requireRole(['ADMIN']));

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List users
 */
router.get('/users', listUsers);

/**
 * @openapi
 * /admin/users:
 *   post:
 *     tags: [Admin]
 *     summary: Create user
 */
router.post('/users', createUser);

/**
 * @openapi
 * /admin/users/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update user
 */
router.put('/users/:id', updateUser);

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete user
 */
router.delete('/users/:id', deleteUser);

/**
 * @openapi
 * /admin/audit-logs:
 *   get:
 *     tags: [Admin]
 *     summary: List audit logs
 */
router.get('/audit-logs', listAuditLogs);

/**
 * @openapi
 * /admin/lessons:
 *   post:
 *     tags: [Admin]
 *     summary: Create lesson
 */
router.post('/lessons', adminCreateLesson);

/**
 * @openapi
 * /admin/lessons/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update lesson
 */
router.put('/lessons/:id', adminUpdateLesson);

/**
 * @openapi
 * /admin/lessons/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete lesson
 */
router.delete('/lessons/:id', adminDeleteLesson);

export default router;
