import { useMemo } from 'react';
import * as gamesApi from '../../api/gamesApi';

/**
 * PUBLIC_INTERFACE
 * useGames
 * Provides game helpers bound to API. No store context found, so we surface actions only.
 */
export default function useGames() {
  const actions = useMemo(
    () => ({
      fetchGames: gamesApi.fetchGames,
      startAIGame: gamesApi.startAIGame,
      requestMatchmaking: gamesApi.requestMatchmaking,
      pollMatchmaking: gamesApi.pollMatchmaking,
      cancelMatchmaking: gamesApi.cancelMatchmaking,
      getGameState: gamesApi.getGameState,
    }),
    []
  );

  return actions;
}
