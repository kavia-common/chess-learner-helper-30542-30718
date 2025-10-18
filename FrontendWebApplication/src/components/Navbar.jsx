import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// PUBLIC_INTERFACE
export default function Navbar() {
  /** App navigation bar with auth-aware links. */
  const { user, logout } = useAuth();

  return (
    <nav className="navbar" role="navigation" aria-label="Main">
      <div className="container" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem 0' }}>
        <Link to="/" className="App-link" aria-label="Home">Chess Learner</Link>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/lessons">Lessons</Link>
          <Link to="/quizzes">Quizzes</Link>
          <Link to="/games/ai">AI Game</Link>
          <Link to="/games/multiplayer">Multiplayer</Link>
          <Link to="/leaderboards">Leaderboards</Link>
          {user && <Link to="/dashboard">Dashboard</Link>}
          {user && <Link to="/profile">Profile</Link>}
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {!user ? (
            <>
              <Link to="/auth/login" className="btn">Login</Link>
              <Link to="/auth/register" className="btn btn-primary">Register</Link>
            </>
          ) : (
            <button className="btn" onClick={logout} aria-label="Log out">Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
}
