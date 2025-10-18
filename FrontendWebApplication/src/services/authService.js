import { apiFetch, getApiBaseUrl } from './apiClient';

// PUBLIC_INTERFACE
export async function login(email, password) {
  /** Calls backend login endpoint. */
  try {
    const res = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
    if (res?.success && res?.data?.token) {
      const { token, refresh, user } = res.data;
      localStorage.setItem('jwt', token);
      if (refresh) localStorage.setItem('refresh', refresh);
      return { token, user: { email: user?.email, role: user?.role || 'LEARNER' } };
    }
    return { error: res?.error || 'Login failed' };
  } catch (e) {
    return { error: e.message || 'Login failed' };
  }
}

// PUBLIC_INTERFACE
export async function register(payload) {
  /** Calls backend register endpoint. */
  try {
    const res = await apiFetch('/auth/register', { method: 'POST', body: payload });
    if (res?.success) return { message: res?.message || 'Registered. Please verify your email.' };
    return { error: res?.error || 'Registration failed' };
  } catch (e) {
    return { error: e.message || 'Registration failed' };
  }
}

// PUBLIC_INTERFACE
export async function requestPasswordReset(email) {
  /** Triggers password reset email. */
  return apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });
}

// PUBLIC_INTERFACE
export async function resetPassword(token, password) {
  /** Resets password with token. */
  return apiFetch('/auth/reset-password', { method: 'POST', body: { token, password } });
}

// PUBLIC_INTERFACE
export async function verifyEmail(token) {
  /** Verifies email with token (backend expects /auth/verify-email). */
  return apiFetch('/auth/verify-email', { method: 'POST', body: { token } });
}

// PUBLIC_INTERFACE
export function getOAuthUrl(provider) {
  /** Returns backend OAuth start URL for provider. Backend mounts /auth/oauth/google. */
  const base = getApiBaseUrl();
  if (provider === 'google') return `${base}/auth/oauth/google`;
  return `${base}/auth/oauth/${provider}`;
}

// PUBLIC_INTERFACE
export async function getProfile(token) {
  /** Retrieves current user profile. */
  const res = await apiFetch('/users/me', { token });
  if (res?.success && res?.data) {
    const { email, role } = res.data;
    return { email, role: role === 'ADMIN' ? 'admin' : 'user' };
  }
  throw new Error(res?.error || 'Failed to load profile');
}

// PUBLIC_INTERFACE
export function logout() {
  /** Notify backend and clear local tokens. */
  try {
    apiFetch('/auth/logout', { method: 'POST' });
  } catch {}
  localStorage.removeItem('jwt');
  localStorage.removeItem('refresh');
  return true;
}
