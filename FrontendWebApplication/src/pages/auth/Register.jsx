import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPasswordStrength, isStrongEnough, isValidEmail } from '../../utils/validators';
import { useStore, authActions } from '../../store';

/**
 * PUBLIC_INTERFACE
 * Register page allowing user to create an account with basic validation.
 */
export function Register() {
  const { state, dispatch } = useStore();
  const doRegister = authActions.register(dispatch);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const strength = getPasswordStrength(form.password);
  const loading = state.auth.loading;
  const apiError = state.auth.error;

  const validate = () => {
    const errs = {};
    if (!isValidEmail(form.email)) errs.email = 'Please enter a valid email address.';
    if (!isStrongEnough(form.password)) errs.password = 'Password must be at least 8 characters and include a number.';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await doRegister({ email: form.email, password: form.password });
      navigate('/verify-email', { replace: true, state: { email: form.email } });
    } catch {
      // handled by store
    }
  };

  return (
    <section aria-labelledby="register-title" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 id="register-title">Create your account</h1>
      {apiError ? <div role="alert" style={{ color: 'crimson', marginBottom: 8 }}>{apiError}</div> : null}
      <form onSubmit={onSubmit} noValidate>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email"
            value={form.email} onChange={(e)=>setForm(f=>({...f, email: e.target.value}))}
            aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }} />
          {errors.email && <div id="email-error" role="alert" style={{ color: 'crimson' }}>{errors.email}</div>}
        </div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password"
            value={form.password} onChange={(e)=>setForm(f=>({...f, password: e.target.value}))}
            aria-invalid={Boolean(errors.password)} aria-describedby="password-help"
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }} />
          <div id="password-help" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Strength: {strength.label} ({strength.score}/5)
          </div>
          {errors.password && <div role="alert" style={{ color: 'crimson' }}>{errors.password}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="confirm">Confirm Password</label>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password"
            value={form.confirm} onChange={(e)=>setForm(f=>({...f, confirm: e.target.value}))}
            aria-invalid={Boolean(errors.confirm)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }} />
          {errors.confirm && <div role="alert" style={{ color: 'crimson' }}>{errors.confirm}</div>}
        </div>
        <button type="submit" className="theme-toggle" style={{ position: 'static', width: '100%' }} disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
