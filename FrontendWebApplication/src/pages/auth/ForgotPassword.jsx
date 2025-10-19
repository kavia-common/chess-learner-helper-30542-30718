import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../api/authApi';
import { isValidEmail } from '../../utils/validators';

/**
 * PUBLIC_INTERFACE
 * ForgotPassword page requests a reset link.
 */
export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    if (!isValidEmail(email)) {
      setErr('Please provide a valid email.');
      return;
    }
    try {
      await requestPasswordReset(email);
      setMsg('If an account exists for this email, a reset link has been sent.');
    } catch (e2) {
      setErr(e2.message || 'Request failed.');
    }
  };

  return (
    <section aria-labelledby="forgot-title" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1 id="forgot-title">Forgot password</h1>
      {msg && <div role="status" style={{ color: 'green', marginBottom: 8 }}>{msg}</div>}
      {err && <div role="alert" style={{ color: 'crimson', marginBottom: 8 }}>{err}</div>}
      <form onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }} />
        <button type="submit" className="theme-toggle" style={{ position: 'static', marginTop: 8 }}>Send reset link</button>
      </form>
      <div style={{ marginTop: 12 }}>
        <Link to="/login">Back to login</Link>
      </div>
    </section>
  );
}
