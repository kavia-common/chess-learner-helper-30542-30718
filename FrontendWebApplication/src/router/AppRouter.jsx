import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { NotFound } from '../pages/NotFound';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

/**
 * PUBLIC_INTERFACE
 * AppRouter defines the route map for the SPA with React Router v6.
 * Routes:
 * - "/" -> Home
 * - "/login" -> Placeholder login page
 * - "/dashboard" -> Example protected route (redirects to /login if unauthenticated)
 * - "*" -> NotFound
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPlaceholder />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPlaceholder />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function LoginPlaceholder() {
  return (
    <section aria-labelledby="login-title">
      <h1 id="login-title">Login</h1>
      <p>This is a placeholder login page. Implement auth later.</p>
    </section>
  );
}

function DashboardPlaceholder() {
  return (
    <section aria-labelledby="dash-title">
      <h1 id="dash-title">Dashboard</h1>
      <p>Protected content placeholder. You should not see this when logged out.</p>
    </section>
  );
}
