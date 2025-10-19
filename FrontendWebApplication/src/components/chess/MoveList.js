import React from 'react';
import { toAlgebraic } from '../../utils/chessEngine';

/**
 * Accessible list of SAN-like moves.
 */

// PUBLIC_INTERFACE
export default function MoveList({ history = [] }) {
  /** Render a scrollable, accessible move list region. */
  function formatMoveSAN(m) {
    const from = toAlgebraic(m.from[0], m.from[1]);
    const to = toAlgebraic(m.to[0], m.to[1]);
    const cap = m.capture ? 'x' : '-';
    const promo = m.promotion ? `=${String(m.promotion).toUpperCase()}` : '';
    const castle = m.castle ? (m.castle === 'K' ? 'O-O' : 'O-O-O') : '';
    if (castle) return castle;
    return `${m.piece?.toUpperCase() === 'P' ? '' : m.piece?.toUpperCase() || ''}${from}${cap}${to}${promo}`;
  }

  return (
    <div aria-label="Move list" role="region" style={{ maxHeight: 220, overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: 8, padding: 8 }}>
      <ol style={{ margin: 0, paddingLeft: 18 }}>
        {history.map((m, idx) => {
          const san = formatMoveSAN(m);
          return <li key={`${m.from.join(',')}-${m.to.join(',')}-${idx}`}>{san}</li>;
        })}
      </ol>
    </div>
  );
}
