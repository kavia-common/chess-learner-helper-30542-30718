export * from './httpClient';
export * from './endpoints';

// Note: Prefer cookie-based sessions with httpOnly cookies.
// If you receive a bearer token from the backend and need it for API calls,
// call setAccessToken(token) to keep it in memory only (not persisted).
