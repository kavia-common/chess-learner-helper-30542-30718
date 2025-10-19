import { API_BASE_URL } from '../config/env';
import { getAuthToken, refreshSessionToken, signOut } from './authService';

/**
 * Lightweight API client with interceptors-like behavior without extra deps.
 * Attaches Bearer token when available and centralizes error handling.
 */

// Simple event emitter pattern for global error listeners (e.g., ToastContext wiring)
const listeners = new Set();

// PUBLIC_INTERFACE
export function onApiError(listener) {
  /** Register a global API error listener. Returns unsubscribe function. */
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitApiError(error) {
  listeners.forEach((l) => {
    try {
      l(error);
    } catch {
      // no-op to keep failures isolated
    }
  });
}

/**
 * Compose headers for requests, adding JSON and Authorization when present.
 */
function buildHeaders(extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  let payload = null;
  try {
    if (contentType.includes('application/json')) {
      payload = await res.json();
    } else {
      payload = await res.text();
    }
  } catch {
    payload = null;
  }
  return payload;
}

async function handleResponse(res, originalRequest) {
  if (res.ok) {
    return parseResponse(res);
  }

  // Unauthorized handling with refresh-token placeholder
  if (res.status === 401) {
    // Try refresh once if possible
    const refreshed = await refreshSessionToken().catch(() => null);
    if (refreshed) {
      // Retry original request once with new token
      const token = getAuthToken();
      const retryRes = await fetch(originalRequest.url, {
        ...originalRequest.init,
        headers: {
          ...(originalRequest.init?.headers || {}),
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      if (retryRes.ok) {
        return parseResponse(retryRes);
      }
      // If still unauthorized, sign out
      if (retryRes.status === 401) {
        signOut();
      }
      const retryPayload = await parseResponse(retryRes);
      const retryError = new Error('Request failed after token refresh.');
      retryError.status = retryRes.status;
      retryError.data = retryPayload;
      emitApiError(retryError);
      throw retryError;
    }
    // No refresh available; sign out and surface safe error
    signOut();
  }

  const payload = await parseResponse(res);
  // Avoid leaking backend internals
  const error = new Error('Request failed. Please try again.');
  error.status = res.status;
  error.data = payload;
  emitApiError(error);
  throw error;
}

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const init = {
    method: options.method || 'GET',
    headers: buildHeaders(options.headers || {}),
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include', // if backend uses httpOnly cookies too
  };

  const originalRequest = { url, init };
  try {
    const res = await fetch(url, init);
    return await handleResponse(res, originalRequest);
  } catch (err) {
    // Network or parsing errors
    emitApiError(err);
    throw err;
  }
}

// PUBLIC_INTERFACE
export const apiClient = {
  /** Perform GET request */
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  /** Perform POST request with JSON body */
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  /** Perform PUT request with JSON body */
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  /** Perform PATCH request with JSON body */
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  /** Perform DELETE request */
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
};
