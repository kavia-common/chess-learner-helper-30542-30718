import React, { useState } from 'react';
import { resetPassword } from '../../services/authService';

// PUBLIC_INTERFACE
export default function ResetPassword() {
  /** Reset password with token (expects token via query string). */
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const token = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('token')
    : null;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setMsg('Password must be at least 8 characters.');
      return;
    }
    const res = await resetPassword(token, password);
    setMsg(res?.message || res?.error || 'Done');
  };

  return (
    <section>
      <h1>Reset Password</h1>
      <form onSubmit={onSubmit}>
        <label>New Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></label>
        <button className="btn btn-primary" type="submit">Reset</button>
      </form>
      {msg && <p role="status">{msg}</p>}
    </section>
  );
}
