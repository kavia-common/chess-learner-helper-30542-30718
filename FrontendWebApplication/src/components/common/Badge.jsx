import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Badge renders an achievement badge with accessible labeling.
 */
export function Badge({ name, description, earned = false, icon = '🏆' }) {
  const style = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    opacity: earned ? 1 : 0.6,
  };
  return (
    <div role="group" aria-label={`${name} badge`} style={style}>
      <span aria-hidden="true" style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{name} {earned ? '' : '(Locked)'}</div>
        {description && <div style={{ fontSize: 12 }}>{description}</div>}
      </div>
    </div>
  );
}
