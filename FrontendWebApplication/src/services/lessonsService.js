import { apiFetch } from './apiClient';

// PUBLIC_INTERFACE
export async function listLessons() {
  /** Gets lessons list. */
  const res = await apiFetch('/lessons');
  if (res?.success) return res.data || [];
  return [];
}

// PUBLIC_INTERFACE
export async function getLesson(id) {
  /** Gets lesson detail by id. */
  const res = await apiFetch(`/lessons/${id}`);
  if (res?.success) return res.data;
  return null;
}
