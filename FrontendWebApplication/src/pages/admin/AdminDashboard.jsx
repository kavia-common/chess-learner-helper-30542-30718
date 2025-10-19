import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';

// PUBLIC_INTERFACE
export default function AdminDashboard() {
  /** AdminDashboard renders the admin layout with a sidebar and an outlet for nested admin routes. */
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Welcome to the admin interface. Use the sidebar to navigate between tools.
        </p>
        <Outlet />
      </main>
    </div>
  );
}
