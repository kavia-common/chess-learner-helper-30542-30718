import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../../services/progressService';
import Badge from '../../components/common/Badge';

const timeframes = ['weekly', 'monthly', 'all'];

export default function Leaderboards() {
  const [tf, setTf] = useState('weekly');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (timeframe = tf) => {
    setLoading(true);
    const res = await getLeaderboard(timeframe);
    setData(res);
    setLoading(false);
  };

  useEffect(() => { load(); // initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container" aria-labelledby="lb-title">
      <header className="page-header">
        <h1 id="lb-title">Leaderboards</h1>
        <p className="text-muted">See who’s on top based on points earned.</p>
      </header>

      <section className="card" aria-label="Leaderboard filters">
        <div className="card-body">
          <label>
            <span className="label">Timeframe</span>
            <select value={tf} onChange={(e) => setTf(e.target.value)} aria-label="Select timeframe">
              {timeframes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <button className="btn btn-primary ml-1" onClick={() => load(tf)}>Apply</button>
        </div>
      </section>

      <section className="card mt-2" aria-live="polite">
        {loading ? (
          <div role="status">Loading leaderboard…</div>
        ) : (
          <div className="table-responsive">
            <table className="table" role="table" aria-label="Leaderboard table">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Player</th>
                  <th scope="col">Points</th>
                  <th scope="col">Badge</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={row.userId}>
                    <td>{idx + 1}</td>
                    <td>{row.name}</td>
                    <td>{row.points}</td>
                    <td>
                      {idx === 0 && <Badge label="Top 1%" color="success" />}
                      {idx === 1 && <Badge label="Top 5%" color="primary" />}
                      {idx === 2 && <Badge label="Top 10%" color="info" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
