import React, { useEffect, useState } from 'react';
import { listQuizzes } from '../../services/quizzesService';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function QuizzesList() {
  /** Lists quizzes. */
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    listQuizzes().then(setQuizzes);
  }, []);

  return (
    <section>
      <h1>Quizzes</h1>
      <ul>
        {quizzes.map(q => (
          <li key={q.id}>
            {q.title} <Link to={`/quizzes/${q.id}/play`} className="btn">Play</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
