import React, { useEffect, useState } from 'react';
import { useGamification } from '../../store/gamification';

/**
 * PUBLIC_INTERFACE
 * Leaderboards displays top users for selected period.
 */
export function Leaderboards() {
  const { state, actions } = useGamification();
  const [period, setPeriod] = useState(state.leaderboards.period || 'weekly');

  useEffect(() => {
    actions.fetchLeaderboards({ period });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  return (
    <section aria-labelledby="lb-title">
      <h1 id="lb-title">Leaderboards</h1>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <label htmlFor="period">Period</label>
        <select
          id="period"
          value={period}
          onChange={(e)=>setPeriod(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="all-time">All-time</option>
        </select>
      </div>

      {state.leaderboards.loading && <div role="status">Loading leaderboards…</div>}
      {state.leaderboards.error && <div role="alert" style={{ color: 'crimson' }}>{state.leaderboards.error}</div>}

      {!state.leaderboards.loading && !state.leaderboards.error && (
        <div role="region" aria-label="Leaderboard table" style={{ overflowX: 'auto' }}>
          <table role="table" aria-label="Top users" style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th scope="col" style={thStyle}>Rank</th>
                <th scope="col" style={thStyle}>User</th>
                <th scope="col" style={thStyle}>Points</th>
              </tr>
            </thead>
            <tbody>
              {state.leaderboards.items.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 12 }}>No data.</td>
                </tr>
              ) : state.leaderboards.items.map((row) => (
                <tr key={`${row.rank}-${row.user}`} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={tdStyle}>{row.rank}</td>
                  <td style={tdStyle}>{row.user}</td>
                  <td style={tdStyle}>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const thStyle = { textAlign: 'left', padding: 8, borderBottom: '1px solid var(--border-color)' };
const tdStyle = { padding: 8 };
