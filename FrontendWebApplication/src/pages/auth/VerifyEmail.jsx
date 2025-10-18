import React, { useEffect, useState } from 'react';
import { verifyEmail } from '../../services/authService';

// PUBLIC_INTERFACE
export default function VerifyEmail() {
  /** Handles email verification using token from query string. */
  const [msg, setMsg] = useState('Verifying...');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    verifyEmail(token).then(res => setMsg(res?.message || res?.error || 'Verified'));
  }, []);

  return (
    <section>
      <h1>Email Verification</h1>
      <p role="status">{msg}</p>
    </section>
  );
}
