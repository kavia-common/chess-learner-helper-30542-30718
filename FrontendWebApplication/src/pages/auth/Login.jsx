import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SocialLoginButtons } from '../../components/auth/SocialLoginButtons';
import { useAuth } from '../../store/hooks';

/**
 * PUBLIC_INTERFACE
 * Login
 * Page for user login using email and password leveraging consolidated useAuth hook.
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const from = location.state?.from || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate(from);
    } catch {
      // errors exposed in hook error
    }
  };

  return (
    <div className="auth-page">
      <h1>Login</h1>
      {error ? <div role="alert" aria-live="polite" style={{ color: 'crimson' }}>{String(error)}</div> : null}
      <form onSubmit={onSubmit} aria-label="Login form" noValidate>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <SocialLoginButtons />
      <div className="auth-links">
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/register">Create account</Link>
      </div>
    </div>
  );
};

export default Login;
