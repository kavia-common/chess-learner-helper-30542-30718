/* Gamification context manages daily challenge, puzzles, leaderboards, and achievements. */
import React, { createContext, useContext, useMemo, useReducer } from 'react';
import * as GamificationApi from '../api/gamificationApi';

const ACTIONS = {
  DAILY_START: 'DAILY_START',
  DAILY_SUCCESS: 'DAILY_SUCCESS',
  DAILY_ERROR: 'DAILY_ERROR',
  DAILY_COMPLETE_START: 'DAILY_COMPLETE_START',
  DAILY_COMPLETE_SUCCESS: 'DAILY_COMPLETE_SUCCESS',
  DAILY_COMPLETE_ERROR: 'DAILY_COMPLETE_ERROR',

  PUZZLES_START: 'PUZZLES_START',
  PUZZLES_SUCCESS: 'PUZZLES_SUCCESS',
  PUZZLES_ERROR: 'PUZZLES_ERROR',
  PUZZLE_SUBMIT_START: 'PUZZLE_SUBMIT_START',
  PUZZLE_SUBMIT_RESULT: 'PUZZLE_SUBMIT_RESULT',
  PUZZLE_SUBMIT_ERROR: 'PUZZLE_SUBMIT_ERROR',

  LEADERBOARD_START: 'LEADERBOARD_START',
  LEADERBOARD_SUCCESS: 'LEADERBOARD_SUCCESS',
  LEADERBOARD_ERROR: 'LEADERBOARD_ERROR',

  ACH_START: 'ACH_START',
  ACH_SUCCESS: 'ACH_SUCCESS',
  ACH_ERROR: 'ACH_ERROR',
};

const initialGamificationState = {
  daily: { data: null, loading: false, error: null, completing: false, completeResult: null },
  puzzles: { items: [], page: 1, pageSize: 12, total: 0, loading: false, error: null, difficulty: 'all', results: {} },
  leaderboards: { items: [], loading: false, error: null, period: 'weekly' },
  achievements: { data: null, loading: false, error: null },
};

// PUBLIC_INTERFACE
export function gamificationReducer(state, action) {
  switch (action.type) {
    case ACTIONS.DAILY_START:
      return { ...state, daily: { ...state.daily, loading: true, error: null } };
    case ACTIONS.DAILY_SUCCESS:
      return { ...state, daily: { data: action.payload, loading: false, error: null, completing: false, completeResult: null } };
    case ACTIONS.DAILY_ERROR:
      return { ...state, daily: { ...state.daily, loading: false, error: action.payload || 'Error' } };
    case ACTIONS.DAILY_COMPLETE_START:
      return { ...state, daily: { ...state.daily, completing: true, completeResult: null, error: null } };
    case ACTIONS.DAILY_COMPLETE_SUCCESS:
      return { ...state, daily: { ...state.daily, completing: false, completeResult: action.payload, data: { ...(state.daily.data || {}), completed: true } } };
    case ACTIONS.DAILY_COMPLETE_ERROR:
      return { ...state, daily: { ...state.daily, completing: false, error: action.payload || 'Error' } };

    case ACTIONS.PUZZLES_START:
      return { ...state, puzzles: { ...state.puzzles, loading: true, error: null } };
    case ACTIONS.PUZZLES_SUCCESS:
      return { ...state, puzzles: { ...state.puzzles, loading: false, error: null, items: action.payload.items || [], page: action.payload.page || 1, pageSize: action.payload.pageSize || 12, total: action.payload.total || 0 } };
    case ACTIONS.PUZZLES_ERROR:
      return { ...state, puzzles: { ...state.puzzles, loading: false, error: action.payload || 'Error' } };
    case ACTIONS.PUZZLE_SUBMIT_START:
      return state;
    case ACTIONS.PUZZLE_SUBMIT_RESULT:
      return { ...state, puzzles: { ...state.puzzles, results: { ...state.puzzles.results, [action.payload.puzzleId]: action.payload.result } } };
    case ACTIONS.PUZZLE_SUBMIT_ERROR:
      return { ...state, puzzles: { ...state.puzzles, error: action.payload || 'Error' } };

    case ACTIONS.LEADERBOARD_START:
      return { ...state, leaderboards: { ...state.leaderboards, loading: true, error: null } };
    case ACTIONS.LEADERBOARD_SUCCESS:
      return { ...state, leaderboards: { ...state.leaderboards, loading: false, error: null, items: action.payload || [] } };
    case ACTIONS.LEADERBOARD_ERROR:
      return { ...state, leaderboards: { ...state.leaderboards, loading: false, error: action.payload || 'Error' } };

    case ACTIONS.ACH_START:
      return { ...state, achievements: { ...state.achievements, loading: true, error: null } };
    case ACTIONS.ACH_SUCCESS:
      return { ...state, achievements: { data: action.payload || null, loading: false, error: null } };
    case ACTIONS.ACH_ERROR:
      return { ...state, achievements: { ...state.achievements, loading: false, error: action.payload || 'Error' } };
    default:
      return state;
  }
}

const GamificationContext = createContext({ state: initialGamificationState, actions: {} });

// PUBLIC_INTERFACE
export function GamificationProvider({ children }) {
  const [state, dispatch] = useReducer(gamificationReducer, initialGamificationState);

  const actions = useMemo(() => ({
    // PUBLIC_INTERFACE
    fetchDailyChallenge: async () => {
      dispatch({ type: ACTIONS.DAILY_START });
      try {
        const data = await GamificationApi.getDailyChallenge();
        dispatch({ type: ACTIONS.DAILY_SUCCESS, payload: data });
        return data;
      } catch (e) {
        dispatch({ type: ACTIONS.DAILY_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    completeDaily: async () => {
      const id = state.daily.data?.id;
      if (!id) return null;
      dispatch({ type: ACTIONS.DAILY_COMPLETE_START });
      try {
        const result = await GamificationApi.completeDailyChallenge(id);
        dispatch({ type: ACTIONS.DAILY_COMPLETE_SUCCESS, payload: result });
        return result;
      } catch (e) {
        dispatch({ type: ACTIONS.DAILY_COMPLETE_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    fetchPuzzles: async ({ page = 1, pageSize = 12, difficulty = 'all' } = {}) => {
      dispatch({ type: ACTIONS.PUZZLES_START });
      try {
        const data = await GamificationApi.getPuzzles({ page, pageSize, difficulty });
        dispatch({ type: ACTIONS.PUZZLES_SUCCESS, payload: data });
        return data;
      } catch (e) {
        dispatch({ type: ACTIONS.PUZZLES_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    submitPuzzle: async (puzzleId, solution) => {
      dispatch({ type: ACTIONS.PUZZLE_SUBMIT_START, payload: { puzzleId } });
      try {
        const result = await GamificationApi.submitPuzzleSolution(puzzleId, solution);
        dispatch({ type: ACTIONS.PUZZLE_SUBMIT_RESULT, payload: { puzzleId, result } });
        return result;
      } catch (e) {
        dispatch({ type: ACTIONS.PUZZLE_SUBMIT_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    fetchLeaderboards: async ({ period = 'weekly' } = {}) => {
      dispatch({ type: ACTIONS.LEADERBOARD_START });
      try {
        const items = await GamificationApi.getLeaderboards({ period });
        dispatch({ type: ACTIONS.LEADERBOARD_SUCCESS, payload: items });
        return items;
      } catch (e) {
        dispatch({ type: ACTIONS.LEADERBOARD_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    fetchAchievements: async () => {
      dispatch({ type: ACTIONS.ACH_START });
      try {
        const data = await GamificationApi.getAchievements();
        dispatch({ type: ACTIONS.ACH_SUCCESS, payload: data });
        return data;
      } catch (e) {
        dispatch({ type: ACTIONS.ACH_ERROR, payload: e.message });
        return null;
      }
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state.daily.data?.id]);

  return (
    <GamificationContext.Provider value={{ state, actions }}>
      {children}
    </GamificationContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useGamification() {
  /** Hook to access gamification state and actions */
  return useContext(GamificationContext);
}
