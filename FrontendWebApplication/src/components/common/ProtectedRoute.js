import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute
 * Protects routes by ensuring the user is authenticated and (optionally) has a required role.
 * Usage:
 *  <Route element={<ProtectedRoute roles={['admin']} />}> ... </Route>
 */
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-label="Loading protected content">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (Array.isArray(roles) && roles.length > 0) {
    const ok = roles.includes(user.role);
    if (!ok) return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
