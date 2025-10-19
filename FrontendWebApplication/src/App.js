import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import NotFound from './routes/NotFound';
import { ROUTES } from './config/routes';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './routes/Auth/Login';
import Register from './routes/Auth/Register';
import VerifyEmail from './routes/Auth/VerifyEmail';
import ResetPassword from './routes/Auth/ResetPassword';
import Onboarding from './routes/Onboarding';
import Profile from './routes/Profile/Profile';
import EditProfile from './routes/Profile/EditProfile';

// Lessons and quizzes
import LessonList from './routes/Lessons/LessonList';
import LessonDetail from './routes/Lessons/LessonDetail';
import Quiz from './routes/Lessons/Quiz';
import { PlayAI, PlayRealtime } from './routes/Practice';
import HistoryList from './routes/History/HistoryList';
import GameReplay from './routes/History/GameReplay';
import Analysis from './routes/History/Analysis';

// Simple placeholder pages for now
function Home() {
  return (
    <div className="page">
      <h1>Welcome to Chess Learner Helper</h1>
      <p>Start your journey with lessons, quizzes, and practice games.</p>
    </div>
  );
}
function Placeholder({ title, children }) {
  return (
    <div className="page">
      <h2>{title}</h2>
      {children || <p>Content coming soon.</p>}
    </div>
  );
}

// Layout with navbar, sidebar, main content outlet, and footer
function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content" id="main-content" role="main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

// PUBLIC_INTERFACE
export default function App() {
  /** Root application shell providing routes and layout. */
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path={ROUTES.LESSONS} element={<LessonList />} />
        <Route path={`${ROUTES.LESSONS}/:lessonId`} element={<LessonDetail />} />
        <Route path={ROUTES.QUIZZES} element={<Placeholder title="Quizzes" />} />
        <Route path={`${ROUTES.QUIZZES}/:lessonId`} element={<Quiz />} />
        <Route path={ROUTES.PRACTICE} element={
          <Placeholder title="Practice">
            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              <p>Choose a practice mode:</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a className="btn" href={ROUTES.PRACTICE_AI} aria-label="Play versus AI">Play vs AI</a>
                <a className="btn" href={ROUTES.PRACTICE_REALTIME} aria-label="Play realtime versus others">Realtime Play (beta)</a>
              </div>
            </div>
          </Placeholder>
        } />
        <Route path={ROUTES.PRACTICE_AI} element={<PlayAI />} />
        <Route path={ROUTES.PRACTICE_REALTIME} element={<PlayRealtime />} />

        {/* Protected user areas */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.HISTORY} element={<HistoryList />} />
          <Route path={`${ROUTES.HISTORY}/replay/:gameId`} element={<GameReplay />} />
          <Route path={`${ROUTES.HISTORY}/analysis/:gameId`} element={<Analysis />} />
          <Route path={ROUTES.CHALLENGES} element={<Placeholder title="Challenges" />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={`${ROUTES.PROFILE}/edit`} element={<EditProfile />} />
          <Route path={ROUTES.ONBOARDING} element={<Onboarding />} />
        </Route>

        {/* Admin protected route with role example */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path={ROUTES.ADMIN} element={<Placeholder title="Admin Tools" />} />
        </Route>

        {/* Auth routes (public) */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

        <Route path="/home" element={<Navigate to={ROUTES.HOME} replace />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Route>
    </Routes>
  );
}
