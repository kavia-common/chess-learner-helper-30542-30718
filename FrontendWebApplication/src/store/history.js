import React, { createContext, useContext, useMemo, useReducer } from 'react';
import * as HistoryApi from '../api/historyApi';

const ACTIONS = {
  LIST_START: 'LIST_START',
  LIST_SUCCESS: 'LIST_SUCCESS',
  LIST_ERROR: 'LIST_ERROR',

  DETAIL_START: 'DETAIL_START',
  DETAIL_SUCCESS: 'DETAIL_SUCCESS',
  DETAIL_ERROR: 'DETAIL_ERROR',

  HINT_START: 'HINT_START',
  HINT_SUCCESS: 'HINT_SUCCESS',
  HINT_ERROR: 'HINT_ERROR',

  ANALYSIS_START: 'ANALYSIS_START',
  ANALYSIS_SUCCESS: 'ANALYSIS_SUCCESS',
  ANALYSIS_ERROR: 'ANALYSIS_ERROR',
};

const initialHistoryState = {
  list: { items: [], loading: false, error: null, page: 1, pageSize: 10, total: 0, filters: { result: 'all' } },
  detail: { game: null, loading: false, error: null },
  hint: { data: null, loading: false, error: null },
  analysis: { data: null, loading: false, error: null },
};

// PUBLIC_INTERFACE
export function historyReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LIST_START:
      return { ...state, list: { ...state.list, loading: true, error: null, filters: action.payload?.filters || state.list.filters, page: action.payload?.page ?? state.list.page, pageSize: action.payload?.pageSize ?? state.list.pageSize } };
    case ACTIONS.LIST_SUCCESS:
      return { ...state, list: { ...state.list, loading: false, error: null, items: action.payload.items || [], total: action.payload.total || 0, page: action.payload.page || state.list.page, pageSize: action.payload.pageSize || state.list.pageSize } };
    case ACTIONS.LIST_ERROR:
      return { ...state, list: { ...state.list, loading: false, error: action.payload || 'Error' } };

    case ACTIONS.DETAIL_START:
      return { ...state, detail: { ...state.detail, loading: true, error: null, game: null } };
    case ACTIONS.DETAIL_SUCCESS:
      return { ...state, detail: { loading: false, error: null, game: action.payload || null } };
    case ACTIONS.DETAIL_ERROR:
      return { ...state, detail: { ...state.detail, loading: false, error: action.payload || 'Error' } };

    case ACTIONS.HINT_START:
      return { ...state, hint: { data: null, loading: true, error: null } };
    case ACTIONS.HINT_SUCCESS:
      return { ...state, hint: { data: action.payload || null, loading: false, error: null } };
    case ACTIONS.HINT_ERROR:
      return { ...state, hint: { data: null, loading: false, error: action.payload || 'Error' } };

    case ACTIONS.ANALYSIS_START:
      return { ...state, analysis: { data: null, loading: true, error: null } };
    case ACTIONS.ANALYSIS_SUCCESS:
      return { ...state, analysis: { data: action.payload || null, loading: false, error: null } };
    case ACTIONS.ANALYSIS_ERROR:
      return { ...state, analysis: { data: null, loading: false, error: action.payload || 'Error' } };

    default:
      return state;
  }
}

const HistoryContext = createContext({ state: initialHistoryState, actions: {} });

// PUBLIC_INTERFACE
export function HistoryProvider({ children }) {
  const [state, dispatch] = useReducer(historyReducer, initialHistoryState);

  const actions = useMemo(() => ({
    // PUBLIC_INTERFACE
    fetchHistory: async ({ page = 1, pageSize = 10, filters = {} } = {}) => {
      dispatch({ type: ACTIONS.LIST_START, payload: { page, pageSize, filters } });
      try {
        const data = await HistoryApi.listHistory({ page, pageSize, result: filters.result || 'all' });
        dispatch({ type: ACTIONS.LIST_SUCCESS, payload: data });
        return data;
      } catch (e) {
        dispatch({ type: ACTIONS.LIST_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    fetchGame: async (gameId) => {
      dispatch({ type: ACTIONS.DETAIL_START });
      try {
        const game = await HistoryApi.getGameById(gameId);
        dispatch({ type: ACTIONS.DETAIL_SUCCESS, payload: game });
        return game;
      } catch (e) {
        dispatch({ type: ACTIONS.DETAIL_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    fetchHint: async ({ gameId, plyIndex }) => {
      dispatch({ type: ACTIONS.HINT_START });
      try {
        const hint = await HistoryApi.getHintForPosition({ gameId, plyIndex });
        dispatch({ type: ACTIONS.HINT_SUCCESS, payload: hint });
        return hint;
      } catch (e) {
        dispatch({ type: ACTIONS.HINT_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    fetchAnalysis: async (gameId) => {
      dispatch({ type: ACTIONS.ANALYSIS_START });
      try {
        const analysis = await HistoryApi.getAnalysisForGame(gameId);
        dispatch({ type: ACTIONS.ANALYSIS_SUCCESS, payload: analysis });
        return analysis;
      } catch (e) {
        dispatch({ type: ACTIONS.ANALYSIS_ERROR, payload: e.message });
        return null;
      }
    },
  }), []);

  return (
    <HistoryContext.Provider value={{ state, actions }}>
      {children}
    </HistoryContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useHistoryStore() {
  /** Hook to access game history state and actions */
  return useContext(HistoryContext);
}
