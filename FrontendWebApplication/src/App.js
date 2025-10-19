import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import NotFound from './routes/NotFound';
import { ROUTES } from './config/routes';
import ProtectedRoute from './components/common/ProtectedRoute';

// Simple placeholder pages for now
function Home() {
  return (
    <div className="page">
      <h1>Welcome to Chess Learner Helper</h1>
      <p>Start your journey with lessons, quizzes, and practice games.</p>
    </div>
  );
}
function Placeholder({ title }) {
  return (
    <div className="page">
      <h2>{title}</h2>
      <p>Content coming soon.</p>
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
        <Route path={ROUTES.LESSONS} element={<Placeholder title="Lessons" />} />
        <Route path={ROUTES.QUIZZES} element={<Placeholder title="Quizzes" />} />
        <Route path={ROUTES.PRACTICE} element={<Placeholder title="Practice Games" />} />

        {/* Protected user areas */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.HISTORY} element={<Placeholder title="Game History" />} />
          <Route path={ROUTES.CHALLENGES} element={<Placeholder title="Challenges" />} />
          <Route path={ROUTES.PROFILE} element={<Placeholder title="Your Profile" />} />
        </Route>

        {/* Admin protected route with role example */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path={ROUTES.ADMIN} element={<Placeholder title="Admin Tools" />} />
        </Route>

        <Route path="/home" element={<Navigate to={ROUTES.HOME} replace />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Route>
    </Routes>
  );
}
