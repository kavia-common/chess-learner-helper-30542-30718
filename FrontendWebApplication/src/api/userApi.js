const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Build URL if base is configured; otherwise return null to enable graceful no-backend mode.
 */
function buildUrl(path) {
  if (!API_BASE_URL) return null;
  return `${API_BASE_URL}${path}`;
}

/**
 * Internal safe fetch with consistent interface for no-backend mode.
 */
async function safeFetch(url, options = {}) {
  if (!url) {
    return { ok: true, status: 204, json: async () => ({}), text: async () => '' };
  }
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    return res;
  } catch (e) {
    return {
      ok: false,
      status: 0,
      json: async () => ({ message: e?.message || 'Network error' }),
      text: async () => e?.message || 'Network error',
    };
  }
}

// PUBLIC_INTERFACE
export async function getProfile() {
  /** Get current user's profile: { id, email, name, bio, avatarUrl, privacy: {}, notifications: {}, consent: {} } */
  const res = await safeFetch(buildUrl('/user/profile'), { method: 'GET' });
  if (res.status === 204) {
    // Demo data
    return {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
      bio: 'I love learning chess!',
      avatarUrl: '',
      privacy: {
        showProfilePublic: false,
        shareStatsLeaderboard: true,
        allowFriendRequests: true,
      },
      notifications: {
        emailLessons: true,
        emailChallenges: true,
        pushGameReminders: false,
      },
      consent: {
        acceptedTerms: true,
        acceptedPrivacy: true,
        marketingEmails: false,
      },
    };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch profile');
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function updateProfile(payload) {
  /** Update profile fields: { name, bio } and optionally avatarUrl from separate upload */
  const res = await safeFetch(buildUrl('/user/profile'), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (res.status === 204) {
    return { success: true, profile: { ...payload } };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to update profile');
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function uploadAvatar(file) {
  /** Upload avatar; returns { url } - in no-backend mode, returns Object URL */
  const url = buildUrl('/user/avatar');
  if (!url) {
    const objectUrl = URL.createObjectURL(file);
    return { url: objectUrl, localOnly: true };
  }
  // If backend exists, use multipart/form-data
  const formData = new FormData();
  formData.append('avatar', file);
  try {
    const res = await fetch(url, { method: 'POST', body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to upload avatar');
    }
    return await res.json();
  } catch (e) {
    throw new Error(e?.message || 'Upload failed');
  }
}

// PUBLIC_INTERFACE
export async function getSettings() {
  /** Fetch settings including privacy, notifications, and consent */
  const profile = await getProfile();
  return {
    privacy: profile.privacy || {},
    notifications: profile.notifications || {},
    consent: profile.consent || {},
  };
}

// PUBLIC_INTERFACE
export async function updateSettings(settings) {
  /** Update settings; merges into profile in backend; in demo returns same */
  const res = await safeFetch(buildUrl('/user/settings'), {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  if (res.status === 204) {
    return { success: true, settings };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to update settings');
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function deleteAccount() {
  /** Request account deletion; in demo mode acts as success */
  const res = await safeFetch(buildUrl('/user'), { method: 'DELETE' });
  if (res.status === 204) return { success: true };
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to delete account');
  }
  return res.json();
}
