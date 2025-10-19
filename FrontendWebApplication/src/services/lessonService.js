import { apiClient } from './apiClient';
import { API_BASE_URL } from '../config/env';

/**
 * Lesson service: provides methods to load lessons and track progress.
 * Uses env-based API calls when available and gracefully falls back to mock data.
 */

const MOCK_LESSONS = [
  {
    id: 'intro-rules',
    title: 'Introduction to Chess Rules',
    difficulty: 'Beginner',
    durationMin: 10,
    description: 'Learn the basic rules of chess: board setup, piece moves, and objective.',
    content: [
      { type: 'text', value: 'Chess is a game played between two players on an 8x8 board.' },
      { type: 'image', alt: 'Chess board starting position', src: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Chess_board_opening_staunton.jpg' },
      { type: 'text', value: 'Each piece moves differently. The goal is to checkmate the opponent’s king.' },
    ],
    progress: { completed: 0, total: 3 }
  },
  {
    id: 'piece-movements',
    title: 'Piece Movements',
    difficulty: 'Beginner',
    durationMin: 12,
    description: 'Understand how each chess piece moves across the board.',
    content: [
      { type: 'text', value: 'Pawns move forward but capture diagonally.' },
      { type: 'text', value: 'Knights move in an L-shape and can jump over pieces.' },
      { type: 'text', value: 'Bishops, Rooks, and Queens move along lines; King moves one square.' },
    ],
    progress: { completed: 1, total: 3 }
  },
  {
    id: 'basic-tactics',
    title: 'Basic Tactics',
    difficulty: 'Intermediate',
    durationMin: 15,
    description: 'Learn forks, pins, and skewers to gain material advantage.',
    content: [
      { type: 'text', value: 'A fork attacks two or more pieces simultaneously.' },
      { type: 'text', value: 'A pin limits movement because moving exposes a more valuable piece.' },
      { type: 'text', value: 'A skewer forces movement exposing a less valuable piece.' },
    ],
    progress: { completed: 0, total: 3 }
  }
];

// PUBLIC_INTERFACE
export async function listLessons() {
  /** Retrieve list of lessons. Falls back to mock data if backend not available. */
  try {
    // If API_BASE_URL is falsy or placeholder, skip network call
    if (!API_BASE_URL || API_BASE_URL.includes('localhost:4000')) {
      return MOCK_LESSONS;
    }
    const res = await apiClient.get('/lessons');
    return Array.isArray(res) && res.length ? res : MOCK_LESSONS;
  } catch {
    return MOCK_LESSONS;
  }
}

// PUBLIC_INTERFACE
export async function getLessonById(id) {
  /** Retrieve lesson detail by id, with graceful fallback. */
  try {
    if (!API_BASE_URL || API_BASE_URL.includes('localhost:4000')) {
      const found = MOCK_LESSONS.find((l) => l.id === id);
      if (found) return found;
      throw new Error('Lesson not found');
    }
    const res = await apiClient.get(`/lessons/${encodeURIComponent(id)}`);
    return res || MOCK_LESSONS.find((l) => l.id === id) || null;
  } catch {
    return MOCK_LESSONS.find((l) => l.id === id) || null;
  }
}

// PUBLIC_INTERFACE
export async function markLessonProgress(id, progressDelta = 1) {
  /**
   * Update lesson progress.
   * Backend: PATCH /lessons/:id/progress { delta } => { progress }
   * Fallback: update locally in memory and return value.
   */
  try {
    if (!API_BASE_URL || API_BASE_URL.includes('localhost:4000')) {
      const idx = MOCK_LESSONS.findIndex((l) => l.id === id);
      if (idx >= 0) {
        const lesson = MOCK_LESSONS[idx];
        const nextCompleted = Math.min(lesson.progress.completed + progressDelta, lesson.progress.total);
        lesson.progress = { ...lesson.progress, completed: nextCompleted };
        return { id, progress: { ...lesson.progress } };
      }
      return { id, progress: { completed: 0, total: 0 } };
    }
    const res = await apiClient.patch(`/lessons/${encodeURIComponent(id)}/progress`, { delta: progressDelta });
    return res;
  } catch {
    const idx = MOCK_LESSONS.findIndex((l) => l.id === id);
    if (idx >= 0) {
      const lesson = MOCK_LESSONS[idx];
      const nextCompleted = Math.min(lesson.progress.completed + progressDelta, lesson.progress.total);
      lesson.progress = { ...lesson.progress, completed: nextCompleted };
      return { id, progress: { ...lesson.progress } };
    }
    return { id, progress: { completed: 0, total: 0 } };
  }
}
