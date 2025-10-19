import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { useToast } from '../../context/ToastContext';
import { apiClient } from '../../services/apiClient';
import { isValidEmail, required } from '../../utils/validators';
import { getCurrentUser } from '../../services/authService';

// PUBLIC_INTERFACE
export default function VerifyEmail() {
  /**
   * Email verification page.
   * - Accepts a token input and calls placeholder endpoint /auth/verify
   * - Includes "Resend verification" calling /auth/resend-verification
   */
  const { showToast } = useToast();
  const navigate = useNavigate();

  const user = getCurrentUser();
  const [email, setEmail] = useState(user?.email || '');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const validateToken = () => {
    const errs = {};
    if (!required(token) || token.length < 6) {
      errs.token = 'Please enter your verification code or token.';
    }
    if (!required(email) || !isValidEmail(email)) {
      errs.email = 'Please enter a valid email.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  async function handleVerify(e) {
    e.preventDefault();
    if (!validateToken()) return;
    setBusy(true);
    try {
      await apiClient.post('/auth/verify', { email: email.trim(), token: token.trim() });
      showToast('Email verified successfully!', 'success', 3000);
      navigate(ROUTES.ONBOARDING);
    } catch {
      showToast('Verification failed. Please check your code and try again.', 'error', 4000);
    } finally {
      setBusy(false);
    }
  }

  async function handleResend(e) {
    e.preventDefault();
    if (!required(email) || !isValidEmail(email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email to resend verification.' }));
      return;
    }
    setBusy(true);
    try {
      await apiClient.post('/auth/resend-verification', { email: email.trim() });
      showToast('Verification email resent. Please check your inbox.', 'info', 3500);
    } catch {
      showToast('Unable to resend verification at this time.', 'error', 3500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <h1>Verify your email</h1>
      <form onSubmit={handleVerify} aria-labelledby="verify-email-form" noValidate>
        <h2 id="verify-email-form" className="sr-only" style={{ position: 'absolute', left: -9999 }}>Verify Email Form</h2>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="ver-email">Email</label>
          <input
            id="ver-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'ver-email-error' : undefined}
            required
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
          {errors.email && (
            <div id="ver-email-error" role="alert" style={{ color: '#c62828' }}>
              {errors.email}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="ver-token">Verification Code / Token</label>
          <input
            id="ver-token"
            name="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            aria-invalid={Boolean(errors.token)}
            aria-describedby={errors.token ? 'ver-token-error' : undefined}
            required
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
          {errors.token && (
            <div id="ver-token-error" role="alert" style={{ color: '#c62828' }}>
              {errors.token}
            </div>
          )}
        </div>

        <button type="submit" className="btn" disabled={busy} aria-busy={busy}>
          {busy ? 'Verifying…' : 'Verify Email'}
        </button>

        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={handleResend} type="button" disabled={busy} aria-busy={busy}>
            Resend verification email
          </button>
        </div>
      </form>
    </div>
  );
}
