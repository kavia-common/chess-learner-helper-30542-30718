import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute guards content that requires authentication.
 * It reads auth state from the global store and redirects to /login when unauthenticated.
 */
export function ProtectedRoute({ children }) {
  const { state } = useStore();
  const location = useLocation();
  const isAuthed = Boolean(state?.auth?.isAuthenticated);

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
