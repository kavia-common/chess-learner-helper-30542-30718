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
    // No-backend mode
    return { ok: true, status: 204, json: async () => ({}), text: async () => '' };
  }
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
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
export async function getDailyChallenge() {
  /**
   * Get the current daily challenge. Returns an object with id, title, description, points, and sample position/prompt.
   */
  const res = await safeFetch(buildUrl('/gamification/daily-challenge'), { method: 'GET' });
  if (res.status === 204) {
    // Demo data
    return {
      id: new Date().toISOString().slice(0, 10),
      title: 'Mate in 2',
      description: 'Find a mate in two moves from the given position.',
      points: 50,
      type: 'puzzle',
      fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 2 3',
      prompt: 'White to move and checkmate in two.',
      completed: false,
    };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch daily challenge');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function completeDailyChallenge(challengeId) {
  /**
   * Mark the daily challenge as completed. Returns { success, pointsAwarded }.
   */
  const res = await safeFetch(buildUrl(`/gamification/daily-challenge/${challengeId}/complete`), {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (res.status === 204) {
    return { success: true, pointsAwarded: 50 };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to complete challenge');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function getPuzzles({ page = 1, pageSize = 12, difficulty = 'all' } = {}) {
  /**
   * Get a paginated list of puzzles with optional difficulty filter. Returns { items, page, pageSize, total }.
   */
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (difficulty && difficulty !== 'all') params.set('difficulty', difficulty);
  const res = await safeFetch(buildUrl(`/gamification/puzzles?${params.toString()}`), { method: 'GET' });
  if (res.status === 204) {
    // Demo data
    const demoItems = Array.from({ length: pageSize }).map((_, i) => {
      const id = `pz-${page}-${i + 1}`;
      const diffs = ['beginner', 'intermediate', 'advanced'];
      return {
        id,
        title: `Puzzle ${id}`,
        difficulty: diffs[(i + page) % diffs.length],
        points: 10 + ((i + page) % 4) * 5,
        fen: '8/8/8/8/8/8/8/8 w - - 0 1',
        theme: ['fork', 'pin', 'mate'][i % 3],
      };
    });
    return { items: demoItems, page, pageSize, total: 100 };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch puzzles');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function submitPuzzleSolution(puzzleId, solution) {
  /**
   * Submit a puzzle solution. Returns { correct, explanation?, pointsAwarded? }.
   */
  const res = await safeFetch(buildUrl(`/gamification/puzzles/${puzzleId}/submit`), {
    method: 'POST',
    body: JSON.stringify({ solution }),
  });
  if (res.status === 204) {
    // Demo: randomly correct
    const correct = Math.random() > 0.4;
    return {
      correct,
      explanation: correct ? 'Nice tactical pattern!' : 'Consider forcing moves and checks first.',
      pointsAwarded: correct ? 10 : 0,
    };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to submit solution');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function getLeaderboards({ period = 'weekly' } = {}) {
  /**
   * Get leaderboards by period (daily, weekly, monthly, all-time). Returns an array of { rank, user, points }.
   */
  const res = await safeFetch(buildUrl(`/gamification/leaderboards?period=${encodeURIComponent(period)}`), { method: 'GET' });
  if (res.status === 204) {
    const names = ['Alex', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Jamie', 'Drew'];
    const items = names.map((n, i) => ({ rank: i + 1, user: n, points: 500 - i * 20 }));
    return items;
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch leaderboards');
  }
  return await res.json();
}

// PUBLIC_INTERFACE
export async function getAchievements() {
  /**
   * Get list of achievements and progress. Returns { badges: [], points, streak }.
   */
  const res = await safeFetch(buildUrl('/gamification/achievements'), { method: 'GET' });
  if (res.status === 204) {
    return {
      points: 320,
      streak: 3,
      badges: [
        { id: 'streak-3', name: '3-Day Streak', description: 'Completed activities 3 days in a row', earned: true, icon: '🔥' },
        { id: 'first-quiz', name: 'First Quiz', description: 'Completed your first quiz', earned: true, icon: '✅' },
        { id: 'puzzle-10', name: 'Puzzle Apprentice', description: 'Solved 10 puzzles', earned: false, icon: '🧩' },
      ],
    };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch achievements');
  }
  return await res.json();
}
