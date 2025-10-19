import React, { useEffect, useState } from 'react';
import { listPuzzles } from '../../services/challengeService';
import Badge from '../../components/common/Badge';
import RatingBadge from '../../components/common/RatingBadge';

const themes = ['Tactics', 'Endgame'];
const difficulties = ['Easy', 'Intermediate', 'Advanced'];

export default function Puzzles() {
  const [filters, setFilters] = useState({ theme: '', difficulty: '' });
  const [puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (f = filters) => {
    setLoading(true);
    const data = await listPuzzles({
      theme: f.theme || undefined,
      difficulty: f.difficulty || undefined
    });
    setPuzzles(data);
    setLoading(false);
  };

  useEffect(() => { load(); // initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    const next = { ...filters, [name]: value };
    setFilters(next);
  };

  const onApply = (e) => {
    e.preventDefault();
    load(filters);
  };

  return (
    <main className="container" aria-labelledby="pz-title">
      <header className="page-header">
        <h1 id="pz-title">Puzzle Library</h1>
        <p className="text-muted">Filter by theme and difficulty to practice what you need.</p>
      </header>

      <form className="card" onSubmit={onApply} aria-label="Puzzle Filters">
        <div className="card-body grid-3">
          <label>
            <span className="label">Theme</span>
            <select
              name="theme"
              value={filters.theme}
              onChange={onChange}
              aria-label="Filter by theme"
            >
              <option value="">All</option>
              {themes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          <label>
            <span className="label">Difficulty</span>
            <select
              name="difficulty"
              value={filters.difficulty}
              onChange={onChange}
              aria-label="Filter by difficulty"
            >
              <option value="">All</option>
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>

          <div className="align-end">
            <button type="submit" className="btn btn-primary">Apply Filters</button>
          </div>
        </div>
      </form>

      <section aria-live="polite" className="mt-2">
        {loading ? (
          <div role="status">Loading puzzles…</div>
        ) : puzzles.length === 0 ? (
          <p>No puzzles found with current filters.</p>
        ) : (
          <ul className="list grid-3" role="list">
            {puzzles.map(p => (
              <li key={p.id} className="card" role="listitem">
                <div className="card-header">
                  <h3 className="card-title">{p.title}</h3>
                  <div className="card-meta">
                    <Badge label={p.theme} color="info" />
                    <Badge label={p.difficulty} color="primary" />
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-muted">Practice this theme to improve your tactical awareness.</p>
                </div>
                <div className="card-footer">
                  <RatingBadge rating={p.rating || 0} outOf={5} size="sm" />
                  <button type="button" className="btn btn-outline" aria-label={`Start puzzle ${p.title}`}>Start</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
