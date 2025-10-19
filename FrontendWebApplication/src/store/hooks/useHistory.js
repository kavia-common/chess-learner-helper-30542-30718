import { useMemo } from 'react';
import { useHistoryStore as useHistoryContext, HistoryProvider } from '../history';

/**
 * PUBLIC_INTERFACE
 * useHistory
 * Hook exposing memoized history state selectors and bound actions.
 *
 * Returns:
 * - state: { list, detail, hint, analysis }
 * - actions: { fetchHistory({ page, pageSize, filters }), fetchGame(gameId), fetchHint({ gameId, plyIndex }), fetchAnalysis(gameId) }
 *
 * Note: Must be used within <HistoryProvider>.
 */
export function useHistory() {
  const ctx = useHistoryContext();
  const state = ctx?.state || {};
  const actions = ctx?.actions || {};

  const selectors = useMemo(
    () => ({
      list: state.list,
      detail: state.detail,
      hint: state.hint,
      analysis: state.analysis,
    }),
    [state.list, state.detail, state.hint, state.analysis]
  );

  return useMemo(
    () => ({
      state: selectors,
      actions,
    }),
    [selectors, actions]
  );
}

export default useHistory;
export { HistoryProvider };
