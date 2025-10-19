import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ProgressBar renders an accessible progress indicator.
 */
export function ProgressBar({ value = 0, max = 100, label = 'Progress', showLabel = true }) {
  const percent = Math.max(0, Math.min(100, Math.round((Number(value) / Number(max || 100)) * 100)));

  const containerStyle = {
    background: 'var(--border-color)',
    borderRadius: 8,
    height: 12,
    position: 'relative',
    overflow: 'hidden'
  };
  const barStyle = {
    width: `${percent}%`,
    background: 'var(--text-secondary)',
    height: '100%',
    transition: 'width 0.3s ease'
  };
  return (
    <div>
      {showLabel && (
        <div id="progressbar-label" style={{ fontSize: 12, marginBottom: 4, color: 'var(--text-primary)' }}>
          {label}: {percent}%
        </div>
      )}
      <div
        role="progressbar"
        aria-labelledby={showLabel ? 'progressbar-label' : undefined}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round((percent / 100) * (max || 100))}
        aria-valuetext={`${percent}%`}
        style={containerStyle}
      >
        <div style={barStyle} />
      </div>
    </div>
  );
}
