import { useMemo } from 'react';
import * as lessonsApi from '../../api/lessonsApi';

/**
 * PUBLIC_INTERFACE
 * useLessons
 * Provides lessons helpers. Since no lessons context/store is present, this hook
 * exposes direct API-bound actions and leaves data caching to consumers or SWR in future.
 */
export default function useLessons() {
  // No internal state source; expose actions as stable functions.
  const actions = useMemo(
    () => ({
      fetchLessons: lessonsApi.fetchLessons,
      getLessons: lessonsApi.getLessons,
      fetchLessonDetail: lessonsApi.fetchLessonDetail,
      getLessonById: lessonsApi.getLessonById,
      getQuizForLesson: lessonsApi.getQuizForLesson,
      submitQuiz: lessonsApi.submitQuiz,
      getProgress: lessonsApi.getProgress,
    }),
    []
  );

  return actions;
}
