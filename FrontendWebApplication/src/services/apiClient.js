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

// attach token from localStorage if not provided
function resolveToken(explicitToken) {
  if (explicitToken) return explicitToken;
  try {
    return localStorage.getItem('jwt');
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export async function apiFetch(path, { method = 'GET', headers = {}, body = null, token = null } = {}) {
  /**
   * Wrapper for fetch with base URL, JSON handling, and JWT header attachment.
   * Includes simple refresh-token attempt on 401 using /auth/refresh if refresh token exists.
   */
  const url = `${API_BASE_URL}${path}`;
  const bearer = resolveToken(token);
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    ...headers,
  };
  let res = await fetch(url, { method, headers: finalHeaders, body: body ? JSON.stringify(body) : null });

  if (res.status === 401) {
    // naive refresh attempt
    try {
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        const r = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        });
        if (r.ok) {
          const data = await r.json();
          const newToken = data?.data?.token;
          if (newToken) {
            localStorage.setItem('jwt', newToken);
            const retryHeaders = {
              ...finalHeaders,
              Authorization: `Bearer ${newToken}`,
            };
            res = await fetch(url, { method, headers: retryHeaders, body: body ? JSON.stringify(body) : null });
          }
        }
      }
    } catch {
      // ignore and fall through
    }
    if (res.status === 401) {
      return { error: 'Unauthorized', status: 401 };
    }
  }

  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}
