import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHistoryStore } from '../../store/history';

/**
 * PUBLIC_INTERFACE
 * GameHistory renders a table of past games with simple filters and pagination placeholders.
 */
export function GameHistory() {
  const { state, actions } = useHistoryStore();
  const [filters, setFilters] = useState(state.list.filters || { result: 'all' });

  useEffect(() => {
    actions.fetchHistory({ page: state.list.page, pageSize: state.list.pageSize, filters });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const onResultFilter = (e) => {
    setFilters(f => ({ ...f, result: e.target.value }));
  };

  const nextPage = () => {
    const next = (state.list.page || 1) + 1;
    actions.fetchHistory({ page: next, pageSize: state.list.pageSize, filters });
  };
  const prevPage = () => {
    const prev = Math.max(1, (state.list.page || 1) - 1);
    actions.fetchHistory({ page: prev, pageSize: state.list.pageSize, filters });
  };

  return (
    <section aria-labelledby="history-title">
      <h1 id="history-title">Game History</h1>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <label htmlFor="result-filter">Result</label>
        <select
          id="result-filter"
          value={filters.result}
          onChange={onResultFilter}
          style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
        >
          <option value="all">All</option>
          <option value="1-0">White won (1-0)</option>
          <option value="0-1">Black won (0-1)</option>
          <option value="1/2-1/2">Draw (1/2-1/2)</option>
        </select>
      </div>

      {state.list.loading && <div role="status">Loading history…</div>}
      {state.list.error && <div role="alert" style={{ color: 'crimson' }}>{state.list.error}</div>}

      {!state.list.loading && !state.list.error && (
        <>
          <div role="region" aria-label="Game history table" style={{ overflowX: 'auto' }}>
            <table
              role="table"
              aria-label="Past games"
              style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0 }}
            >
              <thead>
                <tr>
                  <th scope="col" style={thStyle}>Date</th>
                  <th scope="col" style={thStyle}>Opponent</th>
                  <th scope="col" style={thStyle}>Result</th>
                  <th scope="col" style={thStyle}>Rated</th>
                  <th scope="col" style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.list.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 12 }}>No games found.</td>
                  </tr>
                ) : state.list.items.map((g) => (
                  <tr key={g.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                    <td style={tdStyle}>{formatDate(g.date)}</td>
                    <td style={tdStyle}>{g.opponent || '—'}</td>
                    <td style={tdStyle}><code>{g.result || '—'}</code></td>
                    <td style={tdStyle}>{g.rated ? 'Yes' : 'No'}</td>
                    <td style={tdStyle}>
                      <Link to={`/history/${g.id}`} className="btn">Replay</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav aria-label="Pagination" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" className="theme-toggle" style={{ position: 'static' }} onClick={prevPage} disabled={state.list.page <= 1 || state.list.loading}>
              Previous
            </button>
            <div role="status" aria-live="polite" style={{ alignSelf: 'center' }}>
              Page {state.list.page} • Total: {state.list.total}
            </div>
            <button type="button" className="theme-toggle" style={{ position: 'static' }} onClick={nextPage} disabled={state.list.loading}>
              Next
            </button>
          </nav>
        </>
      )}
    </section>
  );
}

const thStyle = { textAlign: 'left', padding: 8, borderBottom: '1px solid var(--border-color)' };
const tdStyle = { padding: 8 };

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return String(iso || '');
  }
}
