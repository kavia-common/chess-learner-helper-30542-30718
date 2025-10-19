//
// Simple chess logic with move validation and a basic AI.
//
// This is a lightweight, dependency-free chess engine suitable for practice mode.
// It supports: board initialization, legal move generation for all pieces,
// check/checkmate detection (basic), move execution/undo, simple evaluation,
// and an AI that searches to a limited depth based on difficulty.
//
// Note: This is intentionally simplified and not FIDE-complete. Edge cases like
// threefold repetition or fifty-move rule are not handled. En-passant and castling
// are implemented in a basic manner. This is adequate for practice and hints.

const FILES = ['a','b','c','d','e','f','g','h'];

// Piece helpers
function isWhite(piece) { return piece && piece.toUpperCase() === piece; }
function isBlack(piece) { return piece && piece.toLowerCase() === piece; }
function pieceColor(piece) { return isWhite(piece) ? 'w' : isBlack(piece) ? 'b' : null; }

// Initial board FEN-like array (8x8)
// Uppercase = White, lowercase = Black
export const START_FEN = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R'],
];

// Clone helpers
function cloneBoard(board) {
  return board.map(row => row.slice());
}

// Convert (r,c) to algebraic like "e4"
export function toAlgebraic(r, c) {
  const file = FILES[c];
  const rank = 8 - r;
  return `${file}${rank}`;
}

// Convert algebraic "e4" to [r,c]
export function fromAlgebraic(square) {
  const file = square[0];
  const rank = Number(square[1]);
  const c = FILES.indexOf(file);
  const r = 8 - rank;
  return [r, c];
}

// Generate all legal moves for current side to move
// Returns array of move objects: { from: [r,c], to: [r,c], piece, capture?: piece, promotion?: 'Q', castle?: 'K'|'Q', enPassant?: true }
export function generateMoves(state) {
  const { board, turn, enPassantTarget, castling } = state;
  const moves = [];

  function addMove(from, to, extra = {}) {
    const [fr, fc] = from;
    const [tr, tc] = to;
    const move = { from: [fr, fc], to: [tr, tc], piece: board[fr][fc], ...extra };
    // Only add legal moves (avoid leaving own king in check)
    if (isLegalMove(state, move)) {
      moves.push(move);
    }
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      if (turn === 'w' && !isWhite(p)) continue;
      if (turn === 'b' && !isBlack(p)) continue;

      const lower = p.toLowerCase();
      if (lower === 'p') {
        genPawnMoves(state, r, c, addMove);
      } else if (lower === 'n') {
        genKnightMoves(state, r, c, addMove);
      } else if (lower === 'b') {
        genSlidingMoves(state, r, c, addMove, [[1,1],[1,-1],[-1,1],[-1,-1]]);
      } else if (lower === 'r') {
        genSlidingMoves(state, r, c, addMove, [[1,0],[-1,0],[0,1],[0,-1]]);
      } else if (lower === 'q') {
        genSlidingMoves(state, r, c, addMove, [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]);
      } else if (lower === 'k') {
        genKingMoves(state, r, c, addMove, castling);
      }
    }
  }

  // Add en passant target moves if applicable are already handled in genPawnMoves via enPassantTarget
  return moves;
}

function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

function genPawnMoves(state, r, c, addMove) {
  const { board, turn, enPassantTarget } = state;
  const piece = board[r][c];
  const dir = isWhite(piece) ? -1 : 1; // white moves up (towards r=0), black down
  const startRank = isWhite(piece) ? 6 : 1;

  // Forward one
  const r1 = r + dir;
  if (inBounds(r1,c) && !board[r1][c]) {
    // Promotion
    if (r1 === 0 || r1 === 7) {
      addMove([r,c],[r1,c],{ promotion: isWhite(piece) ? 'Q' : 'q' });
    } else {
      addMove([r,c],[r1,c]);
    }
    // Forward two from start
    if (r === startRank) {
      const r2 = r + 2*dir;
      if (inBounds(r2,c) && !board[r2][c]) {
        addMove([r,c],[r2,c], { doubleStepPawn: true });
      }
    }
  }
  // Captures
  for (const dc of [-1, 1]) {
    const cc = c + dc;
    if (!inBounds(r1, cc)) continue;
    const target = board[r1][cc];
    if (target && pieceColor(target) && pieceColor(target) !== pieceColor(piece)) {
      if (r1 === 0 || r1 === 7) {
        addMove([r,c],[r1,cc], { capture: target, promotion: isWhite(piece) ? 'Q' : 'q' });
      } else {
        addMove([r,c],[r1,cc], { capture: target });
      }
    } else if (!target && enPassantTarget) {
      // en passant: capture square empty but target equals enPassantTarget
      const [er, ec] = enPassantTarget;
      if (er === r1 && ec === cc) {
        addMove([r,c],[r1,cc], { enPassant: true, capture: isWhite(piece) ? 'p' : 'P' });
      }
    }
  }
}

function genKnightMoves(state, r, c, addMove) {
  const { board } = state;
  const piece = board[r][c];
  const deltas = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[-1,2],[1,-2],[-1,-2]];
  for (const [dr,dc] of deltas) {
    const rr = r + dr, cc = c + dc;
    if (!inBounds(rr,cc)) continue;
    const target = board[rr][cc];
    if (!target || pieceColor(target) !== pieceColor(piece)) {
      addMove([r,c],[rr,cc], target ? { capture: target } : {});
    }
  }
}

function genSlidingMoves(state, r, c, addMove, directions) {
  const { board } = state;
  const piece = board[r][c];
  for (const [dr,dc] of directions) {
    let rr = r + dr, cc = c + dc;
    while (inBounds(rr,cc)) {
      const target = board[rr][cc];
      if (!target) {
        addMove([r,c],[rr,cc]);
      } else {
        if (pieceColor(target) !== pieceColor(piece)) {
          addMove([r,c],[rr,cc], { capture: target });
        }
        break;
      }
      rr += dr; cc += dc;
    }
  }
}

function genKingMoves(state, r, c, addMove, castling) {
  const { board, turn } = state;
  const piece = board[r][c];
  for (let dr=-1; dr<=1; dr++) {
    for (let dc=-1; dc<=1; dc++) {
      if (dr===0 && dc===0) continue;
      const rr = r + dr, cc = c + dc;
      if (!inBounds(rr,cc)) continue;
      const target = board[rr][cc];
      if (!target || pieceColor(target) !== pieceColor(piece)) {
        addMove([r,c],[rr,cc], target ? { capture: target } : {});
      }
    }
  }
  // Castling (basic check: squares empty and not in check)
  if (turn === 'w' && r === 7 && c === 4) {
    if (castling.wK && !board[7][5] && !board[7][6] && !squareAttacked(state, [7,4], 'b') && !squareAttacked(state, [7,5], 'b') && !squareAttacked(state, [7,6], 'b')) {
      addMove([7,4],[7,6], { castle: 'K' });
    }
    if (castling.wQ && !board[7][1] && !board[7][2] && !board[7][3] && !squareAttacked(state, [7,4], 'b') && !squareAttacked(state, [7,3], 'b') && !squareAttacked(state, [7,2], 'b')) {
      addMove([7,4],[7,2], { castle: 'Q' });
    }
  }
  if (turn === 'b' && r === 0 && c === 4) {
    if (castling.bK && !board[0][5] && !board[0][6] && !squareAttacked(state, [0,4], 'w') && !squareAttacked(state, [0,5], 'w') && !squareAttacked(state, [0,6], 'w')) {
      addMove([0,4],[0,6], { castle: 'K' });
    }
    if (castling.bQ && !board[0][1] && !board[0][2] && !board[0][3] && !squareAttacked(state, [0,4], 'w') && !squareAttacked(state, [0,3], 'w') && !squareAttacked(state, [0,2], 'w')) {
      addMove([0,4],[0,2], { castle: 'Q' });
    }
  }
}

// Apply move and return new state
export function makeMove(state, move) {
  const ns = {
    board: cloneBoard(state.board),
    turn: state.turn === 'w' ? 'b' : 'w',
    enPassantTarget: null,
    castling: { ...state.castling },
    halfMove: state.halfMove + 1,
    fullMove: state.fullMove + (state.turn === 'b' ? 1 : 0),
    history: state.history ? [...state.history] : [],
  };

  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = state.board[fr][fc];
  let moved = piece;

  // Reset halfMove on capture or pawn move
  if (move.capture || piece.toLowerCase() === 'p') {
    ns.halfMove = 0;
  }

  // Move piece
  ns.board[fr][fc] = null;

  // En passant
  if (move.enPassant) {
    ns.board[tr][tc] = piece;
    // Remove captured pawn behind target square
    const dir = isWhite(piece) ? 1 : -1; // captured pawn sits one rank behind landing square
    ns.board[tr + dir][tc] = null;
  } else if (move.castle) {
    ns.board[tr][tc] = piece;
    // Move rook
    if (move.castle === 'K') {
      // king side
      ns.board[tr][tc - 1] = ns.board[tr][7];
      ns.board[tr][7] = null;
    } else {
      // queen side
      ns.board[tr][tc + 1] = ns.board[tr][0];
      ns.board[tr][0] = null;
    }
  } else {
    // Promotion
    if (move.promotion) {
      const promo = isWhite(piece) ? move.promotion.toUpperCase() : move.promotion.toLowerCase();
      ns.board[tr][tc] = promo;
      moved = promo;
    } else {
      ns.board[tr][tc] = piece;
    }
  }

  // Update castling rights if king or rook moved/captured
  if (piece === 'K') {
    ns.castling.wK = false; ns.castling.wQ = false;
  }
  if (piece === 'k') {
    ns.castling.bK = false; ns.castling.bQ = false;
  }
  if (piece === 'R') {
    if (fr === 7 && fc === 0) ns.castling.wQ = false;
    if (fr === 7 && fc === 7) ns.castling.wK = false;
  }
  if (piece === 'r') {
    if (fr === 0 && fc === 0) ns.castling.bQ = false;
    if (fr === 0 && fc === 7) ns.castling.bK = false;
  }
  // If a rook got captured, update castling rights
  if (move.capture) {
    const captured = move.capture;
    if (captured === 'R') {
      if (tr === 7 && tc === 0) ns.castling.wQ = false;
      if (tr === 7 && tc === 7) ns.castling.wK = false;
    }
    if (captured === 'r') {
      if (tr === 0 && tc === 0) ns.castling.bQ = false;
      if (tr === 0 && tc === 7) ns.castling.bK = false;
    }
  }

  // Set enPassantTarget if double step pawn
  if (move.doubleStepPawn) {
    const epRow = (fr + tr) / 2;
    ns.enPassantTarget = [epRow, fc];
  }

  ns.history.push(move);
  return ns;
}

// Check if move leaves own king in check
export function isLegalMove(state, move) {
  const after = makeMoveRaw(state, move);
  if (!after) return false;
  const own = pieceColor(state.board[move.from[0]][move.from[1]]);
  const kingPos = findKing(after.board, own);
  if (!kingPos) return false;
  return !squareAttacked(after, kingPos, own === 'w' ? 'b' : 'w');
}

// Raw apply without legality check; used by isLegalMove
function makeMoveRaw(state, move) {
  const ns = {
    board: cloneBoard(state.board),
    turn: state.turn === 'w' ? 'b' : 'w',
    enPassantTarget: null,
    castling: { ...state.castling },
    halfMove: state.halfMove + 1,
    fullMove: state.fullMove + (state.turn === 'b' ? 1 : 0),
    history: state.history ? [...state.history] : [],
  };
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = state.board[fr][fc];
  if (!piece) return null;
  ns.board[fr][fc] = null;

  if (move.enPassant) {
    ns.board[tr][tc] = piece;
    const dir = isWhite(piece) ? 1 : -1;
    ns.board[tr + dir][tc] = null;
  } else if (move.castle) {
    ns.board[tr][tc] = piece;
    if (move.castle === 'K') {
      ns.board[tr][tc - 1] = ns.board[tr][7];
      ns.board[tr][7] = null;
    } else {
      ns.board[tr][tc + 1] = ns.board[tr][0];
      ns.board[tr][0] = null;
    }
  } else {
    if (move.promotion) {
      const promo = isWhite(piece) ? move.promotion.toUpperCase() : move.promotion.toLowerCase();
      ns.board[tr][tc] = promo;
    } else {
      ns.board[tr][tc] = piece;
    }
  }

  // Update castling rights rough (enough for legality test)
  if (piece === 'K') { ns.castling.wK = false; ns.castling.wQ = false; }
  if (piece === 'k') { ns.castling.bK = false; ns.castling.bQ = false; }
  if (piece === 'R') {
    if (fr === 7 && fc === 0) ns.castling.wQ = false;
    if (fr === 7 && fc === 7) ns.castling.wK = false;
  }
  if (piece === 'r') {
    if (fr === 0 && fc === 0) ns.castling.bQ = false;
    if (fr === 0 && fc === 7) ns.castling.bK = false;
  }
  if (move.doubleStepPawn) {
    const epRow = (fr + tr) / 2;
    ns.enPassantTarget = [epRow, fc];
  }

  ns.history.push(move);
  return ns;
}

function findKing(board, color) {
  const target = color === 'w' ? 'K' : 'k';
  for (let r=0;r<8;r++) {
    for (let c=0;c<8;c++) {
      if (board[r][c] === target) return [r,c];
    }
  }
  return null;
}

// Determine if a square is attacked by color 'attackerColor'
export function squareAttacked(state, [r, c], attackerColor) {
  const { board } = state;

  // Pawns
  const dir = attackerColor === 'w' ? -1 : 1;
  for (const dc of [-1,1]) {
    const rr = r + dir, cc = c + dc;
    if (inBounds(rr,cc)) {
      const p = board[rr][cc];
      if (attackerColor === 'w' && p === 'P') return true;
      if (attackerColor === 'b' && p === 'p') return true;
    }
  }

  // Knights
  const knightD = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[-1,2],[1,-2],[-1,-2]];
  for (const [dr,dc] of knightD) {
    const rr = r + dr, cc = c + dc;
    if (inBounds(rr,cc)) {
      const p = board[rr][cc];
      if (attackerColor === 'w' && p === 'N') return true;
      if (attackerColor === 'b' && p === 'n') return true;
    }
  }

  // Bishops/Queens diagonals
  const diag = [[1,1],[1,-1],[-1,1],[-1,-1]];
  for (const [dr,dc] of diag) {
    let rr = r + dr, cc = c + dc;
    while (inBounds(rr,cc)) {
      const p = board[rr][cc];
      if (p) {
        if (attackerColor === 'w' && (p === 'B' || p === 'Q')) return true;
        if (attackerColor === 'b' && (p === 'b' || p === 'q')) return true;
        break;
      }
      rr += dr; cc += dc;
    }
  }

  // Rooks/Queens straight
  const straight = [[1,0],[-1,0],[0,1],[0,-1]];
  for (const [dr,dc] of straight) {
    let rr = r + dr, cc = c + dc;
    while (inBounds(rr,cc)) {
      const p = board[rr][cc];
      if (p) {
        if (attackerColor === 'w' && (p === 'R' || p === 'Q')) return true;
        if (attackerColor === 'b' && (p === 'r' || p === 'q')) return true;
        break;
      }
      rr += dr; cc += dc;
    }
  }

  // Kings (adjacent)
  for (let dr=-1; dr<=1; dr++) {
    for (let dc=-1; dc<=1; dc++) {
      if (dr===0 && dc===0) continue;
      const rr = r + dr, cc = c + dc;
      if (!inBounds(rr,cc)) continue;
      const p = board[rr][cc];
      if (attackerColor === 'w' && p === 'K') return true;
      if (attackerColor === 'b' && p === 'k') return true;
    }
  }

  return false;
}

export function isCheck(state, color) {
  const king = findKing(state.board, color);
  if (!king) return false;
  return squareAttacked(state, king, color === 'w' ? 'b' : 'w');
}

export function isCheckmate(state, color) {
  if (!isCheck(state, color)) return false;
  const moves = generateMoves({ ...state, turn: color });
  return moves.length === 0;
}

export function isStalemate(state, color) {
  if (isCheck(state, color)) return false;
  const moves = generateMoves({ ...state, turn: color });
  return moves.length === 0;
}

// Evaluation function: material + simple mobility
const PIECE_VALUES = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 0
};

function evaluate(state) {
  let score = 0;
  const { board } = state;
  for (let r=0;r<8;r++) {
    for (let c=0;c<8;c++) {
      const p = board[r][c];
      if (!p) continue;
      const val = PIECE_VALUES[p.toLowerCase()] || 0;
      score += isWhite(p) ? val : -val;
    }
  }
  // Add small mobility
  const wm = generateMoves({ ...state, turn: 'w' }).length;
  const bm = generateMoves({ ...state, turn: 'b' }).length;
  score += (wm - bm) * 2;
  return score;
}

// Minimax with depth limit and basic pruning
function minimax(state, depth, alpha, beta, maximizing) {
  if (depth === 0) {
    return { score: evaluate(state) };
  }
  const moves = generateMoves(state);
  if (moves.length === 0) {
    if (isCheck(state, state.turn)) {
      return { score: maximizing ? -99999 : 99999 };
    }
    return { score: 0 }; // stalemate
  }

  let bestMove = null;

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const child = makeMove(state, move);
      const res = minimax(child, depth - 1, alpha, beta, false);
      if (res.score > maxEval) {
        maxEval = res.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, res.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const child = makeMove(state, move);
      const res = minimax(child, depth - 1, alpha, beta, true);
      if (res.score < minEval) {
        minEval = res.score;
        bestMove = move;
      }
      beta = Math.min(beta, res.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}

// PUBLIC_INTERFACE
export function createInitialState() {
  /** Create initial chess state for a new game. */
  return {
    board: cloneBoard(START_FEN),
    turn: 'w',
    enPassantTarget: null,
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    halfMove: 0,
    fullMove: 1,
    history: [],
  };
}

// PUBLIC_INTERFACE
export function getLegalMoves(state, from) {
  /** Get all legal moves from a specific square. */
  const moves = generateMoves(state);
  return moves.filter(m => m.from[0] === from[0] && m.from[1] === from[1]);
}

// PUBLIC_INTERFACE
export function aiChooseMove(state, difficulty = 'beginner') {
  /** Choose a move for the AI based on difficulty. */
  const depth = difficultyDepth(difficulty);
  // For speed, if depth 0, just pick random legal
  const moves = generateMoves(state);
  if (moves.length === 0) return null;
  if (depth <= 0) {
    return pickHeuristicMove(state, moves, difficulty);
  }
  const maximizing = state.turn === 'w';
  const res = minimax(state, depth, -Infinity, Infinity, maximizing);
  return res.move || pickHeuristicMove(state, moves, difficulty);
}

function difficultyDepth(level) {
  switch (String(level).toLowerCase()) {
    case 'beginner': return 0; // random with capture bias
    case 'intermediate': return 1;
    case 'advanced': return 2;
    default: return 0;
  }
}

function pickHeuristicMove(state, moves, difficulty) {
  // Prefer captures or promotions slightly on beginner
  const captureMoves = moves.filter(m => m.capture || m.promotion);
  if (captureMoves.length && Math.random() < 0.7) {
    return captureMoves[Math.floor(Math.random() * captureMoves.length)];
  }
  // Otherwise random legal move
  return moves[Math.floor(Math.random() * moves.length)];
}
