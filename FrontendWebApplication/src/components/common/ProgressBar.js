import React from 'react';

// PUBLIC_INTERFACE
export default function ProgressBar({ value = 0, max = 100, label = 'Progress' }) {
  /** Accessible progress bar with ARIA attributes. */
  const clampedMax = Math.max(1, Number(max) || 1);
  const clampedValue = Math.min(Math.max(0, Number(value) || 0), clampedMax);
  const pct = Math.round((clampedValue / clampedMax) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={clampedMax}
      aria-valuenow={clampedValue}
      style={{
        width: '100%',
        height: 12,
        borderRadius: 8,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: 'var(--button-bg)',
          transition: 'width 200ms ease'
        }}
      />
    </div>
  );
}
