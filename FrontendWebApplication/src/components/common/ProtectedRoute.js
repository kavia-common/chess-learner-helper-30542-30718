import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';

// PUBLIC_INTERFACE
export default function ProtectedRoute({ roles }) {
  /**
   * Route guard to protect authenticated pages.
   * - If not authenticated, redirect to home (or login when available) with state.from.
   * - If roles is provided, enforce role-based access (user.role).
   */
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className="page"><p>Loading...</p></div>;
  }

  if (!user) {
    return <Navigate to={ROUTES.HOME} replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0) {
    const userRole = user?.role || 'user';
    if (!roles.includes(userRole)) {
      return <Navigate to={ROUTES.HOME} replace />;
    }
  }

  return <Outlet />;
}
