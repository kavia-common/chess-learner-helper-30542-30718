"use strict";

import { http, HttpResponse, delay } from "msw";

// Helpers
const ok = (data, init = {}) => HttpResponse.json(data, { status: 200, ...init });
const created = (data) => HttpResponse.json(data, { status: 201 });
const noContent = () => new HttpResponse(null, { status: 204 });
const badRequest = (message = "Bad request") =>
  HttpResponse.json({ error: message }, { status: 400 });
const unauthorized = (message = "Unauthorized") =>
  HttpResponse.json({ error: message }, { status: 401 });
const notFound = (message = "Not found") =>
  HttpResponse.json({ error: message }, { status: 404 });
const serverError = (message = "Server error") =>
  HttpResponse.json({ error: message }, { status: 500 });

// In-memory mock state
let mockUser = {
  id: "u_1",
  email: "learner@example.com",
  name: "Chess Learner",
  role: "user",
  points: 1234,
  badges: ["rookie", "tactician"],
  streak: 7,
  settings: { privacy: { profilePublic: true }, notifications: { email: true }, consent: {} },
};

let lessons = [
  { id: "l1", title: "Introduction to Pieces", difficulty: "Beginner", progress: 100 },
  { id: "l2", title: "Basic Checkmates", difficulty: "Beginner", progress: 40 },
  { id: "l3", title: "Forks and Pins", difficulty: "Intermediate", progress: 0 },
];

const lessonsContent = {
  l1: { id: "l1", title: "Introduction to Pieces", content: "King, Queen, Rooks, Bishops, Knights, Pawns..." },
  l2: { id: "l2", title: "Basic Checkmates", content: "Back rank, smothered mate, ladder mate..." },
  l3: { id: "l3", title: "Forks and Pins", content: "Tactics overview..." },
};

const lessonQuizzes = {
  l1: { id: "l1", questions: [{ id: "q1", prompt: "How many squares does a knight control?", choices: ["2","4","8"], answer: 2 }] },
  l2: { id: "l2", questions: [{ id: "q1", prompt: "What is a back rank mate?", choices: ["A","B","C"], answer: 1 }] },
  l3: { id: "l3", questions: [{ id: "q1", prompt: "What is a pin?", choices: ["A","B","C"], answer: 0 }] },
};

let games = [
  { id: "g1", type: "ai", opponent: "AI (Easy)", status: "finished", result: "win", startedAt: Date.now()-86400000 },
  { id: "g2", type: "ai", opponent: "AI (Medium)", status: "in_progress", result: "unknown", startedAt: Date.now()-3600000 },
];

let history = [
  { id: "h1", opponent: "Player123", date: new Date().toISOString(), result: "win", moves: ["e4","e5","Nf3"] },
  { id: "h2", opponent: "AI (Medium)", date: new Date(Date.now()-86400000).toISOString(), result: "loss", moves: ["d4","d5","c4"] },
];

const analysisByGame = {
  h1: { accuracy: 82, blunders: 1, mistakes: 2, bestMoves: 10 },
  h2: { accuracy: 65, blunders: 3, mistakes: 4, bestMoves: 6 },
};

let leaderboards = {
  weekly: [{ user: "Alice", points: 320 }, { user: "Bob", points: 300 }, { user: "You", points: 280 }],
  monthly: [{ user: "Carol", points: 800 }, { user: "You", points: 700 }],
  all: [{ user: "Grandmaster", points: 5000 }, { user: "You", points: 1234 }],
};

let achievements = {
  badges: [
    { id: "rookie", label: "Rookie", earnedAt: "2025-01-10" },
    { id: "tactician", label: "Tactician", earnedAt: "2025-02-01" },
  ],
  points: mockUser.points,
  streak: mockUser.streak,
};

let dailyChallenge = { id: "dc1", title: "Mate in 2", description: "Find the winning sequence.", completed: false };

let puzzles = [
  { id: "p1", difficulty: "easy", fen: "8/8/8/8/8/8/8/8 w - - 0 1", target: "mate-in-1" },
  { id: "p2", difficulty: "medium", fen: "8/8/8/8/8/8/8/8 w - - 0 1", target: "win-material" },
];

let adminContent = [
  { id: "c1", type: "lesson", title: "Openings 101", status: "published" },
  { id: "c2", type: "lesson", title: "Endgame Basics", status: "draft" },
];

let moderationQueue = [
  { id: "m1", type: "comment", status: "pending", text: "Great lesson!" },
  { id: "m2", type: "report", status: "pending", text: "Suspicious activity" },
];

let adminUsers = [
  { id: "u_1", email: "learner@example.com", role: "user" },
  { id: "u_2", email: "admin@example.com", role: "admin" },
];

// Utility to simulate latency
async function maybeDelay(ms = 200) {
  await delay(ms);
}

export const handlers = [
  // Auth
  http.post("/auth/login", async ({ request }) => {
    await maybeDelay();
    try {
      const body = await request.json();
      if (!body?.email || !body?.password) return badRequest("Email and password are required");
      if (String(body.email).includes("@") && String(body.password).length >= 4) {
        return ok({ user: mockUser, token: "mock-token" });
      }
      return unauthorized("Invalid credentials");
    } catch {
      return badRequest("Invalid JSON");
    }
  }),
  http.post("/auth/register", async ({ request }) => {
    await maybeDelay();
    try {
      const data = await request.json();
      if (!data?.email) return badRequest("Email required");
      mockUser = { ...mockUser, email: data.email, name: data.name || mockUser.name };
      return created({ user: mockUser });
    } catch {
      return badRequest("Invalid JSON");
    }
  }),
  http.post("/auth/logout", async () => {
    await maybeDelay();
    return noContent();
  }),
  http.get("/auth/me", async () => {
    await maybeDelay();
    return ok(mockUser);
  }),
  http.post("/auth/refresh", async () => {
    await maybeDelay();
    return noContent();
  }),
  http.post("/auth/forgot-password", async ({ request }) => {
    await maybeDelay();
    const { email } = await request.json().catch(() => ({}));
    if (!email) return badRequest("Email required");
    return ok({ success: true });
  }),
  http.post("/auth/reset-password", async ({ request }) => {
    await maybeDelay();
    const { token, newPassword } = await request.json().catch(() => ({}));
    if (!token || !newPassword) return badRequest("Token and newPassword required");
    return ok({ success: true });
  }),
  http.post("/auth/verify-email", async ({ request }) => {
    await maybeDelay();
    const { token } = await request.json().catch(() => ({}));
    if (!token) return badRequest("Token required");
    return ok({ success: true });
  }),
  http.post("/auth/link-accounts", async ({ request }) => {
    await maybeDelay();
    const { provider } = await request.json().catch(() => ({}));
    if (!provider) return badRequest("Provider required");
    return ok({ linked: true, provider });
  }),

  // Users
  http.get("/users/:id", async ({ params }) => {
    await maybeDelay();
    const { id } = params;
    if (id !== mockUser.id) return notFound("User not found");
    return ok(mockUser);
  }),
  http.patch("/users/:id", async ({ params, request }) => {
    await maybeDelay();
    const { id } = params;
    if (id !== mockUser.id) return notFound("User not found");
    const payload = await request.json().catch(() => ({}));
    mockUser = { ...mockUser, ...payload };
    return ok(mockUser);
  }),
  http.post("/users/:id/avatar", async ({ params }) => {
    await maybeDelay();
    const { id } = params;
    if (id !== mockUser.id) return notFound("User not found");
    return ok({ success: true, url: "https://example.com/avatar.png" });
  }),

  // Lessons and Progress
  http.get("/lessons", async () => {
    await maybeDelay();
    return ok({ items: lessons, total: lessons.length });
  }),
  http.get("/lessons/:id", async ({ params }) => {
    await maybeDelay();
    const item = lessonsContent[params.id];
    return item ? ok(item) : notFound("Lesson not found");
  }),
  http.get("/lessons/:id/quiz", async ({ params }) => {
    await maybeDelay();
    const quiz = lessonQuizzes[params.id];
    return quiz ? ok(quiz) : notFound("Quiz not found");
  }),
  http.post("/lessons/:id/quiz", async ({ params, request }) => {
    await maybeDelay();
    const { answers } = await request.json().catch(() => ({}));
    if (!Array.isArray(answers)) return badRequest("answers array required");
    // naive scoring
    const quiz = lessonQuizzes[params.id];
    if (!quiz) return notFound("Quiz not found");
    const correct = 1;
    return ok({ correct, total: quiz.questions.length, passed: true, feedback: "Great job!" });
  }),
  http.get("/progress", async () => {
    await maybeDelay();
    const completed = lessons.filter((l) => (l.progress || 0) >= 100).length;
    return ok({
      completedLessons: completed,
      totalLessons: lessons.length,
      recommendations: lessons.filter((l) => (l.progress || 0) < 100).slice(0, 2),
    });
  }),

  // Games and History
  http.get("/games", async () => {
    await maybeDelay();
    return ok({ items: games });
  }),
  http.post("/games/ai", async ({ request }) => {
    await maybeDelay();
    const { level = "easy" } = await request.json().catch(() => ({}));
    const game = {
      id: `g_${Date.now()}`,
      type: "ai",
      opponent: `AI (${String(level).toUpperCase()})`,
      status: "in_progress",
      result: "unknown",
      startedAt: Date.now(),
    };
    games = [game, ...games];
    return created(game);
  }),
  http.post("/games/matchmaking", async () => {
    await maybeDelay(500);
    return ok({ ticketId: "mm_1", estimatedWaitSec: 5 });
  }),
  http.get("/games/matchmaking/:ticketId", async ({ params }) => {
    await maybeDelay(500);
    const { ticketId } = params;
    const found = { matchFound: true, gameId: "g_match_1", ticketId };
    return ok(found);
  }),
  http.delete("/games/matchmaking/:ticketId", async () => {
    await maybeDelay();
    return noContent();
  }),
  http.get("/games/:id", async ({ params }) => {
    await maybeDelay();
    const game = games.find((g) => g.id === params.id);
    return game ? ok(game) : notFound("Game not found");
  }),
  http.get("/history", async ({ request }) => {
    await maybeDelay();
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 10);
    const result = url.searchParams.get("result") || "all";
    let items = [...history];
    if (result !== "all") {
      items = items.filter((h) => h.result === result);
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return ok({ items: paged, total, page, pageSize });
  }),
  http.get("/history/:gameId", async ({ params }) => {
    await maybeDelay();
    const item = history.find((h) => h.id === params.gameId);
    return item ? ok(item) : notFound("History item not found");
  }),
  http.get("/history/:gameId/analysis", async ({ params }) => {
    await maybeDelay();
    const a = analysisByGame[params.gameId] || { accuracy: 70, blunders: 2, mistakes: 3, bestMoves: 8 };
    return ok(a);
  }),
  http.get("/games/:gameId/hint", async ({ params, request }) => {
    await maybeDelay();
    const url = new URL(request.url);
    const plyIndex = Number(url.searchParams.get("plyIndex") || 0);
    return ok({ move: "e4", rationale: `Try central control at ply ${plyIndex}.` });
  }),

  // Gamification
  http.get("/gamification/achievements", async () => {
    await maybeDelay();
    return ok(achievements);
  }),
  http.get("/gamification/leaderboards", async ({ request }) => {
    await maybeDelay();
    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "weekly";
    return ok({ period, entries: leaderboards[period] || leaderboards.weekly });
  }),
  http.get("/gamification/daily-challenge", async () => {
    await maybeDelay();
    return ok(dailyChallenge);
  }),
  http.post("/gamification/daily-challenge", async () => {
    await maybeDelay();
    dailyChallenge = { ...dailyChallenge, completed: true };
    return ok({ success: true, pointsAwarded: 25 });
  }),
  http.get("/gamification/puzzles", async ({ request }) => {
    await maybeDelay();
    const url = new URL(request.url);
    const difficulty = url.searchParams.get("difficulty");
    const items = difficulty ? puzzles.filter((p) => p.difficulty === difficulty) : puzzles;
    return ok({ items, total: items.length });
  }),
  http.post("/gamification/puzzles/:id/submit", async ({ params, request }) => {
    await maybeDelay();
    const { solution } = await request.json().catch(() => ({}));
    if (!solution) return badRequest("solution required");
    const correct = true;
    return ok({ correct, message: correct ? "Correct!" : "Try again." });
  }),

  // Admin
  http.get("/admin/dashboard", async () => {
    await maybeDelay();
    return ok({ activeUsers: 120, lessonCompletions: 450, newRegistrations: 15 });
  }),
  http.get("/admin/analytics", async () => {
    await maybeDelay();
    return ok({ dau: 120, wau: 600, mau: 2400, avgSessionMin: 12 });
  }),
  http.get("/admin/audit-log", async () => {
    await maybeDelay();
    return ok({ items: [{ id: "a1", action: "content.update", by: "admin@example.com", at: new Date().toISOString() }] });
  }),
  http.get("/admin/content", async () => {
    await maybeDelay();
    return ok({ items: adminContent });
  }),
  http.get("/admin/moderation", async () => {
    await maybeDelay();
    return ok({ items: moderationQueue });
  }),
  http.get("/admin/users", async () => {
    await maybeDelay();
    return ok({ items: adminUsers });
  }),

  // Default catch-all for unhandled to help debug
  http.all("*", async () => serverError("Unhandled mock endpoint")),
];
