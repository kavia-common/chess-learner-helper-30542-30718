import React, { createContext, useContext, useReducer, useMemo } from 'react';
import * as LessonsApi from '../api/lessonsApi';

// Action types for lessons domain
const ACTIONS = {
  LESSONS_FETCH_START: 'LESSONS_FETCH_START',
  LESSONS_FETCH_SUCCESS: 'LESSONS_FETCH_SUCCESS',
  LESSONS_FETCH_ERROR: 'LESSONS_FETCH_ERROR',

  LESSON_FETCH_START: 'LESSON_FETCH_START',
  LESSON_FETCH_SUCCESS: 'LESSON_FETCH_SUCCESS',
  LESSON_FETCH_ERROR: 'LESSON_FETCH_ERROR',

  QUIZ_FETCH_START: 'QUIZ_FETCH_START',
  QUIZ_FETCH_SUCCESS: 'QUIZ_FETCH_SUCCESS',
  QUIZ_FETCH_ERROR: 'QUIZ_FETCH_ERROR',

  QUIZ_SUBMIT_START: 'QUIZ_SUBMIT_START',
  QUIZ_SUBMIT_SUCCESS: 'QUIZ_SUBMIT_SUCCESS',
  QUIZ_SUBMIT_ERROR: 'QUIZ_SUBMIT_ERROR',

  PROGRESS_FETCH_START: 'PROGRESS_FETCH_START',
  PROGRESS_FETCH_SUCCESS: 'PROGRESS_FETCH_SUCCESS',
  PROGRESS_FETCH_ERROR: 'PROGRESS_FETCH_ERROR',
};

// Initial lessons state
const initialLessonsState = {
  list: { items: [], loading: false, error: null },
  detail: { item: null, loading: false, error: null },
  quiz: { data: null, loading: false, error: null, result: null, submitting: false },
  progress: { data: null, loading: false, error: null },
};

// PUBLIC_INTERFACE
export function lessonsReducer(state, action) {
  /** Reducer to manage lessons, detail, quiz and progress state. */
  switch (action.type) {
    case ACTIONS.LESSONS_FETCH_START:
      return { ...state, list: { ...state.list, loading: true, error: null } };
    case ACTIONS.LESSONS_FETCH_SUCCESS:
      return { ...state, list: { items: action.payload || [], loading: false, error: null } };
    case ACTIONS.LESSONS_FETCH_ERROR:
      return { ...state, list: { ...state.list, loading: false, error: action.payload || 'Error' } };

    case ACTIONS.LESSON_FETCH_START:
      return { ...state, detail: { ...state.detail, loading: true, error: null } };
    case ACTIONS.LESSON_FETCH_SUCCESS:
      return { ...state, detail: { item: action.payload || null, loading: false, error: null } };
    case ACTIONS.LESSON_FETCH_ERROR:
      return { ...state, detail: { ...state.detail, loading: false, error: action.payload || 'Error' } };

    case ACTIONS.QUIZ_FETCH_START:
      return { ...state, quiz: { ...state.quiz, loading: true, error: null, result: null } };
    case ACTIONS.QUIZ_FETCH_SUCCESS:
      return { ...state, quiz: { ...state.quiz, loading: false, data: action.payload || null, error: null } };
    case ACTIONS.QUIZ_FETCH_ERROR:
      return { ...state, quiz: { ...state.quiz, loading: false, error: action.payload || 'Error' } };

    case ACTIONS.QUIZ_SUBMIT_START:
      return { ...state, quiz: { ...state.quiz, submitting: true, error: null } };
    case ACTIONS.QUIZ_SUBMIT_SUCCESS:
      return { ...state, quiz: { ...state.quiz, submitting: false, result: action.payload || null, error: null } };
    case ACTIONS.QUIZ_SUBMIT_ERROR:
      return { ...state, quiz: { ...state.quiz, submitting: false, error: action.payload || 'Error' } };

    case ACTIONS.PROGRESS_FETCH_START:
      return { ...state, progress: { ...state.progress, loading: true, error: null } };
    case ACTIONS.PROGRESS_FETCH_SUCCESS:
      return { ...state, progress: { data: action.payload || null, loading: false, error: null } };
    case ACTIONS.PROGRESS_FETCH_ERROR:
      return { ...state, progress: { ...state.progress, loading: false, error: action.payload || 'Error' } };

    default:
      return state;
  }
}

const LessonsContext = createContext({ state: initialLessonsState, actions: {} });

// PUBLIC_INTERFACE
export function LessonsProvider({ children }) {
  /** Context provider encapsulating lessons state and actions. */
  const [state, dispatch] = useReducer(lessonsReducer, initialLessonsState);

  const actions = useMemo(() => ({
    // PUBLIC_INTERFACE
    fetchLessons: async () => {
      dispatch({ type: ACTIONS.LESSONS_FETCH_START });
      try {
        const items = await LessonsApi.getLessons();
        dispatch({ type: ACTIONS.LESSONS_FETCH_SUCCESS, payload: items });
        return items;
      } catch (e) {
        dispatch({ type: ACTIONS.LESSONS_FETCH_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    fetchLessonById: async (id) => {
      dispatch({ type: ACTIONS.LESSON_FETCH_START });
      try {
        const item = await LessonsApi.getLessonById(id);
        dispatch({ type: ACTIONS.LESSON_FETCH_SUCCESS, payload: item });
        return item;
      } catch (e) {
        dispatch({ type: ACTIONS.LESSON_FETCH_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    fetchQuiz: async (lessonId) => {
      dispatch({ type: ACTIONS.QUIZ_FETCH_START });
      try {
        const data = await LessonsApi.getQuizForLesson(lessonId);
        dispatch({ type: ACTIONS.QUIZ_FETCH_SUCCESS, payload: data });
        return data;
      } catch (e) {
        dispatch({ type: ACTIONS.QUIZ_FETCH_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    submitQuiz: async (lessonId, answers) => {
      dispatch({ type: ACTIONS.QUIZ_SUBMIT_START });
      try {
        const result = await LessonsApi.submitQuiz(lessonId, answers);
        dispatch({ type: ACTIONS.QUIZ_SUBMIT_SUCCESS, payload: result });
        return result;
      } catch (e) {
        dispatch({ type: ACTIONS.QUIZ_SUBMIT_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    fetchProgress: async () => {
      dispatch({ type: ACTIONS.PROGRESS_FETCH_START });
      try {
        const data = await LessonsApi.getProgress();
        dispatch({ type: ACTIONS.PROGRESS_FETCH_SUCCESS, payload: data });
        return data;
      } catch (e) {
        dispatch({ type: ACTIONS.PROGRESS_FETCH_ERROR, payload: e.message });
        return null;
      }
    },
  }), []);

  return (
    <LessonsContext.Provider value={{ state, actions }}>
      {children}
    </LessonsContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useLessons() {
  /** Hook to access lessons state and actions */
  return useContext(LessonsContext);
}
