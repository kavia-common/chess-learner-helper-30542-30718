import { apiClient } from './apiClient';

/**
 * Mock guard wrapper to ensure app resiliency without backend.
 */
const safeRequest = async (fn, fallback) => {
  try {
    return await fn();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('progressService fallback due to error:', e?.message || e);
    return typeof fallback === 'function' ? fallback() : fallback;
  }
};

/**
 * PUBLIC_INTERFACE
 * getLeaderboard - Retrieve leaderboard data with optional timeframe filter.
 */
export const getLeaderboard = async (timeframe = 'weekly') =>
  safeRequest(
    async () => (await apiClient.get('/leaderboard', { params: { timeframe } })).data,
    () => ([
      { userId: 'u1', name: 'Alice', points: 1240 },
      { userId: 'u2', name: 'Bob', points: 1175 },
      { userId: 'u3', name: 'Chen', points: 990 }
    ])
  );

/**
 * PUBLIC_INTERFACE
 * getAchievements - Retrieve user's earned achievements and progress.
 */
export const getAchievements = async () =>
  safeRequest(
    async () => (await apiClient.get('/me/achievements')).data,
    () => ([
      { id: 'a1', name: 'First Mate', description: 'Complete your first checkmate puzzle', rarity: 'common', progress: 100 },
      { id: 'a2', name: 'Streak x7', description: 'Maintain a 7-day learning streak', rarity: 'rare', progress: 60 },
      { id: 'a3', name: 'Speedster', description: 'Finish a quiz in under 30s', rarity: 'epic', progress: 100 }
    ])
  );

/**
 * PUBLIC_INTERFACE
 * getStreak - Retrieve current learning streak and best streak.
 */
export const getStreak = async () =>
  safeRequest(
    async () => (await apiClient.get('/me/streak')).data,
    () => ({ current: 4, best: 12 })
  );
