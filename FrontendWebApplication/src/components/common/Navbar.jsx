import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore, authActions } from '../../store';

/**
 * PUBLIC_INTERFACE
 * Navbar renders the top navigation with links to key routes.
 * Includes simple focus-visible styles for accessibility.
 */
export function Navbar() {
  const { state, dispatch } = useStore();
  const doLogout = authActions.logout(dispatch);

  const linkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--text-secondary)' : 'var(--text-primary)',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    outlineOffset: '3px'
  });

  const authed = Boolean(state?.auth?.isAuthenticated);

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation" style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '12px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)'
    }}>
      <NavLink to="/" style={linkStyle} end>Home</NavLink>
      <NavLink to="/lessons" style={linkStyle}>Lessons</NavLink>
      <NavLink to="/games/ai" style={linkStyle}>Play vs AI</NavLink>
      <NavLink to="/games/match" style={linkStyle}>Matchmaking</NavLink>
      <NavLink to="/history" style={linkStyle}>History</NavLink>
      <NavLink to="/challenges" style={linkStyle}>Daily</NavLink>
      <NavLink to="/puzzles" style={linkStyle}>Puzzles</NavLink>
      <NavLink to="/leaderboards" style={linkStyle}>Leaderboards</NavLink>
      <NavLink to="/achievements" style={linkStyle}>Achievements</NavLink>
      <div style={{flex: 1}} />
      {authed ? (
        <>
          <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
          <NavLink to="/settings" style={linkStyle}>Settings</NavLink>
          <button
            type="button"
            onClick={async ()=>{ await doLogout(); }}
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
          <NavLink to="/login" style={linkStyle}>Login</NavLink>
          <NavLink to="/register" style={linkStyle}>Register</NavLink>
        </>
      )}
    </nav>
  );
}
