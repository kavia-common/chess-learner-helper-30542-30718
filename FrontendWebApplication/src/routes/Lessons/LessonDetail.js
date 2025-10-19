import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProgressBar from '../../components/common/ProgressBar';
import { getLessonById, markLessonProgress } from '../../services/lessonService';
import { ROUTES } from '../../config/routes';

// PUBLIC_INTERFACE
export default function LessonDetail() {
  /** Renders a single lesson with accessible content and progress UI. */
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await getLessonById(lessonId);
      if (mounted) setLesson(data);
    }
    load();
    return () => { mounted = false; };
  }, [lessonId]);

  if (!lesson) {
    return <div className="page"><p>Loading lesson…</p></div>;
  }

  const completed = Number(lesson?.progress?.completed || 0);
  const total = Number(lesson?.progress?.total || 1);

  async function handleMarkStep() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await markLessonProgress(lesson.id, 1);
      if (res?.progress) {
        setLesson((prev) => ({ ...(prev || {}), progress: res.progress }));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <nav aria-label="Breadcrumb" style={{ marginBottom: 8 }}>
        <Link to={ROUTES.LESSONS}>&larr; All Lessons</Link>
      </nav>

      <header>
        <h1 style={{ marginBottom: 8 }}>{lesson.title}</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          {lesson.difficulty} • {lesson.durationMin} min
        </p>
        <div style={{ marginTop: 12 }}>
          <ProgressBar value={completed} max={total} label={`${lesson.title} progress`} />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }} aria-live="polite">
            {Math.round((completed / Math.max(total, 1)) * 100)}% complete
          </div>
        </div>
      </header>

      <section style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        {Array.isArray(lesson.content) && lesson.content.map((block, idx) => {
          if (block.type === 'text') {
            return <p key={idx} style={{ lineHeight: 1.6 }}>{block.value}</p>;
          }
          if (block.type === 'image') {
            return (
              <figure key={idx} style={{ margin: 0 }}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img src={block.src} alt={block.alt || ''} style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--border-color)' }} />
                {block.alt && <figcaption style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{block.alt}</figcaption>}
              </figure>
            );
          }
          if (block.type === 'video') {
            return (
              <div key={idx}>
                <video controls style={{ maxWidth: '100%', borderRadius: 8 }}>
                  <source src={block.src} type={block.mime || 'video/mp4'} />
                  Your browser does not support the video tag.
                </video>
              </div>
            );
          }
          return <div key={idx} />;
        })}
      </section>

      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" onClick={handleMarkStep} disabled={busy} aria-busy={busy}>
          {busy ? 'Updating…' : 'Mark Next Step Complete'}
        </button>
        <Link className="btn" to={`${ROUTES.QUIZZES}/${encodeURIComponent(lesson.id)}`} style={{ background: '#6c757d' }}>
          Take Quiz
        </Link>
      </div>
    </div>
  );
}
