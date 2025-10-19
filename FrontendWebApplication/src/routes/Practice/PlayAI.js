import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ROUTES } from '../../config/routes';
import { Link } from 'react-router-dom';
import {
  createInitialState,
  toAlgebraic,
  fromAlgebraic,
  getLegalMoves,
  makeMove,
  generateMoves,
  isCheck,
  isCheckmate,
  isStalemate,
  aiChooseMove,
} from '../../utils/chessEngine';

// Square component for a single board cell
function Square({ isDark, piece, focused, selectable, onClick, onKeyDown, coords, isLastMove, isLegalTarget }) {
  const bg = isDark ? 'var(--bg-secondary)' : 'var(--bg-primary)';
  const border = focused ? '2px solid var(--button-bg)' : '1px solid var(--border-color)';
  const outline = isLastMove ? '2px solid #7bb0ff' : 'none';
  const highlight = isLegalTarget ? 'inset 0 0 0 3px rgba(43,134,255,0.4)' : 'none';

  const label = piece ? `${pieceLabel(piece)} on ${coords}` : `Empty ${coords}`;

  return (
    <button
      aria-label={label + (selectable ? ' selectable' : '')}
      role="gridcell"
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        background: bg,
        color: 'var(--text-primary)',
        border,
        outline,
        position: 'relative',
        cursor: 'pointer'
      }}
      data-coords={coords}
    >
      {piece && (
        <span style={{ fontSize: 'min(5.2vw, 36px)' }} aria-hidden="true">
          {unicodePiece(piece)}
        </span>
      )}
      {isLegalTarget && (
        <span aria-hidden="true" style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 6,
          boxShadow: highlight
        }} />
      )}
    </button>
  );
}

function unicodePiece(p) {
  const map = {
    'K':'♔','Q':'♕','R':'♖','B':'♗','N':'♘','P':'♙',
    'k':'♚','q':'♛','r':'♜','b':'♝','n':'♞','p':'♟︎'
  };
  return map[p] || '·';
}
function pieceLabel(p) {
  const m = { K:'White King', Q:'White Queen', R:'White Rook', B:'White Bishop', N:'White Knight', P:'White Pawn',
              k:'Black King', q:'Black Queen', r:'Black Rook', b:'Black Bishop', n:'Black Knight', p:'Black Pawn' };
  return m[p] || 'Piece';
}

// Move list component
function MoveList({ history }) {
  return (
    <div aria-label="Move list" role="region" style={{ maxHeight: 220, overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: 8, padding: 8 }}>
      <ol style={{ margin: 0, paddingLeft: 18 }}>
        {history.map((m, idx) => {
          const san = formatMoveSAN(m);
          return <li key={`${m.from.join(',')}-${m.to.join(',')}-${idx}`}>{san}</li>;
        })}
      </ol>
    </div>
  );
}
function formatMoveSAN(m) {
  const from = toAlgebraic(m.from[0], m.from[1]);
  const to = toAlgebraic(m.to[0], m.to[1]);
  const cap = m.capture ? 'x' : '-';
  const promo = m.promotion ? `=${String(m.promotion).toUpperCase()}` : '';
  const castle = m.castle ? (m.castle === 'K' ? 'O-O' : 'O-O-O') : '';
  if (castle) return castle;
  return `${m.piece?.toUpperCase() === 'P' ? '' : m.piece?.toUpperCase() || ''}${from}${cap}${to}${promo}`;
}

// Hint panel component
function HintPanel({ onHint, disabled, difficulty }) {
  return (
    <div role="region" aria-label="Hints" style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 8 }}>
      <div style={{ marginBottom: 6, fontWeight: 600 }}>Hints</div>
      <p style={{ marginTop: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
        Get a suggestion for your next move. Hints consider current difficulty.
      </p>
      <button className="btn small" onClick={onHint} disabled={disabled} aria-busy={disabled}>
        {disabled ? 'Thinking…' : `Get hint (${difficulty})`}
      </button>
    </div>
  );
}

// Simple timer component for each side
function Timer({ running, initial = 5 * 60, onTimeout, label }) {
  const [secs, setSecs] = useState(initial);
  const prevRunning = useRef(running);

  useEffect(() => {
    let id;
    if (running) {
      id = setInterval(() => {
        setSecs((s) => {
          if (s <= 1) {
            clearInterval(id);
            onTimeout?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(id);
  }, [running, onTimeout]);

  useEffect(() => {
    // reset when toggled from false to true after a complete game reset could be handled externally if needed
    prevRunning.current = running;
  }, [running]);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <div aria-live="polite" aria-label={`${label} timer`} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {label}: {mm}:{ss}
    </div>
  );
}

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
        // small delay to emulate thinking
        await new Promise(r => setTimeout(r, 200));
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

  function onSquareClick(r, c) {
    if (result) return;
    if (busy) return;
    const piece = board[r][c];
    if (selected) {
      // Try move to this square if it's legal
      const legal = legalTargets.find(([rr,cc]) => rr === r && cc === c);
      if (legal) {
        const from = selected;
        const fromPiece = board[from[0]][from[1]];
        const all = getLegalMoves(state, from);
        const move = all.find(m => m.to[0] === r && m.to[1] === c);
        if (move && ((turn === 'w' && fromPiece && fromPiece === board[from[0]][from[1]]) || true)) {
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

  function pieceColorForTurn(p) {
    if (!p) return null;
    return p === p.toUpperCase() ? 'w' : 'b';
  }

  function onKeyDownSquare(e, r, c) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSquareClick(r, c);
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

  const lastMoveSquares = useMemo(() => {
    if (!lastMove) return new Set();
    const a = toAlgebraic(lastMove.from[0], lastMove.from[1]);
    const b = toAlgebraic(lastMove.to[0], lastMove.to[1]);
    return new Set([a,b]);
  }, [lastMove]);

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

      <section style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div>
          <div role="grid" aria-label="Chess board" style={{
            width: '100%',
            maxWidth: 520,
            aspectRatio: '1 / 1',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridTemplateRows: 'repeat(8, 1fr)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            overflow: 'hidden'
          }}>
            {board.map((row, r) => row.map((piece, c) => {
              const dark = (r + c) % 2 === 1;
              const coords = toAlgebraic(r, c);
              const isLast = lastMoveSquares.has(coords);
              const isLegalT = legalTargets.some(([rr,cc]) => rr === r && cc === c);
              const isFocused = selected && selected[0] === r && selected[1] === c;
              return (
                <Square
                  key={coords}
                  isDark={dark}
                  piece={piece}
                  focused={isFocused}
                  selectable={piece && pieceColorForTurn(piece) === turn}
                  onClick={() => onSquareClick(r, c)}
                  onKeyDown={(e) => onKeyDownSquare(e, r, c)}
                  coords={coords}
                  isLastMove={isLast}
                  isLegalTarget={isLegalT}
                />
              );
            }))}
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
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
          section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
