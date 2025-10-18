import React, { useEffect, useState } from 'react';
import { listLessons } from '../../services/lessonsService';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function LessonsList() {
  /** Lists available lessons. */
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    listLessons().then(setLessons);
  }, []);

  return (
    <section>
      <h1>Lessons</h1>
      <ul>
        {lessons.map(l => (
          <li key={l.id}>
            <Link to={`/lessons/${l.id}`}>{l.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
