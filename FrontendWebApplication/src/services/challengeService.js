import { apiClient } from './apiClient';

/**
 * Mock guard: If API is not available, return safe local data.
 */
const safeRequest = async (fn, fallback) => {
  try {
    return await fn();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('challengeService fallback due to error:', e?.message || e);
    return typeof fallback === 'function' ? fallback() : fallback;
  }
};

/**
 * PUBLIC_INTERFACE
 * getDailyChallenge - Retrieve the daily challenge for the current user.
 */
export const getDailyChallenge = async () =>
  safeRequest(
    async () => (await apiClient.get('/challenges/daily')).data,
    () => ({
      id: 'mock-daily-1',
      title: 'Mate in 2',
      description: 'Find a forced mate in 2 moves.',
      difficulty: 'Intermediate',
      points: 50,
      fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    })
  );

/**
 * PUBLIC_INTERFACE
 * listPuzzles - List puzzles library with optional filters.
 */
export const listPuzzles = async (filters = {}) =>
  safeRequest(
    async () => (await apiClient.get('/puzzles', { params: filters })).data,
    () => {
      const all = [
        { id: 'p1', title: 'Fork Tactic', theme: 'Tactics', difficulty: 'Easy', rating: 3.5 },
        { id: 'p2', title: 'Back Rank Mate', theme: 'Endgame', difficulty: 'Intermediate', rating: 4.2 },
        { id: 'p3', title: 'Skewer Defense', theme: 'Tactics', difficulty: 'Advanced', rating: 4.8 }
      ];
      const { theme, difficulty } = filters;
      return all.filter(p =>
        (!theme || p.theme === theme) &&
        (!difficulty || p.difficulty === difficulty)
      );
    }
  );

/**
 * PUBLIC_INTERFACE
 * submitChallengeResult - Submit result to backend, update points.
 */
export const submitChallengeResult = async ({ id, success, timeMs }) =>
  safeRequest(
    async () => (await apiClient.post('/challenges/submit', { id, success, timeMs })).data,
    () => ({
      ok: true,
      awardedPoints: success ? 50 : 0,
      achievementUnlocked: success ? 'Daily Challenger' : null
    })
  );

/**
 * PUBLIC_INTERFACE
 * claimReward - Claim challenge reward badge/points.
 */
export const claimReward = async (challengeId) =>
  safeRequest(
    async () => (await apiClient.post('/challenges/claim', { challengeId })).data,
    () => ({ ok: true, message: 'Reward claimed (mock).' })
  );
