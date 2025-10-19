import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLessons } from '../../store/lessons';
import { ProgressBar } from '../../components/common/ProgressBar';

/**
 * PUBLIC_INTERFACE
 * LessonsList lists available lessons and shows per-lesson progress.
 */
export function LessonsList() {
  const { state, actions } = useLessons();
  const { items, loading, error } = state.list;

  useEffect(() => {
    actions.fetchLessons();
    actions.fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section aria-labelledby="lessons-title">
      <h1 id="lessons-title">Lessons</h1>
      {loading && <div role="status">Loading lessons…</div>}
      {error && <div role="alert" style={{ color: 'crimson' }}>{error}</div>}
      {!loading && !error && items.length === 0 && (
        <p>No lessons available yet.</p>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
        {items.map((lesson) => (
          <li key={lesson.id} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, background: 'var(--bg-secondary)' }}>
            <h2 style={{ marginTop: 0, marginBottom: 6 }}>
              <Link to={`/lessons/${lesson.id}`}>{lesson.title}</Link>
            </h2>
            {lesson.summary && <p style={{ marginTop: 0 }}>{lesson.summary}</p>}
            <ProgressBar value={lesson.progress || 0} max={100} label="Lesson progress" />
            <div style={{ marginTop: 8 }}>
              <Link to={`/lessons/${lesson.id}/quiz`} className="btn">Take quiz</Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
