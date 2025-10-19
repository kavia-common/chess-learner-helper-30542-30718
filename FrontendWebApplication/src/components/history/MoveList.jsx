import React from 'react';

/**
 * PUBLIC_INTERFACE
 * MoveList renders an accessible list of moves with selectable ply index.
 */
export function MoveList({ moves = [], currentPly = 0, onSelect = () => {} }) {
  if (!Array.isArray(moves)) moves = [];
  const items = moves;

  return (
    <ol aria-label="Moves list" style={{ maxHeight: 260, overflow: 'auto', paddingLeft: 18, marginTop: 0 }}>
      {items.map((m, idx) => {
        const isActive = idx === currentPly;
        return (
          <li key={`${m}-${idx}`}>
            <button
              type="button"
              onClick={() => onSelect(idx)}
              aria-current={isActive ? 'true' : undefined}
              style={{
                border: '1px solid var(--border-color)',
                background: isActive ? 'rgba(97, 218, 251, 0.2)' : 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                padding: '4px 8px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <code>{m}</code>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
