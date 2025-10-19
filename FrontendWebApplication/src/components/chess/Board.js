import React from 'react';
import { toAlgebraic } from '../../utils/chessEngine';

/**
 * Lightweight, dependency-free Chess Board component with keyboard accessibility.
 * Renders an 8x8 grid of squares with optional highlights and click/keyboard handlers.
 */

// PUBLIC_INTERFACE
export default function Board({
  board,
  selected,           // [r,c] or null
  legalTargets = [],   // array of [r,c]
  lastMove = null,     // { from:[r,c], to:[r,c] } or null
  turn = 'w',
  onSquareClick,       // (r,c) => void
  onSquareKeyDown,     // (event, r,c) => void
}) {
  /** Accessible chessboard using role="grid". */
  const lastMoveSquares = React.useMemo(() => {
    if (!lastMove) return new Set();
    const a = toAlgebraic(lastMove.from[0], lastMove.from[1]);
    const b = toAlgebraic(lastMove.to[0], lastMove.to[1]);
    return new Set([a, b]);
  }, [lastMove]);

  function pieceColor(p) {
    if (!p) return null;
    return p === p.toUpperCase() ? 'w' : 'b';
  }

  function unicodePiece(p) {
    const map = {
      'K':'♔','Q':'♕','R':'♖','B':'♗','N':'♘','P':'♙',
      'k':'♚','q':'♛','r':'♜','b':'♝','n':'♞','p':'♟︎'
    };
    return map[p] || '·';
  }
  function pieceLabel(p) {
    const m = { K:'White King', Q:'White Queen', R:'White Rook', B:'White Bishop', N:'White Knight', P:'White Pawn',
                k:'Black King', q:'Black Queen', r:'Black Rook', b:'Black Bishop', n:'Black Knight', p:'Black Pawn' };
    return m[p] || 'Piece';
  }

  return (
    <div
      role="grid"
      aria-label="Chess board"
      style={{
        width: '100%',
        maxWidth: 520,
        aspectRatio: '1 / 1',
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gridTemplateRows: 'repeat(8, 1fr)',
        border: '1px solid var(--border-color)',
        borderRadius: 8,
        overflow: 'hidden'
      }}
    >
      {board.map((row, r) => row.map((piece, c) => {
        const isDark = (r + c) % 2 === 1;
        const coords = toAlgebraic(r, c);
        const isFocused = selected && selected[0] === r && selected[1] === c;
        const isLast = lastMoveSquares.has(coords);
        const isLegalT = legalTargets.some(([rr, cc]) => rr === r && cc === c);
        const selectable = piece && pieceColor(piece) === turn;

        const bg = isDark ? 'var(--bg-secondary)' : 'var(--bg-primary)';
        const border = isFocused ? '2px solid var(--button-bg)' : '1px solid var(--border-color)';
        const outline = isLast ? '2px solid #7bb0ff' : 'none';
        const highlight = isLegalT ? 'inset 0 0 0 3px rgba(43,134,255,0.4)' : 'none';

        const label = piece ? `${pieceLabel(piece)} on ${coords}` : `Empty ${coords}`;

        return (
          <button
            key={coords}
            aria-label={label + (selectable ? ' selectable' : '')}
            role="gridcell"
            onClick={() => onSquareClick?.(r, c)}
            onKeyDown={(e) => onSquareKeyDown?.(e, r, c)}
            tabIndex={0}
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              background: bg,
              color: 'var(--text-primary)',
              border,
              outline,
              position: 'relative',
              cursor: 'pointer'
            }}
            data-coords={coords}
          >
            {piece && (
              <span style={{ fontSize: 'min(5.2vw, 36px)' }} aria-hidden="true">
                {unicodePiece(piece)}
              </span>
            )}
            {isLegalT && (
              <span aria-hidden="true" style={{
                position: 'absolute',
                inset: 4,
                borderRadius: 6,
                boxShadow: highlight
              }} />
            )}
          </button>
        );
      }))}
    </div>
  );
}
