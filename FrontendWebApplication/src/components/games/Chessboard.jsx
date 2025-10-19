import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * Chessboard displays a simple 8x8 board. It supports keyboard navigation:
 * - Arrow keys to move focus
 * - Enter/Space to select a square as from/to for a move
 * Exposes onMove({from, to}) callback using algebraic like "e2", "e4".
 */
export function Chessboard({ history = [], orientation = 'white', onMove }) {
  const files = ['a','b','c','d','e','f','g','h'];
  const ranks = ['8','7','6','5','4','3','2','1'];
  const orderFiles = orientation === 'white' ? files : files.slice().reverse();
  const orderRanks = orientation === 'white' ? ranks : ranks.slice().reverse();

  // Derive board from move history using our simplified format (uci-like).
  const startBoard = useMemo(() => createStartBoard(), []);
  const board = useMemo(() => {
    const b = startBoard.map(row => row.slice());
    const toIdx = (alg) => ({ r: 8 - parseInt(alg[1], 10), c: alg[0].charCodeAt(0) - 'a'.charCodeAt(0) });
    for (const m of history) {
      if (!m || m.length < 4) continue;
      const from = toIdx(m.slice(0,2));
      const to = toIdx(m.slice(2,4));
      b[to.r][to.c] = b[from.r][from.c];
      b[from.r][from.c] = null;
    }
    return b;
  }, [history, startBoard]);

  const gridRef = useRef(null);
  const [focus, setFocus] = useState({ r: 7, c: 0 }); // default a1
  const [selected, setSelected] = useState(null); // {r,c} or null

  useEffect(() => {
    // reset selection on history change
    setSelected(null);
  }, [history]);

  const onKeyDown = (e) => {
    const { r, c } = focus;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowUp') setFocus({ r: Math.max(0, r - 1), c });
    if (e.key === 'ArrowDown') setFocus({ r: Math.min(7, r + 1), c });
    if (e.key === 'ArrowLeft') setFocus({ r, c: Math.max(0, c - 1) });
    if (e.key === 'ArrowRight') setFocus({ r, c: Math.min(7, c + 1) });
    if (e.key === 'Home') setFocus({ r, c: 0 });
    if (e.key === 'End') setFocus({ r, c: 7 });
    if (e.key === 'PageUp') setFocus({ r: 0, c });
    if (e.key === 'PageDown') setFocus({ r: 7, c });

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleSquareSelect(focus.r, focus.c);
    }
  };

  const handleSquareSelect = (r, c) => {
    if (!selected) {
      setSelected({ r, c });
    } else {
      if (selected.r === r && selected.c === c) {
        setSelected(null);
        return;
      }
      const fromAlg = toAlg(selected.r, selected.c);
      const toAlg = toAlgCoord(r, c);
      onMove && onMove({ from: fromAlg, to: toAlg });
      setSelected(null);
    }
  };

  const toAlgCoord = (r, c) => `${String.fromCharCode('a'.charCodeAt(0)+c)}${8-r}`;
  const toAlg = (r, c) => toAlgCoord(r, c);

  const squareStyle = (rr, cc) => {
    const isLight = (rr + cc) % 2 === 0;
    const isSelected = selected && selected.r === rr && selected.c === cc;
    const isFocused = focus.r === rr && focus.c === cc;
    return {
      aspectRatio: '1',
      background: isSelected ? 'rgba(255, 193, 7, 0.8)' : (isLight ? '#F0D9B5' : '#B58863'),
      border: isFocused ? '3px solid var(--text-secondary)' : '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      fontWeight: 600,
      color: '#222',
      cursor: 'pointer',
      userSelect: 'none'
    };
  };

  const pieceSymbol = (p) => {
    if (!p) return '';
    const map = {
      wp: '♙', wr: '♖', wn: '♘', wb: '♗', wq: '♕', wk: '♔',
      bp: '♟', br: '♜', bn: '♞', bb: '♝', bq: '♛', bk: '♚',
    };
    return map[p] || '';
  };

  return (
    <div>
      <div
        ref={gridRef}
        role="grid"
        aria-label="Chessboard"
        tabIndex={0}
        onKeyDown={onKeyDown}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0, maxWidth: 480, outline: 'none' }}
      >
        {orderRanks.map((rankLabel, ri) => {
          const r = ranks.indexOf(rankLabel);
          return orderFiles.map((fileLabel, fi) => {
            const c = files.indexOf(fileLabel);
            const piece = board[r][c];
            const label = `${fileLabel}${rankLabel}`;
            return (
              <div
                key={`${label}`}
                role="gridcell"
                aria-label={`Square ${label}${piece ? ` with ${describePiece(piece)}` : ''}`}
                aria-selected={selected && selected.r === r && selected.c === c ? 'true' : 'false'}
                onClick={() => handleSquareSelect(r, c)}
                onFocus={() => setFocus({ r, c })}
                tabIndex={-1}
                style={squareStyle(r, c)}
              >
                <span aria-hidden="true">{pieceSymbol(piece)}</span>
              </div>
            );
          });
        })}
      </div>
      <div aria-hidden="true" style={{ marginTop: 8, fontSize: 12, color: 'var(--text-primary)' }}>
        Use arrow keys to move focus. Press Enter/Space to select from and to squares.
      </div>
    </div>
  );
}

function describePiece(p) {
  const color = p[0] === 'w' ? 'white' : 'black';
  const map = { p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king' };
  return `${color} ${map[p[1]] || 'piece'}`;
}

function createStartBoard() {
  const empty = Array.from({ length: 8 }, () => Array(8).fill(null));
  const back = ['r','n','b','q','k','b','n','r'];
  const board = empty.map(row => row.slice());
  board[0] = back.map(t => 'b' + t);
  board[1] = Array(8).fill('bp');
  board[6] = Array(8).fill('wp');
  board[7] = back.map(t => 'w' + t);
  return board;
}
