import React from 'react';

// PUBLIC_INTERFACE
export default function ProgressBar({ value = 0, label = 'Progress' }) {
  /** Simple ARIA-compliant progress bar. */
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div aria-label={label} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}
         style={{ background: 'var(--border-color)', borderRadius: 6, height: 12, width: '100%' }}>
      <div style={{ width: `${clamped}%`, background: 'var(--text-secondary)', height: '100%', borderRadius: 6 }} />
    </div>
  );
}
