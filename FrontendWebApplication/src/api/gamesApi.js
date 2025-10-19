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
    return { ok: true, status: 204, json: async () => ({}), text: async () => '' };
  }
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
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
export async function requestMatchmaking(preferences = {}) {
  /** Request matchmaking; returns ticket info or demo placeholder if backend not available. */
  const res = await safeFetch(buildUrl('/games/matchmaking'), {
    method: 'POST',
    body: JSON.stringify(preferences)
  });
  if (res.status === 204) {
    return { ticketId: 'demo-ticket', estimatedWait: 5 };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to start matchmaking');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function pollMatchmaking(ticketId) {
  /** Poll matchmaking state; returns found game or waiting status. */
  const res = await safeFetch(buildUrl(`/games/matchmaking/${ticketId}`), {
    method: 'GET'
  });
  if (res.status === 204) {
    // Simulate a game found after a couple polls by random
    const found = Math.random() > 0.6;
    return found ? { found: true, gameId: 'demo-game' } : { found: false, estimatedWait: Math.ceil(Math.random() * 10) };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to poll matchmaking');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function cancelMatchmaking(ticketId) {
  /** Cancel matchmaking; best-effort. */
  const res = await safeFetch(buildUrl(`/games/matchmaking/${ticketId}`), { method: 'DELETE' });
  if (res.status === 204) return { canceled: true };
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to cancel matchmaking');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function getGameState(gameId) {
  /** Get current game state for a real-time game. */
  const res = await safeFetch(buildUrl(`/games/${gameId}`), { method: 'GET' });
  if (res.status === 204) {
    return {
      id: gameId,
      fen: 'start', // start position semantic
      moves: [],
      players: { white: 'You', black: 'Opponent' },
      status: 'active'
    };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch game state');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function postMove(gameId, move) {
  /** Post a move to the server (stub). */
  const res = await safeFetch(buildUrl(`/games/${gameId}/moves`), {
    method: 'POST',
    body: JSON.stringify(move)
  });
  if (res.status === 204) {
    return { ok: true };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to post move');
  }
  return await res.json();
}
