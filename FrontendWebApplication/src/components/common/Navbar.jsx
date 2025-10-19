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
      <NavLink to="/" style={linkStyle} end aria-label="Home">Home</NavLink>
      <NavLink to="/lessons" style={linkStyle} aria-label="Lessons">Lessons</NavLink>
      <NavLink to="/games/ai" style={linkStyle} aria-label="Play against AI">Play vs AI</NavLink>
      <NavLink to="/games/match" style={linkStyle} aria-label="Matchmaking">Matchmaking</NavLink>
      <NavLink to="/history" style={linkStyle} aria-label="Game history">History</NavLink>
      <NavLink to="/challenges" style={linkStyle} aria-label="Daily challenges">Daily</NavLink>
      <NavLink to="/puzzles" style={linkStyle} aria-label="Puzzles">Puzzles</NavLink>
      <NavLink to="/leaderboards" style={linkStyle} aria-label="Leaderboards">Leaderboards</NavLink>
      <NavLink to="/achievements" style={linkStyle} aria-label="Achievements">Achievements</NavLink>

      {role === 'admin' && (
        <NavLink to="/admin" style={linkStyle} aria-label="Admin dashboard">Admin</NavLink>
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
