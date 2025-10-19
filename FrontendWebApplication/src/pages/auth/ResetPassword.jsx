import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../api/authApi';
import { isStrongEnough } from '../../utils/validators';

/**
 * PUBLIC_INTERFACE
 * ResetPassword page allows user to reset password with token.
 */
export function ResetPassword() {
  const qs = new URLSearchParams(useLocation().search);
  const [token, setToken] = useState(qs.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    if (!isStrongEnough(password)) {
      setErr('Password must be at least 8 characters and include a number.');
      return;
    }
    if (password !== confirm) {
      setErr('Passwords do not match.');
      return;
    }
    try {
      await resetPassword({ token, password });
      setMsg('Password changed. Redirecting to login…');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (e2) {
      setErr(e2.message || 'Reset failed.');
    }
  };

  return (
    <section aria-labelledby="reset-title" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 id="reset-title">Reset your password</h1>
      {msg && <div role="status" style={{ color: 'green', marginBottom: 8 }}>{msg}</div>}
      {err && <div role="alert" style={{ color: 'crimson', marginBottom: 8 }}>{err}</div>}
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="token">Token</label>
          <input id="token" value={token} onChange={(e)=>setToken(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="password">New password</label>
          <input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }} />
        </div>
        <button type="submit" className="theme-toggle" style={{ position: 'static' }}>Reset password</button>
      </form>
      <div style={{ marginTop: 12 }}>
        <Link to="/login">Back to login</Link>
      </div>
    </section>
  );
}
