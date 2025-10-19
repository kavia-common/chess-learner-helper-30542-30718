import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { summarizeGame } from '../../utils/pgn';

// Mock-safe history entries (works without backend)
const MOCK_GAMES = [
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

// PUBLIC_INTERFACE
export default function HistoryList() {
  /** Lists past games with filters and links to replay/analysis. */
  const [games] = React.useState(MOCK_GAMES);
  const [text, setText] = React.useState('');
  const [result, setResult] = React.useState('all'); // 'all'|'1-0'|'0-1'|'1/2-1/2'
  const [source, setSource] = React.useState('all'); // 'all'|'AI'|'Realtime'|'Imported'
  const [sort, setSort] = React.useState('newest'); // 'newest'|'oldest'

  const filtered = React.useMemo(() => {
    let list = games.slice();
    if (result !== 'all') {
      list = list.filter(g => summarizeGame(g.pgn).result === result);
    }
    if (source !== 'all') {
      list = list.filter(g => g.source === source);
    }
    if (text.trim()) {
      const q = text.trim().toLowerCase();
      list = list.filter(g => {
        const s = summarizeGame(g.pgn);
        return (
          s.white.toLowerCase().includes(q) ||
          s.black.toLowerCase().includes(q) ||
          s.event.toLowerCase().includes(q)
        );
      });
    }
    list.sort((a, b) =>
      sort === 'newest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );
    return list;
  }, [games, text, result, source, sort]);

  return (
    <div className="page">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>Game History</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Search opponent/event"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Search by opponent or event"
            style={{ padding: 8, minWidth: 180 }}
          />
          <select aria-label="Filter by result" value={result} onChange={(e) => setResult(e.target.value)}>
            <option value="all">All Results</option>
            <option value="1-0">White won</option>
            <option value="0-1">Black won</option>
            <option value="1/2-1/2">Draw</option>
          </select>
          <select aria-label="Filter by source" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">All Sources</option>
            <option value="AI">AI</option>
            <option value="Realtime">Realtime</option>
            <option value="Imported">Imported</option>
          </select>
          <select aria-label="Sort by date" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </header>

      <section style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.map((g) => {
          const s = summarizeGame(g.pgn);
          const dt = new Date(g.createdAt);
          return (
            <article key={g.id} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: 18 }}>{s.white} vs {s.black}</h2>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {s.event} • {s.date} • {g.source}
              </div>
              <div style={{ marginTop: 6, fontSize: 13 }}>
                Result: <strong>{s.result}</strong>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Played: {dt.toLocaleString()}
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link className="btn small" to={`${ROUTES.HISTORY}/replay/${encodeURIComponent(g.id)}`}>Replay</Link>
                <Link className="btn small" to={`${ROUTES.HISTORY}/analysis/${encodeURIComponent(g.id)}`} style={{ background: '#6c757d' }}>Analysis</Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
