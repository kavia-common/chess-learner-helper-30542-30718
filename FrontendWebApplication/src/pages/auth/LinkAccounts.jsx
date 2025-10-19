import React, { useState } from 'react';
import { linkProvider } from '../../api/authApi';

/**
 * PUBLIC_INTERFACE
 * LinkAccounts page provides simple UI to link social providers to current account.
 */
export function LinkAccounts() {
  const [status, setStatus] = useState('');

  const onLink = (provider) => async () => {
    setStatus(`Linking ${provider}…`);
    try {
      await linkProvider(provider, {});
      setStatus(`Linked ${provider} successfully.`);
    } catch (e) {
      setStatus(e.message || `Failed to link ${provider}.`);
    }
  };

  const btnStyle = {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    width: '100%',
  };

  return (
    <section aria-labelledby="link-title" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1 id="link-title">Link social accounts</h1>
      <div role="group" aria-label="Social providers" style={{ display: 'grid', gap: 8 }}>
        <button type="button" style={btnStyle} onClick={onLink('google')}>Link Google</button>
        <button type="button" style={btnStyle} onClick={onLink('facebook')}>Link Facebook</button>
        <button type="button" style={btnStyle} onClick={onLink('github')}>Link GitHub</button>
      </div>
      {status && <div role="status" style={{ marginTop: 12 }}>{status}</div>}
    </section>
  );
}
