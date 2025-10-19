import { useMemo } from 'react';
import { useGames as useGamesContext, GamesProvider } from '../games';

/**
 * PUBLIC_INTERFACE
 * useGames
 * Hook exposing memoized games state selectors and bound actions.
 *
 * Returns:
 * - state: { ai, matchmaking, realtime }
 * - actions: { setAiDifficulty, newAiGame, makeAiMove, startMatchmaking, pollMatchmaking, cancelMatchmaking, loadRealtimeGame, applyRealtimeMove }
 *
 * Note: Must be used within <GamesProvider>.
 */
export function useGames() {
  const ctx = useGamesContext();
  const state = ctx?.state || {};
  const actions = ctx?.actions || {};

  const selectors = useMemo(
    () => ({
      ai: state.ai,
      matchmaking: state.matchmaking,
      realtime: state.realtime,
    }),
    [state.ai, state.matchmaking, state.realtime]
  );

  return useMemo(
    () => ({
      state: selectors,
      actions,
    }),
    [selectors, actions]
  );
}

export default useGames;
export { GamesProvider };
