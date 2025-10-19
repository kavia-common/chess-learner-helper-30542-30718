import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import NotFound from './routes/NotFound';
import { ROUTES } from './config/routes';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useToast } from './context/ToastContext';
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

// Gamification pages
import Challenges from './routes/Gamification/Challenges';
import Puzzles from './routes/Gamification/Puzzles';
import TimedQuizzes from './routes/Gamification/TimedQuizzes';
import Leaderboards from './routes/Gamification/Leaderboards';
import Achievements from './routes/Gamification/Achievements';

// Simple home page
function Home() {
  return (
    <div className="page">
      <h1>Welcome to Chess Learner Helper</h1>
      <p>Start your journey with lessons, quizzes, practice, and gamified challenges.</p>
    </div>
  );
}

/**
 * ToastMount renders a live region container so announcements are consistent.
 * The actual toasts are rendered in ToastProvider; this component provides a spot to move focus if needed.
 */
function ToastMount() {
  const { /* eslint-disable no-unused-vars */ showToast } = useToast();
  return <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', inset: '-9999px' }} />;
}

// Layout with navbar, sidebar, main content outlet, and footer wrapped in ErrorBoundary
function AppLayout() {
  return (
    <ErrorBoundary>
      <div className="app-shell">
        <Navbar />
        <div className="app-body">
          <Sidebar />
          <main className="app-content" id="main-content" role="main" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
        <Footer />
        <ToastMount />
      </div>
    </ErrorBoundary>
  );
}

// PUBLIC_INTERFACE
export default function App() {
  /** Root application shell providing routes and layout. */
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />

        {/* Core learning routes */}
        <Route path={ROUTES.LESSONS} element={<LessonList />} />
        <Route path={`${ROUTES.LESSONS}/:lessonId`} element={<LessonDetail />} />
        <Route path={ROUTES.QUIZZES} element={<LessonList />} />
        <Route path={`${ROUTES.QUIZZES}/:lessonId`} element={<Quiz />} />

        {/* Practice */}
        <Route path={ROUTES.PRACTICE} element={<div className="page"><h2>Practice</h2></div>} />
        <Route path={ROUTES.PRACTICE_AI} element={<PlayAI />} />
        <Route path={ROUTES.PRACTICE_REALTIME} element={<PlayRealtime />} />

        {/* Public gamification */}
        <Route path={ROUTES.LEADERBOARDS} element={<Leaderboards />} />

        {/* Protected user areas */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.HISTORY} element={<HistoryList />} />
          <Route path={`${ROUTES.HISTORY}/replay/:gameId`} element={<GameReplay />} />
          <Route path={`${ROUTES.HISTORY}/analysis/:gameId`} element={<Analysis />} />

          {/* Gamification (requires auth for personalized progress) */}
          <Route path={ROUTES.CHALLENGES} element={<Challenges />} />
          <Route path={ROUTES.PUZZLES} element={<Puzzles />} />
          <Route path={ROUTES.TIMED_QUIZZES} element={<TimedQuizzes />} />
          <Route path={ROUTES.ACHIEVEMENTS} element={<Achievements />} />

          {/* Profile and onboarding */}
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={`${ROUTES.PROFILE}/edit`} element={<EditProfile />} />
          <Route path={ROUTES.ONBOARDING} element={<Onboarding />} />
        </Route>

        {/* Admin protected routes (role-gated) */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path={ROUTES.ADMIN} element={<Navigate to={`${ROUTES.ADMIN}/dashboard`} replace />} />
          <Route path={`${ROUTES.ADMIN}/dashboard`} element={React.createElement(require('./routes/Admin/AdminDashboard').default)} />
          <Route path={`${ROUTES.ADMIN}/users`} element={React.createElement(require('./routes/Admin/Users').default)} />
          <Route path={`${ROUTES.ADMIN}/lessons`} element={React.createElement(require('./routes/Admin/LessonsCMS').default)} />
          <Route path={`${ROUTES.ADMIN}/moderation`} element={React.createElement(require('./routes/Admin/Moderation').default)} />
          <Route path={`${ROUTES.ADMIN}/analytics`} element={React.createElement(require('./routes/Admin/Analytics').default)} />
          <Route path={`${ROUTES.ADMIN}/audit-log`} element={React.createElement(require('./routes/Admin/AuditLog').default)} />
        </Route>

        {/* Auth routes (public) */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

        {/* Redirects and 404 */}
        <Route path="/home" element={<Navigate to={ROUTES.HOME} replace />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Route>
    </Routes>
  );
}
