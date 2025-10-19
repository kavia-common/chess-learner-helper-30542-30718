import React, { useEffect, useState } from 'react';
import { useGamification } from '../../store/gamification';

/**
 * PUBLIC_INTERFACE
 * Puzzles page lists puzzles with difficulty filter and allows submitting a simple "solution" string.
 */
export function Puzzles() {
  const { state, actions } = useGamification();
  const [difficulty, setDifficulty] = useState('all');
  const [solutionInputs, setSolutionInputs] = useState({}); // { puzzleId: text }

  useEffect(() => {
    actions.fetchPuzzles({ page: 1, pageSize: state.puzzles.pageSize, difficulty });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const onSubmitSolution = async (puzzleId) => {
    const sol = solutionInputs[puzzleId] || '';
    await actions.submitPuzzle(puzzleId, sol);
  };

  const onPage = (delta) => {
    const nextPage = Math.max(1, (state.puzzles.page || 1) + delta);
    actions.fetchPuzzles({ page: nextPage, pageSize: state.puzzles.pageSize, difficulty });
  };

  return (
    <section aria-labelledby="puzzles-title">
      <h1 id="puzzles-title">Puzzles</h1>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <label htmlFor="difficulty">Difficulty</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e)=>setDifficulty(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
        >
          <option value="all">All</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {state.puzzles.loading && <div role="status">Loading puzzles…</div>}
      {state.puzzles.error && <div role="alert" style={{ color: 'crimson' }}>{state.puzzles.error}</div>}

      <div
        role="list"
        aria-label="Puzzle list"
        style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
      >
        {state.puzzles.items.map((pz) => {
          const result = state.puzzles.results[pz.id];
          return (
            <div
              key={pz.id}
              role="listitem"
              style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, background: 'var(--bg-secondary)' }}
            >
              <h2 style={{ marginTop: 0, marginBottom: 6, fontSize: 18 }}>{pz.title}</h2>
              <div style={{ fontSize: 12, marginBottom: 6 }}>
                Difficulty: <strong>{pz.difficulty}</strong> • Theme: <strong>{pz.theme}</strong>
              </div>
              <div>Reward: {pz.points} pts</div>
              <div style={{ marginTop: 8 }}>
                <label htmlFor={`sol-${pz.id}`} style={{ display: 'block' }}>Your move(s)</label>
                <input
                  id={`sol-${pz.id}`}
                  value={solutionInputs[pz.id] || ''}
                  onChange={(e)=>setSolutionInputs(s => ({ ...s, [pz.id]: e.target.value }))}
                  placeholder="e.g., Qh5#"
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
                />
                <button type="button" className="theme-toggle" style={{ position: 'static', marginTop: 8 }} onClick={()=>onSubmitSolution(pz.id)}>
                  Submit
                </button>
              </div>
              {result && (
                <div role="status" style={{ marginTop: 6, color: result.correct ? 'green' : 'crimson' }}>
                  {result.correct ? 'Correct!' : 'Incorrect.'} {result.explanation ? `— ${result.explanation}` : ''}
                  {typeof result.pointsAwarded === 'number' && result.pointsAwarded > 0 ? ` (+${result.pointsAwarded} pts)` : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <nav aria-label="Pagination" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button type="button" className="theme-toggle" style={{ position: 'static' }} onClick={()=>onPage(-1)} disabled={state.puzzles.page <= 1 || state.puzzles.loading}>
          Previous
        </button>
        <div role="status" aria-live="polite" style={{ alignSelf: 'center' }}>
          Page {state.puzzles.page} • Total: {state.puzzles.total}
        </div>
        <button type="button" className="theme-toggle" style={{ position: 'static' }} onClick={()=>onPage(1)} disabled={state.puzzles.loading}>
          Next
        </button>
      </nav>
    </section>
  );
}
