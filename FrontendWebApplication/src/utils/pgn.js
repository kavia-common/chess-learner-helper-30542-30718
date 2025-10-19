//
// Minimal PGN utilities: parse headers, moves, and render helpers.
// Supports basic SAN tokens (including O-O, O-O-O) and extracts clock, result, etc.
// This is intentionally lightweight and tolerant to run without external deps.
//

// PUBLIC_INTERFACE
export function parsePGN(pgnString) {
  /** Parse a PGN string into an object with headers and move list. */
  if (typeof pgnString !== 'string') return { headers: {}, moves: [], result: '*' };
  const headers = {};
  const lines = pgnString.split(/\r?\n/);
  let inHeaders = true;
  let bodyLines = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (inHeaders && trimmed.startsWith('[') && trimmed.endsWith(']')) {
      // Header like [Event "Casual Game"]
      const m = trimmed.match(/^\[([A-Za-z0-9_]+)\s+"(.*)"\]$/);
      if (m) {
        headers[m[1]] = m[2];
      }
    } else {
      inHeaders = false;
      if (trimmed.length) bodyLines.push(trimmed);
    }
  }

  const body = bodyLines.join(' ').replace(/\s+/g, ' ').trim();
  // Remove comments { ... } and ; to end
  const bodyNoComments = body
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/;[^\n\r]*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split on spaces and filter out move numbers like "1.", "23...", and results like "1-0"
  const rawTokens = bodyNoComments.split(' ').filter(Boolean);

  const resultToken = rawTokens.find(t => t === '1-0' || t === '0-1' || t === '1/2-1/2' || t === '*');
  const result = resultToken || headers.Result || '*';

  // Basic SAN token detection. We keep castle notations and usual SAN.
  const isNumber = (t) => /^\d+\.+$/.test(t) || /^\d+\.\.\.$/.test(t) || /^\d+\.$/.test(t);
  const isResult = (t) => t === '1-0' || t === '0-1' || t === '1/2-1/2' || t === '*';
  const isNAG = (t) => /^\$\d+$/.test(t);

  const moveTokens = rawTokens.filter(t => !isNumber(t) && !isResult(t) && !isNAG(t));

  // Pair white/black moves into array [{ ply:1, w:'e4', b:'e5' }, ...]
  const moves = [];
  for (let i = 0, ply = 1; i < moveTokens.length; ply++) {
    const white = moveTokens[i++];
    if (!white) break;
    const black = moveTokens[i];
    const isBlackMove = black && !/^\d/.test(black) && !isResult(black);
    const pair = { ply, w: sanitizeSAN(white) };
    if (isBlackMove) {
      pair.b = sanitizeSAN(black);
      i++;
    }
    moves.push(pair);
  }

  return { headers, moves, result };
}

function sanitizeSAN(san) {
  // Remove trailing annotations like "!" "?" "!?","!?" combinations and check/checkmate "+" "#"
  return String(san).replace(/[!?+#]+$/g, '');
}

// PUBLIC_INTERFACE
export function renderPGN({ headers = {}, moves = [], result = '*' }) {
  /** Render a PGN object back into a PGN string with headers and numbered moves. */
  const headerLines = Object.entries(headers).map(([k, v]) => `[${k} "${v}"]`);
  const moveLines = [];
  for (const m of moves) {
    const moveNo = `${m.ply}.`;
    if (m.b) {
      moveLines.push(`${moveNo} ${m.w} ${m.b}`);
    } else {
      moveLines.push(`${moveNo} ${m.w}`);
    }
  }
  const body = `${moveLines.join(' ')} ${result}`.trim();
  return `${headerLines.join('\n')}\n\n${body}`.trim();
}

// PUBLIC_INTERFACE
export function extractMovesList(pgnString) {
  /** Return flat SAN array in order [w1, b1, w2, b2, ...] for convenience. */
  const { moves } = parsePGN(pgnString);
  const flat = [];
  for (const m of moves) {
    if (m.w) flat.push(m.w);
    if (m.b) flat.push(m.b);
  }
  return flat;
}

// PUBLIC_INTERFACE
export function summarizeGame(pgnString) {
  /** Lightweight summary from PGN headers (Event, Site, Date, White, Black, Result). */
  const { headers, result } = parsePGN(pgnString);
  const summary = {
    event: headers.Event || 'Casual',
    site: headers.Site || '—',
    date: headers.Date || headers.UTCDate || '—',
    white: headers.White || 'White',
    black: headers.Black || 'Black',
    result: result || headers.Result || '*',
  };
  return summary;
}
