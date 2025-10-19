import React, { useEffect, useMemo, useState } from 'react';
import { ROUTES } from '../../config/routes';
import { Link } from 'react-router-dom';
import {
  createInitialState,
  toAlgebraic,
  getLegalMoves,
  makeMove,
  generateMoves,
  isCheck,
  aiChooseMove,
} from '../../utils/chessEngine';
import Board from '../../components/chess/Board';
import MoveList from '../../components/chess/MoveList';
import HintPanel from '../../components/chess/HintPanel';
import Timer from '../../components/chess/Timer';

// PUBLIC_INTERFACE
export default function PlayAI() {
  /**
   * Play vs AI practice mode with:
   * - Chessboard with move validation and keyboard support.
   * - Move list, hint panel, and simple dual timers.
   * - AI difficulty selector (beginner, intermediate, advanced).
   */
  const [state, setState] = useState(() => createInitialState());
  const [selected, setSelected] = useState(null); // [r,c]
  const [legalTargets, setLegalTargets] = useState([]); // list of [r,c]
  const [lastMove, setLastMove] = useState(null);
  const [busy, setBusy] = useState(false);
  const [difficulty, setDifficulty] = useState('beginner');
  const [result, setResult] = useState(null); // "checkmate", "stalemate", etc.

  const board = state.board;
  const turn = state.turn;

  const isGameOver = useMemo(() => {
    const color = turn;
    const noMoves = generateMoves(state).length === 0;
    if (noMoves) {
      if (isCheck(state, color)) return 'checkmate';
      return 'stalemate';
    }
    return null;
  }, [state, turn]);

  useEffect(() => {
    if (isGameOver && !result) {
      setResult(isGameOver);
    }
  }, [isGameOver, result]);

  // If it's AI's turn (we play as White by default), let AI move
  useEffect(() => {
    let cancelled = false;
    async function moveAI() {
      if (result) return;
      if (turn === 'b') {
        setBusy(true);
        // emulate thinking latency based on difficulty
        const latency = difficulty === 'advanced' ? 350 : difficulty === 'intermediate' ? 250 : 150;
        await new Promise(r => setTimeout(r, latency));
        const mv = aiChooseMove(state, difficulty);
        if (!cancelled && mv) {
          const ns = makeMove(state, mv);
          setState(ns);
          setLastMove(mv);
          setSelected(null);
          setLegalTargets([]);
        }
        setBusy(false);
      }
    }
    moveAI();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, turn, difficulty, result]);

  function resetGame() {
    setState(createInitialState());
    setSelected(null);
    setLegalTargets([]);
    setLastMove(null);
    setResult(null);
  }

  function pieceColorForTurn(p) {
    if (!p) return null;
    return p === p.toUpperCase() ? 'w' : 'b';
  }

  function onSquareClick(r, c) {
    if (result) return;
    if (busy) return;
    const piece = board[r][c];
    if (selected) {
      // Try move to this square if it's legal
      const legal = legalTargets.find(([rr,cc]) => rr === r && cc === c);
      if (legal) {
        const from = selected;
        const all = getLegalMoves(state, from);
        const move = all.find(m => m.to[0] === r && m.to[1] === c);
        if (move) {
          const ns = makeMove(state, move);
          setState(ns);
          setLastMove(move);
          setSelected(null);
          setLegalTargets([]);
        }
      } else {
        // Change selection if clicking a same-color piece
        if (piece && pieceColorForTurn(piece) === turn) {
          setSelected([r,c]);
          const moves = getLegalMoves(state, [r,c]).map(m => m.to);
          setLegalTargets(moves);
        } else {
          setSelected(null);
          setLegalTargets([]);
        }
      }
    } else {
      // Select if it is player's turn and piece belongs to player (white)
      if (piece && pieceColorForTurn(piece) === 'w' && turn === 'w') {
        setSelected([r,c]);
        const moves = getLegalMoves(state, [r,c]).map(m => m.to);
        setLegalTargets(moves);
      }
    }
  }

  function onKeyDownSquare(e, r, c) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSquareClick(r, c);
      return;
    }
    // Arrow key navigation across grid
    let nr = r, nc = c;
    if (e.key === 'ArrowUp') nr = Math.max(0, r - 1);
    if (e.key === 'ArrowDown') nr = Math.min(7, r + 1);
    if (e.key === 'ArrowLeft') nc = Math.max(0, c - 1);
    if (e.key === 'ArrowRight') nc = Math.min(7, c + 1);
    if (nr !== r || nc !== c) {
      e.preventDefault();
      const selector = `[data-coords="${toAlgebraic(nr, nc)}"]`;
      const el = document.querySelector(selector);
      if (el) el.focus();
    }
  }

  async function requestHint() {
    if (busy || result) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 100));
    // Temporarily let AI suggest for White by flipping state.turn to 'w' before choosing
    const suggestState = { ...state, turn: 'w' };
    const mv = aiChooseMove(suggestState, difficulty);
    setBusy(false);
    if (mv) {
      // Highlight hint target squares for a moment by selecting the from square
      setSelected(mv.from);
      setLegalTargets([mv.to]);
      // Auto-clear after 2 seconds
      setTimeout(() => {
        setSelected(null);
        setLegalTargets([]);
      }, 2000);
    }
  }

  function onTimeout(side) {
    if (result) return;
    setResult(`${side} time out`);
  }

  return (
    <div className="page">
      <nav aria-label="Breadcrumb" style={{ marginBottom: 8 }}>
        <Link to={ROUTES.PRACTICE}>&larr; Practice</Link>
      </nav>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <h1 style={{ margin: 0 }}>Play vs AI</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label htmlFor="difficulty">Difficulty</label>
          <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)} aria-label="Choose AI difficulty">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button className="btn" onClick={resetGame}>New Game</button>
        </div>
      </header>

      <section className="practice-ai-grid" style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div>
          <Board
            board={board}
            selected={selected}
            legalTargets={legalTargets}
            lastMove={lastMove}
            turn={turn}
            onSquareClick={onSquareClick}
            onSquareKeyDown={onKeyDownSquare}
          />

          <div className="practice-ai-controls" style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Timer label="White" running={!result && turn === 'w'} onTimeout={() => onTimeout('White')} />
            <Timer label="Black" running={!result && turn === 'b'} onTimeout={() => onTimeout('Black')} />
            <div aria-live="polite" style={{ marginLeft: 'auto' }}>
              {result ? <strong>Result: {result}</strong> : isCheck(state, turn) ? 'Check!' : `Turn: ${turn === 'w' ? 'White' : 'Black'}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <MoveList history={state.history || []} />
          <HintPanel onHint={requestHint} disabled={busy || !!result || turn !== 'w'} difficulty={difficulty} />
          <div role="note" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Tips: Click or use arrow keys to navigate squares, press Enter/Space to select and move. You play as White.
          </div>
        </div>
      </section>

      {/* Responsive stack for small screens */}
      <style>{`
        @media (max-width: 900px) {
          .practice-ai-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
