import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';

// PUBLIC_INTERFACE
export default function RoleGuard({ allowedRoles, children }) {
  /**
   * RoleGuard restricts access to children based on the current user's role.
   * - allowedRoles: array of roles allowed to view the content
   * It reads user from the centralized app store via useStore (state.auth.user.role).
   */
  const location = useLocation();
  const { state } = useStore();
  const user = state?.auth?.user;
  const role = user?.role || 'learner';

  const isAllowed = Array.isArray(allowedRoles) ? allowedRoles.includes(role) : false;

  if (!isAllowed) {
    // Redirect non-authorized users to home, preserving attempted location
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
