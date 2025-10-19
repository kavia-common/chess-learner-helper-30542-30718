import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { ROUTES } from '../../config/routes';

// PUBLIC_INTERFACE
export default function Navbar() {
  /** Top navigation bar with brand and quick links. */
  const { theme, toggleTheme, highContrast, toggleContrast } = useContext(ThemeContext);

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-brand">
        <Link to={ROUTES.HOME} className="brand-link" aria-label="Chess Learner Helper Home">
          ♟️ Chess Learner Helper
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to={ROUTES.LESSONS}>Lessons</Link></li>
        <li><Link to={ROUTES.QUIZZES}>Quizzes</Link></li>
        <li><Link to={ROUTES.PRACTICE}>Practice</Link></li>
        <li><Link to={ROUTES.HISTORY}>History</Link></li>
        <li><Link to={ROUTES.CHALLENGES}>Challenges</Link></li>
      </ul>
      <div className="navbar-actions">
        <button className="btn small" onClick={toggleContrast} aria-pressed={highContrast} aria-label="Toggle high contrast">
          {highContrast ? 'Low Contrast' : 'High Contrast'}
        </button>
        <button className="btn small" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}
