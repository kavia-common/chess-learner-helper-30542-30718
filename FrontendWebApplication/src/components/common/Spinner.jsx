import React from 'react';

/**
 * Simple accessible spinner for loading states.
 */

// PUBLIC_INTERFACE
export default function Spinner({ size = 40, label = 'Loading...', inline = false }) {
  /** Accessible spinner with ARIA live region and visually hidden label. */
  const style = {
    width: size,
    height: size,
    border: `${Math.max(2, Math.floor(size / 10))}px solid #e5e7eb`,
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const container = inline
    ? { display: 'inline-flex', alignItems: 'center', gap: 8 }
    : { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px 0' };

  return (
    <div role="status" aria-live="polite" aria-label={label} style={container}>
      <style>
        {`@keyframes spin{to{transform:rotate(360deg)}}`}
      </style>
      <div style={style} />
      <span style={{ fontSize: 14, color: '#6b7280' }}>{label}</span>
    </div>
  );
}
