import { useMemo } from 'react';
import { useGamification as useGamificationContext, GamificationProvider } from '../gamification';

/**
 * PUBLIC_INTERFACE
 * useGamification
 * Hook exposing memoized gamification state selectors and bound actions.
 *
 * Returns:
 * - state: { daily, puzzles, leaderboards, achievements }
 * - actions: { fetchDailyChallenge, completeDaily, fetchPuzzles, submitPuzzle, fetchLeaderboards, fetchAchievements }
 *
 * Note: Must be used within <GamificationProvider>.
 */
export function useGamification() {
  const ctx = useGamificationContext();
  const state = ctx?.state || {};
  const actions = ctx?.actions || {};

  const selectors = useMemo(
    () => ({
      daily: state.daily,
      puzzles: state.puzzles,
      leaderboards: state.leaderboards,
      achievements: state.achievements,
    }),
    [state.daily, state.puzzles, state.leaderboards, state.achievements]
  );

  return useMemo(
    () => ({
      state: selectors,
      actions,
    }),
    [selectors, actions]
  );
}

export default useGamification;
export { GamificationProvider };
