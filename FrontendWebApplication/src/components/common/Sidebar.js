import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar for primary navigation items. */
  const { user } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith(ROUTES.ADMIN);

  return (
    <aside className="sidebar" aria-label="Section navigation">
      <ul>
        <li><NavLink to={ROUTES.HOME} end>Home</NavLink></li>
        <li><NavLink to={ROUTES.LESSONS}>Lessons</NavLink></li>
        <li><NavLink to={ROUTES.QUIZZES}>Quizzes</NavLink></li>
        <li><NavLink to={ROUTES.PRACTICE}>Practice</NavLink></li>
        <li><NavLink to={ROUTES.PRACTICE_AI}>Play vs AI</NavLink></li>
        <li><NavLink to={ROUTES.PRACTICE_REALTIME}>Realtime Play</NavLink></li>
        <li><NavLink to={ROUTES.HISTORY}>History</NavLink></li>
        <li><NavLink to={ROUTES.CHALLENGES}>Challenges</NavLink></li>
        <li><NavLink to={ROUTES.PROFILE}>Profile</NavLink></li>
        {user?.role === 'admin' && (
          <>
            <li><NavLink to={ROUTES.ADMIN}>Admin</NavLink></li>
            {isAdminRoute && (
              <ul aria-label="Admin submenu" style={{ marginLeft: 12 }}>
                <li><NavLink to={`${ROUTES.ADMIN}/dashboard`}>Dashboard</NavLink></li>
                <li><NavLink to={`${ROUTES.ADMIN}/users`}>Users</NavLink></li>
                <li><NavLink to={`${ROUTES.ADMIN}/lessons`}>Lessons</NavLink></li>
                <li><NavLink to={`${ROUTES.ADMIN}/moderation`}>Moderation</NavLink></li>
                <li><NavLink to={`${ROUTES.ADMIN}/analytics`}>Analytics</NavLink></li>
                <li><NavLink to={`${ROUTES.ADMIN}/audit-log`}>Audit Log</NavLink></li>
              </ul>
            )}
          </>
        )}
      </ul>
    </aside>
  );
}
