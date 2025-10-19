import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isValidEmail } from '../../utils/validators';
import { SocialLoginButtons } from '../../components/auth/SocialLoginButtons';
import { useAuth } from '../../store/hooks';

/**
 * PUBLIC_INTERFACE
 * Login page with email/password fields, validation, and social login buttons.
 */
export function Login() {
  const { state, actions } = useAuth();
  const doLogin = actions.login;
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const loading = state.loading;
  const apiError = state.error;

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [state.isAuthenticated, navigate, from]);

  const validate = () => {
    const errs = {};
    if (!isValidEmail(form.email)) errs.email = 'Please enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await doLogin({ email: form.email, password: form.password });
      navigate(from, { replace: true });
    } catch {
      // error handled via store state
    }
  };

  return (
    <section aria-labelledby="login-title" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1 id="login-title">Log in</h1>
      {apiError ? <div role="alert" style={{ color: 'crimson', marginBottom: 8 }}>{apiError}</div> : null}
      <form onSubmit={onSubmit} noValidate>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
          />
          {errors.email && <div id="email-error" role="alert" style={{ color: 'crimson' }}>{errors.email}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
          />
          {errors.password && <div id="password-error" role="alert" style={{ color: 'crimson' }}>{errors.password}</div>}
        </div>
        <button type="submit" className="theme-toggle" style={{ position: 'static', width: '100%' }} disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <div style={{ marginTop: 12 }}>
        <Link to="/forgot-password">Forgot your password?</Link>
      </div>
      <div style={{ margin: '16px 0', borderTop: '1px solid var(--border-color)' }} />
      <SocialLoginButtons />
      <p style={{ marginTop: 12 }}>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </section>
  );
}
