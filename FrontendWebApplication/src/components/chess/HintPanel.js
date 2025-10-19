import React from 'react';

// PUBLIC_INTERFACE
export default function HintPanel({ onHint, disabled, difficulty = 'beginner' }) {
  /** Simple hint panel with button; respects disabled state and shows difficulty. */
  return (
    <div role="region" aria-label="Hints" style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 8 }}>
      <div style={{ marginBottom: 6, fontWeight: 600 }}>Hints</div>
      <p style={{ marginTop: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
        Get a suggestion for your next move. Hints consider current difficulty.
      </p>
      <button className="btn small" onClick={onHint} disabled={disabled} aria-busy={disabled}>
        {disabled ? 'Thinking…' : `Get hint (${difficulty})`}
      </button>
    </div>
  );
}
