const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:4000';

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the configured API base URL. */
  return API_BASE_URL;
}

// PUBLIC_INTERFACE
export function getWebsocketUrl() {
  /** Returns the configured WebSocket URL. */
  return WS_URL;
}

// PUBLIC_INTERFACE
export async function apiFetch(path, { method = 'GET', headers = {}, body = null, token = null } = {}) {
  /**
   * Wrapper for fetch with base URL, JSON handling, and JWT header attachment.
   * Note: This includes a simple 401 handler placeholder for future refresh-token logic.
   */
  const url = `${API_BASE_URL}${path}`;
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
  const res = await fetch(url, { method, headers: finalHeaders, body: body ? JSON.stringify(body) : null });

  if (res.status === 401) {
    // TODO: Implement refresh token flow with backend once available.
    // For now, just return an error-like object.
    return { error: 'Unauthorized', status: 401 };
  }

  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}
