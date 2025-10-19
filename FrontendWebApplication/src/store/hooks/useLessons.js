import { useContext, useMemo } from 'react';
import { LessonsProvider, useLessons as useLessonsContext } from '../lessons';

/**
 * PUBLIC_INTERFACE
 * useLessons
 * Hook that exposes memoized lessons state selectors and bound actions from LessonsProvider context.
 *
 * Returns:
 * - state: { list, detail, quiz, progress }
 * - actions: { fetchLessons(), fetchLessonById(id), fetchQuiz(lessonId), submitQuiz(lessonId, answers), fetchProgress() }
 *
 * Note: Must be used within <LessonsProvider>.
 */
export function useLessons() {
  const ctx = useLessonsContext();
  const state = ctx?.state || {};
  const actions = ctx?.actions || {};

  const selectors = useMemo(
    () => ({
      list: state.list,
      detail: state.detail,
      quiz: state.quiz,
      progress: state.progress,
    }),
    [state.list, state.detail, state.quiz, state.progress]
  );

  return useMemo(
    () => ({
      state: selectors,
      actions,
    }),
    [selectors, actions]
  );
}

export default useLessons;
// Re-export provider to ease integration if needed by pages.
export { LessonsProvider };
