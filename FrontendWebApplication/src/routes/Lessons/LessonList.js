import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from '../../components/common/ProgressBar';
import { listLessons } from '../../services/lessonService';
import { ROUTES } from '../../config/routes';

// PUBLIC_INTERFACE
export default function LessonList() {
  /** Lists available lessons with progress and links to details. */
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await listLessons();
        if (mounted) setLessons(data || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="page"><p>Loading lessons…</p></div>;
  }

  return (
    <div className="page">
      <h1>Lessons</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {lessons.map((l) => {
          const completed = Number(l?.progress?.completed || 0);
          const total = Number(l?.progress?.total || 1);
          const pct = Math.round((completed / Math.max(total, 1)) * 100);
          return (
            <article key={l.id} style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: 12, background: 'var(--bg-primary)' }}>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>
                <Link to={`${ROUTES.LESSONS}/${encodeURIComponent(l.id)}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                  {l.title}
                </Link>
              </h2>
              <p style={{ margin: '8px 0', color: 'var(--text-secondary)' }}>
                {l.difficulty} • {l.durationMin} min
              </p>
              <p style={{ margin: '8px 0' }}>{l.description}</p>
              <div style={{ marginTop: 12 }}>
                <ProgressBar value={completed} max={total} label={`${l.title} progress`} />
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }} aria-live="polite">
                  {pct}% complete
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Link className="btn small" to={`${ROUTES.LESSONS}/${encodeURIComponent(l.id)}`}>Open</Link>
                <Link className="btn small" to={`${ROUTES.QUIZZES}/${encodeURIComponent(l.id)}`}>Take Quiz</Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
