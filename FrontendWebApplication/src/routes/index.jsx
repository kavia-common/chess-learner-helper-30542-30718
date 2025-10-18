import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import ProtectedRoute from './ProtectedRoute';

import Home from '../pages/Home';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';

import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';

import LessonsList from '../pages/lessons/LessonsList';
import LessonDetail from '../pages/lessons/LessonDetail';

import QuizzesList from '../pages/quizzes/QuizzesList';
import QuizPlay from '../pages/quizzes/QuizPlay';

import AIGame from '../pages/games/AIGame';
import MultiplayerLobby from '../pages/games/MultiplayerLobby';

import Leaderboards from '../pages/Leaderboards';
import AdminDashboard from '../pages/admin/AdminDashboard';

// PUBLIC_INTERFACE
export default function RoutesIndex() {
  /** Defines application routes with public and protected guards. */
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicRoutes />}>
        <Route path="/" element={<Home />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/forgot" element={<ForgotPassword />} />
        <Route path="/auth/reset" element={<ResetPassword />} />
        <Route path="/auth/verify" element={<VerifyEmail />} />
      </Route>

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/lessons" element={<LessonsList />} />
        <Route path="/lessons/:id" element={<LessonDetail />} />

        <Route path="/quizzes" element={<QuizzesList />} />
        <Route path="/quizzes/:id/play" element={<QuizPlay />} />

        <Route path="/games/ai" element={<AIGame />} />
        <Route path="/games/multiplayer" element={<MultiplayerLobby />} />

        <Route path="/leaderboards" element={<Leaderboards />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
