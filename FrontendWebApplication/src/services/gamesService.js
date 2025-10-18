import { apiFetch, getWebsocketUrl } from './apiClient';

// PUBLIC_INTERFACE
export function openMultiplayerSocket() {
  /** Opens a WebSocket connection for multiplayer with JWT passed as query param. */
  const base = getWebsocketUrl();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jwt') : null;
  const url = `${base}/ws/multiplayer${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  const ws = new WebSocket(url);
  return ws;
}

// PUBLIC_INTERFACE
export async function startAIGame({ difficulty = 'beginner' } = {}) {
  /** Starts an AI game (real endpoint). */
  const res = await apiFetch('/games/start-ai', { method: 'POST', body: { difficulty } });
  if (res?.success) return { gameId: res.data?.gameId, difficulty: res.data?.difficulty || difficulty };
  return { error: res?.error || 'failed_to_start' };
}
