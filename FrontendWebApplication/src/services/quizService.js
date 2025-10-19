import { apiClient } from './apiClient';
import { API_BASE_URL } from '../config/env';

/**
 * Quiz service: provides quiz list, detail, and submission handlers.
 * Falls back to mock data when backend is not available.
 */

const MOCK_QUIZZES = [
  {
    id: 'quiz-intro',
    title: 'Basics Check',
    lessonId: 'intro-rules',
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        prompt: 'How many squares are on a standard chessboard?',
        choices: ['64', '81', '100', '72'],
        answerIndex: 0,
        explanation: 'There are 8 rows and 8 columns: 8 x 8 = 64 squares.'
      },
      {
        id: 'q2',
        type: 'mcq',
        prompt: 'Which piece moves in an L-shape?',
        choices: ['Bishop', 'Rook', 'Knight', 'Queen'],
        answerIndex: 2,
        explanation: 'The Knight moves in an L-shape and can jump over pieces.'
      }
    ]
  }
];

// PUBLIC_INTERFACE
export async function listQuizzes() {
  /** List available quizzes (global or for current user). */
  try {
    if (!API_BASE_URL || API_BASE_URL.includes('localhost:4000')) {
      return MOCK_QUIZZES.map(({ questions, ...q }) => q);
    }
    const res = await apiClient.get('/quizzes');
    return Array.isArray(res) && res.length ? res : MOCK_QUIZZES.map(({ questions, ...q }) => q);
  } catch {
    return MOCK_QUIZZES.map(({ questions, ...q }) => q);
  }
}

// PUBLIC_INTERFACE
export async function getQuizById(id) {
  /** Retrieve quiz data by id; fallback to mock quizzes. */
  try {
    if (!API_BASE_URL || API_BASE_URL.includes('localhost:4000')) {
      return MOCK_QUIZZES.find((q) => q.id === id) || null;
    }
    const res = await apiClient.get(`/quizzes/${encodeURIComponent(id)}`);
    return res || MOCK_QUIZZES.find((q) => q.id === id) || null;
  } catch {
    return MOCK_QUIZZES.find((q) => q.id === id) || null;
  }
}

// PUBLIC_INTERFACE
export async function submitQuizAnswers(quizId, answers) {
  /**
   * Submit quiz answers and receive result summary with score and explanations.
   * answers format: { [questionId]: choiceIndex }
   */
  try {
    if (!API_BASE_URL || API_BASE_URL.includes('localhost:4000')) {
      // client-side evaluate
      const quiz = MOCK_QUIZZES.find((q) => q.id === quizId);
      if (!quiz) return { score: 0, total: 0, details: [] };
      let score = 0;
      const details = quiz.questions.map((q) => {
        const chosen = answers[q.id];
        const correct = Number(chosen) === Number(q.answerIndex);
        if (correct) score += 1;
        return {
          questionId: q.id,
          correct,
          correctIndex: q.answerIndex,
          chosenIndex: chosen != null ? Number(chosen) : null,
          explanation: q.explanation || ''
        };
      });
      return { score, total: quiz.questions.length, details };
    }
    const res = await apiClient.post(`/quizzes/${encodeURIComponent(quizId)}/submit`, { answers });
    return res;
  } catch {
    // fallback evaluation
    const quiz = MOCK_QUIZZES.find((q) => q.id === quizId);
    if (!quiz) return { score: 0, total: 0, details: [] };
    let score = 0;
    const details = quiz.questions.map((q) => {
      const chosen = answers[q.id];
      const correct = Number(chosen) === Number(q.answerIndex);
      if (correct) score += 1;
      return {
        questionId: q.id,
        correct,
        correctIndex: q.answerIndex,
        chosenIndex: chosen != null ? Number(chosen) : null,
        explanation: q.explanation || ''
      };
    });
    return { score, total: quiz.questions.length, details };
  }
}
