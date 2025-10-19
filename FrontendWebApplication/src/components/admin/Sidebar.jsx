import React from 'react';
import { NavLink } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar shows navigation links for admin sections. */
  const linkStyle = ({ isActive }) => ({
    display: 'block',
    padding: '0.5rem 0.75rem',
    borderRadius: 6,
    textDecoration: 'none',
    color: isActive ? '#fff' : '#333',
    background: isActive ? '#1f6feb' : 'transparent',
  });

  return (
    <aside
      aria-label="Admin Sidebar"
      style={{
        width: 220,
        borderRight: '1px solid #e5e7eb',
        padding: '1rem',
        background: '#fafafa'
      }}
    >
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li><NavLink to="/admin/content" style={linkStyle}>Content</NavLink></li>
          <li><NavLink to="/admin/users" style={linkStyle}>Users</NavLink></li>
          <li><NavLink to="/admin/moderation" style={linkStyle}>Moderation</NavLink></li>
          <li><NavLink to="/admin/analytics" style={linkStyle}>Analytics</NavLink></li>
          <li><NavLink to="/admin/audit-log" style={linkStyle}>Audit Log</NavLink></li>
        </ul>
      </nav>
    </aside>
  );
}
