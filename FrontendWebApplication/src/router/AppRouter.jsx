import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { NotFound } from '../pages/NotFound';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import RoleGuard from '../components/common/RoleGuard';
import Login from '../pages/auth/Login';
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
import { GameHistory } from '../pages/history/GameHistory';
import { GameReplay } from '../pages/history/GameReplay';
import { DailyChallenge } from '../pages/gamification/DailyChallenge';
import { Puzzles } from '../pages/gamification/Puzzles';
import { Leaderboards } from '../pages/gamification/Leaderboards';
import { Achievements } from '../pages/gamification/Achievements';
import { Profile } from '../pages/Profile';
import { Settings } from '../pages/Settings';

// Admin pages (default exports)
import AdminDashboard from '../pages/admin/AdminDashboard';
import ContentManager from '../pages/admin/ContentManager';
import UsersManager from '../pages/admin/UsersManager';
import Moderation from '../pages/admin/Moderation';
import Analytics from '../pages/admin/Analytics';
import AuditLog from '../pages/admin/AuditLog';

/**
 * PUBLIC_INTERFACE
 * AppRouter defines the route map for the SPA with React Router v6.
 * Routes:
 * - Public: Home, Lessons, LessonDetail, Quiz, AIPlay, Matchmaking, RealtimeGame, History, GameReplay,
 *           DailyChallenge (/challenges), Puzzles, Leaderboards, Achievements, Auth pages.
 * - Auth-protected: Profile, Settings, LinkAccounts, DashboardPlaceholder.
 * - Admin-only: /admin subtree guarded by ProtectedRoute and RoleGuard(allowedRoles=['admin']).
 * Includes a NotFound 404 catch-all.
 */
export function AppRouter() {
  return (
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
