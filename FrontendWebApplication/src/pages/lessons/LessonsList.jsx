import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLessons } from '../../store/lessons';
import { ProgressBar } from '../../components/common/ProgressBar';
import Spinner from '../../components/common/Spinner';
import Skeleton from '../../components/common/Skeleton';
import { handleApiError } from '../../utils/errorHandler';
import { useToast } from '../../components/common/Toast';

/**
 * PUBLIC_INTERFACE
 * LessonsList lists available lessons and shows per-lesson progress.
 */
export function LessonsList() {
  const { state, actions } = useLessons();
  const { items, loading, error } = state.list;
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([actions.fetchLessons(), actions.fetchProgress()]);
      } catch (err) {
        const n = handleApiError(err);
        // Update local/global error if store doesn't already do it
        if (!error) {
          // Optionally you could have an action to set error; we will just toast here.
          toast.show({ message: n.message || 'Failed to load lessons', type: 'error' });
        }
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section aria-labelledby="lessons-title">
      <h1 id="lessons-title">Lessons</h1>

      {loading && (
        <div>
          <Spinner label="Loading lessons..." />
          <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
            <Skeleton height={20} width="80%" />
            <Skeleton height={20} width="65%" />
            <Skeleton height={20} width="90%" />
          </div>
        </div>
      )}

      {error && !loading && (
        <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', padding: 12, borderRadius: 8 }}>
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p>No lessons available yet.</p>
      )}

      {!loading && !error && (
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
      )}
    </section>
  );
}
