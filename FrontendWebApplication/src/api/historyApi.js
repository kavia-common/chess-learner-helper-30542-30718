const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Build URL if base is configured; otherwise return null to enable graceful no-backend mode.
 */
function buildUrl(path) {
  if (!API_BASE_URL) return null;
  return `${API_BASE_URL}${path}`;
}

/**
 * Internal safe fetch that returns a consistent interface and does not throw on network errors.
 */
async function safeFetch(url, options = {}) {
  if (!url) {
    // No-backend mode: return empty 204 response
    return { ok: true, status: 204, json: async () => ({}), text: async () => '' };
  }
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    return res;
  } catch (e) {
    return {
      ok: false,
      status: 0,
      json: async () => ({ message: e?.message || 'Network error' }),
      text: async () => e?.message || 'Network error',
    };
  }
}

// PUBLIC_INTERFACE
export async function listHistory({ page = 1, pageSize = 10, result = 'all' } = {}) {
  /**
   * Fetch a paginated list of game history. Returns { items, page, pageSize, total }.
   */
  const search = new URLSearchParams();
  search.set('page', String(page));
  search.set('pageSize', String(pageSize));
  if (result && result !== 'all') search.set('result', result);
  const res = await safeFetch(buildUrl(`/history?${search.toString()}`), { method: 'GET' });
  if (res.status === 204) {
    // Demo data
    const demoItems = [
      {
        id: 'demo-1',
        opponent: 'AI (Beginner)',
        date: new Date().toISOString(),
        result: '1-0',
        rated: false,
        moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'g8f6', 'd2d3'],
      },
      {
        id: 'demo-2',
        opponent: 'You vs Opponent',
        date: new Date(Date.now() - 86400000).toISOString(),
        result: '0-1',
        rated: true,
        moves: ['d2d4', 'd7d5', 'c1f4', 'g8f6'],
      },
    ];
    return { items: demoItems, page, pageSize, total: demoItems.length };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch history');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function getGameById(gameId) {
  /**
   * Fetch a single historical game by id. Returns { id, date, opponent, rated, result, moves, analysis? }.
   */
  const res = await safeFetch(buildUrl(`/history/${gameId}`), { method: 'GET' });
  if (res.status === 204) {
    // Return a demo game based on id
    return {
      id: gameId,
      opponent: 'Demo Opponent',
      date: new Date().toISOString(),
      rated: false,
      result: '1/2-1/2',
      moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'a7a6', 'b5a4', 'g8f6'],
    };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch game');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function getHintForPosition({ gameId, plyIndex }) {
  /**
   * Get a hint for the current position in the given game at plyIndex.
   * Returns { move: 'e2e4', explanation: '...' } in success mode, or a demo response in no-backend mode.
   */
  const res = await safeFetch(buildUrl(`/history/${gameId}/hint?ply=${encodeURIComponent(plyIndex)}`), { method: 'GET' });
  if (res.status === 204) {
    // Very simple hint generator: suggest developing a minor piece or center move
    const suggestions = ['e2e4', 'd2d4', 'g1f3', 'b1c3', 'c2c4', 'g2g3'];
    const pick = suggestions[plyIndex % suggestions.length];
    return {
      move: pick,
      explanation: 'Consider controlling the center and developing your pieces.',
      limited: false,
    };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch hint');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function getAnalysisForGame(gameId) {
  /**
   * Get post-game analysis summary. Returns
   * { accuracyWhite, accuracyBlack, blunders, mistakes, bestMoves, summary, suggestions: [] }
   */
  const res = await safeFetch(buildUrl(`/history/${gameId}/analysis`), { method: 'GET' });
  if (res.status === 204) {
    return {
      accuracyWhite: 72,
      accuracyBlack: 68,
      blunders: 2,
      mistakes: 4,
      bestMoves: 8,
      summary: 'A balanced game with a few mid-game inaccuracies. Focus on development and king safety.',
      suggestions: [
        'Review opening principles: control the center and develop quickly.',
        'Avoid moving the same piece multiple times in the opening.',
        'Castle early to safeguard your king.',
      ],
    };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch analysis');
  }
  return await res.json();
}
