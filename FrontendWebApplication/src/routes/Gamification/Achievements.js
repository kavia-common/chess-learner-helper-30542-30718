import React, { useEffect, useState } from 'react';
import { getAchievements, getStreak } from '../../services/progressService';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [a, s] = await Promise.all([getAchievements(), getStreak()]);
      if (mounted) {
        setAchievements(a);
        setStreak(s);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const rarityToColor = (r) => {
    switch ((r || '').toLowerCase()) {
      case 'epic': return 'danger';
      case 'rare': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <main className="container" aria-labelledby="ac-title">
      <header className="page-header">
        <h1 id="ac-title">Achievements</h1>
        <p className="text-muted">Track your milestones and collect badges.</p>
      </header>

      <section className="card" aria-live="polite">
        <div className="card-body">
          <h2>Streaks</h2>
          {loading ? (
            <div role="status">Loading streak…</div>
          ) : (
            <div className="grid-3">
              <div className="card subtle">
                <div className="card-body">
                  <p className="label">Current Streak</p>
                  <p aria-live="polite"><strong>{streak.current} days</strong></p>
                </div>
              </div>
              <div className="card subtle">
                <div className="card-body">
                  <p className="label">Best Streak</p>
                  <p><strong>{streak.best} days</strong></p>
                </div>
              </div>
              <div className="card subtle">
                <div className="card-body">
                  <p className="label">Motivation</p>
                  <p>Keep it up! You’re doing great.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="card mt-2" aria-label="Achievements List">
        <div className="card-body">
          <h2>Your Badges</h2>
          {loading ? (
            <div role="status">Loading achievements…</div>
          ) : achievements.length === 0 ? (
            <p>No achievements yet. Complete activities to earn badges!</p>
          ) : (
            <ul className="list grid-3" role="list">
              {achievements.map(a => (
                <li key={a.id} className="card" role="listitem">
                  <div className="card-header">
                    <h3 className="card-title">{a.name}</h3>
                    <Badge label={a.rarity} color={rarityToColor(a.rarity)} />
                  </div>
                  <div className="card-body">
                    <p>{a.description}</p>
                    <ProgressBar value={a.progress} label={`Progress: ${a.progress}%`} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
