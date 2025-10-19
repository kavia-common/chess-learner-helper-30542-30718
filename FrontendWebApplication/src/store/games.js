/* Games context manages AI play state, matchmaking, and realtime game stubs. */
import React, { createContext, useContext, useMemo, useReducer } from 'react';
import * as GamesApi from '../api/gamesApi';

const ACTIONS = {
  AI_NEW: 'AI_NEW',
  AI_MOVE: 'AI_MOVE',
  AI_SET_DIFFICULTY: 'AI_SET_DIFFICULTY',
  AI_RESET: 'AI_RESET',

  MM_START: 'MM_START',
  MM_TICKET: 'MM_TICKET',
  MM_UPDATE: 'MM_UPDATE',
  MM_ERROR: 'MM_ERROR',
  MM_CANCEL: 'MM_CANCEL',

  RT_LOAD_START: 'RT_LOAD_START',
  RT_LOAD_SUCCESS: 'RT_LOAD_SUCCESS',
  RT_LOAD_ERROR: 'RT_LOAD_ERROR',
  RT_APPLY_MOVE: 'RT_APPLY_MOVE'
};

const initialGamesState = {
  ai: {
    difficulty: 'beginner',
    history: [], // array of SAN-like strings or simple uci e2e4
    turn: 'w', // 'w' or 'b'
    fen: 'start', // simplified; 'start' means starting position
    result: null, // '1-0', '0-1', '1/2-1/2', or null
  },
  matchmaking: {
    loading: false,
    ticket: null,
    foundGameId: null,
    error: null,
    eta: null,
  },
  realtime: {
    loading: false,
    error: null,
    game: null, // { id, fen, moves, players, status }
  }
};

// PUBLIC_INTERFACE
export function gamesReducer(state, action) {
  switch (action.type) {
    case ACTIONS.AI_SET_DIFFICULTY:
      return { ...state, ai: { ...state.ai, difficulty: action.payload } };
    case ACTIONS.AI_NEW:
      return { ...state, ai: { ...initialGamesState.ai, difficulty: state.ai.difficulty } };
    case ACTIONS.AI_MOVE:
      return { ...state, ai: { ...state.ai, ...action.payload } };
    case ACTIONS.AI_RESET:
      return { ...state, ai: { ...initialGamesState.ai } };

    case ACTIONS.MM_START:
      return { ...state, matchmaking: { loading: true, ticket: null, foundGameId: null, error: null, eta: null } };
    case ACTIONS.MM_TICKET:
      return { ...state, matchmaking: { ...state.matchmaking, loading: false, ticket: action.payload, eta: action.payload?.estimatedWait || null } };
    case ACTIONS.MM_UPDATE:
      return { ...state, matchmaking: { ...state.matchmaking, foundGameId: action.payload?.gameId || null, eta: action.payload?.estimatedWait || state.matchmaking.eta } };
    case ACTIONS.MM_ERROR:
      return { ...state, matchmaking: { ...state.matchmaking, loading: false, error: action.payload } };
    case ACTIONS.MM_CANCEL:
      return { ...state, matchmaking: { loading: false, ticket: null, foundGameId: null, error: null, eta: null } };

    case ACTIONS.RT_LOAD_START:
      return { ...state, realtime: { loading: true, error: null, game: null } };
    case ACTIONS.RT_LOAD_SUCCESS:
      return { ...state, realtime: { loading: false, error: null, game: action.payload } };
    case ACTIONS.RT_LOAD_ERROR:
      return { ...state, realtime: { loading: false, error: action.payload, game: null } };
    case ACTIONS.RT_APPLY_MOVE:
      return { ...state, realtime: { ...state.realtime, game: { ...(state.realtime.game || {}), moves: [ ...(state.realtime.game?.moves || []), action.payload ] } } };
    default:
      return state;
  }
}

const GamesContext = createContext({ state: initialGamesState, actions: {} });

// Simple move validator for pawns, rooks, bishops, knights, queen, king with very basic rules.
// This is intentionally simplified; for production use chess.js.
function basicMoveValidator(from, to, board, turn) {
  // board: 8x8 array with pieces like 'wp','bp','wr','wq', etc., empty = null
  // from/to: {r,c} 0-7
  if (!from || !to) return false;
  const piece = board[from.r][from.c];
  if (!piece) return false;
  if (piece[0] !== (turn === 'w' ? 'w' : 'b')) return false;
  const target = board[to.r][to.c];
  const color = piece[0];
  const type = piece[1]; // p r n b q k

  const dr = to.r - from.r;
  const dc = to.c - from.c;

  const pathClear = (stepR, stepC) => {
    let r = from.r + stepR, c = from.c + stepC;
    while (r !== to.r || c !== to.c) {
      if (board[r][c]) return false;
      r += stepR; c += stepC;
    }
    return true;
  };

  // cannot capture own piece
  if (target && target[0] === color) return false;

  switch (type) {
    case 'p': {
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      // forward move
      if (dc === 0) {
        if (dr === dir && !target) return true;
        if (from.r === startRow && dr === 2 * dir && !target && !board[from.r + dir][from.c]) return true;
      }
      // capture
      if (Math.abs(dc) === 1 && dr === dir && target && target[0] !== color) return true;
      return false;
    }
    case 'r': {
      if (dr !== 0 && dc !== 0) return false;
      const stepR = dr === 0 ? 0 : (dr > 0 ? 1 : -1);
      const stepC = dc === 0 ? 0 : (dc > 0 ? 1 : -1);
      return pathClear(stepR, stepC);
    }
    case 'b': {
      if (Math.abs(dr) !== Math.abs(dc)) return false;
      const stepR = dr > 0 ? 1 : -1;
      const stepC = dc > 0 ? 1 : -1;
      return pathClear(stepR, stepC);
    }
    case 'q': {
      if (dr === 0 || dc === 0) {
        const stepR = dr === 0 ? 0 : (dr > 0 ? 1 : -1);
        const stepC = dc === 0 ? 0 : (dc > 0 ? 1 : -1);
        return pathClear(stepR, stepC);
      }
      if (Math.abs(dr) === Math.abs(dc)) {
        const stepR = dr > 0 ? 1 : -1;
        const stepC = dc > 0 ? 1 : -1;
        return pathClear(stepR, stepC);
      }
      return false;
    }
    case 'n': {
      const combos = [
        { r: -2, c: -1 }, { r: -2, c: 1 },
        { r: 2, c: -1 }, { r: 2, c: 1 },
        { r: -1, c: -2 }, { r: -1, c: 2 },
        { r: 1, c: -2 }, { r: 1, c: 2 }
      ];
      return combos.some(({ r, c }) => r === dr && c === dc);
    }
    case 'k': {
      return Math.max(Math.abs(dr), Math.abs(dc)) === 1;
    }
    default:
      return false;
  }
}

// Creates initial board array
function createStartBoard() {
  const empty = Array.from({ length: 8 }, () => Array(8).fill(null));
  const back = ['r','n','b','q','k','b','n','r'];
  const board = empty.map(row => row.slice());
  // black at top
  board[0] = back.map(t => 'b' + t);
  board[1] = Array(8).fill('bp');
  board[6] = Array(8).fill('wp');
  board[7] = back.map(t => 'w' + t);
  return board;
}

// PUBLIC_INTERFACE
export function GamesProvider({ children }) {
  const [state, dispatch] = useReducer(gamesReducer, initialGamesState);

  const actions = useMemo(() => ({
    // PUBLIC_INTERFACE
    setAiDifficulty: (level) => dispatch({ type: ACTIONS.AI_SET_DIFFICULTY, payload: level }),
    // PUBLIC_INTERFACE
    newAiGame: () => dispatch({ type: ACTIONS.AI_NEW }),
    // PUBLIC_INTERFACE
    makeAiMove: ({ from, to }) => {
      // maintain a local board from history; for simplicity rebuild each time
      const moves = state.ai.history;
      let board = createStartBoard();
      let turn = 'w';
      const toIdx = (algebraic) => {
        const file = algebraic[0].charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = 8 - parseInt(algebraic[1], 10);
        return { r: rank, c: file };
      };
      // Apply moves as uci-like e2e4
      for (const m of moves) {
        const f = toIdx(m.slice(0,2));
        const t = toIdx(m.slice(2,4));
        board[t.r][t.c] = board[f.r][f.c];
        board[f.r][f.c] = null;
        turn = turn === 'w' ? 'b' : 'w';
      }

      // Validate player move
      const ff = typeof from === 'string' ? toIdx(from) : from;
      const tt = typeof to === 'string' ? toIdx(to) : to;
      if (!basicMoveValidator(ff, tt, board, turn)) {
        // no state change
        return false;
      }
      // apply player move
      board[tt.r][tt.c] = board[ff.r][ff.c];
      board[ff.r][ff.c] = null;
      const playerMove = `${String.fromCharCode('a'.charCodeAt(0)+ff.c)}${8-ff.r}${String.fromCharCode('a'.charCodeAt(0)+tt.c)}${8-tt.r}`;
      const newHistory = [...moves, playerMove];
      turn = turn === 'w' ? 'b' : 'w';

      // Very simple AI reply: pick first legal move found for side to move (randomized a bit per difficulty)
      const collectMoves = (side) => {
        const list = [];
        for (let r=0;r<8;r++){
          for (let c=0;c<8;c++){
            const piece = board[r][c];
            if (!piece || piece[0] !== side) continue;
            for (let rr=0; rr<8; rr++){
              for (let cc=0; cc<8; cc++){
                if ((r===rr && c===cc)) continue;
                if (basicMoveValidator({r,c},{r:rr,c:cc},board,side==='w'?'w':'b')) {
                  list.push({ from:{r,c}, to:{r:rr,c:cc} });
                }
              }
            }
          }
        }
        return list;
      };
      const side = turn;
      const candidates = collectMoves(side);
      if (candidates.length > 0) {
        let pickIdx = 0;
        if (state.ai.difficulty === 'intermediate') {
          pickIdx = Math.min(candidates.length - 1, Math.floor(Math.random() * Math.min(5, candidates.length)));
        } else if (state.ai.difficulty === 'advanced') {
          pickIdx = Math.floor(Math.random() * candidates.length);
        }
        const pick = candidates[pickIdx];
        // apply AI move
        board[pick.to.r][pick.to.c] = board[pick.from.r][pick.from.c];
        board[pick.from.r][pick.from.c] = null;
        const aiMove = `${String.fromCharCode('a'.charCodeAt(0)+pick.from.c)}${8-pick.from.r}${String.fromCharCode('a'.charCodeAt(0)+pick.to.c)}${8-pick.to.r}`;
        newHistory.push(aiMove);
        turn = side === 'w' ? 'b' : 'w';
      }
      dispatch({ type: ACTIONS.AI_MOVE, payload: { history: newHistory, turn } });
      return true;
    },

    // Matchmaking
    // PUBLIC_INTERFACE
    startMatchmaking: async (prefs = {}) => {
      dispatch({ type: ACTIONS.MM_START });
      try {
        const ticket = await GamesApi.requestMatchmaking(prefs);
        dispatch({ type: ACTIONS.MM_TICKET, payload: ticket });
        return ticket;
      } catch (e) {
        dispatch({ type: ACTIONS.MM_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    pollMatchmaking: async () => {
      const ticketId = state.matchmaking.ticket?.ticketId;
      if (!ticketId) return null;
      try {
        const update = await GamesApi.pollMatchmaking(ticketId);
        if (update.found) {
          dispatch({ type: ACTIONS.MM_UPDATE, payload: { gameId: update.gameId } });
        } else {
          dispatch({ type: ACTIONS.MM_UPDATE, payload: { estimatedWait: update.estimatedWait } });
        }
        return update;
      } catch (e) {
        dispatch({ type: ACTIONS.MM_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    cancelMatchmaking: async () => {
      const ticketId = state.matchmaking.ticket?.ticketId;
      if (!ticketId) {
        dispatch({ type: ACTIONS.MM_CANCEL });
        return;
      }
      try {
        await GamesApi.cancelMatchmaking(ticketId);
      } finally {
        dispatch({ type: ACTIONS.MM_CANCEL });
      }
    },

    // Realtime
    // PUBLIC_INTERFACE
    loadRealtimeGame: async (gameId) => {
      dispatch({ type: ACTIONS.RT_LOAD_START });
      try {
        const game = await GamesApi.getGameState(gameId);
        dispatch({ type: ACTIONS.RT_LOAD_SUCCESS, payload: game });
        return game;
      } catch (e) {
        dispatch({ type: ACTIONS.RT_LOAD_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    applyRealtimeMove: (move) => {
      dispatch({ type: ACTIONS.RT_APPLY_MOVE, payload: move });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state.matchmaking.ticket, state.ai.difficulty, state.ai.history]);

  return (
    <GamesContext.Provider value={{ state, actions }}>
      {children}
    </GamesContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useGames() {
  /** Hook to access games state and actions */
  return useContext(GamesContext);
}
