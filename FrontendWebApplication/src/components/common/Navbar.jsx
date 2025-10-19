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
      <div style={{flex: 1}} />
      <NavLink to="/login" style={linkStyle}>Login</NavLink>
      <NavLink to="/register" style={linkStyle} onClick={(e)=>{e.preventDefault(); window.location.href='/login';}} aria-label="Register (redirects to Login placeholder)">Register</NavLink>
    </nav>
  );
}
