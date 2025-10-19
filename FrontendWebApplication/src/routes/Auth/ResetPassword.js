import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { ROUTES } from '../../config/routes';
import { apiClient } from '../../services/apiClient';
import { isValidEmail, required, checkPasswordStrength } from '../../utils/validators';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function ResetPassword() {
  /**
   * Reset password flow:
   * - Request reset link by email
   * - If token is provided, allow setting a new password
   */
  const { showToast } = useToast();

  const [mode, setMode] = useState('request'); // 'request' | 'reset'
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const validateRequest = () => {
    const errs = {};
    if (!required(email) || !isValidEmail(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateReset = () => {
    const errs = {};
    if (!required(token)) errs.token = 'Please enter the reset token.';
    const strength = checkPasswordStrength(password);
    if (!strength.valid) {
      errs.password = strength.errors.join(' ');
    }
    if (password !== confirm) {
      errs.confirm = 'Passwords do not match.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  async function handleRequest(e) {
    e.preventDefault();
    if (!validateRequest()) return;
    setBusy(true);
    try {
      await apiClient.post('/auth/reset-password/request', { email: email.trim() });
      showToast('If the email exists, a reset link has been sent.', 'info', 4000);
      setMode('reset');
    } catch {
      showToast('Unable to process reset request at this time.', 'error', 3500);
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!validateReset()) return;
    setBusy(true);
    try {
      await apiClient.post('/auth/reset-password/confirm', { token: token.trim(), password });
      showToast('Password updated. You can now sign in.', 'success', 3000);
      // link to login
    } catch {
      showToast('Unable to reset password. Please check your token and try again.', 'error', 3500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <h1>Password Reset</h1>

      {mode === 'request' && (
        <form onSubmit={handleRequest} noValidate>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="reset-email">Email</label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'reset-email-error' : undefined}
              required
              style={{ display: 'block', width: '100%', padding: 8 }}
            />
            {errors.email && (
              <div id="reset-email-error" role="alert" style={{ color: '#c62828' }}>
                {errors.email}
              </div>
            )}
          </div>

          <button type="submit" className="btn" disabled={busy} aria-busy={busy}>
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      {mode === 'reset' && (
        <form onSubmit={handleReset} noValidate>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="reset-token">Reset Token</label>
            <input
              id="reset-token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              aria-invalid={Boolean(errors.token)}
              aria-describedby={errors.token ? 'reset-token-error' : undefined}
              required
              style={{ display: 'block', width: '100%', padding: 8 }}
            />
            {errors.token && (
              <div id="reset-token-error" role="alert" style={{ color: '#c62828' }}>
                {errors.token}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'new-password-error' : 'new-password-help'}
              required
              style={{ display: 'block', width: '100%', padding: 8 }}
            />
            <div id="new-password-help" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Use at least 8 characters, including letters and numbers.
            </div>
            {errors.password && (
              <div id="new-password-error" role="alert" style={{ color: '#c62828' }}>
                {errors.password}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={Boolean(errors.confirm)}
              aria-describedby={errors.confirm ? 'confirm-password-error' : undefined}
              required
              style={{ display: 'block', width: '100%', padding: 8 }}
            />
            {errors.confirm && (
              <div id="confirm-password-error" role="alert" style={{ color: '#c62828' }}>
                {errors.confirm}
              </div>
            )}
          </div>

          <button type="submit" className="btn" disabled={busy} aria-busy={busy}>
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}

      <div style={{ marginTop: 16 }}>
        <Link to={ROUTES.LOGIN}>Back to login</Link>
      </div>
    </div>
  );
}
