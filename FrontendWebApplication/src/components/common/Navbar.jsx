import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Navbar renders the top navigation with links to key routes.
 * Includes simple focus-visible styles for accessibility.
 */
export function Navbar() {
  const linkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--text-secondary)' : 'var(--text-primary)',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    outlineOffset: '3px'
  });

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
      <NavLink to="/login" style={linkStyle}>Login</NavLink>
      <NavLink to="/register" style={linkStyle}>Register</NavLink>
    </nav>
  );
}
