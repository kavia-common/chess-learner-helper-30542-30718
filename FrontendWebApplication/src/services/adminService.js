import { apiClient } from './apiClient';

/**
 * Admin service with mock-safe methods. These call expected backend endpoints when available.
 * If endpoints are not ready, they return stubbed data so UI can function during development.
 * Errors are thrown with safe messages and should be surfaced using ToastContext by callers.
 */

// Helpers
function simulateDelay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withFallback(promiseFactory, fallbackFactory, delayMs = 300) {
  return (async () => {
    try {
      const res = await promiseFactory();
      return res;
    } catch {
      // Return fallback stub on failure for development
      await simulateDelay(delayMs);
      return typeof fallbackFactory === 'function' ? fallbackFactory() : fallbackFactory;
    }
  })();
}

// PUBLIC_INTERFACE
export async function getUsers() {
  /** Fetch a list of users for admin management. */
  return withFallback(
    () => apiClient.get('/admin/users'),
    () => ([
      { id: 'u1', email: 'learner1@example.com', displayName: 'Learner One', role: 'user', status: 'active', createdAt: '2024-01-10' },
      { id: 'u2', email: 'mod@example.com', displayName: 'Mod Sample', role: 'moderator', status: 'active', createdAt: '2024-02-15' },
      { id: 'u3', email: 'admin@example.com', displayName: 'Admin Sample', role: 'admin', status: 'active', createdAt: '2024-03-20' },
    ])
  );
}

// PUBLIC_INTERFACE
export async function updateUserRole(userId, role) {
  /** Update a user's role (e.g., user, moderator, admin). */
  if (!userId || !role) throw new Error('Invalid parameters.');
  return withFallback(
    () => apiClient.patch(`/admin/users/${userId}`, { role }),
    () => ({ id: userId, role })
  );
}

// PUBLIC_INTERFACE
export async function listLessons() {
  /** List lessons for CMS management. */
  return withFallback(
    () => apiClient.get('/admin/lessons'),
    () => ([
      { id: 'l1', title: 'Chess Basics', difficulty: 'Beginner', updatedAt: '2024-05-01' },
      { id: 'l2', title: 'Opening Principles', difficulty: 'Beginner', updatedAt: '2024-05-05' },
      { id: 'l3', title: 'Tactics: Forks', difficulty: 'Intermediate', updatedAt: '2024-05-11' },
    ])
  );
}

// PUBLIC_INTERFACE
export async function createLesson(payload) {
  /** Create a new lesson (stub returns created entity with id). */
  const body = payload || { title: 'Untitled Lesson', difficulty: 'Beginner', content: '' };
  return withFallback(
    () => apiClient.post('/admin/lessons', body),
    () => ({ id: `l_${Date.now()}`, ...body, createdAt: new Date().toISOString() })
  );
}

// PUBLIC_INTERFACE
export async function updateLesson(lessonId, payload) {
  /** Update an existing lesson. */
  if (!lessonId) throw new Error('Lesson id is required.');
  return withFallback(
    () => apiClient.patch(`/admin/lessons/${lessonId}`, payload || {}),
    () => ({ id: lessonId, ...(payload || {}), updatedAt: new Date().toISOString() })
  );
}

// PUBLIC_INTERFACE
export async function listReports() {
  /** Retrieve moderation reports/flags. */
  return withFallback(
    () => apiClient.get('/admin/reports'),
    () => ([
      { id: 'r1', type: 'comment', reason: 'Inappropriate language', status: 'open', createdAt: '2024-05-12', targetId: 'c_101' },
      { id: 'r2', type: 'profile', reason: 'Spam', status: 'open', createdAt: '2024-05-13', targetId: 'u2' },
    ])
  );
}

// PUBLIC_INTERFACE
export async function resolveReport(reportId, action = 'dismiss') {
  /** Resolve a report with an action: 'dismiss' | 'remove' | 'warn'. */
  if (!reportId) throw new Error('Report id is required.');
  return withFallback(
    () => apiClient.post(`/admin/reports/${reportId}/resolve`, { action }),
    () => ({ id: reportId, action, resolvedAt: new Date().toISOString() })
  );
}

// PUBLIC_INTERFACE
export async function getAnalytics() {
  /** Fetch summary analytics for admin dashboard. */
  return withFallback(
    () => apiClient.get('/admin/analytics'),
    () => ({
      activeUsers: 1280,
      newUsers7d: 150,
      lessonCompletions7d: 920,
      avgSessionMinutes: 12.3,
      trendDailyActive: [
        { day: 'Mon', value: 180 },
        { day: 'Tue', value: 190 },
        { day: 'Wed', value: 210 },
        { day: 'Thu', value: 240 },
        { day: 'Fri', value: 260 },
        { day: 'Sat', value: 120 },
        { day: 'Sun', value: 80 },
      ],
    })
  );
}

// PUBLIC_INTERFACE
export async function getAuditLog({ page = 1, pageSize = 20 } = {}) {
  /** Retrieve audit log entries with simple paging. */
  return withFallback(
    () => apiClient.get(`/admin/audit?page=${page}&pageSize=${pageSize}`),
    () => ({
      page,
      pageSize,
      total: 3,
      items: [
        { id: 'a1', actor: 'admin@example.com', action: 'UPDATE_ROLE', target: 'u1', details: 'user -> moderator', at: '2024-05-10T10:00:00Z' },
        { id: 'a2', actor: 'admin@example.com', action: 'CREATE_LESSON', target: 'l4', details: 'New lesson: Endgames Intro', at: '2024-05-12T09:30:00Z' },
        { id: 'a3', actor: 'mod@example.com', action: 'RESOLVE_REPORT', target: 'r1', details: 'Removed comment', at: '2024-05-12T15:20:00Z' },
      ],
    })
  );
}
