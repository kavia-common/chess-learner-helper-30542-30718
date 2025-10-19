import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROUTES } from '../../config/routes';
import { isValidEmail, required, checkPasswordStrength } from '../../utils/validators';

// PUBLIC_INTERFACE
export default function Register() {
  /**
   * Accessible registration form with client-side validation for email and password.
   * On success, shows toast and redirects to verify email or to onboarding depending on backend flow.
   */
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!required(email) || !isValidEmail(email)) {
      errs.email = 'Please enter a valid email address.';
    }
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await register(email.trim(), password);
      if (res?.requiresVerification) {
        showToast('Registration successful. Check your email to verify your account.', 'info', 4500);
        navigate(ROUTES.VERIFY_EMAIL);
      } else {
        showToast('Welcome! Your account is ready.', 'success', 2500);
        // Optionally, redirect to onboarding
        navigate(ROUTES.ONBOARDING);
      }
    } catch (err) {
      showToast('Registration failed. Please try again.', 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit} aria-labelledby="register-form-title" noValidate>
        <h2 id="register-form-title" className="sr-only" style={{ position: 'absolute', left: -9999 }}>Register Form</h2>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'reg-email-error' : undefined}
            required
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
          {errors.email && (
            <div id="reg-email-error" role="alert" style={{ color: '#c62828' }}>
              {errors.email}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'reg-password-error' : 'password-help'}
            required
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
          <div id="password-help" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Use at least 8 characters, including letters and numbers.
          </div>
          {errors.password && (
            <div id="reg-password-error" role="alert" style={{ color: '#c62828' }}>
              {errors.password}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="reg-confirm">Confirm Password</label>
          <input
            id="reg-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={Boolean(errors.confirm)}
            aria-describedby={errors.confirm ? 'reg-confirm-error' : undefined}
            required
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
          {errors.confirm && (
            <div id="reg-confirm-error" role="alert" style={{ color: '#c62828' }}>
              {errors.confirm}
            </div>
          )}
        </div>

        <button type="submit" className="btn" disabled={submitting} aria-busy={submitting}>
          {submitting ? 'Creating…' : 'Create account'}
        </button>

        <div style={{ marginTop: 12 }}>
          Already have an account? <Link to={ROUTES.LOGIN}>Log in</Link>
        </div>
      </form>
    </div>
  );
}
