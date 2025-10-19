import React from 'react';

/**
 * PUBLIC_INTERFACE
 * SocialLoginButtons renders buttons for OAuth login and calls backend endpoints (placeholder).
 * If the API base is not configured, it no-ops and shows an alert.
 */
export function SocialLoginButtons() {
  const base = process.env.REACT_APP_API_BASE_URL;

  const handleOauth = (provider) => (e) => {
    e.preventDefault();
    if (!base) {
      // Accessible alert for demo mode
      alert('OAuth not configured. Set REACT_APP_API_BASE_URL to enable.');
      return;
    }
    // Redirect to backend OAuth endpoint
    window.location.href = `${base}/auth/oauth/${provider}`;
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
    <div role="group" aria-label="Social sign in options" style={{ display: 'grid', gap: 8 }}>
      <button type="button" style={btnStyle} onClick={handleOauth('google')} aria-label="Continue with Google">
        Continue with Google
      </button>
      <button type="button" style={btnStyle} onClick={handleOauth('facebook')} aria-label="Continue with Facebook">
        Continue with Facebook
      </button>
      <button type="button" style={btnStyle} onClick={handleOauth('github')} aria-label="Continue with GitHub">
        Continue with GitHub
      </button>
    </div>
  );
}
