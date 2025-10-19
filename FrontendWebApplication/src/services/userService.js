import { apiClient } from './apiClient';

/**
 * User service handles profile-related API calls.
 * This implementation uses placeholder endpoints and returns stubbed data where appropriate.
 */

// PUBLIC_INTERFACE
export async function getMe() {
  /** Fetch the current user's profile details from the backend. */
  // Placeholder endpoint; expected to return the user object
  try {
    const me = await apiClient.get('/user/me');
    return me;
  } catch (err) {
    // Fallback: try auth/me if user endpoint not ready
    try {
      const me = await apiClient.get('/auth/me');
      return me;
    } catch {
      throw err;
    }
  }
}

// PUBLIC_INTERFACE
export async function updateProfile(payload) {
  /**
   * Update user profile details.
   * payload may include: { displayName, bio, phone, location, ... }
   */
  // Placeholder; backend should validate and return updated user object
  const updated = await apiClient.patch('/user/me', payload);
  return updated;
}

// PUBLIC_INTERFACE
export async function uploadAvatar(file) {
  /**
   * Upload user avatar using multipart/form-data.
   * Returns updated user or at least an object containing the avatar url/path.
   */
  if (!file) {
    const err = new Error('No file provided.');
    err.status = 400;
    throw err;
  }
  const form = new FormData();
  form.append('avatar', file);

  const tokenlessInit = {
    method: 'POST',
    // Do not manually set Content-Type for FormData; the browser will set boundary.
    headers: {},
    body: form,
    credentials: 'include',
  };
  const path = '/user/me/avatar';
  const url = path; // apiClient will resolve to base URL

  // Reuse apiClient internal base URL and token behavior by calling fetch similar to apiClient
  // Minimal re-implementation here to keep dependency surface small.
  const { API_BASE_URL } = await import('../config/env.js');
  const fullUrl = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  // Attach auth token if available
  const { getAuthToken } = await import('./authService.js');
  const token = getAuthToken?.();
  if (token) {
    tokenlessInit.headers = { ...tokenlessInit.headers, Authorization: `Bearer ${token}` };
  }

  const res = await fetch(fullUrl, tokenlessInit);
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    let data = null;
    try {
      data = contentType.includes('application/json') ? await res.json() : await res.text();
    } catch {
      // ignore
    }
    const error = new Error('Avatar upload failed. Please try again.');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  const contentType = res.headers.get('content-type') || '';
  const json = contentType.includes('application/json') ? await res.json() : await res.text();
  return json;
}

// PUBLIC_INTERFACE
export async function deleteAccount() {
  /** Permanently delete the current user's account. Returns success status or result. */
  const result = await apiClient.delete('/user/me');
  return result;
}
