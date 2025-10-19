import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/hooks';

/**
 * PUBLIC_INTERFACE
 * Navbar
 * Main navigation component showing links and auth-aware actions.
 */
export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  return (
    <nav className="navbar" aria-label="Main">
      <Link to="/" aria-label="Home">Home</Link>
      <Link to="/lessons" aria-label="Lessons">Lessons</Link>
      <Link to="/games/ai" aria-label="Play vs AI">Games</Link>
      <Link to="/leaderboards" aria-label="Leaderboards">Leaderboards</Link>

      <div style={{ flex: 1 }} />

      {isAuthenticated ? (
        <>
          <Link to="/profile" aria-label="Profile">{user?.name || 'Profile'}</Link>
          <button onClick={handleLogout} aria-label="Logout" disabled={loading}>
            {loading ? '...' : 'Logout'}
          </button>
        </>
      ) : (
        <>
          <Link to="/login" aria-label="Login">Login</Link>
          <Link to="/register" aria-label="Register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
