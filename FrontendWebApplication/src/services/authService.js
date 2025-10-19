import { apiClient, onApiError } from './apiClient';

const ACCESS_TOKEN_KEY = 'clh_access_token';
const USER_KEY = 'clh_user';

// Token and session helpers

// PUBLIC_INTERFACE
export function getAuthToken() {
  /** Get the current access token from storage. */
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// PUBLIC_INTERFACE
export function setSession({ token, user }) {
  /** Persist session token and user profile in storage. */
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// PUBLIC_INTERFACE
export function getCurrentUser() {
  /** Return the current user object or null. */
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function clearSession() {
  /** Remove token and user from storage. */
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// PUBLIC_INTERFACE
export function signOut() {
  /** Clear session client-side; optionally call API if needed. */
  clearSession();
}

// PUBLIC_INTERFACE
export async function loginWithEmailPassword(email, password) {
  /** Login using backend credentials; expects { token, user }. */
  // Replace '/auth/login' with your backend endpoint
  const result = await apiClient.post('/auth/login', { email, password });
  // Expecting backend returns { token, user }
  if (result?.token) {
    setSession({ token: result.token, user: result.user || null });
  }
  return result;
}

// PUBLIC_INTERFACE
export async function registerWithEmailPassword(email, password) {
  /** Register new user; behavior depends on backend (may return token or require verification). */
  const result = await apiClient.post('/auth/register', { email, password });
  // If backend returns token immediately
  if (result?.token) {
    setSession({ token: result.token, user: result.user || null });
  }
  return result;
}

// PUBLIC_INTERFACE
export async function fetchMe() {
  /** Retrieve current user profile from backend. */
  const me = await apiClient.get('/auth/me');
  if (me) {
    localStorage.setItem(USER_KEY, JSON.stringify(me));
  }
  return me;
}

// PUBLIC_INTERFACE
export async function refreshSessionToken() {
  /**
   * Try refreshing the access token using refresh token (httpOnly cookie or stored token).
   * This is a placeholder; implement according to backend contract.
   * Expected response { token, user? }.
   */
  try {
    const res = await apiClient.post('/auth/refresh', {});
    if (res?.token) {
      setSession({ token: res.token, user: res.user || getCurrentUser() });
      return true;
    }
  } catch {
    // swallow; will be handled by caller
  }
  return false;
}

// Wire default global API error handler to sign out on invalid_token semantics if backend includes a code
onApiError((err) => {
  // Keep messages generic; avoid leaking server details
  // Example of backend-provided error data contract:
  if (err?.status === 401) {
    // Best-effort: do not loop; apiClient already tried refresh
    // signOut(); // already called in apiClient on hard 401
  }
});
