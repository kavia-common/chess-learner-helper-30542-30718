import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';

// Reuse the app's AuthContext to simulate auth states
import { AuthProvider, AuthContext } from '../context/AuthContext';

// Components and pages used in routes
import LessonList from '../routes/Lessons/LessonList';
import PlayAI from '../routes/Practice/PlayAI';
import NotFound from '../routes/NotFound';
import Login from '../routes/Auth/Login';

// ProtectedRoute from app
import ProtectedRoute from '../components/common/ProtectedRoute';

// Helper: wrap UI with AuthContext and MemoryRouter for route testing
function renderWithRouter(ui, { route = '/', authValue = null } = {}) {
  const Wrapper = ({ children }) => {
    // If authValue provided, inject it directly; otherwise use default provider
    if (authValue) {
      return (
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </AuthContext.Provider>
      );
    }
    return (
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AuthProvider>
    );
  };
  return render(ui, { wrapper: Wrapper });
}

describe('Routing and ProtectedRoute smoke tests', () => {
  test('renders Lessons list route at /lessons', async () => {
    renderWithRouter(
      <Routes>
        <Route path="/lessons" element={<LessonList />} />
      </Routes>,
      { route: '/lessons' }
    );

    // Expect some heading or text typical of LessonList
    // Keep assertions generic to avoid brittle coupling
    const heading = await screen.findByRole('heading', { name: /lessons/i });
    expect(heading).toBeInTheDocument();
  });

  test('renders Play AI route at /practice/ai', async () => {
    renderWithRouter(
      <Routes>
        <Route path="/practice/ai" element={<PlayAI />} />
      </Routes>,
      { route: '/practice/ai' }
    );

    // Expect something that indicates AI play area
    const heading = await screen.findByRole('heading', { name: /play ai|practice vs ai/i });
    expect(heading).toBeInTheDocument();
  });

  test('renders NotFound for unknown route', async () => {
    renderWithRouter(
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>,
      { route: '/definitely-not-a-real-path' }
    );

    // Generic NotFound text
    const text = await screen.findByText(/not found|page not found|404/i);
    expect(text).toBeInTheDocument();
  });

  test('unauthenticated redirect from protected route to login', async () => {
    // Build a small router with a protected route and a login fallback
    const ProtectedLessons = (
      <ProtectedRoute>
        <LessonList />
      </ProtectedRoute>
    );

    renderWithRouter(
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/lessons" element={ProtectedLessons} />
        <Route path="*" element={<Navigate to="/lessons" replace />} />
      </Routes>,
      {
        route: '/lessons',
        authValue: {
          user: null,
          loading: false,
          login: jest.fn(),
          logout: jest.fn(),
          register: jest.fn(),
        },
      }
    );

    // Expect to be redirected to login content
    // Look for a heading or button typical of Login
    const loginHeading = await screen.findByRole('heading', { name: /login|sign in/i });
    expect(loginHeading).toBeInTheDocument();
  });

  test('authenticated user can access protected route', async () => {
    const ProtectedLessons = (
      <ProtectedRoute>
        <LessonList />
      </ProtectedRoute>
    );

    renderWithRouter(
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/lessons" element={ProtectedLessons} />
        <Route path="*" element={<Navigate to="/lessons" replace />} />
      </Routes>,
      {
        route: '/lessons',
        authValue: {
          user: { id: 'u1', email: 'test@example.com' },
          loading: false,
          login: jest.fn(),
          logout: jest.fn(),
          register: jest.fn(),
        },
      }
    );

    // Should render the protected page content, not the login
    await waitFor(async () => {
      const lessonHeading = await screen.findByRole('heading', { name: /lessons/i });
      expect(lessonHeading).toBeInTheDocument();
    });

    // Ensure login heading is not present
    const loginHeadingQuery = screen.queryByRole('heading', { name: /login|sign in/i });
    expect(loginHeadingQuery).toBeNull();
  });
});
