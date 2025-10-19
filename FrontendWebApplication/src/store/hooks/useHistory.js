import { useMemo } from 'react';
import * as historyApi from '../../api/historyApi';

/**
 * PUBLIC_INTERFACE
 * useHistory
 * Provides history helpers bound to API. No store context found, so we surface actions only.
 */
export default function useHistory() {
  const actions = useMemo(
    () => ({
      fetchHistory: historyApi.fetchHistory,
      listHistory: historyApi.listHistory,
      getGameById: historyApi.getGameById,
      getHintForPosition: historyApi.getHintForPosition,
      fetchAnalysis: historyApi.fetchAnalysis,
      getAnalysisForGame: historyApi.getAnalysisForGame,
    }),
    []
  );

  return actions;
}
