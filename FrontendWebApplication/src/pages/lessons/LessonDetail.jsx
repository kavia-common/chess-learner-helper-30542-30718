import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLesson } from '../../services/lessonsService';
import ProgressBar from '../../components/Progress/ProgressBar';

// PUBLIC_INTERFACE
export default function LessonDetail() {
  /** Shows lesson content and a progress indicator. */
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    getLesson(id).then(setLesson);
  }, [id]);

  if (!lesson) return <p>Loading...</p>;
  return (
    <section>
      <h1>{lesson.title}</h1>
      <ProgressBar value={50} />
      <article style={{ marginTop: '1rem' }}>
        <p>{lesson.content}</p>
      </article>
    </section>
  );
}
