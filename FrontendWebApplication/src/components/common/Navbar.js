import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { ROUTES } from '../../config/routes';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function Navbar() {
  /** Top navigation bar with brand and quick links. */
  const { theme, toggleTheme, highContrast, toggleContrast } = useContext(ThemeContext);
  const { user, logout } = useAuth();

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-brand">
        <Link to={ROUTES.HOME} className="brand-link" aria-label="Chess Learner Helper Home">
          ♟️ Chess Learner Helper
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to={ROUTES.LESSONS}>Lessons</Link></li>
        <li><Link to={ROUTES.PRACTICE}>Practice</Link></li>
        <li><Link to={ROUTES.PUZZLES}>Puzzles</Link></li>
        <li><Link to={ROUTES.CHALLENGES}>Challenges</Link></li>
        <li><Link to={ROUTES.TIMED_QUIZZES}>Timed Quizzes</Link></li>
        <li><Link to={ROUTES.LEADERBOARDS}>Leaderboards</Link></li>
        <li><Link to={ROUTES.ACHIEVEMENTS}>Achievements</Link></li>
        <li><Link to={ROUTES.HISTORY}>History</Link></li>
        {user?.role === 'admin' && <li><Link to={`${ROUTES.ADMIN}/dashboard`}>Admin</Link></li>}
        {user && <li><Link to={ROUTES.PROFILE}>Profile</Link></li>}
      </ul>
      <div className="navbar-actions">
        {!user && (
          <>
            <Link to={ROUTES.LOGIN} className="btn small">Login</Link>
            <Link to={ROUTES.REGISTER} className="btn small" style={{ marginLeft: 8 }}>Register</Link>
          </>
        )}
        {user && (
          <>
            <Link to={ROUTES.PROFILE} className="btn small" aria-label="Go to profile">
              {user.displayName?.split(' ')?.[0] || user.email || 'Account'}
            </Link>
            <button className="btn small" onClick={logout} style={{ marginLeft: 8 }}>
              Logout
            </button>
          </>
        )}
        <button className="btn small" onClick={toggleContrast} aria-pressed={highContrast} aria-label="Toggle high contrast" style={{ marginLeft: 8 }}>
          {highContrast ? 'Low Contrast' : 'High Contrast'}
        </button>
        <button className="btn small" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} style={{ marginLeft: 8 }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}
