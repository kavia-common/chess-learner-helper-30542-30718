const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * adminApi
 * Stubbed client providing graceful behavior without a backend.
 * Methods resolve with example data after a small delay and never throw.
 */
const adminApi = {
  // PUBLIC_INTERFACE
  async listContent() {
    /** Returns a list of sample content items. */
    await delay(200);
    return [
      { id: 'c1', title: 'Introduction to Chess', status: 'published' },
      { id: 'c2', title: 'Tactics: Forks and Pins', status: 'draft' },
      { id: 'c3', title: 'Endgames Basics', status: 'published' },
    ];
  },

  // PUBLIC_INTERFACE
  async listUsers() {
    /** Returns a list of sample users with roles. */
    await delay(200);
    return [
      { id: 'u1', email: 'admin@example.com', role: 'admin' },
      { id: 'u2', email: 'mod@example.com', role: 'moderator' },
      { id: 'u3', email: 'user@example.com', role: 'learner' },
    ];
  },

  // PUBLIC_INTERFACE
  async setUserRole(userId, role) {
    /** Stub to set a user's role; resolves after delay. */
    console.log('setUserRole (stub):', userId, role);
    await delay(150);
    return { ok: true };
  },

  // PUBLIC_INTERFACE
  async getModerationQueue() {
    /** Returns sample moderation items. */
    await delay(180);
    return [
      { id: 'm1', type: 'comment', summary: 'Flagged comment about lesson 1' },
      { id: 'm2', type: 'post', summary: 'User submission requires review' },
    ];
  },

  // PUBLIC_INTERFACE
  async moderateItem(itemId, action) {
    /** Approve or reject an item; resolves after delay. */
    console.log('moderateItem (stub):', itemId, action);
    await delay(120);
    return { ok: true };
  },

  // PUBLIC_INTERFACE
  async getAnalytics() {
    /** Returns example analytics metrics. */
    await delay(220);
    return {
      activeUsers: 1280,
      lessonCompletions: 4567,
      engagementScore: 78,
    };
  },

  // PUBLIC_INTERFACE
  async getAuditLogs({ q } = {}) {
    /** Returns sample audit logs filtered by keyword q. */
    await delay(200);
    const all = [
      { id: 'a1', ts: Date.now() - 3600_000, actor: 'admin@example.com', action: 'published', target: 'Lesson c2' },
      { id: 'a2', ts: Date.now() - 7200_000, actor: 'mod@example.com', action: 'approved', target: 'Comment m1' },
      { id: 'a3', ts: Date.now() - 9600_000, actor: 'admin@example.com', action: 'updated', target: 'User u3 role' },
    ];
    if (!q) return all;
    const ql = String(q).toLowerCase();
    return all.filter((l) =>
      [l.actor, l.action, l.target].some((f) => String(f).toLowerCase().includes(ql))
    );
  },
};

export default adminApi;
