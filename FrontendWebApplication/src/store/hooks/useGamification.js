import { useMemo } from 'react';
import * as gamificationApi from '../../api/gamificationApi';

/**
 * PUBLIC_INTERFACE
 * useGamification
 * Provides gamification helpers bound to API. No store context found, so we surface actions only.
 */
export default function useGamification() {
  const actions = useMemo(
    () => ({
      fetchAchievements: gamificationApi.fetchAchievements,
      fetchLeaderboards: gamificationApi.fetchLeaderboards,
      fetchDailyChallenge: gamificationApi.fetchDailyChallenge,
      completeDailyChallenge: gamificationApi.completeDailyChallenge,
      fetchPuzzles: gamificationApi.fetchPuzzles,
      submitPuzzleSolution: gamificationApi.submitPuzzleSolution,
      // Aliases
      getLeaderboards: gamificationApi.getLeaderboards,
      getAchievements: gamificationApi.getAchievements,
    }),
    []
  );

  return actions;
}
