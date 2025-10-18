import React from 'react';

// PUBLIC_INTERFACE
export default function ChessboardPlaceholder({ rows = 8, cols = 8 }) {
  /** Accessible chessboard placeholder component (no logic yet). */
  const board = [];
  for (let r = 0; r < rows; r += 1) {
    const row = [];
    for (let c = 0; c < cols; c += 1) {
      const isDark = (r + c) % 2 === 1;
      row.push(
        <div
          key={`${r}-${c}`}
          role="gridcell"
          aria-label={`Square ${String.fromCharCode(65 + c)}${rows - r}`}
          style={{
            width: 40, height: 40,
            background: isDark ? '#769656' : '#eeeed2',
          }}
        />
      );
    }
    board.push(
      <div key={`row-${r}`} role="row" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 40px)` }}>
        {row}
      </div>
    );
  }

  return (
    <div role="grid" aria-label="Chessboard" style={{ display: 'inline-block', border: '2px solid #333' }}>
      {board}
    </div>
  );
}
