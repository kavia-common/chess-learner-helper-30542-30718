import React from 'react';
import { useParams } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function QuizPlay() {
  /** Placeholder for quiz gameplay. */
  const { id } = useParams();
  return (
    <section>
      <h1>Quiz: {id}</h1>
      <p>Quiz gameplay UI will be implemented here.</p>
    </section>
  );
}
