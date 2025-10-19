const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Build URL if base is configured; otherwise return null to enable graceful no-backend mode.
 */
function buildUrl(path) {
  if (!API_BASE_URL) return null;
  return `${API_BASE_URL}${path}`;
}

/**
 * Internal safe fetch that returns a consistent interface and does not throw on network errors.
 */
async function safeFetch(url, options = {}) {
  if (!url) {
    // No backend configured: act as no-op but return placeholder structure where meaningful
    return { ok: true, status: 204, json: async () => ({}), text: async () => '' };
  }
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    return res;
  } catch (e) {
    return {
      ok: false,
      status: 0,
      json: async () => ({ message: e?.message || 'Network error' }),
      text: async () => e?.message || 'Network error',
    };
  }
}

// PUBLIC_INTERFACE
export async function getLessons() {
  /** Fetch list of lessons. Returns an array of lessons. */
  const res = await safeFetch(buildUrl('/lessons'), { method: 'GET' });
  if (res.status === 204) {
    // Demo placeholder lessons for no-backend mode
    return [
      { id: 'intro', title: 'Introduction to Chess', summary: 'Learn the board, pieces, and basic rules.', progress: 40 },
      { id: 'opening', title: 'Openings Basics', summary: 'Principles of opening play and development.', progress: 10 },
      { id: 'tactics', title: 'Tactics 101', summary: 'Forks, pins, skewers and more.', progress: 0 }
    ];
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch lessons');
  }
  const data = await res.json();
  return Array.isArray(data) ? data : (data.items || []);
}

// PUBLIC_INTERFACE
export async function getLessonById(id) {
  /** Fetch a single lesson by id. Returns lesson object with content/sections. */
  const res = await safeFetch(buildUrl(`/lessons/${id}`), { method: 'GET' });
  if (res.status === 204) {
    // Demo placeholder lesson
    return {
      id,
      title: id === 'intro' ? 'Introduction to Chess' : `Lesson ${id}`,
      content: [
        { type: 'text', value: 'Welcome to this lesson. This is placeholder content for demo mode.' },
        { type: 'list', value: ['Board and coordinates', 'Piece movement', 'Basic rules'] },
      ],
      progress: 40
    };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch lesson');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function getQuizForLesson(id) {
  /** Fetch quiz data for a given lesson id. Returns { questions: [...] } */
  const res = await safeFetch(buildUrl(`/lessons/${id}/quiz`), { method: 'GET' });
  if (res.status === 204) {
    // Demo placeholder quiz
    return {
      lessonId: id,
      questions: [
        {
          id: 'q1',
          prompt: 'Which piece moves in an L-shape?',
          type: 'single',
          options: ['Bishop', 'Knight', 'Rook', 'Queen'],
          answerIndex: 1,
          explanation: 'Knights move in an L-shape: two in one direction and one perpendicular.'
        },
        {
          id: 'q2',
          prompt: 'How many squares are on a chessboard?',
          type: 'single',
          options: ['32', '48', '64', '100'],
          answerIndex: 2,
          explanation: 'An 8x8 board has 64 squares.'
        }
      ]
    };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch quiz');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function submitQuiz(lessonId, answers) {
  /** Submit quiz answers; returns result with score and per-question correctness. */
  const res = await safeFetch(buildUrl(`/lessons/${lessonId}/quiz`), {
    method: 'POST',
    body: JSON.stringify({ answers })
  });
  if (res.status === 204) {
    // Local evaluate in demo mode: pull quiz and check answers client-side
    const quiz = await getQuizForLesson(lessonId);
    const results = quiz.questions.map((q, idx) => {
      const correct = q.answerIndex === answers?.[q.id]?.answerIndex;
      return { questionId: q.id, correct, explanation: q.explanation, selected: answers?.[q.id]?.answerIndex ?? null };
    });
    const score = Math.round((results.filter(r => r.correct).length / results.length) * 100);
    return { score, results };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to submit quiz');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function getProgress() {
  /** Get overall progress for current user across lessons. Returns { completed, total, percent }. */
  const res = await safeFetch(buildUrl('/progress'), { method: 'GET' });
  if (res.status === 204) {
    // Summarize demo progress from placeholder lessons
    const lessons = await getLessons();
    const total = lessons.length;
    const completed = lessons.filter(l => (l.progress || 0) >= 100).length;
    const percent = total > 0 ? Math.round((lessons.reduce((a, l) => a + (l.progress || 0), 0) / (total * 100)) * 100) : 0;
    return { completed, total, percent };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch progress');
  }
  return await res.json();
}
