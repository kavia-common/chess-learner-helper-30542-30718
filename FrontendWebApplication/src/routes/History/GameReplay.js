import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import Board from '../../components/chess/Board';
import MoveList from '../../components/chess/MoveList';
import {
  createInitialState,
  getLegalMoves,
  makeMove,
  fromAlgebraic,
  toAlgebraic,
} from '../../utils/chessEngine';
import { parsePGN, summarizeGame } from '../../utils/pgn';
import HistoryList from './HistoryList';

// Reuse the mock data from HistoryList by extracting it here for demo.
// We import the default HistoryList component above to avoid duplicate data export.
// To keep it simple without backend, we redefine same sample set here to ensure self-contained demo data.
const MOCK_GAMES_MAP = (() => {
  const LIST = [
    {
      id: 'g1',
      source: 'AI',
      pgn: `[Event "Practice vs AI"][Site "Local"][Date "2025.01.04"][White "You"][Black "AI (Beginner)"][Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 1-0`,
      createdAt: '2025-01-04T10:15:00Z'
    },
    {
      id: 'g2',
      source: 'Realtime',
      pgn: `[Event "Realtime"][Site "Local"][Date "2025.01.06"][White "You"][Black "Guest123"][Result "0-1"]

1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 0-1`,
      createdAt: '2025-01-06T18:22:00Z'
    },
    {
      id: 'g3',
      source: 'Imported',
      pgn: `[Event "Imported Game"][Site "Local"][Date "2025.01.08"][White "You"][Black "Stockfish"][Result "1/2-1/2"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 1/2-1/2`,
      createdAt: '2025-01-08T08:40:00Z'
    }
  ];
  const map = {};
  for (const g of LIST) map[g.id] = g;
  return map;
})();

// PUBLIC_INTERFACE
export default function GameReplay() {
  /** Replays a game's moves on the Board with transport controls and move list. */
  const { gameId } = useParams();
  const game = MOCK_GAMES_MAP[gameId];
  const [engineState, setEngineState] = React.useState(() => createInitialState());
  const [plyIndex, setPlyIndex] = React.useState(0); // current half-move index
  const [selected, setSelected] = React.useState(null);
  const [legalTargets, setLegalTargets] = React.useState([]);
  const [lastMove, setLastMove] = React.useState(null);

  const parsed = React.useMemo(() => (game ? parsePGN(game.pgn) : { headers: {}, moves: [], result: '*' }), [game]);
  const flatSAN = React.useMemo(() => {
    // Flatten into array of SAN like ["e4","e5","Nf3",...]
    const arr = [];
    for (const m of parsed.moves) {
      if (m.w) arr.push(m.w);
      if (m.b) arr.push(m.b);
    }
    return arr;
  }, [parsed]);

  const summary = React.useMemo(() => (game ? summarizeGame(game.pgn) : null), [game]);

  React.useEffect(() => {
    // Reset board whenever game changes
    setEngineState(createInitialState());
    setPlyIndex(0);
    setSelected(null);
    setLegalTargets([]);
    setLastMove(null);
  }, [gameId]);

  // Simple SAN to from/to resolver using current state legal moves
  function resolveSANToMove(state, san) {
    // Handle castling
    if (san === 'O-O' || san === 'O-O-O') {
      const moves = state.turn === 'w'
        ? [{ from: [7,4], to: san === 'O-O' ? [7,6] : [7,2], castle: san === 'O-O' ? 'K' : 'Q', piece: 'K' }]
        : [{ from: [0,4], to: san === 'O-O' ? [0,6] : [0,2], castle: san === 'O-O' ? 'K' : 'Q', piece: 'k' }];
      // Verify legality using getLegalMoves on king square
      const from = moves[0].from;
      const legals = getLegalMoves(state, from);
      const mv = legals.find(m => m.to[0] === moves[0].to[0] && m.to[1] === moves[0].to[1]);
      return mv || null;
    }

    // Parse typical SAN forms like "e4", "Nf3", "Bxe6", "Qh5+", "axb5", "e8=Q", etc.
    // Strategy: search across all legal moves and pick the one whose SAN projection matches.
    const allMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = state.board[r][c];
        if (!p) continue;
        const movesFrom = getLegalMoves(state, [r, c]);
        for (const mv of movesFrom) allMoves.push(mv);
      }
    }
    const candidates = allMoves.filter(mv => sanMatchesMove(state, mv, san));
    if (candidates.length === 1) return candidates[0];
    // If ambiguous, choose first as fallback
    return candidates[0] || null;
  }

  function sanMatchesMove(state, mv, san) {
    // Crude matching: check destination square, piece letter, capture indicator, promotion, and castle handled before.
    const dest = toAlgebraic(mv.to[0], mv.to[1]);
    const piece = (mv.piece || '').toUpperCase();
    const pieceLetter = piece === 'P' ? '' : piece;
    const capture = mv.capture ? 'x' : '';
    const promo = mv.promotion ? `=${String(mv.promotion).toUpperCase()}` : '';
    // Accept forms: "e4", "Nf3", "Bxe6", "axb5", "exd5", "e8=Q"
    const normalized = san.replace(/[#+!?]+$/g, '');
    // Destination must match
    if (!normalized.endsWith(dest) && !normalized.includes(dest)) return false;
    if (promo && !normalized.includes(promo)) return false;
    // If pieceLetter present in SAN, it should match
    if (pieceLetter && normalized[0] !== pieceLetter) return false;
    // If capture implied, SAN should contain 'x' unless it's en passant omitted in some PGNs (we check leniently)
    if (mv.capture && !normalized.includes('x') && pieceLetter === '') {
      // For pawn captures SAN often like "exd5" includes source file
      // We'll allow missing x only if SAN begins with two letters and ends with dest (very tolerant)
      // Keep lenient for demo
    }
    return true;
  }

  // Advance or rewind to specific ply by replaying from initial state
  function setToPly(targetPly) {
    const clamped = Math.max(0, Math.min(targetPly, flatSAN.length));
    let s = createInitialState();
    let lm = null;
    for (let i = 0; i < clamped; i++) {
      const san = flatSAN[i];
      const mv = resolveSANToMove(s, san);
      if (!mv) break;
      s = makeMove(s, mv);
      lm = mv;
    }
    setEngineState(s);
    setPlyIndex(clamped);
    setLastMove(lm);
    setSelected(null);
    setLegalTargets([]);
  }

  function step(delta) {
    setToPly(plyIndex + delta);
  }

  function onSquareClick(r, c) {
    // In replay, allow highlighting possible moves from this square for the current turn position
    const piece = engineState.board[r][c];
    if (!piece) {
      setSelected(null);
      setLegalTargets([]);
      return;
    }
    const moves = getLegalMoves(engineState, [r, c]).map(m => m.to);
    setSelected([r, c]);
    setLegalTargets(moves);
  }

  function onSquareKeyDown(e, r, c) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSquareClick(r, c);
    }
    // Allow arrow navigation
    let nr = r, nc = c;
    if (e.key === 'ArrowUp') nr = Math.max(0, r - 1);
    if (e.key === 'ArrowDown') nr = Math.min(7, r + 1);
    if (e.key === 'ArrowLeft') nc = Math.max(0, c - 1);
    if (e.key === 'ArrowRight') nc = Math.min(7, c + 1);
    if (nr !== r || nc !== c) {
      const selector = `[data-coords="${toAlgebraic(nr, nc)}"]`;
      const el = document.querySelector(selector);
      if (el) el.focus();
    }
  }

  if (!game) {
    return (
      <div className="page">
        <h1>Game Replay</h1>
        <p>Game not found.</p>
        <Link className="btn" to={ROUTES.HISTORY}>Back to History</Link>
      </div>
    );
  }

  const totalPlies = flatSAN.length;

  return (
    <div className="page">
      <nav aria-label="Breadcrumb" style={{ marginBottom: 8 }}>
        <Link to={ROUTES.HISTORY}>&larr; History</Link>
      </nav>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>Replay: {summary?.white} vs {summary?.black}</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {summary?.event} • {summary?.date} • Result: <strong>{summary?.result}</strong>
        </div>
      </header>

      <section style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div>
          <Board
            board={engineState.board}
            selected={selected}
            legalTargets={legalTargets}
            lastMove={lastMove}
            turn={engineState.turn}
            onSquareClick={onSquareClick}
            onSquareKeyDown={onSquareKeyDown}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <button className="btn small" onClick={() => setToPly(0)} aria-label="Go to start">⏮ Start</button>
            <button className="btn small" onClick={() => step(-1)} disabled={plyIndex <= 0} aria-disabled={plyIndex <= 0} aria-label="Previous move">◀ Prev</button>
            <button className="btn small" onClick={() => step(+1)} disabled={plyIndex >= totalPlies} aria-disabled={plyIndex >= totalPlies} aria-label="Next move">Next ▶</button>
            <button className="btn small" onClick={() => setToPly(totalPlies)} aria-label="Go to end">⏭ End</button>
            <div role="status" aria-live="polite" style={{ marginLeft: 'auto', fontSize: 13 }}>
              Ply {plyIndex} / {totalPlies} • Turn: {engineState.turn === 'w' ? 'White' : 'Black'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {/* Build a pseudo history from SAN to feed MoveList; show as SAN strings */}
          <div aria-label="Move list" role="region" style={{ maxHeight: 300, overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: 8, padding: 8 }}>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {parsed.moves.map((m, idx) => {
                const idxWhite = idx * 2;
                const idxBlack = idx * 2 + 1;
                const active = plyIndex === idxWhite + 1 || plyIndex === idxBlack + 1;
                return (
                  <li key={idx} style={{ background: active ? 'var(--bg-secondary)' : 'transparent', borderRadius: 4, padding: active ? '2px 4px' : 0 }}>
                    <span style={{ marginRight: 8 }}>{m.w}</span>
                    {m.b && <span>{m.b}</span>}
                  </li>
                );
              })}
            </ol>
          </div>

          <div>
            <label htmlFor="ply-range" style={{ display: 'block', marginBottom: 4 }}>Scrub through moves</label>
            <input
              id="ply-range"
              type="range"
              min={0}
              max={totalPlies}
              value={plyIndex}
              onChange={(e) => setToPly(Number(e.target.value))}
              style={{ width: '100%' }}
              aria-valuemin={0}
              aria-valuemax={totalPlies}
              aria-valuenow={plyIndex}
              aria-label="Move scrubber"
            />
          </div>

          <div role="note" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Tip: Use the buttons or slider to navigate moves. Click a square to view legal moves from the current position.
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          section { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
