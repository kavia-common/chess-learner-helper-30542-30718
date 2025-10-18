import { apiFetch, getApiBaseUrl } from './apiClient';

// PUBLIC_INTERFACE
export async function login(email, password) {
  /** Calls backend login endpoint. */
  // TODO: integrate real endpoint
  try {
    // const res = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
    // Simulated response for now:
    const res = { token: 'dev-token', user: { email, role: 'user' } };
    return res;
  } catch (e) {
    return { error: e.message || 'Login failed' };
  }
}

// PUBLIC_INTERFACE
export async function register(payload) {
  /** Calls backend register endpoint. */
  // TODO: integrate real endpoint
  try {
    // const res = await apiFetch('/auth/register', { method: 'POST', body: payload });
    const res = { message: 'Registered. Please verify your email.' };
    return res;
  } catch (e) {
    return { error: e.message || 'Registration failed' };
  }
}

// PUBLIC_INTERFACE
export async function requestPasswordReset(email) {
  /** Triggers password reset email. */
  // return apiFetch('/auth/forgot', { method: 'POST', body: { email } });
  return { message: 'If an account exists, a reset link has been sent.' };
}

// PUBLIC_INTERFACE
export async function resetPassword(token, password) {
  /** Resets password with token. */
  // return apiFetch('/auth/reset', { method: 'POST', body: { token, password } });
  return { message: 'Password reset successful.' };
}

// PUBLIC_INTERFACE
export async function verifyEmail(token) {
  /** Verifies email with token. */
  // return apiFetch('/auth/verify', { method: 'POST', body: { token } });
  return { message: 'Email verified.' };
}

// PUBLIC_INTERFACE
export function getOAuthUrl(provider) {
  /** Returns backend OAuth start URL for provider. */
  const base = getApiBaseUrl();
  return `${base}/auth/oauth/${provider}/start`;
}

// PUBLIC_INTERFACE
export async function getProfile(token) {
  /** Retrieves current user profile. */
  // return apiFetch('/me', { token });
  if (token) return { email: 'user@example.com', role: 'user' };
  throw new Error('No token');
}

// PUBLIC_INTERFACE
export function logout() {
  /** Optionally notify backend about logout. */
  // return apiFetch('/auth/logout', { method: 'POST' });
  return true;
}
