import { apiFetch } from './apiClient';

// PUBLIC_INTERFACE
export async function getDashboard() {
  /** Fetches user dashboard progress summary. */
  const res = await apiFetch('/progress/summary');
  if (res?.success) return res.data || { lessonsCompleted: 0, quizzesCompleted: 0, points: 0 };
  return { lessonsCompleted: 0, quizzesCompleted: 0, points: 0 };
}
