import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { verifyEmail } from '../../api/authApi';

/**
 * PUBLIC_INTERFACE
 * VerifyEmail page handles email verification via token param or button.
 */
export function VerifyEmail() {
  const location = useLocation();
  const [status, setStatus] = useState(null);
  const [token, setToken] = useState(new URLSearchParams(location.search).get('token') || '');

  const onVerify = async (e) => {
    e.preventDefault();
    setStatus('Verifying…');
    try {
      await verifyEmail(token);
      setStatus('Email verified! You can now log in.');
    } catch (e2) {
      setStatus(e2.message || 'Verification failed.');
    }
  };

  return (
    <section aria-labelledby="verify-title" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 id="verify-title">Verify your email</h1>
      <p>Paste your verification token if it did not auto-fill from the link.</p>
      <form onSubmit={onVerify}>
        <label htmlFor="token">Verification token</label>
        <input id="token" name="token" value={token} onChange={(e)=>setToken(e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }} />
        <button type="submit" className="theme-toggle" style={{ position: 'static', marginTop: 8 }}>Verify</button>
      </form>
      {status && <div role="status" style={{ marginTop: 12 }}>{status}</div>}
      <div style={{ marginTop: 12 }}>
        <Link to="/login">Back to login</Link>
      </div>
    </section>
  );
}
