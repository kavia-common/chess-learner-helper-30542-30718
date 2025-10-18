import { apiFetch } from './apiClient';

// PUBLIC_INTERFACE
export async function listQuizzes() {
  /** Gets quizzes list. */
  const res = await apiFetch('/quizzes');
  if (res?.success) return res.data || [];
  return [];
}

// PUBLIC_INTERFACE
export async function getQuiz(id) {
  /** Gets quiz detail by id. */
  const res = await apiFetch(`/quizzes/${id}`);
  if (res?.success) return res.data;
  return null;
}
