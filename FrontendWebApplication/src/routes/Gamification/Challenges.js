import React, { useEffect, useState } from 'react';
import { getDailyChallenge, submitChallengeResult, claimReward } from '../../services/challengeService';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

export default function Challenges() {
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const c = await getDailyChallenge();
      if (mounted) {
        setChallenge(c);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (success) => {
    if (!challenge) return;
    setSubmitting(true);
    const res = await submitChallengeResult({ id: challenge.id, success, timeMs: 42000 });
    setStatus(res);
    setSubmitting(false);
  };

  const handleClaim = async () => {
    if (!challenge) return;
    const res = await claimReward(challenge.id);
    setStatus(prev => ({ ...prev, claimed: true, claimMessage: res?.message || 'Claimed!' }));
  };

  if (loading) return <div role="status" aria-live="polite" className="container">Loading daily challenge…</div>;

  return (
    <main className="container" aria-labelledby="ch-title">
      <header className="page-header">
        <h1 id="ch-title">Daily Challenge</h1>
        <p className="text-muted">Sharpen your skills with a quick daily task.</p>
      </header>

      {!challenge && (
        <EmptyState
          title="No challenges available"
          message="Please check back later for new challenges."
          actionText="Refresh"
          onAction={() => window.location.reload()}
          icon="🏆"
          aria-label="Empty challenges"
        />
      )}

      {challenge && (
        <section className="card" aria-label="Challenge Details">
          <div className="card-header">
            <h2 className="card-title">{challenge.title}</h2>
            <div className="card-meta">
              <Badge label={challenge.difficulty} color="primary" />
              <Badge label={`${challenge.points} pts`} color="success" />
            </div>
          </div>
          <div className="card-body">
            <p>{challenge.description}</p>
            <div className="grid-2">
              <div>
                <h3>Position (FEN)</h3>
                <code style={{ display: 'block', overflowX: 'auto' }}>{challenge.fen}</code>
                <small className="text-muted">Note: Demo view; integrate Board component in future iteration.</small>
              </div>
              <div>
                <h3>Time Remaining</h3>
                <ProgressBar value={70} label="Time left" />
                <small className="text-muted">Mock timer for demonstration.</small>
              </div>
            </div>
          </div>
          <div className="card-footer actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              aria-busy={submitting}
            >
              I solved it
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              I couldn’t solve
            </button>
            {status?.ok && !status?.claimed && (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleClaim}
              >
                Claim reward
              </button>
            )}
          </div>
        </section>
      )}

      {status && (
        <section className="card" aria-live="polite" aria-atomic="true">
          <div className="card-body">
            <h3>Result</h3>
            <p>Awarded points: <strong>{status.awardedPoints}</strong></p>
            {status.achievementUnlocked && (
              <p>Achievement unlocked: <strong>{status.achievementUnlocked}</strong></p>
            )}
            {status.claimMessage && <p>{status.claimMessage}</p>}
          </div>
        </section>
      )}
    </main>
  );
}
