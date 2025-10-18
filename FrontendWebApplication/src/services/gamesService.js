import { getWebsocketUrl } from './apiClient';

// PUBLIC_INTERFACE
export function openMultiplayerSocket() {
  /** Opens a WebSocket connection for multiplayer (placeholder). */
  const ws = new WebSocket(`${getWebsocketUrl()}/ws/multiplayer`);
  return ws;
}

// PUBLIC_INTERFACE
export async function startAIGame({ difficulty = 'beginner' } = {}) {
  /** Starts an AI game (placeholder). */
  // return apiFetch('/games/ai/start', { method: 'POST', body: { difficulty } });
  return { gameId: 'ai-demo', difficulty };
}
