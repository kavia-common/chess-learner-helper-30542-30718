import { apiFetch } from './apiClient';

// PUBLIC_INTERFACE
export async function listLessons() {
  /** Gets lessons list. */
  // return apiFetch('/lessons');
  return [{ id: 'intro', title: 'Introduction to Chess' }, { id: 'tactics', title: 'Basic Tactics' }];
}

// PUBLIC_INTERFACE
export async function getLesson(id) {
  /** Gets lesson detail by id. */
  // return apiFetch(`/lessons/${id}`);
  return { id, title: `Lesson ${id}`, content: 'Lesson content goes here.' };
}
