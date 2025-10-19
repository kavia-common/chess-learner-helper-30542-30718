import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROUTES } from '../../config/routes';
import { isValidEmail, required } from '../../utils/validators';
import { setSession } from '../../services/authService';

// PUBLIC_INTERFACE
export default function Login() {
  /**
   * Accessible login form using AuthContext.login.
   * - Client-side validation for email format and required password
   * - Remember-me stores a long-lived flag by keeping token in storage (handled by setSession usage)
   * - On success, redirects to previous route or home; Toasts show feedback
   */
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || ROUTES.HOME;

  const validate = () => {
    const errs = {};
    if (!required(email) || !isValidEmail(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!required(password)) {
      errs.password = 'Please enter your password.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      // If remember-me is false, we could emulate short session by clearing token on unload
      // For now, we still store token via setSession; a real impl might use sessionStorage.
      if (!remember && res?.token) {
        // Move token to sessionStorage to approximate non-persistent session
        try {
          const user = res?.user || null;
          sessionStorage.setItem('clh_access_token', res.token);
          if (user) sessionStorage.setItem('clh_user', JSON.stringify(user));
          // Clear long-term localStorage token if exists
          localStorage.removeItem('clh_access_token');
          localStorage.removeItem('clh_user');
        } catch {
          // fallback: keep localStorage; acceptable as placeholder
        }
      } else if (res?.token && res?.user) {
        // Ensure session is set (AuthContext.login does this in service; keep explicit for clarity)
        setSession({ token: res.token, user: res.user });
      }
      showToast('Welcome back!', 'success', 2500);
      navigate(from, { replace: true });
    } catch (err) {
      showToast('Login failed. Please check your credentials and try again.', 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} aria-labelledby="login-form-title" noValidate>
        <h2 id="login-form-title" className="sr-only" style={{ position: 'absolute', left: -9999 }}>Login Form</h2>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            required
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
          {errors.email && (
            <div id="email-error" role="alert" style={{ color: '#c62828' }}>
              {errors.email}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            required
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
          {errors.password && (
            <div id="password-error" role="alert" style={{ color: '#c62828' }}>
              {errors.password}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              aria-checked={remember}
            />{' '}
            Remember me
          </label>
        </div>

        <button type="submit" className="btn" disabled={submitting} aria-busy={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <div style={{ marginTop: 12 }}>
          <Link to={ROUTES.RESET_PASSWORD}>Forgot password?</Link>
        </div>
        <div style={{ marginTop: 8 }}>
          New here? <Link to={ROUTES.REGISTER}>Create an account</Link>
        </div>
      </form>
    </div>
  );
}
