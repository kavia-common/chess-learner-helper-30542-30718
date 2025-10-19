import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { NotFound } from '../pages/NotFound';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { VerifyEmail } from '../pages/auth/VerifyEmail';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { LinkAccounts } from '../pages/auth/LinkAccounts';
import { LessonsList } from '../pages/lessons/LessonsList';
import { LessonDetail } from '../pages/lessons/LessonDetail';
import { Quiz } from '../pages/lessons/Quiz';
import { AIPlay } from '../pages/games/AIPlay';
import { Matchmaking } from '../pages/games/Matchmaking';
import { RealtimeGame } from '../pages/games/RealtimeGame';

/**
 * PUBLIC_INTERFACE
 * AppRouter defines the route map for the SPA with React Router v6.
 * Routes:
 * - "/" -> Home
 * - Lessons: /lessons, /lessons/:id, /lessons/:id/quiz
 * - Games: /games/ai, /games/match, /games/realtime/:gameId
 * - Auth routes: /login, /register, /verify-email, /forgot-password, /reset-password, /link-accounts
 * - "/dashboard" -> Example protected route (redirects to /login if unauthenticated)
 * - "*" -> NotFound
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lessons" element={<LessonsList />} />
      <Route path="/lessons/:id" element={<LessonDetail />} />
      <Route path="/lessons/:id/quiz" element={<Quiz />} />
      <Route path="/games/ai" element={<AIPlay />} />
      <Route path="/games/match" element={<Matchmaking />} />
      <Route path="/games/realtime/:gameId" element={<RealtimeGame />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/link-accounts"
        element={
          <ProtectedRoute>
            <LinkAccounts />
          </ProtectedRoute>
        }
      />
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

function DashboardPlaceholder() {
  return (
    <section aria-labelledby="dash-title">
      <h1 id="dash-title">Dashboard</h1>
      <p>Protected content placeholder. You should not see this when logged out.</p>
    </section>
  );
}
