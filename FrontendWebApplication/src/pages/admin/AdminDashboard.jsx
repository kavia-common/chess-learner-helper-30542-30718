import React from 'react';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function AdminDashboard() {
  /** Placeholder admin dashboard, requires role=admin in future enhancement. */
  const { user } = useAuth();
  return (
    <section>
      <h1>Admin Dashboard</h1>
      <p>Welcome {user?.email}. Admin tools will appear here.</p>
      <ul>
        <li>Content management</li>
        <li>User management</li>
        <li>Analytics</li>
      </ul>
    </section>
  );
}
