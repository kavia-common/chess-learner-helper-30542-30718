import React, { useState } from 'react';
import { requestPasswordReset } from '../../services/authService';

// PUBLIC_INTERFACE
export default function ForgotPassword() {
  /** Request password reset page. */
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await requestPasswordReset(email);
    setMsg(res?.message || 'If an account exists, a reset link has been sent.');
  };

  return (
    <section>
      <h1>Forgot Password</h1>
      <form onSubmit={onSubmit}>
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <button className="btn" type="submit">Send reset link</button>
      </form>
      {msg && <p role="status">{msg}</p>}
    </section>
  );
}
