import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLessons } from '../../store/lessons';
import { ProgressBar } from '../../components/common/ProgressBar';

/**
 * PUBLIC_INTERFACE
 * LessonDetail fetches and shows a specific lesson's content.
 */
export function LessonDetail() {
  const { id } = useParams();
  const { state, actions } = useLessons();
  const { item, loading, error } = state.detail;

  useEffect(() => {
    actions.fetchLessonById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <section aria-labelledby="lesson-title">
      {loading && <div role="status">Loading lesson…</div>}
      {error && <div role="alert" style={{ color: 'crimson' }}>{error}</div>}
      {!loading && !error && item && (
        <>
          <h1 id="lesson-title">{item.title}</h1>
          <div style={{ marginBottom: 12 }}>
            <ProgressBar value={item.progress || 0} max={100} label="Lesson progress" />
          </div>
          <article>
            {Array.isArray(item.content) ? item.content.map((block, idx) => {
              if (block.type === 'text') {
                return <p key={idx}>{block.value}</p>;
              }
              if (block.type === 'list') {
                return (
                  <ul key={idx}>
                    {block.value.map((li, i) => <li key={i}>{li}</li>)}
                  </ul>
                );
              }
              return <div key={idx}>{String(block.value)}</div>;
            }) : <p>{item.content || 'No content'}</p>}
          </article>
          <div style={{ marginTop: 12 }}>
            <Link to={`/lessons/${id}/quiz`} className="btn">Start Quiz</Link>
          </div>
          <div style={{ marginTop: 12 }}>
            <Link to="/lessons">Back to lessons</Link>
          </div>
        </>
      )}
    </section>
  );
}
