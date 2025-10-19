const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Safely build a full URL if API base is configured; otherwise return null.
 */
function buildUrl(path) {
  if (!API_BASE_URL) return null;
  return `${API_BASE_URL}${path}`;
}

async function safeFetch(url, options = {}) {
  if (!url) {
    // No-op mode for missing base URL
    return { ok: true, status: 204, json: async () => ({}), text: async () => '' };
  }
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    return res;
  } catch (e) {
    // Return a consistent error-like response
    return {
      ok: false,
      status: 0,
      json: async () => ({ message: e?.message || 'Network error' }),
      text: async () => e?.message || 'Network error',
    };
  }
}

// PUBLIC_INTERFACE
export async function login({ email, password }) {
  /** Authenticate user with email/password. Returns user and token or throws on error. */
  const res = await safeFetch(buildUrl('/auth/login'), {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Login failed');
  }
  const data = res.status === 204 ? {} : await res.json();
  return data;
}

// PUBLIC_INTERFACE
export async function register({ email, password }) {
  /** Register a new user. Returns basic info or message. */
  const res = await safeFetch(buildUrl('/auth/register'), {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Registration failed');
  }
  const data = res.status === 204 ? {} : await res.json();
  return data;
}

// PUBLIC_INTERFACE
export async function verifyEmail(token) {
  /** Verify email with provided token. */
  const res = await safeFetch(buildUrl('/auth/verify-email'), {
    method: 'POST',
    body: JSON.stringify({ token })
  });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Verification failed');
  }
  const data = res.status === 204 ? {} : await res.json();
  return data;
}

// PUBLIC_INTERFACE
export async function requestPasswordReset(email) {
  /** Request password reset link by email. */
  const res = await safeFetch(buildUrl('/auth/forgot-password'), {
    method: 'POST',
    body: JSON.stringify({ email })
  });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Request failed');
  }
  const data = res.status === 204 ? {} : await res.json();
  return data;
}

// PUBLIC_INTERFACE
export async function resetPassword({ token, password }) {
  /** Reset password using token. */
  const res = await safeFetch(buildUrl('/auth/reset-password'), {
    method: 'POST',
    body: JSON.stringify({ token, password })
  });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Reset failed');
  }
  const data = res.status === 204 ? {} : await res.json();
  return data;
}

// PUBLIC_INTERFACE
export async function getCurrentUser() {
  /** Get current session user using token cookie/session. */
  const res = await safeFetch(buildUrl('/auth/me'), { method: 'GET' });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch current user');
  }
  const data = res.status === 204 ? {} : await res.json();
  return data;
}

// PUBLIC_INTERFACE
export async function linkProvider(provider, payload = {}) {
  /** Link a social provider to the account (placeholder). */
  const res = await safeFetch(buildUrl(`/auth/link/${provider}`), {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Linking failed');
  }
  const data = res.status === 204 ? {} : await res.json();
  return data;
}
