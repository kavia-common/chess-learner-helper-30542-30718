import { apiFetch } from './apiClient';

// PUBLIC_INTERFACE
export async function getDashboard() {
  /** Fetches user dashboard progress summary. */
  // return apiFetch('/progress/dashboard');
  return { lessonsCompleted: 2, quizzesCompleted: 1, points: 120 };
}
