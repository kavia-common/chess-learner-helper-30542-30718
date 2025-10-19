import React, { useEffect } from 'react';
import { useGamification } from '../../store/gamification';
import { Badge } from '../../components/common/Badge';

/**
 * PUBLIC_INTERFACE
 * Achievements shows badges, points, and streak.
 */
export function Achievements() {
  const { state, actions } = useGamification();

  useEffect(() => {
    actions.fetchAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = state.achievements.data;

  return (
    <section aria-labelledby="ach-title">
      <h1 id="ach-title">Achievements</h1>
      {state.achievements.loading && <div role="status">Loading achievements…</div>}
      {state.achievements.error && <div role="alert" style={{ color: 'crimson' }}>{state.achievements.error}</div>}
      {!state.achievements.loading && !state.achievements.error && data && (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={statBox} role="status" aria-label="Total points">
              <div style={statLabel}>Points</div>
              <div style={statValue}>{data.points ?? 0}</div>
            </div>
            <div style={statBox} role="status" aria-label="Current streak">
              <div style={statLabel}>Streak</div>
              <div style={statValue}>{data.streak ?? 0} days</div>
            </div>
          </div>
          <h2>Badges</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {Array.isArray(data.badges) && data.badges.length > 0 ? (
              data.badges.map((b) => (
                <Badge key={b.id} name={b.name} description={b.description} earned={b.earned} icon={b.icon} />
              ))
            ) : (
              <p>No badges yet. Complete activities to earn badges!</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

const statBox = { border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, background: 'var(--bg-secondary)', minWidth: 140 };
const statLabel = { fontSize: 12, color: 'var(--text-secondary)' };
const statValue = { fontSize: 20, fontWeight: 700 };
