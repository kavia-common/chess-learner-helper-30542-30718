import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useStore, authActions, StoreActions } from '../../store';

/**
 * PUBLIC_INTERFACE
 * Navbar renders the top navigation with links to key routes.
 * Shows Admin link only for users with role 'admin'.
 * Includes a High Contrast toggle that persists to localStorage and sets html[data-contrast].
 */
export function Navbar() {
  const { state, dispatch } = useStore();
  const doLogout = authActions.logout(dispatch);

  // Persist and initialize contrast setting
  useEffect(() => {
    const saved = localStorage.getItem('ui-contrast');
    if (saved) {
      document.documentElement.setAttribute('data-contrast', saved);
    }
  }, []);

  const toggleContrast = () => {
    const current = document.documentElement.getAttribute('data-contrast') || 'normal';
    const next = current === 'high' ? 'normal' : 'high';
    document.documentElement.setAttribute('data-contrast', next);
    localStorage.setItem('ui-contrast', next);
  };

  const linkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--text-secondary)' : 'var(--text-primary)',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    outlineOffset: '3px'
  });

  const authed = Boolean(state?.auth?.isAuthenticated);
  const role = state?.auth?.user?.role || 'learner';

  return (
    <nav
      className="navbar"
      role="navigation"
      aria-label="Main Navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)'
      }}
    >
      {/* Primary sections */}
      <NavLink to="/" style={linkStyle} end aria-label="Home">
        {({ isActive }) => <span aria-current={isActive ? 'page' : undefined}>Home</span>}
      </NavLink>
      <NavLink to="/lessons" style={linkStyle} aria-label="Lessons">
        {({ isActive }) => <span aria-current={isActive ? 'page' : undefined}>Lessons</span>}
      </NavLink>

      {/* Games */}
      <NavLink to="/games/ai" style={linkStyle} aria-label="Play against AI">
        {({ isActive }) => <span aria-current={isActive ? 'page' : undefined}>Play vs AI</span>}
      </NavLink>
      <NavLink to="/games/match" style={linkStyle} aria-label="Matchmaking">
        {({ isActive }) => <span aria-current={isActive ? 'page' : undefined}>Matchmaking</span>}
      </NavLink>

      {/* History */}
      <NavLink to="/history" style={linkStyle} aria-label="Game history">
        {({ isActive }) => <span aria-current={isActive ? 'page' : undefined}>History</span>}
      </NavLink>

      {/* Gamification */}
      <NavLink to="/challenges" style={linkStyle} aria-label="Daily challenges">
        {({ isActive }) => <span aria-current={isActive ? 'page' : undefined}>Daily</span>}
      </NavLink>
      <NavLink to="/puzzles" style={linkStyle} aria-label="Puzzles">
        {({ isActive }) => <span aria-current={isActive ? 'page' : undefined}>Puzzles</span>}
      </NavLink>
      <NavLink to="/leaderboards" style={linkStyle} aria-label="Leaderboards">
        {({ isActive }) => <span aria-current={isActive ? 'page' : undefined}>Leaderboards</span>}
      </NavLink>
      <NavLink to="/achievements" style={linkStyle} aria-label="Achievements">
        {({ isActive }) => <span aria-current={isActive ? 'page' : undefined}>Achievements</span>}
      </NavLink>

      {/* Admin visible only for admins */}
      {role === 'admin' && (
        <NavLink to="/admin" style={linkStyle} aria-label="Admin dashboard" end>
          {({ isActive }) => <span aria-current={isActive ? 'page' : undefined}>Admin</span>}
        </NavLink>
      )}

      <div style={{ flex: 1 }} />

      {/* Contrast toggle */}
      <button
        type="button"
        onClick={toggleContrast}
        className="theme-toggle"
        aria-pressed={document.documentElement.getAttribute('data-contrast') === 'high'}
        aria-label="Toggle high contrast mode"
      >
        High contrast
      </button>

      {authed ? (
        <>
          <NavLink to="/profile" style={linkStyle} aria-label="Profile">Profile</NavLink>
          <NavLink to="/settings" style={linkStyle} aria-label="Settings">Settings</NavLink>
          <button
            type="button"
            onClick={async () => {
              await doLogout();
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            aria-label="Log out"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" style={linkStyle} aria-label="Login">Login</NavLink>
          <NavLink to="/register" style={linkStyle} aria-label="Register">Register</NavLink>
        </>
      )}
    </nav>
  );
}
