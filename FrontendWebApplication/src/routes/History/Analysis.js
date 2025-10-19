import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { parsePGN, summarizeGame } from '../../utils/pgn';

// PUBLIC_INTERFACE
export default function Analysis() {
  /** Basic post-game analysis placeholder with summary and mock hints. */
  const { gameId } = useParams();

  const MOCK_GAMES = {
    g1: `[Event "Practice vs AI"][Site "Local"][Date "2025.01.04"][White "You"][Black "AI (Beginner)"][Result "1-0"] 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 1-0`,
    g2: `[Event "Realtime"][Site "Local"][Date "2025.01.06"][White "You"][Black "Guest123"][Result "0-1"] 1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 0-1`,
    g3: `[Event "Imported Game"][Site "Local"][Date "2025.01.08"][White "You"][Black "Stockfish"][Result "1/2-1/2"] 1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 1/2-1/2`,
  };
  const pgn = MOCK_GAMES[gameId];
  const parsed = React.useMemo(() => (pgn ? parsePGN(pgn) : { headers: {}, moves: [], result: '*' }), [pgn]);
  const summary = React.useMemo(() => (pgn ? summarizeGame(pgn) : null), [pgn]);

  // Simple hint placeholders derived from naive patterns
  const hints = React.useMemo(() => {
    const hs = [];
    const totalMoves = parsed.moves.length;
    if (totalMoves < 8) hs.push('Consider exploring more opening principles to develop quickly.');
    if ((summary?.result || '*') === '0-1') hs.push('Review defenses against d4 to improve handling of Queen’s Gambit structures.');
    if ((summary?.result || '*') === '1-0') hs.push('Great job! Look for missed tactics to convert advantages faster.');
    if ((summary?.result || '*') === '1/2-1/2') hs.push('Drawn game—study endgame techniques to press small edges.');
    if (hs.length === 0) hs.push('Balanced game. Review critical moments around move 10-15.');
    return hs;
  }, [parsed, summary]);

  if (!pgn) {
    return (
      <div className="page">
        <h1>Post-game Analysis</h1>
        <p>Game not found.</p>
        <Link className="btn" to={ROUTES.HISTORY}>Back to History</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <nav aria-label="Breadcrumb" style={{ marginBottom: 8 }}>
        <Link to={ROUTES.HISTORY}>&larr; History</Link>
      </nav>

      <header>
        <h1 style={{ marginBottom: 4 }}>Post-game Analysis</h1>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {summary?.white} vs {summary?.black} • {summary?.event} • {summary?.date} • Result: <strong>{summary?.result}</strong>
        </div>
      </header>

      <section style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Summary</h2>
          <ul style={{ marginTop: 8 }}>
            <li>Total moves: {parsed.moves.length}</li>
            <li>Opening phase: {parsed.moves.length < 10 ? 'Short' : parsed.moves.length < 20 ? 'Moderate' : 'Extended'}</li>
            <li>Outcome: {summary?.result}</li>
          </ul>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Hints for Improvement</h2>
          <ol style={{ marginTop: 8 }}>
            {hints.map((h, idx) => <li key={idx} style={{ marginBottom: 6 }}>{h}</li>)}
          </ol>
          <div role="note" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            These hints are placeholders. A future version will use an engine to analyze positions and annotate mistakes.
          </div>
        </div>
      </section>
    </div>
  );
}
