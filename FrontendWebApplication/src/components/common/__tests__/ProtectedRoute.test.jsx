import React from 'react';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { initialState as baseInitial } from '../../../store';

function Secret() {
  return <h1>Top Secret</h1>;
}
function LoginPage() {
  return <h1>Login</h1>;
}

describe('ProtectedRoute', () => {
  test('redirects to /login when unauthenticated', () => {
    const state = { ...baseInitial, auth: { ...baseInitial.auth, isAuthenticated: false } };
    renderWithProviders(
      <Routes>
        <Route path="/secret" element={<ProtectedRoute><Secret /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { routeEntries: ['/secret'], storeValue: { state, dispatch: () => {} } }
    );

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  test('renders children when authenticated', () => {
    const state = { ...baseInitial, auth: { ...baseInitial.auth, isAuthenticated: true, user: { id: 'u1' } } };
    renderWithProviders(
      <Routes>
        <Route path="/secret" element={<ProtectedRoute><Secret /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { routeEntries: ['/secret'], storeValue: { state, dispatch: () => {} } }
    );

    expect(screen.getByRole('heading', { name: /top secret/i })).toBeInTheDocument();
  });
});
