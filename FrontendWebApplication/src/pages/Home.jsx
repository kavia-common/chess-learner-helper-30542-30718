import React from 'react';
import { Link } from 'react-router-dom';
import { useFocusOnMount } from '../accessibility/a11y';

const FEATURE_AI = String(process.env.REACT_APP_FEATURE_AI || 'true') === 'true';
const FEATURE_MULTIPLAYER = String(process.env.REACT_APP_FEATURE_MULTIPLAYER || 'false') === 'true';

// PUBLIC_INTERFACE
export default function Home() {
  /** Public home page with quick links and feature flag toggles. */
  const headingRef = useFocusOnMount();

  return (
    <section>
      <h1 tabIndex={-1} ref={headingRef}>Welcome to Chess Learner Helper</h1>
      <p>Learn chess with interactive lessons, quizzes, and games.</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/lessons" className="btn">Browse Lessons</Link>
        <Link to="/quizzes" className="btn">Take a Quiz</Link>
        {FEATURE_AI && <Link to="/games/ai" className="btn">Play AI</Link>}
        {FEATURE_MULTIPLAYER && <Link to="/games/multiplayer" className="btn">Multiplayer</Link>}
        <Link to="/auth/register" className="btn btn-primary">Get Started</Link>
      </div>
    </section>
  );
}
