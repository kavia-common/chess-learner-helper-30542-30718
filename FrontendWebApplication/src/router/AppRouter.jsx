import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import RoleGuard from '../components/common/RoleGuard';
import Spinner from '../components/common/Spinner';

// Lazy imports for route-level code splitting
const Home = lazy(() => import('../pages/Home').then(m => ({ default: m.Home })));
const NotFound = lazy(() => import('../pages/NotFound').then(m => ({ default: m.NotFound })));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register').then(m => ({ default: m.Register })));
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const LinkAccounts = lazy(() => import('../pages/auth/LinkAccounts').then(m => ({ default: m.LinkAccounts })));

const LessonsList = lazy(() => import('../pages/lessons/LessonsList').then(m => ({ default: m.LessonsList })));
const LessonDetail = lazy(() => import('../pages/lessons/LessonDetail').then(m => ({ default: m.LessonDetail })));
const Quiz = lazy(() => import('../pages/lessons/Quiz').then(m => ({ default: m.Quiz })));

const AIPlay = lazy(() => import('../pages/games/AIPlay').then(m => ({ default: m.AIPlay })));
const Matchmaking = lazy(() => import('../pages/games/Matchmaking').then(m => ({ default: m.Matchmaking })));
const RealtimeGame = lazy(() => import('../pages/games/RealtimeGame').then(m => ({ default: m.RealtimeGame })));

const GameHistory = lazy(() => import('../pages/history/GameHistory').then(m => ({ default: m.GameHistory })));
const GameReplay = lazy(() => import('../pages/history/GameReplay').then(m => ({ default: m.GameReplay })));

const DailyChallenge = lazy(() => import('../pages/gamification/DailyChallenge').then(m => ({ default: m.DailyChallenge })));
const Puzzles = lazy(() => import('../pages/gamification/Puzzles').then(m => ({ default: m.Puzzles })));
const Leaderboards = lazy(() => import('../pages/gamification/Leaderboards').then(m => ({ default: m.Leaderboards })));
const Achievements = lazy(() => import('../pages/gamification/Achievements').then(m => ({ default: m.Achievements })));

const Profile = lazy(() => import('../pages/Profile').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings })));

// Admin pages (default exports)
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const ContentManager = lazy(() => import('../pages/admin/ContentManager'));
const UsersManager = lazy(() => import('../pages/admin/UsersManager'));
const Moderation = lazy(() => import('../pages/admin/Moderation'));
const Analytics = lazy(() => import('../pages/admin/Analytics'));
const AuditLog = lazy(() => import('../pages/admin/AuditLog'));

/**
 * PUBLIC_INTERFACE
 * AppRouter defines the route map for the SPA with React Router v6 and lazy-loaded routes.
 * Includes Suspense fallbacks for improved performance and progressive loading.
 * Summary:
 * - All main pages are lazy-loaded with React.lazy + dynamic imports
 * - Suspense fallback uses an accessible Spinner
 * - ProtectedRoute and RoleGuard still guard private/admin routes
 * - No functional changes to route paths
 */
export function AppRouter() {
  return (
    <Suspense fallback={<Spinner label="Loading page..." />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/lessons" element={<LessonsList />} />
        <Route path="/lessons/:id" element={<LessonDetail />} />
        <Route path="/lessons/:id/quiz" element={<Quiz />} />
        <Route path="/games/ai" element={<AIPlay />} />
        <Route path="/games/match" element={<Matchmaking />} />
        <Route path="/games/realtime/:gameId" element={<RealtimeGame />} />
        <Route path="/history" element={<GameHistory />} />
        <Route path="/history/:gameId" element={<GameReplay />} />
        <Route path="/challenges" element={<DailyChallenge />} />
        <Route path="/puzzles" element={<Puzzles />} />
        <Route path="/leaderboards" element={<Leaderboards />} />
        <Route path="/achievements" element={<Achievements />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Authenticated user routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
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

        {/* Admin - Protected by auth and role guard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/content" replace />} />
          <Route path="content" element={<ContentManager />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="moderation" element={<Moderation />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="audit-log" element={<AuditLog />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
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
