import React, { useEffect } from 'react';
import { useGamification } from '../../store/gamification';

/**
 * PUBLIC_INTERFACE
 * DailyChallenge shows today's challenge and allows completion.
 */
export function DailyChallenge() {
  const { state, actions } = useGamification();

  useEffect(() => {
    actions.fetchDailyChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onComplete = async () => {
    await actions.completeDaily();
  };

  return (
    <section aria-labelledby="daily-title">
      <h1 id="daily-title">Daily Challenge</h1>
      {state.daily.loading && <div role="status">Loading challenge…</div>}
      {state.daily.error && <div role="alert" style={{ color: 'crimson' }}>{state.daily.error}</div>}
      {!state.daily.loading && !state.daily.error && state.daily.data && (
        <div style={{ padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-secondary)' }}>
          <h2 style={{ marginTop: 0 }}>{state.daily.data.title}</h2>
          <p>{state.daily.data.description}</p>
          {state.daily.data.prompt && <p style={{ fontStyle: 'italic' }}>{state.daily.data.prompt}</p>}
          <div style={{ marginTop: 8 }}>
            <strong>Reward:</strong> {state.daily.data.points} points
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              className="theme-toggle"
              style={{ position: 'static' }}
              onClick={onComplete}
              disabled={state.daily.data.completed || state.daily.completing}
              aria-disabled={state.daily.data.completed || state.daily.completing}
            >
              {state.daily.data.completed ? 'Completed' : (state.daily.completing ? 'Completing…' : 'Mark as completed')}
            </button>
          </div>
          {state.daily.completeResult && (
            <div role="status" style={{ marginTop: 8 }}>
              +{state.daily.completeResult.pointsAwarded} points awarded!
            </div>
          )}
        </div>
      )}
    </section>
  );
}
