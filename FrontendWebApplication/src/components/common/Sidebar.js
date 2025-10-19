import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar for primary navigation items. */
  return (
    <aside className="sidebar" aria-label="Section navigation">
      <ul>
        <li><NavLink to={ROUTES.HOME} end>Home</NavLink></li>
        <li><NavLink to={ROUTES.LESSONS}>Lessons</NavLink></li>
        <li><NavLink to={ROUTES.QUIZZES}>Quizzes</NavLink></li>
        <li><NavLink to={ROUTES.PRACTICE}>Practice</NavLink></li>
        <li><NavLink to={ROUTES.PRACTICE_AI}>Play vs AI</NavLink></li>
        <li><NavLink to={ROUTES.HISTORY}>History</NavLink></li>
        <li><NavLink to={ROUTES.CHALLENGES}>Challenges</NavLink></li>
        <li><NavLink to={ROUTES.PROFILE}>Profile</NavLink></li>
        <li><NavLink to={ROUTES.ADMIN}>Admin</NavLink></li>
      </ul>
    </aside>
  );
}
