import { apiFetch } from './apiClient';

// PUBLIC_INTERFACE
export async function listQuizzes() {
  /** Gets quizzes list. */
  // return apiFetch('/quizzes');
  return [{ id: 'q1', title: 'Rules Quiz' }, { id: 'q2', title: 'Tactics Quiz' }];
}

// PUBLIC_INTERFACE
export async function getQuiz(id) {
  /** Gets quiz detail by id. */
  // return apiFetch(`/quizzes/${id}`);
  return { id, title: `Quiz ${id}`, questions: [] };
}
